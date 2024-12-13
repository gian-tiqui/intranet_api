FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Main mirror
# RUN apk add --no-cache openssl

# Different mirror
RUN echo "https://mirror1.hs-esslingen.de/pub/Mirrors/alpine/v3.21/main" > /etc/apk/repositories \
    && echo "https://mirror1.hs-esslingen.de/pub/Mirrors/alpine/v3.21/community" >> /etc/apk/repositories \
    && apk update && apk add --no-cache openssl

RUN npm install

COPY . .

# run when deploying in actual VM
# RUN npx prisma migrate deploy

RUN npx prisma generate

RUN npm run build

EXPOSE 8081

CMD ["npm", "run", "start:prod"]
