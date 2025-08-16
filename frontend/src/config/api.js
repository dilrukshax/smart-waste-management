// API Configuration
// This file centralizes all API endpoint configurations

// Base API URL - can be overridden by environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// API Endpoints configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  
  // Authentication endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    GARBAGE_COLLECTORS: `${API_BASE_URL}/api/auth/garbage-collectors`,
  },
  
  // Request endpoints
  REQUEST: {
    CREATE: `${API_BASE_URL}/api/request/create`,
    USER_REQUESTS: `${API_BASE_URL}/api/request/user/my-requests`,
    BY_ID: (id) => `${API_BASE_URL}/api/request/${id}`,
    ADMIN_REQUESTS: `${API_BASE_URL}/api/request/admin/requests`,
    ASSIGN: (requestId) => `${API_BASE_URL}/api/request/admin/assign/${requestId}`,
    COLLECTOR_ASSIGNED: `${API_BASE_URL}/api/request/collector/assigned-requests`,
    COLLECTOR_COMPLETE: (requestId) => `${API_BASE_URL}/api/request/collector/complete/${requestId}`,
  },
  
  // User management endpoints
  USER: {
    INVOICES: `${API_BASE_URL}/api/user/invoices`,
  },
  
  // Admin endpoints
  ADMIN: {
    USERS: `${API_BASE_URL}/api/admin/users`,
    ASSIGN_COLLECTOR: `${API_BASE_URL}/api/admin/assign-collector`,
    GENERATE_INVOICE: (userId) => `${API_BASE_URL}/api/admin/generate-invoice/${userId}`,
    REQUESTS_PER_MONTH: `${API_BASE_URL}/api/admin/requests-per-month`,
    GARBAGE_STATS: `${API_BASE_URL}/api/admin/garbage-stats`,
    GARBAGE_CATEGORY_COUNT: `${API_BASE_URL}/api/admin/garbage-category-count`,
    COLLECTOR_ASSIGNMENTS: `${API_BASE_URL}/api/admin/collector-assignments`,
  },
  
  // Collector endpoints
  COLLECTOR: {
    COLLECT_GARBAGE: (userId) => `${API_BASE_URL}/api/collector/collect-garbage/${userId}`,
    ASSIGNED_USERS: `${API_BASE_URL}/api/collector/assigned-users`,
  },
  
  // Stripe payment endpoints
  STRIPE: {
    CREATE_PAYMENT_INTENT: `${API_BASE_URL}/api/stripe/create-payment-intent`,
  },
  
  // Invoice endpoints
  INVOICE: {
    BY_ID: (id) => `${API_BASE_URL}/api/invoice/${id}`,
  },
};

// Helper function to get the base URL
export const getApiBaseUrl = () => API_BASE_URL;

// Helper function to build API URLs (useful for dynamic endpoints)
export const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

export default API_CONFIG;
