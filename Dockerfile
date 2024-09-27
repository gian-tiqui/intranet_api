FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 8081

CMD ["npm", "run", "start:prod"]
