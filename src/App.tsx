import { Routes, Route, Navigate } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Dashboard pages
import { AdminDashboard } from "./pages/dashboard/AdminDashboard";
import { BarangayDashboard } from "./pages/dashboard/BarangayDashboard";
import { BiteCenterDashboard } from "./pages/dashboard/BiteCenterDashboard";
import { VetClinicDashboard } from "./pages/dashboard/VetClinicDashboard";
import { PetOwnerDashboard } from "./pages/dashboard/PetOwnerDashboard";

// Shared pages
import { RegistryPage } from "./pages/dashboard/RegistryPage";
import { BiteCasesPage } from "./pages/dashboard/BiteCasesPage";
import { ImpoundPage } from "./pages/dashboard/ImpoundPage";
import { IncidentsPage } from "./pages/dashboard/IncidentsPage";
import { AnalyticsPage } from "./pages/dashboard/AnalyticsPage";
import { BarangaysPage } from "./pages/dashboard/BarangaysPage";
import { VerifyPetsPage } from "./pages/dashboard/VerifyPetsPage";
import { CrossAlertsPage } from "./pages/dashboard/CrossAlertsPage";
import { ScanQRPage } from "./pages/dashboard/ScanQRPage";
import { VaccinationsPage } from "./pages/dashboard/VaccinationsPage";
import { SurgeriesPage } from "./pages/dashboard/SurgeriesPage";
import { MyPetsPage } from "./pages/dashboard/MyPetsPage";
import { RegisterPetPage } from "./pages/dashboard/RegisterPetPage";
import { AdoptionBoardPage } from "./pages/dashboard/AdoptionBoardPage";
import { ReportIncidentPage } from "./pages/dashboard/ReportIncidentPage";
import { GalleryPage } from "./pages/dashboard/GalleryPage";
import { QuarantinePage } from "./pages/dashboard/QuarantinePage";
import { PetDetailPage } from "./pages/dashboard/PetDetailPage";

function RoleDashboard() {
  const { user } = useAuth();
  const role = user?.role ?? "pet_owner";

  switch (role) {
    case "municipal_admin":
      return <AdminDashboard />;
    case "barangay_operator":
      return <BarangayDashboard />;
    case "bite_center":
      return <BiteCenterDashboard />;
    case "vet_clinic":
      return <VetClinicDashboard />;
    case "pet_owner":
      return <PetOwnerDashboard />;
    default:
      return <PetOwnerDashboard />;
  }
}

function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="animate-spin w-8 h-8 border-3 border-[#FFC107] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<RoleDashboard />} />
        <Route path="/registry" element={<RegistryPage />} />
        <Route path="/pet/:id" element={<PetDetailPage />} />
        <Route path="/bites" element={<BiteCasesPage />} />
        <Route path="/impound" element={<ImpoundPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/barangays" element={<BarangaysPage />} />
        <Route path="/verify" element={<VerifyPetsPage />} />
        <Route path="/cross-alerts" element={<CrossAlertsPage />} />
        <Route path="/scan" element={<ScanQRPage />} />
        <Route path="/vaccinations" element={<VaccinationsPage />} />
        <Route path="/surgeries" element={<SurgeriesPage />} />
        <Route path="/my-pets" element={<MyPetsPage />} />
        <Route path="/register-pet" element={<RegisterPetPage />} />
        <Route path="/adoption" element={<AdoptionBoardPage />} />
        <Route path="/report" element={<ReportIncidentPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/quarantine" element={<QuarantinePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
