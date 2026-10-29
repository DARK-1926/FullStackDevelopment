import {
  AlertTriangle,
  Award,
  CheckCircle,
  Flame,
  GitCommit,
  Plus,
  Terminal,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../../shared/context/AppContext.jsx";

export function GrowthPage() {
  const { growthStats, profile, logCodingActivity, setActivePage } = useAppContext();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("LeetCode");
  const [problemsCount, setProblemsCount] = useState(2);
  const [logNotes, setLogNotes] = useState("");

  const handleLogSubmit = (e) => {
    e.preventDefault();
    logCodingActivity(selectedPlatform, Number(problemsCount) || 1, logNotes);
    setIsLogModalOpen(false);
    setLogNotes("");
  };

  const totalLeetCode = growthStats.leetcode.solved;
  const easyPct = Math.round((growthStats.leetcode.easy / totalLeetCode) * 100);
  const medPct = Math.round((growthStats.leetcode.medium / totalLeetCode) * 100);
  const hardPct = Math.round((growthStats.leetcode.hard / totalLeetCode) * 100);

  return (
    <main className="page-content">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Practice</p>
          <h1>Build your coding rhythm</h1>
          <p className="muted">Keep your streak going and see how far you’ve come.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="button button-secondary"
            onClick={() => setActivePage("calendar")}
            type="button"
          >
            Contest Schedule
          </button>
          <button
            className="button button-primary"
            onClick={() => setIsLogModalOpen(true)}
            type="button"
          >
            <Plus size={16} /> Log Today's Practice
          </button>
        </div>
      </div>

      {/* Streak-Risk Banner if user hasn't solved today */}
      {growthStats.streakAtRisk ? (
        <section className="streak-alert-banner" aria-label="Streak warning">
          <div className="streak-alert-content">
            <AlertTriangle size={24} color="#d97706" />
            <div>
              <strong>Streak Alert: 0 problems logged today!</strong>
              <span>
                Your <strong>{growthStats.currentStreak}-day</strong> coding streak will reset at midnight if you do not log today's activity.
              </span>
            </div>
          </div>
          <button
            className="button button-accent button-sm"
            onClick={() => setIsLogModalOpen(true)}
            type="button"
          >
            Log Activity Now
          </button>
        </section>
      ) : (
        <div
          style={{
            background: "var(--color-success-bg)",
            border: "1px solid var(--color-success-border)",
            color: "#34d399",
            borderRadius: "var(--radius-lg)",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
            fontSize: 13,
          }}
        >
          <CheckCircle size={18} color="#10b981" />
          <span>
            Awesome work! You have logged activity for today. Current streak is active at{" "}
            <strong>{growthStats.currentStreak} days</strong>.
          </span>
        </div>
      )}

      {/* Top Streak & Summary Cards */}
      <section className="stats-grid" aria-label="Streak and platform statistics">
        <article className="stat-card">
          <div className="stat-icon" style={{ background: "#ffedd5", color: "#ea580c" }}>
            <Flame size={20} />
          </div>
          <p className="muted">Current Streak</p>
          <strong>{growthStats.currentStreak} Days</strong>
          <span className="stat-trend" style={{ color: "#ea580c" }}>
            Longest: {growthStats.longestStreak} days
          </span>
        </article>

        <article className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
            <Trophy size={20} />
          </div>
          <p className="muted">Total Problems Solved</p>
          <strong>{growthStats.totalProblemsSolved}</strong>
          <span className="stat-trend">Across all platforms</span>
        </article>

        <article className="stat-card">
          <div className="stat-icon" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
            <Award size={20} />
          </div>
          <p className="muted">Codeforces Rating</p>
          <strong>{growthStats.codeforces.rating}</strong>
          <span className="stat-trend" style={{ color: "#1d4ed8" }}>
            {growthStats.codeforces.rank} · {growthStats.codeforces.contests} contests
          </span>
        </article>

        <article className="stat-card">
          <div className="stat-icon" style={{ background: "#f3e8ff", color: "#7e22ce" }}>
            <GitCommit size={20} />
          </div>
          <p className="muted">GitHub Contributions</p>
          <strong>{growthStats.github.contributions}</strong>
          <span className="stat-trend" style={{ color: "#7e22ce" }}>
            {growthStats.github.repos} active repos
          </span>
        </article>
      </section>

      {/* Platform Breakdown Cards */}
      <section className="platform-grid">
        {/* LeetCode Card */}
        <div className="platform-card">
          <div className="platform-header">
            <div>
              <h3>LeetCode</h3>
              <span className="muted" style={{ fontSize: 12 }}>
                @{profile.platformHandles.leetcode} · Top {Math.round(growthStats.leetcode.ranking / 1000)}k
              </span>
            </div>
            <span className="tag" style={{ background: "#fef3c7", color: "#b45309" }}>
              {growthStats.leetcode.solved} Solved
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>Easy</span>
                <span>
                  {growthStats.leetcode.easy} ({easyPct}%)
                </span>
              </div>
              <div style={{ height: 6, background: "#e2e9e3", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${easyPct}%`, background: "#16a34a" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#d97706", fontWeight: 600 }}>Medium</span>
                <span>
                  {growthStats.leetcode.medium} ({medPct}%)
                </span>
              </div>
              <div style={{ height: 6, background: "#e2e9e3", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${medPct}%`, background: "#d97706" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#dc2626", fontWeight: 600 }}>Hard</span>
                <span>
                  {growthStats.leetcode.hard} ({hardPct}%)
                </span>
              </div>
              <div style={{ height: 6, background: "#e2e9e3", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${hardPct}%`, background: "#dc2626" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Codeforces Card */}
        <div className="platform-card">
          <div className="platform-header">
            <div>
              <h3>Codeforces</h3>
              <span className="muted" style={{ fontSize: 12 }}>
                @{profile.platformHandles.codeforces}
              </span>
            </div>
            <span className="tag tag-research">{growthStats.codeforces.rank}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
            <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--color-border)", padding: 12, borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>CURRENT RATING</span>
              <strong style={{ display: "block", fontSize: 20, color: "#818cf8" }}>
                {growthStats.codeforces.rating}
              </strong>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--color-border)", padding: 12, borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>CONTESTS</span>
              <strong style={{ display: "block", fontSize: 20, color: "#818cf8" }}>
                {growthStats.codeforces.contests}
              </strong>
            </div>
          </div>
          <p className="muted" style={{ marginTop: 16, fontSize: 12 }}>
            Next rated contest: Codeforces Round 982 on Friday evening.
          </p>
        </div>

        {/* GitHub & Open Source Card */}
        <div className="platform-card">
          <div className="platform-header">
            <div>
              <h3>GitHub</h3>
              <span className="muted" style={{ fontSize: 12 }}>
                @{profile.platformHandles.github}
              </span>
            </div>
            <span className="tag tag-hackathon">{growthStats.github.streak} day streak</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
            <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--color-border)", padding: 12, borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>CONTRIBUTIONS</span>
              <strong style={{ display: "block", fontSize: 20, color: "#818cf8" }}>
                {growthStats.github.contributions}
              </strong>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--color-border)", padding: 12, borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>PUBLIC REPOS</span>
              <strong style={{ display: "block", fontSize: 20, color: "#818cf8" }}>
                {growthStats.github.repos}
              </strong>
            </div>
          </div>
          <p className="muted" style={{ marginTop: 16, fontSize: 12 }}>
            Active repositories include opportunity-os, algorithms-ts, and web-microprojects.
          </p>
        </div>
      </section>

      {/* Weekly Activity & Logs */}
      <section className="content-grid">
        {/* Weekly Activity Heatmap */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Consistency Tracker</p>
              <h2>7-Day Activity Velocity</h2>
            </div>
          </div>
          <p className="muted">Daily problem submissions and commits over the past week.</p>

          <div className="weekly-activity-bar">
            {growthStats.weeklyActivity.map((day, idx) => (
              <div className="activity-day-col" key={idx}>
                <div
                  className={`activity-day-indicator ${day.completed ? "completed" : ""}`}
                  title={`${day.day}: ${day.count} problems solved`}
                >
                  {day.count}
                </div>
                <span>{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Daily Logs */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Audit Trail</p>
              <h2>Recent Problem Logs</h2>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {growthStats.recentLogs.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: "12px 14px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <strong style={{ color: "#f8fafc" }}>
                    {log.platform} · {log.problemsSolved} Solved
                  </strong>
                  <span style={{ color: "var(--color-text-muted)" }}>{log.date}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{log.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Log Activity Modal */}
      {isLogModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLogModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ margin: 0, fontSize: 18, color: "var(--color-primary)" }}>
                  Log Problem-Solving Activity
                </h2>
                <p className="muted">Record today's coding session to advance your streak.</p>
              </div>
              <button
                className="close-btn"
                onClick={() => setIsLogModalOpen(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="platSelect">Platform *</label>
                  <select
                    id="platSelect"
                    className="form-select"
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="GitHub">GitHub (Commits / PRs)</option>
                    <option value="HackerRank">HackerRank</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="countInput">Problems / Items Completed *</label>
                  <input
                    id="countInput"
                    type="number"
                    min="1"
                    max="50"
                    className="form-input"
                    value={problemsCount}
                    onChange={(e) => setProblemsCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notesPractice">Topic / Problem Titles</label>
                  <input
                    id="notesPractice"
                    className="form-input"
                    placeholder="e.g. Solved Two Sum, Course Schedule (Topological Sort)"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setIsLogModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  <Terminal size={15} /> Save & Protect Streak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

