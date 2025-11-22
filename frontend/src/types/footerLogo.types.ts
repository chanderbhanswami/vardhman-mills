import {
  ID,
  Timestamp,
  BaseEntity,
  Status,
  ImageAsset,
  Language,
  SEOData
} from './common.types';
import { User } from './user.types';

// Core Footer Logo Types
export interface FooterLogo extends Omit<BaseEntity, 'version'> {
  // Basic Information
  name: string;
  description?: string;
  type: LogoType;
  category: LogoCategory;
  
  // Visual Assets
  primaryLogo: ImageAsset;
  darkModeLogo?: ImageAsset;
  lightModeLogo?: ImageAsset;
  monochromeWhite?: ImageAsset;
  monochromeBlack?: ImageAsset;
  textOnlyVersion?: ImageAsset;
  iconOnly?: ImageAsset;
  
  // Responsive Variants
  responsiveVariants: ResponsiveLogoVariant[];
  
  // Brand Guidelines
  brandGuidelines: BrandGuidelines;
  colorScheme: ColorScheme;
  typography: TypographySettings;
  
  // Display Configuration
  displaySettings: FooterDisplaySettings;
  position: FooterPosition;
  alignment: FooterAlignment;
  size: FooterLogoSize;
  
  // Visibility Rules
  visibilityRules: VisibilityRule[];
  showOnPages: PageVisibility[];
  hideOnPages: PageVisibility[];
  
  // Behavioral Settings
  behavior: LogoBehavior;
  interactionSettings: InteractionSettings;
  animationSettings: AnimationSettings;
  
  // Linking
  linkSettings: LinkSettings;
  trackingSettings: TrackingSettings;
  
  // Compliance & Legal
  legalInfo: LegalInfo;
  copyrightInfo: CopyrightInfo;
  usageRights: UsageRights;
  
  // Metadata
  status: Status;
  language: Language;
  version: string;
  lastModifiedBy?: ID;
  approvedBy?: ID;
  approvedAt?: Timestamp;
  
  // Analytics
  analytics: FooterLogoAnalytics;
  
  // A/B Testing
  abTestVariants?: ABTestVariant[];
  activeVariant?: ID;
  
  // SEO
  seo: SEOData;
}

export interface FooterLogoTheme extends Omit<BaseEntity, 'version'> {
  // Basic Information
  name: string;
  description?: string;
  type: 'preset' | 'custom';
  
  // Theme Configuration
  themeConfig: ThemeConfiguration;
  colorPalette: ColorPalette;
  stylePresets: StylePreset[];
  
  // Logo Variants
  logoVariants: LogoThemeVariant[];
  
  // Responsive Behavior
  responsiveBehavior: ResponsiveBehavior;
  breakpoints: Breakpoint[];
  
  // Animation & Effects
  animations: ThemeAnimation[];
  hoverEffects: HoverEffect[];
  loadingStates: LoadingState[];
  
  // Compatibility
  browserSupport: BrowserSupport[];
  deviceSupport: DeviceSupport[];
  
  // Usage
  isDefault: boolean;
  isActive: boolean;
  usageCount: number;
  
  // Metadata
  createdBy: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: string;
}

export interface FooterLogoConfiguration extends BaseEntity {
  // Site Configuration
  siteId?: ID;
  siteName?: string;
  
  // Active Logo
  activeLogoId: ID;
  activeLogo?: FooterLogo;
  activeThemeId: ID;
  activeTheme?: FooterLogoTheme;
  
  // Global Settings
  globalSettings: GlobalLogoSettings;
  defaultSettings: DefaultLogoSettings;
  
  // Conditional Configurations
  conditionalConfigs: ConditionalConfiguration[];
  
  // Performance Settings
  performanceSettings: PerformanceSettings;
  loadingStrategy: LoadingStrategy;
  optimizationSettings: OptimizationSettings;
  
  // Accessibility
  accessibilitySettings: AccessibilitySettings;
  
  // Multi-language Support
  localizationSettings: LocalizationSettings;
  languageVariants: LanguageLogoVariant[];
  
  // Environment Settings
  environmentConfigs: EnvironmentConfiguration[];
  
  // Backup & Fallback
  fallbackLogos: FallbackLogo[];
  backupSettings: BackupSettings;
  
  // Monitoring & Alerts
  monitoringSettings: MonitoringSettings;
  alertConfigurations: AlertConfiguration[];
  
  // Status & Control
  isActive: boolean;
  lastActivated?: Timestamp;
  activatedBy?: ID;
  
  // Version Control
  configVersion: string;
  changeHistory: ConfigurationChange[];
}

// Logo Display & Layout Types
export interface ResponsiveLogoVariant {
  id: ID;
  name: string;
  breakpoint: string; // e.g., 'mobile', 'tablet', 'desktop'
  minWidth: number;
  maxWidth?: number;
  logo: ImageAsset;
  displaySettings: ResponsiveDisplaySettings;
  priority: number;
}

