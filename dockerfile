# Stage 1: build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json & lock
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: run
FROM node:20-alpine

WORKDIR /app

# Copy only production files
COPY package*.json ./
RUN npm install --only=production

# Copy built code from builder
COPY --from=builder /app/dist ./dist

# Copy .env file
# COPY .env ./

# Expose port
EXPOSE 3001

# Run the app
CMD ["node", "dist/main.js"]
