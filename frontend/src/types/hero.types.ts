import { BaseEntity, ID, Timestamp, ImageAsset, PaginatedResponse, APIResponse, APIError, FileUpload } from './common.types';
import { User } from './user.types';

// Hero Section Types - Comprehensive hero section and banner management system for e-commerce platform

// ===== CORE TYPES =====
export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
export type HeroStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' | 'archived';
export type HeroType = 'banner' | 'carousel' | 'video_hero' | 'interactive' | 'product_showcase' | 'promotional' | 'seasonal';
export type LayoutType = 'full_width' | 'contained' | 'split_screen' | 'overlay' | 'minimalist' | 'grid' | 'asymmetric';
export type AnimationType = 'none' | 'fade' | 'slide' | 'zoom' | 'parallax' | 'ken_burns' | 'custom';
export type TransitionType = 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'bounce' | 'elastic' | 'custom';
export type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'smart_tv' | 'all';
export type CallToActionType = 'primary' | 'secondary' | 'link' | 'button' | 'text' | 'image' | 'video';
export type MediaType = 'image' | 'video' | 'gif' | 'svg' | 'lottie' | 'canvas';
export type PositionType = 'top_left' | 'top_center' | 'top_right' | 'center_left' | 'center' | 'center_right' | 'bottom_left' | 'bottom_center' | 'bottom_right' | 'custom';

// ===== BASIC INTERFACES =====
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: unknown;
}

export interface Dimensions {
  width: number;
  height: number;
  units: 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw';
}

export interface Position {
  x: number;
  y: number;
  units: 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw';
}

export interface Color {
  hex: string;
  rgb: string;
  rgba: string;
  hsl: string;
  name?: string;
}

export interface Typography {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color: Color;
}

export interface Spacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
  units: 'px' | 'em' | 'rem' | '%';
}

export interface Border {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'none';
  color: Color;
  radius: number;
}

export interface Shadow {
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadRadius: number;
  color: Color;
  inset: boolean;
}

export interface Gradient {
  type: 'linear' | 'radial' | 'conic';
  direction?: string;
  colors: GradientStop[];
}

export interface GradientStop {
  color: Color;
  position: number;
}

export interface Filter {
  type: 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'hue_rotate' | 'invert' | 'opacity' | 'saturate' | 'sepia';
  value: number;
  units?: string;
}

export interface Transform {
  type: 'rotate' | 'scale' | 'skew' | 'translate' | 'matrix';
  values: number[];
  units?: string;
}

// ===== MAIN HERO ENTITY =====
export interface Hero extends BaseEntity {
  id: ID;
  name: string;
  title?: string;
  subtitle?: string;
  description?: string;
  type: HeroType;
  layout: LayoutType;
  status: HeroStatus;
  priority: Priority;
  
  // Content & Media
  content: HeroContent;
  media: HeroMedia[];
  backgroundColor?: Color;
  backgroundGradient?: Gradient;
  
  // Call to Actions
  callToActions: CallToAction[];
  primaryCTA?: CallToAction;
  secondaryCTA?: CallToAction;
  
  // Layout & Styling
  style: HeroStyle;
  responsiveSettings: ResponsiveSettings;
  customCSS?: string;
  
  // Animation & Interaction
  animations: Animation[];
  interactiveElements: InteractiveElement[];
  transitions: Transition[];
  
  // Targeting & Display
  targeting: TargetingRules;
  displayRules: DisplayRule[];
  schedule: ScheduleConfig;
  
  // A/B Testing
  variants: HeroVariant[];
  testingConfig?: ABTestConfig;
  
  // Performance & Optimization
  optimization: OptimizationSettings;
  lazyLoading: LazyLoadingConfig;
  preloading: PreloadingConfig;
  
  // Analytics & Tracking
  analytics: HeroAnalytics;
  conversionTracking: ConversionTracking;
  heatmapTracking?: HeatmapConfig;
  
  // SEO & Accessibility
  seo: SEOSettings;
  accessibility: AccessibilitySettings;
  alternativeText: string;
  
  // Localization
  localization: LocalizationConfig;
  translations: HeroTranslation[];
  
  // User Management
  createdBy: ID;
  updatedBy: ID;
  assignedTo?: ID;
  reviewedBy?: ID;
  
  // Timeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  scheduledAt?: Timestamp;
  expiresAt?: Timestamp;
  
  // Custom Fields
  tags: string[];
  categories: string[];
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// ===== HERO CONTENT =====
export interface HeroContent {
  id?: string; // Optional ID for hero content
  // Simplified properties for direct usage
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive?: boolean;
  // Advanced content components
  headline?: HeadlineContent;
  subheadline?: SubheadlineContent;
  bodyText?: BodyContent;
  overlay?: OverlayContent;
  badge?: BadgeContent;
  countdown?: CountdownContent;
  socialProof?: SocialProofContent;
}

export interface HeadlineContent {
  text: string;
  typography: Typography;
  animation?: Animation;
  position: PositionType;
  offset?: Position;
  maxWidth?: string;
  wordWrap: boolean;
  allowHTML: boolean;
}

export interface SubheadlineContent {
  text: string;
  typography: Typography;
  animation?: Animation;
  position: PositionType;
  offset?: Position;
  maxWidth?: string;
}

export interface BodyContent {
  text: string;
  typography: Typography;
  animation?: Animation;
  position: PositionType;
  offset?: Position;
  maxWidth?: string;
  lineClamp?: number;
}

export interface OverlayContent {
  opacity: number;
  color?: Color;
  gradient?: Gradient;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft_light' | 'hard_light';
  pattern?: PatternOverlay;
}

export interface PatternOverlay {
  type: 'dots' | 'lines' | 'grid' | 'noise' | 'custom';
  size: number;
  opacity: number;
  color: Color;
}

export interface BadgeContent {
  text: string;
  type: 'new' | 'sale' | 'featured' | 'limited' | 'custom';
  style: BadgeStyle;
  position: PositionType;
  animation?: Animation;
}

export interface BadgeStyle {
  backgroundColor: Color;
  textColor: Color;
  border?: Border;
  typography: Typography;
  padding: Spacing;
  borderRadius: number;
  shadow?: Shadow;
}

export interface CountdownContent {
  targetDate: Timestamp;
  format: 'days_hours_minutes' | 'hours_minutes_seconds' | 'custom';
  labels: CountdownLabels;
  style: CountdownStyle;
  position: PositionType;
  autoHide: boolean;
}

export interface CountdownLabels {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export interface CountdownStyle {
  containerStyle: ContainerStyle;
  digitStyle: DigitStyle;
  labelStyle: Typography;
  separatorStyle: SeparatorStyle;
}

export interface ContainerStyle {
  backgroundColor?: Color;
  border?: Border;
  padding: Spacing;
  borderRadius: number;
  shadow?: Shadow;
}

export interface DigitStyle {
  typography: Typography;
  backgroundColor?: Color;
  border?: Border;
  padding: Spacing;
  borderRadius: number;
  minWidth: string;
}

export interface SeparatorStyle {
  character: string;
  typography: Typography;
  margin: Spacing;
}

export interface SocialProofContent {
  type: 'reviews' | 'customers' | 'sales' | 'testimonials' | 'trust_badges';
  data: SocialProofData;
  style: SocialProofStyle;
  position: PositionType;
  updateInterval?: number;
}

export interface SocialProofData {
  count?: number;
  rating?: number;
  text?: string;
  avatar?: ImageAsset;
  name?: string;
  title?: string;
  badges?: TrustBadge[];
}

export interface TrustBadge {
  name: string;
  icon: ImageAsset;
  url?: string;
}

export interface SocialProofStyle {
  containerStyle: ContainerStyle;
  textStyle: Typography;
  iconStyle: IconStyle;
  layout: 'horizontal' | 'vertical' | 'grid';
}

export interface IconStyle {
  size: Dimensions;
  color?: Color;
  filter?: Filter[];
}

// ===== HERO MEDIA =====
export interface HeroMedia {
  id: ID;
  type: MediaType;
  isPrimary: boolean;
  
  // Asset Information
  asset: ImageAsset | VideoAsset | LottieAsset | SVGAsset;
  thumbnail?: ImageAsset;
  placeholder?: ImageAsset;
  
