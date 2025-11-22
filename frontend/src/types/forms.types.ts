/**
 * Forms and Validation Types - Vardhman Mills Frontend
 * 
 * Comprehensive type definitions for form validation, input handling,
 * form state management, multi-step forms, and dynamic form generation.
 * 
 * @version 1.0.0
 * @created 2024-01-12
 */

import { ID, Timestamp } from './common.types';

// ============================================================================
// FORM VALIDATION CORE TYPES
// ============================================================================

/**
 * Generic form field definition
 */
export interface FormField<T = unknown> {
  // Field identification
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  helpText?: string;
  
  // Field type and input configuration
  type: FieldType;
  inputType?: InputType;
  component?: ComponentType;
  
  // Value and validation
  value: T;
  defaultValue?: T;
  validation: FieldValidation;
  
  // State
  isRequired: boolean;
  isDisabled: boolean;
  isReadonly: boolean;
  isVisible: boolean;
  isTouched: boolean;
  isDirty: boolean;
  
  // Conditional logic
  conditions?: FieldCondition[];
  dependencies?: string[]; // Field names this field depends on
  
  // UI configuration
  className?: string;
  style?: Record<string, string>;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
  
  // Additional properties
  metadata?: Record<string, unknown>;
  
  // Field-specific configurations
  options?: FieldOption[]; // For select, radio, checkbox
  multiple?: boolean; // For select, file inputs
  accept?: string; // For file inputs
  min?: number | string; // For number, date inputs
  max?: number | string; // For number, date inputs
  step?: number; // For number inputs
  pattern?: string; // For text inputs
  maxLength?: number; // For text inputs
  minLength?: number; // For text inputs
  rows?: number; // For textarea
  cols?: number; // For textarea
  
  // Auto-completion
  autoComplete?: string;
  autoFocus?: boolean;
}

/**
 * Field types for different input controls
 */
export type FieldType = 
  // Text inputs
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'search'
  | 'textarea'
  
  // Numeric inputs
  | 'number'
  | 'range'
  | 'currency'
  
  // Date and time
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week'
  
  // Selection
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'toggle'
  
  // File handling
  | 'file'
  | 'image'
  | 'avatar'
  
  // Structured data
  | 'address'
  | 'phone'
  | 'json'
  | 'array'
  | 'object'
  
  // UI components
  | 'divider'
  | 'heading'
  | 'description'
  | 'spacer'
  
  // Custom
  | 'custom'
  | 'dynamic';

/**
 * HTML input types
 */
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
  | 'range'
  | 'file'
  | 'hidden'
  | 'submit'
  | 'reset'
  | 'button';

/**
 * Component types for rendering
 */
export type ComponentType = 
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider'
  | 'datepicker'
  | 'timepicker'
  | 'colorpicker'
  | 'fileupload'
  | 'imageupload'
  | 'wysiwyg'
  | 'markdown'
  | 'tags'
  | 'autocomplete'
  | 'combobox'
  | 'rating'
  | 'stepper'
  | 'custom';

/**
 * Field option for select, radio, checkbox fields
 */
export interface FieldOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  group?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Field validation configuration
 */
export interface FieldValidation {
  // Basic validation
  required?: boolean | ValidationRule;
  min?: number | ValidationRule;
  max?: number | ValidationRule;
  minLength?: number | ValidationRule;
  maxLength?: number | ValidationRule;
  pattern?: string | RegExp | ValidationRule;
  
  // Type-specific validation
  email?: boolean | ValidationRule;
  url?: boolean | ValidationRule;
  number?: boolean | ValidationRule;
  integer?: boolean | ValidationRule;
  positive?: boolean | ValidationRule;
  negative?: boolean | ValidationRule;
  
  // Custom validation
  custom?: ValidationRule[];
  
  // Cross-field validation
  equals?: string | ValidationRule; // Field name to compare with
  notEquals?: string | ValidationRule;
  
