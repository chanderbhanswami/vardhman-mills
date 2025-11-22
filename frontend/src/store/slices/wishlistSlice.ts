import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProductTypes } from '@/types';

// Enhanced Wishlist Item Interface
interface WishlistItem {
  id: string;
  product: ProductTypes.Product;
  addedAt: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  priceAlert?: {
    enabled: boolean;
    targetPrice: number;
    notified: boolean;
  };
  collection?: string;
  tags: string[];
  viewCount: number;
  lastViewedAt: string;
  shareCount: number;
  purchaseIntent: 'low' | 'medium' | 'high';
  compareList: boolean;
}

interface WishlistCollection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  coverImage?: string;
}

interface WishlistShare {
  id: string;
  wishlistId: string;
  shareToken: string;
  expiresAt?: string;
  viewCount: number;
  canEdit: boolean;
  sharedBy: string;
  sharedWith?: string[];
  createdAt: string;
}

interface WishlistRecommendation {
  productId: string;
  product: ProductTypes.Product;
  reason: 'similar_style' | 'price_match' | 'frequently_bought_together' | 'trending' | 'back_in_stock';
  confidence: number;
  basedOn: string[];
}

interface WishlistAnalytics {
  totalItems: number;
  totalValue: number;
  averageItemPrice: number;
  priceDistribution: {
    under100: number;
    '100to500': number;
    '500to1000': number;
    '1000to5000': number;
    above5000: number;
  };
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
    percentage: number;
  }>;
  brandBreakdown: Array<{
    brandId: string;
    brandName: string;
    count: number;
    value: number;
  }>;
  addedThisMonth: number;
  removedThisMonth: number;
  purchasedThisMonth: number;
  conversionRate: number;
  topPriorityItems: number;
  itemsWithPriceAlerts: number;
  publicCollections: number;
  shareCount: number;
}

interface WishlistPreferences {
  autoAddToCollection: boolean;
  defaultPriority: 'low' | 'medium' | 'high';
  enablePriceAlerts: boolean;
  enableStockAlerts: boolean;
  enableRecommendations: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  defaultSort: 'added_date' | 'price_asc' | 'price_desc' | 'priority' | 'alphabetical';
  itemsPerPage: number;
  gridView: boolean;
  showPriceHistory: boolean;
  autoRemoveAfterPurchase: boolean;
  shareWishlistPublicly: boolean;
}

interface WishlistState {
  // Core Data
  items: WishlistItem[];
  collections: WishlistCollection[];
  activeCollectionId: string | null;
  
  // Sharing and Social
  shares: WishlistShare[];
  sharedWishlists: Array<{
    id: string;
    ownerName: string;
    name: string;
    itemCount: number;
    lastUpdated: string;
    shareToken: string;
  }>;
  
  // Recommendations and Discovery
  recommendations: WishlistRecommendation[];
  trending: ProductTypes.Product[];
  recentlyViewed: ProductTypes.Product[];
  similarUsers: Array<{
    userId: string;
    userName: string;
    commonItems: number;
    recommendations: ProductTypes.Product[];
  }>;
  
  // Analytics and Insights
  analytics: WishlistAnalytics | null;
  priceHistory: Record<string, Array<{
    date: string;
    price: number;
    wasOnSale: boolean;
  }>>;
  
  // UI State
  view: 'grid' | 'list';
  sortBy: 'added_date' | 'price_asc' | 'price_desc' | 'priority' | 'alphabetical';
  filterBy: {
    collection?: string;
    priority?: 'low' | 'medium' | 'high';
    priceRange?: { min: number; max: number };
    category?: string;
    brand?: string;
    availability?: 'in_stock' | 'out_of_stock' | 'all';
    priceAlert?: boolean;
    tags?: string[];
  };
  searchQuery: string;
  selectedItems: string[];
  
  // State Management
  isLoading: boolean;
  error: string | null;
  lastSynced: string | null;
  preferences: WishlistPreferences;
  