export interface BrandGuidelines {
  // Logo Usage
  minSize: {
    width: number;
    height: number;
  };
  maxSize: {
    width: number;
    height: number;
  };
  clearSpace: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // Color Guidelines
  primaryColors: string[];
  secondaryColors: string[];
  accentColors: string[];
  backgroundColors: string[];
  restrictedColors: string[];
  
  // Usage Rules
  usageRules: string[];
  prohibitedUses: string[];
  contextualGuidelines: ContextualGuideline[];
  
  // Brand Voice
  brandPersonality: string[];
  communicationGuidelines: string[];
  toneOfVoice: string;
}

export interface ColorScheme {
  // Primary Colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary Colors
  secondary?: string;
  secondaryLight?: string;
  secondaryDark?: string;
  
  // Accent Colors
  accent?: string;
  accentLight?: string;
  accentDark?: string;
  
  // Background Colors
  backgroundLight: string;
  backgroundDark: string;
  
  // Text Colors
  textOnLight: string;
  textOnDark: string;
  
  // Theme Adaptation
  lightModeColors: Record<string, string>;
  darkModeColors: Record<string, string>;
  
  // Accessibility
  contrastRatios: ContrastRatio[];
  wcagCompliance: 'AA' | 'AAA';
}

export interface TypographySettings {
  // Font Families
  primaryFont: string;
  secondaryFont?: string;
  fallbackFonts: string[];
  
  // Font Loading
  fontDisplay: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preloadFonts: boolean;
  
  // Text Styling
  fontWeights: Record<string, number>;
  fontSizes: Record<string, string>;
  lineHeights: Record<string, number>;
  letterSpacing: Record<string, string>;
  
  // Responsive Typography
  responsiveScaling: ResponsiveTypography[];
  
  // Accessibility
  readabilitySettings: ReadabilitySettings;
}

export interface FooterDisplaySettings {
  // Layout
  layout: FooterLayout;
  columns: number;
  maxWidth: string;
  padding: SpacingSettings;
  margin: SpacingSettings;
  
  // Background
  background: BackgroundSettings;
  border: BorderSettings;
  shadow: ShadowSettings;
  
  // Spacing
  itemSpacing: SpacingSettings;
  sectionSpacing: SpacingSettings;
  
  // Responsive
  responsiveSettings: Record<string, FooterDisplaySettings>;
  hideOnMobile: boolean;
  stackOnMobile: boolean;
  
  // Visual Effects
  animations: AnimationSettings;
  transitions: TransitionSettings;
  
  // Accessibility
  ariaLabel?: string;
  role?: string;
  landmarks: boolean;
}

export interface LogoBehavior {
  // Click Behavior
  clickAction: ClickAction;
  openInNewTab: boolean;
  trackClicks: boolean;
  
  // Hover Effects
  hoverEnabled: boolean;
  hoverAnimation: HoverAnimation;
  hoverScale: number;
  hoverOpacity: number;
  
  // Loading Behavior
  lazyLoading: boolean;
  preload: boolean;
  loadingPlaceholder?: ImageAsset;
  errorFallback?: ImageAsset;
  
  // Scroll Behavior
  scrollEffects: ScrollEffect[];
  parallaxEnabled: boolean;
  stickyBehavior: StickyBehavior;
  
  // Interactive States
  activeState: StateSettings;
  focusState: StateSettings;
  disabledState: StateSettings;
}

export interface InteractionSettings {
  // Mouse Events
  onHover: InteractionEvent[];
  onClick: InteractionEvent[];
  onDoubleClick: InteractionEvent[];
  
  // Touch Events
  onTouch: InteractionEvent[];
  onSwipe: InteractionEvent[];
  onLongPress: InteractionEvent[];
  
  // Keyboard Events
  onKeyPress: InteractionEvent[];
  onFocus: InteractionEvent[];
  onBlur: InteractionEvent[];
  
  // Custom Events
  customEvents: CustomEvent[];
  
  // Event Tracking
  trackInteractions: boolean;
  analyticsEvents: AnalyticsEvent[];
}

export interface AnimationSettings {
  // Entrance Animations
  entranceAnimation: Animation;
  entranceDelay: number;
  entranceDuration: number;
  
  // Exit Animations
  exitAnimation?: Animation;
  exitDuration: number;
  
  // Hover Animations
  hoverAnimation?: Animation;
  hoverDuration: number;
  
  // Loading Animations
  loadingAnimation?: Animation;
  loadingDuration: number;
  
  // Scroll Animations
  scrollAnimations: ScrollAnimation[];
  
