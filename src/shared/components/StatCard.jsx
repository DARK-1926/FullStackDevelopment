export function StatCard({ label, value, trend, icon: Icon, onClick }) {
  return (
    <article
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="stat-icon">
        <Icon size={19} />
      </div>
      <p className="muted">{label}</p>
      <strong>{value}</strong>
      <span className="stat-trend">{trend}</span>
    </article>
  );
}