  // Display Properties
  position: PositionType;
  offset?: Position;
  dimensions?: Dimensions;
  objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale_down';
  objectPosition: string;
  
  // Styling
  filters?: Filter[];
  transforms?: Transform[];
  opacity: number;
  zIndex: number;
  
  // Animation
  animation?: Animation;
  parallax?: ParallaxConfig;
  
  // Responsive
  responsiveVariants: ResponsiveMediaVariant[];
  
  // Loading
  lazyLoad: boolean;
  preload: boolean;
  priority: 'high' | 'medium' | 'low';
  
  // Accessibility
  altText: string;
  ariaLabel?: string;
  
  // Performance
  optimization: MediaOptimization;
  
  // Metadata
  caption?: string;
  credits?: string;
  metadata: Record<string, unknown>;
}

export interface VideoAsset extends ImageAsset {
  duration: number;
  poster?: ImageAsset;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  controls: boolean;
  playsinline: boolean;
  tracks?: VideoTrack[];
}

export interface LottieAsset {
  url: string;
  data?: Record<string, unknown>;
  autoplay: boolean;
  loop: boolean;
  speed: number;
  direction: 1 | -1;
}

export interface SVGAsset {
  url: string;
  inline?: string;
  width?: number;
  height?: number;
  viewBox?: string;
}

export interface VideoTrack {
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  src: string;
  srclang: string;
  label: string;
  default?: boolean;
}

export interface ParallaxConfig {
  enabled: boolean;
  speed: number;
  direction: 'vertical' | 'horizontal' | 'both';
  offset: number;
}

export interface ResponsiveMediaVariant {
  deviceType: DeviceType;
  asset: ImageAsset | VideoAsset;
  dimensions?: Dimensions;
  breakpoint: string;
}

export interface MediaOptimization {
  quality: number;
  format: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  progressive: boolean;
  compression: number;
  resize: ResizeConfig;
}

export interface ResizeConfig {
  enabled: boolean;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  upscale: boolean;
}

// ===== CALL TO ACTION =====
export interface CallToAction {
  id: ID;
  text: string;
  type: CallToActionType;
  action: CTAAction;
  
  // Styling
  style: CTAStyle;
  hoverStyle?: CTAStyle;
  activeStyle?: CTAStyle;
  disabledStyle?: CTAStyle;
  
  // Layout
  position: PositionType;
  offset?: Position;
  size: 'small' | 'medium' | 'large' | 'custom';
  width?: string;
  height?: string;
  
  // Behavior
  isEnabled: boolean;
  isVisible: boolean;
  openInNewTab: boolean;
  
  // Animation
  animation?: Animation;
  hoverAnimation?: Animation;
  clickAnimation?: Animation;
  
  // Analytics
  trackingId: string;
  conversionGoal?: string;
  
  // A/B Testing
  variants?: CTAVariant[];
  testWeight?: number;
  
  // Accessibility
  ariaLabel?: string;
  tabIndex?: number;
  role?: string;
  
