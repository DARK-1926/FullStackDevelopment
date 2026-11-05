





const cache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

const API_HEADERS = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "OpportunityOS/1.0 (Developer Portfolio Platform; https://opportunity-os.local)",
};

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};






export function isValidHandle(handle) {
  if (!handle || typeof handle !== "string") return false;
  const trimmed = handle.trim();
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(trimmed);
}





export async function getGitHubProfile(handle, options = {}) {
  const { forceRefresh = false } = options;

  if (!isValidHandle(handle)) {
    return {
      success: false,
      error: "Invalid GitHub handle format. Handles must be 1-39 alphanumeric characters and may contain non-consecutive hyphens.",
    };
  }

  const normalizedHandle = handle.trim();
  const cacheKey = normalizedHandle.toLowerCase();
  const now = Date.now();


  if (!forceRefresh && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return { ...cached.data, cached: true };
    }
  }

  try {

    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(normalizedHandle)}`, {
      headers: API_HEADERS,
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
    });

    if (userRes.status === 404) {
      return {
        success: false,
        error: `GitHub user '${normalizedHandle}' not found. Please verify the handle.`,
      };
    }

    if (!userRes.ok) {
      return {
        success: false,
        error: `GitHub API responded with status ${userRes.status}.`,
      };
    }

    const userData = await userRes.json();
    const publicRepos = Number(userData.public_repos) || 0;
    const followers = Number(userData.followers) || 0;
    const name = userData.name || userData.login || normalizedHandle;
    const avatar = userData.avatar_url || null;
    const bio = userData.bio || "";


    let contributions = null;
    let currentStreak = null;
    let longestStreak = null;

    try {
      const contribRes = await fetch(
        `https://github.com/users/${encodeURIComponent(normalizedHandle)}/contributions`,
        {
          headers: BROWSER_HEADERS,
          signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined,
        }
      );

      if (contribRes.ok) {
        const html = await contribRes.text();


        const contribMatch = html.match(/([0-9,]+)\s+contributions/i);
        if (contribMatch) {
          contributions = parseInt(contribMatch[1].replace(/,/g, ""), 10) || 0;
        }


        const dayMatches = [...html.matchAll(/data-date="([0-9-]+)"[^>]*data-level="([0-9])"/g)];
        if (dayMatches.length > 0) {
          const days = dayMatches
            .map((m) => ({ date: m[1], level: parseInt(m[2], 10) }))
            .sort((a, b) => a.date.localeCompare(b.date));
          currentStreak = 0;
          longestStreak = 0;


          for (let i = days.length - 1; i >= 0; i--) {
            if (days[i].level > 0) {
              currentStreak++;
            } else {

              if (i === days.length - 1) {
                continue;
              }
              break;
            }
          }


          let tempStreak = 0;
          for (const d of days) {
            if (d.level > 0) {
              tempStreak++;
              if (tempStreak > longestStreak) longestStreak = tempStreak;
            } else {
              tempStreak = 0;
            }
          }
        }
      }
    } catch (contribErr) {
      console.warn("Could not fetch GitHub contributions HTML:", contribErr.message);
    }


    let recentEvents = [];
    try {
      const eventsRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(normalizedHandle)}/events/public?per_page=15`,
        {
          headers: API_HEADERS,
          signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined,
        }
      );

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (Array.isArray(eventsData)) {
          recentEvents = eventsData
            .filter((e) => ["PushEvent", "PullRequestEvent", "IssuesEvent", "CreateEvent"].includes(e.type))
            .slice(0, 10)
            .map((e) => {
              const repoName = e.repo?.name || "repository";
              const dateStr = e.created_at ? e.created_at.split("T")[0] : new Date().toISOString().split("T")[0];

              if (e.type === "PushEvent") {
                const commitCount = e.payload?.commits?.length || e.payload?.size || 1;
                const firstMsg = e.payload?.commits?.[0]?.message?.split("\n")[0] || "Pushed updates";
                return {
                  date: dateStr,
                  platform: "GitHub",
                  problemsSolved: commitCount,
                  difficulty: "Medium",
                  category: "Open Source & Commits",
                  notes: `Pushed ${commitCount} commit(s) to ${repoName}: ${firstMsg}`,
                };
              }

              if (e.type === "PullRequestEvent") {
                const action = e.payload?.action || "updated";
                const prNum = e.payload?.pull_request?.number || e.payload?.number || "";
                return {
                  date: dateStr,
                  platform: "GitHub",
                  problemsSolved: 1,
                  difficulty: "Hard",
                  category: "Pull Request",
                  notes: `${action.toUpperCase()} PR #${prNum} in ${repoName}`,
                };
              }

              if (e.type === "IssuesEvent") {
                const action = e.payload?.action || "updated";
                const issueNum = e.payload?.issue?.number || "";
                return {
                  date: dateStr,
                  platform: "GitHub",
                  problemsSolved: 1,
                  difficulty: "Easy",
                  category: "Issue Tracking",
                  notes: `${action.toUpperCase()} Issue #${issueNum} in ${repoName}`,
                };
              }

              return {
                date: dateStr,
                platform: "GitHub",
                problemsSolved: 1,
                difficulty: "Medium",
                category: "Project Activity",
                notes: `Created ref in ${repoName}`,
              };
            });
        }
      }
    } catch (eventErr) {
      console.warn("Could not fetch recent GitHub events:", eventErr.message);
    }

    const data = {
      success: true,
      handle: userData.login || normalizedHandle,
      name,
      avatar,
      bio,
      repos: publicRepos,
      followers,
      contributions,
      streak: currentStreak,
      longestStreak,
      recentEvents,
      syncedAt: new Date().toISOString(),
    };


    cache.set(cacheKey, { timestamp: now, data });

    return data;
  } catch (err) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return {
        success: false,
        error: "Connection to GitHub timed out. Please try again shortly.",
      };
    }
    return {
      success: false,
      error: `Network error connecting to GitHub: ${err.message}`,
    };
  }
}
