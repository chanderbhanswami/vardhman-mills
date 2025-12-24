import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from './types';

// Define missing interfaces locally
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CheckoutFormData {
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentDetails: Record<string, unknown>;
}
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  removeToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token from localStorage if available
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';

        // Handle authentication errors
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login page
            window.location.href = '/login';
          }
        }

        // Show error toast for client errors
        if (error.response?.status >= 400 && error.response?.status < 500) {
          toast.error(message);
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // GET method
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  // POST method
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  // PUT method
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  // PATCH method
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  // DELETE method
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Upload method for file uploads
  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.post<{ token: string }>('/auth/login', { email, password });
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async register(userData: RegisterFormData) {
    return this.post('/auth/register', userData);
  }

  // Product methods
  async getProducts(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.get(`/products${queryString}`);
  }

  async getProduct(id: string) {
    return this.get(`/products/${id}`);
  }

  async getFeaturedProducts() {
    return this.get('/products/featured');
  }

  // Category methods
  async getCategories() {
    return this.get('/categories');
  }

  async getCategory(slug: string) {
    return this.get(`/categories/${slug}`);
  }

  // Brand methods
  async getBrands(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.get(`/brands${queryString}`);
  }

  // User methods
  async getUserProfile() {
    return this.get('/users/me');
  }

  async updateProfile(userData: Partial<User>) {
    return this.patch('/users/me', userData);
  }

  // Order methods
  async getUserOrders() {
    return this.get('/orders/my/orders');
  }

  async createOrder(orderData: CheckoutFormData) {
    return this.post('/orders', orderData);
  }

  async getOrder(id: string) {
    return this.get(`/orders/${id}`);
  }
}

export const api = new ApiClient();

// API endpoints
export const endpoints = {
  // Authentication
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    updatePassword: '/auth/update-password',
    google: '/auth/google',
    facebook: '/auth/facebook',
  },

  // Users
  users: {
    me: '/users/me',
    updateMe: '/users/update-me',
    addresses: '/users/addresses',
    wishlist: '/users/wishlist',
  },

  // Categories
  categories: {
    getAll: '/categories',
    getBySlug: (slug: string) => `/categories/${slug}`,
  },

  // Products
  products: {
    getAll: '/products',
    featured: '/products/featured',
    getBySlug: (slug: string) => `/products/${slug}`,
    getById: (id: string) => `/products/id/${id}`,
    related: (id: string) => `/products/${id}/related`,
    reviews: (id: string) => `/products/${id}/reviews`,
  },

  // Orders
  orders: {
    create: '/orders',
    my: '/orders/my/orders',
    getById: (id: string) => `/orders/${id}`,
    track: '/orders/track',
    cancel: (id: string) => `/orders/${id}/cancel`,
  },

  // Payments
  payments: {
    createRazorpayOrder: '/payments/razorpay/create-order',
    verifyRazorpayPayment: '/payments/razorpay/verify',
    getStatus: (orderId: string) => `/payments/${orderId}/status`,
  },
  reviews: {
    getByProduct: (productId: string) => `/products/${productId}/reviews`,
    create: '/reviews',
    update: (id: string) => `/reviews/${id}`,
    delete: (id: string) => `/reviews/${id}`,
  },
  wishlist: {
    list: '/wishlist',
    add: '/wishlist',
    remove: (id: string) => `/wishlist/${id}`,
  },
  cart: {
    list: '/cart',
    add: '/cart',
    update: (id: string) => `/cart/${id}`,
    remove: (id: string) => `/cart/${id}`,
    clear: '/cart/clear',
  },
};
