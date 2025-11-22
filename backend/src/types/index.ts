import { Request } from 'express';
import { IUser } from '../models/User.model.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'fail';
  message?: string;
  data?: T;
  error?: string;
  stack?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
}

export interface ProductQuery extends PaginationQuery {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  search?: string;
  isFeatured?: string;
}

export interface OrderQuery extends PaginationQuery {
  status?: string;
  user?: string;
  startDate?: string;
  endDate?: string;
}