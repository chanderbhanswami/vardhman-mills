import { useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  brand?: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  specifications: Record<string, string | number | boolean>;
  features: string[];
  addedAt: Date;
}

export interface SyncResponse {
  success: boolean;
  synced: CompareProduct[];
  conflicts: Array<{
    productId: string;
    localVersion: Date;
    serverVersion: Date;
    resolution: 'local' | 'server';
  }>;
  message: string;
}

export interface UseCompareSyncOptions {
  enableAutoSync?: boolean;
  syncInterval?: number; // in milliseconds
  conflictResolution?: 'local' | 'server' | 'merge';
  enableToast?: boolean;
}

export const useCompareSync = (options: UseCompareSyncOptions = {}) => {
  const {
    enableAutoSync = true,
    syncInterval = 5 * 60 * 1000, // 5 minutes
    conflictResolution = 'merge',
    enableToast = true,
  } = options;

  const { user, isAuthenticated } = useAuth();

  // Sync compare list with server
  const syncMutation = useMutation({
    mutationFn: async (localCompareList: CompareProduct[]): Promise<SyncResponse> => {
      if (!isAuthenticated || !user?.id) {
        throw new Error('User must be authenticated to sync compare list');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock server comparison logic
      const serverCompareList: CompareProduct[] = [
        // Mock some server data that might conflict
        ...(Math.random() > 0.7 ? [{
          id: `server_product_${Date.now()}`,
          name: 'Server Product',
          slug: 'server-product',
          price: 1500,
          image: '/images/server-product.jpg',
          brand: 'Server Brand',
          category: 'Electronics',
          rating: 4.2,
          reviewCount: 85,
          inStock: true,
          specifications: { serverSpec: 'server value' },
          features: ['Server Feature'],
          addedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        }] : []),
      ];

      // Detect conflicts
      const conflicts = localCompareList
        .filter(localItem => {
          const serverItem = serverCompareList.find(s => s.id === localItem.id);
          return serverItem && serverItem.addedAt.getTime() !== localItem.addedAt.getTime();
        })
        .map(item => ({
          productId: item.id,
          localVersion: item.addedAt,
          serverVersion: serverCompareList.find(s => s.id === item.id)?.addedAt || new Date(),
          resolution: conflictResolution as 'local' | 'server',
        }));

      // Merge logic based on conflict resolution
      let syncedList: CompareProduct[] = [];
      
      switch (conflictResolution) {
        case 'local':
          syncedList = localCompareList;
          break;
        case 'server':
          syncedList = serverCompareList;
          break;
        case 'merge':
          // Merge by keeping most recent items and avoiding duplicates
          const allItems = [...localCompareList, ...serverCompareList];
          const uniqueItems = new Map<string, CompareProduct>();
          
          allItems.forEach(item => {
            const existing = uniqueItems.get(item.id);
            if (!existing || item.addedAt > existing.addedAt) {
              uniqueItems.set(item.id, item);
            }
          });
          
          syncedList = Array.from(uniqueItems.values());
          break;
      }

      return {
        success: true,
        synced: syncedList,
        conflicts,
        message: `Compare list synced successfully. ${conflicts.length} conflicts resolved.`,
      };
    },
    onSuccess: (response) => {
      // Update localStorage with synced data
      try {
        localStorage.setItem('vardhman_compare', JSON.stringify(response.synced));
      } catch (error) {
        console.error('Error updating localStorage after sync:', error);
      }

      if (enableToast) {
        if (response.conflicts.length > 0) {
          toast.success(
            `Compare list synced with ${response.conflicts.length} conflict${response.conflicts.length > 1 ? 's' : ''} resolved`,
            { duration: 3000, icon: '🔄' }
          );
        } else {
          toast.success('Compare list synced successfully', {
            duration: 2000,
            icon: '✅',
          });
        }
      }
    },
    onError: (error) => {
      if (enableToast) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to sync compare list',
          { duration: 4000 }
        );
      }
    },
  });

  // Get local compare list
  const getLocalCompareList = useCallback((): CompareProduct[] => {
    try {
      const stored = localStorage.getItem('vardhman_compare');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading local compare list:', error);
    }
    return [];
  }, []);

  // Manual sync function
  const syncCompareList = useCallback(
    async (localList?: CompareProduct[]) => {
      const compareList = localList || getLocalCompareList();
      return syncMutation.mutateAsync(compareList);
    },
    [syncMutation, getLocalCompareList]
  );

  // Force sync from server (overwrites local)
  const forceServerSync = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User must be authenticated to sync');
    }

    try {
      // Simulate fetching server data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock server data
      const serverData: CompareProduct[] = [];
      
      localStorage.setItem('vardhman_compare', JSON.stringify(serverData));
      
      if (enableToast) {
        toast.success('Compare list synced from server', {
          duration: 2000,
          icon: '⬇️',
        });
      }
      
      return serverData;
    } catch (error) {
      if (enableToast) {
        toast.error('Failed to sync from server', { duration: 4000 });
      }
      throw error;
    }
  }, [isAuthenticated, user?.id, enableToast]);

  // Push local data to server (overwrites server)
  const pushToServer = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User must be authenticated to sync');
    }

    const localList = getLocalCompareList();
    
    try {
      // Simulate pushing to server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (enableToast) {
        toast.success(
          `${localList.length} compare items pushed to server`,
          { duration: 2000, icon: '⬆️' }
        );
      }
      
      return localList;
    } catch (error) {
      if (enableToast) {
        toast.error('Failed to push to server', { duration: 4000 });
      }
      throw error;
    }
  }, [isAuthenticated, user?.id, getLocalCompareList, enableToast]);

  // Check sync status
  const getSyncStatus = useCallback(() => {
    const lastSync = localStorage.getItem('vardhman_compare_last_sync');
    const lastSyncTime = lastSync ? new Date(lastSync) : null;
    const now = new Date();
    const isOverdue = lastSyncTime ? (now.getTime() - lastSyncTime.getTime()) > syncInterval : true;
    
    return {
      lastSync: lastSyncTime,
      isOverdue,
      timeSinceLastSync: lastSyncTime ? now.getTime() - lastSyncTime.getTime() : null,
      nextSyncDue: lastSyncTime ? new Date(lastSyncTime.getTime() + syncInterval) : now,
    };
  }, [syncInterval]);

  // Auto-sync effect
  useEffect(() => {
    if (!enableAutoSync || !isAuthenticated) return;

    const syncInterval_id = setInterval(() => {
      const { isOverdue } = getSyncStatus();
      if (isOverdue) {
        const localList = getLocalCompareList();
        if (localList.length > 0) {
          syncCompareList(localList).then(() => {
            localStorage.setItem('vardhman_compare_last_sync', new Date().toISOString());
          }).catch(error => {
            console.error('Auto-sync failed:', error);
          });
        }
      }
    }, Math.min(syncInterval, 60 * 1000)); // Check at most every minute

    // Cleanup
    return () => clearInterval(syncInterval_id);
  }, [enableAutoSync, isAuthenticated, syncInterval, getSyncStatus, getLocalCompareList, syncCompareList]);

  // Sync on authentication change
  useEffect(() => {
    if (isAuthenticated && enableAutoSync) {
      const { isOverdue } = getSyncStatus();
      if (isOverdue) {
        const localList = getLocalCompareList();
        if (localList.length > 0) {
          syncCompareList(localList).then(() => {
            localStorage.setItem('vardhman_compare_last_sync', new Date().toISOString());
          }).catch(error => {
            console.error('Login sync failed:', error);
          });
        }
      }
    }
  }, [isAuthenticated, enableAutoSync, getSyncStatus, getLocalCompareList, syncCompareList]);

  return {
    // Actions
    syncCompareList,
    forceServerSync,
    pushToServer,
    
    // Utilities
    getSyncStatus,
    getLocalCompareList,
    
    // State
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
    lastSyncResult: syncMutation.data,
    
    // Configuration
    isAutoSyncEnabled: enableAutoSync && isAuthenticated,
    syncInterval,
  };
};

export default useCompareSync;
