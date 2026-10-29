import {
  Activity,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import { AIAssistantPage } from "../features/assistant/AIAssistantPage.jsx";
import { ApplicationsPage } from "../features/applications/ApplicationsPage.jsx";
import { CalendarPage } from "../features/calendar/CalendarPage.jsx";
import { DashboardPage } from "../features/dashboard/DashboardPage.jsx";
import { GrowthPage } from "../features/growth/GrowthPage.jsx";
import { OpportunityPage } from "../features/opportunities/OpportunityPage.jsx";
import { SettingsPage } from "../features/settings/SettingsPage.jsx";
import { AppShell } from "../shared/components/AppShell.jsx";
import { AppProvider, useAppContext } from "../shared/context/AppContext.jsx";

function AppContent() {
  const {
    activePage,
    setActivePage,
    savedOpportunityIds,
    applications,
    growthStats,
  } = useAppContext();

  const navigation = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "opportunities",
      label: "Opportunities",
      icon: BriefcaseBusiness,
      badge: savedOpportunityIds.length > 0 ? savedOpportunityIds.length : undefined,
    },
    {
      id: "applications",
      label: "Applications",
      icon: FileText,
      badge: applications.length > 0 ? applications.length : undefined,
    },
    {
      id: "growth",
      label: "Streak & Growth",
      icon: Activity,
      badge: growthStats.streakAtRisk ? "Alert" : undefined,
    },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "assistant", label: "AI Assistant", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderActivePage = () => {
    switch (activePage) {
      case "opportunities":
        return <OpportunityPage />;
      case "applications":
        return <ApplicationsPage />;
      case "growth":
        return <GrowthPage />;
      case "calendar":
        return <CalendarPage />;
      case "assistant":
        return <AIAssistantPage />;
      case "settings":
        return <SettingsPage />;
      case "overview":
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppShell
      navigation={navigation}
      activePage={activePage}
      onNavigate={setActivePage}
    >
      {renderActivePage()}
    </AppShell>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

