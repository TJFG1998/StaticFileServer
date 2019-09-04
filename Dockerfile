FROM node:latest

EXPOSE 3000

WORKDIR /app

COPY package.json .

RUN npm install

RUN mkdir /public

COPY . .

ENV PORT 3000

CMD node server.js
