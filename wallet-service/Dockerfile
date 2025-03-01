FROM node:18

WORKDIR /app

# Copia os arquivos do package.json e package-lock.json
COPY package*.json ./

RUN npm install && \
npm install --global expo-cli && \
npm install --force

COPY . .

# expoe porta(s) do servidor
EXPOSE 19000 19001 19002  

CMD ["npx", "expo", "start", "--host", "0.0.0.0"]