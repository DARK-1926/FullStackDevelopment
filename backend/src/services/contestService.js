











const CACHE_TTL_MS = 10 * 60 * 1000;
let cachedContests = null;
let lastCacheTime = 0;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
};




function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}




function formatTimeIST(date, durationHours = null) {
  const timeStr = date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return durationHours ? `${timeStr} IST (${durationHours} hrs)` : `${timeStr} IST`;
}




export async function fetchCodeforcesContests() {
  try {
    const res = await fetch("https://codeforces.com/api/contest.list?gym=false", {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];

    const json = await res.json();
    if (json.status !== "OK" || !Array.isArray(json.result)) return [];


    const active = json.result.filter(
      (c) => c.phase === "BEFORE" || c.phase === "CODING",
    );

    return active.map((c) => {
      const startTime = new Date(c.startTimeSeconds * 1000);
      const durationHours = Math.round((c.durationSeconds / 3600) * 10) / 10;
      const isLive = c.phase === "CODING";

      return {
        id: `cf-${c.id}`,
        title: c.name,
        organizer: "Codeforces",
        type: "Contest",
        date: toDateKey(startTime),
        time: formatTimeIST(startTime, durationHours),
        link: `https://codeforces.com/contestRegistration/${c.id}`,
        status: isLive ? "Live" : "Upcoming",
        description: `Official rated algorithmic contest on Codeforces. Duration: ${durationHours} hours.`,
        tags: ["Competitive Programming", "Codeforces", "Rated"],
        isReminderSet: false,
      };
    });
  } catch (err) {
    console.warn("[ContestService] Codeforces fetch warning:", err.message);
    return [];
  }
}




export async function fetchLeetCodeContests() {
  try {
    const query = `
      query topTwoContests {
        topTwoContests {
          title
          titleSlug
          startTime
          duration
          originStartTime
          isVirtual
        }
      }
    `;

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/json",
        Referer: "https://leetcode.com/contest/",
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return [];

    const json = await res.json();
    const contests = json.data?.topTwoContests;
    if (!Array.isArray(contests)) return [];

    return contests.map((c, idx) => {
      const startTime = new Date(c.startTime * 1000);
      const durationHours = Math.round((c.duration / 3600) * 10) / 10;
      const now = Date.now();
      const endTime = c.startTime * 1000 + c.duration * 1000;
      const isLive = now >= c.startTime * 1000 && now <= endTime;

      return {
        id: `lc-${c.titleSlug || idx}`,
        title: c.title,
        organizer: "LeetCode",
        type: "Contest",
        date: toDateKey(startTime),
        time: formatTimeIST(startTime, durationHours),
        link: `https://leetcode.com/contest/${c.titleSlug || ""}`,
        status: isLive ? "Live" : "Upcoming",
        description:
          "4 algorithmic challenges testing data structures, dynamic programming, and speed coding. Rated for LeetCode contest rating.",
        tags: ["LeetCode", "Algorithms", "DSA", "Rated"],
        isReminderSet: false,
      };
    });
  } catch (err) {
    console.warn("[ContestService] LeetCode fetch warning:", err.message);
    return [];
  }
}




export async function fetchCodeChefContests() {
  try {
    const res = await fetch(
      "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all",
      {
        headers: BROWSER_HEADERS,
        signal: AbortSignal.timeout(6000),
      },
    );

    if (!res.ok) return [];

    const json = await res.json();
    const future = Array.isArray(json.future_contests) ? json.future_contests : [];
    const present = Array.isArray(json.present_contests) ? json.present_contests : [];
    const list = [...present, ...future];

    return list.slice(0, 8).map((c) => {
      const startTime = new Date(c.contest_start_date_iso || c.contest_start_date);
      const durationHours = c.contest_duration
        ? Math.round((parseInt(c.contest_duration, 10) / 60) * 10) / 10
        : null;
      const isLive = present.some((p) => p.contest_code === c.contest_code);

      return {
        id: `cc-${c.contest_code}`,
        title: c.contest_name || `CodeChef Starters ${c.contest_code}`,
        organizer: "CodeChef",
        type: "Contest",
        date: toDateKey(startTime),
        time: formatTimeIST(startTime, durationHours),
        link: `https://www.codechef.com/${c.contest_code}`,
        status: isLive ? "Live" : "Upcoming",
        description: `Rated competitive coding round on CodeChef across Div 1, Div 2, Div 3, and Div 4.`,
        tags: ["CodeChef", "Competitive Programming", "Starters"],
        isReminderSet: false,
      };
    });
  } catch (err) {
    console.warn("[ContestService] CodeChef fetch warning:", err.message);
    return [];
  }
}





export function getGeeksforGeeksContests() {
  const events = [];
  const now = new Date();


  for (let i = 0; i < 28; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 19, 0, 0);
    if (d.getDay() === 0) {

      events.push({
        id: `gfg-weekly-${toDateKey(d)}`,
        title: `GFG Weekly Coding Contest`,
        organizer: "GeeksforGeeks",
        type: "Contest",
        date: toDateKey(d),
        time: "07:00 PM IST (1.5 hrs)",
        link: "https://practice.geeksforgeeks.org/events/rec/gfg-weekly-coding-contest",
        status: "Upcoming",
        description:
          "3 DSA challenges rated for GeeksforGeeks overall leaderboard. Helps prepare for technical interviews.",
        tags: ["GeeksforGeeks", "DSA", "Rated", "Weekly"],
        isReminderSet: false,
      });
      if (events.length >= 3) break;
    }
  }

  return events;
}





