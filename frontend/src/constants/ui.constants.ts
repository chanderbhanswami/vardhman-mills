/**
 * UI Constants - Vardhman Mills Frontend
 * Contains UI-related configuration, themes, and component constants
 */

// Theme Configuration
export const THEME_CONFIG = {
  LIGHT: {
    name: 'light',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  DARK: {
    name: 'dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#94a3b8',
      accent: '#fbbf24',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    },
  },
} as const;

// Breakpoints (Tailwind CSS)
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// Z-Index Levels
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
  LOADING: 1090,
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
} as const;

// Animation Easings
export const ANIMATION_EASING = {
  EASE: 'ease',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  LINEAR: 'linear',
} as const;

// Component Sizes
export const COMPONENT_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
} as const;

// Button Variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  LINK: 'link',
  DESTRUCTIVE: 'destructive',
} as const;

// Input Types
export const INPUT_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEL: 'tel',
  URL: 'url',
  SEARCH: 'search',
  DATE: 'date',
  TIME: 'time',
  DATETIME_LOCAL: 'datetime-local',
  FILE: 'file',
  HIDDEN: 'hidden',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
} as const;

// Modal Sizes
export const MODAL_SIZES = {
  SM: 'sm', // 384px
  MD: 'md', // 512px
  LG: 'lg', // 768px
  XL: 'xl', // 1024px
  FULL: 'full',
} as const;

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading',
} as const;

// Toast Positions
export const TOAST_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right',
} as const;

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Badge Variants
export const BADGE_VARIANTS = {
  DEFAULT: 'default',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  OUTLINE: 'outline',
} as const;

// Table Configuration
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
  SORT_DIRECTIONS: {
    ASC: 'asc',
    DESC: 'desc',
  },
} as const;

// Card Variants
export const CARD_VARIANTS = {
  DEFAULT: 'default',
  OUTLINED: 'outlined',
  ELEVATED: 'elevated',
  FILLED: 'filled',
} as const;

// Spacing Scale (Tailwind CSS)
export const SPACING = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;

// Typography Scale
export const TYPOGRAPHY = {
  FONT_SIZES: {
    XS: '0.75rem',
    SM: '0.875rem',
    BASE: '1rem',
    LG: '1.125rem',
    XL: '1.25rem',
    '2XL': '1.5rem',
    '3XL': '1.875rem',
    '4XL': '2.25rem',
    '5XL': '3rem',
    '6XL': '3.75rem',
  },
  FONT_WEIGHTS: {
    THIN: 100,
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
    EXTRABOLD: 800,
    BLACK: 900,
  },
  LINE_HEIGHTS: {
    NONE: 1,
    TIGHT: 1.25,
    SNUG: 1.375,
    NORMAL: 1.5,
    RELAXED: 1.625,
    LOOSE: 2,
  },
} as const;

// Icon Sizes
export const ICON_SIZES = {
  XS: 12,
  SM: 16,
  MD: 20,
  LG: 24,
  XL: 32,
  '2XL': 40,
  '3XL': 48,
} as const;

// Grid Configuration
export const GRID_CONFIG = {
  CONTAINER_MAX_WIDTH: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1400px',
  },
  COLUMNS: {
    1: '1fr',
    2: 'repeat(2, 1fr)',
    3: 'repeat(3, 1fr)',
    4: 'repeat(4, 1fr)',
    6: 'repeat(6, 1fr)',
    12: 'repeat(12, 1fr)',
  },
} as const;

// Form Configuration
export const FORM_CONFIG = {
  VALIDATION_DELAY: 300, // ms
  AUTO_SAVE_DELAY: 1000, // ms
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: {
    IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
    SPREADSHEETS: ['xls', 'xlsx', 'csv'],
  },
} as const;

// Navigation Configuration
export const NAVIGATION_CONFIG = {
  MOBILE_BREAKPOINT: 768,
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 200,
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  LAZY_LOADING: true,
  PLACEHOLDER: 'blur',
  QUALITY: 85,
  FORMATS: ['webp', 'avif', 'png', 'jpg'],
  SIZES: {
    THUMBNAIL: { width: 150, height: 150 },
    SMALL: { width: 300, height: 300 },
    MEDIUM: { width: 600, height: 600 },
    LARGE: { width: 1200, height: 1200 },
  },
} as const;

export type ThemeConfig = typeof THEME_CONFIG;
export type ComponentSizes = typeof COMPONENT_SIZES;
export type ButtonVariants = typeof BUTTON_VARIANTS;
export type ToastTypes = typeof TOAST_TYPES;
export type LoadingStates = typeof LOADING_STATES;