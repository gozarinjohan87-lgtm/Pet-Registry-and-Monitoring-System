import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  PawPrint,
  Syringe,
  ShieldAlert,
  ClipboardList,
  Bell,
  QrCode,
  MapPin,
  Activity,
  Home,
  Heart,
  AlertTriangle,
  Stethoscope,
} from "lucide-react";

const navItemsByRole: Record<string, Array<{ label: string; path: string; icon: React.ElementType }>> = {
  municipal_admin: [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Pet Registry", path: "/registry", icon: PawPrint },
    { label: "Bite Cases", path: "/bites", icon: ShieldAlert },
    { label: "Impound / Pound", path: "/impound", icon: ClipboardList },
    { label: "Incidents", path: "/incidents", icon: AlertTriangle },
    { label: "Analytics", path: "/analytics", icon: Activity },
    { label: "Barangays", path: "/barangays", icon: MapPin },
  ],
  barangay_operator: [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Verify Pets", path: "/verify", icon: ClipboardList },
    { label: "Pet Registry", path: "/registry", icon: PawPrint },
    { label: "Incidents", path: "/incidents", icon: AlertTriangle },
    { label: "Cross Alerts", path: "/cross-alerts", icon: Bell },
  ],
  bite_center: [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Bite Ledger", path: "/bites", icon: ShieldAlert },
    { label: "Quarantine", path: "/quarantine", icon: ClipboardList },
  ],
  vet_clinic: [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Scan QR", path: "/scan", icon: QrCode },
    { label: "Vaccinations", path: "/vaccinations", icon: Syringe },
    { label: "Surgeries", path: "/surgeries", icon: Stethoscope },
  ],
  pet_owner: [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "My Pets", path: "/my-pets", icon: PawPrint },
    { label: "Register Pet", path: "/register-pet", icon: QrCode },
    { label: "Adoption Board", path: "/adoption", icon: Heart },
    { label: "Report Incident", path: "/report", icon: AlertTriangle },
    { label: "Barangay Gallery", path: "/gallery", icon: Home },
  ],
};

interface RoleSidebarProps {
  role: string;
  onNavigate?: () => void;
}

export function RoleSidebar({ role, onNavigate }: RoleSidebarProps) {
  const location = useLocation();
  const items = navItemsByRole[role] ?? navItemsByRole.pet_owner;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-[#FFC107] flex items-center justify-center">
          <PawPrint className="w-5 h-5 text-[#212529]" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-[#212529] leading-tight">Irosin PawTrack</h1>
          <p className="text-[10px] text-[#6C757D] uppercase tracking-wider">Pet Registry System</p>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-5 py-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#FFC107]/10 text-[#212529] border border-[#FFC107]/30 capitalize">
          {role.replace(/_/g, " ")}
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-[#FFC107] text-[#212529] shadow-sm"
                  : "text-[#6C757D] hover:bg-gray-100 hover:text-[#212529]"
                }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-[10px] text-[#6C757D]">
          &copy; 2025 Irosin Municipal Agriculture Office
        </p>
      </div>
    </div>
  );
}
