FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install dependencies using pnpm
COPY package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm run build backend

FROM node:22-alpine AS production

WORKDIR /app

# Copy package files and install only production dependencies
COPY package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN npm install -g pnpm && pnpm install --production

# Copy the build output
COPY --from=build /app/dist ./dist

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "dist/apps/backend/main.js"]