  // Performance
  useGPUAcceleration: boolean;
  respectMotionPreferences: boolean;
  
  // Timing Functions
  easingFunction: EasingFunction;
  customEasing?: string;
}

export interface LinkSettings {
  // URL Configuration
  url?: string;
  externalUrl?: string;
  internalRoute?: string;
  
  // Link Behavior
  target: LinkTarget;
  rel: string[];
  
  // Parameters
  queryParams: Record<string, string>;
  hashFragment?: string;
  
  // Conditional Linking
  conditionalLinks: ConditionalLink[];
  
  // Security
  noFollow: boolean;
  noOpener: boolean;
  noReferrer: boolean;
  
  // SEO
  title?: string;
  aria?: Record<string, string>;
  
  // Tracking
  trackingParams: TrackingParam[];
  utmParameters: UTMParameters;
}

export interface TrackingSettings {
  // Analytics
  googleAnalyticsEnabled: boolean;
  customAnalytics: CustomAnalytics[];
  
  // Events
  eventTracking: EventTracking[];
  goalTracking: GoalTracking[];
  
  // Performance
  performanceTracking: PerformanceTracking;
  errorTracking: ErrorTracking;
  
  // User Behavior
  heatmapTracking: boolean;
  userJourneyTracking: boolean;
  
  // Privacy
  respectDoNotTrack: boolean;
  cookieConsent: boolean;
  dataRetention: DataRetentionSettings;
}

// Legal & Compliance Types
export interface LegalInfo {
  // Ownership
  owner: string;
  ownerType: 'individual' | 'company' | 'organization';
  registeredTrademark: boolean;
  
  // Usage Rights
  usageRights: UsageRight[];
  licensingInfo: LicensingInfo;
  restrictions: UsageRestriction[];
  
  // Compliance
  complianceRequirements: ComplianceRequirement[];
  legalNotices: LegalNotice[];
  disclaimers: string[];
  
  // Attribution
  attributionRequired: boolean;
  attributionText?: string;
  creditLine?: string;
}

export interface CopyrightInfo {
  // Copyright Details
  copyrightYear: number;
  copyrightHolder: string;
  copyrightNotice: string;
  
  // Registration
  registrationNumber?: string;
  registrationCountry?: string;
  registrationDate?: Timestamp;
  
  // Terms
  terms: CopyrightTerm[];
  duration: string;
  transferability: boolean;
  
  // International
  internationalProtection: boolean;
  protectedCountries: string[];
  
  // Enforcement
  enforcementPolicy: string;
  contactInfo: ContactInfo;
}

export interface UsageRights {
  // Permitted Uses
  permittedUses: PermittedUse[];
  commercialUse: boolean;
  modificationsAllowed: boolean;
  redistributionAllowed: boolean;
  
  // Restrictions
  restrictions: UsageRestriction[];
  geographicRestrictions: string[];
  timeRestrictions: TimeRestriction[];
  
  // Attribution
  attributionRequired: boolean;
  attributionFormat: string;
  
  // Licensing
  licenseType: LicenseType;
  licenseUrl?: string;
  licenseText: string;
  
  // Sublicensing
  sublicensingAllowed: boolean;
  sublicensingTerms?: string;
}

// Analytics & Performance Types
export interface FooterLogoAnalytics {
  // Basic Metrics
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  
  // User Engagement
  hoverCount: number;
  averageHoverTime: number;
  uniqueInteractions: number;
  
  // Performance Metrics
  loadTime: number;
  errorRate: number;
  successRate: number;
  
  // User Behavior
  scrollDepth: number;
  timeInView: number;
  bounceRate: number;
  
  // Conversion Tracking
  conversions: number;
  conversionRate: number;
  goalCompletions: GoalCompletion[];
  
  // Technical Metrics
  renderTime: number;
  bandwidthUsage: number;
  cacheHitRate: number;
  
  // Comparative Analysis
  benchmarkComparison: BenchmarkComparison;
  historicalTrends: HistoricalTrend[];
  
  // Segmentation
  deviceAnalytics: DeviceAnalytics[];
  locationAnalytics: LocationAnalytics[];
  timeAnalytics: TimeAnalytics[];
  
  // Last Updated
  lastUpdated: Timestamp;
  dataFreshness: number;
}

export interface ABTestVariant extends BaseEntity {
  // Test Configuration
  testId: ID;
  variantName: string;
  description?: string;
  
  // Logo Configuration
  logoConfig: Partial<FooterLogo>;
  displayConfig: Partial<FooterDisplaySettings>;
  
  // Traffic Allocation
  trafficPercentage: number;
  targetAudience?: AudienceSegment[];
  
  // Test Parameters
  testStartDate: Timestamp;
  testEndDate?: Timestamp;
  minimumSampleSize: number;
  confidenceLevel: number;
  
