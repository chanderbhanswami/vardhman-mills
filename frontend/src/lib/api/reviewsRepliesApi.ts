import { 
  useMutation, 
  useQuery, 
  useQueryClient, 
  useInfiniteQuery
} from '@tanstack/react-query';
import { httpClient } from './client';
import { 
  ApiResponse, 
  ReviewReply, 
  SearchParams
} from './types';

// ==================== INTERFACES ====================

export interface ReviewReplyDetailed extends ReviewReply {
  review: {
    id: string;
    title: string;
    rating: number;
    productId: string;
    product: {
      id: string;
      name: string;
      slug: string;
      image: string;
      price: number;
    };
  };
  metadata: {
    ipAddress: string;
    userAgent: string;
    source: 'web' | 'mobile' | 'api' | 'admin';
    isEdited: boolean;
    editCount: number;
    lastEditedAt?: string;
  };
  moderation: {
    status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'spam';
    moderatedBy?: string;
    moderatedAt?: string;
    rejectionReason?: string;
    flags: ReplyFlag[];
    autoModerationScore: number;
    humanReviewRequired: boolean;
    isHidden: boolean;
    hideReason?: string;
  };
  engagement: {
    likes: number;
    dislikes: number;
    replies: number;
    reports: number;
    helpfulVotes: number;
    unhelpfulVotes: number;
    isLikedByCurrentUser?: boolean;
    isReportedByCurrentUser?: boolean;
    isHelpfulToCurrentUser?: boolean;
  };
  analytics: {
    views: number;
    clickThroughs: number;
    mentions: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
    readingTime: number;
    engagementRate: number;
  };
  notifications: {
    notifyAuthor: boolean;
    notifyModerators: boolean;
    notifyMentioned: boolean;
    emailSent: boolean;
    pushSent: boolean;
    smsStatus?: 'sent' | 'failed' | 'delivered';
  };
  verification: {
    isVerifiedPurchase: boolean;
    verificationLevel: 'none' | 'email' | 'phone' | 'purchase' | 'identity';
    verifiedAt?: string;
    purchaseOrderId?: string;
  };
  threading: {
    level: number;
    path: string;
    parentIds: string[];
    childCount: number;
    isThread: boolean;
    threadId?: string;
  };
  visibility: {
    isPublic: boolean;
    isStaffOnly: boolean;
    isAuthorOnly: boolean;
    visibilityRules: VisibilityRule[];
    showInFeed: boolean;
    indexable: boolean;
  };
  formatting: {
    html: string;
    plainText: string;
    markdown?: string;
    hasLinks: boolean;
    hasEmojis: boolean;
    wordCount: number;
    readabilityScore: number;
  };
  attachments: ReplyAttachment[];
  mentions: ReplyMention[];
  reactions: ReplyReaction[];
  history: ReplyHistory[];
}

export interface ReplyFlag {
  id: string;
  type: 'inappropriate' | 'spam' | 'harassment' | 'misinformation' | 'copyright' | 'other';
  reason: string;
  flaggedBy: string;
  flaggedAt: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  evidence?: string[];
}

export interface VisibilityRule {
  type: 'role' | 'user' | 'group' | 'location' | 'time' | 'condition';
  operator: 'equals' | 'in' | 'not_in' | 'contains' | 'between';
  value: string | string[] | number | boolean;
  description?: string;
}

export interface ReplyAttachment {
  id: string;
  type: 'image' | 'video' | 'document' | 'link';
  url: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
  alt?: string;
  title?: string;
  description?: string;
  isProcessed: boolean;
  metadata?: Record<string, unknown>;
}

export interface ReplyMention {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  startIndex: number;
  endIndex: number;
  notified: boolean;
  type: 'user' | 'role' | 'group';
}

