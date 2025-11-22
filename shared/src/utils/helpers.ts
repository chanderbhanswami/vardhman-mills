export const formatPrice = (price: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
};

export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diff = now.getTime() - past.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  
  return 'Just now';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 4);
  return `VM${timestamp.toUpperCase()}${randomStr.toUpperCase()}`;
};

export const generateSKU = (productName: string, variant?: { size?: string; color?: string }): string => {
  const prefix = productName.substring(0, 3).toUpperCase();
  const size = variant?.size ? variant.size.substring(0, 1).toUpperCase() : 'O';
  const color = variant?.color ? variant.color.substring(0, 1).toUpperCase() : 'N';
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  
  return `${prefix}-${size}${color}-${timestamp}`;
};

export const calculateDiscount = (originalPrice: number, salePrice: number): number => {
  if (originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export const calculateShipping = (
  subtotal: number, 
  location: 'local' | 'metro' | 'standard' | 'express' = 'standard'
): number => {
  if (subtotal >= 1000) return 0; // Free shipping over ₹1000
  return SHIPPING_ZONES[location.toUpperCase() as keyof typeof SHIPPING_ZONES]?.cost || 99;
};

export const calculateTax = (subtotal: number, rate: number = TAX_RATES.GST): number => {
  return Math.round(subtotal * rate);
};

export const getOrderStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: 'yellow',
    confirmed: 'blue',
    processing: 'purple',
    shipped: 'indigo',
    delivered: 'green',
    cancelled: 'red',
    returned: 'gray',
  };
  
  return statusColors[status] || 'gray';
};

export const getPaymentStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: 'yellow',
    paid: 'green',
    failed: 'red',
    refunded: 'blue',
  };
  
  return statusColors[status] || 'gray';
};

export const getOrderStatusBadgeClass = (status: string): string => {
  const color = getOrderStatusColor(status);
  return `bg-${color}-100 text-${color}-800`;
};

export const getPaymentStatusBadgeClass = (status: string): string => {
  const color = getPaymentStatusColor(status);
  return `bg-${color}-100 text-${color}-800`;
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const arrayToObject = <T>(
  array: T[],
  keyField: keyof T
): Record<string, T> => {
  return array.reduce((obj, item) => {
    const key = String(item[keyField]);
    obj[key] = item;
    return obj;
  }, {} as Record<string, T>);
};

export const groupBy = <T>(
  array: T[],
  keyField: keyof T
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = String(item[keyField]);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(
  array: T[],
  keyField: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[keyField];
    const bVal = b[keyField];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const filterBySearchTerm = <T>(
  array: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) return array;
  
  const lowercaseSearch = searchTerm.toLowerCase();
  
  return array.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowercaseSearch);
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    })
  );
};

export const generateRandomId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const isValidImageFile = (file: File): boolean => {
  return FILE_UPLOAD.ALLOWED_TYPES.includes(file.type as any) && 
         file.size <= FILE_UPLOAD.MAX_SIZE;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};