  // Async validation
  async?: AsyncValidationRule[];
  
  // Validation timing
  validateOn?: ValidationTrigger[];
  debounceMs?: number;
}

/**
 * Validation rule definition
 */
export interface ValidationRule {
  // Rule configuration
  value?: unknown;
  message?: string;
  messageKey?: string; // For i18n
  
  // Validation function
  validator?: (value: unknown, field: FormField, form: FormData) => boolean | Promise<boolean>;
  
  // Conditional validation
  when?: FieldCondition[];
  
  // Rule metadata
  severity?: 'error' | 'warning' | 'info';
  code?: string;
}

/**
 * Async validation rule
 */
export interface AsyncValidationRule extends ValidationRule {
  endpoint?: string;
  method?: 'GET' | 'POST';
  debounceMs?: number;
  cacheMs?: number;
  transformer?: (value: unknown) => unknown;
}

/**
 * When to trigger validation
 */
export type ValidationTrigger = 
  | 'onChange'   // On value change
  | 'onBlur'     // When field loses focus
  | 'onFocus'    // When field gains focus
  | 'onSubmit'   // On form submission
  | 'onMount'    // When field is mounted
  | 'manual';    // Manual trigger only

/**
 * Field conditional logic
 */
export interface FieldCondition {
  // Target field
  field: string;
  
  // Condition type
  operator: ConditionOperator;
  value: unknown;
  
  // Logic
  and?: FieldCondition[];
  or?: FieldCondition[];
}

/**
 * Condition operators
 */
export type ConditionOperator = 
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'isTrue'
  | 'isFalse'
  | 'isIn'
  | 'isNotIn'
  | 'matches'
  | 'custom';

// ============================================================================
// FORM STATE AND MANAGEMENT
// ============================================================================

/**
 * Complete form definition
 */
export interface FormDefinition {
  // Form metadata
  id: string;
  name: string;
  title: string;
  description?: string;
  version: string;
  
  // Form structure
  sections: FormSection[];
  fields: FormField[];
  
  // Form configuration
  config: FormConfig;
  
  // Validation
  validation: FormValidation;
  
  // Submission
  submission: FormSubmission;
  
  // UI configuration
  ui: FormUIConfig;
  
  // Permissions
  permissions?: FormPermissions;
  
  // Localization
  localization?: FormLocalization;
  
  // Analytics
  analytics?: FormAnalytics;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: ID;
  tags?: string[];
}

/**
 * Form section for organizing fields
 */
export interface FormSection {
  id: string;
  name: string;
  title: string;
  description?: string;
  
  // Fields in this section
  fields: string[]; // Field names
  
  // Layout
  layout: SectionLayout;
  columns?: number;
  gap?: string;
  
  // Conditional display
  conditions?: FieldCondition[];
  
  // UI configuration
  collapsible?: boolean;
  collapsed?: boolean;
  icon?: string;
  className?: string;
  
  // Order
  order: number;
}

/**
 * Section layout options
 */
export type SectionLayout = 
  | 'single-column'
  | 'two-column'
  | 'three-column'
  | 'grid'
  | 'flex'
  | 'custom';

/**
 * Form configuration options
 */
export interface FormConfig {
  // Behavior
  autoSave?: boolean;
  autoSaveInterval?: number; // seconds
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
  
  // Navigation
  allowNavigation?: boolean;
  confirmOnLeave?: boolean;
  
  // Submission
  multipleSubmissions?: boolean;
  submitOnEnter?: boolean;
  preventEnterSubmit?: boolean;
  
  // Loading states
  showLoadingOnSubmit?: boolean;
  disableOnSubmit?: boolean;
  
  // Error handling
  scrollToError?: boolean;
  focusOnError?: boolean;
  highlightErrors?: boolean;
  
  // Data handling
  trimWhitespace?: boolean;
  convertEmptyToNull?: boolean;
  