  // Custom Properties
  customAttributes: Record<string, string>;
  metadata: Record<string, unknown>;
}

export interface CTAAction {
  type: 'link' | 'modal' | 'scroll' | 'javascript' | 'download' | 'share' | 'custom';
  url?: string;
  modalId?: string;
  scrollTarget?: string;
  jsFunction?: string;
  downloadUrl?: string;
  shareData?: ShareData;
  customData?: Record<string, unknown>;
}

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export interface CTAStyle {
  backgroundColor: Color;
  textColor: Color;
  border?: Border;
  typography: Typography;
  padding: Spacing;
  margin: Spacing;
  borderRadius: number;
  shadow?: Shadow;
  filters?: Filter[];
  transforms?: Transform[];
  gradient?: Gradient;
  icon?: CTAIcon;
}

export interface CTAIcon {
  type: 'font' | 'svg' | 'image';
  value: string;
  position: 'left' | 'right' | 'top' | 'bottom';
  size: Dimensions;
  color?: Color;
  margin: Spacing;
}

export interface CTAVariant {
  id: ID;
  text: string;
  style: CTAStyle;
  weight: number;
  isActive: boolean;
}

// ===== STYLING & LAYOUT =====
export interface HeroStyle {
  container: ContainerStyle;
  layout: LayoutConfig;
  spacing: SpacingConfig;
  typography: TypographyConfig;
  colors: ColorConfig;
  effects: EffectConfig;
}

export interface LayoutConfig {
  type: LayoutType;
  alignment: AlignmentConfig;
  distribution: DistributionConfig;
  ordering: OrderingConfig;
  responsive: ResponsiveLayoutConfig;
}

export interface AlignmentConfig {
  horizontal: 'left' | 'center' | 'right' | 'stretch';
  vertical: 'top' | 'middle' | 'bottom' | 'stretch';
  content: 'start' | 'center' | 'end' | 'space_between' | 'space_around' | 'space_evenly';
}

export interface DistributionConfig {
  contentWidth: string;
  mediaWidth: string;
  gap: string;
  wrap: boolean;
}

export interface OrderingConfig {
  desktop: ElementOrder;
  tablet: ElementOrder;
  mobile: ElementOrder;
}

export interface ElementOrder {
  media: number;
  content: number;
  cta: number;
}

export interface ResponsiveLayoutConfig {
  breakpoints: BreakpointConfig[];
  fluidDesign: boolean;
  mobileFirst: boolean;
}

export interface BreakpointConfig {
  name: string;
  minWidth: number;
  maxWidth?: number;
  layout: Partial<LayoutConfig>;
  overrides: Record<string, unknown>;
}

export interface SpacingConfig {
  container: Spacing;
  content: Spacing;
  elements: Spacing;
  responsive: ResponsiveSpacing[];
}

export interface ResponsiveSpacing {
  breakpoint: string;
  spacing: Spacing;
}

export interface TypographyConfig {
  headlineDefaults: Typography;
  subheadlineDefaults: Typography;
  bodyDefaults: Typography;
  ctaDefaults: Typography;
  scale: TypographyScale;
}

export interface TypographyScale {
  ratio: number;
  baseFontSize: string;
  baseLineHeight: number;
  steps: TypographyStep[];
}

export interface TypographyStep {
  name: string;
  size: string;
  lineHeight: number;
  weight?: number;
}

export interface ColorConfig {
  palette: ColorPalette;
  themes: ColorTheme[];
  accessibility: AccessibilityColors;
}

export interface ColorPalette {
  primary: Color[];
  secondary: Color[];
  neutral: Color[];
  accent: Color[];
}

export interface ColorTheme {
  name: string;
  colors: Record<string, Color>;
  isDefault: boolean;
}

export interface AccessibilityColors {
  contrastRatios: ContrastRatio[];
  alternativeColors: Record<string, Color>;
  highContrastMode: boolean;
}

export interface ContrastRatio {
  foreground: string;
  background: string;
  ratio: number;
  wcagLevel: 'AA' | 'AAA';
}

export interface EffectConfig {
  shadows: Shadow[];
  gradients: Gradient[];
  filters: Filter[];
  transitions: TransitionConfig[];
}

export interface TransitionConfig {
  property: string;
  duration: number;
  timingFunction: TransitionType;
  delay: number;
}

// ===== ANIMATION & INTERACTION =====
export interface Animation {
  id: ID;
  name: string;
  type: AnimationType;
  duration: number;
  delay: number;
  iterations: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate_reverse';
  fillMode: 'none' | 'forwards' | 'backwards' | 'both';
  timingFunction: TransitionType;
  keyframes: AnimationKeyframe[];
  trigger: AnimationTrigger;
  conditions: AnimationCondition[];
}

export interface AnimationKeyframe {
  offset: number;
  properties: Record<string, string | number>;
  easing?: TransitionType;
}

export interface AnimationTrigger {
  type: 'load' | 'scroll' | 'hover' | 'click' | 'viewport' | 'time' | 'custom';
  threshold?: number;
  delay?: number;
  offset?: number;
  element?: string;
}

export interface AnimationCondition {
  type: 'device' | 'viewport' | 'preference' | 'performance';
  value: string | number | boolean;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface InteractiveElement {
  id: ID;
  type: 'hotspot' | 'tooltip' | 'modal' | 'drawer' | 'accordion' | 'tab' | 'custom';
  target: ElementTarget;
  content: InteractiveContent;
  trigger: InteractionTrigger;
  style: InteractiveStyle;
  animation?: Animation;
}

export interface ElementTarget {
  selector: string;
  area?: ClickArea;
  position?: Position;
}

export interface ClickArea {
  shape: 'rectangle' | 'circle' | 'polygon';
  coordinates: number[];
  tolerance: number;
}

export interface InteractiveContent {
  title?: string;
  description?: string;
  media?: ImageAsset | VideoAsset;
  actions?: CallToAction[];
  customHTML?: string;
}

export interface InteractionTrigger {
  type: 'click' | 'hover' | 'focus' | 'scroll' | 'time' | 'custom';
  delay?: number;
  duration?: number;
}

export interface InteractiveStyle {
  container: ContainerStyle;
  overlay?: OverlayStyle;
  positioning: PositioningConfig;
  animation: AnimationConfig;
}

export interface OverlayStyle {
  backgroundColor: Color;
  opacity: number;
  blur: number;
  clickToClose: boolean;
}

export interface PositioningConfig {
  strategy: 'absolute' | 'fixed' | 'relative' | 'sticky';
  anchor: 'element' | 'viewport' | 'cursor';
  offset: Position;
  alignment: AlignmentConfig;
}

export interface AnimationConfig {
  enter: Animation;
  exit: Animation;
  transition?: Animation;
}

export interface Transition {
  id: ID;
  name: string;
  type: 'slide' | 'fade' | 'scale' | 'rotate' | 'flip' | 'custom';
  duration: number;
  easing: TransitionType;
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
  properties: string[];
}

// ===== RESPONSIVE SETTINGS =====
export interface ResponsiveSettings {
  enabled: boolean;
  breakpoints: ResponsiveBreakpoint[];
  fluidDesign: boolean;
  mobileFirst: boolean;
  deviceDetection: DeviceDetectionConfig;
}

export interface ResponsiveBreakpoint {
  name: string;
  deviceType: DeviceType;
  minWidth: number;
  maxWidth?: number;
  overrides: ResponsiveOverrides;
  isActive: boolean;
}

export interface ResponsiveOverrides {
  layout?: Partial<LayoutConfig>;
  typography?: Partial<TypographyConfig>;
  spacing?: Partial<SpacingConfig>;
  media?: MediaOverrides;
  visibility?: VisibilityOverrides;
  animations?: AnimationOverrides;
}

export interface MediaOverrides {
  hideMedia: boolean;
  alternativeMedia?: HeroMedia;
  scaling: 'cover' | 'contain' | 'fill' | 'none';
  position: string;
}

export interface VisibilityOverrides {
  hideElements: string[];
  showElements: string[];
  reorderElements: Record<string, number>;
}

export interface AnimationOverrides {
  disableAnimations: boolean;
  reduceMotion: boolean;
  alternativeAnimations: Record<string, Animation>;
}

export interface DeviceDetectionConfig {
  enabled: boolean;
  method: 'user_agent' | 'feature_detection' | 'both';
  fallback: DeviceType;
}

// ===== TARGETING & DISPLAY =====
export interface TargetingRules {
  enabled: boolean;
  rules: TargetingRule[];
  operator: 'and' | 'or';
  priority: number;
}

export interface TargetingRule {
  type: 'user' | 'device' | 'location' | 'time' | 'behavior' | 'referrer' | 'custom';
  condition: TargetingCondition;
  weight: number;
  isActive: boolean;
}

export interface TargetingCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | string[] | number[];
  caseSensitive?: boolean;
}

export interface DisplayRule {
  id: ID;
  name: string;
  type: 'show' | 'hide' | 'modify';
  conditions: DisplayCondition[];
  actions: DisplayAction[];
  priority: number;
  isActive: boolean;
}

export interface DisplayCondition {
  type: 'url' | 'page_type' | 'user_type' | 'time' | 'device' | 'custom';
  field: string;
  operator: string;
  value: unknown;
}

export interface DisplayAction {
  type: 'visibility' | 'content' | 'style' | 'redirect';
  target: string;
  value: unknown;
  duration?: number;
}

export interface ScheduleConfig {
  enabled: boolean;
  startDate?: Timestamp;
  endDate?: Timestamp;
  timezone: string;
  recurrence?: RecurrenceConfig;
  blackoutDates?: Timestamp[];
}

export interface RecurrenceConfig {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  endAfter?: number;
}

// ===== A/B TESTING =====
export interface HeroVariant {
  id: ID;
  name: string;
  description?: string;
  weight: number;
  isControl: boolean;
  isActive: boolean;
  
