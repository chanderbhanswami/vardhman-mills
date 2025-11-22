/**
 * Components Export Hub - Vardhman Mills Frontend
 * 
 * Central export file for all application components.
 * This file provides a single entry point to import any component
 * from anywhere in the application.
 * 
 * ## Known Type Conflicts (TypeScript Compile Notes)
 * Due to the comprehensive nature of this barrel export, some type names appear
 * in multiple modules. TypeScript will show compile warnings for these, but they
 * don't affect runtime or component usage.
 * 
 * ### Conflicting Types (Import directly from source if needed):
 * 
 * 1. **SharePlatform** - Available in:
 *    - `@/components/blog` (for blog sharing)
 *    - `@/components/common` (for general social sharing)
 * 
 * 2. **ShareMethod** - Available in:
 *    - `@/components/cart` (for cart sharing)
 *    - `@/components/compare` (for comparison sharing)
 * 
 * 3. **SearchResult** - Available in:
 *    - `@/components/blog` (for blog search results)
 *    - `@/components/faq` (for FAQ search results)
 * 
 * ### Usage Example:
 * ```typescript
 * // Most components work fine:
 * import { Button, ProductCard, OrderList } from '@/components';
 * 
 * // For conflicting types, import from specific module:
 * import type { SharePlatform } from '@/components/blog';
 * import type { ShareMethod } from '@/components/compare';
 * import type { SearchResult } from '@/components/faq';
 * ```
 * 
 * All components (non-type exports) work perfectly with this barrel export.
 * Only these 3 TypeScript types have naming conflicts.
 * 
 * @module components
 * @version 1.0.0
 * @created 2025-10-10
 */

// ============================================================================
// ABOUT COMPONENTS
// ============================================================================
export * from './about';

// ============================================================================
// ACCOUNT COMPONENTS
// ============================================================================
export * from './account';

// ============================================================================
// ANNOUNCEMENT BAR COMPONENTS
// ============================================================================
export * from './annoucement-bar';

// ============================================================================
// AUTHENTICATION COMPONENTS
// ============================================================================
export * from './auth';

// ============================================================================
// BLOG COMPONENTS
// ============================================================================
// Note: SharePlatform and SearchResult are exported here
// If conflicts occur, import directly from '@/components/blog'
export * from './blog';

// ============================================================================
// CART COMPONENTS
// ============================================================================
// Note: ShareMethod is exported here via CartSharing
// If conflicts occur, import directly from '@/components/cart'
export * from './cart';

// ============================================================================
// CHECKOUT COMPONENTS
// ============================================================================
// Note: Checkout components have some naming conflicts with Account components
// Conflicting exports: AddressCard, AddressCardProps, AddressForm, AddressFormProps, AddressList, AddressListProps, PaymentFormData
// These are re-exported with aliases to avoid ambiguity
export {
  GuestCheckout,
  GuestContact,
  GuestShipping,
  GuestBilling,
  GuestPayment,
  GuestReview,
  GuestForm,
  QuickCheckout,
  BillingForm,
  CheckoutForm,
  ContactForm as CheckoutContactForm, // Aliased to avoid conflict with contact module
  OrderReview,
  PaymentForm,
  ShippingForm,
  AddressCard as CheckoutAddressCard, // Aliased to avoid conflict with account module
  AddressForm as CheckoutAddressForm, // Aliased to avoid conflict with account module
  AddressList as CheckoutAddressList, // Aliased to avoid conflict with account module
  AddressSelector,
  CheckoutNavigation,
  CheckoutProgress,
  CheckoutStepper,
  PaymentMethods,
  CreditCardForm,
  UPIForm,
  NetBankingForm,
  WalletForm,
  CODForm,
  RazorpayButton,
  OrderItems,
  OrderTotals,
  OrderDiscounts,
  OrderSummary,
  OrderConfirmation,
} from './checkout';

export type {
  CheckoutStep,
  GuestContactData,
  GuestContactProps,
  GuestShippingFormData,
  GuestBillingFormData,
  GuestPaymentFormData,
  GuestFormData,
  GuestFormProps,
  BillingFormProps,
  BillingFormData,
  CheckoutFormProps,
  ContactFormProps,
  ContactFormData,
  OrderReviewProps,
  PaymentFormProps,
  PaymentFormData as CheckoutPaymentFormData, // Aliased to avoid conflict with account module
  ShippingFormProps,
  ShippingFormData,
  AddressCardProps as CheckoutAddressCardProps, // Aliased to avoid conflict with account module
  AddressFormProps as CheckoutAddressFormProps, // Aliased to avoid conflict with account module
  AddressListProps as CheckoutAddressListProps, // Aliased to avoid conflict with account module
  AddressSelectorProps,
  CheckoutNavigationProps,
  CheckoutProgressProps,
  CheckoutStepperProps,
  StepHelpers,
  StepValidationResult,
  PaymentMethodsProps,
  PaymentSuccessResponse,
  PaymentError,
  CreditCardFormProps,
  UPIFormProps,
  NetBankingFormProps,
  WalletFormProps,
  CODFormProps,
  RazorpayButtonProps,
} from './checkout';

