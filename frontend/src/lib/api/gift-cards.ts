import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { httpClient } from './client';
import { endpoints } from './endpoints';
import { ApiResponse, PaginationParams } from './types';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==================== Gift Card Management System ====================

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  originalAmount: number;
  currency: string;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled' | 'pending';
  type: 'digital' | 'physical' | 'virtual';
  category: 'birthday' | 'anniversary' | 'holiday' | 'corporate' | 'wedding' | 'general';
  issuedTo?: {
    name: string;
    email: string;
    phone?: string;
  };
  issuedBy?: {
    name: string;
    email: string;
    userId?: string;
  };
  recipient?: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  };
  design?: {
    templateId: string;
    theme: string;
    image?: string;
    customMessage?: string;
    colors?: {
      primary: string;
      secondary: string;
      text: string;
    };
  };
  deliveryMethod: 'email' | 'sms' | 'postal' | 'pickup' | 'instant';
  deliveryDate?: Date;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  expiryDate?: Date;
  isRefundable: boolean;
  isTransferable: boolean;
  restrictions?: {
    minOrderValue?: number;
    maxDiscount?: number;
    applicableCategories?: string[];
    excludedCategories?: string[];
    applicableProducts?: string[];
    excludedProducts?: string[];
    usageLimit?: number;
    usageCount?: number;
    validDays?: number[];
    validHours?: { start: string; end: string };
  };
  terms?: string[];
  purchaseOrder?: {
    orderId: string;
    paymentId: string;
    purchaseDate: Date;
    paymentMethod: string;
  };
  usageHistory?: GiftCardUsage[];
  notifications?: {
    emailSent: boolean;
    smsSent: boolean;
    remindersSent: number;
    lastReminderDate?: Date;
  };
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface GiftCardUsage {
  id: string;
  orderId: string;
  amount: number;
  remainingBalance: number;
  usedAt: Date;
  description?: string;
  refunded?: boolean;
  refundAmount?: number;
  refundedAt?: Date;
}