  // Metrics
  primaryMetric: string;
  secondaryMetrics: string[];
  goalMetrics: GoalMetric[];
  
  // Results
  isWinning?: boolean;
  statisticalSignificance?: number;
  performance: VariantPerformance;
  
  // Status
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  
  // Metadata
  createdBy: ID;
  createdAt: Timestamp;
  lastModified: Timestamp;
}

// Configuration & Setup Types
export interface ThemeConfiguration {
  
  // Color System
  colorTokens: ColorToken[];
  colorMode: 'light' | 'dark' | 'auto';
  
  // Typography System
  typographyScale: TypographyScale;
  fontLoadingStrategy: FontLoadingStrategy;
  
  // Spacing System
  spacingScale: SpacingScale;
  gridSystem: GridSystem;
  
  // Component Styling
  componentOverrides: ComponentOverride[];
  
  // Animation System
  animationTokens: AnimationToken[];
  motionPreferences: MotionPreferences;
  
  // Responsive Design
  breakpointSystem: BreakpointSystem;
  fluidTypography: boolean;
  
  // Accessibility
  accessibilityEnhancements: AccessibilityEnhancement[];
  highContrastMode: boolean;
  
  // Performance
  criticalCSS: string;
  lazyLoadingCSS: boolean;
}

export interface GlobalLogoSettings {
  // Default Behavior
  defaultClickAction: ClickAction;
  defaultHoverEffect: HoverAnimation;
  defaultLoadingStrategy: LoadingStrategy;
  
  // Performance Defaults
  defaultLazyLoading: boolean;
  defaultPreloading: boolean;
  defaultOptimization: OptimizationLevel;
  
  // Accessibility Defaults
  defaultAltText: string;
  defaultAriaLabel: string;
  defaultFocusStyle: FocusStyle;
  
  // Analytics Defaults
  defaultTracking: boolean;
  defaultAnalyticsProvider: string;
  defaultEventTracking: EventCategory[];
  
  // SEO Defaults
  defaultSEOSettings: SEOSettings;
  defaultStructuredData: StructuredDataSettings;
  
  // Legal Defaults
  defaultCopyrightNotice: string;
  defaultUsageTerms: string;
  defaultAttributionFormat: string;
}

export interface ConditionalConfiguration {
  id: ID;
  name: string;
  description?: string;
  
  // Conditions
  conditions: Condition[];
  operator: 'AND' | 'OR';
  
  // Logo Override
  logoOverride?: Partial<FooterLogo>;
  themeOverride?: Partial<FooterLogoTheme>;
  displayOverride?: Partial<FooterDisplaySettings>;
  
  // Priority
  priority: number;
  isActive: boolean;
  
  // Metadata
  createdAt: Timestamp;
  lastMatch?: Timestamp;
  matchCount: number;
}

export interface PerformanceSettings {
  // Image Optimization
  imageOptimization: ImageOptimizationSettings;
  webpSupport: boolean;
  avifSupport: boolean;
  
  // Lazy Loading
  lazyLoadingEnabled: boolean;
  lazyLoadingThreshold: number;
  preloadCritical: boolean;
  
  // Caching
  cacheStrategy: CacheStrategy;
  cacheDuration: number;
  cdnEnabled: boolean;
  
  // Compression
  compressionEnabled: boolean;
  compressionLevel: number;
  gzipEnabled: boolean;
  
  // Resource Hints
  preconnectDomains: string[];
  prefetchResources: string[];
  preloadResources: PreloadResource[];
  
  // Critical Path
  criticalPath: boolean;
  inlineSmallImages: boolean;
  eliminateRenderBlocking: boolean;
  
  // Monitoring
  performanceMonitoring: boolean;
  performanceBudget: PerformanceBudget;
  alertThresholds: AlertThreshold[];
}

export interface AccessibilitySettings {
  // Screen Reader Support
  ariaSupport: boolean;
  altTextRequired: boolean;
  descriptiveAltText: boolean;
  
  // Keyboard Navigation
  keyboardNavigable: boolean;
  focusIndicators: boolean;
  tabIndexManagement: boolean;
  
  // Visual Accessibility
  highContrastSupport: boolean;
  colorBlindnessSupport: boolean;
  minimumContrastRatio: number;
  
  // Motor Accessibility
  largeClickTargets: boolean;
  reduceMotion: boolean;
  persistentUI: boolean;
  
  // Cognitive Accessibility
  clearFocusOrder: boolean;
  consistentNavigation: boolean;
  errorPrevention: boolean;
  
  // International
  rightToLeftSupport: boolean;
  languageDetection: boolean;
  
  // Compliance
  wcagLevel: 'A' | 'AA' | 'AAA';
  section508Compliance: boolean;
  additionalStandards: string[];
  
