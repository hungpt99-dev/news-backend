import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @IsUUID()
  @IsNotEmpty()
  articleId: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
