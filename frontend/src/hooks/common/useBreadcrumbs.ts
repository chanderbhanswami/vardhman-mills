import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  id: string;
  label: string;
  href: string;
  isActive: boolean;
  icon?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Breadcrumb configuration options
 */
export interface BreadcrumbOptions {
  maxItems?: number;
  showHome?: boolean;
  homeLabel?: string;
  homeHref?: string;
  separator?: string;
  autoGenerate?: boolean;
  customLabels?: Record<string, string>;
  excludePaths?: string[];
}

/**
 * Breadcrumb state interface
 */
export interface BreadcrumbState {
  items: BreadcrumbItem[];
  currentPath: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Default breadcrumb configuration
 */
const DEFAULT_OPTIONS: Required<BreadcrumbOptions> = {
  maxItems: 10,
  showHome: true,
  homeLabel: 'Home',
  homeHref: '/',
  separator: '/',
  autoGenerate: true,
  customLabels: {},
  excludePaths: ['/api', '/admin'],
};

/**
 * Breadcrumb management hook
 */
export const useBreadcrumbs = (options: BreadcrumbOptions = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const config = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  
  const [state, setState] = useState<BreadcrumbState>({
    items: [],
    currentPath: '',
    isLoading: false,
    error: null,
  });

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = useCallback((path: string): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];
    
    // Add home breadcrumb if enabled
    if (config.showHome && path !== config.homeHref) {
      items.push({
        id: 'home',
        label: config.homeLabel,
        href: config.homeHref,
        isActive: false,
      });
    }

    // Skip if path is excluded
    if (config.excludePaths.some(excludePath => path.startsWith(excludePath))) {
      return items;
    }

    // Split path into segments
    const segments = path.split('/').filter(segment => segment.length > 0);
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Get custom label or format segment
      const label = config.customLabels[currentPath] || 
                   segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      items.push({
        id: `breadcrumb-${index}`,
        label,
        href: currentPath,
        isActive: isLast,
      });
    });

    // Limit items if maxItems is set
    if (items.length > config.maxItems) {
      const homeItem = items.find(item => item.id === 'home');
      const pathItems = items.filter(item => item.id !== 'home');
      const limitedItems = pathItems.slice(-config.maxItems + (homeItem ? 1 : 0));
      
      return homeItem ? [homeItem, ...limitedItems] : limitedItems;
    }

    return items;
  }, [config]);

  // Update breadcrumbs when pathname changes
  useEffect(() => {
    if (pathname) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const items = config.autoGenerate ? generateBreadcrumbs(pathname) : [];
        setState({
          items,
          currentPath: pathname,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to generate breadcrumbs',
        }));
      }
    }
  }, [pathname, generateBreadcrumbs, config.autoGenerate]);

  // Add custom breadcrumb item
  const addBreadcrumb = useCallback((item: Omit<BreadcrumbItem, 'id'>) => {
    const newItem: BreadcrumbItem = {
      ...item,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    
    setState(prev => ({
      ...prev,
      items: [...prev.items.map(i => ({ ...i, isActive: false })), newItem],
    }));
  }, []);

  // Remove breadcrumb by id
  const removeBreadcrumb = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  }, []);

  // Update breadcrumb
  const updateBreadcrumb = useCallback((id: string, updates: Partial<BreadcrumbItem>) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  // Clear all breadcrumbs
  const clearBreadcrumbs = useCallback(() => {
    setState(prev => ({ ...prev, items: [] }));
  }, []);

  // Navigate to breadcrumb
  const navigateTo = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  // Get breadcrumb by id
  const getBreadcrumb = useCallback((id: string) => {
    return state.items.find(item => item.id === id);
  }, [state.items]);

  // Get active breadcrumb
  const activeBreadcrumb = useMemo(() => {
    return state.items.find(item => item.isActive);
  }, [state.items]);

  // Get breadcrumb path as string
  const breadcrumbPath = useMemo(() => {
    return state.items
      .filter(item => !item.disabled)
      .map(item => item.label)
      .join(` ${config.separator} `);
  }, [state.items, config.separator]);

  return {
    // State
    items: state.items,
    currentPath: state.currentPath,
    isLoading: state.isLoading,
    error: state.error,
    
    // Computed
    activeBreadcrumb,
    breadcrumbPath,
    
    // Actions
    addBreadcrumb,
    removeBreadcrumb,
    updateBreadcrumb,
    clearBreadcrumbs,
    navigateTo,
    getBreadcrumb,
    
    // Utils
    generateBreadcrumbs,
  };
};

/**
 * Hook for simple breadcrumb navigation
 */
export const useBreadcrumbNavigation = (options?: BreadcrumbOptions) => {
  const { items, navigateTo, activeBreadcrumb } = useBreadcrumbs(options);
  
  const goBack = useCallback(() => {
    const currentIndex = items.findIndex(item => item.isActive);
    if (currentIndex > 0) {
      navigateTo(items[currentIndex - 1].href);
    }
  }, [items, navigateTo]);
  
  const goHome = useCallback(() => {
    const homeItem = items.find(item => item.id === 'home');
    if (homeItem) {
      navigateTo(homeItem.href);
    }
  }, [items, navigateTo]);
  
  const canGoBack = useMemo(() => {
    const currentIndex = items.findIndex(item => item.isActive);
    return currentIndex > 0;
  }, [items]);
  
  return {
    items,
    activeBreadcrumb,
    goBack,
    goHome,
    canGoBack,
    navigateTo,
  };
};

export default useBreadcrumbs;