export interface ReplyReaction {
  id: string;
  type: 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'wow' | 'custom';
  emoji: string;
  userId: string;
  user: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface ReplyHistory {
  id: string;
  version: number;
  content: string;
  changes: string[];
  editedBy: string;
  editedAt: string;
  reason?: string;
  isSignificant: boolean;
  metadata?: Record<string, unknown>;
}

export interface ReviewReplyCreate {
  reviewId: string;
  parentId?: string; // For nested replies
  comment: string;
  attachments?: File[];
  mentions?: string[]; // Array of user IDs to mention
  visibility?: 'public' | 'staff' | 'author';
  notifyAuthor?: boolean;
  notifyMentioned?: boolean;
  metadata?: {
    source?: 'web' | 'mobile' | 'api';
    deviceInfo?: Record<string, unknown>;
    locationInfo?: Record<string, unknown>;
  };
}

export interface ReviewReplyUpdate {
  comment?: string;
  attachments?: File[];
  mentions?: string[];
  visibility?: 'public' | 'staff' | 'author';
  reason?: string;
  notifyChanges?: boolean;
}

export interface ReviewReplySearch extends SearchParams {
  reviewId?: string;
  productId?: string;
  userId?: string;
  parentId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'flagged' | 'spam';
  visibility?: 'public' | 'staff' | 'author';
  hasAttachments?: boolean;
  hasMentions?: boolean;
  hasReactions?: boolean;
  minLikes?: number;
  maxLikes?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  verificationLevel?: 'none' | 'email' | 'phone' | 'purchase' | 'identity';
  threadLevel?: number;
  dateFrom?: string;
  dateTo?: string;
  content?: string;
  mentionedUser?: string;
  sortBy?: 'createdAt' | 'likes' | 'replies' | 'helpful' | 'engagement';
  groupBy?: 'review' | 'product' | 'user' | 'date';
  includeThreads?: boolean;
  includeMetadata?: boolean;
  includeAnalytics?: boolean;
}

export interface ReplyBulkAction {
  replyIds: string[];
  action: 'approve' | 'reject' | 'delete' | 'hide' | 'unhide' | 'flag' | 'unflag' | 'feature' | 'unfeature';
  params?: Record<string, unknown>;
  reason?: string;
  notify?: boolean;
  batchSize?: number;
}

export interface ReplyAnalytics {
  totalReplies: number;
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  totalLikes: number;
  totalReports: number;
  averageLength: number;
  averageResponseTime: number;
  responseRate: number;
  engagementRate: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  verificationDistribution: {
    verified: number;
    unverified: number;
    breakdown: Array<{
      level: string;
      count: number;
      percentage: number;
    }>;
  };
  threadingStats: {
    totalThreads: number;
    averageThreadLength: number;
    maxThreadDepth: number;
    threadEngagement: number;
  };
  topUsers: Array<{
    userId: string;
    userName: string;
    replyCount: number;
    likesReceived: number;
    averageRating: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    replyCount: number;
    averageRating: number;
    engagementRate: number;
  }>;
  trendsData: Array<{
    date: string;
    replies: number;
    likes: number;
    reports: number;
    engagement: number;
  }>;
  moderationStats: {
    autoApprovalRate: number;
    humanReviewRate: number;
    averageReviewTime: number;
    flaggedRate: number;
    appealRate: number;
  };
}

export interface ReplyTemplate {
  id: string;
  name: string;
  description: string;
  category: 'appreciation' | 'question' | 'clarification' | 'complaint' | 'suggestion' | 'general';
  content: string;
  variables: TemplateVariable[];
  tags: string[];
  isActive: boolean;
  isPublic: boolean;
  usageCount: number;
  language: string;
  tone: 'formal' | 'casual' | 'friendly' | 'professional' | 'empathetic';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: string;
  options?: string[];
  description?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface ReplyNotificationSettings {
  emailNotifications: {
    newReply: boolean;
    replyApproved: boolean;
    replyRejected: boolean;
    replyLiked: boolean;
    replyMentioned: boolean;
    replyFlagged: boolean;
  };
  pushNotifications: {
    newReply: boolean;
    replyApproved: boolean;
    replyLiked: boolean;
    replyMentioned: boolean;
  };
  smsNotifications: {
    urgentFlags: boolean;
    mentionsByVIP: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  filters: {
    minimumRating: number;
    verifiedOnly: boolean;
    excludeSpam: boolean;
    languagePreference: string[];
  };
}

export interface ReplyModerationQueue {
  id: string;
  replyId: string;
  reply: ReviewReplyDetailed;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedAt?: string;
  flags: ReplyFlag[];
  autoModerationResults: {
    score: number;
    tags: string[];
    concerns: string[];
    confidence: number;
    recommendations: string[];
  };
  humanReviewNotes?: string;
  estimatedReviewTime: number;
  deadline?: string;
  escalationLevel: number;
  reviewHistory: Array<{
    reviewedBy: string;
    reviewedAt: string;
    action: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ==================== API SERVICE CLASS ====================

export class ReviewRepliesApiService {
  private readonly baseUrl = '/review-replies';

  // ==================== CRUD Operations ====================

  async getAll(params?: ReviewReplySearch): Promise<ApiResponse<ReviewReplyDetailed[]>> {
    return httpClient.get(this.baseUrl, { params });
  }

  async getById(id: string, includeAnalytics = false): Promise<ApiResponse<ReviewReplyDetailed>> {
    return httpClient.get(`${this.baseUrl}/${id}`, { 
      params: { includeAnalytics } 
    });
  }

  async getByReviewId(reviewId: string, params?: Omit<ReviewReplySearch, 'reviewId'>): Promise<ApiResponse<ReviewReplyDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/review/${reviewId}`, { params });
  }

  async getByProductId(productId: string, params?: Omit<ReviewReplySearch, 'productId'>): Promise<ApiResponse<ReviewReplyDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/product/${productId}`, { params });
  }

  async getByUserId(userId: string, params?: Omit<ReviewReplySearch, 'userId'>): Promise<ApiResponse<ReviewReplyDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/user/${userId}`, { params });
  }

  async getThread(parentId: string): Promise<ApiResponse<ReviewReplyDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/thread/${parentId}`);
  }

