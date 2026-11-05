









export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("This browser does not support desktop notifications.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.warn("Could not request notification permission:", error);
      return false;
    }
  }

  return false;
}







export function parseEventStartTime(dateStr, timeStr) {
  if (!dateStr) return null;

  try {

    if (timeStr && typeof timeStr === "string") {
      const cleanTime = timeStr.replace(/\(.*?\)/g, "").replace(/IST/i, "").trim();
      const combined = `${dateStr} ${cleanTime}`;
      const parsed = new Date(combined);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }


    const fallback = new Date(`${dateStr}T09:00:00`);
    return isNaN(fallback.getTime()) ? null : fallback;
  } catch {
    return null;
  }
}






export function showDesktopNotification(title, options = {}) {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });

    if (options.url) {
      notification.onclick = () => {
        try {
          window.focus();
          window.open(options.url, "_blank");
        } catch (error) {
          console.warn("Could not open the notification link:", error);
        }
      };
    }

    return notification;
  } catch (error) {
    console.warn("Could not display desktop notification:", error);
    return null;
  }
}




const activeTimers = new Map();






export function scheduleContestReminder(event) {
  if (!event || !event.id) return;


  if (activeTimers.has(event.id)) {
    clearTimeout(activeTimers.get(event.id));
    activeTimers.delete(event.id);
  }

  const startTime = parseEventStartTime(event.date, event.time);
  if (!startTime) return;

  const now = Date.now();

  const alertTime = startTime.getTime() - 15 * 60 * 1000;
  const delay = alertTime - now;


  showDesktopNotification(`Reminder Set: ${event.title}`, {
    body: `${event.organizer} contest scheduled for ${event.date} at ${event.time}. We will alert you 15 minutes before it starts!`,
    tag: `confirm-${event.id}`,
    url: event.link,
  });

  if (delay > 0) {
    const timerId = setTimeout(() => {
      showDesktopNotification(`Starting Soon: ${event.title}`, {
        body: `The ${event.organizer} challenge begins in 15 minutes (${event.time}). Click to open arena!`,
        tag: `alert-${event.id}`,
        url: event.link,
      });
      activeTimers.delete(event.id);
    }, delay);

    activeTimers.set(event.id, timerId);
  }
}





export function cancelContestReminder(eventId) {
  if (activeTimers.has(eventId)) {
    clearTimeout(activeTimers.get(eventId));
    activeTimers.delete(eventId);
  }
}

