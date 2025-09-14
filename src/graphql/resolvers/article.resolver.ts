import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Article } from '../../entities/article.entity';
import { ArticlesService } from '../../articles/articles.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { CreateArticleDto } from '../../articles/dto/create-article.dto';
import { UpdateArticleDto } from '../../articles/dto/update-article.dto';
import { ArticleQueryDto } from '../../articles/dto/article-query.dto';

@Resolver(() => Article)
export class ArticleResolver {
  constructor(private articlesService: ArticlesService) {}

  @Query(() => [Article])
  async articles(@Args('input', { nullable: true }) input?: ArticleQueryDto) {
    const query = input || { page: 1, limit: 10 };
    const result = await this.articlesService.findAll(query);
    return result.data;
  }

  @Query(() => Article)
  async article(@Args('id') id: string) {
    const article = await this.articlesService.findOne(id);
    await this.articlesService.incrementViews(id);
    return article;
  }

  @Query(() => Article)
  async articleBySlug(@Args('slug') slug: string) {
    const article = await this.articlesService.findBySlug(slug);
    await this.articlesService.incrementViews(article.id);
    return article;
  }

  @Query(() => [Article])
  async featuredArticles(@Args('limit', { defaultValue: 10 }) limit: number) {
    const result = await this.articlesService.findAll({
      page: 1,
      limit,
      isFeatured: true,
      status: 'published' as any,
    });
    return result.data;
  }

  @Query(() => [Article])
  async trendingArticles(@Args('limit', { defaultValue: 10 }) limit: number) {
    const result = await this.articlesService.findAll({
      page: 1,
      limit,
      sortBy: 'viewsCount',
      sortOrder: 'DESC',
      status: 'published' as any,
    });
    return result.data;
  }

  @Query(() => [Article])
  async latestArticles(@Args('limit', { defaultValue: 10 }) limit: number) {
    const result = await this.articlesService.findAll({
      page: 1,
      limit,
      sortBy: 'publishedAt',
      sortOrder: 'DESC',
      status: 'published' as any,
    });
    return result.data;
  }

  @Mutation(() => Article)
  @UseGuards(JwtAuthGuard)
  async createArticle(
    @Args('input') input: CreateArticleDto,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.create(input, user.id);
  }

  @Mutation(() => Article)
  @UseGuards(JwtAuthGuard)
  async updateArticle(
    @Args('id') id: string,
    @Args('input') input: UpdateArticleDto,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.update(id, input, user.id, user.role);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteArticle(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.articlesService.remove(id, user.id, user.role);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async likeArticle(@Args('id') id: string) {
    await this.articlesService.incrementLikes(id);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async unlikeArticle(@Args('id') id: string) {
    await this.articlesService.decrementLikes(id);
    return true;
  }

  @Mutation(() => Boolean)
  async shareArticle(@Args('id') id: string) {
    await this.articlesService.incrementShares(id);
    return true;
  }
}
