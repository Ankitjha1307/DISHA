import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env";
import { UPLOAD_DIR } from "./config/upload";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { verifyOrigin } from "./middleware/verifyOrigin";
import { authRouter } from "./routes/auth";
import { healthHandler } from "./routes/health";
import { incidentRouter } from "./routes/incidents";
import { officerRouter } from "./routes/officer";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(verifyOrigin);
  app.use(
    "/uploads",
    express.static(UPLOAD_DIR, {
      dotfiles: "deny",
      index: false,
      maxAge: "1h",
    })
  );

  app.get("/api/health", healthHandler);
  app.use("/api/auth", authRouter);
  app.use("/api/incidents", incidentRouter);
  app.use("/api/officer", officerRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