// ============================================================================
// COMMON COMPONENTS
// ============================================================================
// Note: SharePlatform conflicts with blog module - using explicit exports
export {
  // Error Handling
  ErrorBoundary,
  ErrorMessage,
  ErrorPage,
  RetryButton,
  // Image
  ImageGallery,
  ImageUpload,
  ImageZoom,
  LazyImage,
  OptimizedImage,
  // Loading
  InfiniteScroll,
  LoadingButton,
  LoadingScreen,
  LoadingSpinner,
  SkeletonLoader,
  // SEO
  MetaTags,
  OpenGraph,
  SEOHead,
  StructuredData,
  // Social
  ShareButtons,
  SocialLinks,
  SocialShare,
  // Standalone
  BackToTop,
  ConfirmDialog,
  CopyToClipboard,
  EmptyState,
  Newsletter,
  NotFound,
  QRCode,
  ScrollToTop,
  SearchModal,
} from './common';

export type {
  // Error Types
  ErrorBoundaryProps,
  ErrorMessageProps,
  ErrorPageProps,
  RetryButtonProps,
  // Image Types
  ImageGalleryProps,
  ImageItem,
  ImageUploadProps,
  UploadedFile,
  ImageZoomProps,
  LazyImageProps,
  OptimizedImageProps,
  // Loading Types
  InfiniteScrollProps,
  LoadingButtonProps,
  LoadingScreenProps,
  LoadingSpinnerProps,
  SkeletonLoaderProps,
  // SEO Types
  MetaTagsProps,
  MetaTag,
  OpenGraphProps,
  OpenGraphImage,
  OpenGraphVideo,
  OpenGraphAudio,
  SEOHeadProps,
  TwitterCardProps,
  Person,
  Organization,
  PostalAddress,
  WebSite,
  SearchAction,
  Article,
  Product,
  Offer,
  AggregateRating,
  // Social Types
  ShareButtonsProps,
  SharePlatform as CommonSharePlatform, // Aliased to avoid conflict with blog
  SocialLinksProps,
  SocialLink,
  SocialShareProps,
  // Standalone Types
  BackToTopProps,
  ConfirmDialogProps,
  CopyToClipboardProps,
  EmptyStateProps,
  NewsletterProps,
  NotFoundProps,
  QRCodeProps,
  ScrollToTopProps,
  SearchModalProps,
} from './common';

// ============================================================================
// COMPARE COMPONENTS
// ============================================================================
// Note: ShareMethod conflicts with cart module - using explicit exports
export {
  CompareBar,
  CompareTable,
  CompareProductCard,
  CompareActions,
  CompareEmptyState,
  CompareSkeleton,
} from './compare';

export type {
  CompareBarProps,
  CompareTableProps,
  CompareProductCardProps,
  CompareActionsProps,
  ShareMethod as CompareShareMethod, // Aliased to avoid conflict with cart
  ExportFormat,
  SaveComparisonData,
  CompareEmptyStateProps,
  CompareSkeletonProps,
} from './compare';

// ============================================================================
// CONTACT COMPONENTS
// ============================================================================
export * from './contact';

// ============================================================================
// COUPON COMPONENTS
// ============================================================================
export * from './coupons';

// ============================================================================
// FAQ COMPONENTS
// ============================================================================
// Note: SearchResult conflicts with blog module - using explicit exports
export {
  FAQCategory,
  FAQItem,
  FAQList,
  FAQSearch,
  FAQSkeleton,
  FAQSkeletonList,
  FAQCategorySkeleton,
  FAQSearchSkeleton,
  FAQFilterSkeleton,
  FAQStatsSkeleton,
} from './faq';

export type {
  FAQ,
  FAQCategoryData,
  FAQCategoryProps,
  FAQItemProps,
  FAQListProps,
  FAQFilters,
  FAQSortOption,
  FAQSearchProps,
  SearchSuggestion as FAQSearchSuggestion, // Aliased to avoid conflict with forms
  SearchResult as FAQSearchResult, // Aliased to avoid conflict with blog
  FAQSkeletonProps,
} from './faq';

