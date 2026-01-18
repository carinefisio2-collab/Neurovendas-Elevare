import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || '';

// Track consecutive 401 errors to prevent aggressive logouts
let consecutive401Count = 0;
const MAX_401_BEFORE_LOGOUT = 3;
let lastRequestTime = 0;

// Create axios instance with longer timeout
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutos timeout para operações longas como Gamma
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Track request time to detect rapid failures
  lastRequestTime = Date.now();
  return config;
});

// Handle errors - mais robusto para evitar logouts desnecessários
api.interceptors.response.use(
  (response) => {
    // Reset 401 counter on successful response
    consecutive401Count = 0;
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Network errors - don't logout, just retry silently
    if (!error.response) {
      console.warn('Erro de rede - tentando novamente...');
      return Promise.reject(error);
    }
    
    // Handle 401 errors more carefully
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthEndpoint = originalRequest?.url?.includes('/api/auth/');
      const isLoginPage = currentPath === '/login' || currentPath === '/register' || currentPath === '/forgot-password';
      const token = localStorage.getItem('token');
      
      // Don't process 401 for auth pages or auth endpoints
      if (isLoginPage || isAuthEndpoint) {
        return Promise.reject(error);
      }
      
      // Increment 401 counter
      consecutive401Count++;
      
      // Only logout after multiple consecutive 401 errors
      // This prevents logout on temporary network issues or race conditions
      if (token && consecutive401Count >= MAX_401_BEFORE_LOGOUT) {
        console.warn(`Sessão expirada após ${consecutive401Count} tentativas - redirecionando para login`);
        consecutive401Count = 0;
        localStorage.removeItem('token');
        // Use replace to avoid history issues
        window.location.replace('/login');
      } else if (token && consecutive401Count < MAX_401_BEFORE_LOGOUT) {
        // Log but don't logout yet - might be transient
        console.warn(`401 error (${consecutive401Count}/${MAX_401_BEFORE_LOGOUT}) - aguardando antes de fazer logout`);
      }
    }
    
    return Promise.reject(error);
  }
);

// Named export
export { api };

// Also export as default for backward compatibility
export default api;

// Legacy API functions for backward compatibility
interface ApiOptions {
  method?: string;
  body?: any;
  token?: string | null;
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, token } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    method,
    headers,
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();
  
  if (!response.ok) {
    // Create error object compatible with axios format
    const error: any = new Error(data.detail || data.error || 'Algo deu errado');
    error.response = { data, status: response.status };
    throw error;
  }
  
  return data;
}

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    apiFetch('/api/auth/register', { method: 'POST', body: data }),
  
  login: (data: { email: string; password: string }) =>
    apiFetch('/api/auth/login', { method: 'POST', body: data }),
  
  me: (token: string) =>
    apiFetch('/api/auth/me', { token }),
};

export const leadsApi = {
  getAll: (token: string) =>
    apiFetch('/api/leads', { token }),
  
  create: (token: string, data: any) =>
    apiFetch('/api/leads', { method: 'POST', body: data, token }),
  
  update: (token: string, id: string, data: any) =>
    apiFetch(`/api/leads/${id}`, { method: 'PUT', body: data, token }),
  
  delete: (token: string, id: string) =>
    apiFetch(`/api/leads/${id}`, { method: 'DELETE', token }),
};

export const agendamentosApi = {
  getAll: (token: string) =>
    apiFetch('/api/agendamentos', { token }),
  
  create: (token: string, data: any) =>
    apiFetch('/api/agendamentos', { method: 'POST', body: data, token }),
};

export const contentApi = {
  getAll: (token: string) =>
    apiFetch('/api/content', { token }),
  
  create: (token: string, data: any) =>
    apiFetch('/api/content', { method: 'POST', body: data, token }),
};

export const dashboardApi = {
  getStats: (token: string) =>
    apiFetch('/api/dashboard/stats', { token }),
};

export const plansApi = {
  getAll: () =>
    apiFetch('/api/plans'),
};
