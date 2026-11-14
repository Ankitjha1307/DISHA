import type { Request, Response } from "express";
import mongoose from "mongoose";

export function healthHandler(_req: Request, res: Response) {
  res.json({
    status: "ok",
    service: "disha-api",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
}
