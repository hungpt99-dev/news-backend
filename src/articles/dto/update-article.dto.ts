import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