  // Variant Content
  content?: Partial<HeroContent>;
  media?: HeroMedia[];
  callToActions?: CallToAction[];
  style?: Partial<HeroStyle>;
  
  // Performance
  analytics: VariantAnalytics;
  conversionRate: number;
  confidence: number;
  
  // Timeline
  startDate?: Timestamp;
  endDate?: Timestamp;
  
  // Custom Fields
  metadata: Record<string, unknown>;
}

export interface ABTestConfig {
  testName: string;
  hypothesis: string;
  successMetric: string;
  minimumSampleSize: number;
  confidenceLevel: number;
  trafficAllocation: number;
  duration: number;
  autoOptimize: boolean;
  winnerThreshold: number;
}

export interface VariantAnalytics {
  impressions: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
  revenue: number;
  engagementTime: number;
}

// ===== OPTIMIZATION & PERFORMANCE =====
export interface OptimizationSettings {
  enabled: boolean;
  imageOptimization: ImageOptimizationConfig;
  videoOptimization: VideoOptimizationConfig;
  caching: CachingConfig;
  compression: CompressionConfig;
  cdn: CDNConfig;
}

export interface ImageOptimizationConfig {
  formats: string[];
  quality: Record<string, number>;
  responsive: boolean;
  lazyLoading: boolean;
  webp: boolean;
  avif: boolean;
}

export interface VideoOptimizationConfig {
  formats: string[];
  quality: Record<string, number>;
  compression: string;
  streaming: boolean;
  adaptiveBitrate: boolean;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  strategy: 'cache_first' | 'network_first' | 'stale_while_revalidate';
  versioning: boolean;
}

export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'brotli' | 'deflate';
  level: number;
  minSize: number;
}

export interface CDNConfig {
  enabled: boolean;
  provider: string;
  baseUrl: string;
  regions: string[];
  optimizations: string[];
}

export interface LazyLoadingConfig {
  enabled: boolean;
  threshold: number;
  placeholder: 'blur' | 'skeleton' | 'color' | 'image';
  fadeIn: boolean;
  rootMargin: string;
}

export interface PreloadingConfig {
  enabled: boolean;
  critical: boolean;
  aboveFold: boolean;
  priority: 'high' | 'medium' | 'low';
  resources: string[];
}

// ===== ANALYTICS & TRACKING =====
export interface HeroAnalytics {
  id: ID;
  heroId: ID;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  
  // Basic Metrics
  impressions: number;
  uniqueViews: number;
  clicks: number;
  conversions: number;
  revenue: number;
  
