// Authentication utilities

const Auth = {
  // Check if user has valid master token
  hasMasterAccess() {
    return !!localStorage.getItem('masterToken');
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem('authToken');
  },

  // Get current user data
  getUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Update stored user data
  updateUser(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  },

  // Logout user
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  },

  // Full logout (including master access)
  fullLogout() {
    localStorage.removeItem('masterToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    window.location.href = 'index.html';
  },

  // Check authentication and redirect if needed
  requireAuth() {
    if (!this.hasMasterAccess()) {
      window.location.href = 'index.html';
      return false;
    }
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};
