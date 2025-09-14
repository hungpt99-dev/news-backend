import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Comment } from '../../entities/comment.entity';
import { CommentsService } from '../../comments/comments.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User, UserRole } from '../../entities/user.entity';
import { CreateCommentDto } from '../../comments/dto/create-comment.dto';
import { UpdateCommentDto } from '../../comments/dto/update-comment.dto';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(private commentsService: CommentsService) {}

  @Query(() => [Comment])
  async comments(@Args('articleId', { nullable: true }) articleId?: string) {
    return this.commentsService.findAll(articleId);
  }

  @Query(() => [Comment])
  async articleComments(@Args('articleId') articleId: string) {
    return this.commentsService.findByArticle(articleId);
  }

  @Query(() => Comment)
  async comment(@Args('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Args('input') input: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.create(input, user.id);
  }

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Args('id') id: string,
    @Args('input') input: UpdateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.update(id, input, user.id, user.role);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.commentsService.remove(id, user.id, user.role);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async hideComment(@Args('id') id: string, @CurrentUser() user: User) {
    await this.commentsService.hide(id, user.role);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async showComment(@Args('id') id: string, @CurrentUser() user: User) {
    await this.commentsService.show(id, user.role);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async likeComment(@Args('id') id: string) {
    await this.commentsService.incrementLikes(id);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async unlikeComment(@Args('id') id: string) {
    await this.commentsService.decrementLikes(id);
    return true;
  }
}
