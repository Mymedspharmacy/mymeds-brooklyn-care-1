FROM node:20-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Accept database URL from build args
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Copy only package files first
COPY package*.json ./

# Copy Prisma schema before npm install (needed for postinstall script)
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy rest of the project files
COPY . .

# ✅ Use actual DATABASE_URL during prisma generate
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Make startup script executable
RUN chmod +x start.sh

EXPOSE 4000

CMD ["./start.sh"]
