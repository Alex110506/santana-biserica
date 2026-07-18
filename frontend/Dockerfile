# Etapa 1: Build-ul aplicației React + Vite
FROM node:20-alpine AS build

WORKDIR /app

# Backend URL-ul se transmite la build time (Vite îl inserează în bundle)
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Copiem fișierele de dependențe și le instalăm
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install

# Copiem restul codului și dăm build
COPY . .
RUN npm run build

# Etapa 2: Serverul web Nginx care servește fișierele
FROM nginx:alpine

# Copiem configurația noastră de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiem folderul `dist` generat de Vite în folderul public al Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expunem portul 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]