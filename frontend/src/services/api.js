/**
 * API Service for backend communication
 * In dev, use same-origin (Vite proxy) to avoid CORS and "Failed to fetch".
 */
export function getApiBaseUrl() {
  return import.meta.env.DEV
    ? ""
    : import.meta.env.VITE_API_URL || "http://localhost:8000";
}
const API_BASE_URL = getApiBaseUrl();

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {string} token - JWT authentication token
 * @param {object} options - Fetch options
 */
async function apiRequest(endpoint, token, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch user's GitHub repositories
 * @param {string} token - JWT authentication token
 */
export async function fetchRepos(token) {
  return apiRequest("/api/repos/", token);
}

/**
 * Fetch a single repository from GitHub by ID or owner/repo, import to DB, and return DB repo.
 * Use when the repo isn't in the user's list (e.g. pagination) or fetchRepos failed.
 * @param {string} token - JWT authentication token
 * @param {string} identifier - GitHub repo ID (numeric) or "owner/repo"
 */
export async function fetchRepoByIdentifier(token, identifier) {
  const encoded = encodeURIComponent(identifier);
  return apiRequest(`/api/repos/fetch/${encoded}`, token);
}

/**
 * Get current user info
 * @param {string} token - JWT authentication token
 */
export async function getCurrentUser(token) {
  return apiRequest("/api/auth/me", token);
}

/**
 * Import a repository to the database
 * @param {string} token - JWT authentication token
 * @param {object} repoData - GitHub repo data
 */
export async function importRepo(token, repoData) {
  return apiRequest("/api/repos/import", token, {
    method: "POST",
    body: JSON.stringify(repoData),
  });
}

/**
 * Generate README for a repository
 * @param {string} token - JWT authentication token
 * @param {string} repoId - Repository ID
 * @param {string} templateType - Template type (professional, minimalist, portfolio)
 */
export async function generateReadme(
  token,
  repoId,
  templateType = "professional",
) {
  return apiRequest("/api/generate/", token, {
    method: "POST",
    body: JSON.stringify({ repo_id: repoId, template_type: templateType }),
  });
}

/**
 * Get generation status
 * @param {string} token - JWT authentication token
 * @param {string} generationId - Generation ID
 */
export async function getGeneration(token, generationId) {
  return apiRequest(`/api/generate/${generationId}`, token);
}

/**
 * Refine text using AI
 * @param {string} token - JWT authentication token
 * @param {string} currentText - Text to refine
 * @param {string} instruction - User styling instruction
 * @param {string} context - Optional context
 */
export async function refineText(
  token,
  currentText,
  instruction,
  context = null,
) {
  return apiRequest("/api/generate/refine", token, {
    method: "POST",
    body: JSON.stringify({
      current_text: currentText,
      instruction: instruction,
      context: context,
    }),
  });
}

/**
 * Detect badges for a repository
 * @param {string} token - JWT authentication token
 * @param {string} repoId - Repository ID
 */
export async function detectBadges(token, repoId) {
  return apiRequest(`/api/generate/badges/${repoId}`, token);
}

/**
 * Audit README content
 * @param {string} token - JWT authentication token
 * @param {string} content - README content
 */
export async function auditReadme(token, content) {
  return apiRequest("/api/generate/audit", token, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export default {
  fetchRepos,
  fetchRepoByIdentifier,
  getCurrentUser,
  importRepo,
  generateReadme,
  getGeneration,

  refineText,
  detectBadges,
  auditReadme,
};
