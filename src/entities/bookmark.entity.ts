import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Article } from './article.entity';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  note: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.bookmarks, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => Article, (article) => article.bookmarks, { onDelete: 'CASCADE' })
  article: Article;

  @Column()
  @Index()
  articleId: string;

  // Unique constraint on user and article combination
  @Index(['userId', 'articleId'], { unique: true })
  userArticleIndex: string;
}
