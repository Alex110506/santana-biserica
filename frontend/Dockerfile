# Etapa 1: Build-ul aplicației React + Vite
FROM node:20-alpine AS build

WORKDIR /app

# Copiem fișierele de dependențe și le instalăm
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install

# Copiem restul codului (inclusiv .env) și dăm build
COPY . .
RUN npm run build

# Etapa 2: Serverul web Nginx care servește fișierele
FROM nginx:alpine

# Copiem configurația noastră de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiem folderul `dist` generat de Vite în folderul public al Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]