export interface GiftCardTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: 'standard' | 'premium' | 'custom';
  design: {
    image: string;
    thumbnail: string;
    colors: {
      primary: string;
      secondary: string;
      text: string;
      background: string;
    };
    layout: 'portrait' | 'landscape' | 'square';
    style: 'modern' | 'classic' | 'elegant' | 'festive' | 'corporate';
  };
  customizable: boolean;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GiftCardBulkOrder {
  id: string;
  orderNumber: string;
  quantity: number;
  amount: number;
  totalValue: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  type: 'bulk_purchase' | 'corporate_order' | 'promotional';
  requestedBy: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
  };
  specifications: {
    templateId?: string;
    customDesign?: boolean;
    deliveryMethod: string;
    deliveryDate?: Date;
    expiryPeriod?: number;
    customMessage?: string;
  };
  giftCards?: string[];
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentDetails?: {
    method: string;
    transactionId: string;
    paidAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface GiftCardCampaign {
  id: string;
  name: string;
  description?: string;
  type: 'promotional' | 'seasonal' | 'loyalty' | 'referral' | 'corporate';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  budget?: number;
  spent?: number;
  targetAudience?: {
    userSegments?: string[];
    countries?: string[];
    ageGroups?: string[];
    spendingTiers?: string[];
  };
  rules: {
    triggerCondition: 'purchase' | 'signup' | 'referral' | 'birthday' | 'manual';
    minPurchaseAmount?: number;
    applicableCategories?: string[];
    eligibilityRules?: string[];
  };
  rewards: {
    giftCardAmount: number;
    templateId?: string;
    expiryDays?: number;
    restrictions?: Record<string, unknown>;
  };
  performance: {
    totalIssued: number;
    totalRedeemed: number;
    redemptionRate: number;
    averageUsageTime: number;
    totalRevenue: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface GiftCardAnalytics {
  totalIssued: number;
  totalValue: number;
  totalRedeemed: number;
  redeemedValue: number;
  redemptionRate: number;
  averageValue: number;
  activeCards: number;
  expiredCards: number;
  cancelledCards: number;
  outstandingLiability: number;
  revenueGenerated: number;
  conversionRate: number;
  popularTemplates: {
    templateId: string;
    name: string;
    usageCount: number;
    totalValue: number;
  }[];
  salesByCategory: {
    category: string;
    count: number;
    value: number;
    percentage: number;
  }[];
  salesByMonth: {
    month: string;
    issued: number;
    redeemed: number;
    value: number;
  }[];
  expiryAnalysis: {
    expiring30Days: number;
    expiring60Days: number;
    expiring90Days: number;
    expired: number;
  };
  deliveryMethodStats: {
    method: string;
    count: number;
    successRate: number;
  }[];
}

export interface GiftCardListParams extends PaginationParams {
  search?: string;
  status?: string;
  type?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  issuedBy?: string;
  startDate?: string;
  endDate?: string;
  expiryStatus?: 'active' | 'expiring' | 'expired';
  sortBy?: 'created' | 'amount' | 'expiry' | 'usage';
  sortOrder?: 'asc' | 'desc';
}

export interface GiftCardCreateRequest {
  amount: number;
  currency?: string;
  type: 'digital' | 'physical' | 'virtual';
  category: string;
  recipient?: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  };
  design?: {
    templateId: string;
    customMessage?: string;
    colors?: Record<string, string>;
  };
  deliveryMethod: string;
  deliveryDate?: Date;
  expiryDate?: Date;
  restrictions?: Record<string, unknown>;
  isRefundable?: boolean;
  isTransferable?: boolean;
}

export interface GiftCardBulkCreateRequest {
  quantity: number;
  amount: number;
  type: string;
  category: string;
  templateId?: string;
  expiryDays?: number;
  deliveryMethod: string;
  restrictions?: Record<string, unknown>;
  customMessage?: string;
}

// ==================== Gift Card API Service ====================

class GiftCardApi {
  // Basic CRUD Operations
  async getGiftCards(params?: GiftCardListParams) {
    const response = await httpClient.get<ApiResponse<{ items: GiftCard[]; pagination: PaginationInfo }>>(
      endpoints.giftCards.list,
      { params }
    );
    return response.data;
  }

  async getGiftCardById(id: string) {
    const response = await httpClient.get<ApiResponse<GiftCard>>(
      endpoints.giftCards.byId(id)
    );
    return response.data;
  }

  async getGiftCardByCode(code: string) {
    const response = await httpClient.get<ApiResponse<GiftCard>>(
      endpoints.giftCards.byCode(code)
    );
    return response.data;
  }

  async createGiftCard(data: GiftCardCreateRequest) {
    const response = await httpClient.post<ApiResponse<GiftCard>>(
      endpoints.giftCards.create,
      data
    );
    return response.data;
  }

  async updateGiftCard(id: string, data: Partial<GiftCard>) {
    const response = await httpClient.put<ApiResponse<GiftCard>>(
      endpoints.giftCards.update(id),
      data
    );
    return response.data;
  }

  async deleteGiftCard(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.giftCards.delete(id)
    );
    return response.data;
  }

  async duplicateGiftCard(id: string, data?: { amount?: number; recipient?: GiftCard['recipient'] }) {
    const response = await httpClient.post<ApiResponse<GiftCard>>(
      endpoints.giftCards.duplicate(id),
      data
    );
    return response.data;
  }

  // Status Management
  async activateGiftCard(id: string) {
    const response = await httpClient.patch<ApiResponse<GiftCard>>(
      endpoints.giftCards.activate(id)
    );
    return response.data;
  }

  async deactivateGiftCard(id: string, reason?: string) {
    const response = await httpClient.patch<ApiResponse<GiftCard>>(
      endpoints.giftCards.deactivate(id),
      { reason }
    );
    return response.data;
  }

  async cancelGiftCard(id: string, reason: string) {
    const response = await httpClient.patch<ApiResponse<GiftCard>>(
      endpoints.giftCards.cancel(id),
      { reason }
    );
    return response.data;
  }

  async suspendGiftCard(id: string, reason: string) {
    const response = await httpClient.patch<ApiResponse<GiftCard>>(
      endpoints.giftCards.suspend(id),
      { reason }
    );
    return response.data;
  }

  // Balance Management
  async checkBalance(code: string) {
    const response = await httpClient.get<ApiResponse<{ balance: number; status: string }>>(
      endpoints.giftCards.balance(code)
    );
    return response.data;
  }

  async addBalance(id: string, amount: number, reason?: string) {
    const response = await httpClient.patch<ApiResponse<GiftCard>>(
      endpoints.giftCards.addBalance(id),
      { amount, reason }
    );
    return response.data;
  }

  async deductBalance(id: string, amount: number, orderId?: string) {
    const response = await httpClient.patch<ApiResponse<GiftCard>>(
      endpoints.giftCards.deductBalance(id),
      { amount, orderId }
    );
    return response.data;
  }

  async refundUsage(id: string, usageId: string, amount?: number) {
    const response = await httpClient.post<ApiResponse<GiftCard>>(
      endpoints.giftCards.refund(id),
      { usageId, amount }
    );
    return response.data;
  }

  // Usage & Redemption
  async redeemGiftCard(code: string, data: {
    amount: number;
    orderId: string;
    description?: string;
  }) {
    const response = await httpClient.post<ApiResponse<{
      success: boolean;
      giftCard: GiftCard;
      remainingBalance: number;
    }>>(endpoints.giftCards.redeem, { code, ...data });
    return response.data;
  }

  async getUsageHistory(id: string, params?: { page?: number; limit?: number }) {
    const response = await httpClient.get<ApiResponse<{ items: GiftCardUsage[]; pagination: PaginationInfo }>>(
      endpoints.giftCards.usageHistory(id),
      { params }
    );
    return response.data;
  }

  async validateGiftCard(code: string, orderAmount?: number) {
    const response = await httpClient.post<ApiResponse<{
      valid: boolean;
      giftCard?: GiftCard;
      applicableAmount?: number;
      errors?: string[];
    }>>(endpoints.giftCards.validate, { code, orderAmount });
    return response.data;
  }

  // Templates
  async getTemplates(params?: {
    category?: string;
    type?: string;
    isActive?: boolean;
    isPublic?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<{ items: GiftCardTemplate[]; pagination: PaginationInfo }>>(
      endpoints.giftCards.templates.list,
      { params }
    );
    return response.data;
  }

  async getTemplateById(id: string) {
    const response = await httpClient.get<ApiResponse<GiftCardTemplate>>(
      endpoints.giftCards.templates.byId(id)
    );
    return response.data;
  }

  async createTemplate(data: Partial<GiftCardTemplate>) {
    const response = await httpClient.post<ApiResponse<GiftCardTemplate>>(
      endpoints.giftCards.templates.create,
      data
    );
    return response.data;
  }

  async updateTemplate(id: string, data: Partial<GiftCardTemplate>) {
    const response = await httpClient.put<ApiResponse<GiftCardTemplate>>(
      endpoints.giftCards.templates.update(id),
      data
    );
    return response.data;
  }

  async deleteTemplate(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.giftCards.templates.delete(id)
    );
    return response.data;
  }

  async duplicateTemplate(id: string, data?: { name?: string }) {
    const response = await httpClient.post<ApiResponse<GiftCardTemplate>>(
      endpoints.giftCards.templates.duplicate(id),
      data
    );
    return response.data;
  }

  // Bulk Operations
  async bulkCreateGiftCards(data: GiftCardBulkCreateRequest) {
    const response = await httpClient.post<ApiResponse<{
      bulkOrderId: string;
      giftCards: GiftCard[];
      totalValue: number;
    }>>(endpoints.giftCards.bulkCreate, data);
    return response.data;
  }

  async getBulkOrders(params?: {
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await httpClient.get<ApiResponse<{ items: GiftCardBulkOrder[]; pagination: PaginationInfo }>>(
      endpoints.giftCards.bulkOrders,
      { params }
    );
    return response.data;
  }

  async getBulkOrderById(id: string) {
    const response = await httpClient.get<ApiResponse<GiftCardBulkOrder>>(
      endpoints.giftCards.bulkOrder(id)
    );
    return response.data;
  }

  async updateBulkOrder(id: string, data: Partial<GiftCardBulkOrder>) {
    const response = await httpClient.put<ApiResponse<GiftCardBulkOrder>>(
      endpoints.giftCards.updateBulkOrder(id),
      data
    );
    return response.data;
  }

  async cancelBulkOrder(id: string, reason: string) {
    const response = await httpClient.patch<ApiResponse<GiftCardBulkOrder>>(
      endpoints.giftCards.cancelBulkOrder(id),
      { reason }
    );
    return response.data;
  }

  async processBulkOrder(id: string) {
    const response = await httpClient.post<ApiResponse<{
      giftCards: GiftCard[];
      totalProcessed: number;
    }>>(endpoints.giftCards.processBulkOrder(id));
    return response.data;
  }

  // Delivery & Notifications
  async sendGiftCard(id: string, data?: {
    method?: string;
    recipient?: GiftCard['recipient'];
    customMessage?: string;
    scheduleDate?: Date;
  }) {
    const response = await httpClient.post<ApiResponse<{
      sent: boolean;
      deliveryId: string;
      scheduledFor?: Date;
    }>>(endpoints.giftCards.send(id), data);
    return response.data;
  }

  async resendGiftCard(id: string, method?: string) {
    const response = await httpClient.post<ApiResponse<{
      sent: boolean;
      deliveryId: string;
    }>>(endpoints.giftCards.resend(id), { method });
    return response.data;
  }

  async getDeliveryStatus(id: string) {
    const response = await httpClient.get<ApiResponse<{
      status: string;
      deliveryMethod: string;
      sentAt?: Date;
      deliveredAt?: Date;
      failureReason?: string;
      attempts: number;
    }>>(endpoints.giftCards.deliveryStatus(id));
    return response.data;
  }

  async scheduleReminder(id: string, data: {
    type: 'expiry' | 'unused' | 'balance';
    sendDate: Date;
    message?: string;
  }) {
    const response = await httpClient.post<ApiResponse<{
      scheduled: boolean;
      reminderId: string;
    }>>(endpoints.giftCards.scheduleReminder(id), data);
    return response.data;
  }

  // Campaigns
  async getCampaigns(params?: {
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await httpClient.get<ApiResponse<{ items: GiftCardCampaign[]; pagination: PaginationInfo }>>(
      endpoints.giftCards.campaigns.list,
      { params }
    );
    return response.data;
  }

  async getCampaignById(id: string) {
    const response = await httpClient.get<ApiResponse<GiftCardCampaign>>(
      endpoints.giftCards.campaigns.byId(id)
    );
    return response.data;
  }

  async createCampaign(data: Partial<GiftCardCampaign>) {
    const response = await httpClient.post<ApiResponse<GiftCardCampaign>>(
      endpoints.giftCards.campaigns.create,
      data
    );
    return response.data;
  }

  async updateCampaign(id: string, data: Partial<GiftCardCampaign>) {
    const response = await httpClient.put<ApiResponse<GiftCardCampaign>>(
      endpoints.giftCards.campaigns.update(id),
      data
    );
    return response.data;
  }

  async deleteCampaign(id: string) {
    const response = await httpClient.delete<ApiResponse<void>>(
      endpoints.giftCards.campaigns.delete(id)
    );
    return response.data;
  }

  async activateCampaign(id: string) {
    const response = await httpClient.patch<ApiResponse<GiftCardCampaign>>(
      endpoints.giftCards.campaigns.activate(id)
    );
    return response.data;
  }

  async pauseCampaign(id: string) {
    const response = await httpClient.patch<ApiResponse<GiftCardCampaign>>(
      endpoints.giftCards.campaigns.pause(id)
    );
    return response.data;
  }

  async completeCampaign(id: string) {
    const response = await httpClient.patch<ApiResponse<GiftCardCampaign>>(
      endpoints.giftCards.campaigns.complete(id)
    );
    return response.data;
  }

  // Analytics & Reports
  async getAnalytics(period?: string, filters?: {
    type?: string;
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await httpClient.get<ApiResponse<GiftCardAnalytics>>(
      endpoints.giftCards.analytics,
      { params: { period, ...filters } }
    );
    return response.data;
  }

  async getExpiryReport(params?: {
    days?: number;
    category?: string;
    minAmount?: number;
    includeNotified?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<{
      expiring: GiftCard[];
      totalValue: number;
      notificationsSent: number;
    }>>(endpoints.giftCards.expiryReport, { params });
    return response.data;
  }

  async getUsageReport(params?: {
    period?: string;
    category?: string;
    type?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    const response = await httpClient.get<ApiResponse<{
      usage: Array<{ date: string; count: number; amount: number }>;
      totalRedeemed: number;
      averageUsageTime: number;
    }>>(endpoints.giftCards.usageReport, { params });
    return response.data;
  }

  async getRevenueReport(params?: {
    period?: string;
    category?: string;
    includeProjections?: boolean;
  }) {
    const response = await httpClient.get<ApiResponse<{
      revenue: Array<{ period: string; amount: number }>;
      totalRevenue: number;
      projectedRevenue?: number;
      outstandingLiability: number;
    }>>(endpoints.giftCards.revenueReport, { params });
    return response.data;
  }

  // Search & Filter
  async searchGiftCards(query: string, params?: {
    type?: string;
    status?: string;
    category?: string;
    limit?: number;
  }) {
    const response = await httpClient.get<ApiResponse<{ items: GiftCard[]; pagination: PaginationInfo }>>(
      endpoints.giftCards.search,
      { params: { q: query, ...params } }
    );
    return response.data;
  }

  async getAdvancedFilters() {
    const response = await httpClient.get<ApiResponse<{
      categories: string[];
      types: string[];
      statuses: string[];
      deliveryMethods: string[];
      amountRanges: { min: number; max: number; label: string }[];
    }>>(endpoints.giftCards.filters);
    return response.data;
  }

  // Import/Export
  async importGiftCards(data: {
    file: File;
    format: 'csv' | 'excel';
    templateId?: string;
    skipDuplicates?: boolean;
  }) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('format', data.format);
    if (data.templateId) formData.append('templateId', data.templateId);
    if (data.skipDuplicates !== undefined) formData.append('skipDuplicates', String(data.skipDuplicates));

    const response = await httpClient.post<ApiResponse<{
      imported: number;
      skipped: number;
      errors: string[];
      giftCards: GiftCard[];
    }>>(endpoints.giftCards.import, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async exportGiftCards(params?: {
    format?: 'csv' | 'excel' | 'pdf';
    status?: string;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    includeUsageHistory?: boolean;
  }) {
    const response = await httpClient.get<Blob>(
      endpoints.giftCards.export,
      { 
        params,
        responseType: 'blob'
      }
    );
    return response.data;
  }

  // Validation & Compliance
  async validateBulkData(data: {
    giftCards: Partial<GiftCard>[];
    validateBalance?: boolean;
    checkDuplicates?: boolean;
  }) {
    const response = await httpClient.post<ApiResponse<{
      valid: boolean;
      errors: { row: number; field: string; message: string }[];
      warnings: { row: number; field: string; message: string }[];
      duplicates: { row: number; code: string }[];
    }>>(endpoints.giftCards.validateBulk, data);
    return response.data;
  }

  async checkCompliance(id: string) {
    const response = await httpClient.get<ApiResponse<{
      compliant: boolean;
      issues: string[];
      recommendations: string[];
    }>>(endpoints.giftCards.compliance(id));
    return response.data;
  }

  // Integration & APIs
  async generateApiKey(data: {
    name: string;
    permissions: string[];
    expiresAt?: Date;
  }) {
    const response = await httpClient.post<ApiResponse<{
      apiKey: string;
      keyId: string;
      permissions: string[];
    }>>(endpoints.giftCards.generateApiKey, data);
    return response.data;
  }

  async getWebhookSettings() {
    const response = await httpClient.get<ApiResponse<{
      webhooks: {
        id: string;
        url: string;
        events: string[];
        isActive: boolean;
      }[];
    }>>(endpoints.giftCards.webhooks);
    return response.data;
  }

  async updateWebhookSettings(data: {
    webhooks: {
      id?: string;
      url: string;
      events: string[];
      isActive: boolean;
      secret?: string;
    }[];
  }) {
    const response = await httpClient.post<ApiResponse<void>>(
      endpoints.giftCards.updateWebhooks,
      data
    );
    return response.data;
  }
}

export const giftCardApi = new GiftCardApi();

// ==================== React Query Hooks ====================

// Gift Card Hooks
export const useGiftCards = (params?: GiftCardListParams) => {
  return useQuery({
    queryKey: ['giftCards', 'list', params],
    queryFn: () => giftCardApi.getGiftCards(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGiftCardById = (id: string) => {
  return useQuery({
    queryKey: ['giftCards', 'detail', id],
    queryFn: () => giftCardApi.getGiftCardById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useGiftCardByCode = (code: string) => {
  return useQuery({
    queryKey: ['giftCards', 'code', code],
    queryFn: () => giftCardApi.getGiftCardByCode(code),
    enabled: !!code && code.length >= 3,
    staleTime: 30 * 1000,
  });
};

export const useGiftCardBalance = (code: string) => {
  return useQuery({
    queryKey: ['giftCards', 'balance', code],
    queryFn: () => giftCardApi.checkBalance(code),
    enabled: !!code,
    staleTime: 30 * 1000,
  });
};

export const useGiftCardUsageHistory = (id: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['giftCards', 'usage', id, params],
    queryFn: () => giftCardApi.getUsageHistory(id, params),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Template Hooks
export const useGiftCardTemplates = (params?: {
  category?: string;
  type?: string;
  isActive?: boolean;
  isPublic?: boolean;
}) => {
  return useQuery({
    queryKey: ['giftCards', 'templates', params],
    queryFn: () => giftCardApi.getTemplates(params),
    staleTime: 10 * 60 * 1000,
  });
};

export const useGiftCardTemplateById = (id: string) => {
  return useQuery({
    queryKey: ['giftCards', 'templates', id],
    queryFn: () => giftCardApi.getTemplateById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// Bulk Orders Hooks
export const useGiftCardBulkOrders = (params?: {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['giftCards', 'bulkOrders', params],
    queryFn: () => giftCardApi.getBulkOrders(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGiftCardBulkOrderById = (id: string) => {
  return useQuery({
    queryKey: ['giftCards', 'bulkOrders', id],
    queryFn: () => giftCardApi.getBulkOrderById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Campaign Hooks
export const useGiftCardCampaigns = (params?: {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['giftCards', 'campaigns', params],
    queryFn: () => giftCardApi.getCampaigns(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGiftCardCampaignById = (id: string) => {
  return useQuery({
    queryKey: ['giftCards', 'campaigns', id],
    queryFn: () => giftCardApi.getCampaignById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Analytics Hooks
export const useGiftCardAnalytics = (period?: string, filters?: {
  type?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['giftCards', 'analytics', period, filters],
    queryFn: () => giftCardApi.getAnalytics(period, filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGiftCardExpiryReport = (params?: {
  days?: number;
  category?: string;
  minAmount?: number;
  includeNotified?: boolean;
}) => {
  return useQuery({
    queryKey: ['giftCards', 'expiryReport', params],
    queryFn: () => giftCardApi.getExpiryReport(params),
    staleTime: 10 * 60 * 1000,
  });
};

export const useGiftCardUsageReport = (params?: {
  period?: string;
  category?: string;
  type?: string;
  groupBy?: 'day' | 'week' | 'month';
}) => {
  return useQuery({
    queryKey: ['giftCards', 'usageReport', params],
    queryFn: () => giftCardApi.getUsageReport(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGiftCardRevenueReport = (params?: {
  period?: string;
  category?: string;
  includeProjections?: boolean;
}) => {
  return useQuery({
    queryKey: ['giftCards', 'revenueReport', params],
    queryFn: () => giftCardApi.getRevenueReport(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Search & Filter Hooks
export const useGiftCardSearch = (query: string, params?: {
  type?: string;
  status?: string;
  category?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['giftCards', 'search', query, params],
    queryFn: () => giftCardApi.searchGiftCards(query, params),
    enabled: !!query.trim(),
    staleTime: 30 * 1000,
  });
};

export const useGiftCardFilters = () => {
  return useQuery({
    queryKey: ['giftCards', 'filters'],
    queryFn: () => giftCardApi.getAdvancedFilters(),
    staleTime: 30 * 60 * 1000,
  });
};

// Validation Hooks
export const useValidateGiftCard = (code: string, orderAmount?: number) => {
  return useQuery({
    queryKey: ['giftCards', 'validate', code, orderAmount],
    queryFn: () => giftCardApi.validateGiftCard(code, orderAmount),
    enabled: !!code,
    staleTime: 10 * 1000,
  });
};

export const useGiftCardDeliveryStatus = (id: string) => {
  return useQuery({
    queryKey: ['giftCards', 'deliveryStatus', id],
    queryFn: () => giftCardApi.getDeliveryStatus(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for delivery status
  });
};

// Webhook & Integration Hooks
export const useGiftCardWebhookSettings = () => {
  return useQuery({
    queryKey: ['giftCards', 'webhooks'],
    queryFn: () => giftCardApi.getWebhookSettings(),
    staleTime: 10 * 60 * 1000,
  });
};

// ==================== Mutation Hooks ====================

export const useCreateGiftCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: GiftCardCreateRequest) => giftCardApi.createGiftCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
};

export const useUpdateGiftCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GiftCard> }) => 
      giftCardApi.updateGiftCard(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'detail', id] });
    },
  });
};

export const useDeleteGiftCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => giftCardApi.deleteGiftCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
};

export const useDuplicateGiftCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { amount?: number; recipient?: GiftCard['recipient'] } }) => 
      giftCardApi.duplicateGiftCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
};

// Status Management Mutations
export const useActivateGiftCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => giftCardApi.activateGiftCard(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'detail', id] });
    },
  });
};

export const useDeactivateGiftCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      giftCardApi.deactivateGiftCard(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'detail', id] });
    },
  });
};

export const useCancelGiftCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      giftCardApi.cancelGiftCard(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'detail', id] });
    },
  });
};

export const useSuspendGiftCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      giftCardApi.suspendGiftCard(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'detail', id] });
    },
  });
};

// Balance Management Mutations
export const useAddBalance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason?: string }) => 
      giftCardApi.addBalance(id, amount, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'usage', id] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'balance'] });
    },
  });
};

