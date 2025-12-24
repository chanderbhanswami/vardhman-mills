import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red';

// Layout types
export type LayoutType = 'default' | 'compact' | 'comfortable' | 'spacious';
export type SidebarPosition = 'left' | 'right';
export type HeaderStyle = 'default' | 'minimal' | 'compact';

// Navigation types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

// Modal types
export interface ModalState {
  id: string;
  component: string;
  props?: Record<string, unknown>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  backdrop?: 'static' | 'clickable' | 'none';
  centered?: boolean;
  scrollable?: boolean;
}

// Toast notification types
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  timestamp: number;
}

// Loading states
export interface LoadingState {
  [key: string]: boolean;
}

// UI preferences
export interface UIPreferences {
  // Theme
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  fontSize: 'small' | 'medium' | 'large';

  // Layout
  layoutType: LayoutType;
  sidebarCollapsed: boolean;
  sidebarPosition: SidebarPosition;
  headerStyle: HeaderStyle;

  // Navigation
  showBreadcrumbs: boolean;
  stickyHeader: boolean;
  stickyFooter: boolean;

  // Product display
  productsPerPage: 12 | 24 | 48 | 96;
  productViewMode: 'grid' | 'list';
  showPrices: boolean;
  showRatings: boolean;
  showQuickView: boolean;

  // Animations
  enableAnimations: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';

  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  screenReaderMode: boolean;

  // Performance
  lazyLoading: boolean;
  preloadImages: boolean;
  cacheEnabled: boolean;

  // Notifications
  showNotifications: boolean;
  notificationPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  soundEnabled: boolean;
}

// Device and responsive states
export interface DeviceState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
}

// Search UI state
export interface SearchUIState {
  isActive: boolean;
  showSuggestions: boolean;
  showFilters: boolean;
  recentSearches: boolean;
}

// Shopping cart UI state
export interface CartUIState {
  isOpen: boolean;
  showMiniCart: boolean;
  lastAddedItem: string | null;
  animateItems: boolean;
}

// Product filters UI state
export interface FiltersUIState {
  isOpen: boolean;
  collapsed: Record<string, boolean>;
  activeFilters: number;
  showClearAll: boolean;
}

interface UIState {
  // Theme and appearance
  preferences: UIPreferences;

  // Device and responsive
  device: DeviceState;

  // Navigation
  breadcrumbs: BreadcrumbItem[];
  navigationHistory: string[];
  currentPage: string;

  // Modals
  modals: ModalState[];

  // Notifications and toasts
  toasts: ToastNotification[];
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    read: boolean;
    timestamp: number;
  }>;

  // Loading states
  loading: LoadingState;
  globalLoading: boolean;
  pageLoading: boolean;

  // Component-specific UI states
  search: SearchUIState;
  cart: CartUIState;
  filters: FiltersUIState;

  // Form states
  forms: Record<string, {
    isDirty: boolean;
    isSubmitting: boolean;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
  }>;

  // Page states
  pages: Record<string, {
    scrollPosition: number;
    lastVisited: number;
    data?: Record<string, unknown>;
  }>;

  // Error boundaries
  errors: Array<{
    id: string;
    component: string;
    error: string;
    timestamp: number;
    recovered: boolean;
  }>;

  // Performance monitoring
  performance: {
    pageLoadTime: number;
    renderTime: number;
    interactionMetrics: Record<string, number>;
    memoryUsage?: number;
  };

  // Keyboard shortcuts
  shortcuts: Record<string, boolean>;
  shortcutsEnabled: boolean;

  // Drag and drop
  dragDrop: {
    isDragging: boolean;
    dragType?: string;
    dragData?: unknown;
    dropZones: string[];
  };

  // Offline state
  isOnline: boolean;
  wasOffline: boolean;
  offlineQueueCount: number;
}

const defaultPreferences: UIPreferences = {
  themeMode: 'system',
  colorScheme: 'default',
  fontSize: 'medium',
  layoutType: 'default',
  sidebarCollapsed: false,
  sidebarPosition: 'left',
  headerStyle: 'default',
  showBreadcrumbs: true,
  stickyHeader: true,
  stickyFooter: false,
  productsPerPage: 24,
  productViewMode: 'grid',
  showPrices: true,
  showRatings: true,
  showQuickView: true,
  enableAnimations: true,
  animationSpeed: 'normal',
  highContrast: false,
  reducedMotion: false,
  keyboardNavigation: true,
  screenReaderMode: false,
  lazyLoading: true,
  preloadImages: true,
  cacheEnabled: true,
  showNotifications: true,
  notificationPosition: 'top-right',
  soundEnabled: false,
};

