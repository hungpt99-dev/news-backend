import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ArticleStatus, ArticleType } from '../../entities/article.entity';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(100)
  content: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsString()
  @IsOptional()
  featuredImageAlt?: string;

  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus = ArticleStatus.DRAFT;

  @IsEnum(ArticleType)
  @IsOptional()
  type?: ArticleType = ArticleType.ARTICLE;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  @IsOptional()
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}
