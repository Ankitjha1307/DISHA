import mongoose from "mongoose";
import type { MongoMemoryServer } from "mongodb-memory-server";

import { env } from "./env";

let memoryServer: MongoMemoryServer | null = null;

export async function connectDatabase() {
  let uri = env.MONGODB_URI;

  if (env.USE_MEMORY_DB) {
    // Development-only convenience for machines without a local MongoDB.
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri("disha");
    console.log("Using a development-only in-memory MongoDB instance.");
  }

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  await mongoose.connect(uri, {
    // Fail quickly with a clear startup error when Atlas is unreachable or the
    // current IP address is not allowed by the cluster.
    serverSelectionTimeoutMS: 10_000,
  });
  console.log("MongoDB connected.");
}

export async function disconnectDatabase() {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
