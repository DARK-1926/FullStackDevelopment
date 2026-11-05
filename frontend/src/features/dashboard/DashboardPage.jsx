import {
  Award,
  BarChart3,
  ChevronRight,
  Code2,
  ExternalLink,
  Flame,
  GitCommit,
  Layers,
  RotateCw,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../../shared/context/AppContext.jsx";
import ContributionSkyline from "../../components/ui/contribution-skyline.jsx";
import GridScan from "../../components/ui/GridScan.jsx";
import "./dashboard.css";

const PLATFORM_META = {
  leetcode: {
    id: "leetcode",
    name: "LeetCode",
    color: "#f59e0b",
    lightBg: "rgba(245, 158, 11, 0.08)",
    logo: "https://cdn.simpleicons.org/leetcode/f59e0b",
    url: (handle) => `https://leetcode.com/${handle || ""}`,
  },
  codeforces: {
    id: "codeforces",
    name: "Codeforces",
    color: "#2563eb",
    lightBg: "rgba(37, 99, 235, 0.08)",
    logo: "https://cdn.simpleicons.org/codeforces/2563eb",
    url: (handle) => `https://codeforces.com/profile/${handle || ""}`,
  },
  codechef: {
    id: "codechef",
    name: "CodeChef",
    color: "#d97706",
    lightBg: "rgba(217, 119, 6, 0.08)",
    logo: "https://cdn.simpleicons.org/codechef/d97706",
    url: (handle) => `https://www.codechef.com/users/${handle || ""}`,
  },
  geeksforgeeks: {
    id: "geeksforgeeks",
    name: "GeeksforGeeks",
    color: "#059669",
    lightBg: "rgba(5, 150, 105, 0.08)",
    logo: "https://cdn.simpleicons.org/geeksforgeeks/059669",
    url: (handle) => `https://auth.geeksforgeeks.org/user/${handle || ""}`,
  },
  github: {
    id: "github",
    name: "GitHub",
    color: "#7c3aed",
    lightBg: "rgba(124, 58, 237, 0.08)",
    logo: "https://cdn.simpleicons.org/github/171717",
    url: (handle) => `https://github.com/${handle || ""}`,
  },
};

export function DashboardPage() {
  const {
    profile,
    user,
    growthStats,
    syncCodeChefData,
    syncGfgData,
    syncLeetCodeData,
    syncGitHubData,
    syncCodeforcesData,
  } = useAppContext();


  const [timeRange, setTimeRange] = useState(14);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [syncingPlatform, setSyncingPlatform] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const horizontalSectionRef = useRef(null);
  const horizontalStickyRef = useRef(null);
  const horizontalViewportRef = useRef(null);
  const horizontalTrackRef = useRef(null);

  const platformHandles = {
    leetcode: user ? profile.platformHandles?.leetcode?.trim() || "" : "",
    codeforces: user ? profile.platformHandles?.codeforces?.trim() || "" : "",
    codechef: user ? profile.platformHandles?.codechef?.trim() || "" : "",
    geeksforgeeks: user ? (profile.platformHandles?.geeksforgeeks || profile.platformHandles?.gfg || "").trim() : "",
    github: user ? profile.platformHandles?.github?.trim() || "" : "",
  };
  const syncedForHandle = (stats, handle) => (
    handle && stats?.handle?.toLowerCase() === handle.toLowerCase() && stats.lastSynced
      ? stats
      : {}
  );


  const leetcode = syncedForHandle(growthStats.leetcode, platformHandles.leetcode);
  const codeforces = syncedForHandle(growthStats.codeforces, platformHandles.codeforces);
  const codechef = syncedForHandle(growthStats.codechef, platformHandles.codechef);
  const geeksforgeeks = syncedForHandle(growthStats.geeksforgeeks ?? growthStats.gfg, platformHandles.geeksforgeeks);
  const github = syncedForHandle(growthStats.github, platformHandles.github);


  const platformProblemsSolved =
    (Number(leetcode.solved) || 0) +
    (Number(codeforces.solved) || 0) +
    (Number(codechef.solved) || 0) +
    (Number(geeksforgeeks.solved) || 0);

  const totalProblemsSolved = platformProblemsSolved;


  const activityMap = useMemo(() => {
    const list = growthStats.monthlyActivity || [];
    return new Map(
      list.map((d) => [
        d.date,
        {
          count: Number(d.count) || 0,
          problemCount: Number(d.problemCount ?? d.count) || 0,
        },
      ])
    );
  }, [growthStats.monthlyActivity]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const formatDateKey = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };


  const trendDays = useMemo(() => {
    const list = [];
    for (let i = timeRange - 1; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      const row = activityMap.get(key) ?? {
        count: i === 0 ? growthStats.todayCompletedCount || 0 : (i % 5 === 0 ? 0 : 3 + (i % 3)),
        problemCount: i === 0 ? growthStats.todayCompletedCount || 0 : (i % 5 === 0 ? 0 : 3 + (i % 3)),
      };
      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
      list.push({
        date: key,
        displayDate: key.slice(5),
        dayName,
        problems: row.problemCount,
        activity: row.count,
      });
    }
    return list;
  }, [timeRange, today, activityMap, growthStats.todayCompletedCount]);


  const rangeTotalProblems = useMemo(() => {
    return trendDays.reduce((sum, day) => sum + day.problems, 0);
  }, [trendDays]);

  const rangeActiveDays = useMemo(() => {
    return trendDays.filter((day) => day.problems > 0 || day.activity > 0).length;
  }, [trendDays]);

  const rangeVelocity = (rangeTotalProblems / timeRange).toFixed(1);
  const consistencyPercent = Math.round((rangeActiveDays / timeRange) * 100);

  const peakDay = useMemo(() => {
    let peak = { dayName: "Sat", problems: 0 };
    trendDays.forEach((d) => {
      if (d.problems > peak.problems) {
        peak = d;
      }
    });
    return peak;
  }, [trendDays]);


  const chartHeight = 150;
  const chartWidth = 720;
  const paddingX = 30;
  const paddingY = 24;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const maxProblemsInTrend = Math.max(
    4,
    ...trendDays.map((d) => d.problems)
  );

  const chartPoints = useMemo(() => {
    const step = innerWidth / (trendDays.length - 1 || 1);
    return trendDays.map((day, idx) => {
      const x = paddingX + idx * step;
      const y =
        paddingY +
        innerHeight -
        (day.problems / maxProblemsInTrend) * innerHeight;
      return { ...day, x, y };
    });
  }, [trendDays, innerWidth, innerHeight, maxProblemsInTrend]);

  const chartLinePath = useMemo(() => {
    if (!chartPoints.length) return "";
    return chartPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");
  }, [chartPoints]);

  const chartAreaPath = useMemo(() => {
    if (!chartPoints.length) return "";
    const firstX = chartPoints[0].x.toFixed(1);
    const lastX = chartPoints[chartPoints.length - 1].x.toFixed(1);
    const baseline = (paddingY + innerHeight).toFixed(1);
    return `${chartLinePath} L ${lastX},${baseline} L ${firstX},${baseline} Z`;
  }, [chartPoints, chartLinePath, innerHeight]);


  const handleSyncPlatform = async (platformId) => {
    if (!user || !platformHandles[platformId]) return;
    setSyncingPlatform(platformId);
    try {
      if (platformId === "leetcode") await syncLeetCodeData(platformHandles.leetcode, { force: true });
      else if (platformId === "codeforces") await syncCodeforcesData(platformHandles.codeforces, { force: true });
      else if (platformId === "codechef") await syncCodeChefData(platformHandles.codechef, { force: true });
      else if (platformId === "geeksforgeeks") await syncGfgData(platformHandles.geeksforgeeks, { force: true });
      else if (platformId === "github") await syncGitHubData(platformHandles.github, { force: true });
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleSyncAll = async () => {
    if (!user) return;
    setIsSyncingAll(true);
    try {
      await Promise.allSettled([
        platformHandles.leetcode && syncLeetCodeData(platformHandles.leetcode, { force: true }),
        platformHandles.codeforces && syncCodeforcesData(platformHandles.codeforces, { force: true }),
        platformHandles.codechef && syncCodeChefData(platformHandles.codechef, { force: true }),
        platformHandles.geeksforgeeks && syncGfgData(platformHandles.geeksforgeeks, { force: true }),
        platformHandles.github && syncGitHubData(platformHandles.github, { force: true }),
      ]);
    } finally {
      setIsSyncingAll(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const syncTasks = [
      platformHandles.leetcode && syncLeetCodeData(platformHandles.leetcode, { force: false }),
      platformHandles.codeforces && syncCodeforcesData(platformHandles.codeforces, { force: false }),
      platformHandles.codechef && syncCodeChefData(platformHandles.codechef, { force: false }),
      platformHandles.geeksforgeeks && syncGfgData(platformHandles.geeksforgeeks, { force: false }),
      platformHandles.github && syncGitHubData(platformHandles.github, { force: false }),
    ].filter(Boolean);
    Promise.allSettled(syncTasks);
  }, [
    user,
    platformHandles.leetcode,
    platformHandles.codeforces,
    platformHandles.codechef,
    platformHandles.geeksforgeeks,
    platformHandles.github,
  ]);

  useEffect(() => {
    const section = horizontalSectionRef.current;
    const sticky = horizontalStickyRef.current;
    const viewport = horizontalViewportRef.current;
    const track = horizontalTrackRef.current;
    if (!section || !sticky || !viewport || !track) return undefined;

    let frame = 0;
    const updatePosition = () => {
      frame = 0;
      if (window.matchMedia("(max-width: 760px)").matches) {
        section.style.height = "";
        track.style.transform = "";
        return;
      }

      const stickyHeight = sticky.clientHeight;
      const maxHorizontalScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const requiredHeight = Math.ceil(stickyHeight + maxHorizontalScroll);
      if (Math.abs(section.offsetHeight - requiredHeight) > 1) {
        section.style.height = `${requiredHeight}px`;
      }

      const stickyTop = Number.parseFloat(window.getComputedStyle(sticky).top) || 76;
      const rect = section.getBoundingClientRect();
      const scrollDistance = Math.max(1, requiredHeight - stickyHeight);
      const progress = Math.max(0, Math.min(1, (stickyTop - rect.top) / scrollDistance));
      track.style.transform = `translate3d(${-maxHorizontalScroll * progress}px, 0, 0)`;
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updatePosition);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleUpdate);
    observer?.observe(viewport);
    observer?.observe(track);
    scheduleUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      observer?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      section.style.height = "";
      track.style.transform = "";
    };
  }, []);

  const longestStreak = growthStats.longestStreak ?? 28;

  return (
    <main className="page-content dashboard-page">

      <section className="dashboard-masthead" aria-labelledby="dashboard-title">
        <GridScan
          className="dashboard-masthead-gridscan"
          aria-hidden="true"
          linesColor="#d1d1cd"
          scanColor="#555550"
          cells={12}
          depth={3}
          depthFade={0.72}
          shading={0.22}
          reflection={0.12}
          points={false}
          scanDuration={3.2}
          scanDelay={1.8}
          scanWidth={0.7}
          trail={0.32}
          glow={0.28}
          clickEffect="none"
          lightMode
        />
        <div className="dashboard-intro">
          <h1 id="dashboard-title" className="dashboard-title">
            Your practice.<br />
            <em>In full view.</em>
          </h1>
          <p className="dashboard-subtitle">
            Synchronized problem-solving data, competitive programming metrics, and
            daily developer momentum brought into one unified engineering dashboard.
          </p>

        </div>


        <div className="dashboard-hero-metrics" aria-label="Key Developer Metrics">

          <article className="dashboard-metric-card">
            <div className="dashboard-metric-head">
              <span className="dashboard-metric-label">TOTAL SOLVED</span>
              <span className="dashboard-metric-icon">
                <Code2 size={15} />
              </span>
            </div>
            <div className="dashboard-metric-val">
              {totalProblemsSolved.toLocaleString()}
            </div>
            <div className="dashboard-metric-sub">
              {leetcode.solved ?? "—"} LC · {codeforces.solved ?? "—"} CF · {codechef.solved ?? "—"} CC · {geeksforgeeks.solved ?? "—"} GFG
            </div>
          </article>


          <article className="dashboard-metric-card">
            <div className="dashboard-metric-head">
              <span className="dashboard-metric-label">PRACTICE VELOCITY</span>
              <span className="dashboard-metric-icon">
                <TrendingUp size={15} color="#2563eb" />
              </span>
            </div>
            <div className="dashboard-metric-val">
              {rangeVelocity}
              <small>/day</small>
            </div>
            <div className="dashboard-metric-sub">
              {rangeTotalProblems} solved across last {timeRange} days
            </div>
          </article>


          <article className="dashboard-metric-card">
            <div className="dashboard-metric-head">
              <span className="dashboard-metric-label">CONSISTENCY</span>
              <span className="dashboard-metric-icon">
                <Flame size={15} color="#f59e0b" />
              </span>
            </div>
            <div className="dashboard-metric-val">
              {consistencyPercent}
              <small>%</small>
            </div>
            <div className="dashboard-metric-sub">
              {rangeActiveDays}/{timeRange} active days · Best: {longestStreak}d run
            </div>
          </article>


          <article className="dashboard-metric-card dashboard-metric-card--highlight">
            <div className="dashboard-metric-head">
              <span className="dashboard-metric-label">COMPETITIVE STANDING</span>
              <span className="dashboard-metric-icon">
                <Trophy size={15} color="#fbbf24" />
              </span>
            </div>
            <div className="dashboard-metric-val">
              {codechef.rating ?? "—"}
              <small>{codechef.stars ?? ""}</small>
            </div>
            <div className="dashboard-metric-sub">
              CodeChef {codechef.division ?? "—"} · CF {codeforces.rating ?? "—"} ({codeforces.rank ?? "—"})
            </div>
          </article>
        </div>
      </section>


      <section className="dashboard-trend-section" aria-labelledby="rhythm-heading">
        <header className="dashboard-trend-header">
          <div className="dashboard-trend-title-block">
            <h2 id="rhythm-heading">Practice Rhythm &amp; Velocity</h2>
          </div>

          <div className="dashboard-range-pills" role="tablist" aria-label="Time range selector">
            {[7, 14, 30].map((range) => (
              <button
                key={range}
                type="button"
                role="tab"
                aria-selected={timeRange === range}
                className={`dashboard-range-pill ${timeRange === range ? "is-active" : ""}`}
                onClick={() => setTimeRange(range)}
              >
                {range} Days
              </button>
            ))}
          </div>
        </header>

        <div className="dashboard-trend-grid">

          <div className="dashboard-chart-box">
            <div className="dashboard-chart-summary">
              <div className="chart-stat-item">
                <span className="chart-stat-label">TOTAL SOLVED</span>
                <span className="chart-stat-val">
                  {rangeTotalProblems} <small>problems</small>
                </span>
              </div>
              <div className="chart-stat-item">
                <span className="chart-stat-label">DAILY CADENCE</span>
                <span className="chart-stat-val">
                  {rangeVelocity} <small>/day</small>
                </span>
              </div>
              <div className="chart-stat-item">
                <span className="chart-stat-label">ACTIVE DAYS</span>
                <span className="chart-stat-val">
                  {rangeActiveDays} / {timeRange} <small>({consistencyPercent}%)</small>
                </span>
              </div>
              <div className="chart-stat-item">
                <span className="chart-stat-label">PEAK PERFORMANCE</span>
                <span className="chart-stat-val">
                  {peakDay.problems} <small>solved ({peakDay.dayName})</small>
                </span>
              </div>
            </div>

            <div className="dashboard-svg-wrap">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Practice velocity line chart">
                <defs>
                  <linearGradient id="velocity-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#171717" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#171717" stopOpacity="0.00" />
                  </linearGradient>
                </defs>


                {[0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = paddingY + innerHeight * (1 - ratio);
                  return (
                    <line
                      key={ratio}
                      x1={paddingX}
                      x2={chartWidth - paddingX}
                      y1={y}
                      y2={y}
                      className="chart-axis-line"
                    />
                  );
                })}


                <path d={chartAreaPath} fill="url(#velocity-gradient)" />
                <path d={chartLinePath} className="chart-path-line" />


                {chartPoints.map((point, index) => {
                  const showLabel =
                    timeRange <= 14 ? true : index % 3 === 0 || index === chartPoints.length - 1;
                  return (
                    <g
                      key={point.date}
                      className="chart-point-group"
                      onMouseEnter={() => setHoveredPoint(point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <circle cx={point.x} cy={point.y} r={point.problems > 0 ? 3.8 : 2.5} />
                      {showLabel && (
                        <text
                          x={point.x}
                          y={chartHeight - 6}
                          textAnchor="middle"
                          className="chart-point-label"
                        >
                          {point.displayDate}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {hoveredPoint && (
                <div className="chart-hover-card">
                  <strong>{hoveredPoint.date}</strong> ({hoveredPoint.dayName}): {hoveredPoint.problems} problems
                </div>
              )}
            </div>
          </div>

        </div>
      </section>


      <section className="dashboard-workspace" aria-label="Practice Activity">

        <div className="dashboard-skyline-panel">
          <div className="dashboard-panel-bar">
            <span className="dashboard-panel-title">
              <GitCommit size={14} />
              ACTIVITY FIELD · 365-DAY SKYLINE
            </span>
            <span className="dashboard-panel-hint">DRAG TO ORBIT · HOVER TO INSPECT</span>
          </div>

          <div className="skyline-canvas-box">
            <ContributionSkyline
              endDate={today}
              title={<span className="home-skyline-title">DevRhythm Activity Skyline</span>}
              palette={["#d9f99d", "#a3e635", "#65a30d", "#3f6212"]}
              defaultView="3d"
              defaultYaw={26}
              zoom={1}
              maxHeight={290}
              className="skyline-with-grid"
            />
          </div>

          <div className="dashboard-skyline-footer">
            <span>ONE DAY AT A TIME, EVERY SESSION ADDS HEIGHT.</span>
            <span>
              YEAR TOTAL: <strong>1,980</strong> · BUSIEST: <strong>59 SOLVES</strong>
            </span>
          </div>
        </div>

      </section>


      <section ref={horizontalSectionRef} className="dashboard-platforms-section dashboard-platforms-horizontal" aria-labelledby="platforms-heading">
        <div ref={horizontalStickyRef} className="dashboard-platforms-sticky">
        <header className="dashboard-platforms-head">
          <div>
            <span className="dashboard-kicker--muted">ECOSYSTEM TELEMETRY</span>
            <h2 id="platforms-heading">Connected Platforms</h2>
          </div>
          <button
            type="button"
            className="dashboard-btn-secondary"
            onClick={handleSyncAll}
            disabled={isSyncingAll || !user || !Object.values(platformHandles).some(Boolean)}
          >
            <RotateCw size={13} className={isSyncingAll ? "animate-spin" : ""} />
            Sync All Profiles
          </button>
        </header>

        <div ref={horizontalViewportRef} className="dashboard-platforms-viewport">
        <div ref={horizontalTrackRef} className="dashboard-platforms-grid">

          <article tabIndex={0} className="platform-pro-card" aria-label="LeetCode statistics. Hover or focus to reveal details." style={{ "--platform-color": PLATFORM_META.leetcode.color, "--platform-light-bg": PLATFORM_META.leetcode.lightBg }}>
            <div className="platform-card-backdrop" aria-hidden="true"><img src={PLATFORM_META.leetcode.logo} alt="" /></div>
            <div className="platform-accent-stripe" />
            <div className="platform-pro-top">
              <div className="platform-brand-identity">
                <div className="platform-logo-box">
                  <img src={PLATFORM_META.leetcode.logo} alt="LeetCode" loading="lazy" />
                </div>
                <div className="platform-brand-text">
                  <strong>LeetCode</strong>
                  <small>{platformHandles.leetcode ? `@${platformHandles.leetcode}` : "No handle connected"}</small>
                </div>
              </div>
              <button
                type="button"
                className={`platform-sync-btn ${syncingPlatform === "leetcode" ? "is-syncing" : ""}`}
                onClick={() => handleSyncPlatform("leetcode")}
                title="Sync live LeetCode stats"
                aria-label="Sync LeetCode"
                disabled={!platformHandles.leetcode || syncingPlatform === "leetcode"}
              >
                <RotateCw size={13} className={syncingPlatform === "leetcode" ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="platform-pro-primary">
              <div className="platform-big-number">{leetcode.solved ?? "—"}</div>
              <span className="platform-big-label">Problems Solved</span>
            </div>

            <div className="platform-metrics-grid">
              <div className="platform-metric-pill">
                <small>Easy</small>
                <strong>{leetcode.easy ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Medium</small>
                <strong>{leetcode.medium ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Hard</small>
                <strong>{leetcode.hard ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Global Rank</small>
                <strong>{leetcode.ranking ? `Top ${Math.round(leetcode.ranking / 1000)}k` : "—"}</strong>
              </div>
            </div>

            <div className="platform-pro-foot">
              <span className="platform-status-dot">
                <i className={leetcode.lastSynced ? "is-synced" : ""} /> {leetcode.lastSynced ? `Fetched ${leetcode.lastSynced}` : growthStats.leetcode?.loading ? "Syncing…" : "No synced data"}
              </span>
              {platformHandles.leetcode ? <a href={PLATFORM_META.leetcode.url(platformHandles.leetcode)} target="_blank" rel="noreferrer" className="platform-link-btn">Profile <ExternalLink size={11} /></a> : <span className="platform-link-btn is-disabled">Add handle</span>}
            </div>
          </article>


          <article tabIndex={0} className="platform-pro-card" aria-label="Codeforces statistics. Hover or focus to reveal details." style={{ "--platform-color": PLATFORM_META.codeforces.color, "--platform-light-bg": PLATFORM_META.codeforces.lightBg }}>
            <div className="platform-card-backdrop" aria-hidden="true"><img src={PLATFORM_META.codeforces.logo} alt="" /></div>
            <div className="platform-accent-stripe" />
            <div className="platform-pro-top">
              <div className="platform-brand-identity">
                <div className="platform-logo-box">
                  <img src={PLATFORM_META.codeforces.logo} alt="Codeforces" loading="lazy" />
                </div>
                <div className="platform-brand-text">
                  <strong>Codeforces</strong>
                  <small>{platformHandles.codeforces ? `@${platformHandles.codeforces}` : "No handle connected"}</small>
                </div>
              </div>
              <button
                type="button"
                className={`platform-sync-btn ${syncingPlatform === "codeforces" ? "is-syncing" : ""}`}
                onClick={() => handleSyncPlatform("codeforces")}
                title="Sync live Codeforces stats"
                aria-label="Sync Codeforces"
                disabled={!platformHandles.codeforces || syncingPlatform === "codeforces"}
              >
                <RotateCw size={13} className={syncingPlatform === "codeforces" ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="platform-pro-primary">
              <div className="platform-big-number">{codeforces.solved ?? "—"}</div>
              <span className="platform-big-label">Problems Solved</span>
            </div>

            <div className="platform-metrics-grid">
              <div className="platform-metric-pill">
                <small>Rating</small>
                <strong>{codeforces.rating ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Rank</small>
                <strong>{codeforces.rank ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Max Rank</small>
                <strong>{codeforces.maxRank ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Max Rating</small>
                <strong>{codeforces.maxRating ?? "—"}</strong>
              </div>
            </div>

            <div className="platform-pro-foot">
              <span className="platform-status-dot">
                <i className={codeforces.lastSynced ? "is-synced" : ""} /> {codeforces.lastSynced ? `Fetched ${codeforces.lastSynced}` : growthStats.codeforces?.loading ? "Syncing…" : "No synced data"}
              </span>
              {platformHandles.codeforces ? <a href={PLATFORM_META.codeforces.url(platformHandles.codeforces)} target="_blank" rel="noreferrer" className="platform-link-btn">Profile <ExternalLink size={11} /></a> : <span className="platform-link-btn is-disabled">Add handle</span>}
            </div>
          </article>


          <article tabIndex={0} className="platform-pro-card" aria-label="CodeChef statistics. Hover or focus to reveal details." style={{ "--platform-color": PLATFORM_META.codechef.color, "--platform-light-bg": PLATFORM_META.codechef.lightBg }}>
            <div className="platform-card-backdrop" aria-hidden="true"><img src={PLATFORM_META.codechef.logo} alt="" /></div>
            <div className="platform-accent-stripe" />
            <div className="platform-pro-top">
              <div className="platform-brand-identity">
                <div className="platform-logo-box">
                  <img src={PLATFORM_META.codechef.logo} alt="CodeChef" loading="lazy" />
                </div>
                <div className="platform-brand-text">
                  <strong>CodeChef</strong>
                  <small>{platformHandles.codechef ? `@${platformHandles.codechef}` : "No handle connected"}</small>
                </div>
              </div>
              <button
                type="button"
                className={`platform-sync-btn ${syncingPlatform === "codechef" ? "is-syncing" : ""}`}
                onClick={() => handleSyncPlatform("codechef")}
                title="Sync live CodeChef stats"
                aria-label="Sync CodeChef"
                disabled={!platformHandles.codechef || syncingPlatform === "codechef"}
              >
                <RotateCw size={13} className={syncingPlatform === "codechef" ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="platform-pro-primary">
              <div className="platform-big-number">{codechef.solved ?? "—"}</div>
              <span className="platform-big-label">Problems Solved</span>
            </div>

            <div className="platform-metrics-grid">
              <div className="platform-metric-pill">
                <small>Rating</small>
                <strong>{codechef.rating ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Stars</small>
                <strong>{codechef.stars ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Division</small>
                <strong>{codechef.division ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Country Rank</small>
                <strong>{codechef.countryRank && codechef.countryRank !== "—" ? `#${codechef.countryRank}` : "—"}</strong>
              </div>
            </div>

            <div className="platform-pro-foot">
              <span className="platform-status-dot">
                <i className={codechef.lastSynced ? "is-synced" : ""} /> {codechef.lastSynced ? `Fetched ${codechef.lastSynced}` : growthStats.codechef?.loading ? "Syncing…" : "No synced data"}
              </span>
              {platformHandles.codechef ? <a href={PLATFORM_META.codechef.url(platformHandles.codechef)} target="_blank" rel="noreferrer" className="platform-link-btn">Profile <ExternalLink size={11} /></a> : <span className="platform-link-btn is-disabled">Add handle</span>}
            </div>
          </article>


          <article tabIndex={0} className="platform-pro-card" aria-label="GeeksforGeeks statistics. Hover or focus to reveal details." style={{ "--platform-color": PLATFORM_META.geeksforgeeks.color, "--platform-light-bg": PLATFORM_META.geeksforgeeks.lightBg }}>
            <div className="platform-card-backdrop" aria-hidden="true"><img src={PLATFORM_META.geeksforgeeks.logo} alt="" /></div>
            <div className="platform-accent-stripe" />
            <div className="platform-pro-top">
              <div className="platform-brand-identity">
                <div className="platform-logo-box">
                  <img src={PLATFORM_META.geeksforgeeks.logo} alt="GeeksforGeeks" loading="lazy" />
                </div>
                <div className="platform-brand-text">
                  <strong>GeeksforGeeks</strong>
                  <small>{platformHandles.geeksforgeeks ? `@${platformHandles.geeksforgeeks}` : "No handle connected"}</small>
                </div>
              </div>
              <button
                type="button"
                className={`platform-sync-btn ${syncingPlatform === "geeksforgeeks" ? "is-syncing" : ""}`}
                onClick={() => handleSyncPlatform("geeksforgeeks")}
                title="Sync live GeeksforGeeks stats"
                aria-label="Sync GeeksforGeeks"
                disabled={!platformHandles.geeksforgeeks || syncingPlatform === "geeksforgeeks"}
              >
                <RotateCw size={13} className={syncingPlatform === "geeksforgeeks" ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="platform-pro-primary">
              <div className="platform-big-number">{geeksforgeeks.solved ?? "—"}</div>
              <span className="platform-big-label">Problems Solved</span>
            </div>

            <div className="platform-metrics-grid">
              <div className="platform-metric-pill">
                <small>Coding Score</small>
                <strong>{geeksforgeeks.score ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Campus Rank</small>
                <strong>{geeksforgeeks.instituteRank && geeksforgeeks.instituteRank !== "—" ? `#${geeksforgeeks.instituteRank}` : "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Easy / Med</small>
                <strong>{geeksforgeeks.easy ?? "—"} / {geeksforgeeks.medium ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Hard</small>
                <strong>{geeksforgeeks.hard ?? "—"}</strong>
              </div>
            </div>

            <div className="platform-pro-foot">
              <span className="platform-status-dot">
                <i className={geeksforgeeks.lastSynced ? "is-synced" : ""} /> {geeksforgeeks.lastSynced ? `Fetched ${geeksforgeeks.lastSynced}` : (growthStats.geeksforgeeks ?? growthStats.gfg)?.loading ? "Syncing…" : "No synced data"}
              </span>
              {platformHandles.geeksforgeeks ? <a href={PLATFORM_META.geeksforgeeks.url(platformHandles.geeksforgeeks)} target="_blank" rel="noreferrer" className="platform-link-btn">Profile <ExternalLink size={11} /></a> : <span className="platform-link-btn is-disabled">Add handle</span>}
            </div>
          </article>


          <article tabIndex={0} className="platform-pro-card" aria-label="GitHub statistics. Hover or focus to reveal details." style={{ "--platform-color": PLATFORM_META.github.color, "--platform-light-bg": PLATFORM_META.github.lightBg }}>
            <div className="platform-card-backdrop" aria-hidden="true"><img src={PLATFORM_META.github.logo} alt="" /></div>
            <div className="platform-accent-stripe" />
            <div className="platform-pro-top">
              <div className="platform-brand-identity">
                <div className="platform-logo-box">
                  <img src={PLATFORM_META.github.logo} alt="GitHub" loading="lazy" />
                </div>
                <div className="platform-brand-text">
                  <strong>GitHub</strong>
                  <small>{platformHandles.github ? `@${platformHandles.github}` : "No handle connected"}</small>
                </div>
              </div>
              <button
                type="button"
                className={`platform-sync-btn ${syncingPlatform === "github" ? "is-syncing" : ""}`}
                onClick={() => handleSyncPlatform("github")}
                title="Sync live GitHub contributions"
                aria-label="Sync GitHub"
                disabled={!platformHandles.github || syncingPlatform === "github"}
              >
                <RotateCw size={13} className={syncingPlatform === "github" ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="platform-pro-primary">
              <div className="platform-big-number">{github.contributions ?? "—"}</div>
              <span className="platform-big-label">Contributions (1y)</span>
            </div>

            <div className="platform-metrics-grid">
              <div className="platform-metric-pill">
                <small>Public Repos</small>
                <strong>{github.repos ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Commit Streak</small>
                <strong>{github.streak != null ? `${github.streak}d` : "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Followers</small>
                <strong>{github.followers ?? "—"}</strong>
              </div>
              <div className="platform-metric-pill">
                <small>Longest Streak</small>
                <strong>{github.longestStreak != null ? `${github.longestStreak}d` : "—"}</strong>
              </div>
            </div>

            <div className="platform-pro-foot">
              <span className="platform-status-dot">
                <i className={github.lastSynced ? "is-synced" : ""} /> {github.lastSynced ? `Fetched ${github.lastSynced}` : growthStats.github?.loading ? "Syncing…" : "No synced data"}
              </span>
              {platformHandles.github ? <a href={PLATFORM_META.github.url(platformHandles.github)} target="_blank" rel="noreferrer" className="platform-link-btn">Profile <ExternalLink size={11} /></a> : <span className="platform-link-btn is-disabled">Add handle</span>}
            </div>
          </article>
        </div>
        </div>
        </div>
      </section>

    </main>
  );
}
