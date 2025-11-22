import { 
  ID, 
  Timestamp, 
  BaseEntity, 
  ValidationError as BaseValidationError
} from './common.types';

// API Response Types
export interface APISuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: Timestamp;
  requestId: string;
  
  // Pagination (when applicable)
  pagination?: PaginationInfo;
  
  // Metadata
  meta?: ResponseMetadata;
}

export interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string | number | boolean>;
    field?: string;
    validationErrors?: ValidationError[];
  };
  timestamp: Timestamp;
  requestId: string;
  
  // Debug information (only in development)
  debug?: {
    stack?: string;
    query?: string;
    body?: Record<string, unknown>;
  };
}

export type APIResponseType<T = unknown> = APISuccessResponse<T> | APIErrorResponse;

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

export interface ResponseMetadata {
  version: string;
  server: string;
  cached: boolean;
  cacheExpiry?: Timestamp;
  warnings?: string[];
  deprecationNotices?: string[];
  rateLimit?: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Timestamp;
  retryAfter?: number;
}

// API Request Types
export interface APIRequest<T = Record<string, unknown>> {
  endpoint: string;
  method: HTTPMethod;
  data?: T;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeout?: number;
  
  // Authentication
  requiresAuth?: boolean;
  authToken?: string;
  
  // Caching
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  
  // Retry Policy
  retryConfig?: RetryConfig;
  
  // Request Tracking
  trackRequest?: boolean;
  requestId?: string;
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  retryOn: number[]; // HTTP status codes to retry on
}

// Form Validation Types
export interface FormField<T = string> {
  name: string;
  value: T;
  label: string;
  type: FieldType;
  
  // Validation
  required: boolean;
  validators: FieldValidator[];
  errors: string[];
  
  // State
  touched: boolean;
  dirty: boolean;
  valid: boolean;
  
  // Configuration
  placeholder?: string;
  helpText?: string;
  disabled: boolean;
  readonly: boolean;
  
  // Formatting
  format?: FieldFormat;
  mask?: string;
  
  // Dependencies
  dependsOn?: string[];
  showWhen?: FormCondition;
  
  // Options (for select, radio, checkbox)
  options?: FieldOption[];
  
  // File upload specific
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  
  // Number specific
  min?: number;
  max?: number;
  step?: number;
}

export type FieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'time'
  | 'file'
  | 'image'
  | 'color'
  | 'range'
  | 'rating'
  | 'rich_text'
  | 'code'
  | 'json'
  | 'hidden';

export interface FieldValidator {
  type: ValidatorType;
  value?: string | number | boolean | RegExp;
  message: string;
  
  // Conditional validation
  when?: FormCondition;
  
  // Async validation
  isAsync?: boolean;
  validator?: (value: unknown, formData: Record<string, unknown>) => Promise<boolean> | boolean;
}

export type ValidatorType = 
  | 'required'
  | 'min_length'
  | 'max_length'
  | 'pattern'
  | 'email'
  | 'url'
  | 'phone'
  | 'numeric'
  | 'alpha'
  | 'alphanumeric'
  | 'min_value'
  | 'max_value'
  | 'date_after'
  | 'date_before'
  | 'file_size'
  | 'file_type'
  | 'custom';

export interface FieldFormat {
  type: 'currency' | 'percentage' | 'phone' | 'date' | 'time' | 'number';
  options?: Record<string, string | number | boolean>;
}

export interface FormCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'empty' | 'not_empty';
  value: string | number | boolean;
}

export interface FieldOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
  description?: string;
  icon?: string;
  group?: string;
}

// Form State Management
export interface FormState<T = Record<string, unknown>> {
  // Data
  values: T;
  initialValues: T;
  
  // State
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: boolean;
  valid: boolean;
  submitting: boolean;
  submitted: boolean;
  
  // Configuration
  fields: FormField[];
  validationMode: ValidationMode;
  
  // Metadata
  submitCount: number;
  lastSubmittedAt?: Timestamp;
  
