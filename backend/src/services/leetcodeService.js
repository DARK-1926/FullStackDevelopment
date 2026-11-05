





const cache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

const BROWSER_HEADERS = {
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Referer: "https://leetcode.com",
};





export function isValidHandle(handle) {
  if (!handle || typeof handle !== "string") return false;
  const trimmed = handle.trim();
  return /^[a-zA-Z0-9_.-]{2,40}$/.test(trimmed);
}

const LEETCODE_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        realName
        userAvatar
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    userContestRanking(username: $username) {
      rating
      globalRanking
      badge {
        name
      }
    }
    recentSubmissionList(username: $username, limit: 10) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;





export async function getLeetCodeProfile(handle, options = {}) {
  const { forceRefresh = false } = options;

  if (!isValidHandle(handle)) {
    return {
      success: false,
      error: "Invalid LeetCode handle format. Handles must be 2-40 alphanumeric characters, hyphens, or underscores.",
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
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: BROWSER_HEADERS,
      body: JSON.stringify({
        query: LEETCODE_PROFILE_QUERY,
        variables: { username: normalizedHandle },
      }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
    });

    if (!response.ok) {
      return {
        success: false,
        error: `LeetCode API responded with status ${response.status}.`,
      };
    }

    const json = await response.json();

    if (json.errors && json.errors.length > 0) {
      return {
        success: false,
        error: json.errors[0]?.message || "LeetCode GraphQL error.",
      };
    }

    const matchedUser = json.data?.matchedUser;
    if (!matchedUser) {
      return {
        success: false,
        error: `LeetCode user '${normalizedHandle}' not found. Please verify the username.`,
      };
    }

    const profile = matchedUser.profile || {};
    const submissions = matchedUser.submitStatsGlobal?.acSubmissionNum || [];

    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    for (const item of submissions) {
      const diff = (item.difficulty || "").toLowerCase();
      const count = Number(item.count) || 0;
      if (diff === "all") {
        totalSolved = count;
      } else if (diff === "easy") {
        easySolved = count;
      } else if (diff === "medium") {
        mediumSolved = count;
      } else if (diff === "hard") {
        hardSolved = count;
      }
    }


    const contest = json.data?.userContestRanking;
    const contestRating = contest?.rating ? Math.round(contest.rating) : null;
    const contestRank = contest?.globalRanking || null;
    const contestBadge = contest?.badge?.name || null;


    const rawSubmissions = json.data?.recentSubmissionList || [];
    const recentSubmissions = rawSubmissions
      .filter((s) => s.statusDisplay === "Accepted")
      .map((s) => {
        const dateObj = s.timestamp ? new Date(Number(s.timestamp) * 1000) : new Date();
        const dateStr = dateObj.toISOString().split("T")[0];
        return {
          date: dateStr,
          platform: "LeetCode",
          problemsSolved: 1,
          difficulty: "Medium",
          category: s.lang ? `Solved in ${s.lang}` : "Algorithms & DSA",
          notes: `Solved ${s.title || "LeetCode problem"}`,
        };
      });

    const data = {
      success: true,
      handle: matchedUser.username || normalizedHandle,
      name: profile.realName || matchedUser.username || normalizedHandle,
      avatar: profile.userAvatar || null,
      ranking: profile.ranking || 0,
      solved: totalSolved,
      easy: easySolved,
      medium: mediumSolved,
      hard: hardSolved,
      contestRating,
      contestRank,
      contestBadge,
      recentSubmissions,
      syncedAt: new Date().toISOString(),
    };


    cache.set(cacheKey, { timestamp: now, data });

    return data;
  } catch (err) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return {
        success: false,
        error: "Connection to LeetCode timed out. Please try again shortly.",
      };
    }
    return {
      success: false,
      error: `Network error connecting to LeetCode: ${err.message}`,
    };
  }
}
