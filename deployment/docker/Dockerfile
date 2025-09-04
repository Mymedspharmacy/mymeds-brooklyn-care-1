# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package-lock.json* ./backend/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force
RUN cd backend && npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy source code
COPY . .

# Build frontend
RUN npm run build:prod

# Build backend
RUN cd backend && npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 mymeds

# Copy built application
COPY --from=builder --chown=mymeds:nodejs /app/dist ./dist
COPY --from=builder --chown=mymeds:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=mymeds:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=mymeds:nodejs /app/backend/package.json ./backend/package.json

# Copy environment files
COPY --chown=mymeds:nodejs backend/env.production ./backend/.env
COPY --chown=mymeds:nodejs frontend.env.production ./.env

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/backups
RUN chown -R mymeds:nodejs /app/logs /app/uploads /app/backups

# Switch to non-root user
USER mymeds

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Start the application
CMD ["node", "backend/dist/index.js"]