  // Auto-save
  autoSave: boolean;
  lastSavedAt?: Timestamp;
  saveStatus: 'saved' | 'saving' | 'error' | 'unsaved';
}

export type ValidationMode = 'onSubmit' | 'onChange' | 'onBlur' | 'onTouch';

export interface FormSchema {
  name: string;
  version: string;
  fields: FormFieldSchema[];
  validation: FormValidationSchema;
  
  // Layout
  layout: FormLayout;
  
  // Behavior
  autoSave?: boolean;
  trackChanges?: boolean;
  confirmOnLeave?: boolean;
  
  // Submission
  submitUrl?: string;
  submitMethod?: HTTPMethod;
  onSuccess?: FormAction;
  onError?: FormAction;
  
  // Security
  csrfProtection?: boolean;
  honeypot?: boolean;
  rateLimiting?: RateLimitConfig;
}

export interface FormFieldSchema {
  name: string;
  type: FieldType;
  label: string;
  
  // Validation
  required?: boolean;
  validators?: FieldValidator[];
  
  // Layout
  column?: number;
  row?: number;
  span?: number;
  
  // Configuration
  props?: Record<string, unknown>;
  
  // Conditional
  showWhen?: FormCondition;
  
  // Data Source
  dataSource?: DataSource;
}

export interface FormValidationSchema {
  mode: ValidationMode;
  validateOnMount?: boolean;
  abortEarly?: boolean;
  
  // Cross-field validation
  crossFieldValidators?: CrossFieldValidator[];
  
  // Async validation
  asyncValidators?: AsyncValidator[];
  
  // Custom validation
  customValidators?: CustomValidator[];
}

export interface CrossFieldValidator {
  fields: string[];
  validator: (values: Record<string, unknown>) => string | null;
  message: string;
}

export interface AsyncValidator {
  field: string;
  validator: (value: unknown, formData: Record<string, unknown>) => Promise<string | null>;
  debounce?: number;
}

export interface CustomValidator {
  name: string;
  validator: (value: unknown, rule: unknown, formData: Record<string, unknown>) => boolean | string;
}

export interface FormLayout {
  type: 'vertical' | 'horizontal' | 'grid' | 'tabs' | 'accordion' | 'wizard';
  columns?: number;
  spacing?: 'compact' | 'normal' | 'loose';
  
  // Responsive
  breakpoints?: FormBreakpoint[];
  
  // Sections
  sections?: FormSection[];
  
  // Styling
  className?: string;
  theme?: FormTheme;
}

export interface FormBreakpoint {
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  columns: number;
  layout?: 'vertical' | 'horizontal' | 'grid';
}

export interface FormSection {
  title: string;
  description?: string;
  fields: string[];
  collapsible?: boolean;
  collapsed?: boolean;
  showWhen?: FormCondition;
}

export interface FormTheme {
  primary: string;
  secondary: string;
  error: string;
  warning: string;
  success: string;
  
  // Spacing
  fieldSpacing: string;
  sectionSpacing: string;
  
  // Typography
  labelSize: string;
  inputSize: string;
  helpTextSize: string;
}

export interface FormAction {
  type: 'redirect' | 'message' | 'callback' | 'modal' | 'refresh';
  config: Record<string, unknown>;
}

export interface DataSource {
  type: 'static' | 'api' | 'function';
  source: string | FieldOption[] | (() => Promise<FieldOption[]>);
  
  // API specific
  endpoint?: string;
  method?: HTTPMethod;
  params?: Record<string, unknown>;
  
  // Caching
  cache?: boolean;
  cacheTTL?: number;
  
  // Search
  searchable?: boolean;
  searchDelay?: number;
}

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDuration?: number;
}

// Error Handling Types
export interface ValidationError extends BaseValidationError {
  field: string;
  value?: unknown;
  rule?: string;
  params?: Record<string, unknown>;
  
  // Context
  formName?: string;
  fieldType?: FieldType;
  
