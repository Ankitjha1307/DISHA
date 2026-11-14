import type { UserRole } from "./role";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
