FROM node:20-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the project files
COPY . .

# Copy environment variables file (for Prisma & app)
COPY .env .env

# Generate Prisma client (env will be loaded automatically)
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Deploy Prisma migrations (optional)
RUN npx prisma migrate deploy --schema=./backend/prisma/schema.prisma

# Build the app (optional)
RUN npm run build || echo "No build step"

# Remove devDependencies to reduce image size
RUN npm prune --production

EXPOSE 4000

CMD ["npm", "start"]
