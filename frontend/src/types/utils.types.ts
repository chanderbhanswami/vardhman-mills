import { 
  ID, 
  Timestamp, 
  BaseEntity
} from './common.types';
import type { Product } from './product.types';

// Analytics Types
export interface Analytics {
  // Page Analytics
  pageViews: PageViewAnalytics;
  
  // User Analytics
  userBehavior: UserBehaviorAnalytics;
  
  // E-commerce Analytics
  ecommerce: EcommerceAnalytics;
  
  // Performance Analytics
  performance: PerformanceAnalytics;
  
  // Conversion Analytics
  conversions: ConversionAnalytics;
  
  // Real-time Analytics
  realtime: RealtimeAnalytics;
}

export interface PageViewAnalytics {
  totalViews: number;
  uniqueViews: number;
  pageviews: PageView[];
  
  // Top Pages
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
    avgTimeOnPage: number;
    bounceRate: number;
  }>;
  
  // Traffic Sources
  trafficSources: Array<{
    source: string;
    medium: string;
    campaign?: string;
    sessions: number;
    users: number;
    bounceRate: number;
  }>;
  
  // Geographic Data
  geography: Array<{
    country: string;
    sessions: number;
    users: number;
    bounceRate: number;
  }>;
  
  // Device Data
  devices: DeviceAnalytics;
  
  // Browser Data
  browsers: BrowserAnalytics;
}

export interface PageView extends BaseEntity {
  userId?: ID;
  sessionId: string;
  path: string;
  title: string;
  referrer?: string;
  
  // User Info
  userAgent: string;
  ipAddress: string;
  
  // Location
  country?: string;
  region?: string;
  city?: string;
  
  // Device Info
  device: DeviceInfo;
  browser: BrowserInfo;
  
  // Engagement
  timeOnPage: number;
  scrollDepth: number;
  clickCount: number;
  
  // Performance
  loadTime: number;
  interactive: boolean;
  
  // UTM Parameters
  utm?: UTMParameters;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  brand?: string;
  model?: string;
  os: string;
  osVersion: string;
  screenResolution: {
    width: number;
    height: number;
  };
  isBot: boolean;
}

export interface BrowserInfo {
  name: string;
  version: string;
  language: string;
  cookieEnabled: boolean;
  javaEnabled: boolean;
  userAgent: string;
}

