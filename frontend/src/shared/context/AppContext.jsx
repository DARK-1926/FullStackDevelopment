/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  initialApplications,
  initialCalendarEvents,
  initialDailyChallenge,
  initialGrowthStats,
  initialOpportunities,
  initialProfile,
} from "../data/sampleData.js";
import {
  checkSession,
  getStoredUser,
  getStoredToken,
  loginUser,
  logoutUser,
  registerUser,
  saveSession,
  submitGrowthLog,
} from "../services/authService.js";
import { fetchLiveCodeChefStats } from "../services/codechefService.js";
import { fetchLiveGfgStats } from "../services/gfgService.js";
import { fetchLiveLeetCodeStats, fetchDailyChallenge } from "../services/leetcodeService.js";
import { fetchLiveGitHubStats } from "../services/githubService.js";
import { fetchLiveCodeforcesStats } from "../services/codeforcesService.js";
import { fetchLiveContests } from "../services/contestClientService.js";
import { fetchOpportunities } from "../services/opportunityService.js";
import {
  fetchApplications,
  createRemoteApplication,
  updateRemoteApplication,
  deleteRemoteApplication,
} from "../services/applicationService.js";

const STORAGE_KEYS = {
  PROFILE: "opportunity_os_profile_v1",
  OPPORTUNITIES: "opportunity_os_opportunities_v1",
  SAVED_IDS: "opportunity_os_saved_ids_v1",
  APPLICATIONS: "opportunity_os_applications_v1",
  GROWTH: "opportunity_os_growth_v1",
  CALENDAR: "opportunity_os_calendar_nov_test_v3",
  DAILY_CHALLENGE: "opportunity_os_daily_challenge_v2",
};

function loadFromStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
  } catch (err) {
    console.warn(`Failed to read ${key} from localStorage:`, err);
  }
  return fallback;
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to write ${key} to localStorage:`, err);
  }
}

const AppContext = createContext(undefined);


function calculateStreakStatus(lastActiveDate, currentStreak) {
  try {
    if (!lastActiveDate) {
      return { streakAtRisk: true, daysInactive: 1, isBroken: false };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last = new Date(lastActiveDate);
    last.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - last.getTime();
    const daysInactive = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (daysInactive === 0) {

      return { streakAtRisk: false, daysInactive: 0, isBroken: false };
    } else if (daysInactive === 1) {

      return { streakAtRisk: true, daysInactive: 1, isBroken: false };
    } else {

      return { streakAtRisk: true, daysInactive, isBroken: currentStreak > 0 };
    }
  } catch (err) {
    console.error("Error evaluating streak status:", err);
    return { streakAtRisk: true, daysInactive: 1, isBroken: false };
  }
}

function getPlatformSyncTime(data) {
  const timestamp = data?.syncedAt || data?.updatedAt;
  const parsed = timestamp ? new Date(timestamp) : new Date();
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return safeDate.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
}

function getPageFromUrl() {
  if (typeof window === "undefined") return "overview";
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (!path) return "overview";
  if (path === "settings") {
    window.history.replaceState({ page: "profile" }, "", "/profile");
    return "profile";
  }
  const validPages = ["overview", "career", "applications", "calendar", "profile", "auth"];
  return validPages.includes(path) ? path : "404";
}

export function AppProvider({ children }) {
  const [activePage, setActivePageState] = useState(() => getPageFromUrl());

  const setActivePage = (page) => {
    setActivePageState(page);
    try {
      if (typeof window !== "undefined") {
        const targetUrl = page === "overview" ? "/" : `/${page}`;
        if (window.location.pathname !== targetUrl) {
          window.history.pushState({ page }, "", targetUrl);
        }
      }
    } catch (e) {
      console.warn("Failed to update history state:", e);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActivePageState(getPageFromUrl());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);


  const [user, setUser] = useState(() => getStoredUser());
  const syncAllPlatformsRef = useRef(null);
  const [authReturnPage, setAuthReturnPage] = useState("overview");
  const openAuthPage = () => {
    setAuthReturnPage(activePage === "auth" ? "overview" : activePage);
    setActivePage("auth");
  };
  const closeAuthPage = () => setActivePage(authReturnPage);

  const [profile, setProfile] = useState(() => {
    const stored = getStoredUser();
    if (stored) {
      return {
        name: stored.name || initialProfile.name,
        email: stored.email || initialProfile.email,
        university: stored.university || initialProfile.university,
        degree: stored.degree || initialProfile.degree,
        gradYear: stored.gradYear || initialProfile.gradYear,
        targetRoles: stored.targetRoles || initialProfile.targetRoles,
        skills: stored.skills || initialProfile.skills,
        resumeSummary: stored.resumeSummary || initialProfile.resumeSummary,
        platformHandles: stored.platformHandles || initialProfile.platformHandles,
        profileImage: stored.profileImage || "",
      };
    }
    return loadFromStorage(STORAGE_KEYS.PROFILE, initialProfile);
  });

  const [opportunities, setOpportunities] = useState(() =>
    loadFromStorage(STORAGE_KEYS.OPPORTUNITIES, initialOpportunities),
  );

  const [savedOpportunityIds, setSavedOpportunityIds] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SAVED_IDS, ["stripe-swe-intern", "cred-frontend-intern", "google-swe-intern"]),
  );

  const [applications, setApplications] = useState(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.APPLICATIONS, initialApplications);
    return Array.isArray(loaded)
      ? loaded.map((app) => ({ ...app, id: String(app.id || app._id) }))
      : initialApplications;
  });

  const [isContestsLoading, setIsContestsLoading] = useState(false);
  const [isOpportunitiesLoading, setIsOpportunitiesLoading] = useState(false);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState(false);

  const [growthStats, setGrowthStats] = useState(() => {
    try {
      const loaded = loadFromStorage(STORAGE_KEYS.GROWTH, initialGrowthStats);


      const legacyStaticNotes = [
        "Solved Binary Tree Maximum Path Sum and 2 medium tree traversals.",
        "Participated in Round 980 Div 3, upsolved problem D.",
        "Dynamic Programming knapsack practice.",
      ];
      const cleanedLogs = (loaded.recentLogs || []).filter(
        (log) => !legacyStaticNotes.includes(log.notes)
      );


      const latestActivityDate = loaded.monthlyActivity?.length
        ? loaded.monthlyActivity[loaded.monthlyActivity.length - 1]?.date
        : null;
      const todayStr = new Date().toISOString().split("T")[0];
      const isOutdated = !latestActivityDate || latestActivityDate < todayStr;
      const activityToUse = isOutdated ? initialGrowthStats.monthlyActivity : loaded.monthlyActivity;
      const lastActive = isOutdated ? initialGrowthStats.lastActiveDate : loaded.lastActiveDate;
      const freshStatus = calculateStreakStatus(lastActive, loaded.currentStreak);

      return {
        ...loaded,
        lastActiveDate: lastActive,
        monthlyActivity: activityToUse,
        annualActivity: loaded.annualActivity || initialGrowthStats.annualActivity,
        recentLogs: cleanedLogs.length > 0 ? cleanedLogs : initialGrowthStats.recentLogs,
        codechef: loaded.codechef || initialGrowthStats.codechef,
        gfg: loaded.gfg || initialGrowthStats.gfg,
        streakAtRisk: freshStatus.streakAtRisk,
        streakBroken: freshStatus.isBroken,
        streakFreezesAvailable: loaded.streakFreezesAvailable ?? 2,
      };
    } catch (err) {
      console.error("Failed to initialize growth stats:", err);
      return initialGrowthStats;
    }
  });

  const [calendarEvents, setCalendarEvents] = useState(() =>
    loadFromStorage(STORAGE_KEYS.CALENDAR, initialCalendarEvents),
  );

  const [dailyChallenge, setDailyChallenge] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.DAILY_CHALLENGE, initialDailyChallenge);
    if (!stored || stored.title === "Minimum Operations to Reduce X to Zero") {
      return initialDailyChallenge;
    }
    return stored;
  });

  const [selectedOpportunityForAnalysis, setSelectedOpportunityForAnalysis] =
    useState(null);



  const refreshLiveContests = async (force = false) => {
    setIsContestsLoading(true);
    try {
      const res = await fetchLiveContests({ force });
      if (res.success && Array.isArray(res.contests) && res.contests.length > 0) {
        setCalendarEvents(res.contests);
      }
    } catch (err) {
      console.warn("Failed to fetch live contests:", err);
    } finally {
      setIsContestsLoading(false);
    }
  };

  const refreshOpportunities = async (filters = {}) => {
    setIsOpportunitiesLoading(true);
    try {
      const res = await fetchOpportunities(filters);
      if (res.success && Array.isArray(res.opportunities) && res.opportunities.length > 0) {
        setOpportunities(res.opportunities);
      }
    } catch (err) {
      console.warn("Failed to fetch opportunities:", err);
    } finally {
      setIsOpportunitiesLoading(false);
    }
  };

  const refreshApplications = async () => {
    setIsApplicationsLoading(true);
    try {
      const res = await fetchApplications();
      if (res.success && Array.isArray(res.applications) && res.applications.length > 0) {
        setApplications(
          res.applications.map((app) => ({
            ...app,
            id: String(app.id || app._id),
          })),
        );
      }
    } catch (err) {
      console.warn("Failed to fetch applications:", err);
    } finally {
      setIsApplicationsLoading(false);
    }
  };

  const refreshDailyChallenge = async () => {
    try {
      const res = await fetchDailyChallenge();
      if (res?.success && res.data) {
        setDailyChallenge((prev) => {
          const isSameDay = prev?.date === res.data.date;
          return {
            ...res.data,
            completed: isSameDay ? Boolean(prev?.completed) : false,
          };
        });
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to fetch live daily challenge:", err);
    }
    return null;
  };

  useEffect(() => {

    try {
      localStorage.removeItem("opportunity_os_llm_api_key");
      localStorage.removeItem("opportunity_os_llm_provider");
    } catch (error) {
      console.warn("Could not clear legacy browser settings:", error);
    }

    checkSession().then((verifiedUser) => {
      if (verifiedUser) {
        setUser(verifiedUser);
        setProfile((prev) => ({
          ...prev,
          name: verifiedUser.name || prev.name,
          email: verifiedUser.email || prev.email,
          university: verifiedUser.university || prev.university,
          degree: verifiedUser.degree || prev.degree,
          gradYear: verifiedUser.gradYear || prev.gradYear,
          skills: verifiedUser.skills || prev.skills,
          platformHandles: verifiedUser.platformHandles || prev.platformHandles,
          profileImage: verifiedUser.profileImage ?? "",
        }));
      }
    });


    let cancelled = false;
    const loadInitialData = async () => {
      await Promise.resolve();
      if (!cancelled) {
        refreshLiveContests();
        refreshOpportunities();
        refreshApplications();
        refreshDailyChallenge();
      }
    };
    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    setUser(data.user);
    if (data.user) {
      setProfile((prev) => ({
        ...prev,
        name: data.user.name || prev.name,
        email: data.user.email || prev.email,
        university: data.user.university || prev.university,
        degree: data.user.degree || prev.degree,
        gradYear: data.user.gradYear || prev.gradYear,
        skills: data.user.skills || prev.skills,
        platformHandles: data.user.platformHandles || prev.platformHandles,
        profileImage: data.user.profileImage ?? "",
      }));
      refreshApplications();
    }
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    setUser(data.user);
    if (data.user) {
      setProfile((prev) => ({
        ...prev,
        name: data.user.name || prev.name,
        email: data.user.email || prev.email,
        university: data.user.university || prev.university,
        degree: data.user.degree || prev.degree,
        platformHandles: data.user.platformHandles || prev.platformHandles,
        profileImage: data.user.profileImage ?? "",
      }));
    }
    return data;
  };

  const logout = async () => {
    const logoutRequest = logoutUser();
    setUser(null);
    setActivePage("overview");
    await logoutRequest;
  };



  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROFILE, profile);
  }, [profile]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SAVED_IDS, savedOpportunityIds);
  }, [savedOpportunityIds]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.APPLICATIONS, applications);
  }, [applications]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GROWTH, growthStats);
  }, [growthStats]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CALENDAR, calendarEvents);
  }, [calendarEvents]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DAILY_CHALLENGE, dailyChallenge);
  }, [dailyChallenge]);


  const updateProfile = async (updated) => {
    const next = { ...profile, ...updated };
    const token = getStoredToken();

    if (token) {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(next),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile.");
      }

      setProfile((prev) => ({ ...prev, ...next, ...data.user }));
      setUser(data.user);
      saveSession(token, data.user);
      const handles = updated.platformHandles || data.user?.platformHandles;
      if (handles && Object.values(handles).some(Boolean)) {
        syncAllPlatformsRef.current?.(handles)?.catch(() => {});
      }
      return data.user;
    }

    setProfile(next);
    if (updated.platformHandles && Object.values(updated.platformHandles).some(Boolean)) {
      syncAllPlatformsRef.current?.(updated.platformHandles)?.catch(() => {});
    }
    return next;
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    setProfile((prev) => {
      if (prev.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return prev;
      return { ...prev, skills: [...prev.skills, trimmed] };
    });
  };

  const removeSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };


  const toggleSaveOpportunity = (id) => {
    setSavedOpportunityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };


  const addApplicationFromOpportunity = (opp) => {
    const oppId = opp.id || opp._id;
    setApplications((prev) => {
      if (prev.some((a) => a.opportunityId === oppId)) {
        return prev;
      }
      const newApp = {
        id: `app-${Date.now()}`,
        opportunityId: oppId,
        role: opp.title,
        company: opp.company,
        location: opp.location,
        status: "Applied",
        appliedDate: new Date().toISOString().split("T")[0],
        deadline: opp.deadline,
        notes: `Applied via ${opp.source || "OpportunityOS"}.`,
        sourceUrl: opp.sourceUrl,
      };
      createRemoteApplication(newApp).catch((err) => {
        console.warn("Offline application sync:", err);
      });
      return [newApp, ...prev];
    });
  };

  const createManualApplication = (appData) => {
    const newApp = {
      ...appData,
      id: `app-${Date.now()}`,
    };
    setApplications((prev) => [newApp, ...prev]);
    createRemoteApplication(newApp).catch((err) => {
      console.warn("Offline application sync:", err);
    });
  };

  const updateApplicationStatus = (id, status) => {
    if (!id || String(id) === "undefined") return;
    setApplications((prev) =>
      prev.map((app) => {
        const appId = String(app.id || app._id);
        return appId === String(id) ? { ...app, status, id: appId } : app;
      }),
    );
    updateRemoteApplication(id, { status }).catch((err) => {
      console.warn("Offline application status update:", err);
    });
  };

  const updateApplicationNotes = (id, notes) => {
    setApplications((prev) =>
      prev.map((app) =>
        String(app.id) === String(id) || String(app._id) === String(id) ? { ...app, notes } : app,
      ),
    );
    updateRemoteApplication(id, { notes }).catch((err) => {
      console.warn("Offline application notes update:", err);
    });
  };

  const deleteApplication = (id) => {
    setApplications((prev) =>
      prev.filter((app) => String(app.id) !== String(id) && String(app._id) !== String(id)),
    );
    deleteRemoteApplication(id).catch((err) => {
      console.warn("Offline application delete:", err);
    });
  };


  const logCodingActivity = (activityOrPlatform = {}, optionalCount = 1) => {
    let platform = "LeetCode";
    let problemsSolved = 1;
    let activityNotes = "";
    let problemDifficulty = "Medium";
    let activityCategory = "Algorithms";

    if (typeof activityOrPlatform === "object" && activityOrPlatform !== null) {
      platform = activityOrPlatform.platform || "LeetCode";
      problemsSolved = Number(activityOrPlatform.problemsSolved) || 1;
      activityNotes = activityOrPlatform.notes || "";
      problemDifficulty = activityOrPlatform.difficulty || "Medium";
      activityCategory = activityOrPlatform.category || "Algorithms";
    } else {
      platform = activityOrPlatform || "LeetCode";
      problemsSolved = Number(optionalCount) || 1;
    }


    submitGrowthLog({ platform, problemsSolved, notes: activityNotes }).catch((err) => {
      console.warn("Offline or unauthenticated; saving activity locally:", err);
    });

    const today = new Date().toISOString().split("T")[0];
    setGrowthStats((prev) => {
      const isFirstActivityToday = prev.streakAtRisk;
      const nextStreak = isFirstActivityToday ? prev.currentStreak + 1 : prev.currentStreak;
      const nextLongest = Math.max(nextStreak, prev.longestStreak);

      const updatedWeekly = [...(prev.weeklyActivity || initialGrowthStats.weeklyActivity)];
      const todayIndex = updatedWeekly.length - 1;
      if (todayIndex >= 0) {
        updatedWeekly[todayIndex] = {
          ...updatedWeekly[todayIndex],
          count: updatedWeekly[todayIndex].count + problemsSolved,
          completed: true,
        };
      }


      const activityByDate = new Map(
        (prev.monthlyActivity || initialGrowthStats.monthlyActivity).map((day) => [day.date, {
          count: Number(day.count) || 0,
          problemCount: Number(day.problemCount ?? day.count) || 0,
        }]),
      );
      const updatedMonthly = Array.from({ length: 28 }, (_, index) => {
        const date = new Date(`${today}T00:00:00.000Z`);
        date.setUTCDate(date.getUTCDate() - (27 - index));
        const dateKey = date.toISOString().slice(0, 10);
        const previousDay = activityByDate.get(dateKey) || { count: 0, problemCount: 0 };
        const isToday = dateKey === today;
        const count = previousDay.count + (isToday ? problemsSolved : 0);
        const problemCount = previousDay.problemCount + (isToday && platform !== "GitHub" ? problemsSolved : 0);
        const level = count >= 5 ? 3 : count >= 3 ? 2 : count >= 1 ? 1 : 0;
        return {
          date: dateKey,
          day: new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(date),
          count,
          problemCount,
          level,
        };
      });


      let updatedLeetCode = prev.leetcode;
      if (platform === "LeetCode") {
        const diffLower = (problemDifficulty || "medium").toLowerCase();
        const diffKey = ["easy", "medium", "hard"].includes(diffLower) ? diffLower : "medium";
        updatedLeetCode = {
          ...prev.leetcode,
          solved: (prev.leetcode?.solved || 0) + problemsSolved,
          [diffKey]: (prev.leetcode?.[diffKey] || 0) + problemsSolved,
        };
      }

      const updatedCodeforces =
        platform === "Codeforces"
          ? {
              ...prev.codeforces,
              solved: (prev.codeforces?.solved || 0) + problemsSolved,
            }
          : prev.codeforces;

      const updatedCodechef =
        platform === "CodeChef"
          ? {
              ...prev.codechef,
              solved: (prev.codechef?.solved || 0) + problemsSolved,
            }
          : prev.codechef;

      const updatedGfg =
        platform === "GeeksforGeeks" || platform === "GFG"
          ? {
              ...prev.gfg,
              solved: (prev.gfg?.solved || 0) + problemsSolved,
            }
          : prev.gfg;

      const updatedGithub =
        platform === "GitHub"
          ? {
              ...prev.github,
              contributions: (prev.github?.contributions || 0) + problemsSolved,
            }
          : prev.github;

      const difficultyTotals = {
        ...(prev.difficultyTotals ?? {
          easy: prev.leetcode?.easy || 0,
          medium: prev.leetcode?.medium || 0,
          hard: prev.leetcode?.hard || 0,
          unclassified: Math.max(0, (prev.totalProblemsSolved || 0) - (prev.leetcode?.solved || 0)),
        }),
      };
      if (platform !== "GitHub") {
        const diffLower = (problemDifficulty || "medium").toLowerCase();
        const diffKey = ["easy", "medium", "hard"].includes(diffLower) ? diffLower : "medium";
        difficultyTotals[diffKey] = (difficultyTotals[diffKey] || 0) + problemsSolved;
      }

      const newLog = {
        date: today,
        platform,
        problemsSolved,
        difficulty: problemDifficulty,
        category: activityCategory,
        notes: activityNotes || `Completed ${problemsSolved} items on ${platform}.`,
      };

      const updatedAutonomous = [...(prev.autonomousProjects || [])];
      if (platform === "GitHub" && activityNotes) {
        updatedAutonomous.unshift({
          id: `proj-${Date.now()}`,
          name: activityNotes.length > 40 ? activityNotes.slice(0, 37) + "..." : activityNotes,
          language: "JavaScript",
          commits: problemsSolved,
          date: today,
          status: "Completed",
          description: activityNotes,
        });
      }

      const updatedTodayCount = (prev.todayCompletedCount || 0) + problemsSolved;

      return {
        ...prev,
        currentStreak: nextStreak,
        longestStreak: nextLongest,
        lastActiveDate: today,
        streakAtRisk: false,
        streakBroken: false,
        todayCompletedCount: updatedTodayCount,
        totalProblemsSolved: (prev.totalProblemsSolved || 0) + (platform === "GitHub" ? 0 : problemsSolved),
        leetcode: updatedLeetCode,
        codeforces: updatedCodeforces,
        codechef: updatedCodechef,
        gfg: updatedGfg,
        github: updatedGithub,
        difficultyTotals,
        weeklyActivity: updatedWeekly,
        monthlyActivity: updatedMonthly,
        recentLogs: [newLog, ...(prev.recentLogs || [])].slice(0, 10),
        autonomousProjects: updatedAutonomous.slice(0, 10),
      };
    });
  };


  const setDailyGoal = (goal) => {
    try {
      const target = Math.max(1, parseInt(goal, 10) || 1);
      setGrowthStats((prev) => ({ ...prev, dailyGoal: target }));
    } catch (err) {
      console.error("Failed to update daily goal:", err);
    }
  };


  const useStreakFreeze = () => {
    try {
      setGrowthStats((prev) => {
        if ((prev.streakFreezesAvailable ?? 0) <= 0) return prev;
        const today = new Date().toISOString().split("T")[0];
        return {
          ...prev,
          lastActiveDate: today,
          streakAtRisk: false,
          streakBroken: false,
          streakFreezesAvailable: (prev.streakFreezesAvailable ?? 2) - 1,
        };
      });
    } catch (err) {
      console.error("Failed to use streak freeze:", err);
    }
  };

  // Helper to merge live platform submissions and activity events into rolling monthlyActivity
function mergeLiveEventsIntoMonthlyActivity(currentMonthly = [], incomingEvents = []) {
  const today = new Date().toISOString().split("T")[0];
  const activityByDate = new Map(
    (currentMonthly || []).map((day) => [day.date, {
      count: Number(day.count) || 0,
      problemCount: Number(day.problemCount ?? day.count) || 0,
    }]),
  );

  for (const event of incomingEvents) {
    if (!event || !event.date) continue;
    const dateKey = String(event.date).slice(0, 10);
    const count = Number(event.problemsSolved) || 1;
    const existing = activityByDate.get(dateKey) || { count: 0, problemCount: 0 };
    existing.count += count;
    if (event.platform !== "GitHub") {
      existing.problemCount += count;
    }
    activityByDate.set(dateKey, existing);
  }

  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(`${today}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - (29 - index));
    const dateKey = date.toISOString().slice(0, 10);
    const dayData = activityByDate.get(dateKey) || { count: 0, problemCount: 0 };
    const level = dayData.count >= 5 ? 3 : dayData.count >= 3 ? 2 : dayData.count >= 1 ? 1 : 0;
    return {
      date: dateKey,
      day: new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(date),
      count: dayData.count,
      problemCount: dayData.problemCount,
      level,
    };
  });
}

