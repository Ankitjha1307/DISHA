import { RoleGuard } from "@/components/auth/role-guard";

export default function CitizenLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RoleGuard role="citizen">{children}</RoleGuard>;
}
