import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  avatar?: string;
  bio?: string;
  website?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  preferences?: {
    newsletter: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    accountAge: number; // in days
    reviewsCount: number;
    wishlistCount: number;
    loyaltyPoints: number;
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    identityVerified: boolean;
  };
  membership: {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    joinDate: string;
    benefits: string[];
    nextTierRequirement?: {
      type: 'orders' | 'spending' | 'reviews';
      current: number;
      required: number;
    };
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface UseProfileOptions {
  includeStats?: boolean;
  includeMembership?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useProfile = (options: UseProfileOptions = {}) => {
  const {
    includeStats = true,
    includeMembership = true,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch profile data
  const {
    data: profile,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['profile', user?.id, { includeStats, includeMembership }],
    queryFn: async (): Promise<UserProfile> => {
      if (!isAuthenticated || !user) {
        throw new Error('User not authenticated');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Create comprehensive profile data
      const profileData: UserProfile = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || 'John',
        lastName: user.lastName || 'Doe',
        username: 'johndoe123',
        phoneNumber: '+91 9876543210',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        avatar: user.avatar || '/images/avatars/default-male.jpg',
        bio: 'Passionate about quality textiles and sustainable fashion. Love exploring new collections and supporting local artisans.',
        website: 'https://johndoe.dev',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
        },
        socialLinks: {
          instagram: '@johndoe_style',
          twitter: '@johndoe',
          facebook: 'john.doe.style',
        },
        preferences: {
          newsletter: true,
          smsNotifications: false,
          emailNotifications: true,
        },
        stats: includeStats ? {
          totalOrders: 47,
          totalSpent: 125340,
          accountAge: 423, // days since registration
          reviewsCount: 28,
          wishlistCount: 15,
          loyaltyPoints: 2850,
        } : {
          totalOrders: 0,
          totalSpent: 0,
          accountAge: 0,
          reviewsCount: 0,
          wishlistCount: 0,
          loyaltyPoints: 0,
        },
        verification: {
          emailVerified: user.isEmailVerified || true,
          phoneVerified: true,
          identityVerified: false,
        },
        membership: includeMembership ? {
          tier: 'gold',
          joinDate: new Date(Date.now() - 423 * 24 * 60 * 60 * 1000).toISOString(),
          benefits: [
            'Free shipping on all orders',
            'Early access to new collections',
            '15% discount on premium items',
            'Priority customer support',
            'Birthday month special offers',
          ],
          nextTierRequirement: {
            type: 'spending',
            current: 125340,
            required: 200000,
          },
        } : {
          tier: 'bronze',
          joinDate: new Date().toISOString(),
          benefits: [],
        },
        createdAt: new Date(Date.now() - 423 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastLoginAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      };

      return profileData;
    },
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Computed values
  const fullName = useMemo(() => {
    if (!profile) return '';
    return `${profile.firstName} ${profile.lastName}`.trim();
  }, [profile]);

  const initials = useMemo(() => {
    if (!profile) return '';
    const first = profile.firstName?.[0] || '';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase();
  }, [profile]);

  const age = useMemo(() => {
    if (!profile?.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(profile.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }, [profile?.dateOfBirth]);

  const membershipProgress = useMemo(() => {
    if (!profile?.membership.nextTierRequirement) return 100;
    
    const { current, required } = profile.membership.nextTierRequirement;
    return Math.min((current / required) * 100, 100);
  }, [profile?.membership.nextTierRequirement]);

  const verificationProgress = useMemo(() => {
    if (!profile) return 0;
    
    const verifications = Object.values(profile.verification);
    const completed = verifications.filter(Boolean).length;
    return (completed / verifications.length) * 100;
  }, [profile]);

  const isProfileComplete = useMemo(() => {
    if (!profile) return false;
    
    const requiredFields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.phoneNumber,
      profile.dateOfBirth,
    ];
    
    return requiredFields.every(field => field && field.trim() !== '');
  }, [profile]);

  const loyaltyTierInfo = useMemo(() => {
    const tiers = {
      bronze: { min: 0, max: 25000, color: '#CD7F32', benefits: 2 },
      silver: { min: 25000, max: 75000, color: '#C0C0C0', benefits: 4 },
      gold: { min: 75000, max: 200000, color: '#FFD700', benefits: 6 },
      platinum: { min: 200000, max: Infinity, color: '#E5E4E2', benefits: 10 },
    };
    
    const currentTier = profile?.membership.tier || 'bronze';
    return tiers[currentTier];
  }, [profile?.membership.tier]);

  // Helper functions
  const getProfileCompletionItems = useCallback(() => {
    if (!profile) return [];
    
    const items = [
      { field: 'avatar', completed: !!profile.avatar, label: 'Profile Photo', weight: 15 },
      { field: 'bio', completed: !!profile.bio, label: 'Bio/Description', weight: 10 },
      { field: 'phoneNumber', completed: !!profile.phoneNumber, label: 'Phone Number', weight: 20 },
      { field: 'dateOfBirth', completed: !!profile.dateOfBirth, label: 'Date of Birth', weight: 15 },
      { field: 'location', completed: !!profile.location?.city, label: 'Location', weight: 10 },
      { field: 'emailVerified', completed: profile.verification.emailVerified, label: 'Email Verification', weight: 20 },
      { field: 'phoneVerified', completed: profile.verification.phoneVerified, label: 'Phone Verification', weight: 10 },
    ];
    
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const completedWeight = items
      .filter(item => item.completed)
      .reduce((sum, item) => sum + item.weight, 0);
    
    return {
      items,
      completionPercentage: (completedWeight / totalWeight) * 100,
      completedItems: items.filter(item => item.completed).length,
      totalItems: items.length,
    };
  }, [profile]);

  const formatMemberSince = useCallback((joinDate: string) => {
    const date = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  }, []);

  const getNextMilestone = useCallback(() => {
    if (!profile?.membership.nextTierRequirement) return null;
    
    const { type, current, required } = profile.membership.nextTierRequirement;
    const remaining = required - current;
    
    const milestones = {
      orders: `${remaining} more orders`,
      spending: `₹${remaining.toLocaleString()} more spending`,
      reviews: `${remaining} more reviews`,
    };
    
    return {
      description: milestones[type],
      progress: (current / required) * 100,
      remaining,
      type,
    };
  }, [profile?.membership.nextTierRequirement]);

  const getSocialLinksArray = useCallback(() => {
    if (!profile?.socialLinks) return [];
    
    const platforms = [
      { key: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', color: '#1877F2' },
      { key: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: '#E4405F' },
      { key: 'twitter', name: 'Twitter', icon: 'fab fa-twitter', color: '#1DA1F2' },
      { key: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0A66C2' },
    ];
    
    return platforms
      .filter(platform => profile.socialLinks![platform.key as keyof typeof profile.socialLinks])
      .map(platform => ({
        ...platform,
        url: profile.socialLinks![platform.key as keyof typeof profile.socialLinks],
      }));
  }, [profile]);

  // Action functions
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  const refreshProfile = useCallback(() => {
    return refetch();
  }, [refetch]);

  const invalidateProfile = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
  }, [queryClient, user?.id]);

  // Mock achievement system
  const getRecentAchievements = useCallback(() => {
    if (!profile) return [];
    
    const achievements = [];
    
    if (profile.stats.totalOrders >= 50) {
      achievements.push({
        id: 'orders_50',
        title: 'Frequent Shopper',
        description: 'Completed 50+ orders',
        icon: '🛍️',
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    if (profile.stats.reviewsCount >= 25) {
      achievements.push({
        id: 'reviews_25',
        title: 'Trusted Reviewer',
        description: 'Written 25+ helpful reviews',
        icon: '⭐',
        unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    if (profile.membership.tier === 'gold' || profile.membership.tier === 'platinum') {
      achievements.push({
        id: 'tier_premium',
        title: 'Premium Member',
        description: `Reached ${profile.membership.tier} tier`,
        icon: '👑',
        unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    return achievements.slice(0, 3); // Return latest 3
  }, [profile]);

  return {
    // Data
    profile,
    
    // Computed values
    fullName,
    initials,
    age,
    membershipProgress,
    verificationProgress,
    isProfileComplete,
    loyaltyTierInfo,
    
    // State
    isLoading,
    isFetching,
    error,
    isEditMode,
    
    // Helpers
    getProfileCompletionItems,
    formatMemberSince,
    getNextMilestone,
    getSocialLinksArray,
    getRecentAchievements,
    
    // Actions
    toggleEditMode,
    refreshProfile,
    invalidateProfile,
    
    // Profile completion
    completion: getProfileCompletionItems(),
    
    // Quick stats
    quickStats: profile ? {
      ordersThisYear: Math.floor(profile.stats.totalOrders * 0.6), // Mock: 60% orders this year
      avgOrderValue: Math.round(profile.stats.totalSpent / profile.stats.totalOrders),
      savingsFromMembership: Math.round(profile.stats.totalSpent * 0.12), // Mock: 12% savings
      pointsToExpire: Math.floor(profile.stats.loyaltyPoints * 0.1), // Mock: 10% expiring soon
    } : null,
    
    // Verification status
    verificationStatus: profile ? {
      overall: verificationProgress,
      items: [
        { type: 'email', verified: profile.verification.emailVerified, required: true },
        { type: 'phone', verified: profile.verification.phoneVerified, required: false },
        { type: 'identity', verified: profile.verification.identityVerified, required: false },
      ],
    } : null,
  };
};

export default useProfile;
