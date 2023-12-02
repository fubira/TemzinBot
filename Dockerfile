FROM node:18
WORKDIR /usr/src/app

ENV MC_HOST="localhost"
ENV MC_PORT="25565"
ENV MC_USERNAME="anonymous"
ENV MC_PASSWORD="password"
ENV OPENAI_API_KEY=""
ENV OPENAI_MATCH_KEYWORD=""

COPY package*.json ./

RUN npm install -g npm
RUN npm upgrade
RUN npm install

COPY . .

CMD ["npm", "start"]