  // Bulk Operations
  bulkOperation: {
    isActive: boolean;
    type: 'move' | 'delete' | 'add_to_cart' | 'share' | 'tag' | null;
    selectedCount: number;
  };
  
  // Price Alerts
  priceAlerts: Array<{
    productId: string;
    currentPrice: number;
    targetPrice: number;
    enabled: boolean;
    triggered: boolean;
    triggeredAt?: string;
  }>;
  
  // Stock Alerts
  stockAlerts: Array<{
    productId: string;
    notified: boolean;
    notifiedAt?: string;
  }>;
}

const initialState: WishlistState = {
  items: [],
  collections: [{
    id: 'default',
    name: 'My Wishlist',
    description: 'Default wishlist collection',
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    itemCount: 0,
  }],
  activeCollectionId: 'default',
  shares: [],
  sharedWishlists: [],
  recommendations: [],
  trending: [],
  recentlyViewed: [],
  similarUsers: [],
  analytics: null,
  priceHistory: {},
  view: 'grid',
  sortBy: 'added_date',
  filterBy: {},
  searchQuery: '',
  selectedItems: [],
  isLoading: false,
  error: null,
  lastSynced: null,
  preferences: {
    autoAddToCollection: false,
    defaultPriority: 'medium',
    enablePriceAlerts: true,
    enableStockAlerts: true,
    enableRecommendations: true,
    emailNotifications: true,
    pushNotifications: false,
    defaultSort: 'added_date',
    itemsPerPage: 20,
    gridView: true,
    showPriceHistory: true,
    autoRemoveAfterPurchase: false,
    shareWishlistPublicly: false,
  },
  bulkOperation: {
    isActive: false,
    type: null,
    selectedCount: 0,
  },
  priceAlerts: [],
  stockAlerts: [],
};

// Async Thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/wishlist');
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlistAsync = createAsyncThunk(
  'wishlist/addToWishlistAsync',
  async (params: {
    product: ProductTypes.Product;
    collectionId?: string;
    priority?: 'low' | 'medium' | 'high';
    notes?: string;
    tags?: string[];
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/wishlist/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to add item to wishlist');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/removeFromWishlistAsync',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/wishlist/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove item from wishlist');
      return itemId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove from wishlist');
    }
  }
);

export const moveToCollection = createAsyncThunk(
  'wishlist/moveToCollection',
  async (params: { itemIds: string[]; targetCollectionId: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/wishlist/items/move', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to move items');
      return params;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to move items');
    }
  }
);

export const createCollection = createAsyncThunk(
  'wishlist/createCollection',
  async (collection: Omit<WishlistCollection, 'id' | 'createdAt' | 'updatedAt' | 'itemCount'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/wishlist/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collection),
      });
      if (!response.ok) throw new Error('Failed to create collection');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create collection');
    }
  }
);

export const shareWishlist = createAsyncThunk(
  'wishlist/shareWishlist',
  async (params: {
    collectionId: string;
    expiresAt?: string;
    canEdit?: boolean;
    sharedWith?: string[];
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/wishlist/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to share wishlist');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to share wishlist');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'wishlist/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/wishlist/recommendations');
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch recommendations');
    }
  }
);