  // Engagement Metrics
  averageViewTime: number;
  scrollDepth: number;
  interactionRate: number;
  bounceRate: number;
  exitRate: number;
  
  // Performance Metrics
  loadTime: PerformanceMetric;
  renderTime: PerformanceMetric;
  cumulativeLayoutShift: number;
  largestContentfulPaint: number;
  
  // Device & Browser
  deviceBreakdown: DeviceMetric[];
  browserBreakdown: BrowserMetric[];
  
  // Geographic
  geographicBreakdown: GeographicMetric[];
  
  // Time-based
  hourlyBreakdown: TimeMetric[];
  dailyBreakdown: TimeMetric[];
  
  // A/B Testing
  variantPerformance: VariantPerformance[];
  
  // Custom Events
  customEvents: CustomEvent[];
  
  // Computed Fields
  computedAt: Timestamp;
  dataFreshness: number;
}

export interface PerformanceMetric {
  average: number;
  median: number;
  p95: number;
  minimum: number;
  maximum: number;
}

export interface DeviceMetric {
  deviceType: DeviceType;
  count: number;
  percentage: number;
  averageEngagement: number;
}

export interface BrowserMetric {
  browser: string;
  version: string;
  count: number;
  percentage: number;
  performance: PerformanceMetric;
}

export interface GeographicMetric {
  country: string;
  region?: string;
  city?: string;
  count: number;
  percentage: number;
  conversionRate: number;
}

export interface TimeMetric {
  timestamp: Timestamp;
  impressions: number;
  clicks: number;
  conversions: number;
  engagement: number;
}

export interface VariantPerformance {
  variantId: ID;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  significance: number;
}

export interface CustomEvent {
  name: string;
  count: number;
  value?: number;
  properties: Record<string, unknown>;
}

export interface ConversionTracking {
  enabled: boolean;
  goals: ConversionGoal[];
  attribution: AttributionConfig;
  funnels: ConversionFunnel[];
}

export interface ConversionGoal {
  id: ID;
  name: string;
  type: 'page_view' | 'click' | 'form_submit' | 'purchase' | 'custom';
  value: number;
  currency?: string;
  conditions: GoalCondition[];
}

export interface GoalCondition {
  type: 'url' | 'element' | 'event' | 'time' | 'scroll';
  operator: string;
  value: string | number;
}

export interface AttributionConfig {
  model: 'first_click' | 'last_click' | 'linear' | 'time_decay' | 'position_based';
  lookbackWindow: number;
  crossDevice: boolean;
}

export interface ConversionFunnel {
  id: ID;
  name: string;
  steps: FunnelStep[];
  conversionRate: number;
  dropoffPoints: DropoffPoint[];
}

export interface FunnelStep {
  name: string;
  url?: string;
  event?: string;
  order: number;
  visitors: number;
  conversionRate: number;
}

export interface DropoffPoint {
  step: number;
  dropoffRate: number;
  reasons: string[];
}

export interface HeatmapConfig {
  enabled: boolean;
  provider: string;
  samplingRate: number;
  trackClicks: boolean;
  trackMouseMovement: boolean;
  trackScrolling: boolean;
}

// ===== SEO & ACCESSIBILITY =====
export interface SEOSettings {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: ImageAsset;
  twitterCard?: TwitterCardConfig;
  structuredData?: StructuredData[];
}

export interface TwitterCardConfig {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: ImageAsset;
}

export interface StructuredData {
  type: string;
  data: Record<string, unknown>;
}

export interface AccessibilitySettings {
  enabled: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA';
  features: AccessibilityFeature[];
  testing: AccessibilityTesting;
}

export interface AccessibilityFeature {
  name: string;
  enabled: boolean;
  configuration: Record<string, unknown>;
}

export interface AccessibilityTesting {
  automated: boolean;
  manualChecks: string[];
  tools: string[];
  lastAudit?: Timestamp;
  score?: number;
}

// ===== LOCALIZATION =====
export interface LocalizationConfig {
  enabled: boolean;
  defaultLocale: string;
  supportedLocales: string[];
  fallbackStrategy: 'default' | 'closest' | 'hide';
  autoDetect: boolean;
}

export interface HeroTranslation {
  locale: string;
  content: Partial<HeroContent>;
  media?: HeroMedia[];
  callToActions?: CallToAction[];
  seo?: Partial<SEOSettings>;
  metadata: Record<string, unknown>;
}

// ===== REQUEST/RESPONSE INTERFACES =====
export interface CreateHeroRequest {
  name: string;
  title?: string;
  subtitle?: string;
  description?: string;
  type: HeroType;
  layout: LayoutType;
  status?: HeroStatus;
  priority?: Priority;
  content: Partial<HeroContent>;
  media?: Partial<HeroMedia>[];
  callToActions?: Partial<CallToAction>[];
  style?: Partial<HeroStyle>;
  schedule?: Partial<ScheduleConfig>;
  targeting?: Partial<TargetingRules>;
  tags?: string[];
  categories?: string[];
  customFields?: Record<string, unknown>;
}

export interface UpdateHeroRequest {
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  type?: HeroType;
  layout?: LayoutType;
  status?: HeroStatus;
  priority?: Priority;
  content?: Partial<HeroContent>;
  style?: Partial<HeroStyle>;
  schedule?: Partial<ScheduleConfig>;
  targeting?: Partial<TargetingRules>;
  tags?: string[];
  categories?: string[];
  customFields?: Record<string, unknown>;
}

export interface HeroQueryParams extends PaginationParams, SortParams, FilterParams {
  type?: HeroType[];
  status?: HeroStatus[];
  priority?: Priority[];
  layout?: LayoutType[];
  tags?: string[];
  categories?: string[];
  createdBy?: ID;
  assignedTo?: ID;
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  isScheduled?: boolean;
  hasVariants?: boolean;
}

export type HeroResponse = APIResponse<Hero>;
export type HeroListResponse = APIResponse<PaginatedResponse<Hero>>;

// ===== HOOKS & STATE MANAGEMENT =====
export interface UseHeroHook {
  hero: Hero | null;
  isLoading: boolean;
  error: APIError | null;
  
