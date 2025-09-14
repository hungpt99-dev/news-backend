import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const { name, ...tagData } = createTagDto;

    // Check if tag with same name already exists
    const existingTag = await this.tagRepository.findOne({
      where: { name },
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    // Generate slug from name
    const slug = this.generateSlug(name);

    const tag = this.tagRepository.create({
      ...tagData,
      name,
      slug,
    });

    return this.tagRepository.save(tag);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { isActive: true },
      order: { articlesCount: 'DESC', name: 'ASC' },
    });
  }

  async findPopular(limit: number = 20): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { isActive: true },
      order: { articlesCount: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['articles'],
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { slug },
      relations: ['articles'],
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async search(query: string): Promise<Tag[]> {
    return this.tagRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
      ],
      order: { articlesCount: 'DESC' },
      take: 10,
    });
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    const { name, ...tagData } = updateTagDto;

    // Check for name conflicts if name is being updated
    if (name && name !== tag.name) {
      const existingTag = await this.tagRepository.findOne({
        where: { name },
      });

      if (existingTag) {
        throw new ConflictException('Tag with this name already exists');
      }
    }

    const updateData = {
      ...tagData,
      ...(name && { name, slug: this.generateSlug(name) }),
    };

    await this.tagRepository.update(id, updateData);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findOne(id);

    // Check if tag has articles
    if (tag.articles && tag.articles.length > 0) {
      throw new ConflictException('Cannot delete tag with articles');
    }

    await this.tagRepository.delete(id);
  }

  async incrementArticlesCount(id: string): Promise<void> {
    await this.tagRepository.increment({ id }, 'articlesCount', 1);
  }

  async decrementArticlesCount(id: string): Promise<void> {
    await this.tagRepository.decrement({ id }, 'articlesCount', 1);
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
