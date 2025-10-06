# Usar Node.js 20 como imagen base para build (Vite requiere Node 20.19+)
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Aumentar memoria de Node.js para evitar heap overflow
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copiar package.json y package-lock.json
COPY package*.json ./

# Limpiar cache e instalar dependencias
RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install

# Copiar código fuente
COPY . .

# Forzar la instalación completa y build
RUN rm -rf node_modules package-lock.json && \
    npm install && \
    npm run build

# Etapa de producción con nginx
FROM nginx:alpine AS production

# Copiar archivos de build al directorio de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando para ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]