# Use official Node.js LTS image
FROM node:20-alpine

# Install required dependencies for Prisma
RUN apk add --no-cache openssl libssl1.1

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