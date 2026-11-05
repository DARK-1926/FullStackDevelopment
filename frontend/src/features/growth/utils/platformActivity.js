export const PLATFORM_COLORS = {
  leetcode: "#f6a83b",
  codeforces: "#60a5fa",
  codechef: "#c08457",
  geeksforgeeks: "#4ade80",
  github: "#c084fc",
};

export const PLATFORM_NAMES = {
  leetcode: "LeetCode",
  codeforces: "Codeforces",
  codechef: "CodeChef",
  geeksforgeeks: "GeeksforGeeks",
  github: "GitHub",
};

const PLATFORM_KEYS = {
  leetcode: "leetcode",
  codeforces: "codeforces",
  codechef: "codechef",
  geeksforgeeks: "geeksforgeeks",
  github: "github",
};

function addPlatformActivity({ dayMap, date, platform, count }) {
  if (!date || !PLATFORM_KEYS[platform] || !Number.isFinite(count) || count <= 0) return;
  const day = dayMap.get(date) ?? {};
  day[platform] = (day[platform] ?? 0) + count;
  dayMap.set(date, day);
}

export function buildPlatformActivity({ platformStats, monthlyActivity, recentLogs }) {
  const dayMap = new Map();
  const livePlatforms = new Set();
  const manualDays = new Set();

  for (const platform of ["codeforces", "github"]) {
    const platformData = platformStats?.[platform];
    if (platformData?.status !== "connected" || !Array.isArray(platformData.data?.activity)) continue;
    livePlatforms.add(platform);
    for (const day of platformData.data.activity) {
      addPlatformActivity({ dayMap, date: day.date, platform, count: Number(day.count) });
    }
  }


  for (const day of monthlyActivity ?? []) {
    for (const [platformName, count] of Object.entries(day.platformCounts ?? {})) {
      const platform = platformName.toLowerCase().replace(/[^a-z]/g, "");
      if (!livePlatforms.has(platform)) {
        addPlatformActivity({ dayMap, date: day.date, platform, count: Number(count) });
        if (Number(count) > 0) manualDays.add(`${day.date}:${platform}`);
      }
    }
  }


  for (const log of recentLogs ?? []) {
    const platform = String(log.platform ?? "").toLowerCase().replace(/[^a-z]/g, "");
    const key = `${log.date}:${platform}`;
    if (livePlatforms.has(platform) || manualDays.has(key)) continue;
    addPlatformActivity({
      dayMap,
      date: log.date,
      platform,
      count: Number(log.problemsSolved) || 0,
    });
  }

  return [...dayMap.entries()]
    .map(([date, platforms]) => ({
      date,
      platforms,
      count: Object.values(platforms).reduce((sum, value) => sum + value, 0),
    }))
    .sort((first, second) => first.date.localeCompare(second.date));
}
