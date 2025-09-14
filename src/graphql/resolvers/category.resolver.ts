import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Category } from '../../entities/category.entity';
import { CategoriesService } from '../../categories/categories.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { CreateCategoryDto } from '../../categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../../categories/dto/update-category.dto';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private categoriesService: CategoriesService) {}

  @Query(() => [Category])
  async categories() {
    return this.categoriesService.findAll();
  }

  @Query(() => Category)
  async category(@Args('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Query(() => Category)
  async categoryBySlug(@Args('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Mutation(() => Category)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async createCategory(@Args('input') input: CreateCategoryDto) {
    return this.categoriesService.create(input);
  }

  @Mutation(() => Category)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async updateCategory(
    @Args('id') id: string,
    @Args('input') input: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteCategory(@Args('id') id: string) {
    await this.categoriesService.remove(id);
    return true;
  }
}