  // Testing
  automatedTesting: boolean;
  manualTesting: boolean;
  userTesting: boolean;
}

// Advanced Configuration Types
export interface LocalizationSettings {
  // Language Support
  supportedLanguages: Language[];
  defaultLanguage: Language;
  fallbackLanguage: Language;
  
  // Content Localization
  localizeAltText: boolean;
  localizeAriaLabels: boolean;
  localizeSEOData: boolean;
  
  // Regional Adaptation
  regionalVariants: RegionalVariant[];
  culturalAdaptations: CulturalAdaptation[];
  
  // Right-to-Left Support
  rtlSupport: boolean;
  rtlLayoutAdjustments: RTLAdjustment[];
  
  // Date & Time
  dateTimeLocalization: boolean;
  timezoneSupport: boolean;
  
  // Number & Currency
  numberLocalization: boolean;
  currencyLocalization: boolean;
  
  // Text Direction
  textDirectionDetection: boolean;
  mixedDirectionSupport: boolean;
  
  // Translation Management
  translationWorkflow: TranslationWorkflow;
  translationMemory: boolean;
  machineTranslation: boolean;
}

export interface EnvironmentConfiguration {
  environment: 'development' | 'staging' | 'production';
  
  // Logo Configuration
  logoConfig: Partial<FooterLogo>;
  themeConfig: Partial<FooterLogoTheme>;
  
  // Feature Flags
  featureFlags: FeatureFlag[];
  
  // Performance Settings
  performanceMode: 'development' | 'production';
  debugMode: boolean;
  
  // Analytics
  analyticsEnabled: boolean;
  trackingLevel: 'minimal' | 'standard' | 'detailed';
  
  // Security
  securityLevel: 'basic' | 'standard' | 'strict';
  contentSecurityPolicy: CSPSettings;
  
  // API Configuration
  apiEndpoints: APIEndpoint[];
  apiRateLimit: number;
  
  // CDN Configuration
  cdnEnabled: boolean;
  cdnProvider: string;
  cdnEndpoints: string[];
}

export interface MonitoringSettings {
  // Health Monitoring
  healthChecks: HealthCheck[];
  uptimeMonitoring: boolean;
  responseTimeMonitoring: boolean;
  
  // Error Monitoring
  errorTracking: boolean;
  errorThreshold: number;
  errorNotifications: boolean;
  
  // Performance Monitoring
  performanceMonitoring: boolean;
  performanceThresholds: PerformanceThreshold[];
  
  // User Experience Monitoring
  realUserMonitoring: boolean;
  syntheticMonitoring: boolean;
  userSatisfactionMetrics: boolean;
  
  // Business Metrics
  businessMetricsTracking: boolean;
  conversionTracking: boolean;
  revenueTracking: boolean;
  
  // Alerting
  alertingEnabled: boolean;
  alertChannels: AlertChannel[];
  escalationPolicies: EscalationPolicy[];
  
  // Reporting
  reportingEnabled: boolean;
  reportFrequency: ReportFrequency;
  reportRecipients: string[];
}

// Missing Type Definitions
export interface DefaultLogoSettings {
  defaultSize: FooterLogoSize;
  defaultPosition: FooterPosition;
  defaultAlignment: FooterAlignment;
  defaultClickAction: ClickAction;
  defaultHoverAnimation: HoverAnimation;
  defaultVisibility: boolean;
}

export interface OptimizationSettings {
  imageCompression: boolean;
  compressionQuality: number;
  webpConversion: boolean;
  avifConversion: boolean;
  lazyLoading: boolean;
  preloading: boolean;
  caching: boolean;
  cdnEnabled: boolean;
}

export interface LanguageLogoVariant {
  language: Language;
  logo: ImageAsset;
  altText: string;
  displaySettings?: Partial<FooterDisplaySettings>;
}

export interface FallbackLogo {
  condition: string;
  logo: ImageAsset;
  priority: number;
  description?: string;
}

export interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number;
  destination: string;
  encryption: boolean;
}

export interface AlertConfiguration {
  id: ID;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  recipients: string[];
  enabled: boolean;
}

export interface ConfigurationChange {
  id: ID;
  timestamp: Timestamp;
  userId: ID;
  action: string;
  changes: Record<string, string | number | boolean>;
  reason?: string;
}

export interface UsageRight {
  type: string;
  description: string;
  allowed: boolean;
  conditions?: string[];
}

export interface LicensingInfo {
  licenseType: LicenseType;
  licenseUrl?: string;
  licenseText: string;
  expirationDate?: Timestamp;
  renewalRequired: boolean;
}

export interface UsageRestriction {
  type: string;
  description: string;
  severity: 'warning' | 'error';
  enforcement: 'advisory' | 'blocking';
}

export interface ComplianceRequirement {
  standard: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'pending';
  lastChecked: Timestamp;
}

