import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export interface GiftCardFilters {
  status?: string[];
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
}

export interface UseGiftCardsOptions {
  autoLoad?: boolean;
  includeTransactions?: boolean;
  enableRealtime?: boolean;
}

export const useGiftCards = (options: UseGiftCardsOptions = {}) => {
  const {
    autoLoad = true,
    includeTransactions = false,
    enableRealtime = false,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [filters, setFilters] = useState<GiftCardFilters>({});

  // Realtime subscription effect
  useEffect(() => {
    if (!enableRealtime || !isAuthenticated) return;

    // Simulate realtime updates every 30 seconds
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [enableRealtime, isAuthenticated, queryClient]);

  // Fetch gift cards query
  const {
    data: giftCards = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['giftCards', user?.id, { filters, includeTransactions }],
    queryFn: async (): Promise<GiftCard[]> => {
      if (!isAuthenticated) {
        return [];
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock gift card data
      const mockGiftCards: GiftCard[] = [
        {
          id: 'gc_1',
          code: 'GC-2024-001',
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
          message: 'Happy Birthday! Hope you find something you love.',
          design: 'birthday',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          lastUsedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
        {
          id: 'gc_2',
          code: 'GC-2024-002',
          balance: 2500,
          originalAmount: 2500,
          usedAmount: 0,
          currency: 'INR',
          status: 'active',
          issuedTo: {
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'John Doe',
            email: user?.email || 'john@example.com',
          },
          message: 'Congratulations on your promotion!',
          design: 'celebration',
          expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        },
        {
          id: 'gc_3',
          code: 'GC-2023-045',
          balance: 0,
          originalAmount: 500,
          usedAmount: 500,
          currency: 'INR',
          status: 'exhausted',
          issuedTo: {
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'John Doe',
            email: user?.email || 'john@example.com',
          },
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 4 months ago
          lastUsedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
        },
        {
          id: 'gc_4',
          code: 'GC-2023-020',
          balance: 0,
          originalAmount: 1000,
          usedAmount: 0,
          currency: 'INR',
          status: 'expired',
          expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Expired 30 days ago
          createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // Over 1 year ago
        },
      ];

      // Apply filters
      let filteredCards = mockGiftCards;

      if (filters.status && filters.status.length > 0) {
        filteredCards = filteredCards.filter(card => 
          filters.status!.includes(card.status)
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredCards = filteredCards.filter(card =>
          card.code.toLowerCase().includes(searchLower) ||
          card.message?.toLowerCase().includes(searchLower) ||
          card.issuedBy?.name.toLowerCase().includes(searchLower)
        );
      }

      if (filters.dateRange) {
        const { from, to } = filters.dateRange;
        filteredCards = filteredCards.filter(card =>
          card.createdAt >= from && card.createdAt <= to
        );
      }

      if (filters.amountRange) {
        const { min, max } = filters.amountRange;
        filteredCards = filteredCards.filter(card =>
          card.originalAmount >= min && card.originalAmount <= max
        );
      }

      return filteredCards;
    },
    enabled: autoLoad && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch gift card transactions
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
  } = useQuery({
    queryKey: ['giftCardTransactions', user?.id],
    queryFn: async (): Promise<GiftCardTransaction[]> => {
      if (!includeTransactions || !isAuthenticated) {
        return [];
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock transaction data
      return [
        {
          id: 'tx_1',
          giftCardId: 'gc_1',
          type: 'purchase',
          amount: 1500,
          description: 'Gift card purchased',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'tx_2',
          giftCardId: 'gc_1',
          type: 'redemption',
          amount: -500,
          orderId: 'order_123',
          description: 'Used for order #123',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'tx_3',
          giftCardId: 'gc_2',
          type: 'purchase',
          amount: 2500,
          description: 'Gift card received',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
      ];
    },
    enabled: includeTransactions && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Check gift card balance mutation
  const checkBalanceMutation = useMutation({
    mutationFn: async (giftCardCode: string): Promise<GiftCard> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const giftCard = giftCards.find(gc => gc.code === giftCardCode);
      
      if (!giftCard) {
        throw new Error('Gift card not found');
      }

      return giftCard;
    },
    onSuccess: (giftCard) => {
      toast.success(
        `Gift card balance: ₹${giftCard.balance}`,
        { duration: 3000, icon: '💳' }
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to check gift card balance',
        { duration: 4000 }
      );
    },
  });

  // Helper functions
  const getTotalBalance = useCallback((): number => {
    return giftCards
      .filter(card => card.status === 'active')
      .reduce((total, card) => total + card.balance, 0);
  }, [giftCards]);

  const getActiveCards = useCallback(() => {
    return giftCards.filter(card => card.status === 'active' && card.balance > 0);
  }, [giftCards]);

  const getExpiredCards = useCallback(() => {
    return giftCards.filter(card => card.status === 'expired');
  }, [giftCards]);

  const getExhaustedCards = useCallback(() => {
    return giftCards.filter(card => card.status === 'exhausted');
  }, [giftCards]);

  const getGiftCardById = useCallback(
    (id: string): GiftCard | undefined => {
      return giftCards.find(card => card.id === id);
    },
    [giftCards]
  );

  const getGiftCardByCode = useCallback(
    (code: string): GiftCard | undefined => {
      return giftCards.find(card => card.code === code);
    },
    [giftCards]
  );

  const isGiftCardValid = useCallback(
    (giftCard: GiftCard): boolean => {
      if (giftCard.status !== 'active') return false;
      if (giftCard.balance <= 0) return false;
      if (giftCard.expiresAt && giftCard.expiresAt < new Date()) return false;
      return true;
    },
    []
  );

  const getTransactionsForCard = useCallback(
    (giftCardId: string): GiftCardTransaction[] => {
      return transactions.filter(tx => tx.giftCardId === giftCardId);
    },
    [transactions]
  );

  const getGiftCardStats = useCallback(() => {
    const activeCards = getActiveCards();
    const totalBalance = getTotalBalance();
    const totalValue = giftCards.reduce((sum, card) => sum + card.originalAmount, 0);
    const totalUsed = giftCards.reduce((sum, card) => sum + card.usedAmount, 0);

    return {
      totalCards: giftCards.length,
      activeCards: activeCards.length,
      expiredCards: getExpiredCards().length,
      exhaustedCards: getExhaustedCards().length,
      totalBalance,
      totalValue,
      totalUsed,
      utilizationRate: totalValue > 0 ? (totalUsed / totalValue) * 100 : 0,
    };
  }, [giftCards, getActiveCards, getTotalBalance, getExpiredCards, getExhaustedCards]);

  // Filter functions
  const applyFilters = useCallback(
    (newFilters: Partial<GiftCardFilters>) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const checkBalance = useCallback(
    async (giftCardCode: string) => {
      return checkBalanceMutation.mutateAsync(giftCardCode);
    },
    [checkBalanceMutation]
  );

  return {
    // Data
    giftCards,
    transactions,
    activeCards: getActiveCards(),
    expiredCards: getExpiredCards(),
    exhaustedCards: getExhaustedCards(),
    
    // State
    isLoading,
    isLoadingTransactions,
    error,
    filters,
    
    // Actions
    checkBalance,
    refetch,
    
    // Filters
    applyFilters,
    clearFilters,
    
    // Utilities
    getTotalBalance,
    getGiftCardById,
    getGiftCardByCode,
    isGiftCardValid,
    getTransactionsForCard,
    getGiftCardStats,
    
    // Stats
    totalBalance: getTotalBalance(),
    stats: getGiftCardStats(),
    
    // Mutation state
    isCheckingBalance: checkBalanceMutation.isPending,
    balanceCheckError: checkBalanceMutation.error,
  };
};

export default useGiftCards;
