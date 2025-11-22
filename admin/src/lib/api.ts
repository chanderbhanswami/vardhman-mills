import { ApiResponse, PaginatedResponse, Product, Category, Order, User, DashboardStats, Setting, SettingsCategory, SettingsFormData, CategoryFormData } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Error handling utility
const handleApiError = (error: unknown): never => {
  console.error('API Error:', error);
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { data?: { message?: string } } };
    if (apiError.response?.data?.message) {
      throw new Error(apiError.response.data.message);
    }
  }
  if (error instanceof Error) {
    throw new Error(error.message);
  }
  throw new Error('An unexpected error occurred');
};

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Auth methods
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Product methods
  async getProducts(params?: Record<string, string>): Promise<PaginatedResponse<Product>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/admin/products/all${queryString}`);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request(`/v1/products/id/${id}`);
  }

  async createProduct(formData: FormData): Promise<ApiResponse<Product>> {
    return this.request('/admin/products', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async updateProduct(id: string, formData: FormData): Promise<ApiResponse<Product>> {
    return this.request(`/admin/products/${id}`, {
      method: 'PATCH',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Category methods
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request('/admin/categories');
  }

  async createCategory(data: CategoryFormData): Promise<ApiResponse<Category>> {
    if (data.image && data.image instanceof File) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('parentCategory', data.parentCategory || '');
      formData.append('image', data.image);
      formData.append('isActive', data.isActive.toString());

      return this.request('/admin/categories', {
        method: 'POST',
        headers: {}, // Let browser set Content-Type for FormData
        body: formData,
      });
    }

    return this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: CategoryFormData): Promise<ApiResponse<Category>> {
    if (data.image && data.image instanceof File) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('parentCategory', data.parentCategory || '');
      formData.append('image', data.image);
      formData.append('isActive', data.isActive.toString());

      return this.request(`/admin/categories/${id}`, {
        method: 'PATCH',
        headers: {}, // Let browser set Content-Type for FormData
        body: formData,
      });
    }

    return this.request(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    return this.request(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Order methods
  async getOrders(params?: Record<string, string>): Promise<PaginatedResponse<Order>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/admin/orders${queryString}`);
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request(`/admin/orders/${id}`);
  }

  async updateOrderStatus(id: string, data: { status: string; trackingNumber?: string }): Promise<ApiResponse<Order>> {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Customer methods
  async getCustomers(params?: Record<string, string>): Promise<PaginatedResponse<User>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/admin/users${queryString}`);
  }

  async updateCustomer(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string): Promise<ApiResponse<null>> {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request('/admin/dashboard/stats');
  }

  // Settings methods
  async getCategorySettings(category: string): Promise<ApiResponse<SettingsCategory>> {
    return this.request(`/v1/settings/category/${category}`);
  }

  async updateCategorySettings(category: string, data: SettingsFormData): Promise<ApiResponse<Setting[]>> {
    return this.request(`/v1/settings/category/${category}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getSetting(category: string, key: string): Promise<ApiResponse<Setting>> {
    return this.request(`/v1/settings/${category}/${key}`);
  }

  async updateSetting(category: string, key: string, data: { value: SettingsFormData[string] }): Promise<ApiResponse<Setting>> {
    return this.request(`/v1/settings/${category}/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAllSettings(): Promise<ApiResponse<Setting[]>> {
    return this.request('/v1/settings');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Convenience exports
export const { 
  login,
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getOrders, 
  getOrder, 
  updateOrderStatus,
  getCustomers, 
  updateCustomer, 
  deleteCustomer,
  getDashboardStats,
  getCategorySettings, 
  updateCategorySettings, 
  getSetting, 
  updateSetting, 
  getAllSettings 
} = apiClient;