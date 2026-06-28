import { Menu, Bell, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface TopBarProps {
  onMenuClick: () => void;
  user: ReturnType<typeof useAuth>["user"];
}
export function TopBar({ onMenuClick, user }: TopBarProps) {
  const { logout } = useAuth();
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left - Menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu className="w-5 h-5 text-[#212529]" />
      </button>
      {/* Center - Page title */}
      <div className="hidden md:block">
        <h2 className="text-sm font-semibold text-[#212529]">
          Irosin, Sorsogon
        </h2>
        <p className="text-[11px] text-[#6C757D]">Municipal Pet Registry & Monitoring</p>
      </div>
      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-[#6C757D]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#FFC107] flex items-center justify-center">
                <User className="w-4 h-4 text-[#212529]" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-[#212529]">
                {user?.name ?? "User"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-xs text-[#6C757D] cursor-default">
              Role: {user?.role?.replace(/_/g, " ") ?? "pet owner"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