function stripHtmlTags(input) {
  if (!input || typeof input !== "string") return "";
  let previous;
  let sanitized = input;
  do {
    previous = sanitized;
    sanitized = sanitized.replace(/<[^>]*>/g, "");
  } while (sanitized !== previous);
  return sanitized.trim();
}




export async function fetchDevpostHackathons() {
  try {
    const res = await fetch("https://devpost.com/api/hackathons", {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return [];

    const json = await res.json();
    const hackathons = Array.isArray(json.hackathons) ? json.hackathons : [];

    return hackathons.map((h) => {

      const rawPrize = stripHtmlTags(h.prize_amount);
      const themes = Array.isArray(h.themes) ? h.themes.map((t) => t.name) : ["Hackathon"];
      const location = h.displayed_location?.location || "Online";


      let eventDate = toDateKey(new Date());
      if (h.submission_period_dates) {

        const parts = h.submission_period_dates.split("-");
        const endDateStr = parts[parts.length - 1]?.trim();
        if (endDateStr) {
          const parsed = new Date(endDateStr);
          if (!isNaN(parsed.getTime())) {
            eventDate = toDateKey(parsed);
          }
        }
      }

      return {
        id: `devpost-${h.id}`,
        title: h.title,
        organizer: h.organization_name || "Devpost",
        type: "Hackathon",
        date: eventDate,
        time: h.time_left_to_submission ? `${h.time_left_to_submission} (Deadline)` : "All Day",
        link: h.url || `https://devpost.com/challenges`,
        status: h.open_state === "open" ? "Upcoming" : "Upcoming",
        description: `Devpost Hackathon with ${rawPrize ? `${rawPrize} in prizes` : "prizes"} · Location: ${location} · ${h.submission_period_dates || ""}`,
        tags: ["Hackathon", ...themes.slice(0, 3)],
        isReminderSet: false,
      };
    });
  } catch (err) {
    console.warn("[ContestService] Devpost hackathon fetch warning:", err.message);
    return [];
  }
}




export async function getAllRealContests(options = { force: false }) {
  const now = Date.now();
  if (!options.force && cachedContests && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedContests;
  }


  const [cf, lc, cc, devpost] = await Promise.all([
    fetchCodeforcesContests().catch(() => []),
    fetchLeetCodeContests().catch(() => []),
    fetchCodeChefContests().catch(() => []),
    fetchDevpostHackathons().catch(() => []),
  ]);

  const gfg = getGeeksforGeeksContests();

  const combined = [...cf, ...lc, ...cc, ...devpost, ...gfg];


  combined.sort((a, b) => (a.date > b.date ? 1 : -1));

  cachedContests = combined;
  lastCacheTime = now;

  return combined;
}

