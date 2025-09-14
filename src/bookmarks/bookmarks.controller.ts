import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  async create(
    @Body() createBookmarkDto: CreateBookmarkDto,
    @CurrentUser() user: User,
  ) {
    return this.bookmarksService.create(createBookmarkDto, user.id);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.bookmarksService.findAll(user.id);
  }

  @Get('check/:articleId')
  async isBookmarked(
    @Param('articleId') articleId: string,
    @CurrentUser() user: User,
  ) {
    const isBookmarked = await this.bookmarksService.isBookmarked(user.id, articleId);
    return { isBookmarked };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookmarksService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
    @CurrentUser() user: User,
  ) {
    return this.bookmarksService.update(id, updateBookmarkDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.bookmarksService.remove(id, user.id);
  }

  @Delete('article/:articleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeByArticle(
    @Param('articleId') articleId: string,
    @CurrentUser() user: User,
  ) {
    await this.bookmarksService.removeByArticle(articleId, user.id);
  }
}
