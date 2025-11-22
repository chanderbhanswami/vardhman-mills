/**
 * About Service
 * 
 * API service for managing about/company information
 * 
 * Features:
 * - Get company information
 * - Get company history
 * - Get team members
 * - Get awards & certifications
 * - Get company locations
 * - Get company statistics
 */

import { apiClient } from '@/lib/api-client';

const BASE_URL = '/api/about';

// ============================================
// TYPES
// ============================================

export interface CompanyInfo {
  companyName: string;
  tagline?: string;
  description?: string;
  foundedYear: number;
  founderName?: string;
  headquarters?: string;
  industryType?: string;
  vision?: string;
  mission?: string;
  values?: string[];
  stats?: {
    yearsInBusiness?: number;
    totalEmployees?: number;
    happyCustomers?: number;
    countriesServed?: number;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  social?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface HistoryEntry {
  _id: string;
  year: number;
  title: string;
  description: string;
  image?: string;
  order: number;
  isActive: boolean;
}

export interface TeamMember {
  _id: string;
  name: string;
  designation: string;
  department?: string;
  bio?: string;
  image?: string;
  email?: string;
  phone?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
  };
  joinedDate?: string;
  isFeatured: boolean;
  order: number;
}

export interface Award {
  _id: string;
  title: string;
  description?: string;
  year: number;
  issuedBy: string;
  image?: string;
  category?: string;
  order: number;
  isActive: boolean;
}

export interface Location {
  _id: string;
  name: string;
  type: 'office' | 'warehouse' | 'factory' | 'showroom';
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone?: string;
  email?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isPrimary: boolean;
  isActive: boolean;
}

export interface CompanyStats {
  yearsInBusiness: number;
  totalEmployees: number;
  totalCustomers: number;
  totalOrders: number;
  totalProducts: number;
  countriesServed: number;
  citiesServed: number;
}

// ============================================
// COMPANY INFORMATION
// ============================================

/**
 * Get company information
 */
export async function getCompanyInfo(): Promise<CompanyInfo> {
  try {
    const response = await apiClient.get<{ success: boolean; data: CompanyInfo }>(
      `${BASE_URL}/company`
    );
    if (!response.data) throw new Error('No data received');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching company info:', error);
    throw error;
  }
}

/**
 * Get company history entries
 */
export async function getHistoryEntries(): Promise<HistoryEntry[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: HistoryEntry[] }>(
      `${BASE_URL}/history`
    );
    if (!response.data) throw new Error('No data received');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching history entries:', error);
    throw error;
  }
}

// ============================================
// TEAM
// ============================================

/**
 * Get all team members
 */
export async function getTeamMembers(params?: {
  featured?: boolean;
  department?: string;
  limit?: number;
}): Promise<TeamMember[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: TeamMember[] }>(
      `${BASE_URL}/team`,
      { params }
    );
    if (!response.data) throw new Error('No data received');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
}

/**
 * Get featured team members
 */
export async function getFeaturedTeam(): Promise<TeamMember[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: TeamMember[] }>(
      `${BASE_URL}/team/featured`
    );
    if (!response.data) throw new Error('No data received');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching featured team:', error);
    throw error;
  }
}

/**
 * Get team member by ID
 */
export async function getTeamMember(id: string): Promise<TeamMember> {
  try {
    const response = await apiClient.get<{ success: boolean; data: TeamMember }>(
      `${BASE_URL}/team/${id}`
    );
    if (!response.data) throw new Error('No data received');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching team member:', error);
    throw error;
  }
}

// ============================================
// AWARDS
// ============================================

/**
 * Get all awards
 */
export async function getAwards(): Promise<Award[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Award[] }>(
      `${BASE_URL}/awards`
    );
    if (!response.data) throw new Error('No data received');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching awards:', error);
    throw error;
  }
}

/**
 * Get award by ID
 */
export async function getAward(id: string): Promise<Award> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Award }>(
      `${BASE_URL}/awards/${id}`
    );
    if (!response.data) throw new Error('No data received');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching award:', error);
    throw error;
  }
}

// ============================================
// LOCATIONS
// ============================================

/**
 * Get all locations
 */
export async function getLocations(params?: {
  type?: 'office' | 'warehouse' | 'factory' | 'showroom';
  city?: string;
  state?: string;
  country?: string;
}): Promise<Location[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Location[] }>(
      `${BASE_URL}/locations`,
      { params }
    );
    if (!response.data) throw new Error('No data received');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
}

/**
 * Get location by ID
 */
export async function getLocation(id: string): Promise<Location> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Location }>(
      `${BASE_URL}/locations/${id}`
    );
    if (!response.data) throw new Error('No data received');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching location:', error);
    throw error;
  }
}

/**
 * Get primary location
 */
export async function getPrimaryLocation(): Promise<Location> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Location }>(
      `${BASE_URL}/locations/primary`
    );
    if (!response.data) throw new Error('No data received');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching primary location:', error);
    throw error;
  }
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get company statistics
 */
export async function getCompanyStats(): Promise<CompanyStats> {
  try {
    const response = await apiClient.get<{ success: boolean; data: CompanyStats }>(
      `${BASE_URL}/stats`
    );
    if (!response.data) throw new Error('No data received');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching company stats:', error);
    throw error;
  }
}

// ============================================
// DEFAULT EXPORT
// ============================================

const aboutService = {
  getCompanyInfo,
  getHistoryEntries,
  getTeamMembers,
  getFeaturedTeam,
  getTeamMember,
  getAwards,
  getAward,
  getLocations,
  getLocation,
  getPrimaryLocation,
  getCompanyStats,
};

export default aboutService;
