import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, ...categoryData } = createCategoryDto;

    // Check if category with same name already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    // Generate slug from name
    const slug = this.generateSlug(name);

    const category = this.categoryRepository.create({
      ...categoryData,
      name,
      slug,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['articles'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['articles'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    const { name, ...categoryData } = updateCategoryDto;

    // Check for name conflicts if name is being updated
    if (name && name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    const updateData = {
      ...categoryData,
      ...(name && { name, slug: this.generateSlug(name) }),
    };

    await this.categoryRepository.update(id, updateData);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Check if category has articles
    if (category.articles && category.articles.length > 0) {
      throw new ConflictException('Cannot delete category with articles');
    }

    await this.categoryRepository.delete(id);
  }

  async incrementArticlesCount(id: string): Promise<void> {
    await this.categoryRepository.increment({ id }, 'articlesCount', 1);
  }

  async decrementArticlesCount(id: string): Promise<void> {
    await this.categoryRepository.decrement({ id }, 'articlesCount', 1);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
}
