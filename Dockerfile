# BUILD STAGE
FROM node:23-alpine AS build

WORKDIR /usr/src/app

# Copy only package files first to leverage cache
COPY package*.json ./

# Use cache mount for faster installations
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy only necessary files
COPY tsconfig*.json ./
COPY src ./src

RUN npm run build

# PROD STAGE
FROM node:23-alpine AS prod

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./

# Use cache mount for production dependencies too
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# No need to remove package.json - use smaller image instead
# Use non-root user for better security
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]