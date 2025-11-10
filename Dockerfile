# BUILD STAGE
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copia primero los archivos de dependencias para aprovechar cache
COPY package*.json ./

# Instala dependencias de desarrollo para compilar
RUN npm ci

# Copia el resto del código (filtrado por .dockerignore)
COPY . .

RUN npm run build

# PROD STAGE
FROM node:20-alpine AS prod

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./

# Instala solo dependencias necesarias para producción
RUN npm ci --omit=dev

# No need to remove package.json - use smaller image instead
# Use non-root user for better security
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]