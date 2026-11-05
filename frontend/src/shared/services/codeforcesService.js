const API_BASE = "/api/platforms/codeforces";




export async function fetchLiveCodeforcesStats(handle, options = {}) {
  if (!handle) {
    return { success: false, error: "Handle is required." };
  }

  const queryParams = options.force ? "?force=true" : "";
  const url = `${API_BASE}/${encodeURIComponent(handle)}${queryParams}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || `Failed to retrieve Codeforces profile (Status ${response.status}).` };
    }
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to reach Codeforces sync service.",
    };
  }
}

