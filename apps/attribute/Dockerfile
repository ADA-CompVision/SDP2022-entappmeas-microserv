FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build attribute

CMD ["node", "dist/apps/attribute/main"]