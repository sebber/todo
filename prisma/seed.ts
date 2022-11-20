import { prisma } from "../src/server/db/client";

async function main() {
  // const basse = await prisma.user.upsert({
  //   where: { email: "name@example.com" },
  //   update: {},
  //   create: {
  //     email: "name@example.com",
  //     name: "Name",
  //   },
  // });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
