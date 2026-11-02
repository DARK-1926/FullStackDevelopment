import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle,
  ExternalLink,
  Flame,
  GitCommit,
  Plus,
  Search,
  Shield,
  Terminal,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAppContext } from "../../shared/context/AppContext.jsx";
import { streakMilestones } from "../../shared/data/sampleData.js";
import ContributionSkyline from "@/components/ui/contribution-skyline";

export function GrowthPage() {
  const {
    growthStats,
    profile,
    logCodingActivity,
    useStreakFreeze,
    calendarEvents,
    toggleCalendarReminder,
  } = useAppContext();

  // Tab navigation
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'practice' | 'contests' | 'hackathons'
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");

  // Log Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("LeetCode");
  const [problemsCount, setProblemsCount] = useState(2);
  const [logNotes, setLogNotes] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [category, setCategory] = useState("Algorithms & DSA");

  const handleLogSubmit = (e) => {
    e.preventDefault();
    logCodingActivity({
      platform: selectedPlatform,
      problemsSolved: Number(problemsCount) || 1,
      notes: logNotes,
      difficulty,
      category,
    });
    setIsLogModalOpen(false);
    setLogNotes("");
  };

  // Filtered contests and hackathons
  const events = useMemo(() => {
    return calendarEvents.filter((item) => {
      // Type matching based on tab
      if (activeTab === "contests" && item.type !== "Contest") return false;
      if (activeTab === "hackathons" && item.type !== "Hackathon") return false;

      // Platform / Organizer filter
      if (
        platformFilter !== "all" &&
        item.organizer.toLowerCase() !== platformFilter.toLowerCase()
      ) {
        return false;
      }

      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesOrganizer = item.organizer.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesOrganizer || matchesTags;
      }

      return true;
    });
  }, [calendarEvents, activeTab, platformFilter, searchQuery]);

  const totalLeetCode = growthStats.leetcode.solved;
  const easyPct = Math.round((growthStats.leetcode.easy / totalLeetCode) * 100);
  const medPct = Math.round((growthStats.leetcode.medium / totalLeetCode) * 100);
  const hardPct = Math.round((growthStats.leetcode.hard / totalLeetCode) * 100);

  const upcomingContestsCount = calendarEvents.filter((e) => e.type === "Contest").length;
  const upcomingHackathonsCount = calendarEvents.filter((e) => e.type === "Hackathon").length;

  const monthlyActivity = useMemo(
    () => growthStats.monthlyActivity || [],
    [growthStats.monthlyActivity]
  );
  const activeDaysCount = useMemo(
    () => monthlyActivity.filter((d) => d.count > 0).length,
    [monthlyActivity]
  );
  const consistencyRate = useMemo(
    () =>
      monthlyActivity.length > 0
        ? Math.round((activeDaysCount / monthlyActivity.length) * 100)
        : 0,
    [activeDaysCount, monthlyActivity]
  );

  return (
    <main className="page-content">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Developer Growth</p>
          <h1>Coding Practice & Daily Builds</h1>
          <p className="muted">
            Track your coding streak, review daily automated builds, and discover upcoming contests.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="button button-primary"
            onClick={() => setIsLogModalOpen(true)}
            type="button"
          >
            <Plus size={16} /> Log Today's Activity
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
          type="button"
        >
          Overview & Practice
        </button>
        <button
          className={`tab-btn ${activeTab === "builds" ? "active" : ""}`}
          onClick={() => setActiveTab("builds")}
          type="button"
        >
          Daily Builds ({growthStats.autonomousProjects?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === "contests" ? "active" : ""}`}
          onClick={() => setActiveTab("contests")}
          type="button"
        >
          Coding Contests ({upcomingContestsCount})
        </button>
        <button
          className={`tab-btn ${activeTab === "hackathons" ? "active" : ""}`}
          onClick={() => setActiveTab("hackathons")}
          type="button"
        >
          Hackathons & Builders ({upcomingHackathonsCount})
        </button>
      </div>

      {/* Streak Alert / Active State Banner */}
      {growthStats.streakBroken ? (
        <section
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <AlertTriangle size={26} color="#ef4444" />
            <div>
              <strong style={{ color: "#f87171", display: "block", fontSize: 15 }}>
                Streak at risk of resetting!
              </strong>
              <span style={{ fontSize: 13, color: "var(--color-text-main)" }}>
                You have been inactive for more than a day. Use a Streak Freeze to protect your{" "}
                <strong>{growthStats.currentStreak}-day</strong> record!
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="button button-accent button-sm"
              onClick={useStreakFreeze}
              disabled={(growthStats.streakFreezesAvailable ?? 0) <= 0}
              type="button"
            >
              <Shield size={14} /> Use Streak Freeze ({growthStats.streakFreezesAvailable ?? 0} left)
            </button>
            <button
              className="button button-primary button-sm"
              onClick={() => setIsLogModalOpen(true)}
              type="button"
            >
              Log Practice Now
            </button>
          </div>
        </section>
      ) : growthStats.streakAtRisk ? (
        <section className="streak-alert-banner" aria-label="Streak warning">
          <div className="streak-alert-content">
            <AlertTriangle size={24} color="#d97706" />
            <div>
              <strong>Streak Alert: No activity logged today yet!</strong>
              <span>
                Your <strong>{growthStats.currentStreak}-day</strong> coding streak will reset at midnight if you do not log today.
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {growthStats.streakFreezesAvailable > 0 && (
              <button
                className="button button-secondary button-sm"
                onClick={useStreakFreeze}
                type="button"
              >
                <Shield size={14} /> Use Freeze ({growthStats.streakFreezesAvailable})
              </button>
            )}
            <button
              className="button button-accent button-sm"
              onClick={() => setIsLogModalOpen(true)}
              type="button"
            >
              Log Activity Now
            </button>
          </div>
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
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 24,
            fontSize: 13,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle size={18} color="#10b981" />
            <span>
              Awesome work! You have logged activity for today. Current streak is active at{" "}
              <strong>{growthStats.currentStreak} days</strong>.
            </span>
          </div>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            🛡️ {growthStats.streakFreezesAvailable ?? 2} Streak Freezes available
          </span>
        </div>
      )}

      {/* Top Metrics Cards */}
      <section className="stats-grid" aria-label="Streak and platform statistics">
        <article className="stat-card">
          <div className="stat-icon" style={{ background: "#ffedd5", color: "#ea580c" }}>
            <Flame size={20} />
          </div>
          <p className="muted">Coding Streak</p>
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
          <span className="stat-trend">Across LeetCode & Codeforces</span>
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

      {/* TAB 1: OVERVIEW & PRACTICE */}
      {(activeTab === "all" || activeTab === "practice") && (
        <>
          {/* Platform Profiles Breakdown */}
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
                  <div style={{ height: 6, background: "rgba(255, 255, 255, 0.08)", borderRadius: 99, overflow: "hidden" }}>
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
                  <div style={{ height: 6, background: "rgba(255, 255, 255, 0.08)", borderRadius: 99, overflow: "hidden" }}>
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
                  <div style={{ height: 6, background: "rgba(255, 255, 255, 0.08)", borderRadius: 99, overflow: "hidden" }}>
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
                Target: Reach Specialist (1400+) in the upcoming div 2 round.
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
                Active repositories include opportunity-os, algorithms-ts, and streak.
              </p>
            </div>
          </section>

          {/* 3D Isometric Skyline Visualizer */}
          <section style={{ marginBottom: 24 }}>
            <ContributionSkyline
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Flame size={18} color="#ea580c" />
                  <strong style={{ fontSize: 16 }}>3D Contribution Skyline & Consistency Engine</strong>
                </div>
              }
              palette="github"
              defaultView="3d"
            />
          </section>

          {/* Consistency Heatmap & Practice History */}
          <section className="content-grid" style={{ marginBottom: 24 }}>
            {/* 28-Day Activity Heatmap */}
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Habit Tracking</p>
                  <h2>28-Day Consistency Heatmap</h2>
                </div>
              </div>
              <p className="muted">Rolling 4-week overview of daily coding consistency and intensity.</p>

              <div className="heatmap-container">
                <div className="heatmap-meta">
                  <span>
                    <strong>{activeDaysCount} / {monthlyActivity.length}</strong> active days
                  </span>
                  <span>
                    <strong>{consistencyRate}%</strong> consistency score
                  </span>
                </div>
                <div className="heatmap-grid">
                  {monthlyActivity.map((day, idx) => (
                    <div
                      key={idx}
                      className={`heatmap-cell level-${day.level ?? 0}`}
                      title={`${day.date || day.day}: ${day.count} problems solved`}
                    >
                      <span>{day.count > 0 ? day.count : "·"}</span>
                      <small>{day.day}</small>
                    </div>
                  ))}
                </div>
                <div className="heatmap-legend">
                  <span>Less</span>
                  <span className="legend-swatch" style={{ background: "#ebe7dc", border: "1px solid #dfdacd" }} />
                  <span className="legend-swatch" style={{ background: "#d8e8b7" }} />
                  <span className="legend-swatch" style={{ background: "#b5db6c" }} />
                  <span className="legend-swatch" style={{ background: "#234e40" }} />
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* Recent Daily Logs */}
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Recent Sessions</p>
                  <h2>Practice History</h2>
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
                      <strong style={{ color: "var(--color-text-title)" }}>
                        {log.platform} · {log.problemsSolved} Solved
                      </strong>
                      <span style={{ color: "var(--color-text-muted)" }}>{log.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>{log.notes}</p>
                    {(log.category || log.difficulty) && (
                      <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                        {log.category && (
                          <span className="tag" style={{ fontSize: 10, padding: "2px 6px" }}>
                            {log.category}
                          </span>
                        )}
                        {log.difficulty && (
                          <span
                            className="tag"
                            style={{
                              fontSize: 10,
                              padding: "2px 6px",
                              color:
                                log.difficulty === "Easy"
                                  ? "#16a34a"
                                  : log.difficulty === "Hard"
                                  ? "#dc2626"
                                  : "#d97706",
                            }}
                          >
                            {log.difficulty}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Streak Milestones Badges */}
          <section className="panel" style={{ marginBottom: 32 }}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Milestones</p>
                <h2>Streak Consistency Badges</h2>
              </div>
              <span className="tag" style={{ background: "#fef3c7", color: "#b45309" }}>
                {growthStats.currentStreak} Days Current
              </span>
            </div>
            <p className="muted">Unlock developer badges by maintaining unbroken coding streaks.</p>

            <div className="milestones-grid">
              {streakMilestones.map((m) => {
                const isUnlocked = (growthStats.currentStreak || 0) >= m.targetDays;
                const progressPct = Math.min(100, Math.round(((growthStats.currentStreak || 0) / m.targetDays) * 100));
                const isInProgress = !isUnlocked && progressPct > 0;
                return (
                  <article key={m.id} className={`milestone-card ${isUnlocked ? "unlocked" : ""}`}>
                    <div className="milestone-card-top">
                      <span className="milestone-title">{m.name}</span>
                      <span
                        className={`milestone-badge-pill ${
                          isUnlocked ? "unlocked" : isInProgress ? "in-progress" : "locked"
                        }`}
                      >
                        {isUnlocked ? "Unlocked" : `${m.targetDays} Days`}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                      {m.description}
                    </p>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                          marginTop: 6,
                        }}
                      >
                        <span>
                          {isUnlocked ? "Achieved" : `${growthStats.currentStreak}/${m.targetDays} days`}
                        </span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="milestone-progress-bar">
                        <div className="milestone-progress-fill" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* TAB: DAILY BUILDS (Inspired by Autonomous Streak Projects) */}
      {activeTab === "builds" && (
        <section style={{ marginBottom: 32 }}>
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Daily Streak Projects</p>
                <h2>Autonomous Builds & Mini-Projects</h2>
              </div>
            </div>
            <p className="muted" style={{ marginBottom: 20 }}>
              Repositories and automated projects completed to build real-world software and keep your streak strong.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16,
              }}
            >
              {(growthStats.autonomousProjects || []).map((project) => (
                <article
                  key={project.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#818cf8", textTransform: "uppercase" }}>
                        {project.language}
                      </span>
                      <span className="tag" style={{ background: "rgba(52, 211, 153, 0.15)", color: "#34d399", fontSize: 11 }}>
                        ✓ {project.status}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 16, margin: "0 0 6px 0", color: "var(--color-text-title)" }}>
                      {project.name}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
                      {project.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      paddingTop: 10,
                      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <span>{project.commits} commits</span>
                    <span>{project.date}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTESTS & HACKATHONS SECTION (shown on All, Contests, or Hackathons tab) */}
      <section style={{ marginTop: activeTab === "all" ? 12 : 0 }}>
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                {activeTab === "hackathons"
                  ? "Build & Collaborate"
                  : activeTab === "contests"
                  ? "Competitive Arenas"
                  : "Contests & Hackathons"}
              </p>
              <h2>
                {activeTab === "hackathons"
                  ? "Upcoming Hackathons"
                  : activeTab === "contests"
                  ? "Upcoming Coding Contests"
                  : "Curated Events & Challenges"}
              </h2>
            </div>
          </div>

          {/* Search & Platform Filter Bar */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div
              className="search-bar"
              style={{
                flex: "1 1 280px",
                margin: 0,
                background: "rgba(255, 255, 255, 0.04)",
              }}
            >
              <Search size={18} />
              <input
                placeholder="Search contests by name, platform, or topic (e.g. Div. 2, Web3, Algorithms)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-text-muted)",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="muted" style={{ fontSize: 13 }}>Platform:</span>
              <select
                className="form-select"
                style={{ width: "auto", padding: "8px 12px", fontSize: 13 }}
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <option value="all">All Platforms</option>
                <option value="Codeforces">Codeforces</option>
                <option value="LeetCode">LeetCode</option>
                <option value="AtCoder">AtCoder</option>
                <option value="GitHub">GitHub</option>
                <option value="ETHGlobal">ETHGlobal</option>
              </select>
            </div>
          </div>

          {/* Event Cards Grid */}
          {events.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <Trophy size={36} color="var(--color-text-muted)" style={{ marginBottom: 12 }} />
              <h3>No matching events found</h3>
              <p className="muted">
                Try clearing your search query or switching your platform filter.
              </p>
              <button
                type="button"
                className="button button-secondary button-sm"
                onClick={() => {
                  setSearchQuery("");
                  setPlatformFilter("all");
                }}
                style={{ marginTop: 12 }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {events.map((evt) => (
                <article
                  key={evt.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 14,
                    transition: "transform 0.15s ease, border-color 0.15s ease",
                  }}
                >
                  <div>
                    {/* Header: Platform & Type Tag */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--color-primary-light, #818cf8)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {evt.organizer}
                      </span>
                      <span
                        className={`tag ${
                          evt.type === "Contest"
                            ? "tag-research"
                            : evt.type === "Hackathon"
                            ? "tag-hackathon"
                            : ""
                        }`}
                      >
                        {evt.type}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 16, margin: "0 0 8px 0", color: "var(--color-text-title)" }}>
                      {evt.title}
                    </h3>

                    <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 14px 0", lineHeight: 1.5 }}>
                      {evt.description}
                    </p>

                    {/* Tags */}
                    {evt.tags && evt.tags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                        {evt.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 11,
                              background: "rgba(255, 255, 255, 0.05)",
                              padding: "2px 8px",
                              borderRadius: 4,
                              color: "var(--color-text-main)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Details: Date, Time & Action Link */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        paddingTop: 12,
                        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={14} />
                        <span>{evt.date}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Timer size={14} />
                        <span>{evt.time}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => toggleCalendarReminder(evt.id)}
                        style={{ fontSize: 12 }}
                      >
                        {evt.isReminderSet ? "✓ Reminder set" : "+ Add reminder"}
                      </button>

                      <a
                        href={evt.link}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="button button-secondary button-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        Join / Register <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Log Activity Modal */}
      {isLogModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLogModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ margin: 0, fontSize: 18, color: "var(--color-primary)" }}>
                  Log Today's Activity
                </h2>
                <p className="muted">Record problems solved or repository commits to protect your streak.</p>
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
                  <label htmlFor="platSelect">Platform / Activity *</label>
                  <select
                    id="platSelect"
                    className="form-select"
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                  >
                    <option value="LeetCode">LeetCode (Algorithm practice)</option>
                    <option value="Codeforces">Codeforces (Contest round)</option>
                    <option value="AtCoder">AtCoder (Contest practice)</option>
                    <option value="GitHub">GitHub (Build / Project commits)</option>
                    <option value="HackerRank">HackerRank</option>
                  </select>
                </div>

                {selectedPlatform === "LeetCode" && (
                  <div className="form-group">
                    <label htmlFor="diffSelect">Difficulty Level</label>
                    <select
                      id="diffSelect"
                      className="form-select"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="catSelect">Focus Area</label>
                  <select
                    id="catSelect"
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Algorithms & DSA">Algorithms & DSA</option>
                    <option value="Contest Round">Contest Round</option>
                    <option value="System Design">System Design</option>
                    <option value="Open Source & Git">Open Source & Git</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="countInput">Items / Problems / Commits Completed *</label>
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
                  <label htmlFor="notesPractice">Details or Problem / Project Name</label>
                  <input
                    id="notesPractice"
                    className="form-input"
                    placeholder="e.g. Solved 3Sum Closest or Built Auth Middleware"
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
                  <Terminal size={15} /> Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
