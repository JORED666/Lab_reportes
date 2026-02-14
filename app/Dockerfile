FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto
COPY . .

# Exponer puerto
EXPOSE 3000

# Correr en modo desarrollo con puerto dinámico
CMD ["sh", "-c", "npx next dev -p ${APP_PORT:-3000}"]
