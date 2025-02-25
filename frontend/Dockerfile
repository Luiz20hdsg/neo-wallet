# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app

# Cache de dependências
COPY package.json package-lock.json* ./
RUN npm install --global expo-cli && \
    npm install --force

COPY . .
EXPOSE 19000 19001 19002

CMD ["npx", "expo", "start", "--host", "0.0.0.0"]