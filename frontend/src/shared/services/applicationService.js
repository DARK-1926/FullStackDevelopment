const API_BASE = import.meta.env.VITE_API_URL || "";

function getAuthHeaders() {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("opportunity_os_auth_token") : null;
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}




export async function fetchApplications() {
  const url = `${API_BASE}/api/applications`;
  try {
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, applications: [], error: data.error || "Failed to fetch applications." };
    }
    return { success: true, applications: data.applications || [], count: data.count };
  } catch (err) {
    return { success: false, applications: [], error: err.message };
  }
}




export async function createRemoteApplication(appData) {
  const url = `${API_BASE}/api/applications`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(appData),
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, application: null, error: data.error || "Failed to save application." };
    }
    return { success: true, application: data.application };
  } catch (err) {
    return { success: false, application: null, error: err.message };
  }
}




export async function updateRemoteApplication(id, updates) {
  const url = `${API_BASE}/api/applications/${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, application: null, error: data.error || "Failed to update application." };
    }
    return { success: true, application: data.application };
  } catch (err) {
    return { success: false, application: null, error: err.message };
  }
}




export async function deleteRemoteApplication(id) {
  const url = `${API_BASE}/api/applications/${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Failed to delete application." };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

