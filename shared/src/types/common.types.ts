export interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'fail';
  message?: string;
  data?: T;
  error?: string;
  results?: number;
  pagination?: {
    page: number;
    pages: number;
    total: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
}

export interface ErrorResponse {
  status: 'error' | 'fail';
  message: string;
  error?: string;
  stack?: string;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders?: Order[];
}

export interface SalesData {
  month: string;
  sales: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  sales: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
}