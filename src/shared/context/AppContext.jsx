/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  initialApplications,
  initialCalendarEvents,
  initialGrowthStats,
  initialOpportunities,
  initialProfile,
} from "../data/sampleData.js";
import {
  checkSession,
  getStoredUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/authService.js";

const STORAGE_KEYS = {
  PROFILE: "opportunity_os_profile_v1",
  OPPORTUNITIES: "opportunity_os_opportunities_v1",
  SAVED_IDS: "opportunity_os_saved_ids_v1",
  APPLICATIONS: "opportunity_os_applications_v1",
  GROWTH: "opportunity_os_growth_v1",
  CALENDAR: "opportunity_os_calendar_v1",
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

export function AppProvider({ children }) {
  const [activePage, setActivePage] = useState("overview");

  // Authentication State
  const [user, setUser] = useState(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
      };
    }
    return loadFromStorage(STORAGE_KEYS.PROFILE, initialProfile);
  });

  const [opportunities] = useState(() =>
    loadFromStorage(STORAGE_KEYS.OPPORTUNITIES, initialOpportunities),
  );

  const [savedOpportunityIds, setSavedOpportunityIds] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SAVED_IDS, ["stripe-swe", "cred-frontend"]),
  );

  const [applications, setApplications] = useState(() =>
    loadFromStorage(STORAGE_KEYS.APPLICATIONS, initialApplications),
  );

  const [growthStats, setGrowthStats] = useState(() =>
    loadFromStorage(STORAGE_KEYS.GROWTH, initialGrowthStats),
  );

  const [calendarEvents, setCalendarEvents] = useState(() =>
    loadFromStorage(STORAGE_KEYS.CALENDAR, initialCalendarEvents),
  );

  const [selectedOpportunityForAnalysis, setSelectedOpportunityForAnalysis] =
    useState(null);


  // Check auth session on mount
  useEffect(() => {
    // Remove keys saved by earlier browser-side AI configuration.
    try {
      localStorage.removeItem("opportunity_os_llm_api_key");
      localStorage.removeItem("opportunity_os_llm_provider");
    } catch {
      // Storage may be unavailable in a restricted browser session.
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
        }));
      }
    });
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
      }));
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
      }));
    }
    return data;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };


  // Sync state changes with localStorage
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

  // Profile actions
  const updateProfile = (updated) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      // Also sync to backend if logged in
      const token = localStorage.getItem("opportunity_os_auth_token");
      if (token) {
        fetch("/api/user/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(next),
        }).catch((e) => console.warn("Failed to sync profile with server:", e));
      }
      return next;
    });
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

  // Opportunity actions
  const toggleSaveOpportunity = (id) => {
    setSavedOpportunityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Application tracker actions
  const addApplicationFromOpportunity = (opp) => {
    setApplications((prev) => {
      if (prev.some((a) => a.opportunityId === opp.id)) {
        return prev;
      }
      const newApp = {
        id: `app-${Date.now()}`,
        opportunityId: opp.id,
        role: opp.title,
        company: opp.company,
        location: opp.location,
        status: "Applied",
        appliedDate: new Date().toISOString().split("T")[0],
        deadline: opp.deadline,
        notes: `Applied via ${opp.source}.`,
        sourceUrl: opp.sourceUrl,
      };
      return [newApp, ...prev];
    });
  };

  const createManualApplication = (appData) => {
    const newApp = {
      ...appData,
      id: `app-${Date.now()}`,
    };
    setApplications((prev) => [newApp, ...prev]);
  };

  const updateApplicationStatus = (id, status) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app)),
    );
  };

  const updateApplicationNotes = (id, notes) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, notes } : app)),
    );
  };

  const deleteApplication = (id) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  // Developer Growth & Streak actions (Streak Module)
  const logCodingActivity = (platform, problemsSolved, notes) => {
    const today = new Date().toISOString().split("T")[0];
    setGrowthStats((prev) => {
      const isFirstActivityToday = prev.streakAtRisk;
      const nextStreak = isFirstActivityToday ? prev.currentStreak + 1 : prev.currentStreak;
      const nextLongest = Math.max(nextStreak, prev.longestStreak);

      const updatedWeekly = [...prev.weeklyActivity];
      const todayIndex = updatedWeekly.length - 1;
      if (todayIndex >= 0) {
        updatedWeekly[todayIndex] = {
          ...updatedWeekly[todayIndex],
          count: updatedWeekly[todayIndex].count + problemsSolved,
          completed: true,
        };
      }

      const updatedLeetCode =
        platform === "LeetCode"
          ? {
              ...prev.leetcode,
              solved: prev.leetcode.solved + problemsSolved,
              medium: prev.leetcode.medium + problemsSolved,
            }
          : prev.leetcode;

      const updatedCodeforces =
        platform === "Codeforces"
          ? {
              ...prev.codeforces,
              solved: prev.codeforces.solved + problemsSolved,
            }
          : prev.codeforces;

      const updatedGithub =
        platform === "GitHub"
          ? {
              ...prev.github,
              contributions: prev.github.contributions + problemsSolved,
            }
          : prev.github;

      const newLog = {
        date: today,
        platform,
        problemsSolved,
        notes: notes || `Completed ${problemsSolved} problems on ${platform}.`,
      };

      return {
        ...prev,
        currentStreak: nextStreak,
        longestStreak: nextLongest,
        lastActiveDate: today,
        streakAtRisk: false,
        totalProblemsSolved: prev.totalProblemsSolved + problemsSolved,
        leetcode: updatedLeetCode,
        codeforces: updatedCodeforces,
        github: updatedGithub,
        weeklyActivity: updatedWeekly,
        recentLogs: [newLog, ...prev.recentLogs].slice(0, 10),
      };
    });
  };

  // Calendar actions
  const toggleCalendarReminder = (id) => {
    setCalendarEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, isReminderSet: !event.isReminderSet } : event,
      ),
    );
  };

  // Reset to original seed data
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.OPPORTUNITIES);
    localStorage.removeItem(STORAGE_KEYS.SAVED_IDS);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.GROWTH);
    localStorage.removeItem(STORAGE_KEYS.CALENDAR);

    setProfile(initialProfile);
    setSavedOpportunityIds(["stripe-swe", "cred-frontend"]);
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
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
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
        calendarEvents,
        toggleCalendarReminder,
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
