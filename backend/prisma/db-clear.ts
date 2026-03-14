import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing database...");

  const tables = [
    "ParticipantAnswer",
    "Participant",
    "Session",
    "Question",
    "Option",
    "Activity",
    "SessionTemplate",
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`,
    );
  }

  console.log("Database cleared (tables emptied, schema preserved)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
