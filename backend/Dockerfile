FROM node:22-alpine

WORKDIR /app

# Copiar dependencias e instalarlas en modo producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiar código del servidor y datos iniciales
COPY server.js defaults.json ./

# Carpetas para persistencia de datos
RUN mkdir -p /app/data /app/uploads

ENV PORT=4800
ENV NODE_ENV=production

EXPOSE 4800

CMD ["node", "--experimental-sqlite", "server.js"]
