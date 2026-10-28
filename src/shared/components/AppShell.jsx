export function AppShell({ navigation, activePage, onNavigate, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">O</span><span>OpportunityOS</span></div>
        <nav aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => <button className={`nav-item ${activePage === id ? "active" : ""}`} key={id} onClick={() => onNavigate(id)}><Icon size={18} />{label}</button>)}
        </nav>
        <div className="sidebar-footer"><div className="avatar">AS</div><div><strong>Alex Shah</strong><span>Student account</span></div></div>
      </aside>
      <div className="main-area"><header className="topbar"><span className="mobile-brand">OpportunityOS</span><span className="status-dot" /> All systems operational</header>{children}</div>
    </div>
  );
}
