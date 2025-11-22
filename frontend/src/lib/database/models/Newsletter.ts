/**
 * Newsletter Model - Comprehensive newsletter subscription and management system
 * Frontend-optimized with full TypeScript support and validation
 */

import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Newsletter Preferences Schema
 */
export const NewsletterPreferencesSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'never']).default('weekly'),
  categories: z.array(z.string()).default([]), // Interested categories
  topics: z.array(z.string()).default([]), // Specific topics
  contentTypes: z.array(z.enum(['articles', 'products', 'promotions', 'events', 'announcements'])).default(['articles']),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  sendTime: z.object({
    hour: z.number().min(0).max(23).default(9), // 9 AM
    dayOfWeek: z.number().min(0).max(6).optional(), // 0 = Sunday, for weekly newsletters
    dayOfMonth: z.number().min(1).max(31).optional(), // for monthly newsletters
  }).default(() => ({ hour: 9 })),
  format: z.enum(['html', 'text', 'both']).default('html'),
  personalizedContent: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true),
});

export type NewsletterPreferences = z.infer<typeof NewsletterPreferencesSchema>;

/**
 * Newsletter Analytics Schema
 */
export const NewsletterAnalyticsSchema = z.object({
  totalSent: z.number().nonnegative().default(0),
  totalOpened: z.number().nonnegative().default(0),
  totalClicked: z.number().nonnegative().default(0),
  totalUnsubscribed: z.number().nonnegative().default(0),
  totalBounced: z.number().nonnegative().default(0),
  totalSpamReports: z.number().nonnegative().default(0),
  openRate: z.number().min(0).max(1).default(0),
  clickRate: z.number().min(0).max(1).default(0),
  unsubscribeRate: z.number().min(0).max(1).default(0),
  bounceRate: z.number().min(0).max(1).default(0),
  spamRate: z.number().min(0).max(1).default(0),
  engagementScore: z.number().min(0).max(100).default(0),
  lastOpened: z.date().optional(),
  lastClicked: z.date().optional(),
  averageTimeToOpen: z.number().positive().optional(), // in hours
  clickHeatmap: z.array(z.object({
    linkUrl: z.string(),
    clicks: z.number(),
    uniqueClicks: z.number(),
  })).default([]),
  deviceBreakdown: z.object({
    desktop: z.number().default(0),
    mobile: z.number().default(0),
    tablet: z.number().default(0),
  }).default(() => ({
    desktop: 0,
    mobile: 0,
    tablet: 0,
  })),
  locationBreakdown: z.record(z.string(), z.number()).default({}),
  lastUpdated: z.date().optional(),
});

export type NewsletterAnalytics = z.infer<typeof NewsletterAnalyticsSchema>;

/**
 * Newsletter Subscription History Schema
 */
