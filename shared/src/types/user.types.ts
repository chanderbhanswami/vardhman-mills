export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  avatar?: string;
  addresses: Address[];
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
}

export interface AddAddressRequest {
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  mobile?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<AddAddressRequest> {}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  adminUsers: number;
}