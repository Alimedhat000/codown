# Node.js Express Prisma Starter Template

A robust and scalable Node.js server template built with Express, Prisma, and TypeScript. This project is designed to provide a solid foundation for building scalable and maintainable server-side applications, with Docker support for easy development and deployment.

## Features

- **Express.js**: A minimalist web framework for building APIs and web applications.
- **Prisma ORM**: A next-generation ORM that provides type-safe database access and schema management.
- **TypeScript**: Strongly-typed JavaScript for better code quality and maintainability.
- **Esbuild**: A fast and modern bundler optimized for TypeScript and JavaScript projects.
- **PM2**: Advanced process management for Node.js applications, with support for clustering and monitoring.
- **Docker**: Containerization for consistent development environments and simplified deployment.
- **Husky & Lint-Staged**: Pre-commit hooks to ensure code quality and consistency.
- **ESLint & Prettier**: Tools for maintaining consistent code style and quality.

## Project Structure

- **.github/workflows/**: CI/CD pipeline configurations using GitHub Actions.
- **.husky/**: Configuration for Git hooks.
- **.vscode/**: Recommended settings and extensions for Visual Studio Code.
- **dist/**: Compiled output directory.
- **node_modules/**: Dependencies installed via pnpm.
- **prisma/**: Prisma schema and migration scripts.
- **public/**: Static files served by the server.
- **scripts/**: Custom shell scripts for database migrations and Prisma tasks.
- **src/**: Source code directory.
  - **@types/**: Custom TypeScript type definitions.
  - **config/**: Configuration files and environment-specific settings.
  - **constants/**: Application-wide constants.
  - **controllers/**: Express controllers for handling requests.
  - **exceptions/**: Custom error classes for consistent error handling.
  - **lib/**: Common libraries and utilities.
  - **middlewares/**: Express middlewares for handling requests.
  - **routers/**: Express routers for organizing API endpoints.
  - **types/**: Shared TypeScript types.
  - **utils/**: Utility functions and helpers.
  - **validations/**: Schema validations using Zod.
- **.dockerignore**: Files and directories to be excluded from the Docker build context.
- **.env**: Environment variables for the development environment.
- **.env.example**: Example environment variables file.
- **.gitignore**: Git configuration to exclude certain files and directories from version control.
- **.lintstagedrc**: Configuration for lint-staged, which runs linters on staged Git files.
- **.prettierrc**: Configuration file for Prettier code formatter.
- **docker-compose.yaml**: Docker Compose configuration for setting up multi-container Docker applications.
- **Dockerfile**: Docker configuration for building the application container.
- **eslint.config.js**: ESLint configuration file.
- **package.json**: Project metadata and dependencies.
- **pnpm-lock.yaml**: Lockfile for pnpm, ensuring consistent installations across environments.
- **tsconfig.json**: TypeScript compiler options.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16.x or higher)
- [pnpm](https://pnpm.io/) (recommended for managing packages)
- [Docker](https://www.docker.com/) (for containerization)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/node-express-prisma-starter-template.git
   cd node-express-prisma-starter-template
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory by copying `.env.example` and filling in the necessary variables.

4. Build and start the Docker containers:

   ```bash
   docker compose up --build
   ```

### Development

For development, the server will automatically reload with changes:

```bash
docker compose up
```

The development environment is configured to mount your local `src`, `public`, and `prisma` directories into the Docker container, allowing for instant feedback during development.

### Linting and Formatting

To check for linting errors:

```bash
pnpm run lint
```

To automatically fix linting errors:

```bash
pnpm run lint:fix
```

To run TypeScript type checks:

```bash
pnpm run typecheck
```

## Deployment

For production, ensure your `.env` file is configured correctly and build the production image:

```bash
docker compose up --build
```

This command will build the project using the `production` stage of the Dockerfile and start the containers.

## License

This project is licensed under the ISC License. See the [LICENSE](./LICENSE) file for more information.

---

Feel free to customize this template to suit your specific project requirements!