  // User-friendly
  userMessage?: string;
  suggestion?: string;
  
  // Localization
  localizationKey?: string;
  localizationParams?: Record<string, string | number>;
}

export interface FormError {
  type: ErrorType;
  message: string;
  code?: string;
  
  // Field specific
  field?: string;
  
  // Technical details
  details?: Record<string, unknown>;
  stack?: string;
  
  // User context
  userAgent?: string;
  url?: string;
  timestamp: Timestamp;
  
  // Recovery
  recoverable: boolean;
  retryable: boolean;
  suggestion?: string;
}

export type ErrorType = 
  | 'validation'
  | 'network'
  | 'server'
  | 'client'
  | 'timeout'
  | 'authentication'
  | 'authorization'
  | 'rate_limit'
  | 'not_found'
  | 'conflict'
  | 'unknown';

export interface ErrorBoundary {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  
  // Recovery
  retryCount: number;
  maxRetries: number;
  
  // Reporting
  reportError?: boolean;
  reportingEndpoint?: string;
  
  // Fallback
  fallbackComponent?: React.ComponentType;
}

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

// Notification Types
export interface Notification extends BaseEntity {
  // Basic Information
  title: string;
  message: string;
  type: NotificationType;
  
  // Visual
  icon?: string;
  color?: string;
  image?: string;
  
  // Targeting
  userId?: ID;
  userGroup?: string;
  global: boolean;
  
  // Behavior
  priority: NotificationPriority;
  persistent: boolean;
  dismissible: boolean;
  autoClose: boolean;
  autoCloseDelay?: number;
  
  // Actions
  actions: NotificationAction[];
  
  // Status
  status: NotificationStatus;
  readAt?: Timestamp;
  dismissedAt?: Timestamp;
  
  // Delivery
  channels: NotificationChannel[];
  scheduledFor?: Timestamp;
  sentAt?: Timestamp;
  
  // Metadata
  source: string;
  category: string;
  tags: string[];
  
  // Analytics
  viewCount: number;
  clickCount: number;
  
  // Expiry
  expiresAt?: Timestamp;
}

export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'loading'
  | 'update'
  | 'reminder'
  | 'achievement'
  | 'social'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'dismissed'
  | 'failed'
  | 'expired';

export interface NotificationAction {
  id: string;
  label: string;
  action: ActionType;
  url?: string;
  style?: 'primary' | 'secondary' | 'danger' | 'link';
  
  // Behavior
  closesNotification?: boolean;
  openInNewTab?: boolean;
  
  // Tracking
  trackClick?: boolean;
  trackingId?: string;
}

export type ActionType = 
  | 'navigate'
  | 'external_link'
  | 'modal'
  | 'api_call'
  | 'download'
  | 'share'
  | 'dismiss'
  | 'custom';

export interface NotificationChannel {
  type: 'in_app' | 'email' | 'sms' | 'push' | 'browser' | 'webhook';
  enabled: boolean;
  config?: Record<string, unknown>;
  
  // Delivery status
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  error?: string;
  
  // Retry
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Timestamp;
}

// Toast Notifications
export interface ToastNotification {
  id: string;
  title?: string;
  message: string;
  type: NotificationType;
  
  // Behavior
  duration?: number;
  persistent?: boolean;
  dismissible?: boolean;
  
  // Actions
  action?: ToastAction;
  
  // Position
  position?: ToastPosition;
  
  // Animation
  animation?: ToastAnimation;
  
  // Progress
  showProgress?: boolean;
  progress?: number;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary' | 'link';
}

export type ToastPosition = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastAnimation {
  enter: string;
  exit: string;
  duration: number;
}

// Modal and Dialog Types
export interface Modal {
  id: string;
  isOpen: boolean;
  
  // Content
  title?: string;
  content: React.ReactNode | string;
  
  // Configuration
  size?: ModalSize;
  centered?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  
  // Styling
  className?: string;
  bodyStyle?: React.CSSProperties;
  