  // Accessibility
  labelPosition?: 'top' | 'left' | 'right' | 'bottom';
  requiredIndicator?: string;
  errorRole?: string;
  
  // Debug mode
  debug?: boolean;
  logEvents?: boolean;
}

/**
 * Form-level validation
 */
export interface FormValidation {
  // Cross-field validation rules
  rules?: FormValidationRule[];
  
  // Custom form-level validators
  custom?: FormValidator[];
  
  // Validation strategy
  strategy?: 'eager' | 'lazy' | 'manual';
  
  // Error handling
  showAllErrors?: boolean;
  groupErrors?: boolean;
  maxErrors?: number;
}

/**
 * Form validation rule
 */
export interface FormValidationRule {
  id: string;
  name: string;
  message: string;
  
  // Validation logic
  validator: (values: Record<string, unknown>, form: FormDefinition) => boolean | Promise<boolean>;
  
  // Affected fields
  fields: string[];
  
  // Conditions
  when?: FieldCondition[];
  
  // Severity
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Form validator function
 */
export interface FormValidator {
  name: string;
  validator: (values: Record<string, unknown>, form: FormDefinition) => ValidationResult | Promise<ValidationResult>;
  async?: boolean;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: FieldError[];
  warnings?: FieldError[];
  info?: FieldError[];
}

/**
 * Field error information
 */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
  severity?: 'error' | 'warning' | 'info';
  meta?: Record<string, unknown>;
}

/**
 * Form submission configuration
 */
export interface FormSubmission {
  // Endpoint configuration
  endpoint?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  
  // Data transformation
  transform?: DataTransformer;
  
  // File handling
  fileUpload?: FileUploadConfig;
  
  // Success handling
  onSuccess?: SubmissionHandler;
  successMessage?: string;
  redirectTo?: string;
  
  // Error handling
  onError?: SubmissionHandler;
  errorMessage?: string;
  retryAttempts?: number;
  
  // Loading
  loadingMessage?: string;
  
  // Validation
  validateBeforeSubmit?: boolean;
  
  // Custom submission
  custom?: CustomSubmissionHandler;
}

/**
 * Data transformer for form submission
 */
export interface DataTransformer {
  include?: string[]; // Fields to include
  exclude?: string[]; // Fields to exclude
  rename?: Record<string, string>; // Field name mapping
  transform?: Record<string, (value: unknown) => unknown>; // Value transformers
  flatten?: boolean; // Flatten nested objects
  removeEmpty?: boolean; // Remove empty fields
}

/**
 * File upload configuration
 */
export interface FileUploadConfig {
  // Upload settings
  url: string;
  method?: 'POST' | 'PUT';
  fieldName?: string; // Form field name for file
  
  // File constraints
  maxSize?: number; // bytes
  maxFiles?: number;
  allowedTypes?: string[]; // MIME types
  allowedExtensions?: string[];
  
  // Upload behavior
  immediate?: boolean; // Upload immediately on selection
  multiple?: boolean;
  
  // Progress tracking
  trackProgress?: boolean;
  chunkSize?: number; // For chunked uploads
  
  // Error handling
  maxRetries?: number;
  retryDelay?: number; // seconds
  
  // Security
  generatePreview?: boolean;
  validateOnClient?: boolean;
  
  // Custom handlers
  onProgress?: (progress: number, file: File) => void;
  onComplete?: (response: unknown, file: File) => void;
  onError?: (error: Error, file: File) => void;
}

/**
 * Submission handler function
 */
export type SubmissionHandler = (
  result: SubmissionResult,
  form: FormDefinition,
  values: Record<string, unknown>
) => void | Promise<void>;

/**
 * Custom submission handler
 */
export type CustomSubmissionHandler = (
  values: Record<string, unknown>,
  form: FormDefinition
) => Promise<SubmissionResult>;

/**
 * Submission result
 */