export interface LegalNotice {
  type: string;
  content: string;
  displayRequired: boolean;
  jurisdiction: string;
}

export interface CopyrightTerm {
  type: string;
  description: string;
  duration: string;
  enforceable: boolean;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
}

export interface PermittedUse {
  category: string;
  description: string;
  conditions?: string[];
  attribution: boolean;
}

export interface TimeRestriction {
  startDate: Timestamp;
  endDate: Timestamp;
  description: string;
  recurring: boolean;
}

export interface GoalCompletion {
  goalId: string;
  completedAt: Timestamp;
  value: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface BenchmarkComparison {
  industry: string;
  metric: string;
  ourValue: number;
  industryAverage: number;
  percentile: number;
}

export interface HistoricalTrend {
  period: string;
  metric: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface DeviceAnalytics {
  device: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  performance: number;
}

export interface LocationAnalytics {
  location: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  performance: number;
}

export interface TimeAnalytics {
  period: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  performance: number;
}

export interface AudienceSegment {
  name: string;
  description: string;
  criteria: Record<string, string | number | boolean>;
  size: number;
}

export interface GoalMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
  priority: 'low' | 'medium' | 'high';
}

export interface VariantPerformance {
  impressions: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
  statisticalSignificance: number;
}

export interface FontLoadingStrategy {
  method: 'swap' | 'block' | 'fallback' | 'optional';
  preload: boolean;
  critical: boolean;
  timeout: number;
}

export interface ColorToken {
  name: string;
  value: string;
  description?: string;
  category: string;
}

export interface TypographyScale {
  baseSize: string;
  ratio: number;
  sizes: Record<string, string>;
}

export interface SpacingScale {
  base: string;
  multiplier: number;
  values: Record<string, string>;
}

export interface GridSystem {
  columns: number;
  gutter: string;
  maxWidth: string;
  breakpoints: Record<string, string>;
}

export interface ComponentOverride {
  component: string;
  styles: Record<string, string>;
  variants?: Record<string, Record<string, string>>;
}

export interface AnimationToken {
  name: string;
  duration: string;
  easing: string;
  keyframes?: Record<string, Record<string, string>>;
}

export interface MotionPreferences {
  respectReducedMotion: boolean;
  fallbackDuration: string;
  fallbackEasing: string;
}

export interface BreakpointSystem {
  mobile: string;
  tablet: string;
  desktop: string;
  wide: string;
}

export interface AccessibilityEnhancement {
  feature: string;
  enabled: boolean;
  configuration?: Record<string, string | number | boolean>;
}

export interface SEOSettings {
  titleTemplate: string;
  defaultDescription: string;
  keywords: string[];
  canonicalUrl?: string;
}

export interface StructuredDataSettings {
  enabled: boolean;
  type: string;
  properties: Record<string, string | number | boolean>;
}

export interface EventCategory {
  name: string;
  description: string;
  defaultAction: string;
}

export interface FocusStyle {
  outline: string;
  outlineOffset: string;
  backgroundColor?: string;
  boxShadow?: string;
}

export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

export interface CacheStrategy {
  type: 'memory' | 'disk' | 'network' | 'hybrid';
  duration: number;
  maxSize: number;
  compression: boolean;
}

export interface ImageOptimizationSettings {
  quality: number;
  format: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  progressive: boolean;
  lossless: boolean;
}

export interface PreloadResource {
  url: string;
  as: string;
  crossorigin?: string;
  media?: string;
}

export interface PerformanceBudget {
  maxFileSize: number;
  maxTotalSize: number;
  maxRequests: number;
  maxLoadTime: number;
}

export interface AlertThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
}

export interface RegionalVariant {
  region: string;
  logo: ImageAsset;
  cultural: string[];
  legal: string[];
}

export interface CulturalAdaptation {
  culture: string;
  adaptations: Record<string, string>;
  considerations: string[];
}

export interface RTLAdjustment {
  property: string;
  value: string;
  condition?: string;
}

export interface TranslationWorkflow {
  enabled: boolean;
  provider: string;
  quality: 'machine' | 'human' | 'hybrid';
  review: boolean;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rollout: number;
  conditions?: Record<string, string | number | boolean>;
}

export interface CSPSettings {
  enabled: boolean;
  directives: Record<string, string>;
  reportUri?: string;
}

export interface APIEndpoint {
  path: string;
  method: string;
  authentication: boolean;
  rateLimit: number;
}

export interface HealthCheck {
  endpoint: string;
  method: string;
  timeout: number;
  interval: number;
}

export interface PerformanceThreshold {
  metric: string;
  target: number;
  warning: number;
  critical: number;
}

export interface AlertChannel {
  type: 'email' | 'sms' | 'slack' | 'webhook';
  endpoint: string;
  enabled: boolean;
}

