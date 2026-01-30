# ===================================
# Frontend Dockerfile - Vite + React
# ===================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL

# Set environment variables for build
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY \
    VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