export interface SubmissionResult {
  success: boolean;
  data?: unknown;
  error?: Error | string;
  message?: string;
  redirectTo?: string;
  
  // Additional metadata
  statusCode?: number;
  headers?: Record<string, string>;
  timing?: {
    start: number;
    end: number;
    duration: number;
  };
}

/**
 * Form UI configuration
 */
export interface FormUIConfig {
  // Layout
  layout?: 'vertical' | 'horizontal' | 'inline' | 'grid';
  spacing?: 'compact' | 'normal' | 'comfortable';
  size?: 'small' | 'medium' | 'large';
  
  // Styling
  theme?: 'default' | 'minimal' | 'material' | 'custom';
  className?: string;
  style?: Record<string, string>;
  
  // Components
  components?: ComponentOverrides;
  
  // Actions
  actions?: FormAction[];
  actionAlignment?: 'left' | 'center' | 'right' | 'space-between';
  
  // Progress
  showProgress?: boolean;
  progressType?: 'bar' | 'steps' | 'percentage';
  
  // Help and guidance
  showFieldHelp?: boolean;
  helpPosition?: 'tooltip' | 'below' | 'sidebar';
  
  // Mobile responsiveness
  mobileBreakpoint?: number;
  mobileLayout?: 'stack' | 'accordion' | 'tabs';
}

/**
 * Component overrides for custom rendering
 */
export interface ComponentOverrides {
  [key: string]: React.ComponentType<Record<string, unknown>>;
}

/**
 * Form action (buttons, links, etc.)
 */
export interface FormAction {
  id: string;
  type: ActionType;
  label: string;
  
  // Behavior
  action?: ActionHandler;
  href?: string;
  target?: string;
  
  // Appearance
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  
  // Conditions
  conditions?: FieldCondition[];
  
  // Order
  order?: number;
}

/**
 * Action types
 */
export type ActionType = 
  | 'submit'
  | 'reset'
  | 'cancel'
  | 'save'
  | 'next'
  | 'previous'
  | 'custom'
  | 'link';

/**
 * Action handler function
 */
export type ActionHandler = (
  form: FormDefinition,
  values: Record<string, unknown>
) => void | Promise<void>;

/**
 * Form permissions
 */
export interface FormPermissions {
  // View permissions
  view?: PermissionRule[];
  
  // Edit permissions
  edit?: PermissionRule[];
  fieldEdit?: Record<string, PermissionRule[]>;
  
  // Submit permissions
  submit?: PermissionRule[];
  
  // Delete permissions
  delete?: PermissionRule[];
}

/**
 * Permission rule
 */
export interface PermissionRule {
  type: 'role' | 'user' | 'group' | 'custom';
  value: string | string[];
  condition?: (user: unknown, context: unknown) => boolean;
}

/**
 * Form localization
 */
export interface FormLocalization {
  // Supported languages
  languages: string[];
  defaultLanguage: string;
  
  // Translations
  translations: Record<string, FormTranslations>;
  
  // Date/number formatting
  formatting?: Record<string, FormattingOptions>;
}

/**
 * Form translations for a language
 */
export interface FormTranslations {
  // Form-level translations
  title?: string;
  description?: string;
  
  // Field translations
  fields?: Record<string, FieldTranslations>;
  
  // Section translations
  sections?: Record<string, SectionTranslations>;
  
  // Validation messages
  validation?: Record<string, string>;
  
  // Action labels
  actions?: Record<string, string>;
  
  // Common messages
  messages?: Record<string, string>;
}

/**
 * Field translations
 */
export interface FieldTranslations {
  label?: string;
  placeholder?: string;
  description?: string;
  helpText?: string;
  errorMessage?: string;
  options?: Record<string, string>;
}

/**
 * Section translations
 */
export interface SectionTranslations {
  title?: string;
  description?: string;
}

/**
 * Formatting options for localization
 */
