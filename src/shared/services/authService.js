/**
 * Authentication client for OpportunityOS
 * Communicates with the Express + MongoDB backend (or fallback store)
 */

export const TOKEN_STORAGE_KEY = "opportunity_os_auth_token";
export const USER_STORAGE_KEY = "opportunity_os_auth_user";

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error("Failed to save auth session:", err);
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear auth session:", err);
  }
}

export async function loginUser(email, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  saveSession(data.token, data.user);
  return data;
}

export async function registerUser({ name, email, password, university, degree, gradYear }) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, university, degree, gradYear }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  saveSession(data.token, data.user);
  return data;
}

export async function checkSession() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const response = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      clearSession();
      return null;
    }

    const data = await response.json();
    saveSession(token, data.user);
    return data.user;
  } catch {
    // If backend is momentarily unreachable, use stored user
    return getStoredUser();
  }
}

export async function logoutUser() {
  const token = getStoredToken();
  clearSession();
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // ignore
  }
}

