FROM node:20-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Copy Prisma schema before npm install (needed for postinstall script)
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy rest of the project files
COPY . .

# Generate Prisma client (with dummy DATABASE_URL for build)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Build the application
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Make startup script executable
RUN chmod +x start.sh

EXPOSE 4000

CMD ["./start.sh"]
