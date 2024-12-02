import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('meow');
}

main()
  .then(() => {
    console.log('meow meow meow meow');
  })
  .catch((err) => console.error(err))
  .finally(() => {
    console.log('meowy');
  });