// Safe localStorage access for SSR
const getSavedPreferences = (): Partial<UIPreferences> => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('uiPreferences') || '{}');
  } catch {
    return {};
  }
};

const initialState: UIState = {
  preferences: {
    ...defaultPreferences,
    ...getSavedPreferences(),
  },
  device: {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1920,
    screenHeight: 1080,
    orientation: 'landscape',
    touchDevice: false,
  },
  breadcrumbs: [],
  navigationHistory: [],
  currentPage: '/',
  modals: [],
  toasts: [],
  notifications: [],
  loading: {},
  globalLoading: false,
  pageLoading: false,
  search: {
    isActive: false,
    showSuggestions: false,
    showFilters: false,
    recentSearches: false,
  },
  cart: {
    isOpen: false,
    showMiniCart: true,
    lastAddedItem: null,
    animateItems: true,
  },
  filters: {
    isOpen: false,
    collapsed: {},
    activeFilters: 0,
    showClearAll: false,
  },
  forms: {},
  pages: {},
  errors: [],
  performance: {
    pageLoadTime: 0,
    renderTime: 0,
    interactionMetrics: {},
  },
  shortcuts: {},
  shortcutsEnabled: true,
  dragDrop: {
    isDragging: false,
    dropZones: [],
  },
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  wasOffline: false,
  offlineQueueCount: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme and preferences
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.preferences.themeMode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('uiPreferences', JSON.stringify(state.preferences));
      }
    },

    setColorScheme: (state, action: PayloadAction<ColorScheme>) => {
      state.preferences.colorScheme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('uiPreferences', JSON.stringify(state.preferences));
      }
    },

    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.preferences.fontSize = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('uiPreferences', JSON.stringify(state.preferences));
      }
    },

    updatePreferences: (state, action: PayloadAction<Partial<UIPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      if (typeof window !== 'undefined') {
        localStorage.setItem('uiPreferences', JSON.stringify(state.preferences));
      }
    },

    resetPreferences: (state) => {
      state.preferences = defaultPreferences;
      if (typeof window !== 'undefined') {
        localStorage.setItem('uiPreferences', JSON.stringify(state.preferences));
      }
    },

    // Device state
    updateDeviceState: (state, action: PayloadAction<Partial<DeviceState>>) => {
      state.device = { ...state.device, ...action.payload };
    },

    // Navigation
    setBreadcrumbs: (state, action: PayloadAction<BreadcrumbItem[]>) => {
      state.breadcrumbs = action.payload;
    },

    addBreadcrumb: (state, action: PayloadAction<BreadcrumbItem>) => {
      state.breadcrumbs.push(action.payload);
    },

    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [];
    },

    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
      state.navigationHistory.push(action.payload);

      // Keep only last 50 pages in history
      if (state.navigationHistory.length > 50) {
        state.navigationHistory = state.navigationHistory.slice(-50);
      }
    },

    // Modal management
    openModal: (state, action: PayloadAction<ModalState>) => {
      state.modals.push(action.payload);
    },

    closeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(modal => modal.id !== action.payload);
    },

    closeAllModals: (state) => {
      state.modals = [];
    },

    updateModal: (state, action: PayloadAction<{ id: string; updates: Partial<ModalState> }>) => {
      const modal = state.modals.find(m => m.id === action.payload.id);
      if (modal) {
        Object.assign(modal, action.payload.updates);
      }
    },

    // Toast notifications
    addToast: (state, action: PayloadAction<Omit<ToastNotification, 'id' | 'timestamp'>>) => {
      const toast: ToastNotification = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        duration: 5000,
        ...action.payload,
      };
      state.toasts.push(toast);
    },

    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },

    clearToasts: (state) => {
      state.toasts = [];
    },

    // Loading states
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      const { key, loading } = action.payload;
      if (loading) {
        state.loading[key] = true;
      } else {
        delete state.loading[key];
      }
    },

    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },

    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.pageLoading = action.payload;
    },

    clearAllLoading: (state) => {
      state.loading = {};
      state.globalLoading = false;
      state.pageLoading = false;
    },

    // Component UI states
    updateSearchUI: (state, action: PayloadAction<Partial<SearchUIState>>) => {
      state.search = { ...state.search, ...action.payload };
    },

    updateCartUI: (state, action: PayloadAction<Partial<CartUIState>>) => {
      state.cart = { ...state.cart, ...action.payload };
    },

    updateFiltersUI: (state, action: PayloadAction<Partial<FiltersUIState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Form management
    updateFormState: (state, action: PayloadAction<{
      formId: string;
      updates: Partial<UIState['forms'][string]>;
    }>) => {
      const { formId, updates } = action.payload;
      if (!state.forms[formId]) {
        state.forms[formId] = {
          isDirty: false,
          isSubmitting: false,
          errors: {},
          touched: {},
        };
      }
      state.forms[formId] = { ...state.forms[formId], ...updates };
    },

    clearFormState: (state, action: PayloadAction<string>) => {
      delete state.forms[action.payload];
    },

    // Page state management
    updatePageState: (state, action: PayloadAction<{
      page: string;
      updates: Partial<UIState['pages'][string]>;
    }>) => {
      const { page, updates } = action.payload;
      if (!state.pages[page]) {
        state.pages[page] = {
          scrollPosition: 0,
          lastVisited: Date.now(),
        };
      }
      state.pages[page] = { ...state.pages[page], ...updates };
    },

    // Error handling
    addError: (state, action: PayloadAction<{
      component: string;
      error: string;
    }>) => {
      const error = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        recovered: false,
        ...action.payload,
      };
      state.errors.push(error);

      // Keep only last 50 errors
      if (state.errors.length > 50) {
        state.errors = state.errors.slice(-50);
      }
    },

    markErrorRecovered: (state, action: PayloadAction<string>) => {
      const error = state.errors.find(e => e.id === action.payload);
      if (error) {
        error.recovered = true;
      }
    },

    clearErrors: (state) => {
      state.errors = [];
    },

    // Performance tracking
    updatePerformance: (state, action: PayloadAction<Partial<UIState['performance']>>) => {
      state.performance = { ...state.performance, ...action.payload };
    },

    // Keyboard shortcuts
    setShortcutPressed: (state, action: PayloadAction<{ key: string; pressed: boolean }>) => {
      const { key, pressed } = action.payload;
      if (pressed) {
        state.shortcuts[key] = true;
      } else {
        delete state.shortcuts[key];
      }
    },

    setShortcutsEnabled: (state, action: PayloadAction<boolean>) => {
      state.shortcutsEnabled = action.payload;
    },

    // Drag and drop
    setDragState: (state, action: PayloadAction<Partial<UIState['dragDrop']>>) => {
      state.dragDrop = { ...state.dragDrop, ...action.payload };
    },

    // Offline state
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      const wasOnline = state.isOnline;
      state.isOnline = action.payload;

      if (!wasOnline && action.payload) {
        // Coming back online
        state.wasOffline = true;
      } else if (wasOnline && !action.payload) {
        // Going offline
        state.wasOffline = false;
      }
    },

    setOfflineQueueCount: (state, action: PayloadAction<number>) => {
      state.offlineQueueCount = action.payload;
    },

    // Layout toggles
    toggleSidebar: (state) => {
      state.preferences.sidebarCollapsed = !state.preferences.sidebarCollapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem('uiPreferences', JSON.stringify(state.preferences));
      }
    },

    toggleCart: (state) => {
      state.cart.isOpen = !state.cart.isOpen;
    },

    toggleFilters: (state) => {
      state.filters.isOpen = !state.filters.isOpen;
    },

    toggleSearch: (state) => {
      state.search.isActive = !state.search.isActive;
    },

    // Notifications
    addNotification: (state, action: PayloadAction<{
      type: 'info' | 'success' | 'warning' | 'error';
      title: string;
      message: string;
    }>) => {
      const notification = {
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);

      // Keep only last 100 notifications
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
    },

    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },

    markAllNotificationsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setThemeMode,
  setColorScheme,
  setFontSize,
  updatePreferences,
  resetPreferences,
  updateDeviceState,
  setBreadcrumbs,
  addBreadcrumb,
  clearBreadcrumbs,
  setCurrentPage,
  openModal,
  closeModal,
  closeAllModals,
  updateModal,
  addToast,
  removeToast,
  clearToasts,
  setLoading,
  setGlobalLoading,
  setPageLoading,
  clearAllLoading,
  updateSearchUI,
  updateCartUI,
  updateFiltersUI,
  updateFormState,
  clearFormState,
  updatePageState,
  addError,
  markErrorRecovered,
  clearErrors,
  updatePerformance,
  setShortcutPressed,
  setShortcutsEnabled,
  setDragState,
  setOnlineStatus,
  setOfflineQueueCount,
  toggleSidebar,
  toggleCart,
  toggleFilters,
  toggleSearch,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