export interface FormattingOptions {
  dateFormat?: string;
  timeFormat?: string;
  numberFormat?: Intl.NumberFormatOptions;
  currencyFormat?: Intl.NumberFormatOptions;
}

/**
 * Form analytics tracking
 */
export interface FormAnalytics {
  // Tracking configuration
  enabled?: boolean;
  provider?: 'google' | 'adobe' | 'mixpanel' | 'custom';
  
  // Events to track
  trackViews?: boolean;
  trackFieldInteractions?: boolean;
  trackValidationErrors?: boolean;
  trackSubmissions?: boolean;
  trackAbandonment?: boolean;
  
  // Custom events
  customEvents?: AnalyticsEvent[];
  
  // Privacy
  anonymizeData?: boolean;
  excludeFields?: string[];
  
  // Sampling
  sampleRate?: number;
}

/**
 * Analytics event definition
 */
export interface AnalyticsEvent {
  name: string;
  trigger: AnalyticsTrigger;
  properties?: Record<string, unknown>;
  condition?: FieldCondition[];
}

/**
 * Analytics triggers
 */
export type AnalyticsTrigger = 
  | 'formView'
  | 'formStart'
  | 'fieldFocus'
  | 'fieldBlur'
  | 'fieldChange'
  | 'validationError'
  | 'formSubmit'
  | 'formComplete'
  | 'formAbandon'
  | 'custom';

// ============================================================================
// MULTI-STEP FORMS
// ============================================================================

/**
 * Multi-step form definition
 */
export interface MultiStepForm extends Omit<FormDefinition, 'sections'> {
  // Steps instead of sections
  steps: FormStep[];
  
  // Navigation
  navigation: StepNavigation;
  
  // Current state
  currentStep: number;
  completedSteps: number[];
  
  // Step validation
  validateStepOnNext?: boolean;
  allowBackward?: boolean;
  
  // Progress tracking
  showProgress?: boolean;
  progressMode?: 'linear' | 'branching';
  
  // Data persistence
  persistBetweenSteps?: boolean;
  clearDataOnBack?: boolean;
}

/**
 * Form step definition
 */
export interface FormStep {
  id: string;
  name: string;
  title: string;
  description?: string;
  
  // Fields in this step
  fields: string[];
  
  // Step validation
  validation?: StepValidation;
  
  // Navigation rules
  canSkip?: boolean;
  skipConditions?: FieldCondition[];
  
  // Next step logic
  nextStep?: string | ConditionalNextStep[];
  
  // UI configuration
  ui?: StepUIConfig;
  
  // Completion
  isCompleted?: boolean;
  completedAt?: Timestamp;
  
  // Order
  order: number;
}

/**
 * Conditional next step logic
 */
export interface ConditionalNextStep {
  conditions: FieldCondition[];
  nextStep: string;
}

/**
 * Step validation configuration
 */
export interface StepValidation {
  // Required for step completion
  required?: string[];
  
  // Custom validation
  custom?: StepValidator[];
  
  // Async validation
  async?: boolean;
  
  // Validation timing
  validateOn?: 'next' | 'change' | 'manual';
}

/**
 * Step validator function
 */
export interface StepValidator {
  name: string;
  validator: (values: Record<string, unknown>, step: FormStep) => boolean | Promise<boolean>;
  message: string;
}

/**
 * Step navigation configuration
 */
export interface StepNavigation {
  // Navigation type
  type: 'buttons' | 'stepper' | 'tabs' | 'sidebar';
  
  // Button configuration
  showNext?: boolean;
  showPrevious?: boolean;
  showSkip?: boolean;
  showCancel?: boolean;
  
  // Button labels
  nextLabel?: string;
  previousLabel?: string;
  skipLabel?: string;
  finishLabel?: string;
  cancelLabel?: string;
  
  // Navigation position
  position?: 'top' | 'bottom' | 'both' | 'floating';
  
