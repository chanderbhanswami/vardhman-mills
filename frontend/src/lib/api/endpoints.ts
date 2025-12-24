/**
 * API Endpoints Configuration
 * Centralized endpoint definitions for all API routes
 */

const API_VERSION = 'v1';
const BASE_PATH = '';

export const endpoints = {
  // Authentication Endpoints
  auth: {
    register: `${BASE_PATH}/auth/register`,
    login: `${BASE_PATH}/auth/login`,
    adminLogin: `${BASE_PATH}/auth/admin/login`,
    logout: `${BASE_PATH}/auth/logout`,
    refresh: `${BASE_PATH}/auth/refresh`,
    me: `${BASE_PATH}/auth/me`,
    activity: `${BASE_PATH}/auth/activity`,
    socialLogin: (provider: string) => `${BASE_PATH}/auth/${provider}`,
    forgotPassword: `${BASE_PATH}/auth/forgot-password`,
    resetPassword: `${BASE_PATH}/auth/reset-password`,
    validateResetToken: (token: string) => `${BASE_PATH}/auth/validate-reset-token/${token}`,
    verifyEmail: `${BASE_PATH}/auth/verify-email`,
    resendVerification: `${BASE_PATH}/auth/resend-verification`,
    convertGuest: `${BASE_PATH}/auth/convert-guest`,
    guest: `${BASE_PATH}/auth/guest`,
    passwordStrength: `${BASE_PATH}/auth/password-strength`,
    checkEmail: `${BASE_PATH}/auth/check-email`,
    recoveryOptions: `${BASE_PATH}/auth/recovery-options`,
    lockoutStatus: `${BASE_PATH}/auth/lockout-status`,
    twoFactor: {
      verify: `${BASE_PATH}/auth/2fa/verify`,
      backup: `${BASE_PATH}/auth/2fa/backup`,
    },
    devices: `${BASE_PATH}/auth/devices`,
    removeDevice: (id: string) => `${BASE_PATH}/auth/devices/${id}`,
    clearDevices: `${BASE_PATH}/auth/devices/clear`,
    sessions: `${BASE_PATH}/auth/sessions`,
    terminateSession: (id: string) => `${BASE_PATH}/auth/sessions/${id}`,
    terminateAllSessions: `${BASE_PATH}/auth/sessions/terminate-all`,
    // Add missing endpoints for auth-handler
    updatePassword: `${BASE_PATH}/auth/update-password`,
    googleAuth: `${BASE_PATH}/auth/google`,
    facebookAuth: `${BASE_PATH}/auth/facebook`,
    admin: {
      statistics: `${BASE_PATH}/admin/auth/statistics`,
      unlockAccount: (userId: string) => `${BASE_PATH}/admin/auth/users/${userId}/unlock`,
      forceLogout: (userId: string) => `${BASE_PATH}/admin/auth/users/${userId}/force-logout`,
      resetPassword: (userId: string) => `${BASE_PATH}/admin/auth/users/${userId}/reset-password`,
      disableTwoFactor: (userId: string) => `${BASE_PATH}/admin/auth/users/${userId}/disable-2fa`,
    }
  },

  // User Management Endpoints
  users: {
    me: `${BASE_PATH}/users/me`,
    profile: `${BASE_PATH}/users/me`,
    updateProfile: `${BASE_PATH}/users/me`,
    avatar: `${BASE_PATH}/users/me/avatar`,
    updateAvatar: `${BASE_PATH}/users/me/avatar`,
    changePassword: `${BASE_PATH}/users/me/password`,
    changeEmail: `${BASE_PATH}/users/me/email`,
    verifyEmail: `${BASE_PATH}/users/verify-email`,
    addresses: {
      list: `${BASE_PATH}/users/addresses`,
      create: `${BASE_PATH}/users/addresses`,
      update: (id: string) => `${BASE_PATH}/users/addresses/${id}`,
      delete: (id: string) => `${BASE_PATH}/users/addresses/${id}`,
      setDefault: (id: string) => `${BASE_PATH}/users/addresses/${id}/default`,
    },
    preferences: `${BASE_PATH}/users/preferences`,
    activity: `${BASE_PATH}/users/activity`,
    sessions: `${BASE_PATH}/users/sessions`,
    revokeSession: (id: string) => `${BASE_PATH}/users/sessions/${id}`,
    revokeAllSessions: `${BASE_PATH}/users/sessions/revoke-all`,
    twoFactor: {
      enable: `${BASE_PATH}/users/2fa/enable`,
      verify: `${BASE_PATH}/users/2fa/verify`,
      disable: `${BASE_PATH}/users/2fa/disable`,
      regenerateCodes: `${BASE_PATH}/users/2fa/regenerate-codes`,
    },
    exportData: `${BASE_PATH}/users/export-data`,
    exportStatus: (id: string) => `${BASE_PATH}/users/export-data/${id}`,
    deleteAccount: `${BASE_PATH}/users/delete-account`,
    cancelDeletion: `${BASE_PATH}/users/cancel-deletion`,
    notifications: `${BASE_PATH}/users/notifications`,
    deactivate: `${BASE_PATH}/users/me/deactivate`,
    admin: {
      list: `${BASE_PATH}/admin/users`,
      byId: (id: string) => `${BASE_PATH}/admin/users/${id}`,
      update: (id: string) => `${BASE_PATH}/admin/users/${id}`,
      updateStatus: (id: string) => `${BASE_PATH}/admin/users/${id}/status`,
      resetPassword: (id: string) => `${BASE_PATH}/admin/users/${id}/reset-password`,
      updateRole: (id: string) => `${BASE_PATH}/admin/users/${id}/role`,
      statistics: `${BASE_PATH}/admin/users/statistics`,
      bulkUpdate: `${BASE_PATH}/admin/users/bulk-update`,
      export: `${BASE_PATH}/admin/users/export`,
      sendNotification: (id: string) => `${BASE_PATH}/admin/users/${id}/notification`,
      impersonate: (id: string) => `${BASE_PATH}/admin/users/${id}/impersonate`,
      stopImpersonation: `${BASE_PATH}/admin/users/stop-impersonation`,
    }
  },

  // Product Endpoints
  products: {
    list: `${BASE_PATH}/products`,
    featured: `${BASE_PATH}/products/featured`,
    bestsellers: `${BASE_PATH}/products/bestsellers`,
    newArrivals: `${BASE_PATH}/products/new-arrivals`,
    onSale: `${BASE_PATH}/products/on-sale`,
    byId: (id: string) => `${BASE_PATH}/products/id/${id}`,
    bySlug: (slug: string) => `${BASE_PATH}/products/${slug}`,
    byCategory: (id: string) => `${BASE_PATH}/categories/${id}/products`,
    byBrand: (id: string) => `${BASE_PATH}/brands/${id}/products`,
    related: (id: string) => `${BASE_PATH}/products/${id}/related`,
    similar: (id: string) => `${BASE_PATH}/products/${id}/similar`,
    reviews: (id: string) => `${BASE_PATH}/products/${id}/reviews`,
    addReview: (id: string) => `${BASE_PATH}/products/${id}/reviews`,
    variants: (id: string) => `${BASE_PATH}/products/${id}/variants`,
    images: (id: string) => `${BASE_PATH}/products/${id}/images`,
    stock: (id: string) => `${BASE_PATH}/products/${id}/stock`,
    inventory: (id: string) => `${BASE_PATH}/products/${id}/inventory`,
    analytics: (id: string) => `${BASE_PATH}/products/${id}/analytics`,
    search: `${BASE_PATH}/products/search`,
    filters: `${BASE_PATH}/products/filters`,
    compare: `${BASE_PATH}/products/compare`,
    create: `${BASE_PATH}/products`,
    update: (id: string) => `${BASE_PATH}/products/${id}`,
    delete: (id: string) => `${BASE_PATH}/products/${id}`,
    uploadImages: (id: string) => `${BASE_PATH}/products/${id}/images`,
    deleteImage: (id: string) => `${BASE_PATH}/products/${id}/images`,
    updateStock: (id: string) => `${BASE_PATH}/products/${id}/stock`,
    updatePrice: (id: string) => `${BASE_PATH}/products/${id}/price`,
    toggleStatus: (id: string) => `${BASE_PATH}/products/${id}/status`,
    bulkUpdate: `${BASE_PATH}/products/bulk-update`,
    bulkDelete: `${BASE_PATH}/products/bulk-delete`,
    export: `${BASE_PATH}/products/export`,
    import: `${BASE_PATH}/products/import`,
  },

  // Category Endpoints
  categories: {
    list: `${BASE_PATH}/categories`,
    tree: `${BASE_PATH}/categories/tree`,
    byId: (id: string) => `${BASE_PATH}/categories/id/${id}`,
    bySlug: (slug: string) => `${BASE_PATH}/categories/${slug}`,
    products: (id: string) => `${BASE_PATH}/categories/${id}/products`,
    featured: `${BASE_PATH}/categories/featured`,
    filters: (id: string) => `${BASE_PATH}/categories/${id}/filters`,
    create: `${BASE_PATH}/categories`,
    update: (id: string) => `${BASE_PATH}/categories/${id}`,
    delete: (id: string) => `${BASE_PATH}/categories/${id}`,
    reorder: `${BASE_PATH}/categories/reorder`,
    uploadImage: (id: string) => `${BASE_PATH}/categories/${id}/image`,
    deleteImage: (id: string) => `${BASE_PATH}/categories/${id}/image`,
    analytics: (id: string) => `${BASE_PATH}/categories/${id}/analytics`,
    performanceComparison: `${BASE_PATH}/categories/analytics/performance-comparison`,
    generateSitemap: `${BASE_PATH}/categories/sitemap`,
    breadcrumbs: (id: string) => `${BASE_PATH}/categories/${id}/breadcrumbs`,
    updateSEO: (id: string) => `${BASE_PATH}/categories/${id}/seo`,
    admin: {
      statistics: `${BASE_PATH}/admin/categories/statistics`,
      bulkUpdate: `${BASE_PATH}/admin/categories/bulk-update`,
      bulkDelete: `${BASE_PATH}/admin/categories/bulk-delete`,
      export: `${BASE_PATH}/admin/categories/export`,
      import: `${BASE_PATH}/admin/categories/import`,
      rebuildTree: `${BASE_PATH}/admin/categories/rebuild-tree`,
      validate: `${BASE_PATH}/admin/categories/validate`,
    },
  },

  // Brand Endpoints
  brands: {
    list: `${BASE_PATH}/brands`,
    byId: (id: string) => `${BASE_PATH}/brands/id/${id}`,
    bySlug: (slug: string) => `${BASE_PATH}/brands/${slug}`,
    products: (id: string) => `${BASE_PATH}/brands/${id}/products`,
    featured: `${BASE_PATH}/brands/featured`,
    categories: (id: string) => `${BASE_PATH}/brands/${id}/categories`,
    statistics: (id: string) => `${BASE_PATH}/brands/${id}/statistics`,
    create: `${BASE_PATH}/brands`,
    update: (id: string) => `${BASE_PATH}/brands/${id}`,
    delete: (id: string) => `${BASE_PATH}/brands/${id}`,
    uploadLogo: (id: string) => `${BASE_PATH}/brands/${id}/logo`,
    uploadBanner: (id: string) => `${BASE_PATH}/brands/${id}/banner`,
    deleteLogo: (id: string) => `${BASE_PATH}/brands/${id}/logo`,
    deleteBanner: (id: string) => `${BASE_PATH}/brands/${id}/banner`,
    performanceComparison: `${BASE_PATH}/brands/analytics/performance-comparison`,
    marketShare: `${BASE_PATH}/brands/analytics/market-share`,
    updateSEO: (id: string) => `${BASE_PATH}/brands/${id}/seo`,
    generateSitemap: `${BASE_PATH}/brands/sitemap`,
    search: `${BASE_PATH}/brands/search`,
    suggestions: `${BASE_PATH}/brands/suggestions`,
    similar: (id: string) => `${BASE_PATH}/brands/${id}/similar`,
    admin: {
      statistics: `${BASE_PATH}/admin/brands/statistics`,
      bulkUpdate: `${BASE_PATH}/admin/brands/bulk-update`,
      bulkDelete: `${BASE_PATH}/admin/brands/bulk-delete`,
      export: `${BASE_PATH}/admin/brands/export`,
      import: `${BASE_PATH}/admin/brands/import`,
      validate: `${BASE_PATH}/admin/brands/validate`,
    },
  },

  // Collection Endpoints
  collections: {
    list: `${BASE_PATH}/collections`,
    featured: `${BASE_PATH}/collections/featured`,
    byId: (id: string) => `${BASE_PATH}/collections/id/${id}`,
    bySlug: (slug: string) => `${BASE_PATH}/collections/${slug}`,
    products: (id: string) => `${BASE_PATH}/collections/${id}/products`,
    create: `${BASE_PATH}/collections`,
    update: (id: string) => `${BASE_PATH}/collections/${id}`,
    delete: (id: string) => `${BASE_PATH}/collections/${id}`,
    duplicate: (id: string) => `${BASE_PATH}/collections/${id}/duplicate`,
    addProduct: (id: string) => `${BASE_PATH}/collections/${id}/products`,
    addMultipleProducts: (id: string) => `${BASE_PATH}/collections/${id}/products/bulk`,
    removeProduct: (collectionId: string, productId: string) => `${BASE_PATH}/collections/${collectionId}/products/${productId}`,
    updatePosition: (collectionId: string, productId: string) => `${BASE_PATH}/collections/${collectionId}/products/${productId}/position`,
    reorder: (id: string) => `${BASE_PATH}/collections/${id}/products/reorder`,
    previewAutomated: `${BASE_PATH}/collections/preview-automated`,
    refresh: (id: string) => `${BASE_PATH}/collections/${id}/refresh`,
    templates: `${BASE_PATH}/collections/templates`,
    fromTemplate: (templateId: string) => `${BASE_PATH}/collections/templates/${templateId}/create`,
    analytics: (id: string) => `${BASE_PATH}/collections/${id}/analytics`,
    performance: `${BASE_PATH}/collections/performance`,
    bulkUpdate: `${BASE_PATH}/collections/bulk-update`,
    bulkDelete: `${BASE_PATH}/collections/bulk-delete`,
    search: `${BASE_PATH}/collections/search`,
    related: (id: string) => `${BASE_PATH}/collections/${id}/related`,
    personalized: `${BASE_PATH}/collections/personalized`,
    updatePersonalization: (id: string) => `${BASE_PATH}/collections/${id}/personalization`,
  },

  // Cart Endpoints
  cart: {
    // Basic Cart Operations
    get: `${BASE_PATH}/cart`,
    create: `${BASE_PATH}/cart`,
    clear: `${BASE_PATH}/cart/clear`,
    validate: `${BASE_PATH}/cart/validate`,
    syncGuest: `${BASE_PATH}/cart/sync-guest`,
    merge: `${BASE_PATH}/cart/merge`,

    // Item Operations
    addItem: `${BASE_PATH}/cart/items`,
    updateItem: (itemId: string) => `${BASE_PATH}/cart/items/${itemId}`,
    removeItem: (itemId: string) => `${BASE_PATH}/cart/items/${itemId}`,
    moveToWishlist: (itemId: string) => `${BASE_PATH}/cart/items/${itemId}/move-to-wishlist`,
    moveFromWishlist: (wishlistItemId: string) => `${BASE_PATH}/cart/items/move-from-wishlist/${wishlistItemId}`,

    // Bulk Operations
    addMultiple: `${BASE_PATH}/cart/items/bulk-add`,
    updateMultiple: `${BASE_PATH}/cart/items/bulk-update`,
    removeMultiple: `${BASE_PATH}/cart/items/bulk-remove`,

    // Quantity Operations
    increaseQuantity: (itemId: string) => `${BASE_PATH}/cart/items/${itemId}/increase`,
    decreaseQuantity: (itemId: string) => `${BASE_PATH}/cart/items/${itemId}/decrease`,
    setQuantity: (itemId: string) => `${BASE_PATH}/cart/items/${itemId}/quantity`,

    // Coupon Operations
    applyCoupon: `${BASE_PATH}/cart/coupons/apply`,
    removeCoupon: (couponId: string) => `${BASE_PATH}/cart/coupons/${couponId}`,
    validateCoupon: `${BASE_PATH}/cart/coupons/validate`,

    // Saved Carts
    saved: {
      list: `${BASE_PATH}/cart/saved`,
      save: `${BASE_PATH}/cart/saved`,
      byId: (id: string) => `${BASE_PATH}/cart/saved/${id}`,
      restore: (id: string) => `${BASE_PATH}/cart/saved/${id}/restore`,
      delete: (id: string) => `${BASE_PATH}/cart/saved/${id}`,
      update: (id: string) => `${BASE_PATH}/cart/saved/${id}`,
    },

    // Recommendations
    recommendations: `${BASE_PATH}/cart/recommendations`,
    frequentlyBoughtTogether: (productId: string) => `${BASE_PATH}/cart/frequently-bought-together/${productId}`,
    upsell: `${BASE_PATH}/cart/upsell`,
    crossSell: `${BASE_PATH}/cart/cross-sell`,

    // Shipping and Tax
    calculateShipping: `${BASE_PATH}/cart/calculate-shipping`,
    calculateTax: `${BASE_PATH}/cart/calculate-tax`,
    estimateTotal: `${BASE_PATH}/cart/estimate-total`,

    // Cart Recovery
    abandoned: `${BASE_PATH}/cart/abandoned`,
    sendRecovery: (cartId: string) => `${BASE_PATH}/cart/${cartId}/send-recovery`,
    recover: (token: string) => `${BASE_PATH}/cart/recover/${token}`,

    // Analytics
    analytics: `${BASE_PATH}/cart/analytics`,
    conversionFunnel: `${BASE_PATH}/cart/conversion-funnel`,

    // Cart Sharing
    share: `${BASE_PATH}/cart/share`,
    getShared: (shareId: string) => `${BASE_PATH}/cart/shared/${shareId}`,
    copyShared: (shareId: string) => `${BASE_PATH}/cart/shared/${shareId}/copy`,

    // Quick Operations
    quickAdd: `${BASE_PATH}/cart/quick-add`,
    export: `${BASE_PATH}/cart/export`,
    compare: `${BASE_PATH}/cart/compare`,

    // Templates
    templates: `${BASE_PATH}/cart/templates`,
    applyTemplate: (templateId: string) => `${BASE_PATH}/cart/templates/${templateId}/apply`,

    // Additional Operations
    count: `${BASE_PATH}/cart/count`,
    estimate: `${BASE_PATH}/cart/estimate`,
    byId: (cartId: string) => `${BASE_PATH}/cart/${cartId}`,
    updateShipping: `${BASE_PATH}/cart/shipping`,
    updateBilling: `${BASE_PATH}/cart/billing`,
    shippingMethods: `${BASE_PATH}/cart/shipping-methods`,
    sync: `${BASE_PATH}/cart/sync`,
    summary: `${BASE_PATH}/cart/summary`,
    saveForLater: (itemId: string) => `${BASE_PATH}/cart/items/${itemId}/save-for-later`,
    moveToCart: (itemId: string) => `${BASE_PATH}/cart/items/${itemId}/move-to-cart`,
    savedItems: `${BASE_PATH}/cart/saved-items`,
    checkAvailability: `${BASE_PATH}/cart/check-availability`,
  },

  // Wishlist Endpoints
  wishlist: {
    get: `${BASE_PATH}/wishlist`,
    add: `${BASE_PATH}/wishlist/items`,
    remove: (itemId: string) => `${BASE_PATH}/wishlist/items/${itemId}`,
    clear: `${BASE_PATH}/wishlist/clear`,
    count: `${BASE_PATH}/wishlist/count`,
    share: `${BASE_PATH}/wishlist/share`,
  },

  // Order Endpoints
  orders: {
    // Basic CRUD Operations
    list: `${BASE_PATH}/orders`,
    create: `${BASE_PATH}/orders`,
    byId: (id: string) => `${BASE_PATH}/orders/${id}`,
    update: (id: string) => `${BASE_PATH}/orders/${id}`,
    delete: (id: string) => `${BASE_PATH}/orders/${id}`,
    duplicate: (id: string) => `${BASE_PATH}/orders/${id}/duplicate`,

    // Order Lookup & Search
    byNumber: (orderNumber: string) => `${BASE_PATH}/orders/number/${orderNumber}`,
    search: `${BASE_PATH}/orders/search`,
    byCustomer: (customerId: string) => `${BASE_PATH}/orders/customer/${customerId}`,
    byProduct: (productId: string) => `${BASE_PATH}/orders/product/${productId}`,

    // Order Status Management
    updateStatus: (id: string) => `${BASE_PATH}/orders/${id}/status`,
    cancel: (id: string) => `${BASE_PATH}/orders/${id}/cancel`,
    hold: (id: string) => `${BASE_PATH}/orders/${id}/hold`,
    release: (id: string) => `${BASE_PATH}/orders/${id}/release`,

    // Order Fulfillment
    fulfill: (id: string) => `${BASE_PATH}/orders/${id}/fulfill`,
    partialFulfill: (id: string) => `${BASE_PATH}/orders/${id}/partial-fulfill`,
    updateShipping: (id: string) => `${BASE_PATH}/orders/${id}/shipping`,

    // Payment Operations
    capturePayment: (id: string) => `${BASE_PATH}/orders/${id}/capture-payment`,
    refund: (id: string) => `${BASE_PATH}/orders/${id}/refund`,
    voidPayment: (id: string) => `${BASE_PATH}/orders/${id}/void-payment`,

    // Returns & Exchanges Management
    createReturn: (id: string) => `${BASE_PATH}/orders/${id}/returns`,
    processReturn: (id: string, returnId: string) => `${BASE_PATH}/orders/${id}/returns/${returnId}`,
    return: (id: string) => `${BASE_PATH}/orders/${id}/return`,
    exchange: (id: string) => `${BASE_PATH}/orders/${id}/exchange`,

    // Order Tracking
    track: (orderNumber: string) => `${BASE_PATH}/orders/track/${orderNumber}`,
    tracking: (id: string) => `${BASE_PATH}/orders/${id}/tracking`,
    updateTracking: (id: string) => `${BASE_PATH}/orders/${id}/tracking`,

    // Order Invoice & Documents
    invoice: (id: string) => `${BASE_PATH}/orders/${id}/invoice`,
    generateInvoice: (id: string) => `${BASE_PATH}/orders/${id}/generate-invoice`,
    downloadInvoice: (id: string) => `${BASE_PATH}/orders/${id}/invoice/download`,
    receipt: (id: string) => `${BASE_PATH}/orders/${id}/receipt`,

    // Order Notes & Communication
    addNote: (id: string) => `${BASE_PATH}/orders/${id}/notes`,
    notes: (id: string) => `${BASE_PATH}/orders/${id}/notes`,
    updateNote: (id: string, noteId: string) => `${BASE_PATH}/orders/${id}/notes/${noteId}`,
    deleteNote: (id: string, noteId: string) => `${BASE_PATH}/orders/${id}/notes/${noteId}`,

    // Order Reviews & Ratings
    addReview: (id: string) => `${BASE_PATH}/orders/${id}/review`,

    // Order Actions
    reorder: (id: string) => `${BASE_PATH}/orders/${id}/reorder`,
    items: (id: string) => `${BASE_PATH}/orders/${id}/items`,
    shipping: (id: string) => `${BASE_PATH}/orders/${id}/shipping`,

    // Order Validation & Verification
    validate: `${BASE_PATH}/orders/validate`,
    verifyInventory: `${BASE_PATH}/orders/verify-inventory`,

    // Fraud Detection & Risk Management
    riskAssessment: (id: string) => `${BASE_PATH}/orders/${id}/risk-assessment`,
    flag: (id: string) => `${BASE_PATH}/orders/${id}/flag`,
    unflag: (id: string) => `${BASE_PATH}/orders/${id}/unflag`,

    // Integration & Sync
    syncMarketplace: (id: string) => `${BASE_PATH}/orders/${id}/sync-marketplace`,
    webhook: (id: string) => `${BASE_PATH}/orders/${id}/webhook`,

    // Bulk Operations
    bulk: `${BASE_PATH}/orders/bulk`,
    export: `${BASE_PATH}/orders/export`,

    // Analytics & Reports
    analytics: `${BASE_PATH}/orders/analytics`,
    reports: {
      sales: `${BASE_PATH}/orders/reports/sales`,
      fulfillment: `${BASE_PATH}/orders/reports/fulfillment`,
      customer: `${BASE_PATH}/orders/reports/customer`,
      product: `${BASE_PATH}/orders/reports/product`,
      geographic: `${BASE_PATH}/orders/reports/geographic`,
    },

    // Admin Operations
    admin: {
      list: `${BASE_PATH}/admin/orders`,
      updateStatus: (id: string) => `${BASE_PATH}/admin/orders/${id}/status`,
      update: (id: string) => `${BASE_PATH}/admin/orders/${id}`,
      refund: (id: string) => `${BASE_PATH}/admin/orders/${id}/refund`,
      addNotes: (id: string) => `${BASE_PATH}/admin/orders/${id}/notes`,
      bulkUpdate: `${BASE_PATH}/admin/orders/bulk-update`,
      export: `${BASE_PATH}/admin/orders/export`,
      statistics: `${BASE_PATH}/admin/orders/statistics`,
      handleReturn: (returnId: string) => `${BASE_PATH}/admin/returns/${returnId}`,
      handleExchange: (exchangeId: string) => `${BASE_PATH}/admin/exchanges/${exchangeId}`,
    }
  },

  // Payment Endpoints
  payments: {
    // Basic CRUD Operations
    list: `${BASE_PATH}/payments`,
    create: `${BASE_PATH}/payments`,
    byId: (id: string) => `${BASE_PATH}/payments/${id}`,
    update: (id: string) => `${BASE_PATH}/payments/${id}`,
    delete: (id: string) => `${BASE_PATH}/payments/${id}`,

    // Payment Processing Operations
    authorize: (id: string) => `${BASE_PATH}/payments/${id}/authorize`,
    capture: (id: string) => `${BASE_PATH}/payments/${id}/capture`,
    void: (id: string) => `${BASE_PATH}/payments/${id}/void`,
    cancel: (id: string) => `${BASE_PATH}/payments/${id}/cancel`,

    // Refund Operations
    createRefund: (id: string) => `${BASE_PATH}/payments/${id}/refunds`,
    refunds: (id: string) => `${BASE_PATH}/payments/${id}/refunds`,
    allRefunds: `${BASE_PATH}/payments/refunds`,
    refund: (paymentId: string, refundId: string) => `${BASE_PATH}/payments/${paymentId}/refunds/${refundId}`,
    updateRefund: (paymentId: string, refundId: string) => `${BASE_PATH}/payments/${paymentId}/refunds/${refundId}`,
    refundStatus: (refundId: string) => `${BASE_PATH}/payments/refunds/${refundId}/status`,

    // Dispute Management
    disputes: (id: string) => `${BASE_PATH}/payments/${id}/disputes`,
    allDisputes: `${BASE_PATH}/payments/disputes`,
    dispute: (paymentId: string, disputeId: string) => `${BASE_PATH}/payments/${paymentId}/disputes/${disputeId}`,
    submitEvidence: (paymentId: string, disputeId: string) => `${BASE_PATH}/payments/${paymentId}/disputes/${disputeId}/evidence`,
    acceptDispute: (paymentId: string, disputeId: string) => `${BASE_PATH}/payments/${paymentId}/disputes/${disputeId}/accept`,

    // Payment Methods Management
    paymentMethods: `${BASE_PATH}/payments/methods`,
    addPaymentMethod: `${BASE_PATH}/payments/methods`,
    updatePaymentMethod: (id: string) => `${BASE_PATH}/payments/methods/${id}`,
    deletePaymentMethod: (id: string) => `${BASE_PATH}/payments/methods/${id}`,
    setDefaultPaymentMethod: (id: string) => `${BASE_PATH}/payments/methods/${id}/default`,

    // Subscription Management
    subscriptions: `${BASE_PATH}/payments/subscriptions`,
    subscription: (id: string) => `${BASE_PATH}/payments/subscriptions/${id}`,
    createSubscription: `${BASE_PATH}/payments/subscriptions`,
    updateSubscription: (id: string) => `${BASE_PATH}/payments/subscriptions/${id}`,
    cancelSubscription: (id: string) => `${BASE_PATH}/payments/subscriptions/${id}/cancel`,

    // Search & Filtering
    search: `${BASE_PATH}/payments/search`,
    byCustomer: (customerId: string) => `${BASE_PATH}/customers/${customerId}/payments`,
    byOrder: (orderId: string) => `${BASE_PATH}/orders/${orderId}/payments`,

    // Bulk Operations
    bulk: `${BASE_PATH}/payments/bulk`,
    export: `${BASE_PATH}/payments/export`,

    // Validation & Verification
    validatePaymentMethod: `${BASE_PATH}/payments/validate-method`,
    verifyMicroDeposits: (bankAccountId: string) => `${BASE_PATH}/payments/methods/${bankAccountId}/verify`,

    // Webhook & Events
    webhookEvents: (id: string) => `${BASE_PATH}/payments/${id}/webhook-events`,
    resendWebhook: (paymentId: string, eventId: string) => `${BASE_PATH}/payments/${paymentId}/webhook-events/${eventId}/resend`,

    // Gateway & Integration
    gatewayStatus: `${BASE_PATH}/payments/gateway-status`,
    syncWithGateway: (id: string) => `${BASE_PATH}/payments/${id}/sync`,

    // Analytics & Reports
    analytics: `${BASE_PATH}/payments/analytics`,
    reports: (type: string) => `${BASE_PATH}/payments/reports/${type}`,

    // Legacy Gateway Endpoints (for compatibility)
    createRazorpayOrder: `${BASE_PATH}/payments/razorpay/order`,
    verifyRazorpayPayment: `${BASE_PATH}/payments/razorpay/verify`,
    createStripeIntent: `${BASE_PATH}/payments/stripe/intent`,
    confirmStripePayment: `${BASE_PATH}/payments/stripe/confirm`,
    upiPayment: `${BASE_PATH}/payments/upi`,
    walletPayment: `${BASE_PATH}/payments/wallet`,
    netBanking: `${BASE_PATH}/payments/netbanking`,

    // Configuration
    gateways: `${BASE_PATH}/payments/gateways`,
    banks: `${BASE_PATH}/payments/banks`,
    wallets: `${BASE_PATH}/payments/wallets`,
    calculateFees: `${BASE_PATH}/payments/calculate-fees`,

    // Transaction Management (Legacy)
    transactions: `${BASE_PATH}/payments/transactions`,
    transactionById: (id: string) => `${BASE_PATH}/payments/transactions/${id}`,
    transactionStatus: (id: string) => `${BASE_PATH}/payments/transactions/${id}/status`,

    // Admin Operations
    admin: {
      list: `${BASE_PATH}/admin/payments`,
      transactions: `${BASE_PATH}/admin/payments/transactions`,
      updateTransaction: (id: string) => `${BASE_PATH}/admin/payments/transactions/${id}`,
      manualRefund: `${BASE_PATH}/admin/payments/manual-refund`,
      statistics: `${BASE_PATH}/admin/payments/statistics`,
      export: `${BASE_PATH}/admin/payments/export`,
      configureGateway: (id: string) => `${BASE_PATH}/admin/payments/gateways/${id}`,
      bulkOperations: `${BASE_PATH}/admin/payments/bulk`,
      riskManagement: `${BASE_PATH}/admin/payments/risk`,
      fraudDetection: `${BASE_PATH}/admin/payments/fraud`,
      reconciliation: `${BASE_PATH}/admin/payments/reconcile`,
    },

    // Legacy webhook endpoint
    webhook: `${BASE_PATH}/payments/webhook`,
  },

  // Review Endpoints
  reviews: {
    // Basic CRUD
    list: `${BASE_PATH}/reviews`,
    create: `${BASE_PATH}/reviews`,
    byId: (id: string) => `${BASE_PATH}/reviews/${id}`,
    update: (id: string) => `${BASE_PATH}/reviews/${id}`,
    delete: (id: string) => `${BASE_PATH}/reviews/${id}`,

    // Retrieval
    byProduct: (productId: string) => `${BASE_PATH}/products/${productId}/reviews`,
    byUser: (userId: string) => `${BASE_PATH}/users/${userId}/reviews`,
    summary: (productId: string) => `${BASE_PATH}/products/${productId}/reviews/summary`,
    featured: `${BASE_PATH}/reviews/featured`,
    recent: `${BASE_PATH}/reviews/recent`,
    search: `${BASE_PATH}/reviews/search`,

    // Interactions
    helpful: (id: string) => `${BASE_PATH}/reviews/${id}/helpful`,
    report: (id: string) => `${BASE_PATH}/reviews/${id}/report`,
    reply: (id: string) => `${BASE_PATH}/reviews/${id}/replies`,
    updateReply: (replyId: string) => `${BASE_PATH}/reviews/replies/${replyId}`,
    deleteReply: (replyId: string) => `${BASE_PATH}/reviews/replies/${replyId}`,

    // Media
    uploadMedia: (id: string) => `${BASE_PATH}/reviews/${id}/media`,
    deleteMedia: (id: string) => `${BASE_PATH}/reviews/${id}/media`,

    // Analytics
    analytics: `${BASE_PATH}/reviews/analytics`,
    sentiment: (id: string) => `${BASE_PATH}/reviews/${id}/sentiment`,
    insights: (productId: string) => `${BASE_PATH}/products/${productId}/reviews/insights`,

    // Templates & Invitations
    templates: `${BASE_PATH}/reviews/templates`,
    generateInvitation: `${BASE_PATH}/reviews/invitations`,

    // Admin Operations
    admin: {
      list: `${BASE_PATH}/admin/reviews`,
      moderate: (id: string) => `${BASE_PATH}/admin/reviews/${id}/moderate`,
      bulkModerate: `${BASE_PATH}/admin/reviews/bulk-moderate`,
      statistics: `${BASE_PATH}/admin/reviews/statistics`,
      export: `${BASE_PATH}/admin/reviews/export`,
    },
  },

  // Blog Endpoints
  blog: {
    // Posts
    list: `${BASE_PATH}/blog/posts`,
    posts: `${BASE_PATH}/blog/posts`,
    published: `${BASE_PATH}/blog/posts/published`,
    featured: `${BASE_PATH}/blog/posts/featured`,
    popular: `${BASE_PATH}/blog/posts/popular`,
    recent: `${BASE_PATH}/blog/posts/recent`,
    byId: (id: string) => `${BASE_PATH}/blog/posts/${id}`,
    bySlug: (slug: string) => `${BASE_PATH}/blog/posts/slug/${slug}`,
    create: `${BASE_PATH}/blog/posts`,
    update: (id: string) => `${BASE_PATH}/blog/posts/${id}`,
    delete: (id: string) => `${BASE_PATH}/blog/posts/${id}`,
    duplicate: (id: string) => `${BASE_PATH}/blog/posts/${id}/duplicate`,

    // Bulk operations
    bulkCreate: `${BASE_PATH}/blog/posts/bulk`,
    bulkUpdate: `${BASE_PATH}/blog/posts/bulk/update`,
    bulkDelete: `${BASE_PATH}/blog/posts/bulk/delete`,
    bulkPublish: `${BASE_PATH}/blog/posts/bulk/publish`,
    bulkArchive: `${BASE_PATH}/blog/posts/bulk/archive`,

    // Status management
    publish: (id: string) => `${BASE_PATH}/blog/posts/${id}/publish`,
    unpublish: (id: string) => `${BASE_PATH}/blog/posts/${id}/unpublish`,
    archive: (id: string) => `${BASE_PATH}/blog/posts/${id}/archive`,
    schedule: (id: string) => `${BASE_PATH}/blog/posts/${id}/schedule`,
    toggleFeatured: (id: string) => `${BASE_PATH}/blog/posts/${id}/toggle-featured`,

    // Categories
    categories: {
      list: `${BASE_PATH}/blog/categories`,
      byId: (id: string) => `${BASE_PATH}/blog/categories/${id}`,
      create: `${BASE_PATH}/blog/categories`,
      update: (id: string) => `${BASE_PATH}/blog/categories/${id}`,
      delete: (id: string) => `${BASE_PATH}/blog/categories/${id}`,
    },
    byCategory: (categoryId: string) => `${BASE_PATH}/blog/posts/category/${categoryId}`,
    categoryPosts: (slug: string) => `${BASE_PATH}/blog/categories/${slug}/posts`,

    // Tags
    tags: {
      list: `${BASE_PATH}/blog/tags`,
      byId: (id: string) => `${BASE_PATH}/blog/tags/${id}`,
      create: `${BASE_PATH}/blog/tags`,
      update: (id: string) => `${BASE_PATH}/blog/tags/${id}`,
      delete: (id: string) => `${BASE_PATH}/blog/tags/${id}`,
    },
    byTag: (tagId: string) => `${BASE_PATH}/blog/posts/tag/${tagId}`,
    tagPosts: (tag: string) => `${BASE_PATH}/blog/tags/${tag}/posts`,

    // Authors
    authors: {
      list: `${BASE_PATH}/blog/authors`,
      byId: (id: string) => `${BASE_PATH}/blog/authors/${id}`,
    },
    byAuthor: (authorId: string) => `${BASE_PATH}/blog/posts/author/${authorId}`,

    // Comments
    comments: {
      byBlog: (blogId: string) => `${BASE_PATH}/blog/posts/${blogId}/comments`,
      create: (blogId: string) => `${BASE_PATH}/blog/posts/${blogId}/comments`,
      update: (id: string) => `${BASE_PATH}/blog/comments/${id}`,
      delete: (id: string) => `${BASE_PATH}/blog/comments/${id}`,
      approve: (id: string) => `${BASE_PATH}/blog/comments/${id}/approve`,
      reject: (id: string) => `${BASE_PATH}/blog/comments/${id}/reject`,
    },

    // Engagement
    like: (id: string) => `${BASE_PATH}/blog/posts/${id}/like`,
    unlike: (id: string) => `${BASE_PATH}/blog/posts/${id}/unlike`,
    view: (id: string) => `${BASE_PATH}/blog/posts/${id}/view`,
    share: (id: string) => `${BASE_PATH}/blog/posts/${id}/share`,

    // Search and filtering
    search: `${BASE_PATH}/blog/search`,
    related: (id: string) => `${BASE_PATH}/blog/posts/${id}/related`,

    // Analytics
    analytics: `${BASE_PATH}/blog/analytics`,
    stats: (id: string) => `${BASE_PATH}/blog/posts/${id}/stats`,
    trending: `${BASE_PATH}/blog/trending`,

    // SEO
    seo: (id: string) => `${BASE_PATH}/blog/posts/${id}/seo`,
    analyzeSEO: (id: string) => `${BASE_PATH}/blog/posts/${id}/seo/analyze`,
    optimizeSEO: (id: string) => `${BASE_PATH}/blog/posts/${id}/seo/optimize`,

    // Content management
    uploadImage: `${BASE_PATH}/blog/upload/image`,
    generateSlug: `${BASE_PATH}/blog/generate-slug`,
    preview: (id: string) => `${BASE_PATH}/blog/posts/${id}/preview`,
    saveAsDraft: (id: string) => `${BASE_PATH}/blog/posts/${id}/draft`,

    // Export/Import
    export: `${BASE_PATH}/blog/export`,
    import: `${BASE_PATH}/blog/import`,

    // Content generation
    generateContent: `${BASE_PATH}/blog/generate-content`,
    improve: (id: string) => `${BASE_PATH}/blog/posts/${id}/improve`,

    // Newsletter integration
    addToNewsletter: (id: string) => `${BASE_PATH}/blog/posts/${id}/newsletter`,
    removeFromNewsletter: (id: string) => `${BASE_PATH}/blog/posts/${id}/newsletter`,

    // RSS and sitemap
    rss: `${BASE_PATH}/blog/rss`,
    sitemap: `${BASE_PATH}/blog/sitemap`,
  },

  // FAQ Endpoints
  faq: {
    // Basic FAQ Operations
    list: `${BASE_PATH}/faq`,
    byId: (id: string) => `${BASE_PATH}/faq/${id}`,
    bySlug: (slug: string) => `${BASE_PATH}/faq/slug/${slug}`,
    create: `${BASE_PATH}/faq`,
    update: (id: string) => `${BASE_PATH}/faq/${id}`,
    delete: (id: string) => `${BASE_PATH}/faq/${id}`,
    duplicate: (id: string) => `${BASE_PATH}/faq/${id}/duplicate`,

    // FAQ Status Management
    publish: (id: string) => `${BASE_PATH}/faq/${id}/publish`,
    archive: (id: string) => `${BASE_PATH}/faq/${id}/archive`,
    featured: `${BASE_PATH}/faq/featured`,
    reorder: `${BASE_PATH}/faq/reorder`,

    // Categories
    categories: {
      list: `${BASE_PATH}/faq/categories`,
      byId: (id: string) => `${BASE_PATH}/faq/categories/${id}`,
      bySlug: (slug: string) => `${BASE_PATH}/faq/categories/slug/${slug}`,
      create: `${BASE_PATH}/faq/categories`,
      update: (id: string) => `${BASE_PATH}/faq/categories/${id}`,
      delete: (id: string) => `${BASE_PATH}/faq/categories/${id}`,
      faqs: (id: string) => `${BASE_PATH}/faq/categories/${id}/faqs`,
      tree: `${BASE_PATH}/faq/categories/tree`,
      stats: (id: string) => `${BASE_PATH}/faq/categories/${id}/stats`,
    },

    // Featured & Popular
    popular: `${BASE_PATH}/faq/popular`,
    recent: `${BASE_PATH}/faq/recent`,
    related: (id: string) => `${BASE_PATH}/faq/${id}/related`,

    // Search & Filter
    search: `${BASE_PATH}/faq/search`,
    searchSuggestions: `${BASE_PATH}/faq/search-suggestions`,
    autoComplete: `${BASE_PATH}/faq/autocomplete`,

    // FAQ Interaction
    vote: (id: string) => `${BASE_PATH}/faq/${id}/vote`,
    view: (id: string) => `${BASE_PATH}/faq/${id}/view`,
    report: (id: string) => `${BASE_PATH}/faq/${id}/report`,

    // FAQ Suggestions
    suggestions: {
      list: `${BASE_PATH}/faq/suggestions`,
      create: `${BASE_PATH}/faq/suggestions`,
      process: (id: string) => `${BASE_PATH}/faq/suggestions/${id}/process`,
      delete: (id: string) => `${BASE_PATH}/faq/suggestions/${id}`,
    },

    // FAQ Templates
    templates: {
      list: `${BASE_PATH}/faq/templates`,
      byId: (id: string) => `${BASE_PATH}/faq/templates/${id}`,
      create: `${BASE_PATH}/faq/templates`,
      update: (id: string) => `${BASE_PATH}/faq/templates/${id}`,
      delete: (id: string) => `${BASE_PATH}/faq/templates/${id}`,
      createFAQ: (templateId: string) => `${BASE_PATH}/faq/templates/${templateId}/create-faq`,
    },

    // Analytics & Statistics
    analytics: (id: string) => `${BASE_PATH}/faq/${id}/analytics`,
    stats: `${BASE_PATH}/faq/stats`,

    // Bulk Operations
    bulk: {
      update: `${BASE_PATH}/faq/bulk-update`,
      delete: `${BASE_PATH}/faq/bulk-delete`,
    },

    // Import/Export
    import: `${BASE_PATH}/faq/import`,
    export: `${BASE_PATH}/faq/export`,

    // AI & Automation
    ai: {
      generate: `${BASE_PATH}/faq/ai/generate`,
      improve: (id: string) => `${BASE_PATH}/faq/${id}/ai/improve`,
      similar: (id: string) => `${BASE_PATH}/faq/${id}/ai/similar`,
      translate: (id: string) => `${BASE_PATH}/faq/${id}/ai/translate`,
    },

    // Multilingual Support
    translations: (id: string) => `${BASE_PATH}/faq/${id}/translations`,
    updateTranslation: (id: string, language: string) => `${BASE_PATH}/faq/${id}/translations/${language}`,
    deleteTranslation: (id: string, language: string) => `${BASE_PATH}/faq/${id}/translations/${language}`,

    // FAQ Review & Moderation
    review: {
      list: `${BASE_PATH}/faq/review`,
      process: (id: string) => `${BASE_PATH}/faq/${id}/review`,
      flag: (id: string) => `${BASE_PATH}/faq/${id}/flag`,
    },

    // Content Validation
    validate: `${BASE_PATH}/faq/validate`,
    checkDuplicates: `${BASE_PATH}/faq/check-duplicates`,

    // Legacy endpoints
    byCategory: (category: string) => `${BASE_PATH}/faq/categories/${category}`,
  },

  // Contact Endpoints
  contact: {
    // Public Contact Operations
    submit: `${BASE_PATH}/contact`,
    validate: `${BASE_PATH}/contact/validate`,
    checkDuplicate: `${BASE_PATH}/contact/check-duplicate`,
    info: `${BASE_PATH}/contact/info`,
    categories: `${BASE_PATH}/contact/categories`,
    faqs: `${BASE_PATH}/contact/faqs`,

    // Tracking
    track: (ticketNumber: string) => `${BASE_PATH}/contact/track/${ticketNumber}`,
    byToken: (token: string) => `${BASE_PATH}/contact/token/${token}`,

    // Customer Response
    addResponse: (submissionId: string) => `${BASE_PATH}/contact/${submissionId}/response`,
    rateSatisfaction: (submissionId: string) => `${BASE_PATH}/contact/${submissionId}/rating`,

    // Newsletter
    newsletter: {
      subscribe: `${BASE_PATH}/contact/newsletter/subscribe`,
      unsubscribe: `${BASE_PATH}/contact/newsletter/unsubscribe`,
      confirm: (token: string) => `${BASE_PATH}/contact/newsletter/confirm/${token}`,
    },

    // Admin Operations
    admin: {
      list: `${BASE_PATH}/admin/contact`,
      byId: (id: string) => `${BASE_PATH}/admin/contact/${id}`,
      updateStatus: (id: string) => `${BASE_PATH}/admin/contact/${id}/status`,
      assign: (id: string) => `${BASE_PATH}/admin/contact/${id}/assign`,
      addResponse: (id: string) => `${BASE_PATH}/admin/contact/${id}/response`,
      bulkUpdate: `${BASE_PATH}/admin/contact/bulk-update`,
      delete: (id: string) => `${BASE_PATH}/admin/contact/${id}`,
      export: `${BASE_PATH}/admin/contact/export`,

      // Templates
      templates: {
        list: `${BASE_PATH}/admin/contact/templates`,
        create: `${BASE_PATH}/admin/contact/templates`,
        update: (id: string) => `${BASE_PATH}/admin/contact/templates/${id}`,
        delete: (id: string) => `${BASE_PATH}/admin/contact/templates/${id}`,
      },

      // Statistics
      stats: `${BASE_PATH}/admin/contact/stats`,
      performance: `${BASE_PATH}/admin/contact/performance`,

      // Settings
      settings: `${BASE_PATH}/admin/contact/settings`,
      testEmail: `${BASE_PATH}/admin/contact/test-email`,

      // Auto-response
      autoResponse: {
        test: `${BASE_PATH}/admin/contact/auto-response/test`,
        templates: `${BASE_PATH}/admin/contact/auto-response/templates`,
      },
    },

    // Knowledge Base Integration
    knowledgeBase: {
      search: `${BASE_PATH}/contact/kb/search`,
      suggest: (submissionId: string) => `${BASE_PATH}/contact/kb/suggest/${submissionId}`,
    },

    // Legacy endpoints for backward compatibility
    support: `${BASE_PATH}/contact/support`,
    feedback: `${BASE_PATH}/contact/feedback`,
    bulk: `${BASE_PATH}/contact/bulk-inquiry`,
  },

  // Newsletter Endpoints
  newsletter: {
    // Basic Subscription Management
    subscribe: `${BASE_PATH}/newsletter/subscribe`,
    unsubscribe: `${BASE_PATH}/newsletter/unsubscribe`,
    confirm: `${BASE_PATH}/newsletter/confirm`,
    preferences: `${BASE_PATH}/newsletter/preferences`,
    verify: `${BASE_PATH}/newsletter/verify`,

    // Subscriber Management
    subscribers: {
      list: `${BASE_PATH}/newsletter/subscribers`,
      create: `${BASE_PATH}/newsletter/subscribers`,
      byId: (id: string) => `${BASE_PATH}/newsletter/subscribers/${id}`,
      update: (id: string) => `${BASE_PATH}/newsletter/subscribers/${id}`,
      delete: (id: string) => `${BASE_PATH}/newsletter/subscribers/${id}`,
      bulk: `${BASE_PATH}/newsletter/subscribers/bulk`,
      import: `${BASE_PATH}/newsletter/subscribers/import`,
      export: `${BASE_PATH}/newsletter/subscribers/export`,
      preferences: (id: string) => `${BASE_PATH}/newsletter/subscribers/${id}/preferences`,
      activity: (id: string) => `${BASE_PATH}/newsletter/subscribers/${id}/activity`,
    },

    // Campaign Management
    campaigns: {
      list: `${BASE_PATH}/newsletter/campaigns`,
      create: `${BASE_PATH}/newsletter/campaigns`,
      byId: (id: string) => `${BASE_PATH}/newsletter/campaigns/${id}`,
      update: (id: string) => `${BASE_PATH}/newsletter/campaigns/${id}`,
      delete: (id: string) => `${BASE_PATH}/newsletter/campaigns/${id}`,
      duplicate: (id: string) => `${BASE_PATH}/newsletter/campaigns/${id}/duplicate`,

      // Campaign Operations
      send: (id: string) => `${BASE_PATH}/newsletter/campaigns/${id}/send`,
      pause: (id: string) => `${BASE_PATH}/newsletter/campaigns/${id}/pause`,
      resume: (id: string) => `${BASE_PATH}/newsletter/campaigns/${id}/resume`,
      cancel: (id: string) => `${BASE_PATH}/newsletter/campaigns/${id}/cancel`,
      test: (id: string) => `${BASE_PATH}/newsletter/campaigns/${id}/test`,

      // Analytics & Performance
      analytics: (id: string) => `${BASE_PATH}/newsletter/campaigns/${id}/analytics`,
      performance: (id: string) => `${BASE_PATH}/newsletter/campaigns/${id}/performance`,
    },

    // Template Management
    templates: {
      list: `${BASE_PATH}/newsletter/templates`,
      create: `${BASE_PATH}/newsletter/templates`,
      byId: (id: string) => `${BASE_PATH}/newsletter/templates/${id}`,
      update: (id: string) => `${BASE_PATH}/newsletter/templates/${id}`,
      delete: (id: string) => `${BASE_PATH}/newsletter/templates/${id}`,
      duplicate: (id: string) => `${BASE_PATH}/newsletter/templates/${id}/duplicate`,
      preview: (id: string) => `${BASE_PATH}/newsletter/templates/${id}/preview`,
    },

    // Segment Management
    segments: {
      list: `${BASE_PATH}/newsletter/segments`,
      create: `${BASE_PATH}/newsletter/segments`,
      byId: (id: string) => `${BASE_PATH}/newsletter/segments/${id}`,
      update: (id: string) => `${BASE_PATH}/newsletter/segments/${id}`,
      delete: (id: string) => `${BASE_PATH}/newsletter/segments/${id}`,
      refresh: (id: string) => `${BASE_PATH}/newsletter/segments/${id}/refresh`,
      subscribers: (id: string) => `${BASE_PATH}/newsletter/segments/${id}/subscribers`,
    },

    // A/B Testing
    abTest: {
      create: `${BASE_PATH}/newsletter/ab-tests`,
      list: `${BASE_PATH}/newsletter/ab-tests`,
      byId: (id: string) => `${BASE_PATH}/newsletter/ab-tests/${id}`,
      results: (campaignId: string) => `${BASE_PATH}/newsletter/campaigns/${campaignId}/ab-test-results`,
      selectWinner: `${BASE_PATH}/newsletter/ab-tests/select-winner`,
    },

    // Analytics & Reporting
    analytics: `${BASE_PATH}/newsletter/analytics`,
    reports: {
      performance: `${BASE_PATH}/newsletter/reports/performance`,
      growth: `${BASE_PATH}/newsletter/reports/growth`,
      engagement: `${BASE_PATH}/newsletter/reports/engagement`,
      revenue: `${BASE_PATH}/newsletter/reports/revenue`,
    },

    // Automation & Workflows
    automations: {
      list: `${BASE_PATH}/newsletter/automations`,
      create: `${BASE_PATH}/newsletter/automations`,
      byId: (id: string) => `${BASE_PATH}/newsletter/automations/${id}`,
      update: (id: string) => `${BASE_PATH}/newsletter/automations/${id}`,
      delete: (id: string) => `${BASE_PATH}/newsletter/automations/${id}`,
      toggle: (id: string) => `${BASE_PATH}/newsletter/automations/${id}/toggle`,
    },

    // Email Validation & List Cleaning
    validation: {
      email: `${BASE_PATH}/newsletter/validation/email`,
      cleanList: `${BASE_PATH}/newsletter/validation/clean-list`,
    },

    // Deliverability & Compliance
    deliverability: {
      report: `${BASE_PATH}/newsletter/deliverability/report`,
    },
    compliance: {
      check: `${BASE_PATH}/newsletter/compliance/check`,
    },

    // Search & Tracking
    search: `${BASE_PATH}/newsletter/search`,
    tracking: {
      event: `${BASE_PATH}/newsletter/tracking/event`,
    },
  },

  // Coupon Endpoints
  coupons: {
    list: `${BASE_PATH}/coupons`,
    validate: `${BASE_PATH}/coupons/validate`,
    apply: `${BASE_PATH}/coupons/apply`,
    byCode: (code: string) => `${BASE_PATH}/coupons/code/${code}`,
    user: `${BASE_PATH}/coupons/user`,
    byId: (id: string) => `${BASE_PATH}/coupons/${id}`,
    active: `${BASE_PATH}/coupons/active`,
    create: `${BASE_PATH}/coupons`,
    update: (id: string) => `${BASE_PATH}/coupons/${id}`,
    delete: (id: string) => `${BASE_PATH}/coupons/${id}`,
    duplicate: (id: string) => `${BASE_PATH}/coupons/${id}/duplicate`,
    validateCode: (code: string) => `${BASE_PATH}/coupons/validate/${code}`,
    applyToCart: (cartId: string) => `${BASE_PATH}/coupons/cart/${cartId}/apply`,
    removeFromCart: (cartId: string, code: string) => `${BASE_PATH}/coupons/cart/${cartId}/remove/${code}`,
    usage: (id: string) => `${BASE_PATH}/coupons/${id}/usage`,
    userUsage: (userId: string) => `${BASE_PATH}/coupons/user/${userId}/usage`,
    templates: `${BASE_PATH}/coupons/templates`,
    fromTemplate: (templateId: string) => `${BASE_PATH}/coupons/templates/${templateId}/create`,
    analytics: (id: string) => `${BASE_PATH}/coupons/${id}/analytics`,
    performance: `${BASE_PATH}/coupons/performance`,
    bulkUpdate: `${BASE_PATH}/coupons/bulk-update`,
    bulkDelete: `${BASE_PATH}/coupons/bulk-delete`,
    generateCodes: `${BASE_PATH}/coupons/generate-codes`,
    checkCode: (code: string) => `${BASE_PATH}/coupons/check-code/${code}`,
    sendEmail: (id: string) => `${BASE_PATH}/coupons/${id}/send-email`,
    sendSMS: (id: string) => `${BASE_PATH}/coupons/${id}/send-sms`,
    qrCode: (id: string) => `${BASE_PATH}/coupons/${id}/qr-code`,
    personalized: (userId: string) => `${BASE_PATH}/coupons/personalized/${userId}`,
    autoApply: `${BASE_PATH}/coupons/auto-apply`,
    autoApplicable: `${BASE_PATH}/coupons/auto-applicable`,
    discover: `${BASE_PATH}/coupons/discover`,
    similar: (id: string) => `${BASE_PATH}/coupons/${id}/similar`,
    admin: {
      list: `${BASE_PATH}/admin/coupons`,
      byId: (id: string) => `${BASE_PATH}/admin/coupons/${id}`,
      create: `${BASE_PATH}/admin/coupons`,
      update: (id: string) => `${BASE_PATH}/admin/coupons/${id}`,
      delete: (id: string) => `${BASE_PATH}/admin/coupons/${id}`,
      duplicate: (id: string) => `${BASE_PATH}/admin/coupons/${id}/duplicate`,
      bulkUpdate: `${BASE_PATH}/admin/coupons/bulk-update`,
      bulkDelete: `${BASE_PATH}/admin/coupons/bulk-delete`,
      bulkGenerate: `${BASE_PATH}/admin/coupons/bulk-generate`,
      import: `${BASE_PATH}/admin/coupons/import`,
      export: `${BASE_PATH}/admin/coupons/export`,
      usage: (id: string) => `${BASE_PATH}/admin/coupons/${id}/usage`,
      analytics: (id: string) => `${BASE_PATH}/admin/coupons/${id}/analytics`,
      stats: `${BASE_PATH}/admin/coupons/stats`,
      performanceReport: `${BASE_PATH}/admin/coupons/performance-report`,
      generateCode: `${BASE_PATH}/admin/coupons/generate-code`,
      validateCode: `${BASE_PATH}/admin/coupons/validate-code`,
      campaigns: {
        list: `${BASE_PATH}/admin/coupon-campaigns`,
        create: `${BASE_PATH}/admin/coupon-campaigns`,
        update: (id: string) => `${BASE_PATH}/admin/coupon-campaigns/${id}`,
        delete: (id: string) => `${BASE_PATH}/admin/coupon-campaigns/${id}`,
        launch: (id: string) => `${BASE_PATH}/admin/coupon-campaigns/${id}/launch`,
        analytics: (id: string) => `${BASE_PATH}/admin/coupon-campaigns/${id}/analytics`,
      },
      abTest: {
        create: `${BASE_PATH}/admin/coupons/ab-test`,
        results: (testId: string) => `${BASE_PATH}/admin/coupons/ab-test/${testId}/results`,
      },
    },
  },

  // Gift Card Endpoints
  giftCards: {
    // Basic CRUD Operations
    list: `${BASE_PATH}/gift-cards`,
    create: `${BASE_PATH}/gift-cards`,
    byId: (id: string) => `${BASE_PATH}/gift-cards/${id}`,
    byCode: (code: string) => `${BASE_PATH}/gift-cards/code/${code}`,
    update: (id: string) => `${BASE_PATH}/gift-cards/${id}`,
    delete: (id: string) => `${BASE_PATH}/gift-cards/${id}`,
    duplicate: (id: string) => `${BASE_PATH}/gift-cards/${id}/duplicate`,

    // Status Management
    activate: (id: string) => `${BASE_PATH}/gift-cards/${id}/activate`,
    deactivate: (id: string) => `${BASE_PATH}/gift-cards/${id}/deactivate`,
    cancel: (id: string) => `${BASE_PATH}/gift-cards/${id}/cancel`,
    suspend: (id: string) => `${BASE_PATH}/gift-cards/${id}/suspend`,

    // Balance Management
    balance: (code: string) => `${BASE_PATH}/gift-cards/code/${code}/balance`,
    addBalance: (id: string) => `${BASE_PATH}/gift-cards/${id}/add-balance`,
    deductBalance: (id: string) => `${BASE_PATH}/gift-cards/${id}/deduct-balance`,
    refund: (id: string) => `${BASE_PATH}/gift-cards/${id}/refund`,

    // Usage & Redemption
    redeem: `${BASE_PATH}/gift-cards/redeem`,
    validate: `${BASE_PATH}/gift-cards/validate`,
    apply: `${BASE_PATH}/gift-cards/apply`,
    usageHistory: (id: string) => `${BASE_PATH}/gift-cards/${id}/usage-history`,

    // Templates
    templates: {
      list: `${BASE_PATH}/gift-cards/templates`,
      create: `${BASE_PATH}/gift-cards/templates`,
      byId: (id: string) => `${BASE_PATH}/gift-cards/templates/${id}`,
      update: (id: string) => `${BASE_PATH}/gift-cards/templates/${id}`,
      delete: (id: string) => `${BASE_PATH}/gift-cards/templates/${id}`,
      duplicate: (id: string) => `${BASE_PATH}/gift-cards/templates/${id}/duplicate`,
    },

    // Bulk Operations
    bulkCreate: `${BASE_PATH}/gift-cards/bulk-create`,
    bulkOrders: `${BASE_PATH}/gift-cards/bulk-orders`,
    bulkOrder: (id: string) => `${BASE_PATH}/gift-cards/bulk-orders/${id}`,
    updateBulkOrder: (id: string) => `${BASE_PATH}/gift-cards/bulk-orders/${id}`,
    cancelBulkOrder: (id: string) => `${BASE_PATH}/gift-cards/bulk-orders/${id}/cancel`,
    processBulkOrder: (id: string) => `${BASE_PATH}/gift-cards/bulk-orders/${id}/process`,

    // Delivery & Notifications
    send: (id: string) => `${BASE_PATH}/gift-cards/${id}/send`,
    resend: (id: string) => `${BASE_PATH}/gift-cards/${id}/resend`,
    deliveryStatus: (id: string) => `${BASE_PATH}/gift-cards/${id}/delivery-status`,
    scheduleReminder: (id: string) => `${BASE_PATH}/gift-cards/${id}/schedule-reminder`,

    // Campaigns
    campaigns: {
      list: `${BASE_PATH}/gift-cards/campaigns`,
      create: `${BASE_PATH}/gift-cards/campaigns`,
      byId: (id: string) => `${BASE_PATH}/gift-cards/campaigns/${id}`,
      update: (id: string) => `${BASE_PATH}/gift-cards/campaigns/${id}`,
      delete: (id: string) => `${BASE_PATH}/gift-cards/campaigns/${id}`,
      activate: (id: string) => `${BASE_PATH}/gift-cards/campaigns/${id}/activate`,
      pause: (id: string) => `${BASE_PATH}/gift-cards/campaigns/${id}/pause`,
      complete: (id: string) => `${BASE_PATH}/gift-cards/campaigns/${id}/complete`,
    },

    // Analytics & Reports
    analytics: `${BASE_PATH}/gift-cards/analytics`,
    expiryReport: `${BASE_PATH}/gift-cards/reports/expiry`,
    usageReport: `${BASE_PATH}/gift-cards/reports/usage`,
    revenueReport: `${BASE_PATH}/gift-cards/reports/revenue`,

    // Search & Filter
    search: `${BASE_PATH}/gift-cards/search`,
    filters: `${BASE_PATH}/gift-cards/filters`,

    // Import/Export
    import: `${BASE_PATH}/gift-cards/import`,
    export: `${BASE_PATH}/gift-cards/export`,

    // Validation & Compliance
    validateBulk: `${BASE_PATH}/gift-cards/validate-bulk`,
    compliance: (id: string) => `${BASE_PATH}/gift-cards/${id}/compliance`,

    // Integration & APIs
    generateApiKey: `${BASE_PATH}/gift-cards/api-keys`,
    webhooks: `${BASE_PATH}/gift-cards/webhooks`,
    updateWebhooks: `${BASE_PATH}/gift-cards/webhooks`,

    // Legacy endpoints for backward compatibility
    transactions: (code: string) => `${BASE_PATH}/gift-cards/code/${code}/transactions`,
  },

  // Heroes/Banner Management Endpoints
  heroes: {
    // Basic CRUD Operations
    list: `${BASE_PATH}/heroes`,
    create: `${BASE_PATH}/heroes`,
    byId: (id: string) => `${BASE_PATH}/heroes/${id}`,
    update: (id: string) => `${BASE_PATH}/heroes/${id}`,
    delete: (id: string) => `${BASE_PATH}/heroes/${id}`,
    duplicate: (id: string) => `${BASE_PATH}/heroes/${id}/duplicate`,

    // Status Management
    activate: (id: string) => `${BASE_PATH}/heroes/${id}/activate`,
    deactivate: (id: string) => `${BASE_PATH}/heroes/${id}/deactivate`,
    archive: (id: string) => `${BASE_PATH}/heroes/${id}/archive`,
    publish: (id: string) => `${BASE_PATH}/heroes/${id}/publish`,
    unpublish: (id: string) => `${BASE_PATH}/heroes/${id}/unpublish`,

    // Priority & Position Management
    priority: (id: string) => `${BASE_PATH}/heroes/${id}/priority`,
    reorder: `${BASE_PATH}/heroes/reorder`,
    move: (id: string) => `${BASE_PATH}/heroes/${id}/move`,

    // Template Management
    templates: {
      list: `${BASE_PATH}/heroes/templates`,
      create: `${BASE_PATH}/heroes/templates`,
      byId: (id: string) => `${BASE_PATH}/heroes/templates/${id}`,
      update: (id: string) => `${BASE_PATH}/heroes/templates/${id}`,
      delete: (id: string) => `${BASE_PATH}/heroes/templates/${id}`,
      duplicate: (id: string) => `${BASE_PATH}/heroes/templates/${id}/duplicate`,
      createHero: (templateId: string) => `${BASE_PATH}/heroes/templates/${templateId}/create-hero`,
    },

    // Bulk Operations
    bulk: `${BASE_PATH}/heroes/bulk`,

    // Scheduling
    schedules: {
      list: `${BASE_PATH}/heroes/schedules`,
      create: `${BASE_PATH}/heroes/schedules`,
      byId: (id: string) => `${BASE_PATH}/heroes/schedules/${id}`,
      update: (id: string) => `${BASE_PATH}/heroes/schedules/${id}`,
      delete: (id: string) => `${BASE_PATH}/heroes/schedules/${id}`,
      activate: (id: string) => `${BASE_PATH}/heroes/schedules/${id}/activate`,
      pause: (id: string) => `${BASE_PATH}/heroes/schedules/${id}/pause`,
    },

    // Campaign Management
    campaigns: {
      list: `${BASE_PATH}/heroes/campaigns`,
      create: `${BASE_PATH}/heroes/campaigns`,
      byId: (id: string) => `${BASE_PATH}/heroes/campaigns/${id}`,
      update: (id: string) => `${BASE_PATH}/heroes/campaigns/${id}`,
      delete: (id: string) => `${BASE_PATH}/heroes/campaigns/${id}`,
      start: (id: string) => `${BASE_PATH}/heroes/campaigns/${id}/start`,
      pause: (id: string) => `${BASE_PATH}/heroes/campaigns/${id}/pause`,
      complete: (id: string) => `${BASE_PATH}/heroes/campaigns/${id}/complete`,
    },

    // Analytics & Performance
    analytics: `${BASE_PATH}/heroes/analytics`,
    performance: (id: string) => `${BASE_PATH}/heroes/${id}/performance`,
    reports: {
      performance: `${BASE_PATH}/heroes/reports/performance`,
      engagement: `${BASE_PATH}/heroes/reports/engagement`,
    },

    // A/B Testing
    abTest: {
      create: `${BASE_PATH}/heroes/ab-tests`,
      list: `${BASE_PATH}/heroes/ab-tests`,
      byId: (id: string) => `${BASE_PATH}/heroes/ab-tests/${id}`,
      update: (id: string) => `${BASE_PATH}/heroes/ab-tests/${id}`,
      stop: (id: string) => `${BASE_PATH}/heroes/ab-tests/${id}/stop`,
      results: (id: string) => `${BASE_PATH}/heroes/ab-tests/${id}/results`,
    },

    // Search & Filter
    search: `${BASE_PATH}/heroes/search`,
    filters: `${BASE_PATH}/heroes/filters`,

    // Preview & Testing
    preview: (id: string) => `${BASE_PATH}/heroes/${id}/preview`,
    test: (id: string) => `${BASE_PATH}/heroes/${id}/test`,

    // Import/Export
    import: `${BASE_PATH}/heroes/import`,
    export: `${BASE_PATH}/heroes/export`,

    // Optimization & AI
    optimize: (id: string) => `${BASE_PATH}/heroes/${id}/optimize`,
    aiGenerate: `${BASE_PATH}/heroes/ai-generate`,

    // Compliance & Validation
    validate: (id: string) => `${BASE_PATH}/heroes/${id}/validate`,
    compliance: `${BASE_PATH}/heroes/compliance`,

    // Integration & Webhooks
    webhooks: `${BASE_PATH}/heroes/webhooks`,
    updateWebhooks: `${BASE_PATH}/heroes/webhooks`,
  },

  // Media/Upload Endpoints
  media: {
    upload: `${BASE_PATH}/media/upload`,
    uploadMultiple: `${BASE_PATH}/media/upload-multiple`,
    uploadFromUrl: `${BASE_PATH}/media/upload-from-url`,
    delete: (id: string) => `${BASE_PATH}/media/${id}`,
    byId: (id: string) => `${BASE_PATH}/media/${id}`,
    update: (id: string) => `${BASE_PATH}/media/${id}`,
    copy: (id: string) => `${BASE_PATH}/media/${id}/copy`,
    move: (id: string) => `${BASE_PATH}/media/${id}/move`,
    list: `${BASE_PATH}/media`,
    files: `${BASE_PATH}/media/files`,
    folders: `${BASE_PATH}/media/folders`,
    folderById: (id: string) => `${BASE_PATH}/media/folders/${id}`,
    createFolder: `${BASE_PATH}/media/folders`,
    updateFolder: (id: string) => `${BASE_PATH}/media/folders/${id}`,
    deleteFolder: (id: string) => `${BASE_PATH}/media/folders/${id}`,
    recent: `${BASE_PATH}/media/recent`,
    search: `${BASE_PATH}/media/search`,
    resize: (id: string) => `${BASE_PATH}/media/${id}/resize`,
    crop: (id: string) => `${BASE_PATH}/media/${id}/crop`,
    thumbnail: (id: string) => `${BASE_PATH}/media/${id}/thumbnail`,
    optimize: (id: string) => `${BASE_PATH}/media/${id}/optimize`,
    statistics: `${BASE_PATH}/media/statistics`,
    usage: (id: string) => `${BASE_PATH}/media/${id}/usage`,
    storageUsage: `${BASE_PATH}/media/storage-usage`,
    bulkDelete: `${BASE_PATH}/media/bulk/delete`,
    bulkMove: `${BASE_PATH}/media/bulk/move`,
    bulkUpdate: `${BASE_PATH}/media/bulk/update`,
    signedUrl: (id: string) => `${BASE_PATH}/media/${id}/signed-url`,
    purgeCdn: `${BASE_PATH}/media/cdn/purge`,
    cdnStats: `${BASE_PATH}/media/cdn/stats`,
  },

  // Site Configuration Endpoints
  site: {
    config: `${BASE_PATH}/site/config`,
    headerLogo: `${BASE_PATH}/site/header-logo`,
    footerLogo: `${BASE_PATH}/site/footer-logo`,
    socialLinks: `${BASE_PATH}/site/social-links`,
    hero: `${BASE_PATH}/site/hero`,
    announcements: `${BASE_PATH}/site/announcements`,
    activeAnnouncements: `${BASE_PATH}/site/announcements/active`,
    features: `${BASE_PATH}/site/features`,
  },

  // About Page Endpoints
  about: {
    get: `${BASE_PATH}/about`,
    company: `${BASE_PATH}/about/company`,
    sections: `${BASE_PATH}/about/sections`,
    team: `${BASE_PATH}/about/team`,
    history: `${BASE_PATH}/about/history`,
    values: `${BASE_PATH}/about/values`,
    mission: `${BASE_PATH}/about/mission`,
    awards: `${BASE_PATH}/about/awards`,
    stats: `${BASE_PATH}/about/statistics`,
    locations: `${BASE_PATH}/about/locations`,
  },

  // Featured Content Endpoints
  featured: {
    // Basic CRUD Operations
    list: `${BASE_PATH}/featured`,
    byId: (id: string) => `${BASE_PATH}/featured/${id}`,
    create: `${BASE_PATH}/featured`,
    update: (id: string) => `${BASE_PATH}/featured/${id}`,
    delete: (id: string) => `${BASE_PATH}/featured/${id}`,
    duplicate: (id: string) => `${BASE_PATH}/featured/${id}/duplicate`,

    // Status Management
    activate: (id: string) => `${BASE_PATH}/featured/${id}/activate`,
    deactivate: (id: string) => `${BASE_PATH}/featured/${id}/deactivate`,
    schedule: (id: string) => `${BASE_PATH}/featured/${id}/schedule`,

    // Section Management
    bySection: (section: string) => `${BASE_PATH}/featured/section/${section}`,
    sections: {
      list: `${BASE_PATH}/featured/sections`,
      byId: (id: string) => `${BASE_PATH}/featured/sections/${id}`,
      create: `${BASE_PATH}/featured/sections`,
      update: (id: string) => `${BASE_PATH}/featured/sections/${id}`,
      delete: (id: string) => `${BASE_PATH}/featured/sections/${id}`,
    },

    // Position & Priority
    reorder: (section: string) => `${BASE_PATH}/featured/section/${section}/reorder`,
    priority: (id: string) => `${BASE_PATH}/featured/${id}/priority`,

    // Content Type Management
    byType: (type: string) => `${BASE_PATH}/featured/type/${type}`,
    types: `${BASE_PATH}/featured/types`,

    // Visibility & Audience
    visibility: (id: string) => `${BASE_PATH}/featured/${id}/visibility`,
    audience: (audience: string) => `${BASE_PATH}/featured/audience/${audience}`,

    // Rules & Conditions
    rules: (id: string) => `${BASE_PATH}/featured/${id}/rules`,
    validateRules: `${BASE_PATH}/featured/validate-rules`,

    // Display Settings
    displaySettings: (id: string) => `${BASE_PATH}/featured/${id}/display-settings`,
    preview: (id: string) => `${BASE_PATH}/featured/${id}/preview`,

    // Performance & Analytics
    performance: (id: string) => `${BASE_PATH}/featured/${id}/performance`,
    analytics: `${BASE_PATH}/featured/analytics`,
    recordView: (id: string) => `${BASE_PATH}/featured/${id}/view`,
    recordClick: (id: string) => `${BASE_PATH}/featured/${id}/click`,
    recordConversion: (id: string) => `${BASE_PATH}/featured/${id}/conversion`,

    // Templates
    templates: {
      list: `${BASE_PATH}/featured/templates`,
      byId: (id: string) => `${BASE_PATH}/featured/templates/${id}`,
      create: `${BASE_PATH}/featured/templates`,
      update: (id: string) => `${BASE_PATH}/featured/templates/${id}`,
      delete: (id: string) => `${BASE_PATH}/featured/templates/${id}`,
      createContent: (templateId: string) => `${BASE_PATH}/featured/templates/${templateId}/create-content`,
    },

    // Scheduling
    schedules: {
      list: `${BASE_PATH}/featured/schedules`,
      byId: (id: string) => `${BASE_PATH}/featured/schedules/${id}`,
      create: `${BASE_PATH}/featured/schedules`,
      update: (id: string) => `${BASE_PATH}/featured/schedules/${id}`,
      delete: (id: string) => `${BASE_PATH}/featured/schedules/${id}`,
      execute: (id: string) => `${BASE_PATH}/featured/schedules/${id}/execute`,
    },

    // A/B Testing
    abTests: {
      list: `${BASE_PATH}/featured/ab-tests`,
      byId: (id: string) => `${BASE_PATH}/featured/ab-tests/${id}`,
      create: `${BASE_PATH}/featured/ab-tests`,
      update: (id: string) => `${BASE_PATH}/featured/ab-tests/${id}`,
      delete: (id: string) => `${BASE_PATH}/featured/ab-tests/${id}`,
      start: (id: string) => `${BASE_PATH}/featured/ab-tests/${id}/start`,
      pause: (id: string) => `${BASE_PATH}/featured/ab-tests/${id}/pause`,
      complete: (id: string) => `${BASE_PATH}/featured/ab-tests/${id}/complete`,
    },

    // Bulk Operations
    bulk: `${BASE_PATH}/featured/bulk`,

    // Search & Filter
    search: `${BASE_PATH}/featured/search`,
    searchSuggestions: `${BASE_PATH}/featured/search-suggestions`,

    // Content Suggestions
    suggestions: (section: string) => `${BASE_PATH}/featured/suggestions/${section}`,
    trending: `${BASE_PATH}/featured/trending`,
    popular: `${BASE_PATH}/featured/popular`,

    // Import/Export
    import: `${BASE_PATH}/featured/import`,
    export: `${BASE_PATH}/featured/export`,

    // Validation
    validate: `${BASE_PATH}/featured/validate`,
    checkConflicts: `${BASE_PATH}/featured/check-conflicts`,

    // AI & Automation
    ai: {
      generate: `${BASE_PATH}/featured/ai/generate`,
      optimize: (id: string) => `${BASE_PATH}/featured/${id}/ai/optimize`,
      recommendations: (section: string) => `${BASE_PATH}/featured/ai/recommendations/${section}`,
      autoSchedule: `${BASE_PATH}/featured/ai/auto-schedule`,
    },

    // Advanced Analytics
    conversionFunnel: (section: string) => `${BASE_PATH}/featured/analytics/funnel/${section}`,
    heatmap: (section: string) => `${BASE_PATH}/featured/analytics/heatmap/${section}`,
    userJourney: (section: string) => `${BASE_PATH}/featured/analytics/journey/${section}`,

    // Mobile & Responsive
    mobile: `${BASE_PATH}/featured/mobile`,
    mobileSettings: (id: string) => `${BASE_PATH}/featured/${id}/mobile-settings`,

    // Integration & Webhooks
    syncCMS: `${BASE_PATH}/featured/sync-cms`,
    webhooks: `${BASE_PATH}/featured/webhooks`,
    testWebhook: (id: string) => `${BASE_PATH}/featured/webhooks/${id}/test`,

    // Legacy endpoints for backward compatibility
    products: `${BASE_PATH}/featured/products`,
    categories: `${BASE_PATH}/featured/categories`,
    brands: `${BASE_PATH}/featured/brands`,
    collections: `${BASE_PATH}/featured/collections`,
  },

  // Sale/Deal Endpoints
  deals: {
    list: `${BASE_PATH}/deals`,
    active: `${BASE_PATH}/deals/active`,
    byId: (id: string) => `${BASE_PATH}/deals/${id}`,
    create: `${BASE_PATH}/deals`,
    update: (id: string) => `${BASE_PATH}/deals/${id}`,
    delete: (id: string) => `${BASE_PATH}/deals/${id}`,
    duplicate: (id: string) => `${BASE_PATH}/deals/${id}/duplicate`,

    // Status Management
    activate: (id: string) => `${BASE_PATH}/deals/${id}/activate`,
    pause: (id: string) => `${BASE_PATH}/deals/${id}/pause`,
    cancel: (id: string) => `${BASE_PATH}/deals/${id}/cancel`,
    extend: (id: string) => `${BASE_PATH}/deals/${id}/extend`,

    // Featured & Priority
    featured: `${BASE_PATH}/deals/featured`,
    priority: (id: string) => `${BASE_PATH}/deals/${id}/priority`,

    // Categories & Types
    byType: (type: string) => `${BASE_PATH}/deals/type/${type}`,
    byCategory: (category: string) => `${BASE_PATH}/deals/category/${category}`,
    upcoming: `${BASE_PATH}/deals/upcoming`,
    expired: `${BASE_PATH}/deals/expired`,

    // Analytics
    analytics: (id: string) => `${BASE_PATH}/deals/${id}/analytics`,
    stats: `${BASE_PATH}/deals/stats`,
    performance: `${BASE_PATH}/deals/performance`,

    // Templates
    templates: {
      list: `${BASE_PATH}/deal-templates`,
      byId: (id: string) => `${BASE_PATH}/deal-templates/${id}`,
      create: `${BASE_PATH}/deal-templates`,
      update: (id: string) => `${BASE_PATH}/deal-templates/${id}`,
      delete: (id: string) => `${BASE_PATH}/deal-templates/${id}`,
      createDeal: (templateId: string) => `${BASE_PATH}/deal-templates/${templateId}/create-deal`,
    },

    // Flash Sales
    flashSales: {
      list: `${BASE_PATH}/flash-sales`,
      byId: (id: string) => `${BASE_PATH}/flash-sales/${id}`,
      create: `${BASE_PATH}/flash-sales`,
      update: (id: string) => `${BASE_PATH}/flash-sales/${id}`,
      delete: (id: string) => `${BASE_PATH}/flash-sales/${id}`,
      active: `${BASE_PATH}/flash-sales/active`,
      upcoming: `${BASE_PATH}/flash-sales/upcoming`,
    },

    // Campaigns
    campaigns: {
      list: `${BASE_PATH}/deal-campaigns`,
      byId: (id: string) => `${BASE_PATH}/deal-campaigns/${id}`,
      create: `${BASE_PATH}/deal-campaigns`,
      update: (id: string) => `${BASE_PATH}/deal-campaigns/${id}`,
      delete: (id: string) => `${BASE_PATH}/deal-campaigns/${id}`,
      analytics: (id: string) => `${BASE_PATH}/deal-campaigns/${id}/analytics`,
    },

    // Bulk Operations
    bulk: {
      update: `${BASE_PATH}/deals/bulk-update`,
      delete: `${BASE_PATH}/deals/bulk-delete`,
    },

    // Import/Export
    import: `${BASE_PATH}/deals/import`,
    export: `${BASE_PATH}/deals/export`,

    // Recommendations
    recommendations: (id: string) => `${BASE_PATH}/deals/${id}/recommendations`,
    personalized: (userId: string) => `${BASE_PATH}/deals/personalized/${userId}`,

    // Search & Validation
    search: `${BASE_PATH}/deals/search`,
    validate: `${BASE_PATH}/deals/validate`,
    preview: `${BASE_PATH}/deals/preview`,

    // Notifications
    notifications: {
      start: (id: string) => `${BASE_PATH}/deals/${id}/notify-start`,
      end: (id: string) => `${BASE_PATH}/deals/${id}/notify-end`,
      schedule: (id: string) => `${BASE_PATH}/deals/${id}/schedule-notification`,
    },

    // Legacy endpoints
    products: (id: string) => `${BASE_PATH}/deals/${id}/products`,
    flash: `${BASE_PATH}/deals/flash`,
    daily: `${BASE_PATH}/deals/daily`,
  },

  sales: {
    list: `${BASE_PATH}/sales`,
    active: `${BASE_PATH}/sales/active`,
    byId: (id: string) => `${BASE_PATH}/sales/${id}`,
    products: (id: string) => `${BASE_PATH}/sales/${id}/products`,
    seasonal: `${BASE_PATH}/sales/seasonal`,
    clearance: `${BASE_PATH}/sales/clearance`,
  },

  // Analytics Endpoints
  analytics: {
    // Event Tracking
    track: `${BASE_PATH}/analytics/track`,
    pageView: `${BASE_PATH}/analytics/page-view`,
    productView: `${BASE_PATH}/analytics/product-view`,
    addToCart: `${BASE_PATH}/analytics/add-to-cart`,
    purchase: `${BASE_PATH}/analytics/purchase`,
    search: `${BASE_PATH}/analytics/search`,
    events: `${BASE_PATH}/analytics/events`,
    batchTrack: `${BASE_PATH}/analytics/batch-track`,

    // User Behavior
    userBehavior: `${BASE_PATH}/analytics/user-behavior`,
    userJourney: `${BASE_PATH}/analytics/user-journey`,
    sessionAnalytics: `${BASE_PATH}/analytics/session-analytics`,

    // Product Analytics
    productPerformance: `${BASE_PATH}/analytics/product-performance`,
    categoryAnalytics: `${BASE_PATH}/analytics/category-analytics`,

    // Revenue Analytics
    revenueAnalytics: `${BASE_PATH}/analytics/revenue-analytics`,
    conversionFunnel: `${BASE_PATH}/analytics/conversion-funnel`,

    // Search Analytics
    searchAnalytics: `${BASE_PATH}/analytics/search-analytics`,

    // Reporting
    dashboard: `${BASE_PATH}/analytics/dashboard`,
    customReport: (id: string) => `${BASE_PATH}/analytics/reports/${id}`,
    reports: `${BASE_PATH}/analytics/reports`,
    export: `${BASE_PATH}/analytics/export`,

    // Real-time Analytics
    realtime: `${BASE_PATH}/analytics/realtime`,

    // Admin Operations
    admin: {
      systemAnalytics: `${BASE_PATH}/admin/analytics/system-analytics`,
      settings: `${BASE_PATH}/admin/analytics/settings`,
      cleanup: `${BASE_PATH}/admin/analytics/cleanup`,
    },
  },

  // Search Endpoints
  search: {
    global: `${BASE_PATH}/search`,
    products: `${BASE_PATH}/search/products`,
    suggestions: `${BASE_PATH}/search/suggestions`,
    autocomplete: `${BASE_PATH}/search/autocomplete`,
    trending: `${BASE_PATH}/search/trending`,
    popular: `${BASE_PATH}/search/popular`,
    filters: `${BASE_PATH}/search/filters`,
  },

  // Notification Endpoints
  notifications: {
    // User Notifications
    list: `${BASE_PATH}/notifications`,
    unread: `${BASE_PATH}/notifications/unread`,
    unreadCount: `${BASE_PATH}/notifications/unread-count`,
    markRead: (id: string) => `${BASE_PATH}/notifications/${id}/read`,
    markAllRead: `${BASE_PATH}/notifications/mark-all-read`,
    delete: (id: string) => `${BASE_PATH}/notifications/${id}`,
    clear: `${BASE_PATH}/notifications/clear`,

    // Notification Preferences
    preferences: `${BASE_PATH}/notifications/preferences`,
    emailPreferences: `${BASE_PATH}/notifications/preferences/email`,
    pushPreferences: `${BASE_PATH}/notifications/preferences/push`,
    smsPreferences: `${BASE_PATH}/notifications/preferences/sms`,

    // Push Notifications
    subscribePush: `${BASE_PATH}/notifications/push/subscribe`,
    unsubscribePush: `${BASE_PATH}/notifications/push/unsubscribe`,
    testPush: `${BASE_PATH}/notifications/push/test`,

    // Newsletter
    subscribeNewsletter: `${BASE_PATH}/notifications/newsletter/subscribe`,
    unsubscribeNewsletter: `${BASE_PATH}/notifications/newsletter/unsubscribe`,
    newsletterPreferences: `${BASE_PATH}/notifications/newsletter/preferences`,
    newsletterCategories: `${BASE_PATH}/notifications/newsletter/categories`,

    // SMS
    verifyPhone: `${BASE_PATH}/notifications/sms/verify-phone`,
    confirmPhone: `${BASE_PATH}/notifications/sms/confirm-phone`,
    removePhone: `${BASE_PATH}/notifications/sms/remove-phone`,

    // History & Analytics
    history: `${BASE_PATH}/notifications/history`,
    analytics: `${BASE_PATH}/notifications/analytics`,

    // Admin Operations
    admin: {
      sendToUser: (userId: string) => `${BASE_PATH}/admin/notifications/send/${userId}`,
      sendBulk: `${BASE_PATH}/admin/notifications/send-bulk`,

      // Email Templates
      templates: `${BASE_PATH}/admin/notifications/templates`,
      templateById: (id: string) => `${BASE_PATH}/admin/notifications/templates/${id}`,

      // Email Campaigns
      campaigns: `${BASE_PATH}/admin/notifications/campaigns`,
      campaignById: (id: string) => `${BASE_PATH}/admin/notifications/campaigns/${id}`,
      sendCampaign: (id: string) => `${BASE_PATH}/admin/notifications/campaigns/${id}/send`,
      pauseCampaign: (id: string) => `${BASE_PATH}/admin/notifications/campaigns/${id}/pause`,
      resumeCampaign: (id: string) => `${BASE_PATH}/admin/notifications/campaigns/${id}/resume`,
      cancelCampaign: (id: string) => `${BASE_PATH}/admin/notifications/campaigns/${id}/cancel`,
      campaignStats: (id: string) => `${BASE_PATH}/admin/notifications/campaigns/${id}/statistics`,

      // System Settings
      systemSettings: `${BASE_PATH}/admin/notifications/system-settings`,
      testSystem: `${BASE_PATH}/admin/notifications/test-system`,
      queueStatus: `${BASE_PATH}/admin/notifications/queue-status`,
      export: `${BASE_PATH}/admin/notifications/export`,
    },
  },

  // Location/Shipping Endpoints
  locations: {
    countries: `${BASE_PATH}/locations/countries`,
    states: (countryCode: string) => `${BASE_PATH}/locations/countries/${countryCode}/states`,
    cities: (stateCode: string) => `${BASE_PATH}/locations/states/${stateCode}/cities`,
    pincode: (pincode: string) => `${BASE_PATH}/locations/pincode/${pincode}`,
    shipping: `${BASE_PATH}/locations/shipping-rates`,
  },

  // Inventory Endpoints
  inventory: {
    // Basic inventory operations
    items: `${BASE_PATH}/inventory/items`,
    itemById: (id: string) => `${BASE_PATH}/inventory/items/${id}`,
    byProduct: (productId: string) => `${BASE_PATH}/inventory/products/${productId}`,
    bySku: (sku: string) => `${BASE_PATH}/inventory/sku/${sku}`,
    create: `${BASE_PATH}/inventory/items`,
    update: (id: string) => `${BASE_PATH}/inventory/items/${id}`,
    delete: (id: string) => `${BASE_PATH}/inventory/items/${id}`,

    // Stock management
    adjustStock: (id: string) => `${BASE_PATH}/inventory/items/${id}/adjust`,
    reserveStock: (id: string) => `${BASE_PATH}/inventory/items/${id}/reserve`,
    releaseStock: (id: string) => `${BASE_PATH}/inventory/items/${id}/release`,
    transfer: `${BASE_PATH}/inventory/transfer`,

    // Stock movements
    movements: `${BASE_PATH}/inventory/movements`,
    movementById: (id: string) => `${BASE_PATH}/inventory/movements/${id}`,

    // Warehouses
    warehouses: `${BASE_PATH}/inventory/warehouses`,
    warehouseById: (id: string) => `${BASE_PATH}/inventory/warehouses/${id}`,
    createWarehouse: `${BASE_PATH}/inventory/warehouses`,
    updateWarehouse: (id: string) => `${BASE_PATH}/inventory/warehouses/${id}`,
    deleteWarehouse: (id: string) => `${BASE_PATH}/inventory/warehouses/${id}`,

    // Alerts & notifications
    alerts: `${BASE_PATH}/inventory/alerts`,
    acknowledgeAlert: (id: string) => `${BASE_PATH}/inventory/alerts/${id}/acknowledge`,
    bulkAcknowledge: `${BASE_PATH}/inventory/alerts/bulk-acknowledge`,

    // Analytics & reports
    statistics: `${BASE_PATH}/inventory/statistics`,
    generateReport: `${BASE_PATH}/inventory/reports`,
    reportById: (id: string) => `${BASE_PATH}/inventory/reports/${id}`,
    turnoverAnalysis: `${BASE_PATH}/inventory/analytics/turnover`,

    // Bulk operations
    bulkUpdate: `${BASE_PATH}/inventory/bulk/update`,
    bulkAdjustment: `${BASE_PATH}/inventory/bulk/adjust`,

    // Legacy endpoints for compatibility
    stock: (productId: string) => `${BASE_PATH}/inventory/products/${productId}/stock`,
    availability: `${BASE_PATH}/inventory/availability`,
    notify: `${BASE_PATH}/inventory/notify-when-available`,
    bulkCheck: `${BASE_PATH}/inventory/bulk-check`,
  },

  // Comparison Endpoints
  compare: {
    products: `${BASE_PATH}/compare/products`,
    add: `${BASE_PATH}/compare/add`,
    remove: (productId: string) => `${BASE_PATH}/compare/remove/${productId}`,
    clear: `${BASE_PATH}/compare/clear`,
  },

  // Recently Viewed Endpoints
  recentlyViewed: {
    list: `${BASE_PATH}/recently-viewed`,
    add: `${BASE_PATH}/recently-viewed/add`,
    clear: `${BASE_PATH}/recently-viewed/clear`,
  },

  // Recommendation Endpoints
  recommendations: {
    forUser: `${BASE_PATH}/recommendations/for-user`,
    forProduct: (productId: string) => `${BASE_PATH}/recommendations/for-product/${productId}`,
    trending: `${BASE_PATH}/recommendations/trending`,
    personalized: `${BASE_PATH}/recommendations/personalized`,
    similar: (productId: string) => `${BASE_PATH}/recommendations/similar/${productId}`,
    collaborative: `${BASE_PATH}/recommendations/collaborative`,
  },

  // Address Endpoints
  addresses: {
    byId: (id: string) => `${BASE_PATH}/addresses/${id}`,
    validate: `${BASE_PATH}/addresses/validate`,
    suggestions: `${BASE_PATH}/addresses/suggestions`,
    fromPlaceId: (placeId: string) => `${BASE_PATH}/addresses/place/${placeId}`,
    distance: `${BASE_PATH}/addresses/distance`,
    shippingZones: (addressId: string) => `${BASE_PATH}/addresses/${addressId}/shipping-zones`,
    serviceability: (addressId: string) => `${BASE_PATH}/addresses/${addressId}/serviceability`,
    landmarks: (addressId: string) => `${BASE_PATH}/addresses/${addressId}/landmarks`,
    bulkValidate: `${BASE_PATH}/addresses/bulk-validate`,
    import: `${BASE_PATH}/addresses/import`,
    export: `${BASE_PATH}/addresses/export`,
    admin: {
      list: `${BASE_PATH}/admin/addresses`,
      update: (id: string) => `${BASE_PATH}/admin/addresses/${id}`,
      delete: (id: string) => `${BASE_PATH}/admin/addresses/${id}`,
      statistics: `${BASE_PATH}/admin/addresses/statistics`,
      bulkUpdate: `${BASE_PATH}/admin/addresses/bulk-update`,
      bulkDelete: `${BASE_PATH}/admin/addresses/bulk-delete`,
    }
  },

  // Shipping Endpoints
  shipping: {
    // Zones
    zones: {
      list: `${BASE_PATH}/shipping/zones`,
      byId: (id: string) => `${BASE_PATH}/shipping/zones/${id}`,
      create: `${BASE_PATH}/shipping/zones`,
      update: (id: string) => `${BASE_PATH}/shipping/zones/${id}`,
      delete: (id: string) => `${BASE_PATH}/shipping/zones/${id}`,
      testCoverage: (id: string) => `${BASE_PATH}/shipping/zones/${id}/test-coverage`,
    },

    // Methods
    methods: {
      list: `${BASE_PATH}/shipping/methods`,
      byId: (id: string) => `${BASE_PATH}/shipping/methods/${id}`,
      create: `${BASE_PATH}/shipping/methods`,
      update: (id: string) => `${BASE_PATH}/shipping/methods/${id}`,
      delete: (id: string) => `${BASE_PATH}/shipping/methods/${id}`,
      bulkUpdate: `${BASE_PATH}/shipping/methods/bulk/update`,
    },

    // Rate Calculation
    calculate: `${BASE_PATH}/shipping/calculate`,
    cheapest: `${BASE_PATH}/shipping/calculate/cheapest`,
    fastest: `${BASE_PATH}/shipping/calculate/fastest`,

    // Carriers
    carriers: {
      list: `${BASE_PATH}/shipping/carriers`,
      byId: (id: string) => `${BASE_PATH}/shipping/carriers/${id}`,
      test: (id: string) => `${BASE_PATH}/shipping/carriers/${id}/test`,
    },

    // Labels
    labels: {
      create: `${BASE_PATH}/shipping/labels`,
      byId: (id: string) => `${BASE_PATH}/shipping/labels/${id}`,
      byOrder: (orderId: string) => `${BASE_PATH}/shipping/labels/order/${orderId}`,
      cancel: (id: string) => `${BASE_PATH}/shipping/labels/${id}/cancel`,
      download: (id: string) => `${BASE_PATH}/shipping/labels/${id}/download`,
      bulkCreate: `${BASE_PATH}/shipping/labels/bulk/create`,
    },

    // Tracking
    tracking: {
      track: (trackingNumber: string) => `${BASE_PATH}/shipping/tracking/${trackingNumber}`,
      batch: `${BASE_PATH}/shipping/tracking/batch`,
      webhook: (trackingNumber: string) => `${BASE_PATH}/shipping/tracking/${trackingNumber}/webhook`,
    },

    // Address Services
    addresses: {
      validate: `${BASE_PATH}/shipping/addresses/validate`,
      suggestions: `${BASE_PATH}/shipping/addresses/suggestions`,
    },

    // Analytics
    analytics: `${BASE_PATH}/shipping/analytics`,
  },

  // CMS Endpoints
  cms: {
    // Pages
    pages: {
      list: `${BASE_PATH}/cms/pages`,
      byId: (id: string) => `${BASE_PATH}/cms/pages/${id}`,
      bySlug: (slug: string) => `${BASE_PATH}/cms/pages/slug/${slug}`,
      create: `${BASE_PATH}/cms/pages`,
      update: (id: string) => `${BASE_PATH}/cms/pages/${id}`,
      delete: (id: string) => `${BASE_PATH}/cms/pages/${id}`,
      publish: (id: string) => `${BASE_PATH}/cms/pages/${id}/publish`,
      unpublish: (id: string) => `${BASE_PATH}/cms/pages/${id}/unpublish`,
      duplicate: (id: string) => `${BASE_PATH}/cms/pages/${id}/duplicate`,
      versions: (id: string) => `${BASE_PATH}/cms/pages/${id}/versions`,
      restore: (id: string) => `${BASE_PATH}/cms/pages/${id}/restore`,
      preview: (id: string) => `${BASE_PATH}/cms/pages/${id}/preview`,
      bulkUpdate: `${BASE_PATH}/cms/pages/bulk/update`,
      bulkDelete: `${BASE_PATH}/cms/pages/bulk/delete`,
    },

    // Blocks
    blocks: {
      list: (pageId: string) => `${BASE_PATH}/cms/pages/${pageId}/blocks`,
      create: (pageId: string) => `${BASE_PATH}/cms/pages/${pageId}/blocks`,
      update: (id: string) => `${BASE_PATH}/cms/blocks/${id}`,
      delete: (id: string) => `${BASE_PATH}/cms/blocks/${id}`,
      reorder: (pageId: string) => `${BASE_PATH}/cms/pages/${pageId}/blocks/reorder`,
      duplicate: (id: string) => `${BASE_PATH}/cms/blocks/${id}/duplicate`,
    },

    // Templates
    templates: {
      list: `${BASE_PATH}/cms/templates`,
      byId: (id: string) => `${BASE_PATH}/cms/templates/${id}`,
      create: `${BASE_PATH}/cms/templates`,
      update: (id: string) => `${BASE_PATH}/cms/templates/${id}`,
      delete: (id: string) => `${BASE_PATH}/cms/templates/${id}`,
      createPage: (id: string) => `${BASE_PATH}/cms/templates/${id}/create-page`,
    },

    // Menus
    menus: {
      list: `${BASE_PATH}/cms/menus`,
      byId: (id: string) => `${BASE_PATH}/cms/menus/${id}`,
      byLocation: (location: string) => `${BASE_PATH}/cms/menus/location/${location}`,
      create: `${BASE_PATH}/cms/menus`,
      update: (id: string) => `${BASE_PATH}/cms/menus/${id}`,
      delete: (id: string) => `${BASE_PATH}/cms/menus/${id}`,
      items: {
        create: (menuId: string) => `${BASE_PATH}/cms/menus/${menuId}/items`,
        update: (id: string) => `${BASE_PATH}/cms/menu-items/${id}`,
        delete: (id: string) => `${BASE_PATH}/cms/menu-items/${id}`,
        reorder: (menuId: string) => `${BASE_PATH}/cms/menus/${menuId}/items/reorder`,
      },
    },

    // Widgets
    widgets: {
      list: `${BASE_PATH}/cms/widgets`,
      byId: (id: string) => `${BASE_PATH}/cms/widgets/${id}`,
      create: `${BASE_PATH}/cms/widgets`,
      update: (id: string) => `${BASE_PATH}/cms/widgets/${id}`,
      delete: (id: string) => `${BASE_PATH}/cms/widgets/${id}`,
      reorder: (area: string) => `${BASE_PATH}/cms/widgets/area/${area}/reorder`,
    },

    // Media
    media: {
      list: `${BASE_PATH}/cms/media`,
      upload: `${BASE_PATH}/cms/media/upload`,
      delete: (id: string) => `${BASE_PATH}/cms/media/${id}`,
    },

    // Settings
    settings: {
      get: `${BASE_PATH}/cms/settings`,
      update: `${BASE_PATH}/cms/settings`,
    },

    // Analytics
    analytics: {
      content: `${BASE_PATH}/cms/analytics/content`,
    },

    // SEO
    seo: {
      generateSitemap: `${BASE_PATH}/cms/seo/sitemap/generate`,
      updateRobots: `${BASE_PATH}/cms/seo/robots`,
      audit: `${BASE_PATH}/cms/seo/audit`,
    },
  },

  // Announcement Endpoints
  announcements: {
    list: `${BASE_PATH}/announcements`,
    byId: (id: string) => `${BASE_PATH}/announcements/${id}`,
    active: `${BASE_PATH}/announcements/active`,
    create: `${BASE_PATH}/announcements`,
    update: (id: string) => `${BASE_PATH}/announcements/${id}`,
    delete: (id: string) => `${BASE_PATH}/announcements/${id}`,
    duplicate: (id: string) => `${BASE_PATH}/announcements/${id}/duplicate`,
    bulkUpdate: `${BASE_PATH}/announcements/bulk/update`,
    bulkDelete: `${BASE_PATH}/announcements/bulk/delete`,
    reorder: `${BASE_PATH}/announcements/reorder`,
    toggleStatus: (id: string) => `${BASE_PATH}/announcements/${id}/toggle-status`,
    activate: (id: string) => `${BASE_PATH}/announcements/${id}/activate`,
    deactivate: (id: string) => `${BASE_PATH}/announcements/${id}/deactivate`,
    schedule: (id: string) => `${BASE_PATH}/announcements/${id}/schedule`,
    extend: (id: string) => `${BASE_PATH}/announcements/${id}/extend`,
    analytics: `${BASE_PATH}/announcements/analytics`,
    stats: (id: string) => `${BASE_PATH}/announcements/${id}/stats`,
    trackClick: (id: string) => `${BASE_PATH}/announcements/${id}/track/click`,
    trackDismissal: (id: string) => `${BASE_PATH}/announcements/${id}/track/dismissal`,
    trackImpression: (id: string) => `${BASE_PATH}/announcements/${id}/track/impression`,
    templates: `${BASE_PATH}/announcements/templates`,
    createFromTemplate: (templateId: string) => `${BASE_PATH}/announcements/templates/${templateId}/create`,
    export: `${BASE_PATH}/announcements/export`,
    import: `${BASE_PATH}/announcements/import`,
    preview: `${BASE_PATH}/announcements/preview`,
    test: (id: string) => `${BASE_PATH}/announcements/${id}/test`,
  },

  // SEO Endpoints
  seo: {
    // Settings
    settings: {
      get: `${BASE_PATH}/seo/settings`,
      update: `${BASE_PATH}/seo/settings`,
    },

    // Pages SEO
    pages: {
      list: `${BASE_PATH}/seo/pages`,
      byId: (id: string) => `${BASE_PATH}/seo/pages/${id}`,
      byPage: (pageId: string) => `${BASE_PATH}/seo/pages/page/${pageId}`,
      create: `${BASE_PATH}/seo/pages`,
      update: (id: string) => `${BASE_PATH}/seo/pages/${id}`,
      delete: (id: string) => `${BASE_PATH}/seo/pages/${id}`,
      bulkUpdate: `${BASE_PATH}/seo/pages/bulk/update`,
      generate: (pageId: string) => `${BASE_PATH}/seo/pages/generate/${pageId}`,
    },

    // Sitemaps
    sitemaps: {
      list: `${BASE_PATH}/seo/sitemaps`,
      byId: (id: string) => `${BASE_PATH}/seo/sitemaps/${id}`,
      generate: `${BASE_PATH}/seo/sitemaps/generate`,
      update: (id: string) => `${BASE_PATH}/seo/sitemaps/${id}`,
      delete: (id: string) => `${BASE_PATH}/seo/sitemaps/${id}`,
      download: (id: string) => `${BASE_PATH}/seo/sitemaps/${id}/download`,
      validate: (id: string) => `${BASE_PATH}/seo/sitemaps/${id}/validate`,
      submit: (id: string) => `${BASE_PATH}/seo/sitemaps/${id}/submit`,
    },

    // Robots.txt
    robots: {
      get: `${BASE_PATH}/seo/robots`,
      update: `${BASE_PATH}/seo/robots`,
      validate: `${BASE_PATH}/seo/robots/validate`,
      test: `${BASE_PATH}/seo/robots/test`,
    },

    // Audits
    audits: {
      list: `${BASE_PATH}/seo/audits`,
      byId: (id: string) => `${BASE_PATH}/seo/audits/${id}`,
      create: `${BASE_PATH}/seo/audits`,
      bulk: `${BASE_PATH}/seo/audits/bulk`,
      delete: (id: string) => `${BASE_PATH}/seo/audits/${id}`,
      export: (id: string) => `${BASE_PATH}/seo/audits/${id}/export`,
    },

    // Schema Markup
    schema: {
      list: `${BASE_PATH}/seo/schema`,
      byId: (id: string) => `${BASE_PATH}/seo/schema/${id}`,
      create: `${BASE_PATH}/seo/schema`,
      update: (id: string) => `${BASE_PATH}/seo/schema/${id}`,
      delete: (id: string) => `${BASE_PATH}/seo/schema/${id}`,
      validate: (id: string) => `${BASE_PATH}/seo/schema/${id}/validate`,
      generate: `${BASE_PATH}/seo/schema/generate`,
    },

    // Meta Tags
    meta: {
      list: `${BASE_PATH}/seo/meta`,
      byId: (id: string) => `${BASE_PATH}/seo/meta/${id}`,
      create: `${BASE_PATH}/seo/meta`,
      update: (id: string) => `${BASE_PATH}/seo/meta/${id}`,
      delete: (id: string) => `${BASE_PATH}/seo/meta/${id}`,
      bulkCreate: `${BASE_PATH}/seo/meta/bulk/create`,
    },

    // Redirects
    redirects: {
      list: `${BASE_PATH}/seo/redirects`,
      byId: (id: string) => `${BASE_PATH}/seo/redirects/${id}`,
      create: `${BASE_PATH}/seo/redirects`,
      update: (id: string) => `${BASE_PATH}/seo/redirects/${id}`,
      delete: (id: string) => `${BASE_PATH}/seo/redirects/${id}`,
      test: (id: string) => `${BASE_PATH}/seo/redirects/${id}/test`,
      bulkCreate: `${BASE_PATH}/seo/redirects/bulk/create`,
      import: `${BASE_PATH}/seo/redirects/import`,
    },

    // Analytics
    analytics: {
      overview: `${BASE_PATH}/seo/analytics/overview`,
      keywords: `${BASE_PATH}/seo/analytics/keywords`,
      backlinks: `${BASE_PATH}/seo/analytics/backlinks`,
      competitors: (domain: string) => `${BASE_PATH}/seo/analytics/competitors/${domain}`,
    },

    // Tools
    tools: {
      keywords: `${BASE_PATH}/seo/tools/keywords/analyze`,
      brokenLinks: `${BASE_PATH}/seo/tools/broken-links`,
      pageSpeed: `${BASE_PATH}/seo/tools/page-speed`,
      serpFeatures: `${BASE_PATH}/seo/tools/serp-features`,
      contentIdeas: `${BASE_PATH}/seo/tools/content-ideas`,
    },
  },

  // Bestsellers
  bestsellers: {
    list: `${BASE_PATH}/bestsellers`,
    byId: (id: string) => `${BASE_PATH}/bestsellers/${id}`,
    byPeriod: (period: string) => `${BASE_PATH}/bestsellers/period/${period}`,
    active: `${BASE_PATH}/bestsellers/active`,
    create: `${BASE_PATH}/bestsellers`,
    update: (id: string) => `${BASE_PATH}/bestsellers/${id}`,
    delete: (id: string) => `${BASE_PATH}/bestsellers/${id}`,

    // Bulk operations
    bulkCreate: `${BASE_PATH}/bestsellers/bulk`,
    bulkUpdate: `${BASE_PATH}/bestsellers/bulk/update`,
    bulkDelete: `${BASE_PATH}/bestsellers/bulk/delete`,
    reorder: `${BASE_PATH}/bestsellers/reorder`,

    // Status management
    toggleStatus: (id: string) => `${BASE_PATH}/bestsellers/${id}/toggle-status`,
    activate: (id: string) => `${BASE_PATH}/bestsellers/${id}/activate`,
    deactivate: (id: string) => `${BASE_PATH}/bestsellers/${id}/deactivate`,

    // Analytics and reports
    analytics: `${BASE_PATH}/bestsellers/analytics`,
    report: `${BASE_PATH}/bestsellers/report`,
    trends: `${BASE_PATH}/bestsellers/trends`,

    // Automatic management
    generate: `${BASE_PATH}/bestsellers/generate`,
    refresh: `${BASE_PATH}/bestsellers/refresh`,
    syncSales: `${BASE_PATH}/bestsellers/sync-sales`,

    // Product operations
    addProduct: (productId: string) => `${BASE_PATH}/bestsellers/products/${productId}`,
    removeProduct: (productId: string) => `${BASE_PATH}/bestsellers/products/${productId}`,
    productStatus: (productId: string) => `${BASE_PATH}/bestsellers/products/${productId}/status`,

    // Category and brand operations
    byCategory: (categoryId: string) => `${BASE_PATH}/bestsellers/categories/${categoryId}`,
    byBrand: (brandId: string) => `${BASE_PATH}/bestsellers/brands/${brandId}`,

    // Export/Import
    export: `${BASE_PATH}/bestsellers/export`,
    import: `${BASE_PATH}/bestsellers/import`,

    // Settings
    settings: `${BASE_PATH}/bestsellers/settings`,
  },

  // Favorite Sections Endpoints
  favoriteSections: {
    // Basic CRUD Operations
    list: `${BASE_PATH}/favorite-sections`,
    create: `${BASE_PATH}/favorite-sections`,
    byId: (id: string) => `${BASE_PATH}/favorite-sections/${id}`,
    update: (id: string) => `${BASE_PATH}/favorite-sections/${id}`,
    delete: (id: string) => `${BASE_PATH}/favorite-sections/${id}`,

    // Template Operations
    templates: `${BASE_PATH}/favorite-sections/templates`,
    template: (id: string) => `${BASE_PATH}/favorite-sections/templates/${id}`,
    createFromTemplate: (templateId: string) => `${BASE_PATH}/favorite-sections/templates/${templateId}/create`,
    saveAsTemplate: (sectionId: string) => `${BASE_PATH}/favorite-sections/${sectionId}/save-as-template`,

    // Publishing and Status
    publish: (id: string) => `${BASE_PATH}/favorite-sections/${id}/publish`,
    unpublish: (id: string) => `${BASE_PATH}/favorite-sections/${id}/unpublish`,
    archive: (id: string) => `${BASE_PATH}/favorite-sections/${id}/archive`,
    duplicate: (id: string) => `${BASE_PATH}/favorite-sections/${id}/duplicate`,

    // Analytics
    analytics: (id: string) => `${BASE_PATH}/favorite-sections/${id}/analytics`,
    analyticsReport: `${BASE_PATH}/favorite-sections/analytics/report`,

    // A/B Testing
    createAbTest: (sectionId: string) => `${BASE_PATH}/favorite-sections/${sectionId}/ab-test`,
    abTestResults: (sectionId: string) => `${BASE_PATH}/favorite-sections/${sectionId}/ab-test/results`,
    endAbTest: (sectionId: string) => `${BASE_PATH}/favorite-sections/${sectionId}/ab-test/end`,

    // Bulk Operations
    bulk: `${BASE_PATH}/favorite-sections/bulk`,

    // Import/Export
    export: `${BASE_PATH}/favorite-sections/export`,
    import: `${BASE_PATH}/favorite-sections/import`,

    // Search and Content
    search: `${BASE_PATH}/favorite-sections/search`,
    updateContent: (sectionId: string) => `${BASE_PATH}/favorite-sections/${sectionId}/content`,
    refreshContent: (sectionId: string) => `${BASE_PATH}/favorite-sections/${sectionId}/refresh`,

    // Preview and Validation
    preview: (sectionId: string) => `${BASE_PATH}/favorite-sections/${sectionId}/preview`,
    validate: `${BASE_PATH}/favorite-sections/validate`,
  },

  // Footer Logos Endpoints
  footerLogos: {
    // Basic CRUD Operations
    list: `${BASE_PATH}/footer-logos`,
    create: `${BASE_PATH}/footer-logos`,
    byId: (id: string) => `${BASE_PATH}/footer-logos/${id}`,
    update: (id: string) => `${BASE_PATH}/footer-logos/${id}`,
    delete: (id: string) => `${BASE_PATH}/footer-logos/${id}`,

    // Upload and Processing
    upload: `${BASE_PATH}/footer-logos/upload`,
    generateVariants: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/variants`,
    optimize: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/optimize`,

    // Template Operations
    templates: `${BASE_PATH}/footer-logos/templates`,
    template: (id: string) => `${BASE_PATH}/footer-logos/templates/${id}`,
    createFromTemplate: (templateId: string) => `${BASE_PATH}/footer-logos/templates/${templateId}/create`,
    saveAsTemplate: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/save-as-template`,

    // Publishing and Status
    publish: (id: string) => `${BASE_PATH}/footer-logos/${id}/publish`,
    unpublish: (id: string) => `${BASE_PATH}/footer-logos/${id}/unpublish`,
    archive: (id: string) => `${BASE_PATH}/footer-logos/${id}/archive`,
    duplicate: (id: string) => `${BASE_PATH}/footer-logos/${id}/duplicate`,

    // Analytics and Reporting
    analytics: (id: string) => `${BASE_PATH}/footer-logos/${id}/analytics`,
    analyticsReport: `${BASE_PATH}/footer-logos/analytics/report`,

    // Approval Workflow
    submitForApproval: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/submit-approval`,
    approve: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/approve`,
    reject: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/reject`,

    // A/B Testing
    createAbTest: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/ab-test`,
    abTestResults: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/ab-test/results`,
    endAbTest: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/ab-test/end`,

    // Usage Tracking
    trackUsage: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/track-usage`,
    usageReport: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/usage-report`,

    // Bulk Operations
    bulk: `${BASE_PATH}/footer-logos/bulk`,

    // Import/Export
    export: `${BASE_PATH}/footer-logos/export`,
    import: `${BASE_PATH}/footer-logos/import`,

    // Search and Versioning
    search: `${BASE_PATH}/footer-logos/search`,
    versions: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/versions`,
    revertVersion: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/revert`,

    // Preview and Validation
    preview: (logoId: string) => `${BASE_PATH}/footer-logos/${logoId}/preview`,
    validate: `${BASE_PATH}/footer-logos/validate`,
  },

  // Header Logos Endpoints
  headerLogos: {
    // Basic CRUD Operations
    list: `${BASE_PATH}/header-logos`,
    create: `${BASE_PATH}/header-logos`,
    byId: (id: string) => `${BASE_PATH}/header-logos/${id}`,
    update: (id: string) => `${BASE_PATH}/header-logos/${id}`,
    delete: (id: string) => `${BASE_PATH}/header-logos/${id}`,

    // Upload and Processing
    upload: `${BASE_PATH}/header-logos/upload`,
    generateVariants: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/variants`,
    optimize: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/optimize`,

    // Template Operations
    templates: `${BASE_PATH}/header-logos/templates`,
    template: (id: string) => `${BASE_PATH}/header-logos/templates/${id}`,
    createFromTemplate: (templateId: string) => `${BASE_PATH}/header-logos/templates/${templateId}/create`,
    saveAsTemplate: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/save-as-template`,

    // Publishing and Status
    publish: (id: string) => `${BASE_PATH}/header-logos/${id}/publish`,
    unpublish: (id: string) => `${BASE_PATH}/header-logos/${id}/unpublish`,
    archive: (id: string) => `${BASE_PATH}/header-logos/${id}/archive`,
    duplicate: (id: string) => `${BASE_PATH}/header-logos/${id}/duplicate`,

    // Analytics and Reporting
    analytics: (id: string) => `${BASE_PATH}/header-logos/${id}/analytics`,
    analyticsReport: `${BASE_PATH}/header-logos/analytics/report`,

    // Review Workflow
    submitForReview: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/submit-review`,
    approve: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/approve`,
    reject: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/reject`,

    // A/B Testing
    createAbTest: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/ab-test`,
    abTestResults: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/ab-test/results`,
    endAbTest: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/ab-test/end`,

    // Interaction Tracking
    trackInteraction: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/track-interaction`,
    usageAnalysis: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/usage-analysis`,

    // Bulk Operations
    bulk: `${BASE_PATH}/header-logos/bulk`,

    // Import/Export
    export: `${BASE_PATH}/header-logos/export`,
    import: `${BASE_PATH}/header-logos/import`,

    // Search and Versioning
    search: `${BASE_PATH}/header-logos/search`,
    versions: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/versions`,
    revertVersion: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/revert`,
    createBranch: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/branch`,

    // Preview and Validation
    preview: (logoId: string) => `${BASE_PATH}/header-logos/${logoId}/preview`,
    validate: `${BASE_PATH}/header-logos/validate`,
  },

  // Health Check
  health: {
    check: `${BASE_PATH}/health`,
    status: `${BASE_PATH}/health/status`,
    database: `${BASE_PATH}/health/database`,
    cache: `${BASE_PATH}/health/cache`,
  },
} as const;

// Export individual endpoint groups for convenience
export const authEndpoints = endpoints.auth;
export const userEndpoints = endpoints.users;
export const productEndpoints = endpoints.products;
export const categoryEndpoints = endpoints.categories;
export const brandEndpoints = endpoints.brands;
export const cartEndpoints = endpoints.cart;
export const wishlistEndpoints = endpoints.wishlist;
export const orderEndpoints = endpoints.orders;
export const paymentEndpoints = endpoints.payments;
export const reviewEndpoints = endpoints.reviews;
export const blogEndpoints = endpoints.blog;
export const contactEndpoints = endpoints.contact;
export const siteEndpoints = endpoints.site;
export const addressEndpoints = endpoints.addresses;
export const notificationEndpoints = endpoints.notifications;
export const analyticsEndpoints = endpoints.analytics;
export const seoEndpoints = endpoints.seo;
export const bestsellerEndpoints = endpoints.bestsellers;
export const favoriteSectionsEndpoints = endpoints.favoriteSections;
export const footerLogosEndpoints = endpoints.footerLogos;
export const headerLogosEndpoints = endpoints.headerLogos;

// Helper function to build URLs with query parameters
export const buildUrl = (endpoint: string, params?: Record<string, string | number | boolean | undefined>): string => {
  if (!params) return endpoint;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

// Helper function to replace path parameters
export const buildPath = (path: string, params: Record<string, string | number>): string => {
  let result = path;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  return result;
};

export default endpoints;
