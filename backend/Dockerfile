# Use official Node.js LTS image (Debian-based for better Prisma compatibility)
FROM node:20-slim

# Install curl for debugging
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client (with dummy DATABASE_URL for build)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Build the application
RUN npm run build

# Remove devDependencies to keep production image lean
RUN npm prune --production

EXPOSE 4000

CMD ["npm", "start"] 