  async create(data: ReviewReplyCreate): Promise<ApiResponse<ReviewReplyDetailed>> {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('reviewId', data.reviewId);
    formData.append('comment', data.comment);
    
    if (data.parentId) formData.append('parentId', data.parentId);
    if (data.mentions) formData.append('mentions', JSON.stringify(data.mentions));
    if (data.visibility) formData.append('visibility', data.visibility);
    if (data.notifyAuthor !== undefined) formData.append('notifyAuthor', String(data.notifyAuthor));
    if (data.notifyMentioned !== undefined) formData.append('notifyMentioned', String(data.notifyMentioned));
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
    
    // Add attachments
    if (data.attachments?.length) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    return httpClient.upload(this.baseUrl, formData);
  }

  async update(id: string, data: ReviewReplyUpdate): Promise<ApiResponse<ReviewReplyDetailed>> {
    const formData = new FormData();
    
    if (data.comment) formData.append('comment', data.comment);
    if (data.mentions) formData.append('mentions', JSON.stringify(data.mentions));
    if (data.visibility) formData.append('visibility', data.visibility);
    if (data.reason) formData.append('reason', data.reason);
    if (data.notifyChanges !== undefined) formData.append('notifyChanges', String(data.notifyChanges));
    
    // Add attachments
    if (data.attachments?.length) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    return httpClient.upload(`${this.baseUrl}/${id}`, formData);
  }

  async delete(id: string, reason?: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/${id}`, { 
      data: { reason } 
    });
  }

  async bulkDelete(ids: string[], reason?: string): Promise<ApiResponse<{ deleted: string[]; failed: string[] }>> {
    return httpClient.post(`${this.baseUrl}/bulk-delete`, { ids, reason });
  }

  // ==================== Moderation ====================

  async approve(id: string, reason?: string): Promise<ApiResponse<ReviewReplyDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/approve`, { reason });
  }

