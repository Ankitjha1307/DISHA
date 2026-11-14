import { RoleGuard } from "@/components/auth/role-guard";

export default function OfficerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RoleGuard role="officer">{children}</RoleGuard>;
}
