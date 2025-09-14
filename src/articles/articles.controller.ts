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
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../entities/user.entity';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.create(createArticleDto, user.id);
  }

  @Get()
  async findAll(@Query() query: ArticleQueryDto) {
    return this.articlesService.findAll(query);
  }

  @Get('featured')
  async findFeatured(@Query() query: ArticleQueryDto) {
    return this.articlesService.findAll({
      ...query,
      isFeatured: true,
      status: 'published' as any,
    });
  }

  @Get('trending')
  async findTrending(@Query() query: ArticleQueryDto) {
    return this.articlesService.findAll({
      ...query,
      sortBy: 'viewsCount',
      sortOrder: 'DESC',
      status: 'published' as any,
    });
  }

  @Get('latest')
  async findLatest(@Query() query: ArticleQueryDto) {
    return this.articlesService.findAll({
      ...query,
      sortBy: 'publishedAt',
      sortOrder: 'DESC',
      status: 'published' as any,
    });
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const article = await this.articlesService.findBySlug(slug);
    // Increment view count
    await this.articlesService.incrementViews(article.id);
    return article;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const article = await this.articlesService.findOne(id);
    // Increment view count
    await this.articlesService.incrementViews(article.id);
    return article;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.update(id, updateArticleDto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.articlesService.remove(id, user.id, user.role);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async like(@Param('id') id: string) {
    await this.articlesService.incrementLikes(id);
  }

  @Post(':id/unlike')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlike(@Param('id') id: string) {
    await this.articlesService.decrementLikes(id);
  }

  @Post(':id/share')
  @HttpCode(HttpStatus.NO_CONTENT)
  async share(@Param('id') id: string) {
    await this.articlesService.incrementShares(id);
  }
}
