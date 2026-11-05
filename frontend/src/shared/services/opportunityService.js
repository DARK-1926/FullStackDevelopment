const API_BASE = import.meta.env.VITE_API_URL || "";




export async function fetchOpportunities(filters = {}) {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== "All") params.append("type", filters.type);
  if (filters.locationType && filters.locationType !== "All") params.append("locationType", filters.locationType);
  if (filters.q) params.append("q", filters.q);

  const queryStr = params.toString() ? `?${params.toString()}` : "";
  const url = `${API_BASE}/api/opportunities${queryStr}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, opportunities: [], error: data.error || "Failed to fetch opportunities." };
    }
    return { success: true, opportunities: data.opportunities || [], count: data.count };
  } catch (err) {
    return { success: false, opportunities: [], error: err.message };
  }
}




export async function fetchOpportunityById(id) {
  const url = `${API_BASE}/api/opportunities/${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, opportunity: null, error: data.error || "Opportunity not found." };
    }
    return { success: true, opportunity: data.opportunity };
  } catch (err) {
    return { success: false, opportunity: null, error: err.message };
  }
}

