import type { Role } from "../models/common";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  }
}

export {};