  // Stepper configuration
  showStepNumbers?: boolean;
  showStepTitles?: boolean;
  allowClickNavigation?: boolean;
  
  // Progress indicator
  showProgress?: boolean;
  progressFormat?: 'fraction' | 'percentage' | 'steps';
}

/**
 * Step UI configuration
 */
export interface StepUIConfig {
  // Layout
  layout?: SectionLayout;
  
  // Animation
  transition?: 'slide' | 'fade' | 'none';
  animationDuration?: number;
  
  // Loading
  showLoading?: boolean;
  loadingMessage?: string;
  
  // Help
  helpContent?: string;
  helpPosition?: 'sidebar' | 'modal' | 'inline';
}

// ============================================================================
// DYNAMIC FORMS
// ============================================================================

/**
 * Dynamic form definition
 */
export interface DynamicForm extends FormDefinition {
  // Dynamic configuration
  dynamic: DynamicConfig;
  
  // Rules for dynamic behavior
  rules: DynamicRule[];
  
  // Data sources
  dataSources: DataSource[];
  
  // Templates
  templates: FieldTemplate[];
}

/**
 * Dynamic form configuration
 */
export interface DynamicConfig {
  // Field generation
  generateFields?: boolean;
  generateFromSchema?: boolean;
  
  // Real-time updates
  realTimeUpdates?: boolean;
  updateInterval?: number; // seconds
  
  // Conditional fields
  conditionalFields?: boolean;
  
  // Field dependencies
  fieldDependencies?: boolean;
  
  // Data binding
  dataBinding?: DataBindingConfig;
}

/**
 * Dynamic rule for form behavior
 */
export interface DynamicRule {
  id: string;
  name: string;
  description?: string;
  
  // Trigger conditions
  triggers: RuleTrigger[];
  
  // Actions to perform
  actions: RuleAction[];
  
  // Rule state
  isActive: boolean;
  priority: number;
  
  // Execution
  executeOnce?: boolean;
  debounceMs?: number;
}

/**
 * Rule trigger definition
 */
export interface RuleTrigger {
  type: TriggerType;
  field?: string;
  event?: string;
  condition?: FieldCondition;
  value?: unknown;
}

/**
 * Rule trigger types
 */
export type TriggerType = 
  | 'fieldChange'
  | 'fieldFocus'
  | 'fieldBlur'
  | 'formLoad'
  | 'dataChange'
  | 'custom'
  | 'timer'
  | 'api';

/**
 * Rule action definition
 */
export interface RuleAction {
  type: ActionType;
  target?: string; // Field name or selector
  value?: unknown;
  config?: Record<string, unknown>;
  delay?: number; // milliseconds
}

/**
 * Rule action types
 */
export type RuleActionType = 
  | 'showField'
  | 'hideField'
  | 'enableField'
  | 'disableField'
  | 'setValue'
  | 'clearValue'
  | 'addField'
  | 'removeField'
  | 'addSection'
  | 'removeSection'
  | 'addOptions'
  | 'removeOptions'
  | 'updateValidation'
  | 'showMessage'
  | 'hideMessage'
  | 'makeRequired'
  | 'makeOptional'
  | 'updateLabel'
  | 'updateHelp'
  | 'triggerValidation'
  | 'loadData'
  | 'saveData'
  | 'custom';

/**
 * Data source for dynamic content
 */
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  
  // Source configuration
  config: DataSourceConfig;
  
  // Caching
  cache?: DataSourceCache;
  
  // Error handling
  errorHandling?: DataSourceErrorHandling;
  
  // Data transformation
  transform?: DataTransformFunction;
}

/**
 * Data source types
 */
export type DataSourceType = 
  | 'api'
  | 'graphql'
  | 'static'
  | 'localStorage'
  | 'sessionStorage'
  | 'cookie'
  | 'url'
  | 'custom';

/**
 * Data source configuration
 */
export interface DataSourceConfig {
  // API configuration
  url?: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  body?: unknown;
  
