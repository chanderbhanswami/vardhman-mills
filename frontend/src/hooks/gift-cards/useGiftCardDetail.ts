import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  originalAmount: number;
  usedAmount: number;
  currency: string;
  status: 'active' | 'expired' | 'exhausted' | 'cancelled';
  issuedTo?: {
    name: string;
    email: string;
    phone?: string;
  };
  issuedBy?: {
    name: string;
    email: string;
  };
  message?: string;
  design?: string;
  expiresAt?: Date;
  createdAt: Date;
  lastUsedAt?: Date;
  transactions?: GiftCardTransaction[];
}

export interface GiftCardTransaction {
  id: string;
  giftCardId: string;
  type: 'purchase' | 'redemption' | 'refund';
  amount: number;
  orderId?: string;
  description: string;
  createdAt: Date;
}

export interface UseGiftCardDetailOptions {
  includeTransactions?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useGiftCardDetail = (
  giftCardId: string | null,
  options: UseGiftCardDetailOptions = {}
) => {
  const {
    includeTransactions = true,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const { user, isAuthenticated } = useAuth();

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch gift card details
  const {
    data: giftCard,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['giftCard', giftCardId, { includeTransactions }],
    queryFn: async (): Promise<GiftCard> => {
      if (!giftCardId) {
        throw new Error('Gift card ID is required');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock gift card detail
      const mockTransactions: GiftCardTransaction[] = includeTransactions ? [
        {
          id: 'tx_1',
          giftCardId,
          type: 'purchase',
          amount: 1500,
          description: 'Gift card purchased by Sister Sarah',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'tx_2',
          giftCardId,
          type: 'redemption',
          amount: -300,
          orderId: 'ORD-2024-001',
          description: 'Used for order ORD-2024-001 - Electronics purchase',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'tx_3',
          giftCardId,
          type: 'redemption',
          amount: -200,
          orderId: 'ORD-2024-015',
          description: 'Used for order ORD-2024-015 - Clothing purchase',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      ] : [];

      const mockGiftCard: GiftCard = {
        id: giftCardId,
        code: `GC-2024-${giftCardId.slice(-3).toUpperCase()}`,
        balance: 1000,
        originalAmount: 1500,
        usedAmount: 500,
        currency: 'INR',
        status: 'active',
        issuedTo: {
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'John Doe',
          email: user?.email || 'john@example.com',
          phone: '+91 9876543210',
        },
        issuedBy: {
          name: 'Sister Sarah',
          email: 'sarah@example.com',
        },
        message: 'Happy Birthday! Hope you find something you love. Enjoy shopping!',
        design: 'birthday',
        expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), // ~11 months
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastUsedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        transactions: mockTransactions,
      };

      return mockGiftCard;
    },
    enabled: !!giftCardId && isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Refresh balance mutation
  const refreshBalanceMutation = useMutation({
    mutationFn: async (): Promise<GiftCard> => {
      if (!giftCardId) {
        throw new Error('Gift card ID is required');
      }

      setIsRefreshing(true);

      // Simulate API call to refresh balance
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Return updated gift card (simulate small balance change)
      const updatedBalance = (giftCard?.balance || 0) + Math.floor(Math.random() * 10) - 5;
      
      const updatedGiftCard: GiftCard = {
        ...giftCard!,
        balance: Math.max(0, updatedBalance),
        lastUsedAt: new Date(),
      };

      return updatedGiftCard;
    },
    onSuccess: (updatedCard) => {
      setIsRefreshing(false);
      toast.success(
        `Balance updated: ₹${updatedCard.balance}`,
        { duration: 3000, icon: '🔄' }
      );
    },
    onError: (error) => {
      setIsRefreshing(false);
      toast.error(
        error instanceof Error ? error.message : 'Failed to refresh balance',
        { duration: 4000 }
      );
    },
  });

  // Add funds mutation (for demonstration)
  const addFundsMutation = useMutation({
    mutationFn: async (amount: number): Promise<GiftCard> => {
      if (!giftCardId) {
        throw new Error('Gift card ID is required');
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      const updatedGiftCard: GiftCard = {
        ...giftCard!,
        balance: giftCard!.balance + amount,
        originalAmount: giftCard!.originalAmount + amount,
      };

      return updatedGiftCard;
    },
    onSuccess: (updatedCard, amount) => {
      toast.success(
        `₹${amount} added to gift card. New balance: ₹${updatedCard.balance}`,
        { duration: 3000, icon: '💰' }
      );
      refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add funds',
        { duration: 4000 }
      );
    },
  });

  // Helper functions
  const getUsagePercentage = useCallback((): number => {
    if (!giftCard || giftCard.originalAmount === 0) return 0;
    return (giftCard.usedAmount / giftCard.originalAmount) * 100;
  }, [giftCard]);

  const getDaysUntilExpiry = useCallback((): number | null => {
    if (!giftCard?.expiresAt) return null;
    const now = new Date();
    const diffTime = giftCard.expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [giftCard]);

  const isExpiringSoon = useCallback((): boolean => {
    const daysUntilExpiry = getDaysUntilExpiry();
    return daysUntilExpiry !== null && daysUntilExpiry <= 30;
  }, [getDaysUntilExpiry]);

  const isExpired = useCallback((): boolean => {
    const daysUntilExpiry = getDaysUntilExpiry();
    return daysUntilExpiry !== null && daysUntilExpiry <= 0;
  }, [getDaysUntilExpiry]);

  const canBeUsed = useCallback((): boolean => {
    if (!giftCard) return false;
    return giftCard.status === 'active' && giftCard.balance > 0 && !isExpired();
  }, [giftCard, isExpired]);

  const getTransactionsSummary = useCallback(() => {
    if (!giftCard?.transactions) return null;

    const purchases = giftCard.transactions.filter(tx => tx.type === 'purchase');
    const redemptions = giftCard.transactions.filter(tx => tx.type === 'redemption');
    const refunds = giftCard.transactions.filter(tx => tx.type === 'refund');

    return {
      totalTransactions: giftCard.transactions.length,
      purchases: {
        count: purchases.length,
        amount: purchases.reduce((sum, tx) => sum + tx.amount, 0),
      },
      redemptions: {
        count: redemptions.length,
        amount: Math.abs(redemptions.reduce((sum, tx) => sum + tx.amount, 0)),
      },
      refunds: {
        count: refunds.length,
        amount: refunds.reduce((sum, tx) => sum + tx.amount, 0),
      },
    };
  }, [giftCard]);

  const getRecentTransactions = useCallback((limit: number = 5) => {
    if (!giftCard?.transactions) return [];
    
    return giftCard.transactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }, [giftCard]);

  const formatGiftCardCode = useCallback((code: string): string => {
    // Format code with dashes for better readability
    return code.replace(/(.{2})/g, '$1-').slice(0, -1);
  }, []);

  // Actions
  const refreshBalance = useCallback(async () => {
    return refreshBalanceMutation.mutateAsync();
  }, [refreshBalanceMutation]);

  const addFunds = useCallback(async (amount: number) => {
    return addFundsMutation.mutateAsync(amount);
  }, [addFundsMutation]);

  const copyGiftCardCode = useCallback(() => {
    if (!giftCard) return;
    
    navigator.clipboard.writeText(giftCard.code).then(() => {
      toast.success('Gift card code copied to clipboard', {
        duration: 2000,
        icon: '📋',
      });
    }).catch(() => {
      toast.error('Failed to copy code', { duration: 3000 });
    });
  }, [giftCard]);

  return {
    // Data
    giftCard,
    transactions: giftCard?.transactions || [],
    recentTransactions: getRecentTransactions(),
    
    // State
    isLoading,
    error,
    isRefreshing: isRefreshing || refreshBalanceMutation.isPending,
    
    // Actions
    refreshBalance,
    addFunds,
    copyGiftCardCode,
    refetch,
    
    // Computed values
    usagePercentage: getUsagePercentage(),
    daysUntilExpiry: getDaysUntilExpiry(),
    isExpiringSoon: isExpiringSoon(),
    isExpired: isExpired(),
    canBeUsed: canBeUsed(),
    transactionsSummary: getTransactionsSummary(),
    formattedCode: giftCard ? formatGiftCardCode(giftCard.code) : '',
    
    // Mutation states
    isAddingFunds: addFundsMutation.isPending,
    addFundsError: addFundsMutation.error,
    refreshError: refreshBalanceMutation.error,
  };
};

export default useGiftCardDetail;
