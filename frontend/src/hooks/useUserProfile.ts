import { useState, useEffect } from 'react';
import { User } from '@/types/user.types';

interface UserProfile {
  reviewCount: number;
  helpfulVotes: number;
  followerCount: number;
  followingCount: number;
  averageRating: number;
  memberSince: string;
}

interface UseUserProfileReturn {
  data: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useUserProfile = (userId?: string): UseUserProfileReturn => {
  const [data, setData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockProfile: UserProfile = {
        reviewCount: Math.floor(Math.random() * 100) + 1,
        helpfulVotes: Math.floor(Math.random() * 500) + 10,
        followerCount: Math.floor(Math.random() * 50),
        followingCount: Math.floor(Math.random() * 30),
        averageRating: Number((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
        memberSince: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      setData(mockProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchUserProfile
  };
};