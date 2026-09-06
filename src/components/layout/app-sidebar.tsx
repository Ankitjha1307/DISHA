"use client";

import {
  AlertTriangle,
  ClipboardList,
  LayoutDashboard,
  Phone,
  Settings,
  UserRound,
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
} from "@/components/ui/sidebar";

const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Report Incident",
    url: "/report",
    icon: AlertTriangle,
  },
  {
    title: "My Reports",
    url: "/dashboard#recent-reports",
    icon: ClipboardList,
  },
];

const supportItems = [
  {
    title: "Emergency Contacts",
    url: "#",
    icon: Phone,
  },
  {
    title: "Profile",
    url: "#",
    icon: UserRound,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <AlertTriangle className="size-5" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">DISHA</p>
              <p className="text-xs text-muted-foreground">
                Humanitarian Assistance
              </p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="border-t px-4 py-4">
          <p className="text-xs font-medium">Emergency Assistance</p>
          <p className="mt-1 text-xs text-muted-foreground">
            For immediate danger, contact local emergency services.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}