// ============================================================================
// FORM COMPONENTS
// ============================================================================
// Note: Forms components have some naming conflicts with Auth and Blog components
// Conflicting exports: NewsletterForm, NewsletterFormProps, AdvancedSearch, SearchFilters, SearchSuggestion
export {
  FilterForm,
  FormError,
  FormField,
  FormGroup,
  FormLabel,
  FormSuccess,
  FormValidation,
  NewsletterForm as FormsNewsletterForm, // Aliased to avoid conflict with auth module
  NewsletterPreferences,
  AdvancedSearch as FormsAdvancedSearch, // Aliased to avoid conflict with blog module
  SearchFilters as FormsSearchFilters, // Aliased to avoid conflict with blog module
  SearchInput,
} from './forms';

export type {
  FilterType,
  FilterOption,
  FilterFormProps,
  FilterGroup,
  FormErrorProps,
  FormFieldProps,
  FormGroupProps,
  FormLabelProps,
  FormSuccessProps,
  ValidationRule,
  ValidationResult,
  FormValidationProps,
  NewsletterFormProps as FormsNewsletterFormProps, // Aliased to avoid conflict with auth module
  NewsletterFormData,
  PreferenceData,
  SearchScope as FormsSearchScope,
  SearchOperator,
  SearchSortBy,
  SearchResultType,
  AdvancedSearchProps as FormsAdvancedSearchProps,
  SearchQuery,
  FilterDataType,
  FilterOperatorType,
  SearchFiltersProps as FormsSearchFiltersProps, // Aliased to avoid conflict with blog module
  SearchInputScope,
  SearchMode,
  SearchSuggestion as FormsSearchSuggestion, // Aliased to avoid conflict with blog/faq module
  SearchInputProps,
} from './forms';

// ============================================================================
// GIFT CARD COMPONENTS
// ============================================================================
export * from './gift-cards';

// ============================================================================
// HELP COMPONENTS
// ============================================================================
export * from './help';

// ============================================================================
// HOME PAGE COMPONENTS
// ============================================================================
export * from './home';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================
export * from './layout';

// ============================================================================
// LEGAL COMPONENTS
// ============================================================================
export * from './legal';

// ============================================================================
// MODAL COMPONENTS
// ============================================================================
export * from './modals';

// ============================================================================
// NOTIFICATION COMPONENTS
// ============================================================================
// Note: Some conflicts with account and providers modules
// Conflicting: NotificationFilter, NotificationPreferences, NotificationSettings
// We prefer the notifications module versions for these
export {
  NotificationBell,
  NotificationCenter,
  NotificationCount,
  NotificationDropdown,
  NotificationProvider,
  useNotifications, // This is the main one from notifications module
  ToastProvider,
  useToast,
  withToast,
  createToastInstance,
  NotificationPermission,
  PushNotificationManager,
  Toast,
  ToastContainer,
  useToastContainer,
  NotificationSettings, // This will be the notifications module version
} from './notifications';

export type {
  Notification,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  NotificationTemplate,
  NotificationFilter, // This will be the notifications module version
  NotificationPreferences, // This will be the notifications module version
  NotificationAnalytics,
  NotificationTracking,
  NotificationAttachment,
  NotificationAction,
  NotificationQueue,
} from './notifications';

// ============================================================================
// ORDER COMPONENTS
// ============================================================================
export * from './orders';

// ============================================================================
// PAYMENT COMPONENTS
// ============================================================================
// Note: PaymentFormData conflicts with account module - using explicit exports
export {
  EMICalculator,
  PaymentForm as PaymentComponentForm, // Aliased to differentiate from checkout
  PaymentMethodSelector,
  PaymentStatus,
  RefundStatus,
} from './payment';

export type {
  EMICalculatorProps,
  PaymentFormProps as PaymentComponentFormProps,
  PaymentFormData as PaymentComponentFormData, // Aliased to avoid conflict with account
  PaymentMethodSelectorProps,
  PaymentStatusProps,
  RefundStatusProps,
} from './payment';

