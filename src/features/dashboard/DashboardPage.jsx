import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Flame,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../../shared/context/AppContext.jsx";

export function DashboardPage() {
  const {
    profile,
    opportunities,
    savedOpportunityIds,
    applications,
    growthStats,
    setActivePage,
    logCodingActivity,
    setSelectedOpportunityForAnalysis,
  } = useAppContext();

  const [tasks, setTasks] = useState([
    { id: 1, text: "Review your saved roles", done: false },
    { id: 2, text: "Practice two coding problems", done: false },
  ]);
  const remaining = tasks.filter((task) => !task.done).length;
  const activeApplications = applications.filter((item) =>
    ["Applied", "Interviewing"].includes(item.status),
  ).length;
  const nextOpportunity = opportunities[0];
  const firstName = profile.name.split(" ")[0];
  const date = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <main className="page-content dashboard-page">
      <div className="dashboard-greeting">
        <div>
          <p className="eyebrow">{date}</p>
          <h1>Good morning, {firstName}.</h1>
          <p className="muted">Your next opportunity is closer than you think.</p>
        </div>
        <button className="button button-primary" onClick={() => setActivePage("opportunities")} type="button">
          Find opportunities <ArrowUpRight size={16} />
        </button>
      </div>

      <section className="dashboard-hero">
        <div className="hero-copy">
          <span className="hero-kicker">A little progress goes a long way</span>
          <h2>{remaining ? "Make today count." : "You’re all caught up."}</h2>
          <p>{remaining ? `${remaining} small ${remaining === 1 ? "step" : "steps"} to keep your momentum going.` : "Your daily plan is complete. Take a look at what’s next."}</p>
          <button
            className="hero-action"
            onClick={() => {
              if (growthStats.streakAtRisk) logCodingActivity("LeetCode", 2, "Daily practice");
              else setActivePage("applications");
            }}
            type="button"
          >
            {growthStats.streakAtRisk ? "Log today’s practice" : "View your applications"}
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <span className="orbit-ring orbit-ring-one" />
          <span className="orbit-ring orbit-ring-two" />
          <span className="orbit-core"><Flame size={28} /></span>
          <span className="orbit-caption">{growthStats.currentStreak}<small>day streak</small></span>
        </div>
      </section>

      <section className="dashboard-metrics" aria-label="Your progress">
        <button className="metric-item" onClick={() => setActivePage("opportunities")} type="button">
          <span className="metric-value">{savedOpportunityIds.length.toString().padStart(2, "0")}</span>
          <span className="metric-label">Saved roles</span>
          <ChevronRight size={16} />
        </button>
        <button className="metric-item" onClick={() => setActivePage("applications")} type="button">
          <span className="metric-value">{activeApplications.toString().padStart(2, "0")}</span>
          <span className="metric-label">In progress</span>
          <ChevronRight size={16} />
        </button>
        <button className="metric-item" onClick={() => setActivePage("growth")} type="button">
          <span className="metric-value">{growthStats.totalProblemsSolved}</span>
          <span className="metric-label">Problems solved</span>
          <ChevronRight size={16} />
        </button>
      </section>

      <section className="dashboard-lower-grid">
        <div className="dashboard-section opportunities-preview">
          <div className="section-title-row">
            <div><p className="eyebrow">Worth a look</p><h2>Opportunities for you</h2></div>
            <button className="quiet-link" onClick={() => setActivePage("opportunities")} type="button">See all <ArrowRight size={15} /></button>
          </div>
          <div className="preview-list">
            {opportunities.slice(0, 3).map((item, index) => (
              <button className="preview-role" key={item.id} onClick={() => { setSelectedOpportunityForAnalysis(item); setActivePage("opportunities"); }} type="button">
                <span className={`role-index role-index-${index + 1}`}>0{index + 1}</span>
                <span className="preview-role-main"><strong>{item.title}</strong><small>{item.company} <i>·</i> {item.location}</small></span>
                <span className="preview-deadline">{item.deadline}</span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </div>

        <aside className="dashboard-section daily-plan">
          <div className="section-title-row">
            <div><p className="eyebrow">Keep your rhythm</p><h2>Today’s plan</h2></div>
            <span className="plan-count">{remaining} left</span>
          </div>
          <div className="plan-list">
            {tasks.map((task) => (
              <button
                className={`plan-item ${task.done ? "is-done" : ""}`}
                key={task.id}
                onClick={() => setTasks((current) => current.map((entry) => entry.id === task.id ? { ...entry, done: !entry.done } : entry))}
                type="button"
              >
                <span className="plan-check">{task.done && <Check size={13} />}</span>
                <span>{task.text}</span>
              </button>
            ))}
          </div>
          <button className="plan-add" onClick={() => setActivePage("calendar")} type="button"><Plus size={15} /> Add a reminder</button>
          {nextOpportunity && <p className="plan-note">Next deadline <strong>{nextOpportunity.deadline}</strong></p>}
        </aside>
      </section>
    </main>
  );
}