export interface UTMParameters {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface DeviceAnalytics {
  desktop: {
    sessions: number;
    users: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  mobile: {
    sessions: number;
    users: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  tablet: {
    sessions: number;
    users: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
}

export interface BrowserAnalytics {
  browsers: Array<{
    name: string;
    version?: string;
    sessions: number;
    users: number;
    bounceRate: number;
  }>;
}

export interface UserBehaviorAnalytics {
  // Session Data
  totalSessions: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  bounceRate: number;
  
  // User Journey
  userJourneys: UserJourney[];
  commonPaths: Array<{
    path: string[];
    count: number;
    conversionRate: number;
  }>;
  
  // Engagement
  engagementMetrics: EngagementMetrics;
  
  // Cohort Analysis
  cohorts: CohortAnalysis[];
  
  // Retention
  retention: RetentionAnalysis;
}

export interface UserJourney extends BaseEntity {
  userId?: ID;
  sessionId: string;
  steps: JourneyStep[];
  
  // Metrics
  duration: number;
  pageCount: number;
  conversionEvent?: string;
  converted: boolean;
  
  // Exit Info
  exitPage: string;
  exitReason?: 'bounce' | 'timeout' | 'navigation' | 'conversion';
}

export interface JourneyStep {
  page: string;
  timestamp: Timestamp;
  duration: number;
  action?: string;
  
  // Interaction
  clicks: number;
  scrollDepth: number;
  formSubmissions: number;
}

export interface EngagementMetrics {
  avgTimeOnSite: number;
  avgPagesPerSession: number;
  newVsReturning: {
    newUsers: number;
    returningUsers: number;
  };
  
  // Interaction Events
  totalClicks: number;
  totalScrolls: number;
  totalDownloads: number;
  totalShares: number;
}

export interface CohortAnalysis {
  cohortName: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Timestamp;
  endDate: Timestamp;
  
  // Cohort Data
  cohortData: Array<{
    period: string;
    users: number;
    returnedUsers: number;
    retentionRate: number;
  }>;
  
  // Metrics
  avgRetentionRate: number;
  totalUsers: number;
}

export interface RetentionAnalysis {
  day1: number;
  day7: number;
  day30: number;
  day90: number;
  
  // By User Segment
  bySegment: Array<{
    segment: string;
    retentionRates: {
      day1: number;
      day7: number;
      day30: number;
      day90: number;
    };
  }>;
}

export interface EcommerceAnalytics {
  // Revenue
  revenue: RevenueAnalytics;
  
  // Products
  products: ProductAnalytics;
  
  // Orders
  orders: OrderAnalytics;
  
  // Conversion
  funnel: ConversionFunnel;
  
  // Customer Analytics
  customers: CustomerAnalytics;
  
  // Cart Analytics
  cart: CartAnalytics;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  avgOrderValue: number;
  revenuePerVisitor: number;
  revenuePerUser: number;
  
  // Time-based Revenue
  dailyRevenue: Array<{
    date: Timestamp;
    revenue: number;
    orders: number;
  }>;
  
  // Revenue by Source
  revenueBySource: Array<{
    source: string;
    revenue: number;
    percentage: number;
  }>;
  
  // Revenue by Product Category
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
}

export interface ProductAnalytics {
  // Top Products
  topProducts: Array<{
    productId: ID;
    product: Product;
    views: number;
    purchases: number;
    conversionRate: number;
    revenue: number;
  }>;
  
  // Product Performance
  productPerformance: Array<{
    productId: ID;
    viewToCartRate: number;
    cartToCheckoutRate: number;
    checkoutToOrderRate: number;
    overallConversionRate: number;
  }>;
  
  // Category Performance
  categoryPerformance: Array<{
    categoryId: ID;
    categoryName: string;
    views: number;
    purchases: number;
    revenue: number;
    conversionRate: number;
  }>;
}

export interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  
  // Order Metrics
  avgOrderValue: number;
  avgItemsPerOrder: number;
  orderFrequency: number;
  
  // Order Status Distribution
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  
  // Payment Method Distribution
  paymentMethods: Array<{
    method: string;
    count: number;
    percentage: number;
    avgOrderValue: number;
  }>;
}

export interface ConversionFunnel {
  steps: FunnelStep[];
  overallConversionRate: number;
  dropoffPoints: Array<{
    step: string;
    dropoffRate: number;
    users: number;
  }>;
}

export interface FunnelStep {
  name: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
  avgTimeToNext?: number;
}

export interface CustomerAnalytics {
  // Customer Metrics
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  activeCustomers: number;
  
  // Lifetime Value
  avgCustomerLifetimeValue: number;
  avgCustomerLifespan: number;
  
  // Customer Segments
  segments: Array<{
    segment: string;
    customers: number;
    avgOrderValue: number;
    totalRevenue: number;
  }>;
  
  // Loyalty Metrics
  repeatPurchaseRate: number;
  customerRetentionRate: number;
  churnRate: number;
}

export interface CartAnalytics {
  totalCarts: number;
  abandonedCarts: number;
  cartAbandonmentRate: number;
  
  // Cart Value Metrics
  avgCartValue: number;
  avgItemsPerCart: number;
  
  // Abandonment Analysis
  abandonmentReasons: Array<{
    reason: string;
    percentage: number;
  }>;
  
  // Recovery Metrics
  recoveredCarts: number;
  recoveryRate: number;
  recoveryRevenue: number;
}

export interface PerformanceAnalytics {
  // Page Load Performance
  pageLoad: PageLoadMetrics;
  
  // Core Web Vitals
  webVitals: WebVitalsMetrics;
  
  // API Performance
  apiPerformance: APIPerformanceMetrics;
  
  // Error Tracking
  errors: ErrorMetrics;
}

export interface PageLoadMetrics {
  avgLoadTime: number;
  medianLoadTime: number;
  slowestPages: Array<{
    page: string;
    avgLoadTime: number;
    samples: number;
  }>;
  
  // Load Time Distribution
  loadTimeDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export interface WebVitalsMetrics {
  // Largest Contentful Paint
  lcp: {
    avg: number;
    p75: number;
    good: number;
    needsImprovement: number;
    poor: number;
  };
  
  // First Input Delay
  fid: {
    avg: number;
    p75: number;
    good: number;
    needsImprovement: number;
    poor: number;
  };
  
  // Cumulative Layout Shift
  cls: {
    avg: number;
    p75: number;
    good: number;
    needsImprovement: number;
    poor: number;
  };
}

export interface APIPerformanceMetrics {
  avgResponseTime: number;
  totalRequests: number;
  successRate: number;
  errorRate: number;
  
  // Endpoint Performance
  endpoints: Array<{
    endpoint: string;
    avgResponseTime: number;
    requestCount: number;
    errorRate: number;
  }>;
  
  // Response Time Distribution
  responseTimeDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  
  // Error Types
  errorTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  
  // Top Errors
  topErrors: Array<{
    message: string;
    count: number;
    affectedUsers: number;
    firstSeen: Timestamp;
    lastSeen: Timestamp;
  }>;
}

export interface ConversionAnalytics {
  // Overall Conversion
  overallConversionRate: number;
  microConversions: MicroConversion[];
  macroConversions: MacroConversion[];
  
  // Conversion Paths
  conversionPaths: ConversionPath[];
  
  // Attribution
  attribution: AttributionAnalytics;
  
  // A/B Test Results
  experiments: ExperimentResult[];
}

export interface MicroConversion {
  name: string;
  conversionRate: number;
  totalConversions: number;
  value?: number;
}

export interface MacroConversion {
  name: string;
  conversionRate: number;
  totalConversions: number;
  value: number;
  avgTimeToConvert: number;
}

export interface ConversionPath {
  path: string[];
  conversions: number;
  conversionRate: number;
  avgTimeToConvert: number;
  value: number;
}

export interface AttributionAnalytics {
  firstTouch: AttributionModel;
  lastTouch: AttributionModel;
  linear: AttributionModel;
  timeDecay: AttributionModel;
  positionBased: AttributionModel;
}

export interface AttributionModel {
  name: string;
  channels: Array<{
    channel: string;
    conversions: number;
    value: number;
    percentage: number;
  }>;
}

export interface ExperimentResult {
  experimentId: ID;
  name: string;
  status: 'running' | 'completed' | 'paused';
  variants: ExperimentVariant[];
  winner?: ID;
  confidenceLevel: number;
  statisticalSignificance: boolean;
}

export interface ExperimentVariant {
  id: ID;
  name: string;
  trafficPercentage: number;
  conversions: number;
  conversionRate: number;
  users: number;
  
  // Statistical Data
  mean: number;
  standardDeviation: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface RealtimeAnalytics {
  // Current Activity
  activeUsers: number;
  activePages: Array<{
    page: string;
    users: number;
  }>;
  
  // Real-time Events
  recentEvents: AnalyticsEvent[];
  
  // Live Metrics
  liveMetrics: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  
  // Geography
  activeCountries: Array<{
    country: string;
    users: number;
  }>;
  
  // Traffic Sources
  activeSources: Array<{
    source: string;
    users: number;
  }>;
}

export interface AnalyticsEvent extends BaseEntity {
  userId?: ID;
  sessionId: string;
  eventName: string;
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  
  // Context
  page: string;
  userAgent: string;
  ipAddress: string;
  
  // Custom Properties
  properties: Record<string, string | number | boolean>;
  
  // Timing
  eventTime: Timestamp;
  timeOnPage: number;
}

// Search Types
export interface SearchAnalytics {
  // Query Analytics
  totalSearches: number;
  uniqueSearches: number;
  avgResultsPerSearch: number;
  zeroResultSearches: number;
  
  // Popular Searches
  topQueries: Array<{
    query: string;
    count: number;
    resultCount: number;
    clickThroughRate: number;
  }>;
  
  // Search Performance
  avgSearchTime: number;
  searchSuccessRate: number;
  
  // User Behavior
  searchDepth: number;
  refinementRate: number;
  exitRate: number;
}

export interface SearchSuggestion {
  query: string;
  suggestions: string[];
  popularity: number;
  
  // Context
  category?: string;
  userId?: ID;
  
  // Performance
  clickCount: number;
  conversionRate: number;
}

// UI Component Types
export interface ComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-selected'?: boolean;
  tabIndex?: number;
  
  // Data attributes
  'data-testid'?: string;
  'data-cy'?: string;
  
  // Event handlers
  onClick?: (event: React.MouseEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export interface ButtonProps extends ComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  
  // Button specific
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  
  // Link button
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
}

export type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'ghost'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface InputProps extends ComponentProps {
  type?: InputType;
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  
  // Validation
  error?: boolean;
  errorMessage?: string;
  
  // Input specific
  name?: string;
  id?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  
  // Number input
  min?: number;
  max?: number;
  step?: number;
  
  // Text input
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  
  // Event handlers
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void;
}

export type InputType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week'
  | 'color'
  | 'file'
  | 'hidden'
  | 'range';

export interface SelectProps extends ComponentProps {
  value?: string | string[];
  defaultValue?: string | string[];
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  
  // Validation
  error?: boolean;
  errorMessage?: string;
  
  // Event handlers
  onChange?: (value: string | string[]) => void;
  onSearch?: (query: string) => void;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
  group?: string;
}

export interface TableProps extends ComponentProps {
  columns: TableColumn[];
  data: TableRow[];
  
  // Features
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  pagination?: boolean;
  
  // Selection
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedRows: string[]) => void;
  
  // Pagination
  pageSize?: number;
  currentPage?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
  
  // Loading
  loading?: boolean;
  
  // Empty state
  emptyText?: string;
}

export interface TableColumn {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: unknown, row: TableRow, index: number) => React.ReactNode;
  
  // Sorting
  sortable?: boolean;
  sorter?: (a: TableRow, b: TableRow) => number;
  defaultSortOrder?: 'asc' | 'desc';
  
  // Filtering
  filterable?: boolean;
  filters?: TableFilter[];
  onFilter?: (value: unknown, row: TableRow) => boolean;
  
  // Styling
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  
  // Accessibility
  'aria-label'?: string;
}

export interface TableRow {
  key: string;
  [key: string]: unknown;
}

export interface TableFilter {
  text: string;
  value: unknown;
}

export interface ModalProps extends ComponentProps {
  open?: boolean;
  onClose?: () => void;
  
  // Content
  title?: React.ReactNode;
  footer?: React.ReactNode;
  
  // Configuration
  size?: ModalSize;
  centered?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  destroyOnClose?: boolean;
  
  // Animation
  animationType?: 'fade' | 'slide' | 'zoom';
  
  // Accessibility
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps extends ComponentProps {
  open?: boolean;
  onClose?: () => void;
  
  // Position
  placement?: 'top' | 'right' | 'bottom' | 'left';
  
  // Content
  title?: React.ReactNode;
  footer?: React.ReactNode;
  
  // Configuration
  size?: DrawerSize;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  destroyOnClose?: boolean;
  
  // Styling
  bodyStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  footerStyle?: React.CSSProperties;
}

export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface TabsProps extends ComponentProps {
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  
  // Configuration
  type?: 'line' | 'card' | 'editable-card';
  position?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'md' | 'lg';
  
  // Features
  animated?: boolean;
  destroyInactiveTabPane?: boolean;
  
  // Editable tabs
  onEdit?: (targetKey: string, action: 'add' | 'remove') => void;
  addIcon?: React.ReactNode;
  
  // Accessibility
  'aria-label'?: string;
}

export interface TabPane {
  key: string;
  tab: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
  forceRender?: boolean;
}

export interface TooltipProps extends ComponentProps {
  title: React.ReactNode;
  placement?: TooltipPlacement;
  trigger?: TooltipTrigger | TooltipTrigger[];
  
  // Behavior
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  
  // Timing
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  
  // Styling
  color?: string;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  
  // Content
  arrowPointAtCenter?: boolean;
  autoAdjustOverflow?: boolean;
}

export type TooltipPlacement = 
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom';

export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'contextMenu';

export interface BreadcrumbProps extends ComponentProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  
  // Configuration
  maxItems?: number;
  itemRender?: (item: BreadcrumbItem, index: number) => React.ReactNode;
}

export interface BreadcrumbItem {
  title: React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  
  // Dropdown
  menu?: BreadcrumbMenu;
}

export interface BreadcrumbMenu {
  items: Array<{
    key: string;
    label: React.ReactNode;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
  }>;
}

// Layout Types
export interface LayoutProps extends ComponentProps {
  // Header
  header?: React.ReactNode;
  headerHeight?: number;
  headerFixed?: boolean;
  
  // Sidebar
  sidebar?: React.ReactNode;
  sidebarWidth?: number;
  sidebarCollapsed?: boolean;
  sidebarCollapsible?: boolean;
  onSidebarToggle?: () => void;
  
  // Footer
  footer?: React.ReactNode;
  footerHeight?: number;
  
  // Content
  content: React.ReactNode;
  contentPadding?: boolean;
  
  // Responsive
  responsive?: boolean;
  breakpoint?: number;
}

export interface GridProps extends ComponentProps {
  // Grid Configuration
  columns?: number;
  gap?: number | string;
  rowGap?: number | string;
  columnGap?: number | string;
  
  // Responsive
  responsive?: GridBreakpoint[];
  
  // Alignment
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
}

export interface GridBreakpoint {
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  columns?: number;
  gap?: number | string;
}

export interface GridItemProps extends ComponentProps {
  // Span
  span?: number;
  offset?: number;
  
  // Responsive spans
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
  
  // Order
  order?: number;
}

// Theme and Styling Types
export interface Theme {
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  breakpoints: Breakpoints;
  shadows: Shadows;
  borderRadius: BorderRadius;
  zIndex: ZIndex;
  animation: Animation;
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  neutral: ColorScale;
  
  // Semantic colors
  background: string;
  surface: string;
  border: string;
  text: TextColors;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Base color
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  inverse: string;
}

export interface Typography {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  
  fontWeight: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  
  lineHeight: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

export interface Spacing {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
}

export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface Shadows {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface BorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface ZIndex {
  auto: string;
  base: number;
  dropdown: number;
  sticky: number;
  fixed: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
  overlay: number;
}

export interface Animation {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  
  keyframes: {
    fadeIn: string;
    fadeOut: string;
    slideIn: string;
    slideOut: string;
    bounce: string;
    pulse: string;
    spin: string;
  };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type Merge<T, U> = Omit<T, keyof U> & U;

export type ValueOf<T> = T[keyof T];

export type ArrayElement<T> = T extends (infer U)[] ? U : never;

export type NonEmptyArray<T> = [T, ...T[]];

export type Exact<T, U> = T extends U ? (U extends T ? T : never) : never;