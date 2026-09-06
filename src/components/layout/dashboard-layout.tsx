import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="min-h-screen flex-1">
        <header className="flex h-16 items-center border-b px-4">
          <SidebarTrigger />
        </header>

        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}