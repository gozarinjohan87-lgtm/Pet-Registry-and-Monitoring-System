import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  PawPrint,
  QrCode,
  ShieldAlert,
  ClipboardList,
  Heart,
  AlertTriangle,
  Syringe,
  Stethoscope,
  Bell,
  Activity,
} from "lucide-react";

const mobileNavByRole: Record<string, Array<{ path: string; icon: React.ElementType; label: string }>> = {
  municipal_admin: [
    { path: "/", icon: LayoutDashboard, label: "Home" },
    { path: "/registry", icon: PawPrint, label: "Pets" },
    { path: "/bites", icon: ShieldAlert, label: "Bites" },
    { path: "/analytics", icon: Activity, label: "Stats" },
  ],
  barangay_operator: [
    { path: "/", icon: LayoutDashboard, label: "Home" },
    { path: "/verify", icon: ClipboardList, label: "Verify" },
    { path: "/registry", icon: PawPrint, label: "Pets" },
    { path: "/cross-alerts", icon: Bell, label: "Alerts" },
  ],
  bite_center: [
    { path: "/", icon: LayoutDashboard, label: "Home" },
    { path: "/bites", icon: ShieldAlert, label: "Bites" },
    { path: "/quarantine", icon: ClipboardList, label: "Quarantine" },
  ],
  vet_clinic: [
    { path: "/", icon: LayoutDashboard, label: "Home" },
    { path: "/scan", icon: QrCode, label: "Scan" },
    { path: "/vaccinations", icon: Syringe, label: "Vax" },
    { path: "/surgeries", icon: Stethoscope, label: "Surgery" },
  ],
  pet_owner: [
    { path: "/", icon: LayoutDashboard, label: "Home" },
    { path: "/my-pets", icon: PawPrint, label: "Pets" },
    { path: "/adoption", icon: Heart, label: "Adopt" },
    { path: "/report", icon: AlertTriangle, label: "Report" },
  ],
};

interface MobileNavProps {
  role: string;
}

export function MobileNav({ role }: MobileNavProps) {
  const location = useLocation();
  const items = mobileNavByRole[role] ?? mobileNavByRole.pet_owner;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden pb-safe">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors
                ${isActive ? "text-[#FFC107]" : "text-[#6C757D]"}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
