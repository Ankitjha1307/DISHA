import rateLimit from "express-rate-limit";

import { env } from "../config/env";

const authAttemptLimit = env.NODE_ENV === "test" ? 1000 : 20;
const incidentReportLimit = env.NODE_ENV === "test" ? 1000 : 20;

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: authAttemptLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: "Too many authentication attempts. Please try again later.",
    },
  },
});

export const incidentSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: incidentReportLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: "Too many incident reports submitted. Please try again later.",
    },
  },
});
