# News Backend API

A modern, scalable news backend API built with NestJS, similar to daily.dev. This project provides a complete backend solution for a news aggregation platform with features like user management, article publishing, commenting, bookmarking, and more.

## 🚀 Features

- **Modern Architecture**: Built with NestJS, TypeScript, and Fastify
- **GraphQL API**: Full GraphQL support with Apollo Server
- **REST API**: Complete REST endpoints with Swagger documentation
- **Authentication**: JWT-based authentication with role-based access control
- **Database**: TypeORM with PostgreSQL/Supabase integration
- **Security**: Helmet, CORS, Rate limiting, and input validation
- **Testing**: Comprehensive test suite with Jest
- **Docker**: Containerized deployment with Docker Compose
- **Monitoring**: Health checks and metrics support
- **Logging**: Structured logging with Pino

## 🛠️ Tech Stack

- **Runtime**: Node.js v22.16.0
- **Framework**: NestJS v11.0.1
- **Language**: TypeScript v5.8.3
- **Server**: Fastify
- **API**: GraphQL (Apollo Server) + REST
- **Database**: PostgreSQL with TypeORM v0.3.25
- **Authentication**: JWT + Supabase Auth
- **Security**: Helmet, CORS, Rate limiting
- **Testing**: Jest
- **Containerization**: Docker + Docker Compose
- **Logging**: Pino
- **Monitoring**: Prometheus metrics

## 📋 Prerequisites

- Node.js v22.16.0 or higher
- pnpm (recommended) or npm
- PostgreSQL database
- Redis (optional, for caching)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd news-backend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/news_backend
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### 4. Database setup

```bash
# Run database migrations
pnpm run db:migrate:run

# (Optional) Seed the database
pnpm run db:seed
```

### 5. Start the application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run start:prod
```

The API will be available at:
- REST API: `http://localhost:3000/api/v1`
- GraphQL Playground: `http://localhost:3000/graphql`
- API Documentation: `http://localhost:3000/api/docs`

## 🐳 Docker Setup

### Using Docker Compose

```bash
# Start all services (app, database, redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker build

```bash
# Build the image
docker build -t news-backend .

# Run the container
docker run -p 3000:3000 --env-file .env news-backend
```

## 📚 API Documentation

### REST API

The REST API is documented with Swagger and available at `/api/docs` when running in development mode.

### GraphQL API

The GraphQL API is available at `/graphql` with a built-in playground for development.

### Key Endpoints

- **Authentication**: `/api/v1/auth/*`
- **Users**: `/api/v1/users/*`
- **Articles**: `/api/v1/articles/*`
- **Categories**: `/api/v1/categories/*`
- **Tags**: `/api/v1/tags/*`
- **Comments**: `/api/v1/comments/*`
- **Bookmarks**: `/api/v1/bookmarks/*`
- **Health**: `/api/v1/health/*`

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch
```

## 🗄️ Database Management

```bash
# Create a new migration
pnpm run db:migrate:create --name=MigrationName

# Generate migration from entity changes
pnpm run db:migrate:generate --name=MigrationName

# Run migrations
pnpm run db:migrate:run

# Revert last migration
pnpm run db:migrate:revert

# Drop all tables
pnpm run db:schema:drop

# Sync schema (development only)
pnpm run db:schema:sync
```

## 📊 Monitoring & Health Checks

- **Health Check**: `GET /api/v1/health`
- **Readiness**: `GET /api/v1/health/ready`
- **Liveness**: `GET /api/v1/health/live`

## 🔧 Development

### Code Quality

```bash
# Lint code
pnpm run lint

# Format code
pnpm run format
```

### Project Structure

```
src/
├── auth/                 # Authentication module
├── users/               # User management
├── articles/            # Article management
├── categories/          # Category management
├── tags/               # Tag management
├── comments/           # Comment system
├── bookmarks/          # Bookmark system
├── graphql/            # GraphQL resolvers
├── common/             # Shared utilities
├── config/             # Configuration
├── database/           # Database setup
├── entities/           # TypeORM entities
├── health/             # Health checks
└── main.ts             # Application entry point
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
pnpm run build

# Start production server
pnpm run start:prod
```

### Environment Variables for Production

Make sure to set the following environment variables in production:

- `NODE_ENV=production`
- `DATABASE_URL` (your production database URL)
- `JWT_SECRET` (strong secret key)
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ORIGIN` (your frontend domain)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TypeORM](https://typeorm.io/) - TypeScript ORM
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/) - GraphQL server
- [Supabase](https://supabase.com/) - Backend as a Service
- [Daily.dev](https://daily.dev/) - Inspiration for the project structure