  // Actions
  fetchHero: (id: ID) => Promise<void>;
  createHero: (data: CreateHeroRequest) => Promise<void>;
  updateHero: (id: ID, data: UpdateHeroRequest) => Promise<void>;
  deleteHero: (id: ID) => Promise<void>;
  duplicateHero: (id: ID) => Promise<void>;
  
  // Status Management
  publishHero: (id: ID) => Promise<void>;
  scheduleHero: (id: ID, schedule: ScheduleConfig) => Promise<void>;
  pauseHero: (id: ID) => Promise<void>;
  archiveHero: (id: ID) => Promise<void>;
  
  // Variants
  createVariant: (heroId: ID, variant: Partial<HeroVariant>) => Promise<void>;
  updateVariant: (heroId: ID, variantId: ID, data: Partial<HeroVariant>) => Promise<void>;
  deleteVariant: (heroId: ID, variantId: ID) => Promise<void>;
  
  // Analytics
  fetchAnalytics: (id: ID, period: string) => Promise<void>;
  trackImpression: (id: ID) => void;
  trackClick: (id: ID, element: string) => void;
  trackConversion: (id: ID, goal: string, value?: number) => void;
  
  // Preview
  previewHero: (id: ID, variant?: ID) => Promise<string>;
  generatePreviewUrl: (id: ID, variant?: ID) => string;
}

export interface UseHeroListHook {
  heroes: Hero[];
  totalCount: number;
  isLoading: boolean;
  error: APIError | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Actions
  fetchHeroes: (params?: HeroQueryParams) => Promise<void>;
  refreshHeroes: () => Promise<void>;
  loadMore: () => Promise<void>;
  
