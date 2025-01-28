# Etapa de construcción del frontend
FROM node:18-alpine as frontend-builder

WORKDIR /src/app/frontend

# Copiar y verificar package.json
COPY frontend/package*.json ./
RUN npm install --frozen-lockfile

# Copiar el resto del código y construir
COPY frontend/ ./
RUN npm run build

# Etapa de construcción del backend
FROM node:18-alpine as backend-builder

WORKDIR /src/app/backend

# Copiar y verificar package.json
COPY backend/package*.json ./
RUN npm install --frozen-lockfile --omit=dev

# Copiar el código del backend
COPY backend/ ./

# Etapa final: Combinar frontend y backend
FROM node:18-alpine

WORKDIR /app

# Copiar el backend
COPY --from=backend-builder /app ./

# Copiar el build del frontend
COPY --from=frontend-builder /app/frontend/build ./public

ENV PORT=3002
ENV NODE_ENV=production

EXPOSE 3002

CMD ["npm", "start"]