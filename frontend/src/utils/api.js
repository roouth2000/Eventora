/**
 * API utility functions for communicating with the Eventora Backend.
 * Standardizes fetch requests, authorization headers, and error handling.
 */

// We fetch the API gateway from settings or default to the production/local url
const getBaseUrl = () => {
  const settings = localStorage.getItem('api_gateway');
  if (settings) return settings;
  
  // Auto-detect local development environment vs production domain
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api/v1';
  }
  return 'https://eventora.heavenwebtechnologies.com/api/v1';
};

const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const activeToken = token || sessionStorage.getItem('token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let errorMsg = data.message || `API Error: Status ${response.status}`;
    if (data.errors && Array.isArray(data.errors)) {
      const details = data.errors.map(err => `${err.field}: ${err.message}`).join(', ');
      errorMsg = `${errorMsg} - ${details}`;
    }
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth APIs
  login: async (email, password) => {
    const res = await fetch(`${getBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  register: async (name, email, password, role = 'user') => {
    const res = await fetch(`${getBaseUrl()}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password, role })
    });
    return handleResponse(res);
  },

  getProfile: async () => {
    const res = await fetch(`${getBaseUrl()}/users/profile`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  updateProfile: async (name, email) => {
    const res = await fetch(`${getBaseUrl()}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name, email })
    });
    return handleResponse(res);
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await fetch(`${getBaseUrl()}/users/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(res);
  },

  // Events APIs
  getEvents: async () => {
    const res = await fetch(`${getBaseUrl()}/events`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getMyEvents: async () => {
    const res = await fetch(`${getBaseUrl()}/events/my`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getEventById: async (id) => {
    const res = await fetch(`${getBaseUrl()}/events/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Public — no auth token required (used by QR code scan landing page)
  getEventBySlug: async (slug) => {
    const res = await fetch(`${getBaseUrl()}/events/slug/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' } // No Authorization header
    });
    return handleResponse(res);
  },

  createEvent: async (eventData) => {
    const res = await fetch(`${getBaseUrl()}/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(eventData)
    });
    return handleResponse(res);
  },

  updateEvent: async (id, eventData) => {
    const res = await fetch(`${getBaseUrl()}/events/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(eventData)
    });
    return handleResponse(res);
  },

  deleteEvent: async (id) => {
    const res = await fetch(`${getBaseUrl()}/events/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  attendEvent: async (id) => {
    const res = await fetch(`${getBaseUrl()}/events/${id}/attend`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