export const useDeductBalance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, amount, orderId }: { id: string; amount: number; orderId?: string }) => 
      giftCardApi.deductBalance(id, amount, orderId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'usage', id] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'balance'] });
    },
  });
};

export const useRefundUsage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, usageId, amount }: { id: string; usageId: string; amount?: number }) => 
      giftCardApi.refundUsage(id, usageId, amount),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'usage', id] });
    },
  });
};

// Redemption Mutations
export const useRedeemGiftCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ code, amount, orderId, description }: {
      code: string;
      amount: number;
      orderId: string;
      description?: string;
    }) => giftCardApi.redeemGiftCard(code, { amount, orderId, description }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'detail'] });
      if (data?.data?.giftCard?.code) {
        queryClient.invalidateQueries({ queryKey: ['giftCards', 'balance', data.data.giftCard.code] });
      }
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'usage'] });
    },
  });
};

// Template Mutations
export const useCreateGiftCardTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<GiftCardTemplate>) => giftCardApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'templates'] });
    },
  });
};

export const useUpdateGiftCardTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GiftCardTemplate> }) => 
      giftCardApi.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'templates', id] });
    },
  });
};

export const useDeleteGiftCardTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => giftCardApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'templates'] });
    },
  });
};

export const useDuplicateGiftCardTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { name?: string } }) => 
      giftCardApi.duplicateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'templates'] });
    },
  });
};

