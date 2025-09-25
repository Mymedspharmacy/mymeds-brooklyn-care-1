# Multi-stage Docker build for MyMeds Pharmacy Inc.
# Frontend + Backend + WordPress Integration

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
RUN npm run build

# Stage 3: Production Runtime
FROM node:18-alpine AS production
WORKDIR /app

# Install PM2 for process management
RUN npm install -g pm2

# Copy built applications
COPY --from=frontend-builder /app/dist ./dist
COPY --from=backend-builder /app/dist ./backend/dist
COPY --from=backend-builder /app/node_modules ./backend/node_modules
COPY --from=backend-builder /app/prisma ./backend/prisma

# Copy configuration files
COPY env.production ./.env
COPY backend/.env ./backend/.env

# Create uploads directory
RUN mkdir -p uploads logs

# Copy PM2 ecosystem file
COPY ecosystem.config.js ./

# Expose ports
EXPOSE 3000 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Start applications with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]




