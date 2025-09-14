import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Tag } from '../../entities/tag.entity';
import { TagsService } from '../../tags/tags.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { CreateTagDto } from '../../tags/dto/create-tag.dto';
import { UpdateTagDto } from '../../tags/dto/update-tag.dto';

@Resolver(() => Tag)
export class TagResolver {
  constructor(private tagsService: TagsService) {}

  @Query(() => [Tag])
  async tags() {
    return this.tagsService.findAll();
  }

  @Query(() => [Tag])
  async popularTags(@Args('limit', { defaultValue: 20 }) limit: number) {
    return this.tagsService.findPopular(limit);
  }

  @Query(() => [Tag])
  async searchTags(@Args('query') query: string) {
    return this.tagsService.search(query);
  }

  @Query(() => Tag)
  async tag(@Args('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Query(() => Tag)
  async tagBySlug(@Args('slug') slug: string) {
    return this.tagsService.findBySlug(slug);
  }

  @Mutation(() => Tag)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async createTag(@Args('input') input: CreateTagDto) {
    return this.tagsService.create(input);
  }

  @Mutation(() => Tag)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async updateTag(
    @Args('id') id: string,
    @Args('input') input: UpdateTagDto,
  ) {
    return this.tagsService.update(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteTag(@Args('id') id: string) {
    await this.tagsService.remove(id);
    return true;
  }
}