// Bulk Operations Mutations
export const useBulkCreateGiftCards = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: GiftCardBulkCreateRequest) => giftCardApi.bulkCreateGiftCards(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'bulkOrders'] });
    },
  });
};

export const useUpdateBulkOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GiftCardBulkOrder> }) => 
      giftCardApi.updateBulkOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'bulkOrders'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'bulkOrders', id] });
    },
  });
};

export const useCancelBulkOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      giftCardApi.cancelBulkOrder(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'bulkOrders'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'bulkOrders', id] });
    },
  });
};

export const useProcessBulkOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => giftCardApi.processBulkOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'bulkOrders'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'bulkOrders', id] });
    },
  });
};

// Delivery & Notification Mutations
export const useSendGiftCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data?: {
        method?: string;
        recipient?: GiftCard['recipient'];
        customMessage?: string;
        scheduleDate?: Date;
      };
    }) => giftCardApi.sendGiftCard(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'deliveryStatus', id] });
    },
  });
};

export const useResendGiftCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, method }: { id: string; method?: string }) => 
      giftCardApi.resendGiftCard(id, method),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'deliveryStatus', id] });
    },
  });
};

export const useScheduleReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        type: 'expiry' | 'unused' | 'balance';
        sendDate: Date;
        message?: string;
      };
    }) => giftCardApi.scheduleReminder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'detail', id] });
    },
  });
};

