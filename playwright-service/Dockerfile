# Stage 1: Build
FROM mcr.microsoft.com/playwright:v1.44.0-jammy AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Stage 2: Production
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

EXPOSE 3001
CMD ["node", "dist/index.js"]
