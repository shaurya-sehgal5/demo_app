const API_BASE = '/api';

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function getStats() {
  return fetchJSON(`${API_BASE}/stats`);
}

export function getProjects() {
  return fetchJSON(`${API_BASE}/projects`);
}

export function getProject(id) {
  return fetchJSON(`${API_BASE}/projects/${id}`);
}

export function createProject(data) {
  return fetchJSON(`${API_BASE}/projects`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getTasks() {
  return fetchJSON(`${API_BASE}/tasks`);
}

export function updateTaskStatus(id, status) {
  return fetchJSON(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getActivity() {
  return fetchJSON(`${API_BASE}/activity`);
}