// Configuration
const CONFIG = {
  BACKEND_URL: 'https://omnivet-team-planner-production.up.railway.app'
};

// Auto-detect API base URL
function getApiBase() {
  // If running locally
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }

  // If backend URL is configured
  if (CONFIG.BACKEND_URL) {
    return CONFIG.BACKEND_URL + '/api';
  }

  // Fallback to same origin (won't work if frontend/backend are on different domains)
  return '/api';
}