export const NewsletterHistorySchema = z.object({
  action: z.enum(['subscribed', 'unsubscribed', 'resubscribed', 'preferences_updated', 'bounced', 'spam_report']),
  timestamp: z.date().default(() => new Date()),
  source: z.string().optional(), // Source of subscription (website, social, etc.)
  campaign: z.string().optional(), // Campaign that led to subscription
  reason: z.string().optional(), // Reason for unsubscribe
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type NewsletterHistory = z.infer<typeof NewsletterHistorySchema>;

/**
 * Main Newsletter Subscription Schema
 */
export const NewsletterSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  email: z.string().email('Invalid email address'),
  userId: z.string().optional(), // Connected user account
  
  // Subscriber information
  firstName: z.string().max(50, 'First name too long').optional(),
  lastName: z.string().max(50, 'Last name too long').optional(),
  fullName: z.string().max(100, 'Full name too long').optional(),
  
  // Subscription details
  status: z.enum(['active', 'unsubscribed', 'bounced', 'spam', 'pending', 'blocked']).default('pending'),
  verificationStatus: z.enum(['pending', 'verified', 'failed']).default('pending'),
  verificationToken: z.string().optional(),
  verificationExpiry: z.date().optional(),
  
  // Preferences
  preferences: NewsletterPreferencesSchema.default({
    frequency: 'weekly' as const,
    categories: [],
    topics: [],
    contentTypes: ['articles' as const],
    language: 'en',
    timezone: 'UTC',
    sendTime: { hour: 9 },
    format: 'html' as const,
    personalizedContent: true,
    includeRecommendations: true,
  }),
  
  // Source and attribution
  source: z.string().optional(), // How they subscribed (website, social media, etc.)
  campaign: z.string().optional(), // Marketing campaign
  referrer: z.string().optional(), // Referring URL
  utmParams: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
  
  // Segmentation
  segments: z.array(z.string()).default([]), // Marketing segments
  tags: z.array(z.string()).default([]), // Custom tags
  customFields: z.record(z.string(), z.unknown()).default({}),
  
  // Location and demographics
  location: z.object({
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    timezone: z.string().optional(),
    ipAddress: z.string().optional(),
  }).optional(),
  
  // Engagement tracking
  analytics: NewsletterAnalyticsSchema.default({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalUnsubscribed: 0,
    totalBounced: 0,
    totalSpamReports: 0,
    openRate: 0,
    clickRate: 0,
    unsubscribeRate: 0,
    bounceRate: 0,
    spamRate: 0,
    engagementScore: 0,
    clickHeatmap: [],
    deviceBreakdown: {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    },
    locationBreakdown: {},
  }),
  
  // History and activity
  history: z.array(NewsletterHistorySchema).default([]),
  lastEmailSent: z.date().optional(),
  lastEmailOpened: z.date().optional(),
  lastEmailClicked: z.date().optional(),
  
  // Double opt-in settings
  requireDoubleOptIn: z.boolean().default(true),
  confirmedAt: z.date().optional(),
  confirmationSentAt: z.date().optional(),
  
  // Unsubscribe details
  unsubscribedAt: z.date().optional(),
  unsubscribeReason: z.string().optional(),
  unsubscribeSource: z.string().optional(),
  canResubscribe: z.boolean().default(true),
  
  // Bounce management
  bounceCount: z.number().nonnegative().default(0),
  lastBounceAt: z.date().optional(),
  bounceType: z.enum(['soft', 'hard']).optional(),
  
  // Spam management
  spamCount: z.number().nonnegative().default(0),
  lastSpamReportAt: z.date().optional(),
  
  // Privacy and compliance
  gdprConsent: z.boolean().default(false),
  gdprConsentDate: z.date().optional(),
  ccpaOptOut: z.boolean().default(false),
  dataProcessingConsent: z.boolean().default(false),
  marketingConsent: z.boolean().default(false),
  
  // List management
  lists: z.array(z.string()).default([]), // Newsletter list IDs
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  subscribedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});

export type Newsletter = z.infer<typeof NewsletterSchema>;

/**
 * Create Newsletter Subscription Schema
 */
