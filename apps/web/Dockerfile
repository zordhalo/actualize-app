# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npx react-router build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built application and necessary files
COPY --from=builder /app/.react-router ./.react-router
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/__create ./__create
COPY --from=builder /app/plugins ./plugins
COPY --from=builder /app/react-router.config.ts ./
COPY --from=builder /app/vite.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tailwind.config.js ./
COPY --from=builder /app/postcss.config.js ./

# Install production dependencies only
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Set default port
ENV PORT=3000

# Start the application
CMD ["npx", "react-router", "serve"]
