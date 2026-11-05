import "./PageSkeleton.css";

export function PageSkeleton({ type = "default" }) {
  if (type === "career") {
    return (
      <div className="page-skeleton-container" aria-label="Loading career board" role="status">
        <div className="skeleton-header-block">
          <div className="skeleton-shimmer skeleton-title" />
          <div className="skeleton-shimmer skeleton-subtitle" />
        </div>


        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-card, #ffffff)",
                border: "1px solid var(--color-border, #dededb)",
                borderRadius: 12,
                padding: 16,
                minHeight: 380,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div className="skeleton-shimmer" style={{ width: 100, height: 14 }} />
              <div className="skeleton-shimmer" style={{ height: 80, borderRadius: 8 }} />
              <div className="skeleton-shimmer" style={{ height: 80, borderRadius: 8 }} />
              <div className="skeleton-shimmer" style={{ height: 80, borderRadius: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "calendar") {
    return (
      <div className="page-skeleton-container" aria-label="Loading calendar" role="status">
        <div className="skeleton-header-block">
          <div className="skeleton-shimmer skeleton-title" />
          <div className="skeleton-shimmer skeleton-subtitle" />
        </div>

        <div className="skeleton-content-grid">
          <div className="skeleton-main-card" style={{ height: 460 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div className="skeleton-shimmer" style={{ width: 140, height: 18 }} />
              <div className="skeleton-shimmer" style={{ width: 80, height: 18 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, flex: 1 }}>
              {Array.from({ length: 28 }).map((_, idx) => (
                <div key={idx} className="skeleton-shimmer" style={{ borderRadius: 6 }} />
              ))}
            </div>
          </div>

          <div className="skeleton-sidebar-card" style={{ height: 460 }}>
            <div className="skeleton-shimmer" style={{ width: 120, height: 16, marginBottom: 10 }} />
            <div className="skeleton-shimmer" style={{ height: 70, borderRadius: 8 }} />
            <div className="skeleton-shimmer" style={{ height: 70, borderRadius: 8 }} />
            <div className="skeleton-shimmer" style={{ height: 70, borderRadius: 8 }} />
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="page-skeleton-container" aria-label="Loading dashboard" role="status">
      <div className="skeleton-header-block">
        <div className="skeleton-shimmer skeleton-title" />
        <div className="skeleton-shimmer skeleton-subtitle" />
      </div>

      <div className="skeleton-metrics-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-metric-card">
            <div className="skeleton-shimmer" style={{ width: 70, height: 12 }} />
            <div className="skeleton-shimmer" style={{ width: 90, height: 26 }} />
            <div className="skeleton-shimmer" style={{ width: 110, height: 10 }} />
          </div>
        ))}
      </div>

      <div className="skeleton-content-grid">
        <div className="skeleton-main-card">
          <div className="skeleton-shimmer" style={{ width: 160, height: 18 }} />
          <div className="skeleton-shimmer" style={{ flex: 1, borderRadius: 10 }} />
        </div>
        <div className="skeleton-sidebar-card">
          <div className="skeleton-shimmer" style={{ width: 130, height: 16 }} />
          <div className="skeleton-feed-rows">
            <div className="skeleton-feed-row">
              <div className="skeleton-shimmer" style={{ width: 32, height: 32, borderRadius: "50%" }} />
              <div className="skeleton-shimmer" style={{ flex: 1, height: 14 }} />
            </div>
            <div className="skeleton-feed-row">
              <div className="skeleton-shimmer" style={{ width: 32, height: 32, borderRadius: "50%" }} />
              <div className="skeleton-shimmer" style={{ flex: 1, height: 14 }} />
            </div>
            <div className="skeleton-feed-row">
              <div className="skeleton-shimmer" style={{ width: 32, height: 32, borderRadius: "50%" }} />
              <div className="skeleton-shimmer" style={{ flex: 1, height: 14 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

