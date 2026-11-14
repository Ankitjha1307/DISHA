import { createApp } from "./app";
import { IMAGE_STORAGE_MODE } from "./config/cloudinary";
import { connectDatabase, disconnectDatabase } from "./config/db";
import { env } from "./config/env";
import { seedDatabase } from "./services/seed";

async function main() {
  await connectDatabase();
  console.log(`Incident image storage: ${IMAGE_STORAGE_MODE}.`);

  if (env.SEED_ON_START) {
    const result = await seedDatabase();
    console.log(
      `Seeded ${result.resourceCount} demo resources and officer account ${result.officerEmail}.`
    );
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`DISHA API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received. Shutting down.`);
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  // Log only the message so connection strings or credentials never reach the
  // console through a driver error payload.
  const message = error instanceof Error ? error.message : "Unknown startup error";
  console.error(`Failed to start DISHA API: ${message}`);
  process.exit(1);
});