// Selectors
export const selectUIPreferences = (state: { ui: UIState }) => state.ui.preferences;
export const selectThemeMode = (state: { ui: UIState }) => state.ui.preferences.themeMode;
export const selectColorScheme = (state: { ui: UIState }) => state.ui.preferences.colorScheme;
export const selectDeviceState = (state: { ui: UIState }) => state.ui.device;
export const selectBreadcrumbs = (state: { ui: UIState }) => state.ui.breadcrumbs;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectToasts = (state: { ui: UIState }) => state.ui.toasts;
export const selectLoadingStates = (state: { ui: UIState }) => state.ui.loading;
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.globalLoading;
export const selectSearchUI = (state: { ui: UIState }) => state.ui.search;
export const selectCartUI = (state: { ui: UIState }) => state.ui.cart;
export const selectFiltersUI = (state: { ui: UIState }) => state.ui.filters;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectOnlineStatus = (state: { ui: UIState }) => state.ui.isOnline;

// Complex selectors
export const selectIsLoading = (state: { ui: UIState }, key: string) =>
  state.ui.loading[key] || false;

export const selectHasAnyLoading = (state: { ui: UIState }) =>
  Object.keys(state.ui.loading).length > 0 || state.ui.globalLoading;

export const selectActiveModal = (state: { ui: UIState }) =>
  state.ui.modals[state.ui.modals.length - 1] || null;