// Campaign Mutations
export const useCreateGiftCardCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<GiftCardCampaign>) => giftCardApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'campaigns'] });
    },
  });
};

export const useUpdateGiftCardCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GiftCardCampaign> }) => 
      giftCardApi.updateCampaign(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'campaigns', id] });
    },
  });
};

export const useDeleteGiftCardCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => giftCardApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'campaigns'] });
    },
  });
};

export const useActivateGiftCardCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => giftCardApi.activateCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'campaigns', id] });
    },
  });
};

export const usePauseGiftCardCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => giftCardApi.pauseCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'campaigns', id] });
    },
  });
};

export const useCompleteGiftCardCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => giftCardApi.completeCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'campaigns', id] });
    },
  });
};

// Import/Export Mutations
export const useImportGiftCards = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      file: File;
      format: 'csv' | 'excel';
      templateId?: string;
      skipDuplicates?: boolean;
    }) => giftCardApi.importGiftCards(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
};

// Validation Mutations
export const useValidateBulkGiftCards = () => {
  return useMutation({
    mutationFn: (data: {
      giftCards: Partial<GiftCard>[];
      validateBalance?: boolean;
      checkDuplicates?: boolean;
    }) => giftCardApi.validateBulkData(data),
  });
};

// Integration Mutations
export const useGenerateApiKey = () => {
  return useMutation({
    mutationFn: (data: {
      name: string;
      permissions: string[];
      expiresAt?: Date;
    }) => giftCardApi.generateApiKey(data),
  });
};

export const useUpdateWebhookSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      webhooks: {
        id?: string;
        url: string;
        events: string[];
        isActive: boolean;
        secret?: string;
      }[];
    }) => giftCardApi.updateWebhookSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards', 'webhooks'] });
    },
  });
};

export default giftCardApi;
