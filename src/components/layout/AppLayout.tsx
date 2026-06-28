import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RoleSidebar } from "./RoleSidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = user?.role ?? "pet_owner";

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <RoleSidebar role={role} onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top Bar */}
      <TopBar onMenuClick={() => setSidebarOpen(true)} user={user} />

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-6 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav role={role} />
    </div>
  );
}
