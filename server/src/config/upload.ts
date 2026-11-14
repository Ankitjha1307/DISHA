import path from "node:path";

import { env } from "./env";

export const UPLOAD_DIR = env.UPLOAD_DIR
  ? path.resolve(env.UPLOAD_DIR)
  : path.resolve(__dirname, "../../uploads");

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
