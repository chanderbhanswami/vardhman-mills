import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useApi from '../api/useApi';

export interface NewsletterSubscription {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'inactive' | 'unsubscribed' | 'bounced';
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
  };
  subscribedAt: Date;
  unsubscribedAt?: Date;
  lastEmailSent?: Date;
}

export interface SubscribeData {
  email: string;
  firstName?: string;
  lastName?: string;
  preferences?: {
    frequency?: 'daily' | 'weekly' | 'monthly';
    categories?: string[];
  };
}

export interface NewsletterState {
  isSubscribing: boolean;
  isUnsubscribing: boolean;
  isSubscribed: boolean | null;
  subscriptionStatus: string | null;
  error: string | null;
}

const QUERY_KEYS = {
  subscription: (email: string) => ['newsletter', 'subscription', email] as const,
  subscriptions: ['newsletter', 'subscriptions'] as const,
} as const;

export const useNewsletter = (email?: string) => {
  const api = useApi();
  const queryClient = useQueryClient();

  const [newsletterState, setNewsletterState] = useState<NewsletterState>({
    isSubscribing: false,
    isUnsubscribing: false,
    isSubscribed: null,
    subscriptionStatus: null,
    error: null,
  });

  // Check subscription status
  const subscriptionQuery = useQuery({
    queryKey: email ? QUERY_KEYS.subscription(email) : [],
    queryFn: async () => {
      if (!email) return null;
      
      const response = await api.get<{
        subscription: NewsletterSubscription | null;
        isSubscribed: boolean;
      }>(`/newsletter/subscription/${encodeURIComponent(email)}`);
      
      return response;
    },
    enabled: !!email,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (data: SubscribeData) => {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await api.post<{
        subscription: NewsletterSubscription;
        message: string;
        isNewSubscription: boolean;
      }>('/newsletter/subscribe', data);

      if (!response) {
        throw new Error('Subscription failed');
      }

      return response;
    },
    onMutate: () => {
      setNewsletterState(prev => ({
        ...prev,
        isSubscribing: true,
        error: null,
      }));
    },
    onSuccess: (data) => {
      setNewsletterState(prev => ({
        ...prev,
        isSubscribing: false,
        isSubscribed: true,
        subscriptionStatus: 'active',
        error: null,
      }));

      // Update cache
      if (data.subscription.email) {
        queryClient.setQueryData(
          QUERY_KEYS.subscription(data.subscription.email),
          {
            subscription: data.subscription,
            isSubscribed: true,
          }
        );
      }

      // Invalidate subscriptions list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions });

      const message = data.isNewSubscription 
        ? 'Successfully subscribed to newsletter! Please check your email to confirm.'
        : 'Subscription preferences updated successfully!';
      
      toast.success(message);
    },
    onError: (error: Error) => {
      setNewsletterState(prev => ({
        ...prev,
        isSubscribing: false,
        error: error.message,
      }));

      toast.error(error.message || 'Subscription failed');
    },
  });

  // Unsubscribe mutation
  const unsubscribeMutation = useMutation({
    mutationFn: async ({ email, token }: { email: string; token?: string }) => {
      const endpoint = token 
        ? `/newsletter/unsubscribe/${token}`
        : `/newsletter/unsubscribe`;
      
      const payload = token ? {} : { email };

      const response = await api.post<{
        message: string;
        email: string;
      }>(endpoint, payload);

      if (!response) {
        throw new Error('Unsubscribe failed');
      }

      return response;
    },
    onMutate: () => {
      setNewsletterState(prev => ({
        ...prev,
        isUnsubscribing: true,
        error: null,
      }));
    },
    onSuccess: (data) => {
      setNewsletterState(prev => ({
        ...prev,
        isUnsubscribing: false,
        isSubscribed: false,
        subscriptionStatus: 'unsubscribed',
        error: null,
      }));

      // Update cache
      queryClient.setQueryData(
        QUERY_KEYS.subscription(data.email),
        {
          subscription: null,
          isSubscribed: false,
        }
      );

      // Invalidate subscriptions list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscriptions });

      toast.success(data.message || 'Successfully unsubscribed from newsletter');
    },
    onError: (error: Error) => {
      setNewsletterState(prev => ({
        ...prev,
        isUnsubscribing: false,
        error: error.message,
      }));

      toast.error(error.message || 'Unsubscribe failed');
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async ({ 
      email, 
      preferences 
    }: { 
      email: string; 
      preferences: Partial<NewsletterSubscription['preferences']> 
    }) => {
      const response = await api.put<{
        subscription: NewsletterSubscription;
        message: string;
      }>(`/newsletter/preferences`, {
        email,
        preferences,
      });

      if (!response) {
        throw new Error('Failed to update preferences');
      }

      return response;
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(
        QUERY_KEYS.subscription(data.subscription.email),
        {
          subscription: data.subscription,
          isSubscribed: data.subscription.status === 'active',
        }
      );

      toast.success(data.message || 'Preferences updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update preferences');
    },
  });

  // Subscribe function
  const subscribe = useCallback((data: SubscribeData) => {
    subscribeMutation.mutate(data);
  }, [subscribeMutation]);

  // Unsubscribe function
  const unsubscribe = useCallback((email: string, token?: string) => {
    unsubscribeMutation.mutate({ email, token });
  }, [unsubscribeMutation]);

  // Update preferences function
  const updatePreferences = useCallback((
    email: string, 
    preferences: Partial<NewsletterSubscription['preferences']>
  ) => {
    updatePreferencesMutation.mutate({ email, preferences });
  }, [updatePreferencesMutation]);

  // Quick subscribe with just email
  const quickSubscribe = useCallback((email: string) => {
    subscribe({ email });
  }, [subscribe]);

  // Validate email function
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Check if email is subscribed
  const isEmailSubscribed = useCallback((): boolean => {
    if (!subscriptionQuery.data) return false;
    return subscriptionQuery.data.isSubscribed;
  }, [subscriptionQuery.data]);

  // Get subscription data
  const getSubscription = useCallback((): NewsletterSubscription | null => {
    return subscriptionQuery.data?.subscription || null;
  }, [subscriptionQuery.data]);

  return {
    // State
    isSubscribing: newsletterState.isSubscribing || subscribeMutation.isPending,
    isUnsubscribing: newsletterState.isUnsubscribing || unsubscribeMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    isSubscribed: subscriptionQuery.data?.isSubscribed ?? newsletterState.isSubscribed,
    subscriptionStatus: subscriptionQuery.data?.subscription?.status ?? newsletterState.subscriptionStatus,
    error: newsletterState.error || subscriptionQuery.error?.message,
    
    // Query states
    isLoading: subscriptionQuery.isLoading,
    isError: subscriptionQuery.isError,
    
    // Data
    subscription: subscriptionQuery.data?.subscription,
    
    // Actions
    subscribe,
    unsubscribe,
    updatePreferences,
    quickSubscribe,
    refetch: subscriptionQuery.refetch,
    
    // Utilities
    validateEmail,
    isEmailSubscribed,
    getSubscription,
  };
};

export default useNewsletter;
