FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g expo-cli
COPY . .
EXPOSE 19000 19001 19002
CMD ["npx", "expo", "start", "--host", "0.0.0.0"]