  // GraphQL configuration
  query?: string;
  variables?: Record<string, unknown>;
  
  // Static data
  data?: unknown;
  
  // Storage key
  key?: string;
  
  // Custom function
  fetch?: () => Promise<unknown>;
}

/**
 * Data source caching
 */
export interface DataSourceCache {
  enabled: boolean;
  ttl?: number; // seconds
  key?: string;
  invalidateOn?: string[]; // Events that invalidate cache
}

/**
 * Data source error handling
 */
export interface DataSourceErrorHandling {
  retry?: number;
  retryDelay?: number; // seconds
  fallbackData?: unknown;
  onError?: (error: Error) => void;
}

/**
 * Data transform function
 */
export type DataTransformFunction = (data: unknown) => unknown;

/**
 * Field template for dynamic generation
 */
export interface FieldTemplate {
  id: string;
  name: string;
  template: Partial<FormField>;
  
  // Generation rules
  generateWhen?: FieldCondition[];
  generateFor?: string; // Data property to iterate over
  
  // Naming convention
  nameTemplate?: string;
  labelTemplate?: string;
  
  // Customization
  customizer?: FieldCustomizer;
}

/**
 * Field customizer function
 */
export type FieldCustomizer = (
  template: Partial<FormField>,
  data: unknown,
  index?: number
) => Partial<FormField>;

/**
 * Data binding configuration
 */
export interface DataBindingConfig {
  // Auto-binding
  autoBind?: boolean;
  
  // Binding mode
  mode?: 'one-way' | 'two-way';
  
  // Data path mapping
  pathMapping?: Record<string, string>;
  
  // Sync frequency
  syncOnChange?: boolean;
  syncInterval?: number; // seconds
  
  // Conflict resolution
  conflictResolution?: 'client-wins' | 'server-wins' | 'manual';
}

// ============================================================================
// FORM BUILDER TYPES
// ============================================================================

/**
 * Form builder configuration
 */
export interface FormBuilder {
  // Available components
  components: FormBuilderComponent[];
  
  // Component categories
  categories: ComponentCategory[];
  
  // Settings
  settings: FormBuilderSettings;
  
  // Current form being built
  currentForm?: FormDefinition;
  
  // Preview mode
  previewMode?: boolean;
  
  // Collaboration
  collaboration?: FormBuilderCollaboration;
}

/**
 * Form builder component
 */
export interface FormBuilderComponent {
  id: string;
  name: string;
  label: string;
  description?: string;
  icon?: string;
  category: string;
  
  // Component template
  template: Partial<FormField>;
  
  // Configuration options
  configurable: ComponentConfigOption[];
  
  // Validation
  validation?: ComponentValidation;
  
  // Restrictions
  maxCount?: number;
  allowedParents?: string[];
  allowedChildren?: string[];
  
  // Custom renderer
  renderer?: React.ComponentType<unknown>;
}

/**
 * Component category
 */
export interface ComponentCategory {
  id: string;
  name: string;
  label: string;
  icon?: string;
  order: number;
  components: string[]; // Component IDs
}

/**
 * Component configuration option
 */
export interface ComponentConfigOption {
  name: string;
  label: string;
  type: ConfigOptionType;
  defaultValue?: unknown;
  required?: boolean;
  options?: FieldOption[];
  validation?: FieldValidation;
  description?: string;
}

/**
 * Configuration option types
 */
export type ConfigOptionType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'color'
  | 'icon'
  | 'json'
  | 'code';

/**
 * Component validation in builder
 */
export interface ComponentValidation {
  required?: string[];
  custom?: ComponentValidator[];
}

/**
 * Component validator function
 */
export interface ComponentValidator {
  name: string;
  validator: (component: FormBuilderComponent, config: Record<string, unknown>) => boolean;
  message: string;
}

/**
 * Form builder settings
 */
