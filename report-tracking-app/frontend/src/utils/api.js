// src/utils/api.js

// Helper to get the auth token from localStorage
export function getAuthToken() {
  return localStorage.getItem("token");
}

// Helper for authenticated fetch requests
export async function authFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Token ${token}` } : {}),
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  return fetch(url, { ...options, headers, credentials: 'include' });
}
