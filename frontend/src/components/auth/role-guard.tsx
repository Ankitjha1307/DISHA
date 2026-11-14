"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, Loader2, RotateCw } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardPathForRole } from "@/lib/auth";
import type { UserRole } from "@/types/role";

function GuardLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 motion-safe:animate-spin" aria-hidden="true" />
        <p className="text-sm">Checking your session…</p>
      </div>
    </div>
  );
}

export function RoleGuard({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const { user, loading, error, refresh } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
      return;
    }

    if (user.role !== role) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [loading, user, role, router, pathname]);

  if (loading) {
    return <GuardLoading />;
  }

  if (error && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-6 text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <h1 className="font-semibold">Unable to reach the DISHA API</h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {error}
              </p>
            </div>
            <Button onClick={() => void refresh()}>
              <RotateCw />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || user.role !== role) {
    return <GuardLoading />;
  }

  return <>{children}</>;
}
