"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, LogOut } from "lucide-react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { UserRole } from "@/types/role";

export function DashboardLayout({
  role = "citizen",
  children,
}: {
  role?: UserRole;
  children: React.ReactNode;
}) {
  const isOfficer = role === "officer";
  const router = useRouter();
  const { user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await logout();
      toast.success("Signed out");
    } catch {
      toast.error("The server could not be reached. Your local session was cleared.");
    } finally {
      setSigningOut(false);
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <SidebarProvider>
      <TooltipProvider>
        <AppSidebar role={role} />

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 h-4" />

            <Badge variant="outline">{isOfficer ? "Officer" : "Citizen"}</Badge>

            <span className="hidden text-sm text-muted-foreground sm:inline">
              Greater Noida · Demo environment
            </span>

            <div className="ml-auto flex items-center gap-1">
              <span className="mr-1 hidden max-w-40 truncate text-sm text-muted-foreground md:inline">
                {user?.name}
              </span>

              <ThemeToggle />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
              >
                <LogOut />
                <span className="hidden sm:inline">Sign out</span>
              </Button>

              <Button asChild variant="ghost" size="icon">
                <Link href="/" aria-label="Public site">
                  <Home />
                </Link>
              </Button>
            </div>
          </header>

          <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