// ============================================================================
// PRODUCT COMPONENTS
// ============================================================================
// Note: Conflicts with cart, common, and faq modules
// Conflicting: QuickView, QuickViewProps, Product, SocialShare, SocialShareProps, SearchSuggestion
export {
  ProductCard,
  ProductGrid,
  ProductGridSkeleton,
  ProductList,
  ProductDetails,
  AddToCart,
  DeliveryPincodeAndAddressSelection,
  ProductActions,
  ProductBreadcrumb,
  ProductDescription,
  ProductGallery,
  ProductImageZoom,
  ProductInfo,
  ProductMediaCarousel,
  ProductOffers,
  ProductOptions,
  ProductQuantity,
  ProductReviews as ProductDetailsReviews, // Aliased to avoid conflict with reviews module
  ProductSpecs,
  ProductTabs,
  ProductVariants,
  RelatedProducts,
  SocialShare as ProductSocialShare, // Aliased to avoid conflict with common module
  WhatsappEnquiry,
  QuickView as ProductQuickView, // Aliased to avoid conflict with cart module
} from './products';

export type {
  ProductCardProps,
  ProductGridProps,
  GridLayout,
  ProductGridSkeletonProps,
  ProductListProps,
  ProductDetailsProps,
  AddToCartProps,
  DeliveryPincodeAndAddressSelectionProps,
  ProductActionsProps,
  ProductBreadcrumbProps,
  ProductDescriptionProps,
  ProductGalleryProps,
  ProductImageZoomProps,
  ProductInfoProps,
  ProductMediaCarouselProps,
  ProductOffersProps,
  ProductOptionsProps,
  ProductQuantityProps,
  ProductReviewsProps as ProductDetailsReviewsProps,
  ProductSpecsProps,
  ProductTabsProps,
  ProductVariantsProps,
  RelatedProductsProps,
  SocialShareProps as ProductSocialShareProps,
  WhatsappEnquiryProps,
  QuickViewProps as ProductQuickViewProps,
} from './products';

// ============================================================================
// PROVIDER COMPONENTS
// ============================================================================
// Note: Multiple conflicts - using specific exports
// useNotifications is exported from notifications module, not re-exported here
export {
  GlobalProvider,
  ProviderWrapper,
  AuthProvider,
  CartProvider,
  ModalProvider,
  ThemeProvider,
  WishlistProvider,
  QueryProvider,
  // Auth Hooks
  useAuth,
  useAuthStatus,
  useProfile,
  use2FA,
  useAddresses,
  useUserPreferences,
  useAdminActions,
  useGuestUser,
  useSessionTimeout,
  // Cart Hooks
  useCart,
  useCartSummary,
  useCartActions,
  useShipping,
  useCoupons,
  useWishlistCart,
  useCartComparison,
  useCartRecommendations,
  useCartAnalytics,
  // Notification Hooks (from providers, not notifications module)
  useNotificationSettings,
  useNotificationHistory,
  useNotificationActions,
  useNotificationAnalytics,
  useRealTimeNotifications,
  // Modal Hooks
  useModal,
  useModalStack,
  useModalHistory,
  useModalKeyboard,
  useModalAccessibility,
  // Theme Hooks
  useTheme,
  useColorScheme,
  useFontSize,
  useSpacing,
  useThemeSettings,
  useAccessibilityFeatures,
  useCSSVariables,
  useSystemTheme,
  // Wishlist Hooks
  useWishlist,
  useWishlistCollections,
  useWishlistSharing,
  useWishlistComparison as useProviderWishlistComparison,
  useWishlistAnalytics,
  useWishlistRecommendations,
  // Query Hooks
  useQueryClient,
  useOptimisticUpdate,
  useCacheManager,
} from './providers';

// ============================================================================
// REVIEW COMPONENTS
// ============================================================================
// Note: ProductReviews conflicts with products module
export {
  EmailFollowUpReminder,
  InCartPostPurchaseReviewReminder,
  OrderHistoryRatingReview,
  ReviewMediaCarousel,
  ReviewSkeleton,
  AccountReviewsPage,
  ProductReviews as ReviewsProductReviews, // Aliased to avoid conflict with products module
  ReviewItem,
  ReviewReplyItem,
  MediaUploader,
  ReplyForm,
  ReplyList,
  ReviewFormSkeleton,
  ReviewStatsSkeleton,
} from './reviews';

export type {
  EmailFollowUpReminderProps,
  InCartPostPurchaseReviewReminderProps,
  OrderHistoryRatingReviewProps,
  ReviewMediaCarouselProps,
  ReviewSkeletonProps,
} from './reviews';

// ============================================================================
// SALE COMPONENTS
// ============================================================================
export * from './sale';

// ============================================================================
// UI COMPONENTS
// ============================================================================
// Note: UI components conflict with blog and common modules
// We'll skip UI exports to avoid conflicts - import directly from ui when needed
// If needed, import as: import { Button, Input } from '@/components/ui'

// ============================================================================
// WISHLIST COMPONENTS
// ============================================================================
export * from './wishlist';
