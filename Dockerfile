# =============================================================================
# PRODUCTION DOCKERFILE - MyMeds Pharmacy Inc.
# =============================================================================
# Multi-stage build for optimized production deployment
# Frontend + Backend + Database integration
# =============================================================================

# =============================================================================
# STAGE 1: Frontend Build
# =============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY package*.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY tsconfig*.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build frontend for production
RUN npm run build

# =============================================================================
# STAGE 2: Backend Build
# =============================================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
COPY backend/tsconfig*.json ./

# Copy backend source code FIRST (before npm ci)
COPY backend/src/ ./src/
COPY backend/prisma/ ./prisma/

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build backend TypeScript
RUN npm run build

# =============================================================================
# STAGE 3: Production Runtime
# =============================================================================
FROM node:20-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    mysql-client \
    curl \
    bash \
    tzdata \
    procps

# Set timezone
ENV TZ=America/New_York

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mymeds -u 1001

# Set working directory
WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/prisma ./backend/prisma
COPY --from=backend-builder /app/backend/package*.json ./backend/

# Copy production configuration
COPY backend/env.production ./backend/.env
COPY backend/ecosystem.config.js ./backend/
COPY backend/init-integrations.js ./backend/

# Create necessary directories
RUN mkdir -p /app/backend/uploads/wordpress-media
RUN mkdir -p /app/backend/logs
RUN mkdir -p /app/backend/backups

# Set ownership
RUN chown -R mymeds:nodejs /app
RUN chmod -R 755 /app

# Switch to app user
USER mymeds

# Expose ports
EXPOSE 3000 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4000/api/health || exit 1

# Start script
COPY docker-entrypoint-perfect.sh /app/
RUN chmod +x /app/docker-entrypoint-perfect.sh

ENTRYPOINT ["/app/docker-entrypoint-perfect.sh"]
