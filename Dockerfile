FROM node:8
WORKDIR /usr/src/app

ENV MC_HOST="localhost"
ENV MC_PORT="25565"
ENV MC_USERNAME="anonymous"
ENV MC_PASSWORD="password"

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
