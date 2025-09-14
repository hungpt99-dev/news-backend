import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Bookmark } from '../../entities/bookmark.entity';
import { BookmarksService } from '../../bookmarks/bookmarks.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { CreateBookmarkDto } from '../../bookmarks/dto/create-bookmark.dto';
import { UpdateBookmarkDto } from '../../bookmarks/dto/update-bookmark.dto';

@Resolver(() => Bookmark)
export class BookmarkResolver {
  constructor(private bookmarksService: BookmarksService) {}

  @Query(() => [Bookmark])
  @UseGuards(JwtAuthGuard)
  async myBookmarks(@CurrentUser() user: User) {
    return this.bookmarksService.findAll(user.id);
  }

  @Query(() => Bookmark)
  @UseGuards(JwtAuthGuard)
  async bookmark(@Args('id') id: string) {
    return this.bookmarksService.findOne(id);
  }

  @Query(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async isBookmarked(
    @Args('articleId') articleId: string,
    @CurrentUser() user: User,
  ) {
    return this.bookmarksService.isBookmarked(user.id, articleId);
  }

  @Mutation(() => Bookmark)
  @UseGuards(JwtAuthGuard)
  async createBookmark(
    @Args('input') input: CreateBookmarkDto,
    @CurrentUser() user: User,
  ) {
    return this.bookmarksService.create(input, user.id);
  }

  @Mutation(() => Bookmark)
  @UseGuards(JwtAuthGuard)
  async updateBookmark(
    @Args('id') id: string,
    @Args('input') input: UpdateBookmarkDto,
    @CurrentUser() user: User,
  ) {
    return this.bookmarksService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteBookmark(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.bookmarksService.remove(id, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeBookmarkByArticle(
    @Args('articleId') articleId: string,
    @CurrentUser() user: User,
  ) {
    await this.bookmarksService.removeByArticle(articleId, user.id);
    return true;
  }
}