function mergeLiveEventsIntoAnnualActivity(currentAnnual = [], incomingEvents = []) {
  const today = new Date().toISOString().split("T")[0];
  const activityByDate = new Map(
    (currentAnnual || []).map((day) => [day.date, {
      count: Number(day.count) || 0,
      problemCount: Number(day.problemCount ?? day.count) || 0,
    }]),
  );

  for (const event of incomingEvents) {
    if (!event || !event.date) continue;
    const dateKey = String(event.date).slice(0, 10);
    const count = Number(event.problemsSolved) || 1;
    const existing = activityByDate.get(dateKey) || { count: 0, problemCount: 0 };
    existing.count += count;
    if (event.platform !== "GitHub") {
      existing.problemCount += count;
    }
    activityByDate.set(dateKey, existing);
  }

  return Array.from({ length: 365 }, (_, index) => {
    const date = new Date(`${today}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - (364 - index));
    const dateKey = date.toISOString().slice(0, 10);
    const dayData = activityByDate.get(dateKey) || { count: 0, problemCount: 0 };
    const level = dayData.count >= 5 ? 3 : dayData.count >= 3 ? 2 : dayData.count >= 1 ? 1 : 0;
    return {
      date: dateKey,
      day: new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(date),
      count: dayData.count,
      problemCount: dayData.problemCount,
      level,
    };
  });
}

// Rekindle broken streak
  const rekindleStreak = () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      setGrowthStats((prev) => ({
        ...prev,
        currentStreak: 1,
        streakBroken: false,
        streakAtRisk: false,
        lastActiveDate: today,
      }));
    } catch (err) {
      console.error("Failed to rekindle streak:", err);
    }
  };


  const syncCodeChefData = async (handleToUse, options = { force: true }) => {
    const handle = handleToUse || profile.platformHandles?.codechef;
    if (!handle) {
      return { success: false, error: "No CodeChef handle configured." };
    }

    setGrowthStats((prev) => ({
      ...prev,
      codechef: {
        ...(prev.codechef?.handle?.toLowerCase() === handle.toLowerCase() ? prev.codechef : {}),
        loading: true,
        error: null,
      },
    }));

    const result = await fetchLiveCodeChefStats(handle, options);

    if (result.success && result.data) {
      const live = result.data;
      setGrowthStats((prev) => {
        const currentCodeChef = prev.codechef?.handle?.toLowerCase() === handle.toLowerCase() ? prev.codechef : {};
        const prevSolved = currentCodeChef.solved ?? 0;
        const liveSolved = typeof live.problemsSolved === "number" ? live.problemsSolved : (currentCodeChef.solved ?? null);
        const diffSolved = liveSolved == null ? 0 : liveSolved - prevSolved;
        const isFirstSync = !currentCodeChef.solved;
        const incrementalDaily = isFirstSync ? 1 : Math.min(Math.max(0, diffSolved), 5);


        const currentLogs = prev.recentLogs || [];
        const ccLog = {
          date: new Date().toISOString().split("T")[0],
          platform: "CodeChef",
          problemsSolved: incrementalDaily,
          difficulty: live.division || "Medium",
          category: "Contest Division",
            notes: `Synced CodeChef rating ${live.rating ?? "—"} (${live.stars || "—"}, ${live.division || "—"})`,
        };
        const incomingLogs = diffSolved <= 0 || currentLogs.some((l) => l.notes === ccLog.notes && l.date === ccLog.date)
          ? []
          : [ccLog];

        const updatedMonthly = mergeLiveEventsIntoMonthlyActivity(prev.monthlyActivity, incomingLogs);
        const updatedAnnual = mergeLiveEventsIntoAnnualActivity(prev.annualActivity || initialGrowthStats.annualActivity, incomingLogs);
        const nextSolved = typeof live.problemsSolved === "number" ? live.problemsSolved : (currentCodeChef.solved ?? 0);
        const totalSolved =
          (Number(prev.leetcode?.solved) || 0) +
          (Number(prev.codeforces?.solved) || 0) +
          (Number(nextSolved) || 0) +
          (Number(prev.geeksforgeeks?.solved || prev.gfg?.solved) || 0);

        return {
          ...prev,
          totalProblemsSolved: totalSolved,
          monthlyActivity: updatedMonthly,
          annualActivity: updatedAnnual,
          codechef: {
            ...currentCodeChef,
            handle: live.handle || handle,
            rating: typeof live.rating === "number" ? live.rating : (currentCodeChef.rating ?? null),
            highestRating: typeof live.highestRating === "number" ? live.highestRating : (currentCodeChef.highestRating ?? null),
            stars: live.stars ?? currentCodeChef.stars ?? null,
            starsCount: typeof live.starsCount === "number" ? live.starsCount : (currentCodeChef.starsCount ?? null),
            division: live.division || currentCodeChef.division || null,
            globalRank: live.globalRank ?? currentCodeChef.globalRank ?? null,
            countryRank: live.countryRank ?? currentCodeChef.countryRank ?? null,
            solved: liveSolved,
            name: live.name || currentCodeChef.name,
            lastSynced: getPlatformSyncTime(live),
            loading: false,
            error: null,
          },
          recentLogs: [...incomingLogs, ...currentLogs].slice(0, 20),
        };
      });
      return { success: true, data: result.data };
    } else {
      setGrowthStats((prev) => ({
        ...prev,
        codechef: {
          ...(prev.codechef?.handle?.toLowerCase() === handle.toLowerCase() ? prev.codechef : {}),
          loading: false,
          error: result.error || "Failed to sync CodeChef statistics.",
        },
      }));
      return { success: false, error: result.error };
    }
  };


  const syncGfgData = async (handleToUse, options = { force: true }) => {
    const handle = handleToUse || profile.platformHandles?.gfg || profile.platformHandles?.geeksforgeeks;
    if (!handle) {
      return { success: false, error: "No GeeksforGeeks handle configured." };
    }

    setGrowthStats((prev) => {
      const currentGfg = prev.geeksforgeeks || prev.gfg || initialGrowthStats.gfg;
      const matchedGfg = currentGfg?.handle?.toLowerCase() === handle.toLowerCase() ? currentGfg : {};
      const loadingState = {
        ...matchedGfg,
        loading: true,
        error: null,
      };
      return {
        ...prev,
        gfg: loadingState,
        geeksforgeeks: loadingState,
      };
    });

    const result = await fetchLiveGfgStats(handle, options);

    if (result.success && result.data) {
      const live = result.data;
      setGrowthStats((prev) => {
        const storedGfg = prev.geeksforgeeks || prev.gfg;
        const currentGfg = storedGfg?.handle?.toLowerCase() === handle.toLowerCase() ? storedGfg : {};
        const liveSolved = typeof live.problemsSolved === "number" ? live.problemsSolved : (currentGfg.solved ?? null);
        const updatedGfg = {
          ...currentGfg,
          handle: live.handle || handle,
          score: typeof live.score === "number" ? live.score : (currentGfg.score ?? null),
          monthlyScore: typeof live.monthlyScore === "number" ? live.monthlyScore : (currentGfg.monthlyScore ?? null),
          solved: liveSolved,
          instituteRank: live.instituteRank ?? currentGfg.instituteRank ?? null,
          instituteName: live.instituteName || currentGfg.instituteName || null,
          currentStreak: typeof live.currentStreak === "number" ? live.currentStreak : (currentGfg.currentStreak ?? null),
          longestStreak: typeof live.longestStreak === "number" ? live.longestStreak : (currentGfg.longestStreak ?? null),
          easy: live.difficultyBreakdown?.easy ?? currentGfg.easy ?? null,
          medium: live.difficultyBreakdown?.medium ?? currentGfg.medium ?? null,
          hard: live.difficultyBreakdown?.hard ?? currentGfg.hard ?? null,
          recentSubmissions: live.recentSubmissions || currentGfg.recentSubmissions,
          lastSynced: getPlatformSyncTime(live),
          loading: false,
          error: null,
        };


        const currentLogs = prev.recentLogs || [];
        const incomingLogs = (live.recentSubmissions || []).slice(0, 5).map((pTitle) => ({
          date: new Date().toISOString().split("T")[0],
          platform: "GeeksforGeeks",
          problemsSolved: 1,
          difficulty: "Medium",
          category: "Practice Problem",
          notes: `Solved "${pTitle}" on GeeksforGeeks`,
        })).filter((inc) => {
          return !currentLogs.some((exist) => exist.notes === inc.notes && exist.date === inc.date);
        });

        const updatedMonthly = mergeLiveEventsIntoMonthlyActivity(prev.monthlyActivity, incomingLogs);
        const updatedAnnual = mergeLiveEventsIntoAnnualActivity(prev.annualActivity || initialGrowthStats.annualActivity, incomingLogs);
        const nextSolved = typeof live.problemsSolved === "number" ? live.problemsSolved : (currentGfg.solved ?? 0);
        const totalSolved =
          (Number(prev.leetcode?.solved) || 0) +
          (Number(prev.codeforces?.solved) || 0) +
          (Number(prev.codechef?.solved) || 0) +
          (Number(nextSolved) || 0);

        return {
          ...prev,
          totalProblemsSolved: totalSolved,
          monthlyActivity: updatedMonthly,
          annualActivity: updatedAnnual,
          gfg: updatedGfg,
          geeksforgeeks: updatedGfg,
          recentLogs: [...incomingLogs, ...currentLogs].slice(0, 20),
        };
      });
      return { success: true, data: result.data };
    } else {
      setGrowthStats((prev) => {
        const storedGfg = prev.geeksforgeeks || prev.gfg;
        const currentGfg = storedGfg?.handle?.toLowerCase() === handle.toLowerCase() ? storedGfg : {};
        const errorState = {
          ...currentGfg,
          loading: false,
          error: result.error || "Failed to sync GeeksforGeeks statistics.",
        };
        return {
          ...prev,
          gfg: errorState,
          geeksforgeeks: errorState,
        };
      });
      return { success: false, error: result.error };
    }
  };


  const syncLeetCodeData = async (handleToUse, options = { force: true }) => {
    const handle = handleToUse || profile.platformHandles?.leetcode;
    if (!handle) {
      return { success: false, error: "No LeetCode handle configured." };
    }

    setGrowthStats((prev) => ({
      ...prev,
      leetcode: {
        ...(prev.leetcode?.handle?.toLowerCase() === handle.toLowerCase() ? prev.leetcode : {}),
        loading: true,
        error: null,
      },
    }));

    const result = await fetchLiveLeetCodeStats(handle, options);

    if (result.success && result.data) {
      const live = result.data;
      setGrowthStats((prev) => {
        const currentLC = prev.leetcode?.handle?.toLowerCase() === handle.toLowerCase() ? prev.leetcode : {};
        const liveSolved = typeof live.solved === "number" ? live.solved : (currentLC.solved ?? 0);

        const updatedLC = {
          ...currentLC,
          handle: live.handle || handle,
          solved: liveSolved,
          easy: typeof live.easy === "number" ? live.easy : (currentLC.easy ?? null),
          medium: typeof live.medium === "number" ? live.medium : (currentLC.medium ?? null),
          hard: typeof live.hard === "number" ? live.hard : (currentLC.hard ?? null),
          ranking: live.ranking ?? currentLC.ranking ?? null,
          name: live.name || currentLC.name,
          avatar: live.avatar || currentLC.avatar,
          contestRating: live.contestRating ?? currentLC.contestRating,
          contestRank: live.contestRank ?? currentLC.contestRank,
          contestBadge: live.contestBadge ?? currentLC.contestBadge,
          lastSynced: getPlatformSyncTime(live),
          loading: false,
          error: null,
        };


        const currentLogs = prev.recentLogs || [];
        const incomingLogs = (live.recentSubmissions || []).filter((inc) => {
          return !currentLogs.some((exist) => exist.notes === inc.notes && exist.date === inc.date);
        });

        const updatedMonthly = mergeLiveEventsIntoMonthlyActivity(prev.monthlyActivity, live.recentSubmissions || []);
        const updatedAnnual = mergeLiveEventsIntoAnnualActivity(prev.annualActivity || initialGrowthStats.annualActivity, live.recentSubmissions || []);
        const totalSolved =
          (Number(liveSolved) || 0) +
          (Number(prev.codeforces?.solved) || 0) +
          (Number(prev.codechef?.solved) || 0) +
          (Number(prev.geeksforgeeks?.solved || prev.gfg?.solved) || 0);

        return {
          ...prev,
          totalProblemsSolved: totalSolved,
          monthlyActivity: updatedMonthly,
          annualActivity: updatedAnnual,
          leetcode: updatedLC,
          recentLogs: [...incomingLogs, ...currentLogs].slice(0, 15),
        };
      });
      return { success: true, data: result.data };
    } else {
      setGrowthStats((prev) => ({
        ...prev,
        leetcode: {
          ...(prev.leetcode?.handle?.toLowerCase() === handle.toLowerCase() ? prev.leetcode : {}),
          loading: false,
          error: result.error || "Failed to sync LeetCode statistics.",
        },
      }));
      return { success: false, error: result.error };
    }
  };


  const syncGitHubData = async (handleToUse, options = { force: true }) => {
    const handle = handleToUse || profile.platformHandles?.github;
    if (!handle) {
      return { success: false, error: "No GitHub handle configured." };
    }

    setGrowthStats((prev) => ({
      ...prev,
      github: {
        ...(prev.github?.handle?.toLowerCase() === handle.toLowerCase() ? prev.github : {}),
        loading: true,
        error: null,
      },
    }));

    const result = await fetchLiveGitHubStats(handle, options);

    if (result.success && result.data) {
      const live = result.data;
      setGrowthStats((prev) => {
        const currentGH = prev.github?.handle?.toLowerCase() === handle.toLowerCase() ? prev.github : {};
        const updatedGH = {
          ...currentGH,
          handle: live.handle || handle,
          contributions: typeof live.contributions === "number" ? live.contributions : (currentGH.contributions ?? null),
          repos: typeof live.repos === "number" ? live.repos : (currentGH.repos ?? null),
          streak: typeof live.streak === "number" ? live.streak : (currentGH.streak ?? null),
          longestStreak: typeof live.longestStreak === "number" ? live.longestStreak : (currentGH.longestStreak ?? null),
          followers: live.followers ?? currentGH.followers ?? null,
          name: live.name || currentGH.name,
          avatar: live.avatar || currentGH.avatar,
          bio: live.bio || currentGH.bio,
          lastSynced: getPlatformSyncTime(live),
          loading: false,
          error: null,
        };


        const currentLogs = prev.recentLogs || [];
        const incomingLogs = (live.recentEvents || []).filter((inc) => {
          return !currentLogs.some((exist) => exist.notes === inc.notes && exist.date === inc.date);
        });

        const updatedMonthly = mergeLiveEventsIntoMonthlyActivity(prev.monthlyActivity, incomingLogs);
        const updatedAnnual = mergeLiveEventsIntoAnnualActivity(prev.annualActivity || initialGrowthStats.annualActivity, incomingLogs);

        return {
          ...prev,
          monthlyActivity: updatedMonthly,
          annualActivity: updatedAnnual,
          github: updatedGH,
          recentLogs: [...incomingLogs, ...currentLogs].slice(0, 15),
        };
      });
      return { success: true, data: result.data };
    } else {
      setGrowthStats((prev) => ({
        ...prev,
        github: {
          ...(prev.github?.handle?.toLowerCase() === handle.toLowerCase() ? prev.github : {}),
          loading: false,
          error: result.error || "Failed to sync GitHub statistics.",
        },
      }));
      return { success: false, error: result.error };
    }
  };


  const syncCodeforcesData = async (handleToUse, options = { force: true }) => {
    const handle = handleToUse || profile.platformHandles?.codeforces;
    if (!handle) {
      return { success: false, error: "No Codeforces handle configured." };
    }

    setGrowthStats((prev) => ({
      ...prev,
      codeforces: {
        ...(prev.codeforces?.handle?.toLowerCase() === handle.toLowerCase() ? prev.codeforces : {}),
        loading: true,
        error: null,
      },
    }));

    const result = await fetchLiveCodeforcesStats(handle, options);

    if (result.success && result.data) {
      const live = result.data;
      setGrowthStats((prev) => {
        const currentCF = prev.codeforces?.handle?.toLowerCase() === handle.toLowerCase() ? prev.codeforces : {};
        const liveSolved = typeof live.solved === "number" ? live.solved : (currentCF.solved ?? 0);

        const updatedCF = {
          ...currentCF,
          handle: live.handle || handle,
          rating: typeof live.rating === "number" ? live.rating : (currentCF.rating ?? 0),
          maxRating: typeof live.maxRating === "number" ? live.maxRating : (currentCF.maxRating ?? 0),
          rank: live.rank || currentCF.rank,
          maxRank: live.maxRank || currentCF.maxRank,
          solved: liveSolved,
          avatar: live.avatar || currentCF.avatar,
          lastSynced: getPlatformSyncTime(live),
          loading: false,
          error: null,
        };

        const currentLogs = prev.recentLogs || [];
        const incomingLogs = (live.recentSubmissions || []).filter((inc) => {
          return !currentLogs.some((exist) => exist.notes === inc.notes && exist.date === inc.date);
        });

        const updatedMonthly = mergeLiveEventsIntoMonthlyActivity(prev.monthlyActivity, live.recentSubmissions || []);
        const updatedAnnual = mergeLiveEventsIntoAnnualActivity(prev.annualActivity || initialGrowthStats.annualActivity, live.recentSubmissions || []);
        const totalSolved =
          (Number(prev.leetcode?.solved) || 0) +
          (Number(liveSolved) || 0) +
          (Number(prev.codechef?.solved) || 0) +
          (Number(prev.geeksforgeeks?.solved || prev.gfg?.solved) || 0);

        return {
          ...prev,
          totalProblemsSolved: totalSolved,
          monthlyActivity: updatedMonthly,
          annualActivity: updatedAnnual,
          codeforces: updatedCF,
          recentLogs: [...incomingLogs, ...currentLogs].slice(0, 15),
        };
      });
      return { success: true, data: result.data };
    } else {
      setGrowthStats((prev) => ({
        ...prev,
        codeforces: {
          ...(prev.codeforces?.handle?.toLowerCase() === handle.toLowerCase() ? prev.codeforces : {}),
          loading: false,
          error: result.error || "Failed to sync Codeforces statistics.",
        },
      }));
      return { success: false, error: result.error };
    }
  };

  const syncAllPlatforms = async (handlesToUse = null) => {
    refreshDailyChallenge().catch(() => {});
    const handles = handlesToUse || profile.platformHandles || {};
    const results = [];
    if (handles.leetcode) {
      results.push(await syncLeetCodeData(handles.leetcode, { force: false }));
      await new Promise((r) => setTimeout(r, 250));
    }
    if (handles.codeforces) {
      results.push(await syncCodeforcesData(handles.codeforces, { force: false }));
      await new Promise((r) => setTimeout(r, 250));
    }
    if (handles.codechef) {
      results.push(await syncCodeChefData(handles.codechef, { force: false }));
      await new Promise((r) => setTimeout(r, 250));
    }
    if (handles.gfg || handles.geeksforgeeks) {
      results.push(await syncGfgData(handles.gfg || handles.geeksforgeeks, { force: false }));
      await new Promise((r) => setTimeout(r, 250));
    }
    if (handles.github) {
      results.push(await syncGitHubData(handles.github, { force: false }));
    }
    return results;
  };
  useEffect(() => {
    syncAllPlatformsRef.current = syncAllPlatforms;
  });


  const toggleCalendarReminder = (id) => {
    setCalendarEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, isReminderSet: !event.isReminderSet } : event,
      ),
    );
  };

  const addCalendarEvent = (newEvent) => {
    setCalendarEvents((prev) => [newEvent, ...prev]);
  };


  const completeDailyChallenge = () => {
    if (dailyChallenge?.completed) return;
    setDailyChallenge((prev) => ({ ...prev, completed: true }));
    logCodingActivity({
      platform: dailyChallenge?.platform || "LeetCode",
      problemsSolved: 1,
      difficulty: dailyChallenge?.difficulty || "Medium",
      category: dailyChallenge?.category || "Algorithms & DSA",
      notes: `Solved Daily Challenge: ${dailyChallenge?.title || "LeetCode Problem"}`,
    });
  };


  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.OPPORTUNITIES);
    localStorage.removeItem(STORAGE_KEYS.SAVED_IDS);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.GROWTH);
    localStorage.removeItem(STORAGE_KEYS.CALENDAR);

    setProfile(initialProfile);
    setSavedOpportunityIds(["stripe-swe-intern", "cred-frontend-intern"]);
    setApplications(initialApplications);
    setGrowthStats(initialGrowthStats);
    setCalendarEvents(initialCalendarEvents);
    setSelectedOpportunityForAnalysis(null);
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        user,
        openAuthPage,
        closeAuthPage,
        login,
        register,
        logout,
        profile,
        updateProfile,
        addSkill,
        removeSkill,
        opportunities,
        savedOpportunityIds,
        toggleSaveOpportunity,
        selectedOpportunityForAnalysis,
        setSelectedOpportunityForAnalysis,
        applications,
        addApplicationFromOpportunity,
        createManualApplication,
        updateApplicationStatus,
        updateApplicationNotes,
        deleteApplication,
        growthStats,
        logCodingActivity,
        setDailyGoal,
        useStreakFreeze,
        rekindleStreak,
        syncCodeChefData,
        syncGfgData,
        syncLeetCodeData,
        syncGitHubData,
        syncCodeforcesData,
        syncAllPlatforms,
        dailyChallenge,
        refreshDailyChallenge,
        completeDailyChallenge,
        calendarEvents,
        isContestsLoading,
        isOpportunitiesLoading,
        isApplicationsLoading,
        refreshLiveContests,
        refreshOpportunities,
        refreshApplications,
        toggleCalendarReminder,
        addCalendarEvent,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
