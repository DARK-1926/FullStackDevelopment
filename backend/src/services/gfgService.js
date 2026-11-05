




const cache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-US,en;q=0.9",
};





export function isValidHandle(handle) {
  if (!handle || typeof handle !== "string") return false;
  const trimmed = handle.trim();
  return /^[a-zA-Z0-9_.-]{2,40}$/.test(trimmed);
}





export async function getGfgProfile(handle, options = {}) {
  const { forceRefresh = false } = options;

  if (!isValidHandle(handle)) {
    return {
      success: false,
      error: "Invalid GeeksforGeeks handle format. Handles must be 2-40 alphanumeric characters, underscores, dots, or hyphens.",
    };
  }

  const normalizedHandle = handle.trim().toLowerCase();
  const now = Date.now();


  if (!forceRefresh && cache.has(normalizedHandle)) {
    const cached = cache.get(normalizedHandle);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return { ...cached.data, cached: true };
    }
  }

  let problemsSolved = null;
  let difficultyBreakdown = { easy: null, medium: null, hard: null };
  let recentSubmissions = [];
  let score = null;
  let monthlyScore = null;
  let instituteRank = "—";
  let instituteName = "";
  let currentStreak = 0;
  let longestStreak = 0;
  let practiceApiSucceeded = false;


  try {
    const subRes = await fetch("https://practiceapi.geeksforgeeks.org/api/v1/user/problems/submissions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": BROWSER_HEADERS["User-Agent"],
      },
      body: JSON.stringify({ handle: normalizedHandle, page_id: 1 }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
    });

    if (subRes.ok) {
      const subData = await subRes.json();
      if (subData.status === "success" && subData.result) {
        practiceApiSucceeded = true;
        let easyCount = 0;
        let medCount = 0;
        let hardCount = 0;
        const sortedProbs = [];

        for (const [diff, probs] of Object.entries(subData.result)) {
          const count = Object.keys(probs).length;
          const lowerDiff = diff.toLowerCase();
          if (lowerDiff.includes("hard")) {
            hardCount += count;
          } else if (lowerDiff.includes("med")) {
            medCount += count;
          } else {
            easyCount += count;
          }

          for (const prob of Object.values(probs)) {
            if (prob && prob.user_subtime) {
              sortedProbs.push({
                title: prob.pname || "Problem",
                time: prob.user_subtime,
              });
            }
          }
        }

        sortedProbs.sort((a, b) => b.time.localeCompare(a.time));
        recentSubmissions = sortedProbs.slice(0, 5).map((p) => p.title);
        problemsSolved = subData.count || (easyCount + medCount + hardCount);
        difficultyBreakdown = { easy: easyCount, medium: medCount, hard: hardCount };
      }
    }
  } catch (error) {
    console.warn("Could not fetch GeeksforGeeks submissions:", error);
  }


  try {
    const profRes = await fetch(`https://www.geeksforgeeks.org/user/${encodeURIComponent(normalizedHandle)}/`, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
    });

    if (profRes.ok) {
      const html = await profRes.text();


      if (
        html.includes("User not found") ||
        html.includes("undefined   | GeeksforGeeks Profile") ||
        html.includes("Page Not Found")
      ) {
        if (!practiceApiSucceeded) {
          return {
            success: false,
            error: `User "${handle}" not found on GeeksforGeeks.`,
          };
        }
      }

      const scoreMatch = html.match(/\\?"score\\?":\s*(\d+)/i);
      if (scoreMatch) score = parseInt(scoreMatch[1], 10);

      const monthlyScoreMatch = html.match(/\\?"monthly_score\\?":\s*(\d+)/i);
      if (monthlyScoreMatch) monthlyScore = parseInt(monthlyScoreMatch[1], 10);

      const instRankMatch = html.match(/\\?"institute_rank\\?":\s*\\?"?(\d+)/i);
      if (instRankMatch && instRankMatch[1]) instituteRank = instRankMatch[1];

      const instNameMatch = html.match(/\\?"institute_name\\?":\s*\\?"([^\\"]+)\\"?/i);
      if (instNameMatch && instNameMatch[1]) instituteName = instNameMatch[1].trim();

      const streakMatch = html.match(/\\?"pod_solved_current_streak\\?":\s*(\d+)/i);
      if (streakMatch) currentStreak = parseInt(streakMatch[1], 10);

      const maxStreakMatch = html.match(/\\?"pod_solved_longest_streak\\?":\s*(\d+)/i);
      if (maxStreakMatch) longestStreak = parseInt(maxStreakMatch[1], 10);

      if (problemsSolved == null || problemsSolved === 0) {
        const solvedMatch = html.match(/\\?"total_problems_solved\\?":\s*(\d+)/i);
        if (solvedMatch) problemsSolved = parseInt(solvedMatch[1], 10);
      }
    } else if (profRes.status === 404 && !practiceApiSucceeded) {
      return {
        success: false,
        error: `User "${handle}" not found on GeeksforGeeks.`,
      };
    }
  } catch (err) {
    if (!practiceApiSucceeded) {
      if (cache.has(normalizedHandle)) {
        return {
          ...cache.get(normalizedHandle).data,
          cached: true,
          warning: `Network failed: ${err.message}. Displaying cached data.`,
        };
      }
      return {
        success: false,
        error: `Network error reaching GeeksforGeeks: ${err.message}`,
      };
    }
  }


  if (!practiceApiSucceeded && score == null && problemsSolved == null && !instituteName) {
    return {
      success: false,
      error: `User "${handle}" not found on GeeksforGeeks.`,
    };
  }

  const data = {
    success: true,
    handle,
    score,
    monthlyScore,
    problemsSolved,
    instituteRank,
    instituteName,
    currentStreak,
    longestStreak,
    difficultyBreakdown,
    recentSubmissions,
    profileUrl: `https://www.geeksforgeeks.org/user/${encodeURIComponent(normalizedHandle)}/`,
    updatedAt: new Date().toISOString(),
  };

  cache.set(normalizedHandle, { timestamp: now, data });

  return data;
}

