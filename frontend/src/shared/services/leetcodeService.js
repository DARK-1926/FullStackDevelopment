



const API_BASE = import.meta.env.VITE_API_URL || "";







export async function fetchLiveLeetCodeStats(handle, options = {}) {
  const { force = false } = options;

  if (!handle || typeof handle !== "string" || !handle.trim()) {
    return {
      success: false,
      error: "Please enter a valid LeetCode handle.",
    };
  }

  const cleanHandle = handle.trim();
  const url = `${API_BASE}/api/platforms/leetcode/${encodeURIComponent(cleanHandle)}?force=${force}`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined,
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Failed to retrieve LeetCode profile (Status ${response.status}).`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return {
        success: false,
        error: "Request timed out while connecting to LeetCode. Please try again.",
      };
    }

    return {
      success: false,
      error: `Network request failed: ${err.message}. Ensure backend is running.`,
      fallback: true,
    };
  }
}
