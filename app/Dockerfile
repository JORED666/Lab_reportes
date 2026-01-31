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

# Correr en modo desarrollo
CMD ["npm", "run", "dev"]