  // Navigation
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  
  // Filtering & Sorting
  applyFilters: (filters: Partial<HeroQueryParams>) => Promise<void>;
  clearFilters: () => Promise<void>;
  updateSort: (sort: SortParams) => Promise<void>;
  
  // Bulk Operations
  bulkUpdate: (ids: ID[], data: UpdateHeroRequest) => Promise<void>;
  bulkDelete: (ids: ID[]) => Promise<void>;
  bulkStatusChange: (ids: ID[], status: HeroStatus) => Promise<void>;
  
  // Search
  search: (query: string) => Promise<void>;
  clearSearch: () => Promise<void>;
}

// ===== COMPONENT PROPS =====
export interface HeroComponentProps {
  heroId?: ID;
  hero?: Hero;
  variant?: ID;
  preview?: boolean;
  editable?: boolean;
  onEdit?: (hero: Hero) => void;
  onInteraction?: (type: string, data: Record<string, unknown>) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface HeroCarouselProps {
  heroes: Hero[];
  autoplay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  infinite?: boolean;
  pauseOnHover?: boolean;
  swipeToSlide?: boolean;
  className?: string;
  onSlideChange?: (index: number, hero: Hero) => void;
}

export interface HeroEditorProps {
  hero?: Hero;
  onSave: (hero: Hero) => Promise<void>;
  onCancel: () => void;
  onPreview: (hero: Hero) => void;
  templates?: HeroTemplate[];
  isLoading?: boolean;
  className?: string;
}

export interface HeroTemplate {
  id: ID;
  name: string;
  description?: string;
  thumbnail: ImageAsset;
  category: string;
  hero: Partial<Hero>;
  isPopular?: boolean;
  isPremium?: boolean;
}

// ===== TYPE USAGE TO AVOID WARNINGS =====
export interface HeroTypeUsage {
  fileUpload: FileUpload;
  user: User;
}