export const selectUnreadNotifications = (state: { ui: UIState }) =>
  state.ui.notifications.filter(n => !n.read);

export const selectFormState = (state: { ui: UIState }, formId: string) =>
  state.ui.forms[formId] || {
    isDirty: false,
    isSubmitting: false,
    errors: {},
    touched: {},
  };

export const selectPageState = (state: { ui: UIState }, page: string) =>
  state.ui.pages[page] || {
    scrollPosition: 0,
    lastVisited: 0,
  };

export const selectIsDarkMode = (state: { ui: UIState }) => {
  const { themeMode } = state.ui.preferences;
  if (themeMode === 'dark') return true;
  if (themeMode === 'light') return false;

  // System preference
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const selectIsMobile = (state: { ui: UIState }) => state.ui.device.isMobile;
export const selectIsTablet = (state: { ui: UIState }) => state.ui.device.isTablet;
export const selectIsDesktop = (state: { ui: UIState }) => state.ui.device.isDesktop;

export const selectLayoutClasses = (state: { ui: UIState }) => {
  const { preferences, device } = state.ui;
  const classes = [];

  classes.push(`theme-${preferences.themeMode}`);
  classes.push(`color-${preferences.colorScheme}`);
  classes.push(`font-${preferences.fontSize}`);
  classes.push(`layout-${preferences.layoutType}`);

  if (preferences.sidebarCollapsed) classes.push('sidebar-collapsed');
  if (preferences.highContrast) classes.push('high-contrast');
  if (preferences.reducedMotion) classes.push('reduced-motion');
  if (!preferences.enableAnimations) classes.push('no-animations');

  if (device.isMobile) classes.push('is-mobile');
  if (device.isTablet) classes.push('is-tablet');
  if (device.isDesktop) classes.push('is-desktop');
  if (device.touchDevice) classes.push('touch-device');

  return classes.join(' ');
};

export default uiSlice.reducer;
