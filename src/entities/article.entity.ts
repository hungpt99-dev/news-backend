import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { Comment } from './comment.entity';
import { Bookmark } from './bookmark.entity';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ArticleType {
  ARTICLE = 'article',
  NEWS = 'news',
  TUTORIAL = 'tutorial',
  REVIEW = 'review',
  OPINION = 'opinion',
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  htmlContent: string;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({ nullable: true })
  featuredImageAlt: string;

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  @Index()
  status: ArticleStatus;

  @Column({
    type: 'enum',
    enum: ArticleType,
    default: ArticleType.ARTICLE,
  })
  @Index()
  type: ArticleType;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  commentsCount: number;

  @Column({ default: 0 })
  bookmarksCount: number;

  @Column({ default: 0 })
  sharesCount: number;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  readingTime: number; // in minutes

  @Column({ type: 'jsonb', nullable: true })
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.articles, { onDelete: 'CASCADE' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => Category, (category) => category.articles, { nullable: true })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToMany(() => Tag, (tag) => tag.articles)
  @JoinTable({
    name: 'article_tags',
    joinColumn: { name: 'articleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.article)
  bookmarks: Bookmark[];

  // Virtual fields
  get isPublished(): boolean {
    return this.status === ArticleStatus.PUBLISHED;
  }

  get url(): string {
    return `/articles/${this.slug}`;
  }
}
