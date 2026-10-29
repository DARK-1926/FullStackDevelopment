import { LogIn, LogOut, User } from "lucide-react";
import { useAppContext } from "../context/AppContext.jsx";
import { AuthModal } from "./AuthModal.jsx";

export function AppShell({ navigation, activePage, onNavigate, children }) {
  const {
    profile,
    user,
    logout,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  } = useAppContext();

  // Get initials for avatar
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "OP";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand" onClick={() => onNavigate("overview")} style={{ cursor: "pointer" }}>
          <span className="brand-mark">O</span>
          <div className="brand-text-block">
            <span className="brand-title">OpportunityOS</span>
            <span className="brand-subtitle">Find your next step</span>
          </div>
        </div>

        <nav aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon, badge }) => (
            <button
              className={`nav-item ${activePage === id ? "active" : ""}`}
              key={id}
              onClick={() => onNavigate(id)}
              type="button"
            >
              <Icon size={18} />
              <span>{label}</span>
              {badge !== undefined && <span className="nav-badge">{badge}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer with Auth Controls */}
        <div className="sidebar-footer">
          {user ? (
            <div className="user-profile-badge">
              <div
                className="user-profile-info"
                onClick={() => onNavigate("settings")}
                title="Go to settings"
              >
                <div className="avatar">{initials}</div>
                <div className="avatar-meta">
                  <strong>{user.name || profile.name}</strong>
                  <span>{user.email || profile.email}</span>
                </div>
              </div>
              <button
                className="icon-btn-ghost"
                onClick={logout}
                title="Log out"
                type="button"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              className="button button-accent button-sm"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={openAuthModal}
              type="button"
            >
              <LogIn size={15} /> Sign In / Register
            </button>
          )}
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <span className="mobile-brand">OpportunityOS</span>

          <div className="topbar-right">
            {user ? (
              <div className="topbar-user-tag"><span>Welcome, <strong>{user.name.split(" ")[0]}</strong></span></div>
            ) : (
              <button
                className="button button-secondary button-sm"
                onClick={openAuthModal}
                type="button"
              >
                <User size={14} /> Student Login
              </button>
            )}
          </div>
        </header>

        {children}
      </div>

      {/* Global Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
}
