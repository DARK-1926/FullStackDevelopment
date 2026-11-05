import { Activity, LogOut, UserRound } from "lucide-react";
import { FlowButton } from "../../components/ui/FlowButton.jsx";
import { useAppContext } from "../context/AppContext.jsx";

const brandLogo = `${import.meta.env.BASE_URL}devrhythm-growth-logo.png`;

export function AppShell({ navigation, activePage, onNavigate, children }) {
  const {
    profile,
    user,
    openAuthPage,
  } = useAppContext();

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "OP";
  const profileImage = profile.profileImage || user?.profileImage;

  return (
    <div className="app-shell">

      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>


      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {`Current page: ${activePage}`}
      </div>

      <header className="site-nav-shell" role="banner">
        <button className="site-brand" onClick={() => onNavigate("overview")} type="button" aria-label="DevRhythm home">
          <span className="brand-mark"><img src={brandLogo} width="32" height="32" alt="" aria-hidden="true" /></span>
          <span>DevRhythm</span>
        </button>

        <nav className="site-nav-main" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon, badge }) => {
            const isCurrent = (activePage === "opportunities" || activePage === "applications" ? "career" : activePage) === id;
            return (
              <button
                key={id}
                type="button"
                className={`site-nav-link ${isCurrent ? "is-current" : ""}`}
                aria-current={isCurrent ? "page" : undefined}
                onClick={() => onNavigate(id)}
              >
                <Icon size={14} aria-hidden="true" />
                <span>{label}</span>
                {badge !== undefined && <small aria-label={`${badge} notifications`}>{badge}</small>}
              </button>
            );
          })}
        </nav>

        <div className="site-nav-auth">
          {user ? (
            <button
              className="button button-secondary nav-profile-button"
              onClick={() => onNavigate("profile")}
              aria-label={`View user profile for ${profile.name || "User"}`}
              type="button"
              aria-current={activePage === "profile" ? "page" : undefined}
            >
              <span className="avatar" aria-hidden="true">
                {profileImage ? <img src={profileImage} alt="" /> : initials}
              </span>
              <span>Profile</span>
            </button>
          ) : (
            <FlowButton text="Sign In / Register" icon={UserRound} onClick={openAuthPage} className="nav-auth-flow" />
          )}
        </div>
      </header>

      <main className="main-area" id="main-content" tabIndex="-1" role="main">
        {children}
      </main>
    </div>
  );
}
