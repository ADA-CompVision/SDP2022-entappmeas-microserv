FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build product

CMD ["node", "dist/apps/product/main"]