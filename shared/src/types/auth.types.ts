export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  avatar?: string;
  addresses: Address[];
  wishlist: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  _id?: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  mobile?: string;
  isDefault: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile?: string;
}

export interface AuthResponse {
  status: 'success';
  token: string;
  data: {
    user: User;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface UpdatePasswordRequest {
  passwordCurrent: string;
  password: string;
}