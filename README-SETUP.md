# Microservices Setup Guide

This guide will walk you through setting up the database and running the microservices.

## Prerequisites

- Docker and Docker Compose
- Node.js (v18 or later)
- pnpm package manager

## Database Setup

The application uses PostgreSQL as the database, which is set up using Docker Compose.

### 1. Start the PostgreSQL Service

```bash
# From the project root
docker-compose up -d postgres
```

This command will:
- Create a PostgreSQL container
- Initialize two databases:
  - `backend` database with user `backend` (password: `backend`)
  - `oauth` database with user `oauth` (password: `oauth`)
- Expose PostgreSQL on port 5432

### 2. Verify PostgreSQL is Running

```bash
docker ps
```

Look for a container named `postgres` with status `(healthy)`.

## Service Configuration

Each service requires environment variables to be properly configured. Environment files (`.env`) are already set up with the necessary configuration.

### Backend Service Environment Variables

```
PORT=3001
NODE_ENV=development
DATABASE_URL=postgres://backend:backend@localhost:5432/backend
```

### OAuth2 Service Environment Variables

```
PORT=3002
NODE_ENV=development
DATABASE_URL=postgres://oauth:oauth@localhost:5432/oauth
```

## Running the Services

### Development Mode

1. Install dependencies:

```bash
# From the project root
cd services
pnpm install
```

2. Start services in development mode:

**IMPORTANT: To run a specific service in this monorepo, use the following approach:**

```bash
# From the services directory
pnpm start:dev oauth2    # Start ONLY the oauth2 service
pnpm start:dev backend   # Start ONLY the backend service
```

This will start the services with hot-reloading enabled for faster development.

### Production Mode

1. Build the services:

```bash
# From the services directory
pnpm build                # Build all services
# OR
pnpm -C apps/backend build     # Build only the backend service
pnpm -C apps/oauth2 build      # Build only the oauth2 service
```

2. Run the services in production mode:

```bash
# From the services directory
pnpm start:prod backend    # Start backend service in production mode
pnpm start:prod oauth2     # Start oauth2 service in production mode
```

## Running Everything with Docker Compose

You can also run both the database and services using Docker Compose:

```bash
# From the project root
docker-compose up -d
```

This will start:
- PostgreSQL database
- Backend service (available at http://localhost:3000)
- OAuth2 service (available at http://localhost:3001)

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors like:

```
Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

Try the following:

1. Restart the PostgreSQL container:

```bash
docker-compose down
docker-compose up -d postgres
```

2. Make sure you're using the correct connection credentials:
   - For backend: username `backend`, password `backend`, database `backend`
   - For oauth: username `oauth`, password `oauth`, database `oauth`

3. If running services locally, ensure you're using `localhost` as the database host instead of `postgres`.

### Service Port Already in Use

If a port is already in use, you can modify the `.env` files to use different ports.

## Additional Information

For more detailed information about each service, refer to the service-specific READMEs in their respective directories.