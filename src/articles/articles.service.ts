import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, In } from 'typeorm';
import { Article, ArticleStatus } from '../entities/article.entity';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(createArticleDto: CreateArticleDto, authorId: string): Promise<Article> {
    const { categoryId, tagIds, ...articleData } = createArticleDto;

    // Verify author exists
    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    // Verify category exists if provided
    let category = null;
    if (categoryId) {
      category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Verify tags exist if provided
    let tags = [];
    if (tagIds && tagIds.length > 0) {
      tags = await this.tagRepository.findBy({ id: In(tagIds) });
      if (tags.length !== tagIds.length) {
        throw new BadRequestException('One or more tags not found');
      }
    }

    // Generate slug
    const slug = this.generateSlug(articleData.title);

    // Check if slug already exists
    const existingArticle = await this.articleRepository.findOne({ where: { slug } });
    if (existingArticle) {
      throw new BadRequestException('An article with this title already exists');
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = articleData.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const article = this.articleRepository.create({
      ...articleData,
      slug,
      authorId,
      categoryId,
      tags,
      readingTime,
      publishedAt: articleData.status === ArticleStatus.PUBLISHED ? new Date() : null,
    });

    const savedArticle = await this.articleRepository.save(article);

    // Update author's article count
    await this.userRepository.increment({ id: authorId }, 'articlesCount', 1);

    // Update category's article count if provided
    if (categoryId) {
      await this.categoryRepository.increment({ id: categoryId }, 'articlesCount', 1);
    }

    // Update tags' article count
    if (tags.length > 0) {
      await this.tagRepository.increment(
        { id: In(tagIds) },
        'articlesCount',
        1,
      );
    }

    return this.findOne(savedArticle.id);
  }

  async findAll(query: ArticleQueryDto): Promise<PaginatedResponse<Article>> {
    const {
      search,
      status,
      type,
      authorId,
      categoryId,
      tagId,
      isFeatured,
      isPinned,
      sortBy,
      sortOrder,
      ...pagination
    } = query;

    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.comments', 'comments')
      .leftJoinAndSelect('article.bookmarks', 'bookmarks');

    if (search) {
      queryBuilder.andWhere(
        '(article.title ILIKE :search OR article.excerpt ILIKE :search OR article.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('article.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('article.type = :type', { type });
    }

    if (authorId) {
      queryBuilder.andWhere('article.authorId = :authorId', { authorId });
    }

    if (categoryId) {
      queryBuilder.andWhere('article.categoryId = :categoryId', { categoryId });
    }

    if (tagId) {
      queryBuilder.andWhere('tags.id = :tagId', { tagId });
    }

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('article.isFeatured = :isFeatured', { isFeatured });
    }

    if (isPinned !== undefined) {
      queryBuilder.andWhere('article.isPinned = :isPinned', { isPinned });
    }

    queryBuilder
      .orderBy(`article.${sortBy}`, sortOrder)
      .skip(pagination.skip)
      .take(pagination.take);

    const [articles, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResponse(articles, total, pagination);
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'tags', 'comments', 'bookmarks'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: ['author', 'category', 'tags', 'comments', 'bookmarks'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
    userId: string,
    userRole: string,
  ): Promise<Article> {
    const article = await this.findOne(id);

    // Check if user can update this article
    if (article.authorId !== userId && !['admin', 'moderator'].includes(userRole)) {
      throw new ForbiddenException('You can only update your own articles');
    }

    const { categoryId, tagIds, ...articleData } = updateArticleDto;

    // Verify category exists if provided
    let category = null;
    if (categoryId) {
      category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Verify tags exist if provided
    let tags = [];
    if (tagIds && tagIds.length > 0) {
      tags = await this.tagRepository.findBy({ id: In(tagIds) });
      if (tags.length !== tagIds.length) {
        throw new BadRequestException('One or more tags not found');
      }
    }

    // Update article
    await this.articleRepository.update(id, {
      ...articleData,
      categoryId,
      tags,
      publishedAt: articleData.status === ArticleStatus.PUBLISHED && !article.publishedAt
        ? new Date()
        : article.publishedAt,
    });

    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const article = await this.findOne(id);

    // Check if user can delete this article
    if (article.authorId !== userId && !['admin', 'moderator'].includes(userRole)) {
      throw new ForbiddenException('You can only delete your own articles');
    }

    // Update counters
    await this.userRepository.decrement({ id: article.authorId }, 'articlesCount', 1);

    if (article.categoryId) {
      await this.categoryRepository.decrement({ id: article.categoryId }, 'articlesCount', 1);
    }

    if (article.tags && article.tags.length > 0) {
      const tagIds = article.tags.map(tag => tag.id);
      await this.tagRepository.decrement(
        { id: In(tagIds) },
        'articlesCount',
        1,
      );
    }

    await this.articleRepository.delete(id);
  }

  async incrementViews(id: string): Promise<void> {
    await this.articleRepository.increment({ id }, 'viewsCount', 1);
  }

  async incrementLikes(id: string): Promise<void> {
    await this.articleRepository.increment({ id }, 'likesCount', 1);
  }

  async decrementLikes(id: string): Promise<void> {
    await this.articleRepository.decrement({ id }, 'likesCount', 1);
  }

  async incrementComments(id: string): Promise<void> {
    await this.articleRepository.increment({ id }, 'commentsCount', 1);
  }

  async decrementComments(id: string): Promise<void> {
    await this.articleRepository.decrement({ id }, 'commentsCount', 1);
  }

  async incrementBookmarks(id: string): Promise<void> {
    await this.articleRepository.increment({ id }, 'bookmarksCount', 1);
  }

  async decrementBookmarks(id: string): Promise<void> {
    await this.articleRepository.decrement({ id }, 'bookmarksCount', 1);
  }

  async incrementShares(id: string): Promise<void> {
    await this.articleRepository.increment({ id }, 'sharesCount', 1);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
      + '-' + uuidv4().substring(0, 8);
  }
}