export interface FormBuilderSettings {
  // Grid and layout
  gridSize?: number;
  snapToGrid?: boolean;
  showGrid?: boolean;
  
  // Drag and drop
  enableDragDrop?: boolean;
  dragThreshold?: number;
  
  // Preview
  livePreview?: boolean;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
  
  // Code generation
  generateCode?: boolean;
  codeLanguage?: 'typescript' | 'javascript' | 'json';
  
  // Validation
  validateOnBuild?: boolean;
  
  // Auto-save
  autoSave?: boolean;
  autoSaveInterval?: number; // seconds
  
  // Collaboration
  enableCollaboration?: boolean;
  maxCollaborators?: number;
}

/**
 * Form builder collaboration
 */
export interface FormBuilderCollaboration {
  // Session info
  sessionId: string;
  ownerId: ID;
  collaborators: FormBuilderCollaborator[];
  
  // Real-time sync
  enableRealTimeSync?: boolean;
  syncInterval?: number; // seconds
  
  // Conflict resolution
  conflictResolution?: 'last-write-wins' | 'manual';
  
  // Change tracking
  trackChanges?: boolean;
  changeHistory?: FormBuilderChange[];
  
  // Permissions
  permissions?: FormBuilderPermissions;
}

/**
 * Form builder collaborator
 */
export interface FormBuilderCollaborator {
  userId: ID;
  name: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  isOnline: boolean;
  lastSeen: Timestamp;
  cursor?: {
    x: number;
    y: number;
    element?: string;
  };
}

/**
 * Form builder change tracking
 */
export interface FormBuilderChange {
  id: string;
  userId: ID;
  action: ChangeAction;
  target: string; // Element ID or path
  oldValue?: unknown;
  newValue?: unknown;
  timestamp: Timestamp;
  description?: string;
}

/**
 * Change action types
 */
export type ChangeAction = 
  | 'add'
  | 'remove'
  | 'update'
  | 'move'
  | 'copy'
  | 'rename';

/**
 * Form builder permissions
 */
export interface FormBuilderPermissions {
  canEdit?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
  canExport?: boolean;
  canPublish?: boolean;
  canManageCollaborators?: boolean;
}

// ============================================================================
// FORM COMPONENT PROPS
// ============================================================================

/**
 * Base props for form components
 */
export interface BaseFormProps {
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
}

/**
 * Field component props
 */
export interface FieldProps extends BaseFormProps {
  field: FormField;
  value: unknown;
  error?: string;
  touched?: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  onFocus: () => void;
}

/**
 * Input component props
 */
export interface InputProps extends BaseFormProps {
  type?: InputType;
  value: string | number;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  onChange: (value: string | number) => void;
  onBlur: () => void;
  onFocus: () => void;
}

/**
 * Select component props
 */
export interface SelectProps extends BaseFormProps {
  options: FieldOption[];
  value: string | number | string[] | number[];
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  onChange: (value: string | number | string[] | number[]) => void;
  onBlur: () => void;
  onFocus: () => void;
}

/**
 * Checkbox component props
 */
export interface CheckboxProps extends BaseFormProps {
  checked: boolean;
  indeterminate?: boolean;
  label?: string;
  onChange: (checked: boolean) => void;
  onBlur: () => void;
  onFocus: () => void;
}

/**
 * Radio component props
 */
export interface RadioProps extends BaseFormProps {
  options: FieldOption[];
  value: string | number;
  name: string;
  onChange: (value: string | number) => void;
  onBlur: () => void;
  onFocus: () => void;
}

/**
 * Button component props
 */
export interface ButtonProps {
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  loading?: boolean;
  icon?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

/**
 * Error message component props
 */
export interface ErrorMessageProps {
  error?: string;
  touched?: boolean;
  className?: string;
  role?: string;
}

/**
 * Label component props
 */
export interface LabelProps {
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

// All types are exported inline, no additional exports needed
export default FormDefinition;