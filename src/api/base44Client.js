import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Create a standard axios client for local development
export const base44 = axios.create({
  baseURL: '/api', // Proxied to localhost:3001
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token
base44.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// One place for failure feedback: a save that fails must never look like it worked.
base44.interceptors.response.use(undefined, (error) => {
  const status = error.response?.status;
  const isWrite = error.config?.method && error.config.method !== 'get';
  const isLogin = error.config?.url?.startsWith('/auth/');
  if ((isWrite || status >= 500 || !error.response) && !isLogin) {
    toast({
      variant: 'destructive',
      title: isWrite ? 'Could not save' : 'Could not load your data',
      description: error.response?.data?.message || 'Check your connection and try again.',
    });
  }
  return Promise.reject(error);
});

// Mock the auth methods to match the previous structure roughly, but pointing to our new endpoints
base44.auth = {
  login: async (credentials) => {
    const response = await base44.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await base44.post('/auth/register', userData);
    return response.data;
  },
  me: async () => {
    const response = await base44.get('/auth/me');
    return response.data;
  },
  logout: (redirectUrl) => {
    localStorage.removeItem('token');
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = '/sign-in';
    }
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  deleteAccount: async () => {
    const response = await base44.delete('/auth/delete');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await base44.patch('/auth/profile', data);
    return response.data;
  }
};

const createEntityClient = (entityName) => ({
  list: async (sort, limit) => {
    const params = {};
    if (sort) params.sort = sort;
    if (limit) params.limit = limit;
    try {
      const response = await base44.get(`/entities/${entityName}`, { params });
      return response.data;
    } catch (e) {
      console.warn(`Failed to list ${entityName}`, e);
      return [];
    }
  },
  create: async (data) => {
    const response = await base44.post(`/entities/${entityName}`, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await base44.patch(`/entities/${entityName}/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await base44.delete(`/entities/${entityName}/${id}`);
    return true;
  },
  filter: async (criteria) => {
    try {
      const response = await base44.get(`/entities/${entityName}`);
      let results = response.data;
      if (criteria) {
        results = results.filter(item => {
          for (const key in criteria) {
            if (item[key] !== criteria[key]) return false;
          }
          return true;
        });
      }
      return results;
    } catch (e) {
      console.warn(`Failed to filter ${entityName}`, e);
      return [];
    }
  }
});

base44.entities = {
  UserPreferences: createEntityClient('UserPreferences'),
  DailyCheckIn: createEntityClient('DailyCheckIn'),
  PeriodLog: createEntityClient('PeriodLog'),
  SymptomLog: createEntityClient('SymptomLog'),
  Exercise: createEntityClient('Exercise'),
  EmergencyContact: createEntityClient('EmergencyContact'),
  Task: createEntityClient('Task'),
  ChatHistory: createEntityClient('ChatHistory')
};

base44.appLogs = {
  logUserInApp: async () => { /* No-op for local */ }
};
