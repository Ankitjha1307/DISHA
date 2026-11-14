import type { UserRole } from "@/types/role";

export function dashboardPathForRole(role: UserRole) {
  return role === "officer" ? "/officer/dashboard" : "/dashboard";
}

/**
 * Keeps post-login redirects inside the signed-in role's area. This is a UX
 * guard only; the API enforces authorization and record ownership.
 */
export function resolvePostLoginPath(next: string | null, role: UserRole) {
  const fallback = dashboardPathForRole(role);

  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/login") ||
    next.startsWith("/register")
  ) {
    return fallback;
  }

  if (role === "citizen" && next.startsWith("/officer")) {
    return "/dashboard";
  }

  if (role === "officer" && !next.startsWith("/officer")) {
    return "/officer/dashboard";
  }

  return next;
}
