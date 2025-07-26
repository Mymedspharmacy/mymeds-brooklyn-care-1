# Use official Node.js LTS image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies to keep production image lean
RUN npm prune --production

EXPOSE 4000

CMD ["npm", "start"] 