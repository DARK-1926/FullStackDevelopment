import type { LucideIcon } from "lucide-react";

type StatCardProps = { label: string; value: string; trend: string; icon: LucideIcon };

export function StatCard({ label, value, trend, icon: Icon }: StatCardProps) {
  return <article className="stat-card"><div className="stat-icon"><Icon size={19} /></div><p className="muted">{label}</p><strong>{value}</strong><span className="stat-trend">{trend}</span></article>;
}
