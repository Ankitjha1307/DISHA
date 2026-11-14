"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  Map,
  ShieldCheck,
  Siren,
  Truck,
  Waypoints,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/components/providers/auth-provider";
import type { UserRole } from "@/types/role";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: Record<UserRole, NavItem[]> = {
  citizen: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Report an incident",
      url: "/report-incident",
      icon: Siren,
    },
    {
      title: "My reports",
      url: "/my-reports",
      icon: ClipboardList,
    },
    {
      title: "Safety guidance",
      url: "/safety",
      icon: ShieldCheck,
    },
  ],
  officer: [
    {
      title: "Overview",
      url: "/officer/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Incident queue",
      url: "/officer/incidents",
      icon: ClipboardList,
    },
    {
      title: "Incident map",
      url: "/officer/map",
      icon: Map,
    },
    {
      title: "Resources",
      url: "/officer/resources",
      icon: Truck,
    },
    {
      title: "Deployments",
      url: "/officer/deployments",
      icon: Waypoints,
    },
  ],
};

function isNavItemActive(pathname: string, url: string) {
  if (url === "/dashboard" || url === "/officer/dashboard") {
    return pathname === url;
  }

  return pathname === url || pathname.startsWith(`${url}/`);
}

export function AppSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = navItems[role];
  const isOfficer = role === "officer";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Link href="/" className="flex items-center gap-2 py-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Siren className="size-4" aria-hidden="true" />
              </span>
              <span className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-base font-bold tracking-tight">
                  DISHA
                </span>
                <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {isOfficer ? "Officer console" : "Citizen portal"}
                </span>
              </span>
            </Link>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2 text-xs leading-relaxed text-muted-foreground group-data-[collapsible=icon]:hidden">
          <p className="truncate font-medium text-foreground">
            {user?.name ?? (isOfficer ? "Officer" : "Citizen")}
          </p>
          <p className="mt-0.5 truncate">{user?.email}</p>
          <p className="mt-2">
            {isOfficer
              ? "Demo officer console. All incidents and resources are simulated."
              : "DISHA does not contact emergency services or dispatch real help."}
          </p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
