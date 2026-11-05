import {
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
} from "lucide-react";
import { CareerPage } from "../features/career";
import { CalendarPage } from "../features/calendar";
import { DashboardPage } from "../features/dashboard";
import { AuthPage } from "../features/auth";
import { ProfilePage } from "../features/profile";
import { NotFoundPage } from "../features/notfound";
import { AppShell } from "../shared/components/AppShell.jsx";
import { useState } from "react";
import { AppProvider, useAppContext } from "../shared/context/AppContext.jsx";
import { PageSkeleton } from "../shared/components/PageSkeleton.jsx";
import { ErrorBoundary } from "../shared/components/ErrorBoundary.jsx";

function AppContent() {
  const {
    activePage,
    setActivePage,
    closeAuthPage,
  } = useAppContext();

  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNavigate = (page) => {
    if (page === activePage) return;
    setIsTransitioning(true);
    setActivePage(page);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 280);
  };

  const navigation = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "calendar", label: "Contests & Events", icon: CalendarDays },
    { id: "career", label: "Career & Pipeline", icon: BriefcaseBusiness },
  ];

  if (activePage === "auth") {
    return <AuthPage onClose={closeAuthPage} />;
  }


  const knownPages = ["overview", "career", "applications", "calendar", "profile"];
  if (!knownPages.includes(activePage)) {
    return <NotFoundPage />;
  }

  const renderActivePage = () => {
    if (isTransitioning) {
      return (
        <main className="page-content">
          <PageSkeleton type={activePage} />
        </main>
      );
    }

    switch (activePage) {
      case "career":
        return <CareerPage />;
      case "applications":
        return <CareerPage />;
      case "calendar":
        return <CalendarPage />;
      case "profile":
        return <ProfilePage />;
      case "overview":
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppShell
      navigation={navigation}
      activePage={activePage}
      onNavigate={handleNavigate}
    >
      <ErrorBoundary onGoHome={() => handleNavigate("overview")}>
        {renderActivePage()}
      </ErrorBoundary>
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
