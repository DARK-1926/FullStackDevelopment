




const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json",
};





export function isValidHandle(handle) {
  if (!handle || typeof handle !== "string") return false;
  const trimmed = handle.trim();
  return /^[a-zA-Z0-9_.-]{3,24}$/.test(trimmed);
}





export async function getCodeforcesProfile(handle, options = {}) {
  const { forceRefresh = false } = options;

  if (!isValidHandle(handle)) {
    return {
      success: false,
      error: "Invalid Codeforces handle format. Handles must be 3-24 alphanumeric characters.",
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

    const userRes = await fetch(
      `https://codeforces.com/api/user.info?handles=${encodeURIComponent(normalizedHandle)}`,
      {
        headers: BROWSER_HEADERS,
        signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
      }
    );

    if (!userRes.ok) {
      return {
        success: false,
        error: `Codeforces API responded with HTTP ${userRes.status}`,
      };
    }

    const userData = await userRes.json();
    if (userData.status !== "OK" || !userData.result || userData.result.length === 0) {
      return {
        success: false,
        error: userData.comment || `Codeforces user '${normalizedHandle}' not found.`,
      };
    }

    const userInfo = userData.result[0];


    const recentSubmissions = [];
    let totalSolved = 0;

    try {
      const statusRes = await fetch(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(normalizedHandle)}&from=1&count=50`,
        {
          headers: BROWSER_HEADERS,
          signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
        }
      );

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.status === "OK" && Array.isArray(statusData.result)) {
          const solvedSet = new Set();

          for (const s of statusData.result) {
            if (s.verdict === "OK" && s.problem) {
              const problemId = `${s.problem.contestId}-${s.problem.index}`;
              solvedSet.add(problemId);


              if (recentSubmissions.length < 5 && !recentSubmissions.some((e) => e.notes.includes(s.problem.name))) {
                const dateStr = s.creationTimeSeconds
                  ? new Date(s.creationTimeSeconds * 1000).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0];

                const problemRating = s.problem.rating || 1200;
                const difficulty = problemRating >= 1800 ? "Hard" : problemRating >= 1400 ? "Medium" : "Easy";
                const category = s.problem.tags && s.problem.tags.length > 0
                  ? s.problem.tags.slice(0, 2).join(", ")
                  : "Competitive Programming";

                recentSubmissions.push({
                  date: dateStr,
                  platform: "Codeforces",
                  problemsSolved: 1,
                  difficulty,
                  category,
                  notes: `Solved "${s.problem.name}" (Rating ${problemRating})`,
                });
              }
            }
          }
          totalSolved = solvedSet.size;
        }
      }
    } catch (statusErr) {
      console.warn("Could not fetch Codeforces user submissions:", statusErr.message);
    }

    const data = {
      success: true,
      handle: userInfo.handle || normalizedHandle,
      name: `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim() || userInfo.handle || normalizedHandle,
      avatar: userInfo.titlePhoto || userInfo.avatar || null,
      rating: userInfo.rating || 0,
      maxRating: userInfo.maxRating || 0,
      rank: userInfo.rank || "Unrated",
      maxRank: userInfo.maxRank || "Unrated",
      solved: totalSolved,
      recentSubmissions,
      syncedAt: new Date().toISOString(),
    };

    cache.set(cacheKey, { timestamp: now, data });
    return data;
  } catch (err) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return {
        success: false,
        error: "Connection to Codeforces timed out. Please try again shortly.",
      };
    }
    return {
      success: false,
      error: `Network error connecting to Codeforces: ${err.message}`,
    };
  }
}