  // Callbacks
  onOpen?: () => void;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  
  // Footer
  footer?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  
  // State
  loading?: boolean;
  confirmDisabled?: boolean;
}

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';

// Loading States
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
  
  // Type
  type?: LoadingType;
  
  // Configuration
  showSpinner?: boolean;
  showProgress?: boolean;
  overlay?: boolean;
  
  // Cancellation
  cancellable?: boolean;
  onCancel?: () => void;
  
  // Timeout
  timeout?: number;
  onTimeout?: () => void;
}

export type LoadingType = 
  | 'spinner'
  | 'progress'
  | 'skeleton'
  | 'pulse'
  | 'wave'
  | 'dots'
  | 'bars';

// WebSocket Types
export interface WebSocketMessage<T = unknown> {
  id: string;
  type: string;
  data: T;
  timestamp: Timestamp;
  
  // Metadata
  userId?: ID;
  sessionId?: string;
  
  // Acknowledgment
  requiresAck?: boolean;
  ackId?: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  
  // Authentication
  authToken?: string;
  authType?: 'bearer' | 'query' | 'header';
  
  // Reconnection
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  
  // Heartbeat
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
  
  // Message handling
  messageQueueSize?: number;
  enableMessageQueue?: boolean;
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error?: string;
  
  // Connection info
  connectedAt?: Timestamp;
  disconnectedAt?: Timestamp;
  reconnectCount: number;
  
  // Message stats
  messagesSent: number;
  messagesReceived: number;
  lastMessageAt?: Timestamp;
  
  // Queue
  messageQueue: WebSocketMessage[];
  queueSize: number;
}

// File Upload Types
export interface FileUpload {
  id: string;
  file: File;
  
  // Progress
  progress: number;
  status: UploadStatus;
  
  // Result
  url?: string;
  error?: string;
  
  // Metadata
  uploadedAt?: Timestamp;
  size: number;
  type: string;
  
  // Preview
  preview?: string;
  thumbnail?: string;
  
  // Validation
  isValid: boolean;
  validationErrors: string[];
}

export type UploadStatus = 
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface UploadConfig {
  endpoint: string;
  method?: HTTPMethod;
  
  // File constraints
  maxSize?: number;
  maxFiles?: number;
  acceptedTypes?: string[];
  
  // Behavior
  autoUpload?: boolean;
  allowMultiple?: boolean;
  
  // Processing
  resize?: ImageResizeConfig;
  compress?: boolean;
  
  // Security
  validateOnClient?: boolean;
  antivirus?: boolean;
  
  // Chunks
  chunkSize?: number;
  enableChunking?: boolean;
  
  // Retry
  maxRetries?: number;
  retryDelay?: number;
}

export interface ImageResizeConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

// Search and Filter Types
export interface SearchRequest {
  query: string;
  filters?: SearchFilter[];
  sort?: SortOption[];
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Features
  highlight?: boolean;
  spellcheck?: boolean;
  autocomplete?: boolean;
  
  // Context
  category?: string;
  userId?: ID;
  sessionId?: string;
}

export interface SearchFilter {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | (string | number)[];
  
  // Metadata
  label?: string;
  type?: FilterType;
}

export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  | 'between'
  | 'is_null'
  | 'is_not_null';

export type FilterType = 
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'range'
  | 'daterange';

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  priority?: number;
}

export interface SearchResponse<T = unknown> {
  results: T[];
  total: number;
  
  // Pagination
  page: number;
  limit: number;
  totalPages: number;
  
  // Search metadata
  query: string;
  searchTime: number;
  
  // Suggestions
  suggestions?: string[];
  corrections?: string[];
  
  // Facets
  facets?: SearchFacet[];
  
  // Highlights
  highlights?: Record<string, string[]>;
}

export interface SearchFacet {
  field: string;
  label: string;
  values: FacetValue[];
  type: 'terms' | 'range' | 'date_histogram';
}

export interface FacetValue {
  value: string | number;
  label: string;
  count: number;
  selected?: boolean;
}