export interface EscalationPolicy {
  level: number;
  delay: number;
  channels: string[];
  recipients: string[];
}

export interface ReportFrequency {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  day?: string;
  time?: string;
}

// Enums and Constants
export type LogoType = 
  | 'primary_brand'
  | 'secondary_brand'
  | 'product_logo'
  | 'service_logo'
  | 'partner_logo'
  | 'certification_logo'
  | 'award_logo'
  | 'social_logo'
  | 'payment_logo';

export type LogoCategory = 
  | 'brand'
  | 'product'
  | 'service'
  | 'partnership'
  | 'certification'
  | 'award'
  | 'social_media'
  | 'payment_method'
  | 'technology'
  | 'compliance';

export type FooterPosition = 
  | 'left'
  | 'center'
  | 'right'
  | 'top_left'
  | 'top_center'
  | 'top_right'
  | 'bottom_left'
  | 'bottom_center'
  | 'bottom_right';

export type FooterAlignment = 'left' | 'center' | 'right' | 'justify';

export type FooterLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

export type FooterLayout = 
  | 'single_column'
  | 'multi_column'
  | 'grid'
  | 'flex'
  | 'custom';

export type ClickAction = 
  | 'none'
  | 'home'
  | 'about'
  | 'contact'
  | 'external_link'
  | 'modal'
  | 'scroll_to_top'
  | 'custom';

export type HoverAnimation = 
  | 'none'
  | 'scale'
  | 'rotate'
  | 'fade'
  | 'glow'
  | 'lift'
  | 'bounce'
  | 'pulse'
  | 'custom';

export type Animation = 
  | 'none'
  | 'fade_in'
  | 'slide_in'
  | 'scale_in'
  | 'rotate_in'
  | 'bounce_in'
  | 'zoom_in'
  | 'custom';

export type LoadingStrategy = 
  | 'eager'
  | 'lazy'
  | 'progressive'
  | 'intersection_observer'
  | 'viewport_based';

export type OptimizationLevel = 'none' | 'basic' | 'standard' | 'aggressive';

export type LinkTarget = '_self' | '_blank' | '_parent' | '_top';

export type EasingFunction = 
  | 'ease'
  | 'ease_in'
  | 'ease_out'
  | 'ease_in_out'
  | 'linear'
  | 'cubic_bezier'
  | 'custom';

export type LicenseType = 
  | 'proprietary'
  | 'creative_commons'
  | 'mit'
  | 'gpl'
  | 'apache'
  | 'bsd'
  | 'custom';

// Complex Data Types
export interface PageVisibility {
  pageType: string;
  pagePath: string;
  conditions?: Record<string, string | number | boolean>;
  priority: number;
}

export interface VisibilityRule {
  id: ID;
  name: string;
  condition: string;
  action: 'show' | 'hide';
  priority: number;
  isActive: boolean;
}

