// API Configuration and Methods
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';

const API = {
  // Helper for making requests
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Add admin token for admin routes
    const adminToken = localStorage.getItem('adminToken');
    if (endpoint.startsWith('/admin') && adminToken) {
      config.headers['Authorization'] = `Bearer ${adminToken}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth endpoints
  async verifyMasterPassword(password) {
    return this.request('/auth/verify-master', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  },

  async register(name, phone, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, phone, password })
    });
  },

  async login(phone, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });
  },

  // User endpoints
  async getUser(id) {
    return this.request(`/users/${id}`);
  },

  async updateAvatar(id, avatarData) {
    return this.request(`/users/${id}/avatar`, {
      method: 'PUT',
      body: JSON.stringify({ avatar_data: avatarData })
    });
  },

  // Schedule endpoints
  async getSchedulesForMonth(month, year) {
    return this.request(`/schedules?month=${month}&year=${year}`);
  },

  async getSchedulesForDate(date) {
    return this.request(`/schedules/date/${date}`);
  },

  async createSchedule(date, startTime, endTime, description) {
    return this.request('/schedules', {
      method: 'POST',
      body: JSON.stringify({
        date,
        start_time: startTime,
        end_time: endTime,
        description
      })
    });
  },

  async updateSchedule(id, data) {
    return this.request(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteSchedule(id) {
    return this.request(`/schedules/${id}`, {
      method: 'DELETE'
    });
  },

  // Admin endpoints
  async verifyAdminPassword(password) {
    return this.request('/admin/verify', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  },

  async adminGetUsers() {
    return this.request('/admin/users');
  },

  async adminDeleteUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  async adminGetSchedules() {
    return this.request('/admin/schedules');
  },

  async adminDeleteSchedule(id) {
    return this.request(`/admin/schedules/${id}`, {
      method: 'DELETE'
    });
  }
};