export const updatePriceAlert = createAsyncThunk(
  'wishlist/updatePriceAlert',
  async (params: {
    itemId: string;
    enabled: boolean;
    targetPrice?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/wishlist/items/${params.itemId}/price-alert`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to update price alert');
      return { ...params };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update price alert');
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'wishlist/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/wishlist/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch analytics');
    }
  }
);

export const bulkAddToCart = createAsyncThunk(
  'wishlist/bulkAddToCart',
  async (itemIds: string[], { rejectWithValue }) => {
    try {
      const response = await fetch('/api/wishlist/bulk/add-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds }),
      });
      if (!response.ok) throw new Error('Failed to add items to cart');
      return itemIds;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  }
);

export const syncWishlist = createAsyncThunk(
  'wishlist/syncWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/wishlist/sync', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to sync wishlist');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to sync wishlist');
    }
  }
);

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Backward compatibility - legacy methods from original slice
    setWishlist: (state, action: PayloadAction<ProductTypes.Product[]>) => {
      state.items = action.payload.map(product => ({
        id: product.id || Date.now().toString(),
        product,
        addedAt: new Date().toISOString(),
        priority: 'medium',
        tags: [],
        viewCount: 0,
        lastViewedAt: new Date().toISOString(),
        shareCount: 0,
        purchaseIntent: 'medium',
        compareList: false,
        collection: 'default',
      }));
    },
    
    addToWishlist: (state, action: PayloadAction<ProductTypes.Product>) => {
      const exists = state.items.find(item => item.product.id === action.payload.id);
      if (!exists) {
        const newItem: WishlistItem = {
          id: Date.now().toString(),
          product: action.payload,
          addedAt: new Date().toISOString(),
          priority: state.preferences.defaultPriority,
          tags: [],
          viewCount: 0,
          lastViewedAt: new Date().toISOString(),
          shareCount: 0,
          purchaseIntent: 'medium',
          compareList: false,
          collection: state.activeCollectionId || 'default',
        };
        state.items.push(newItem);
        
        // Update collection count
        const collection = state.collections.find(c => c.id === newItem.collection);
        if (collection) {
          collection.itemCount += 1;
          collection.updatedAt = new Date().toISOString();
        }
      }
    },
    
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.product.id === action.payload);
      if (item) {
        // Update collection count
        const collection = state.collections.find(c => c.id === item.collection);
        if (collection) {
          collection.itemCount = Math.max(0, collection.itemCount - 1);
          collection.updatedAt = new Date().toISOString();
        }
      }
      
      state.items = state.items.filter(item => item.product.id !== action.payload);
      state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
    },
    
    clearWishlist: (state) => {
      state.items = [];
      state.selectedItems = [];
      state.analytics = null;
    },
    
    setWishlistLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Enhanced methods for comprehensive functionality
    setView: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.view = action.payload;
    },
    
    setSortBy: (state, action: PayloadAction<typeof initialState.sortBy>) => {
      state.sortBy = action.payload;
    },
    
    setFilter: (state, action: PayloadAction<Partial<typeof initialState.filterBy>>) => {
      state.filterBy = { ...state.filterBy, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filterBy = {};
      state.searchQuery = '';
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    setActiveCollection: (state, action: PayloadAction<string>) => {
      state.activeCollectionId = action.payload;
    },
    
    // Selection management
    selectItem: (state, action: PayloadAction<string>) => {
      if (!state.selectedItems.includes(action.payload)) {
        state.selectedItems.push(action.payload);
      }
    },
    
    deselectItem: (state, action: PayloadAction<string>) => {
      state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
    },
    
    selectAllItems: (state) => {
      const visibleItems = state.items.filter(item => 
        !state.activeCollectionId || item.collection === state.activeCollectionId
      );
      state.selectedItems = visibleItems.map(item => item.id);
    },
    
    clearSelection: (state) => {
      state.selectedItems = [];
    },
    
    // Bulk operations
    startBulkOperation: (state, action: PayloadAction<'move' | 'delete' | 'add_to_cart' | 'share' | 'tag'>) => {
      state.bulkOperation = {
        isActive: true,
        type: action.payload,
        selectedCount: state.selectedItems.length,
      };
    },
    
    endBulkOperation: (state) => {
      state.bulkOperation = {
        isActive: false,
        type: null,
        selectedCount: 0,
      };
      state.selectedItems = [];
    },
    
    // Item management
    updateItemLocally: (state, action: PayloadAction<{ 
      itemId: string; 
      updates: Partial<WishlistItem> 
    }>) => {
      const item = state.items.find(item => item.id === action.payload.itemId);
      if (item) {
        Object.assign(item, action.payload.updates);
      }
    },
    
    incrementViewCount: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item) {
        item.viewCount += 1;
        item.lastViewedAt = new Date().toISOString();
      }
    },
    
    updateItemTags: (state, action: PayloadAction<{ itemId: string; tags: string[] }>) => {
      const item = state.items.find(item => item.id === action.payload.itemId);
      if (item) {
        item.tags = action.payload.tags;
      }
    },
    
    updateItemPriority: (state, action: PayloadAction<{ 
      itemId: string; 
      priority: 'low' | 'medium' | 'high' 
    }>) => {
      const item = state.items.find(item => item.id === action.payload.itemId);
      if (item) {
        item.priority = action.payload.priority;
      }
    },
    
    updateItemNotes: (state, action: PayloadAction<{ itemId: string; notes: string }>) => {
      const item = state.items.find(item => item.id === action.payload.itemId);
      if (item) {
        item.notes = action.payload.notes;
      }
    },
    
    // Collections management
    updateCollection: (state, action: PayloadAction<{ 
      collectionId: string; 
      updates: Partial<WishlistCollection> 
    }>) => {
      const collection = state.collections.find(c => c.id === action.payload.collectionId);
      if (collection) {
        Object.assign(collection, action.payload.updates);
        collection.updatedAt = new Date().toISOString();
      }
    },
    
    deleteCollection: (state, action: PayloadAction<string>) => {
      // Move items to default collection
      state.items.forEach(item => {
        if (item.collection === action.payload) {
          item.collection = 'default';
        }
      });
      
      // Remove collection
      state.collections = state.collections.filter(c => c.id !== action.payload);
      
      // Update active collection if deleted
      if (state.activeCollectionId === action.payload) {
        state.activeCollectionId = 'default';
      }
    },
    
    // Preferences
    updatePreferences: (state, action: PayloadAction<Partial<WishlistPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // Price history
    updatePriceHistory: (state, action: PayloadAction<{
      productId: string;
      price: number;
      wasOnSale: boolean;
    }>) => {
      const { productId, price, wasOnSale } = action.payload;
      if (!state.priceHistory[productId]) {
        state.priceHistory[productId] = [];
      }
      
      state.priceHistory[productId].push({
        date: new Date().toISOString().split('T')[0],
        price,
        wasOnSale,
      });
      
      // Keep only last 30 entries
      if (state.priceHistory[productId].length > 30) {
        state.priceHistory[productId] = state.priceHistory[productId].slice(-30);
      }
    },
    
    // Recently viewed
    addToRecentlyViewed: (state, action: PayloadAction<ProductTypes.Product>) => {
      const exists = state.recentlyViewed.find(p => p.id === action.payload.id);
      if (!exists) {
        state.recentlyViewed.unshift(action.payload);
        // Keep only last 20 items
        if (state.recentlyViewed.length > 20) {
          state.recentlyViewed = state.recentlyViewed.slice(0, 20);
        }
      }
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  
  extraReducers: (builder) => {
    // Fetch wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.collections = action.payload.collections || state.collections;
        state.analytics = action.payload.analytics || null;
        state.priceAlerts = action.payload.priceAlerts || [];
        state.stockAlerts = action.payload.stockAlerts || [];
        state.lastSynced = new Date().toISOString();
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Add to wishlist
      .addCase(addToWishlistAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const newItem: WishlistItem = {
          id: action.payload.id || Date.now().toString(),
          product: action.payload.product,
          addedAt: new Date().toISOString(),
          priority: action.payload.priority || 'medium',
          notes: action.payload.notes,
          collection: action.payload.collectionId || 'default',
          tags: action.payload.tags || [],
          viewCount: 0,
          lastViewedAt: new Date().toISOString(),
          shareCount: 0,
          purchaseIntent: 'medium',
          compareList: false,
        };
        
        // Check if item already exists
        const existingIndex = state.items.findIndex(item => item.product.id === newItem.product.id);
        if (existingIndex >= 0) {
          state.items[existingIndex] = newItem;
        } else {
          state.items.push(newItem);
        }
        
        // Update collection item count
        const collection = state.collections.find(c => c.id === newItem.collection);
        if (collection) {
          collection.itemCount += 1;
          collection.updatedAt = new Date().toISOString();
        }
      })
      .addCase(addToWishlistAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Remove from wishlist
      .addCase(removeFromWishlistAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const removedItem = state.items.find(item => item.id === action.payload);
        if (removedItem) {
          // Update collection item count
          const collection = state.collections.find(c => c.id === removedItem.collection);
          if (collection) {
            collection.itemCount = Math.max(0, collection.itemCount - 1);
            collection.updatedAt = new Date().toISOString();
          }
        }
        
        state.items = state.items.filter(item => item.id !== action.payload);
        state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
      })
      .addCase(removeFromWishlistAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
    
    // Move to collection
      .addCase(moveToCollection.fulfilled, (state, action) => {
        const { itemIds, targetCollectionId } = action.payload;
        itemIds.forEach(itemId => {
          const item = state.items.find(i => i.id === itemId);
          if (item) {
            // Update old collection count
            const oldCollection = state.collections.find(c => c.id === item.collection);
            if (oldCollection) {
              oldCollection.itemCount = Math.max(0, oldCollection.itemCount - 1);
            }
            
            // Update item collection
            item.collection = targetCollectionId;
            
            // Update new collection count
            const newCollection = state.collections.find(c => c.id === targetCollectionId);
            if (newCollection) {
              newCollection.itemCount += 1;
              newCollection.updatedAt = new Date().toISOString();
            }
          }
        });
      })
    
    // Create collection
      .addCase(createCollection.fulfilled, (state, action) => {
        state.collections.push(action.payload);
      })
    
    // Share wishlist
      .addCase(shareWishlist.fulfilled, (state, action) => {
        state.shares.push(action.payload);
      })
    
    // Fetch recommendations
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload.recommendations || [];
        state.trending = action.payload.trending || [];
        state.similarUsers = action.payload.similarUsers || [];
      })
    
    // Update price alert
      .addCase(updatePriceAlert.fulfilled, (state, action) => {
        const { itemId, enabled, targetPrice } = action.payload;
        const item = state.items.find(i => i.id === itemId);
        if (item) {
          item.priceAlert = {
            enabled,
            targetPrice: targetPrice || 0,
            notified: false,
          };
        }
        
        // Update price alerts array
        const alertIndex = state.priceAlerts.findIndex(alert => alert.productId === item?.product.id);
        if (alertIndex >= 0) {
          state.priceAlerts[alertIndex] = {
            ...state.priceAlerts[alertIndex],
            enabled,
            targetPrice: targetPrice || state.priceAlerts[alertIndex].targetPrice,
          };
        } else if (item && enabled && targetPrice) {
          state.priceAlerts.push({
            productId: item.product.id,
            currentPrice: item.product.pricing?.basePrice?.amount || 0,
            targetPrice,
            enabled,
            triggered: false,
          });
        }
      })
    
    // Fetch analytics
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
    
    // Bulk add to cart
      .addCase(bulkAddToCart.fulfilled, (state, action) => {
        // Remove items from wishlist if preference is set
        if (state.preferences.autoRemoveAfterPurchase) {
          state.items = state.items.filter(item => !action.payload.includes(item.id));
        }
        state.selectedItems = [];
        state.bulkOperation = {
          isActive: false,
          type: null,
          selectedCount: 0,
        };
      })
    
    // Sync wishlist
      .addCase(syncWishlist.fulfilled, (state, action) => {
        state.lastSynced = new Date().toISOString();
        if (action.payload.updates) {
          state.items = action.payload.items || state.items;
          state.collections = action.payload.collections || state.collections;
        }
      });
  },
});

export const {
  setWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlistLoading,
  setView,
  setSortBy,
  setFilter,
  clearFilters,
  setSearchQuery,
  setActiveCollection,
  selectItem,
  deselectItem,
  selectAllItems,
  clearSelection,
  startBulkOperation,
  endBulkOperation,
  updateItemLocally,
  incrementViewCount,
  updateItemTags,
  updateItemPriority,
  updateItemNotes,
  updateCollection,
  deleteCollection,
  updatePreferences,
  updatePriceHistory,
  addToRecentlyViewed,
  clearError,
  setError,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;