export interface SpacingSettings {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export interface BackgroundSettings {
  color?: string;
  gradient?: string;
  image?: ImageAsset;
  pattern?: string;
  opacity: number;
}

export interface BorderSettings {
  width: string;
  style: string;
  color: string;
  radius: string;
}

export interface ShadowSettings {
  enabled: boolean;
  offsetX: string;
  offsetY: string;
  blurRadius: string;
  color: string;
}

export interface StateSettings {
  opacity: number;
  scale: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  animation?: Animation;
}

export interface InteractionEvent {
  type: string;
  action: string;
  parameters?: Record<string, string | number | boolean>;
  tracking?: boolean;
}

export interface CustomEvent {
  name: string;
  trigger: string;
  action: string;
  parameters?: Record<string, string | number | boolean>;
}

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export interface ScrollEffect {
  type: 'parallax' | 'fade' | 'scale' | 'rotate' | 'translate';
  intensity: number;
  direction: 'up' | 'down' | 'left' | 'right';
  triggerPoint: string;
}

export interface StickyBehavior {
  enabled: boolean;
  offset: string;
  zIndex: number;
  breakpoint?: string;
}

export interface ScrollAnimation {
  trigger: string;
  animation: Animation;
  duration: number;
  easing: EasingFunction;
  offset: string;
}

export interface TransitionSettings {
  property: string;
  duration: number;
  easing: EasingFunction;
  delay: number;
}

export interface ConditionalLink {
  condition: string;
  url: string;
  target: LinkTarget;
  priority: number;
}

export interface TrackingParam {
  name: string;
  value: string;
  scope: 'all' | 'external' | 'internal';
}

export interface UTMParameters {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface CustomAnalytics {
  provider: string;
  trackingId: string;
  events: string[];
  customDimensions?: Record<string, string>;
}

export interface EventTracking {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export interface GoalTracking {
  goalId: string;
  name: string;
  type: 'destination' | 'duration' | 'event' | 'pages_per_session';
  value?: number;
}

export interface PerformanceTracking {
  enabled: boolean;
  metrics: string[];
  sampling: number;
  thresholds: Record<string, number>;
}

export interface ErrorTracking {
  enabled: boolean;
  captureJSErrors: boolean;
  captureNetworkErrors: boolean;
  captureConsoleErrors: boolean;
  sampling: number;
}

export interface DataRetentionSettings {
  duration: number;
  anonymizeAfter: number;
  deleteAfter: number;
  exportBeforeDelete: boolean;
}

export interface ResponsiveDisplaySettings {
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  aspectRatio?: string;
  objectFit: 'contain' | 'cover' | 'fill' | 'scale-down' | 'none';
}

export interface ContextualGuideline {
  context: string;
  guideline: string;
  examples: string[];
  restrictions?: string[];
}

export interface ContrastRatio {
  foreground: string;
  background: string;
  ratio: number;
  passes: boolean;
}

export interface ResponsiveTypography {
  breakpoint: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
}

export interface ReadabilitySettings {
  minFontSize: string;
  maxLineLength: string;
  optimalLineHeight: number;
  paragraphSpacing: string;
}

// Form Types
export interface FooterLogoCreateRequest {
  name: string;
  description?: string;
  type: LogoType;
  category: LogoCategory;
  primaryLogo: string; // Image URL or base64
  darkModeLogo?: string;
  lightModeLogo?: string;
  displaySettings: Partial<FooterDisplaySettings>;
  linkSettings: Partial<LinkSettings>;
  status: Status;
}

export interface FooterLogoUpdateRequest extends Partial<FooterLogoCreateRequest> {
  id: ID;
}

export interface FooterLogoThemeCreateRequest {
  name: string;
  description?: string;
  type: 'preset' | 'custom';
  themeConfig: Partial<ThemeConfiguration>;
  colorPalette: Partial<ColorPalette>;
}

export interface FooterLogoConfigurationRequest {
  activeLogoId: ID;
  activeThemeId: ID;
  globalSettings: Partial<GlobalLogoSettings>;
  performanceSettings: Partial<PerformanceSettings>;
  accessibilitySettings: Partial<AccessibilitySettings>;
}

// Additional Supporting Types
export interface ColorPalette {
  primary: string[];
  secondary: string[];
  neutral: string[];
  accent: string[];
  semantic: Record<string, string>;
}

export interface StylePreset {
  name: string;
  styles: Record<string, string>;
  category: string;
}

export interface LogoThemeVariant {
  name: string;
  logo: ImageAsset;
  conditions: string[];
  priority: number;
}

export interface ResponsiveBehavior {
  scalingMode: 'fixed' | 'fluid' | 'adaptive';
  minSize: number;
  maxSize: number;
  aspectRatioLock: boolean;
}

export interface Breakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  styles: Record<string, string>;
}

export interface ThemeAnimation {
  name: string;
  keyframes: Record<string, Record<string, string>>;
  duration: number;
  easing: string;
}

export interface HoverEffect {
  name: string;
  properties: Record<string, string>;
  duration: number;
  easing: string;
}

export interface LoadingState {
  name: string;
  placeholder?: ImageAsset;
  animation?: Animation;
  skeleton?: boolean;
}

export interface BrowserSupport {
  browser: string;
  version: string;
  supported: boolean;
  fallback?: string;
}

export interface DeviceSupport {
  device: string;
  supported: boolean;
  optimizations?: string[];
}

// Component Props
export interface FooterLogoProps {
  logo?: FooterLogo;
  theme?: FooterLogoTheme;
  configuration?: FooterLogoConfiguration;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// API Response Types
export interface FooterLogoResponse {
  logo: FooterLogo;
  theme: FooterLogoTheme;
  configuration: FooterLogoConfiguration;
  analytics?: FooterLogoAnalytics;
}

export interface FooterLogoListResponse {
  logos: FooterLogo[];
  themes: FooterLogoTheme[];
  total: number;
  page: number;
  limit: number;
}

// Hook Return Types
export interface UseFooterLogoReturn {
  logo?: FooterLogo;
  theme?: FooterLogoTheme;
  configuration?: FooterLogoConfiguration;
  loading: boolean;
  error?: string;
  updateLogo: (updates: Partial<FooterLogo>) => Promise<void>;
  updateTheme: (updates: Partial<FooterLogoTheme>) => Promise<void>;
  updateConfiguration: (updates: Partial<FooterLogoConfiguration>) => Promise<void>;
  analytics: FooterLogoAnalytics | null;
  trackInteraction: (type: string) => Promise<void>;
}

// ===== TYPE USAGE TO AVOID WARNINGS =====
export interface FooterLogoTypeUsage {
  user: User;
}
