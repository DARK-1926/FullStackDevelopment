import { ArrowUpRight, Bell, CheckCircle2, Clock3, Target } from "lucide-react";
import { StatCard } from "../../shared/components/StatCard";
import { upcomingOpportunities } from "../../shared/data/sampleData";

export function DashboardPage() {
  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Wednesday, October 28, 2026</p>
          <h1>Good morning, Alex</h1>
          <p className="muted">Here is your opportunity and growth snapshot.</p>
        </div>
        <button className="button button-primary">Explore opportunities <ArrowUpRight size={16} /></button>
      </div>

      <section className="stats-grid" aria-label="Progress summary">
        <StatCard label="Saved opportunities" value="24" trend="+12%" icon={Target} />
        <StatCard label="Applications in progress" value="08" trend="+3 this week" icon={Clock3} />
        <StatCard label="Coding streak" value="18 days" trend="Personal best" icon={CheckCircle2} />
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Priority list</p><h2>Upcoming opportunities</h2></div>
            <button className="text-button">View all</button>
          </div>
          <div className="opportunity-list">
            {upcomingOpportunities.map((opportunity) => (
              <article className="opportunity-row" key={opportunity.id}>
                <div className="company-mark">{opportunity.company.slice(0, 1)}</div>
                <div className="row-main"><strong>{opportunity.title}</strong><span>{opportunity.company} · {opportunity.location}</span></div>
                <span className="deadline">{opportunity.deadline}</span>
              </article>
            ))}
          </div>
        </div>
        <aside className="panel focus-panel">
          <div className="panel-heading"><div><p className="eyebrow">Today</p><h2>Your focus</h2></div><Bell size={18} /></div>
          <p className="focus-number">3 <span>actions</span></p>
          <p className="muted">Keep your momentum going. Review one saved opportunity and complete two coding problems.</p>
          <div className="progress-track"><span style={{ width: "66%" }} /></div>
          <p className="progress-label">2 of 3 completed</p>
        </aside>
      </section>
    </main>
  );
}
