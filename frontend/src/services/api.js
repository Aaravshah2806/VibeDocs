/**
 * API Service for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {string} token - Clerk session token
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
 * @param {string} token - Clerk session token
 */
export async function fetchRepos(token) {
  return apiRequest("/api/repos/", token);
}

/**
 * Get current user info
 * @param {string} token - Clerk session token
 */
export async function getCurrentUser(token) {
  return apiRequest("/api/auth/me", token);
}

/**
 * Import a repository to the database
 * @param {string} token - Clerk session token
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
 * @param {string} token - Clerk session token
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
 * @param {string} token - Clerk session token
 * @param {string} generationId - Generation ID
 */
export async function getGeneration(token, generationId) {
  return apiRequest(`/api/generate/${generationId}`, token);
}

export default {
  fetchRepos,
  getCurrentUser,
  importRepo,
  generateReadme,
  getGeneration,
};
