
import axios from 'axios';
import { HeaderLogoResponse, HeaderLogoListResponse } from '../types/headerLogo.types';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const headerLogoService = {
  // Get active logo for display
  getActiveLogo: async (): Promise<HeaderLogoResponse> => {
    const response = await api.get('/header-logos/active');
    return response.data;
  },

  // Get logo configuration
  getLogoConfig: async (): Promise<HeaderLogoListResponse> => {
    const response = await api.get('/header-logos/config');
    return response.data;
  },

  // Track logo impression (analytics)
  trackImpression: async (logoId: string): Promise<void> => {
    await api.post('/header-logos/track/impression', { logoId });
  },

  // Track logo click (analytics)
  trackClick: async (logoId: string): Promise<void> => {
    await api.post('/header-logos/track/click', { logoId });
  }
};

