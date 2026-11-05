




export function normalizeDateKey(dateVal) {
  if (!dateVal) return "";
  if (typeof dateVal === "string") {

    if (dateVal.includes("T")) {
      return dateVal.split("T")[0];
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      return dateVal;
    }
    const parsed = new Date(dateVal);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return dateVal;
  }

  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const year = dateVal.getFullYear();
    const month = String(dateVal.getMonth() + 1).padStart(2, "0");
    const day = String(dateVal.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "";
}







export function formatMonthYear(year, month) {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
}








export function generateMonthGrid(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const todayStr = normalizeDateKey(new Date());
  const cells = [];


  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNumber);
    const dateKey = normalizeDateKey(prevDate);
    cells.push({
      dateKey,
      dayNumber,
      isCurrentMonth: false,
      isToday: dateKey === todayStr,
    });
  }


  for (let dayNumber = 1; dayNumber <= daysInCurrentMonth; dayNumber++) {
    const currDate = new Date(year, month, dayNumber);
    const dateKey = normalizeDateKey(currDate);
    cells.push({
      dateKey,
      dayNumber,
      isCurrentMonth: true,
      isToday: dateKey === todayStr,
    });
  }


  const remainingCells = 7 - (cells.length % 7);
  if (remainingCells < 7) {
    for (let dayNumber = 1; dayNumber <= remainingCells; dayNumber++) {
      const nextDate = new Date(year, month + 1, dayNumber);
      const dateKey = normalizeDateKey(nextDate);
      cells.push({
        dateKey,
        dayNumber,
        isCurrentMonth: false,
        isToday: dateKey === todayStr,
      });
    }
  }

  return cells;
}






export function formatSelectedDateHeading(dateKey) {
  if (!dateKey) return "SELECT A DATE";
  const [y, m, d] = dateKey.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  if (isNaN(dateObj.getTime())) return dateKey;

  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const monthName = dateObj.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  return `${weekday}, ${monthName} ${d}`;
}




export const EVENT_CATEGORY_CONFIG = {
  Contest: {
    label: "Coding Contest",
    dotColor: "#38bdf8",
    tagClass: "tag-contest",
    bgAlpha: "rgba(56, 189, 248, 0.14)",
    borderAlpha: "rgba(56, 189, 248, 0.35)",
  },
  Hackathon: {
    label: "Hackathon & Builders",
    dotColor: "#c084fc",
    tagClass: "tag-hackathon",
    bgAlpha: "rgba(192, 132, 252, 0.14)",
    borderAlpha: "rgba(192, 132, 252, 0.35)",
  },
  Workshop: {
    label: "Workshop / Masterclass",
    dotColor: "#34d399",
    tagClass: "tag-workshop",
    bgAlpha: "rgba(52, 211, 153, 0.14)",
    borderAlpha: "rgba(52, 211, 153, 0.35)",
  },
  Deadline: {
    label: "Application Deadline",
    dotColor: "#fbbf24",
    tagClass: "tag-deadline",
    bgAlpha: "rgba(251, 191, 36, 0.14)",
    borderAlpha: "rgba(251, 191, 36, 0.35)",
  },
  Default: {
    label: "Developer Event",
    dotColor: "#818cf8",
    tagClass: "tag-event",
    bgAlpha: "rgba(129, 140, 248, 0.14)",
    borderAlpha: "rgba(129, 140, 248, 0.35)",
  },
};

export function getEventCategoryMeta(type) {
  return EVENT_CATEGORY_CONFIG[type] || EVENT_CATEGORY_CONFIG.Default;
}









export function computeEventStatus(dateStr, timeStr = "", declaredStatus = "") {
  if (declaredStatus === "Past") return "Past";
  if (!dateStr) return declaredStatus || "Upcoming";

  const todayKey = normalizeDateKey(new Date());


  if (dateStr < todayKey) {
    return "Past";
  }


  if (dateStr > todayKey) {
    return "Upcoming";
  }


  if (timeStr) {
    try {
      const cleanTime = timeStr.replace(/\(.*?\)/g, "").replace(/IST/i, "").trim();
      const start = new Date(`${dateStr} ${cleanTime}`);
      if (!isNaN(start.getTime())) {
        const now = Date.now();

        const durMatch = timeStr.match(/\(([0-9.]+)\s*hrs?\)/i);
        const durationHours = durMatch ? parseFloat(durMatch[1]) : 2;
        const end = start.getTime() + durationHours * 3600 * 1000;

        if (now > end) return "Past";
        if (now >= start.getTime() && now <= end) return "Live";
        return "Upcoming";
      }
    } catch {
      return declaredStatus === "Live" ? "Live" : "Upcoming";
    }
  }

  return declaredStatus === "Live" ? "Live" : "Upcoming";
}


