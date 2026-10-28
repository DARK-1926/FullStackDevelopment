import { Activity, BriefcaseBusiness, CalendarDays, LayoutDashboard, Settings } from "lucide-react";
import { useState } from "react";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { OpportunityPage } from "../features/opportunities/OpportunityPage";
import { AppShell } from "../shared/components/AppShell";

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "opportunities", label: "Opportunities", icon: BriefcaseBusiness },
  { id: "growth", label: "Growth", icon: Activity },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "settings", label: "Settings", icon: Settings },
];

export function App() {
  const [activePage, setActivePage] = useState("overview");

  const page = activePage === "opportunities" ? <OpportunityPage /> : <DashboardPage />;

  return (
    <AppShell navigation={navigation} activePage={activePage} onNavigate={setActivePage}>
      {page}
    </AppShell>
  );
}