export const CreateNewsletterSchema = NewsletterSchema.omit({
  _id: true,
  analytics: true,
  history: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type CreateNewsletterInput = z.infer<typeof CreateNewsletterSchema>;

/**
 * Update Newsletter Subscription Schema
 */
export const UpdateNewsletterSchema = NewsletterSchema.partial().omit({
  _id: true,
  email: true,
  createdAt: true,
});

export type UpdateNewsletterInput = z.infer<typeof UpdateNewsletterSchema>;

/**
 * Newsletter Filter Schema
 */
export const NewsletterFilterSchema = z.object({
  status: z.enum(['active', 'unsubscribed', 'bounced', 'spam', 'pending', 'blocked']).optional(),
  verificationStatus: z.enum(['pending', 'verified', 'failed']).optional(),
  source: z.string().optional(),
  campaign: z.string().optional(),
  segments: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  lists: z.array(z.string()).optional(),
  location: z.object({
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
  subscribedAfter: z.date().optional(),
  subscribedBefore: z.date().optional(),
  lastActiveAfter: z.date().optional(),
  lastActiveBefore: z.date().optional(),
  minEngagementScore: z.number().min(0).max(100).optional(),
  maxBounceRate: z.number().min(0).max(1).optional(),
  hasUserId: z.boolean().optional(),
  gdprConsent: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(1000).default(100),
  sortBy: z.enum(['email', 'created_at', 'subscribed_at', 'last_active', 'engagement_score']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeAnalytics: z.boolean().default(false),
  includeHistory: z.boolean().default(false),
});

export type NewsletterFilter = z.infer<typeof NewsletterFilterSchema>;

/**
 * Newsletter Statistics Schema
 */
export const NewsletterStatsSchema = z.object({
  totalSubscribers: z.number(),
  activeSubscribers: z.number(),
  pendingSubscribers: z.number(),
  unsubscribedCount: z.number(),
  bouncedCount: z.number(),
  spamCount: z.number(),
  growthRate: z.number(), // Month over month growth
  churnRate: z.number(), // Unsubscribe rate
  engagementMetrics: z.object({
    averageOpenRate: z.number(),
    averageClickRate: z.number(),
    averageEngagementScore: z.number(),
  }),
  segmentBreakdown: z.array(z.object({
    segment: z.string(),
    count: z.number(),
    percentage: z.number(),
  })),
  sourceBreakdown: z.array(z.object({
    source: z.string(),
    count: z.number(),
    percentage: z.number(),
  })),
  locationBreakdown: z.array(z.object({
    country: z.string(),
    count: z.number(),
    percentage: z.number(),
  })),
  subscribersByMonth: z.array(z.object({
    month: z.string(),
    subscriptions: z.number(),
    unsubscriptions: z.number(),
    netGrowth: z.number(),
  })),
  topPerformingSegments: z.array(z.object({
    segment: z.string(),
    openRate: z.number(),
    clickRate: z.number(),
    engagementScore: z.number(),
  })),
});

export type NewsletterStats = z.infer<typeof NewsletterStatsSchema>;

/**
 * Validation functions
 */
export const validateNewsletter = (data: unknown): Newsletter => {
  return NewsletterSchema.parse(data);
};

export const validateCreateNewsletter = (data: unknown): CreateNewsletterInput => {
  return CreateNewsletterSchema.parse(data);
};

export const validateUpdateNewsletter = (data: unknown): UpdateNewsletterInput => {
  return UpdateNewsletterSchema.parse(data);
};

export const validateNewsletterFilter = (data: unknown): NewsletterFilter => {
  return NewsletterFilterSchema.parse(data);
};

/**
 * Newsletter utility functions
 */
export const newsletterUtils = {
  /**
   * Generate verification token
   */
  generateVerificationToken: (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  /**
   * Calculate engagement score
   */
  calculateEngagementScore: (analytics: NewsletterAnalytics): number => {
    const { openRate, clickRate, unsubscribeRate, bounceRate, spamRate } = analytics;
    
    // Weighted scoring
    const openScore = openRate * 40; // 40% weight
    const clickScore = clickRate * 35; // 35% weight
    const retentionScore = (1 - unsubscribeRate) * 15; // 15% weight
    const deliverabilityScore = (1 - bounceRate - spamRate) * 10; // 10% weight
    
    const score = openScore + clickScore + retentionScore + deliverabilityScore;
    return Math.min(Math.round(score * 100), 100);
  },

  /**
   * Update analytics
   */
  updateAnalytics: (newsletter: Newsletter, emailStats: {
    sent?: boolean;
    opened?: boolean;
    clicked?: boolean;
    unsubscribed?: boolean;
    bounced?: boolean;
    spamReport?: boolean;
  }): Newsletter => {
    const analytics = newsletter.analytics;
    
    if (emailStats.sent) {
      analytics.totalSent++;
    }
    
    if (emailStats.opened) {
      analytics.totalOpened++;
      analytics.lastOpened = new Date();
      newsletter.lastEmailOpened = new Date();
    }
    
    if (emailStats.clicked) {
      analytics.totalClicked++;
      analytics.lastClicked = new Date();
      newsletter.lastEmailClicked = new Date();
    }
    
    if (emailStats.unsubscribed) {
      analytics.totalUnsubscribed++;
      newsletter.status = 'unsubscribed';
      newsletter.unsubscribedAt = new Date();
    }
    
    if (emailStats.bounced) {
      analytics.totalBounced++;
      newsletter.bounceCount++;
      newsletter.lastBounceAt = new Date();
      
      // Hard bounce after 3 bounces
      if (newsletter.bounceCount >= 3) {
        newsletter.status = 'bounced';
      }
    }
    
    if (emailStats.spamReport) {
      analytics.totalSpamReports++;
      newsletter.spamCount++;
      newsletter.lastSpamReportAt = new Date();
      newsletter.status = 'spam';
    }
    
    // Recalculate rates
    if (analytics.totalSent > 0) {
      analytics.openRate = analytics.totalOpened / analytics.totalSent;
      analytics.clickRate = analytics.totalClicked / analytics.totalSent;
      analytics.unsubscribeRate = analytics.totalUnsubscribed / analytics.totalSent;
      analytics.bounceRate = analytics.totalBounced / analytics.totalSent;
      analytics.spamRate = analytics.totalSpamReports / analytics.totalSent;
    }
    
    // Update engagement score
    analytics.engagementScore = newsletterUtils.calculateEngagementScore(analytics);
    analytics.lastUpdated = new Date();
    
    newsletter.updatedAt = new Date();
    
    return newsletter;
  },

  /**
   * Add to history
   */
  addToHistory: (newsletter: Newsletter, action: NewsletterHistory['action'], data?: Partial<NewsletterHistory>): Newsletter => {
    const historyEntry: NewsletterHistory = {
      action,
      timestamp: new Date(),
      source: data?.source,
      campaign: data?.campaign,
      reason: data?.reason,
      ipAddress: data?.ipAddress,
      userAgent: data?.userAgent,
      metadata: data?.metadata || {},
    };
    
    newsletter.history.push(historyEntry);
    newsletter.updatedAt = new Date();
    
    return newsletter;
  },

  /**
   * Subscribe user
   */
  subscribe: (data: CreateNewsletterInput): Newsletter => {
    const newsletter: Newsletter = {
      ...data,
      _id: new ObjectId(),
      status: data.requireDoubleOptIn ? 'pending' : 'active',
      verificationStatus: data.requireDoubleOptIn ? 'pending' : 'verified',
      verificationToken: data.requireDoubleOptIn ? newsletterUtils.generateVerificationToken() : undefined,
      verificationExpiry: data.requireDoubleOptIn ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined, // 24 hours
      subscribedAt: data.requireDoubleOptIn ? undefined : new Date(),
      confirmedAt: data.requireDoubleOptIn ? undefined : new Date(),
      analytics: {
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalUnsubscribed: 0,
        totalBounced: 0,
        totalSpamReports: 0,
        openRate: 0,
        clickRate: 0,
        unsubscribeRate: 0,
        bounceRate: 0,
        spamRate: 0,
        engagementScore: 0,
        clickHeatmap: [],
        deviceBreakdown: {
          desktop: 0,
          mobile: 0,
          tablet: 0,
        },
        locationBreakdown: {},
      },
      history: [{
        action: 'subscribed',
        timestamp: new Date(),
        source: data.source,
        campaign: data.campaign,
        ipAddress: data.location?.ipAddress,
        metadata: {},
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return newsletter;
  },

  /**
   * Confirm subscription
   */
  confirmSubscription: (newsletter: Newsletter): Newsletter => {
    newsletter.status = 'active';
    newsletter.verificationStatus = 'verified';
    newsletter.subscribedAt = new Date();
    newsletter.confirmedAt = new Date();
    newsletter.verificationToken = undefined;
    newsletter.verificationExpiry = undefined;
    
    newsletterUtils.addToHistory(newsletter, 'subscribed', {
      source: 'email_confirmation',
    });
    
    return newsletter;
  },

  /**
   * Unsubscribe user
   */
  unsubscribe: (newsletter: Newsletter, reason?: string, source?: string): Newsletter => {
    newsletter.status = 'unsubscribed';
    newsletter.unsubscribedAt = new Date();
    newsletter.unsubscribeReason = reason;
    newsletter.unsubscribeSource = source;
    
    newsletterUtils.addToHistory(newsletter, 'unsubscribed', {
      reason,
      source,
    });
    
    return newsletterUtils.updateAnalytics(newsletter, { unsubscribed: true });
  },

  /**
   * Resubscribe user
   */
  resubscribe: (newsletter: Newsletter): Newsletter => {
    if (!newsletter.canResubscribe) {
      throw new Error('User cannot resubscribe');
    }
    
    newsletter.status = 'active';
    newsletter.unsubscribedAt = undefined;
    newsletter.unsubscribeReason = undefined;
    newsletter.unsubscribeSource = undefined;
    
    newsletterUtils.addToHistory(newsletter, 'resubscribed');
    
    return newsletter;
  },

  /**
   * Update preferences
   */
  updatePreferences: (newsletter: Newsletter, preferences: Partial<NewsletterPreferences>): Newsletter => {
    newsletter.preferences = {
      ...newsletter.preferences,
      ...preferences,
    };
    
    newsletterUtils.addToHistory(newsletter, 'preferences_updated');
    
    return newsletter;
  },

  /**
   * Filter newsletters
   */
  filterNewsletters: (newsletters: Newsletter[], filter: Partial<NewsletterFilter>): Newsletter[] => {
    return newsletters.filter(newsletter => {
      if (filter.status && newsletter.status !== filter.status) return false;
      if (filter.verificationStatus && newsletter.verificationStatus !== filter.verificationStatus) return false;
      if (filter.source && newsletter.source !== filter.source) return false;
      if (filter.campaign && newsletter.campaign !== filter.campaign) return false;
      if (filter.hasUserId !== undefined && !!newsletter.userId !== filter.hasUserId) return false;
      if (filter.gdprConsent !== undefined && newsletter.gdprConsent !== filter.gdprConsent) return false;
      
      if (filter.segments && filter.segments.length > 0) {
        const hasSegment = filter.segments.some(segment => newsletter.segments.includes(segment));
        if (!hasSegment) return false;
      }
      
      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some(tag => newsletter.tags.includes(tag));
        if (!hasTag) return false;
      }
      
      if (filter.lists && filter.lists.length > 0) {
        const hasList = filter.lists.some(list => newsletter.lists.includes(list));
        if (!hasList) return false;
      }
      
      if (filter.location) {
        if (filter.location.country && newsletter.location?.country !== filter.location.country) return false;
        if (filter.location.state && newsletter.location?.state !== filter.location.state) return false;
        if (filter.location.city && newsletter.location?.city !== filter.location.city) return false;
      }
      
      if (filter.subscribedAfter && (!newsletter.subscribedAt || newsletter.subscribedAt < filter.subscribedAfter)) return false;
      if (filter.subscribedBefore && (!newsletter.subscribedAt || newsletter.subscribedAt > filter.subscribedBefore)) return false;
      
      if (filter.lastActiveAfter) {
        const lastActive = newsletter.lastEmailOpened || newsletter.lastEmailClicked || newsletter.subscribedAt;
        if (!lastActive || lastActive < filter.lastActiveAfter) return false;
      }
      
      if (filter.lastActiveBefore) {
        const lastActive = newsletter.lastEmailOpened || newsletter.lastEmailClicked || newsletter.subscribedAt;
        if (!lastActive || lastActive > filter.lastActiveBefore) return false;
      }
      
      if (filter.minEngagementScore && newsletter.analytics.engagementScore < filter.minEngagementScore) return false;
      if (filter.maxBounceRate && newsletter.analytics.bounceRate > filter.maxBounceRate) return false;
      
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const searchableText = [
          newsletter.email,
          newsletter.firstName || '',
          newsletter.lastName || '',
          newsletter.fullName || '',
          ...newsletter.segments,
          ...newsletter.tags,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      return true;
    });
  },

  /**
   * Sort newsletters
   */
  sortNewsletters: (newsletters: Newsletter[], sortBy: NewsletterFilter['sortBy'], sortOrder: NewsletterFilter['sortOrder']): Newsletter[] => {
    return [...newsletters].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'created_at':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'subscribed_at':
          const subA = a.subscribedAt?.getTime() || 0;
          const subB = b.subscribedAt?.getTime() || 0;
          comparison = subA - subB;
          break;
        case 'last_active':
          const activeA = Math.max(
            a.lastEmailOpened?.getTime() || 0,
            a.lastEmailClicked?.getTime() || 0,
            a.subscribedAt?.getTime() || 0
          );
          const activeB = Math.max(
            b.lastEmailOpened?.getTime() || 0,
            b.lastEmailClicked?.getTime() || 0,
            b.subscribedAt?.getTime() || 0
          );
          comparison = activeA - activeB;
          break;
        case 'engagement_score':
          comparison = a.analytics.engagementScore - b.analytics.engagementScore;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  },

  /**
   * Format for display
   */
  formatForDisplay: (newsletter: Newsletter) => {
    const displayName = newsletter.fullName || 
                       (newsletter.firstName && newsletter.lastName 
                         ? `${newsletter.firstName} ${newsletter.lastName}` 
                         : newsletter.firstName || 
                           newsletter.email.split('@')[0]);
    
    const lastActivity = Math.max(
      newsletter.lastEmailOpened?.getTime() || 0,
      newsletter.lastEmailClicked?.getTime() || 0,
      newsletter.subscribedAt?.getTime() || 0
    );
    
    return {
      id: newsletter._id?.toString(),
      email: newsletter.email,
      name: displayName,
      status: newsletter.status,
      verificationStatus: newsletter.verificationStatus,
      preferences: newsletter.preferences,
      segments: newsletter.segments,
      tags: newsletter.tags,
      location: newsletter.location,
      analytics: {
        engagementScore: newsletter.analytics.engagementScore,
        openRate: Math.round(newsletter.analytics.openRate * 100),
        clickRate: Math.round(newsletter.analytics.clickRate * 100),
        totalSent: newsletter.analytics.totalSent,
      },
      activity: {
        subscribedAt: newsletter.subscribedAt,
        lastActive: lastActivity > 0 ? new Date(lastActivity) : null,
        lastEmailSent: newsletter.lastEmailSent,
        lastEmailOpened: newsletter.lastEmailOpened,
        lastEmailClicked: newsletter.lastEmailClicked,
      },
      compliance: {
        gdprConsent: newsletter.gdprConsent,
        marketingConsent: newsletter.marketingConsent,
        canResubscribe: newsletter.canResubscribe,
      },
      source: newsletter.source,
      campaign: newsletter.campaign,
      createdAt: newsletter.createdAt,
      updatedAt: newsletter.updatedAt,
    };
  },

  /**
   * Calculate statistics
   */
  calculateStats: (newsletters: Newsletter[]): NewsletterStats => {
    if (newsletters.length === 0) {
      return {
        totalSubscribers: 0,
        activeSubscribers: 0,
        pendingSubscribers: 0,
        unsubscribedCount: 0,
        bouncedCount: 0,
        spamCount: 0,
        growthRate: 0,
        churnRate: 0,
        engagementMetrics: {
          averageOpenRate: 0,
          averageClickRate: 0,
          averageEngagementScore: 0,
        },
        segmentBreakdown: [],
        sourceBreakdown: [],
        locationBreakdown: [],
        subscribersByMonth: [],
        topPerformingSegments: [],
      };
    }
    
    const totalSubscribers = newsletters.length;
    const activeSubscribers = newsletters.filter(n => n.status === 'active').length;
    const pendingSubscribers = newsletters.filter(n => n.status === 'pending').length;
    const unsubscribedCount = newsletters.filter(n => n.status === 'unsubscribed').length;
    const bouncedCount = newsletters.filter(n => n.status === 'bounced').length;
    const spamCount = newsletters.filter(n => n.status === 'spam').length;
    
    // Calculate rates
    const churnRate = totalSubscribers > 0 ? unsubscribedCount / totalSubscribers : 0;
    
    // Engagement metrics
    const totalOpenRate = newsletters.reduce((sum, n) => sum + n.analytics.openRate, 0);
    const totalClickRate = newsletters.reduce((sum, n) => sum + n.analytics.clickRate, 0);
    const totalEngagementScore = newsletters.reduce((sum, n) => sum + n.analytics.engagementScore, 0);
    
    const averageOpenRate = totalOpenRate / totalSubscribers;
    const averageClickRate = totalClickRate / totalSubscribers;
    const averageEngagementScore = totalEngagementScore / totalSubscribers;
    
    // Segment breakdown
    const segmentCounts: Record<string, number> = {};
    newsletters.forEach(newsletter => {
      newsletter.segments.forEach(segment => {
        segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
      });
    });
    
    const segmentBreakdown = Object.entries(segmentCounts)
      .map(([segment, count]) => ({
        segment,
        count,
        percentage: count / totalSubscribers,
      }))
      .sort((a, b) => b.count - a.count);
    
    // Source breakdown
    const sourceCounts: Record<string, number> = {};
    newsletters.forEach(newsletter => {
      const source = newsletter.source || 'unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    
    const sourceBreakdown = Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: count / totalSubscribers,
      }))
      .sort((a, b) => b.count - a.count);
    
    // Location breakdown
    const locationCounts: Record<string, number> = {};
    newsletters.forEach(newsletter => {
      const country = newsletter.location?.country || 'unknown';
      locationCounts[country] = (locationCounts[country] || 0) + 1;
    });
    
    const locationBreakdown = Object.entries(locationCounts)
      .map(([country, count]) => ({
        country,
        count,
        percentage: count / totalSubscribers,
      }))
      .sort((a, b) => b.count - a.count);
    
    return {
      totalSubscribers,
      activeSubscribers,
      pendingSubscribers,
      unsubscribedCount,
      bouncedCount,
      spamCount,
      growthRate: 0, // Would need historical data
      churnRate,
      engagementMetrics: {
        averageOpenRate,
        averageClickRate,
        averageEngagementScore,
      },
      segmentBreakdown,
      sourceBreakdown,
      locationBreakdown,
      subscribersByMonth: [], // Would need time-based aggregation
      topPerformingSegments: [], // Would need segment performance data
    };
  },

  /**
   * Export data
   */
  exportData: (newsletters: Newsletter[], format: 'json' | 'csv' = 'json') => {
    const exportData = newsletters.map(newsletter => ({
      email: newsletter.email,
      name: newsletter.fullName || `${newsletter.firstName || ''} ${newsletter.lastName || ''}`.trim(),
      status: newsletter.status,
      subscribedAt: newsletter.subscribedAt,
      source: newsletter.source,
      segments: newsletter.segments.join(', '),
      tags: newsletter.tags.join(', '),
      openRate: Math.round(newsletter.analytics.openRate * 100),
      clickRate: Math.round(newsletter.analytics.clickRate * 100),
      engagementScore: newsletter.analytics.engagementScore,
      location: newsletter.location?.country,
      gdprConsent: newsletter.gdprConsent,
      createdAt: newsletter.createdAt,
    }));
    
    return format === 'json' ? JSON.stringify(exportData, null, 2) : exportData;
  },

  /**
   * Generate unsubscribe URL
   */
  generateUnsubscribeUrl: (newsletter: Newsletter, baseUrl: string = ''): string => {
    const token = Buffer.from(newsletter.email).toString('base64');
    return `${baseUrl}/newsletter/unsubscribe?token=${token}`;
  },

  /**
   * Generate preference center URL
   */
  generatePreferenceCenterUrl: (newsletter: Newsletter, baseUrl: string = ''): string => {
    const token = Buffer.from(newsletter.email).toString('base64');
    return `${baseUrl}/newsletter/preferences?token=${token}`;
  },

  /**
   * Validate email domain
   */
  validateEmailDomain: (email: string): boolean => {
    const disposableDomainsPattern = /(10minutemail|tempmail|guerrillamail|mailinator|yopmail)/i;
    const domain = email.split('@')[1];
    return !disposableDomainsPattern.test(domain);
  },

  /**
   * Segment subscribers
   */
  segmentSubscribers: (newsletters: Newsletter[], criteria: {
    engagementLevel?: 'high' | 'medium' | 'low';
    activityPeriod?: 'active' | 'inactive' | 'new';
    location?: string;
    source?: string;
  }): Newsletter[] => {
    return newsletters.filter(newsletter => {
      if (criteria.engagementLevel) {
        const score = newsletter.analytics.engagementScore;
        if (criteria.engagementLevel === 'high' && score < 70) return false;
        if (criteria.engagementLevel === 'medium' && (score < 30 || score >= 70)) return false;
        if (criteria.engagementLevel === 'low' && score >= 30) return false;
      }
      
      if (criteria.activityPeriod) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const lastActivity = newsletter.lastEmailOpened || newsletter.lastEmailClicked;
        
        if (criteria.activityPeriod === 'active' && (!lastActivity || lastActivity < thirtyDaysAgo)) return false;
        if (criteria.activityPeriod === 'inactive' && lastActivity && lastActivity >= thirtyDaysAgo) return false;
        if (criteria.activityPeriod === 'new' && newsletter.createdAt < thirtyDaysAgo) return false;
      }
      
      if (criteria.location && newsletter.location?.country !== criteria.location) return false;
      if (criteria.source && newsletter.source !== criteria.source) return false;
      
      return true;
    });
  },
};

/**
 * Default newsletter values
 */
export const defaultNewsletter: Partial<Newsletter> = {
  status: 'pending',
  verificationStatus: 'pending',
  requireDoubleOptIn: true,
  canResubscribe: true,
  gdprConsent: false,
  ccpaOptOut: false,
  dataProcessingConsent: false,
  marketingConsent: false,
  bounceCount: 0,
  spamCount: 0,
  segments: [],
  tags: [],
  lists: [],
  customFields: {},
  preferences: {
    frequency: 'weekly',
    categories: [],
    topics: [],
    contentTypes: ['articles'],
    language: 'en',
    timezone: 'UTC',
    sendTime: { hour: 9 },
    format: 'html',
    personalizedContent: true,
    includeRecommendations: true,
  },
  analytics: {
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalUnsubscribed: 0,
    totalBounced: 0,
    totalSpamReports: 0,
    openRate: 0,
    clickRate: 0,
    unsubscribeRate: 0,
    bounceRate: 0,
    spamRate: 0,
    engagementScore: 0,
    clickHeatmap: [],
    deviceBreakdown: {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    },
    locationBreakdown: {},
  },
  history: [],
};

const NewsletterModel = {
  NewsletterSchema,
  CreateNewsletterSchema,
  UpdateNewsletterSchema,
  NewsletterFilterSchema,
  NewsletterStatsSchema,
  NewsletterPreferencesSchema,
  NewsletterAnalyticsSchema,
  NewsletterHistorySchema,
  validateNewsletter,
  validateCreateNewsletter,
  validateUpdateNewsletter,
  validateNewsletterFilter,
  newsletterUtils,
  defaultNewsletter,
};

export default NewsletterModel;