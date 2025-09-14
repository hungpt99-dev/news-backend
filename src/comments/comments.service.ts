import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Comment, CommentStatus } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { Article } from '../entities/article.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  async create(createCommentDto: CreateCommentDto, authorId: string): Promise<Comment> {
    const { articleId, parentId, ...commentData } = createCommentDto;

    // Verify author exists
    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    // Verify article exists
    const article = await this.articleRepository.findOne({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Verify parent comment exists if provided
    let parent = null;
    let depth = 0;
    if (parentId) {
      parent = await this.commentRepository.findOne({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
      if (parent.articleId !== articleId) {
        throw new BadRequestException('Parent comment must belong to the same article');
      }
      depth = parent.depth + 1;
    }

    const comment = this.commentRepository.create({
      ...commentData,
      authorId,
      articleId,
      parentId,
      depth,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Update article's comment count
    await this.articleRepository.increment({ id: articleId }, 'commentsCount', 1);

    // Update author's comment count
    await this.userRepository.increment({ id: authorId }, 'commentsCount', 1);

    // Update parent comment's replies count if it's a reply
    if (parentId) {
      await this.commentRepository.increment({ id: parentId }, 'repliesCount', 1);
    }

    return this.findOne(savedComment.id);
  }

  async findAll(articleId?: string): Promise<Comment[]> {
    const findOptions: FindManyOptions<Comment> = {
      where: {
        ...(articleId && { articleId }),
        status: CommentStatus.ACTIVE,
      },
      relations: ['author', 'article', 'parent', 'replies'],
      order: { createdAt: 'ASC' },
    };

    return this.commentRepository.find(findOptions);
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'article', 'parent', 'replies'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async findByArticle(articleId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: {
        articleId,
        status: CommentStatus.ACTIVE,
        parentId: null, // Only top-level comments
      },
      relations: ['author', 'replies', 'replies.author'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
    userRole: string,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    // Check if user can update this comment
    if (comment.authorId !== userId && !['admin', 'moderator'].includes(userRole)) {
      throw new ForbiddenException('You can only update your own comments');
    }

    await this.commentRepository.update(id, updateCommentDto);

    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const comment = await this.findOne(id);

    // Check if user can delete this comment
    if (comment.authorId !== userId && !['admin', 'moderator'].includes(userRole)) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Soft delete by setting status to deleted
    await this.commentRepository.update(id, { status: CommentStatus.DELETED });

    // Update counters
    await this.articleRepository.decrement({ id: comment.articleId }, 'commentsCount', 1);
    await this.userRepository.decrement({ id: comment.authorId }, 'commentsCount', 1);

    // Update parent comment's replies count if it's a reply
    if (comment.parentId) {
      await this.commentRepository.decrement({ id: comment.parentId }, 'repliesCount', 1);
    }
  }

  async hide(id: string, userRole: string): Promise<void> {
    if (!['admin', 'moderator'].includes(userRole)) {
      throw new ForbiddenException('Only admins and moderators can hide comments');
    }

    await this.commentRepository.update(id, { status: CommentStatus.HIDDEN });
  }

  async show(id: string, userRole: string): Promise<void> {
    if (!['admin', 'moderator'].includes(userRole)) {
      throw new ForbiddenException('Only admins and moderators can show comments');
    }

    await this.commentRepository.update(id, { status: CommentStatus.ACTIVE });
  }

  async incrementLikes(id: string): Promise<void> {
    await this.commentRepository.increment({ id }, 'likesCount', 1);
  }

  async decrementLikes(id: string): Promise<void> {
    await this.commentRepository.decrement({ id }, 'likesCount', 1);
  }
}
