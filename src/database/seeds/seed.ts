import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { Tag } from '../../entities/tag.entity';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Create default admin user
    const userRepository = AppDataSource.getRepository(User);
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@news.com' },
    });

    if (!existingAdmin) {
      const admin = userRepository.create({
        email: 'admin@news.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        emailVerified: true,
      });
      await userRepository.save(admin);
      console.log('Admin user created');
    }

    // Create default categories
    const categoryRepository = AppDataSource.getRepository(Category);
    const categories = [
      { name: 'Technology', description: 'Latest technology news and updates' },
      { name: 'Programming', description: 'Programming languages, frameworks, and tools' },
      { name: 'Web Development', description: 'Frontend and backend web development' },
      { name: 'Mobile Development', description: 'Mobile app development' },
      { name: 'DevOps', description: 'DevOps practices and tools' },
      { name: 'AI/ML', description: 'Artificial Intelligence and Machine Learning' },
    ];

    for (const categoryData of categories) {
      const existingCategory = await categoryRepository.findOne({
        where: { name: categoryData.name },
      });

      if (!existingCategory) {
        const category = categoryRepository.create(categoryData);
        await categoryRepository.save(category);
        console.log(`Category "${categoryData.name}" created`);
      }
    }

    // Create default tags
    const tagRepository = AppDataSource.getRepository(Tag);
    const tags = [
      'javascript',
      'typescript',
      'react',
      'vue',
      'angular',
      'nodejs',
      'python',
      'java',
      'docker',
      'kubernetes',
      'aws',
      'azure',
      'gcp',
      'mongodb',
      'postgresql',
      'redis',
      'graphql',
      'rest',
      'microservices',
      'testing',
    ];

    for (const tagName of tags) {
      const existingTag = await tagRepository.findOne({
        where: { name: tagName },
      });

      if (!existingTag) {
        const tag = tagRepository.create({ name: tagName });
        await tagRepository.save(tag);
        console.log(`Tag "${tagName}" created`);
      }
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