  async reject(id: string, reason: string): Promise<ApiResponse<ReviewReplyDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/reject`, { reason });
  }

  async flag(id: string, flag: {
    type: 'inappropriate' | 'spam' | 'harassment' | 'misinformation' | 'copyright' | 'other';
    reason: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    evidence?: string[];
  }): Promise<ApiResponse<ReviewReplyDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/flag`, flag);
  }

  async unflag(id: string, flagId: string): Promise<ApiResponse<ReviewReplyDetailed>> {
    return httpClient.delete(`${this.baseUrl}/${id}/flags/${flagId}`);
  }

  async hide(id: string, reason: string): Promise<ApiResponse<ReviewReplyDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/hide`, { reason });
  }

  async unhide(id: string): Promise<ApiResponse<ReviewReplyDetailed>> {
    return httpClient.post(`${this.baseUrl}/${id}/unhide`);
  }

  async getModerationQueue(params?: {
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
    status?: 'pending' | 'in_review' | 'completed';
    escalationLevel?: number;
    hasDeadline?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<ReplyModerationQueue[]>> {
    return httpClient.get(`${this.baseUrl}/moderation-queue`, { params });
  }

  async assignModerator(id: string, moderatorId: string): Promise<ApiResponse<ReplyModerationQueue>> {
    return httpClient.post(`${this.baseUrl}/${id}/assign-moderator`, { moderatorId });
  }

  async bulkModerate(action: ReplyBulkAction): Promise<ApiResponse<{ processed: string[]; failed: string[] }>> {
    return httpClient.post(`${this.baseUrl}/bulk-moderate`, action);
  }

  async escalateReview(id: string, level: number, reason: string): Promise<ApiResponse<ReplyModerationQueue>> {
    return httpClient.post(`${this.baseUrl}/${id}/escalate`, { level, reason });
  }

  // ==================== Engagement ====================

  async like(id: string): Promise<ApiResponse<{ liked: boolean; count: number }>> {
    return httpClient.post(`${this.baseUrl}/${id}/like`);
  }

  async unlike(id: string): Promise<ApiResponse<{ liked: boolean; count: number }>> {
    return httpClient.delete(`${this.baseUrl}/${id}/like`);
  }

  async react(id: string, reaction: {
    type: 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'wow' | 'custom';
    emoji?: string;
  }): Promise<ApiResponse<{ reactions: ReplyReaction[] }>> {
    return httpClient.post(`${this.baseUrl}/${id}/react`, reaction);
  }

  async removeReaction(id: string, reactionId: string): Promise<ApiResponse<{ reactions: ReplyReaction[] }>> {
    return httpClient.delete(`${this.baseUrl}/${id}/reactions/${reactionId}`);
  }

  async markHelpful(id: string): Promise<ApiResponse<{ helpful: boolean; count: number }>> {
    return httpClient.post(`${this.baseUrl}/${id}/helpful`);
  }

  async markUnhelpful(id: string): Promise<ApiResponse<{ helpful: boolean; count: number }>> {
    return httpClient.post(`${this.baseUrl}/${id}/unhelpful`);
  }

  async report(id: string, report: {
    type: 'inappropriate' | 'spam' | 'harassment' | 'misinformation' | 'copyright' | 'other';
    reason: string;
    details?: string;
  }): Promise<ApiResponse<{ reported: boolean }>> {
    return httpClient.post(`${this.baseUrl}/${id}/report`, report);
  }

  // ==================== Analytics & Reporting ====================

  async getAnalytics(params?: {
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
    includeComparison?: boolean;
    productId?: string;
    userId?: string;
  }): Promise<ApiResponse<ReplyAnalytics>> {
    return httpClient.get(`${this.baseUrl}/analytics`, { params });
  }

  async getReplyStats(id: string): Promise<ApiResponse<{
    views: number;
    likes: number;
    replies: number;
    reports: number;
    helpful: number;
    engagementRate: number;
    sentimentScore: number;
    readingTime: number;
    responseTime?: number;
    trends: Array<{
      date: string;
      views: number;
      engagement: number;
    }>;
  }>> {
    return httpClient.get(`${this.baseUrl}/${id}/stats`);
  }

  async getPopularReplies(params?: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
    productId?: string;
    category?: string;
  }): Promise<ApiResponse<ReviewReplyDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/popular`, { params });
  }

  async getTrendingReplies(params?: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
    minEngagement?: number;
  }): Promise<ApiResponse<ReviewReplyDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/trending`, { params });
  }

  async getEngagementMetrics(params?: {
    userId?: string;
    productId?: string;
    period?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<{
    totalEngagement: number;
    averageEngagement: number;
    engagementRate: number;
    topEngagers: Array<{
      userId: string;
      userName: string;
      engagement: number;
    }>;
    engagementByHour: Array<{
      hour: number;
      engagement: number;
    }>;
    engagementByDay: Array<{
      day: string;
      engagement: number;
    }>;
  }>> {
    return httpClient.get(`${this.baseUrl}/engagement-metrics`, { params });
  }

  // ==================== Templates ====================

  async getTemplates(category?: string): Promise<ApiResponse<ReplyTemplate[]>> {
    return httpClient.get(`${this.baseUrl}/templates`, { 
      params: { category } 
    });
  }

  async createTemplate(data: Omit<ReplyTemplate, 'id' | 'usageCount' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ReplyTemplate>> {
    return httpClient.post(`${this.baseUrl}/templates`, data);
  }

  async updateTemplate(id: string, data: Partial<ReplyTemplate>): Promise<ApiResponse<ReplyTemplate>> {
    return httpClient.put(`${this.baseUrl}/templates/${id}`, data);
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.baseUrl}/templates/${id}`);
  }

  async useTemplate(templateId: string, variables: Record<string, string>): Promise<ApiResponse<{ content: string }>> {
    return httpClient.post(`${this.baseUrl}/templates/${templateId}/use`, { variables });
  }

  // ==================== Notifications ====================

  async getNotificationSettings(userId?: string): Promise<ApiResponse<ReplyNotificationSettings>> {
    const url = userId ? `${this.baseUrl}/notifications/settings/${userId}` : `${this.baseUrl}/notifications/settings`;
    return httpClient.get(url);
  }

  async updateNotificationSettings(settings: Partial<ReplyNotificationSettings>, userId?: string): Promise<ApiResponse<ReplyNotificationSettings>> {
    const url = userId ? `${this.baseUrl}/notifications/settings/${userId}` : `${this.baseUrl}/notifications/settings`;
    return httpClient.put(url, settings);
  }

  async sendNotification(replyId: string, notification: {
    type: 'email' | 'push' | 'sms';
    recipients: string[];
    template?: string;
    variables?: Record<string, string>;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    scheduledAt?: string;
  }): Promise<ApiResponse<{ sent: number; failed: number; scheduledId?: string }>> {
    return httpClient.post(`${this.baseUrl}/${replyId}/notify`, notification);
  }

  // ==================== Utilities ====================

  async search(params: ReviewReplySearch): Promise<ApiResponse<ReviewReplyDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/search`, { params });
  }

  async export(params?: {
    format?: 'json' | 'csv' | 'xlsx';
    includeMetadata?: boolean;
    includeAnalytics?: boolean;
    includeThreads?: boolean;
    dateRange?: [string, string];
    filters?: ReviewReplySearch;
  }): Promise<ApiResponse<{ downloadUrl: string; expiresAt: string }>> {
    return httpClient.post(`${this.baseUrl}/export`, params);
  }

  async getRecentActivity(limit = 50): Promise<ApiResponse<Array<{
    id: string;
    type: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'flag' | 'like' | 'react';
    replyId: string;
    reply: {
      id: string;
      comment: string;
      reviewId: string;
      user: {
        id: string;
        name: string;
        avatar?: string;
      };
    };
    actor: {
      id: string;
      name: string;
      avatar?: string;
      role?: string;
    };
    timestamp: string;
    metadata?: Record<string, unknown>;
  }>>> {
    return httpClient.get(`${this.baseUrl}/activity`, { params: { limit } });
  }

  async validateReply(content: string, reviewId: string): Promise<ApiResponse<{
    isValid: boolean;
    issues: Array<{
      type: 'length' | 'content' | 'spam' | 'language' | 'inappropriate';
      severity: 'error' | 'warning' | 'info';
      message: string;
      suggestion?: string;
    }>;
    score: number;
    suggestions: string[];
  }>> {
    return httpClient.post(`${this.baseUrl}/validate`, { content, reviewId });
  }

  async getSimilarReplies(id: string, limit = 5): Promise<ApiResponse<ReviewReplyDetailed[]>> {
    return httpClient.get(`${this.baseUrl}/${id}/similar`, { params: { limit } });
  }

  async getConversation(replyId: string): Promise<ApiResponse<{
    thread: ReviewReplyDetailed[];
    participants: Array<{
      userId: string;
      userName: string;
      avatar?: string;
      replyCount: number;
      firstReply: string;
      lastReply: string;
    }>;
    metadata: {
      totalReplies: number;
      threadDepth: number;
      createdAt: string;
      lastActivity: string;
      isActive: boolean;
    };
  }>> {
    return httpClient.get(`${this.baseUrl}/${replyId}/conversation`);
  }
}

// Create service instance
export const reviewRepliesApi = new ReviewRepliesApiService();

// ==================== REACT QUERY HOOKS ====================

// Query Keys
export const reviewRepliesKeys = {
  all: ['reviewReplies'] as const,
  lists: () => [...reviewRepliesKeys.all, 'list'] as const,
  list: (params?: ReviewReplySearch) => [...reviewRepliesKeys.lists(), params] as const,
  details: () => [...reviewRepliesKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewRepliesKeys.details(), id] as const,
  byReview: (reviewId: string, params?: unknown) => [...reviewRepliesKeys.all, 'byReview', reviewId, params] as const,
  byProduct: (productId: string, params?: unknown) => [...reviewRepliesKeys.all, 'byProduct', productId, params] as const,
  byUser: (userId: string, params?: unknown) => [...reviewRepliesKeys.all, 'byUser', userId, params] as const,
  thread: (parentId: string) => [...reviewRepliesKeys.all, 'thread', parentId] as const,
  analytics: (params?: unknown) => [...reviewRepliesKeys.all, 'analytics', params] as const,
  templates: (category?: string) => [...reviewRepliesKeys.all, 'templates', category] as const,
  moderation: () => [...reviewRepliesKeys.all, 'moderation'] as const,
  popular: (params?: unknown) => [...reviewRepliesKeys.all, 'popular', params] as const,
  trending: (params?: unknown) => [...reviewRepliesKeys.all, 'trending', params] as const,
  search: (params: ReviewReplySearch) => [...reviewRepliesKeys.all, 'search', params] as const,
  activity: () => [...reviewRepliesKeys.all, 'activity'] as const,
  notifications: (userId?: string) => [...reviewRepliesKeys.all, 'notifications', userId] as const,
  engagement: (params?: unknown) => [...reviewRepliesKeys.all, 'engagement', params] as const,
  conversation: (replyId: string) => [...reviewRepliesKeys.all, 'conversation', replyId] as const,
};

// ==================== Query Hooks ====================

export function useReviewReplies(params?: ReviewReplySearch) {
  return useQuery({
    queryKey: reviewRepliesKeys.list(params),
    queryFn: () => reviewRepliesApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useReviewRepliesInfinite(params?: ReviewReplySearch) {
  return useInfiniteQuery({
    queryKey: reviewRepliesKeys.list(params),
    queryFn: ({ pageParam = 1 }) => 
      reviewRepliesApi.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.hasNextPage) {
        return (lastPage.meta.page || 1) + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useReviewReplyById(id: string, includeAnalytics = false) {
  return useQuery({
    queryKey: reviewRepliesKeys.detail(id),
    queryFn: () => reviewRepliesApi.getById(id, includeAnalytics),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useReviewRepliesByReviewId(reviewId: string, params?: Omit<ReviewReplySearch, 'reviewId'>) {
  return useQuery({
    queryKey: reviewRepliesKeys.byReview(reviewId, params),
    queryFn: () => reviewRepliesApi.getByReviewId(reviewId, params),
    enabled: !!reviewId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useReviewRepliesByProductId(productId: string, params?: Omit<ReviewReplySearch, 'productId'>) {
  return useQuery({
    queryKey: reviewRepliesKeys.byProduct(productId, params),
    queryFn: () => reviewRepliesApi.getByProductId(productId, params),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useReviewRepliesByUserId(userId: string, params?: Omit<ReviewReplySearch, 'userId'>) {
  return useQuery({
    queryKey: reviewRepliesKeys.byUser(userId, params),
    queryFn: () => reviewRepliesApi.getByUserId(userId, params),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useReplyThread(parentId: string) {
  return useQuery({
    queryKey: reviewRepliesKeys.thread(parentId),
    queryFn: () => reviewRepliesApi.getThread(parentId),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useReplyAnalytics(params?: {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
  includeComparison?: boolean;
  productId?: string;
  userId?: string;
}) {
  return useQuery({
    queryKey: reviewRepliesKeys.analytics(params),
    queryFn: () => reviewRepliesApi.getAnalytics(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useReplyTemplates(category?: string) {
  return useQuery({
    queryKey: reviewRepliesKeys.templates(category),
    queryFn: () => reviewRepliesApi.getTemplates(category),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useReplyModerationQueue(params?: {
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  status?: 'pending' | 'in_review' | 'completed';
  escalationLevel?: number;
  hasDeadline?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: reviewRepliesKeys.moderation(),
    queryFn: () => reviewRepliesApi.getModerationQueue(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePopularReplies(params?: {
  period?: 'day' | 'week' | 'month';
  limit?: number;
  productId?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: reviewRepliesKeys.popular(params),
    queryFn: () => reviewRepliesApi.getPopularReplies(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTrendingReplies(params?: {
  period?: 'day' | 'week' | 'month';
  limit?: number;
  minEngagement?: number;
}) {
  return useQuery({
    queryKey: reviewRepliesKeys.trending(params),
    queryFn: () => reviewRepliesApi.getTrendingReplies(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSearchReplies(params: ReviewReplySearch) {
  return useQuery({
    queryKey: reviewRepliesKeys.search(params),
    queryFn: () => reviewRepliesApi.search(params),
    enabled: !!(params.content || params.userId || params.productId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentReplyActivity(limit = 50) {
  return useQuery({
    queryKey: reviewRepliesKeys.activity(),
    queryFn: () => reviewRepliesApi.getRecentActivity(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useReplyNotificationSettings(userId?: string) {
  return useQuery({
    queryKey: reviewRepliesKeys.notifications(userId),
    queryFn: () => reviewRepliesApi.getNotificationSettings(userId),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useEngagementMetrics(params?: {
  userId?: string;
  productId?: string;
  period?: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: reviewRepliesKeys.engagement(params),
    queryFn: () => reviewRepliesApi.getEngagementMetrics(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useReplyConversation(replyId: string) {
  return useQuery({
    queryKey: reviewRepliesKeys.conversation(replyId),
    queryFn: () => reviewRepliesApi.getConversation(replyId),
    enabled: !!replyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== Mutation Hooks ====================

export function useCreateReviewReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReviewReplyCreate) => reviewRepliesApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.lists() });
      if (data.data?.review?.id) {
        queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.byReview(data.data.review.id) });
      }
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.activity() });
    },
  });
}

export function useUpdateReviewReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewReplyUpdate }) =>
      reviewRepliesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.activity() });
    },
  });
}

export function useDeleteReviewReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      reviewRepliesApi.delete(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.activity() });
    },
  });
}

export function useApproveReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      reviewRepliesApi.approve(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.moderation() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.activity() });
    },
  });
}

export function useRejectReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reviewRepliesApi.reject(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.moderation() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.activity() });
    },
  });
}

export function useFlagReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, flag }: { 
      id: string; 
      flag: {
        type: 'inappropriate' | 'spam' | 'harassment' | 'misinformation' | 'copyright' | 'other';
        reason: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        evidence?: string[];
      };
    }) => reviewRepliesApi.flag(id, flag),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.moderation() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.activity() });
    },
  });
}

export function useLikeReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewRepliesApi.like(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.engagement() });
    },
  });
}

export function useReactToReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reaction }: { 
      id: string; 
      reaction: {
        type: 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'wow' | 'custom';
        emoji?: string;
      };
    }) => reviewRepliesApi.react(id, reaction),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.engagement() });
    },
  });
}

export function useReportReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, report }: { 
      id: string; 
      report: {
        type: 'inappropriate' | 'spam' | 'harassment' | 'misinformation' | 'copyright' | 'other';
        reason: string;
        details?: string;
      };
    }) => reviewRepliesApi.report(id, report),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.moderation() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.activity() });
    },
  });
}

export function useBulkModerateReplies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: ReplyBulkAction) => reviewRepliesApi.bulkModerate(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.moderation() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.activity() });
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.analytics() });
    },
  });
}

export function useCreateReplyTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<ReplyTemplate, 'id' | 'usageCount' | 'createdBy' | 'createdAt' | 'updatedAt'>) =>
      reviewRepliesApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.templates() });
    },
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ settings, userId }: { settings: Partial<ReplyNotificationSettings>; userId?: string }) =>
      reviewRepliesApi.updateNotificationSettings(settings, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: reviewRepliesKeys.notifications(userId) });
    },
  });
}

export function useExportReplies() {
  return useMutation({
    mutationFn: (params?: {
      format?: 'json' | 'csv' | 'xlsx';
      includeMetadata?: boolean;
      includeAnalytics?: boolean;
      includeThreads?: boolean;
      dateRange?: [string, string];
      filters?: ReviewReplySearch;
    }) => reviewRepliesApi.export(params),
  });
}

// Export all hooks as a convenience object
export const useReviewRepliesApi = {
  // Queries
  useReviewReplies,
  useReviewRepliesInfinite,
  useReviewReplyById,
  useReviewRepliesByReviewId,
  useReviewRepliesByProductId,
  useReviewRepliesByUserId,
  useReplyThread,
  useReplyAnalytics,
  useReplyTemplates,
  useReplyModerationQueue,
  usePopularReplies,
  useTrendingReplies,
  useSearchReplies,
  useRecentReplyActivity,
  useReplyNotificationSettings,
  useEngagementMetrics,
  useReplyConversation,
  
  // Mutations
  useCreateReviewReply,
  useUpdateReviewReply,
  useDeleteReviewReply,
  useApproveReply,
  useRejectReply,
  useFlagReply,
  useLikeReply,
  useReactToReply,
  useReportReply,
  useBulkModerateReplies,
  useCreateReplyTemplate,
  useUpdateNotificationSettings,
  useExportReplies,
};

export default reviewRepliesApi;
