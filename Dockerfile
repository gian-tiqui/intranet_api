FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --no-cache openssl

RUN npm install

COPY . .

# run when deploying in actual VM
# RUN npx prisma migrate deploy

RUN npx prisma generate

RUN npm run build

EXPOSE 8081

CMD ["npm", "run", "start:prod"]
