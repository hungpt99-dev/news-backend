import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { UserResolver } from './resolvers/user.resolver';
import { ArticleResolver } from './resolvers/article.resolver';
import { CategoryResolver } from './resolvers/category.resolver';
import { TagResolver } from './resolvers/tag.resolver';
import { CommentResolver } from './resolvers/comment.resolver';
import { BookmarkResolver } from './resolvers/bookmark.resolver';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ArticlesModule } from '../articles/articles.module';
import { CategoriesModule } from '../categories/categories.module';
import { TagsModule } from '../tags/tags.module';
import { CommentsModule } from '../comments/comments.module';
import { BookmarksModule } from '../bookmarks/bookmarks.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.get('nodeEnv') !== 'production',
        introspection: configService.get('nodeEnv') !== 'production',
        context: ({ req }) => ({ req }),
        formatError: (error) => {
          return {
            message: error.message,
            code: error.extensions?.code,
            path: error.path,
          };
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ArticlesModule,
    CategoriesModule,
    TagsModule,
    CommentsModule,
    BookmarksModule,
  ],
  providers: [
    UserResolver,
    ArticleResolver,
    CategoryResolver,
    TagResolver,
    CommentResolver,
    BookmarkResolver,
  ],
})
export class GraphQLModule {}
