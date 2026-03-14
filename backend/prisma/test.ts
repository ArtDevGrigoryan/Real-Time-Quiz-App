import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const session = await prisma.session.findMany({
    include: {
      participants: true,
      template: {
        include: {
          activities: {
            include: {
              questions: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      },
    },
  });
  console.dir(session, { depth: Infinity });
}

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
