import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Bookmark } from '../entities/bookmark.entity';
import { User } from '../entities/user.entity';
import { Article } from '../entities/article.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  async create(createBookmarkDto: CreateBookmarkDto, userId: string): Promise<Bookmark> {
    const { articleId, ...bookmarkData } = createBookmarkDto;

    // Check if bookmark already exists
    const existingBookmark = await this.bookmarkRepository.findOne({
      where: { userId, articleId },
    });

    if (existingBookmark) {
      throw new ConflictException('Article already bookmarked');
    }

    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify article exists
    const article = await this.articleRepository.findOne({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const bookmark = this.bookmarkRepository.create({
      ...bookmarkData,
      userId,
      articleId,
    });

    const savedBookmark = await this.bookmarkRepository.save(bookmark);

    // Update article's bookmark count
    await this.articleRepository.increment({ id: articleId }, 'bookmarksCount', 1);

    // Update user's bookmark count
    await this.userRepository.increment({ id: userId }, 'bookmarksCount', 1);

    return this.findOne(savedBookmark.id);
  }

  async findAll(userId: string): Promise<Bookmark[]> {
    return this.bookmarkRepository.find({
      where: { userId },
      relations: ['article', 'article.author', 'article.category', 'article.tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Bookmark> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { id },
      relations: ['user', 'article', 'article.author', 'article.category', 'article.tags'],
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    return bookmark;
  }

  async findByUserAndArticle(userId: string, articleId: string): Promise<Bookmark | null> {
    return this.bookmarkRepository.findOne({
      where: { userId, articleId },
      relations: ['user', 'article'],
    });
  }

  async update(
    id: string,
    updateBookmarkDto: UpdateBookmarkDto,
    userId: string,
  ): Promise<Bookmark> {
    const bookmark = await this.findOne(id);

    // Check if user can update this bookmark
    if (bookmark.userId !== userId) {
      throw new ForbiddenException('You can only update your own bookmarks');
    }

    await this.bookmarkRepository.update(id, updateBookmarkDto);

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const bookmark = await this.findOne(id);

    // Check if user can delete this bookmark
    if (bookmark.userId !== userId) {
      throw new ForbiddenException('You can only delete your own bookmarks');
    }

    // Update counters
    await this.articleRepository.decrement({ id: bookmark.articleId }, 'bookmarksCount', 1);
    await this.userRepository.decrement({ id: bookmark.userId }, 'bookmarksCount', 1);

    await this.bookmarkRepository.delete(id);
  }

  async removeByArticle(articleId: string, userId: string): Promise<void> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { userId, articleId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.remove(bookmark.id, userId);
  }

  async isBookmarked(userId: string, articleId: string): Promise<boolean> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { userId, articleId },
    });

    return !!bookmark;
  }
}
