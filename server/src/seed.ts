import { connectDatabase, disconnectDatabase } from "./config/db";
import { seedDatabase } from "./services/seed";

async function main() {
  await connectDatabase();
  const result = await seedDatabase();
  console.log(
    `Seed complete: ${result.resourceCount} demo resources and officer account ${result.officerEmail}.`
  );
  await disconnectDatabase();
}

main().catch(async (error) => {
  console.error("Seed failed:", error);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
