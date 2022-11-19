import { prisma } from "../src/server/db/client";

async function main() {
  // const basse = await prisma.user.upsert({
  //   where: { email: "basse@grafikfel.org" },
  //   update: {},
  //   create: {
  //     email: "basse@grafikfel.org",
  //     name: "Basse",
  //   },
  // });
  // console.log({ basse });
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
