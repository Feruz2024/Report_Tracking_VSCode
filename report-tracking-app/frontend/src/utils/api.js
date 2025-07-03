// Fetch station IDs already assigned for a campaign
export async function fetchAssignedStationIds(campaignId) {
  const response = await authFetch(`/api/assignments/assigned_stations/?campaign=${campaignId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch assigned stations");
  }
  return response.json();
}
// Toggle station active status
export async function toggleStationActive(stationId, isActive) {
  const response = await authFetch(`/api/stations/${stationId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: isActive }),
  });
  if (!response.ok) throw new Error("Failed to update station status");
  return response.json();
}
// Delete a user by ID
export async function deleteUser(userId) {
  const response = await authFetch(`/api/users/${userId}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
  return true;
}

// Toggle user active status
export async function toggleUserActive(userId, isActive) {
  const response = await authFetch(`/api/users/${userId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
  if (!response.ok) {
    throw new Error('Failed to update user status');
  }
  return response.json();
}
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

export async function fetchUsers() {
  const response = await authFetch("/api/users/");
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
}

export async function fetchMessages(params = {}) {
  // params can be an object like:
  // { context_id: 'campaign:1', user_messages: '123' } OR
  // { context_id: 'campaign:1', participants_filter: '123,456' }
  // { view_type: 'inbox' }
  const query = new URLSearchParams();
  if (params.context_id) query.append('context_id', params.context_id);
  if (params.user_messages) query.append('user_messages', params.user_messages);
  if (params.participants_filter) query.append('participants_filter', params.participants_filter);
  if (params.view_type) query.append('view_type', params.view_type);

  const response = await authFetch(`/api/messages/?${query.toString()}`);
  if (!response.ok) {
    const errorData = await response.text();
    console.error("Failed to fetch messages:", errorData);
    throw new Error(`Failed to fetch messages. Status: ${response.status}`);
  }
  return response.json();
}

export async function sendMessage(messageData) {
  // messageData should include { recipient_id, content, context_id }
  const response = await authFetch("/api/messages/", {
    method: "POST",
    body: JSON.stringify(messageData),
  });
  if (!response.ok) {
    const errorBody = await response.text(); 
    console.error("Send message error body:", errorBody);
    throw new Error("Failed to send message");
  }
  return response.json();
}

// ... any other existing API functions ...
