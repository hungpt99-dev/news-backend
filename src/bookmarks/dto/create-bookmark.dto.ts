import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBookmarkDto {
  @IsUUID()
  articleId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
