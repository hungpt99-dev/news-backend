import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(query: UserQueryDto): Promise<PaginatedResponse<User>> {
    const { search, role, status, emailVerified, sortBy, sortOrder, ...pagination } = query;

    const where: any = {};

    if (search) {
      where.$or = [
        { username: Like(`%${search}%`) },
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (emailVerified !== undefined) {
      where.emailVerified = emailVerified;
    }

    const findOptions: FindManyOptions<User> = {
      where,
      skip: pagination.skip,
      take: pagination.take,
      order: {
        [sortBy]: sortOrder,
      },
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'avatar',
        'bio',
        'website',
        'location',
        'twitterHandle',
        'githubHandle',
        'linkedinHandle',
        'role',
        'status',
        'emailVerified',
        'reputation',
        'followersCount',
        'followingCount',
        'articlesCount',
        'commentsCount',
        'bookmarksCount',
        'createdAt',
        'updatedAt',
      ],
    };

    const [users, total] = await this.userRepository.findAndCount(findOptions);

    return new PaginatedResponse(users, total, pagination);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'avatar',
        'bio',
        'website',
        'location',
        'twitterHandle',
        'githubHandle',
        'linkedinHandle',
        'role',
        'status',
        'emailVerified',
        'reputation',
        'followersCount',
        'followingCount',
        'articlesCount',
        'commentsCount',
        'bookmarksCount',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'avatar',
        'bio',
        'website',
        'location',
        'twitterHandle',
        'githubHandle',
        'linkedinHandle',
        'role',
        'status',
        'emailVerified',
        'reputation',
        'followersCount',
        'followingCount',
        'articlesCount',
        'commentsCount',
        'bookmarksCount',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check for username conflicts
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('Username already taken');
      }
    }

    await this.userRepository.update(id, updateUserDto);

    return this.findOne(id);
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Remove fields that users shouldn't be able to update themselves
    const { role, status, ...allowedFields } = updateUserDto;

    return this.update(userId, allowedFields);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findOne(id);

    // Soft delete by setting status to inactive
    await this.userRepository.update(id, {
      status: UserStatus.INACTIVE,
    });
  }

  async restore(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, {
      status: UserStatus.ACTIVE,
    });

    return this.findOne(id);
  }

  async updateStats(id: string, stats: Partial<User>): Promise<void> {
    await this.userRepository.update(id, stats);
  }

  async incrementCounter(id: string, field: keyof User, increment: number = 1): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentValue = (user[field] as number) || 0;
    await this.userRepository.update(id, {
      [field]: currentValue + increment,
    });
  }

  async decrementCounter(id: string, field: keyof User, decrement: number = 1): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentValue = (user[field] as number) || 0;
    await this.userRepository.update(id, {
      [field]: Math.max(0, currentValue - decrement),
    });
  }
}
