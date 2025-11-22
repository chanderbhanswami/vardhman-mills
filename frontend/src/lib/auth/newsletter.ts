/**
 * Newsletter Service
 * Handles newsletter subscription, unsubscription, and email campaigns
 */

import { RecaptchaAPI } from './recaptcha';

/**
 * Newsletter Subscription Interface
 */
export interface NewsletterSubscription {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  preferences: {
    productUpdates: boolean;
    promotions: boolean;
    companyNews: boolean;
    industryInsights: boolean;
  };
  status: 'active' | 'pending' | 'unsubscribed' | 'bounced';
  subscribedAt: Date;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  source: 'website' | 'checkout' | 'manual' | 'import';
  tags: string[];
  metadata: Record<string, unknown>;
}

/**
 * Newsletter Subscription Request
 */
export interface NewsletterSubscriptionRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  preferences?: Partial<NewsletterSubscription['preferences']>;
  source?: NewsletterSubscription['source'];
  tags?: string[];
  recaptchaToken?: string;
}

/**
 * Newsletter Campaign Interface
 */
export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  htmlContent: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  createdAt: Date;
  scheduledAt?: Date;
  sentAt?: Date;
  recipients: {
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  tags: string[];
  segment?: string;
}

/**
 * Newsletter Statistics
 */
export interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  pendingConfirmation: number;
  unsubscribed: number;
  bounced: number;
  growthRate: number;
  engagementRate: number;
  averageOpenRate: number;
  averageClickRate: number;
}

/**
 * Newsletter Service Configuration
 */
const NEWSLETTER_CONFIG = {
  apiEndpoint: '/api/newsletter',
  confirmationRequired: true,
  maxRetries: 3,
  defaultPreferences: {
    productUpdates: true,
    promotions: false,
    companyNews: true,
    industryInsights: false,
  },
  emailTemplates: {
    confirmation: 'newsletter-confirmation',
    welcome: 'newsletter-welcome',
    unsubscribe: 'newsletter-unsubscribe',
  },
} as const;

/**
 * Newsletter Service Class
 */
export class NewsletterService {
  private static instance: NewsletterService;
  private subscriptions = new Map<string, NewsletterSubscription>();
  private campaigns = new Map<string, NewsletterCampaign>();

  private constructor() {}

  public static getInstance(): NewsletterService {
    if (!NewsletterService.instance) {
      NewsletterService.instance = new NewsletterService();
    }
    return NewsletterService.instance;
  }

  /**
   * Subscribe to newsletter
   */
  async subscribe(request: NewsletterSubscriptionRequest): Promise<{
    success: boolean;
    subscription?: NewsletterSubscription;
    error?: string;
    requiresConfirmation?: boolean;
  }> {
    try {
      // Validate email
      if (!this.isValidEmail(request.email)) {
        return {
          success: false,
          error: 'Invalid email address',
        };
      }

      // Verify reCAPTCHA if provided
      if (request.recaptchaToken) {
        const recaptchaResult = await this.verifyRecaptcha(request.recaptchaToken);
        if (!recaptchaResult.success) {
          return {
            success: false,
            error: 'reCAPTCHA verification failed',
          };
        }
      }

      // Check if already subscribed
      const existingSubscription = this.findSubscriptionByEmail(request.email);
      if (existingSubscription) {
        if (existingSubscription.status === 'active') {
          return {
            success: false,
            error: 'Email already subscribed',
          };
        }
        
        if (existingSubscription.status === 'pending') {
          // Resend confirmation
          await this.sendConfirmationEmail(existingSubscription);
          return {
            success: true,
            subscription: existingSubscription,
            requiresConfirmation: true,
          };
        }
      }

      // Create new subscription
      const subscription: NewsletterSubscription = {
        id: this.generateId(),
        email: request.email.toLowerCase().trim(),
        firstName: request.firstName?.trim(),
        lastName: request.lastName?.trim(),
        preferences: {
          ...NEWSLETTER_CONFIG.defaultPreferences,
          ...request.preferences,
        },
        status: NEWSLETTER_CONFIG.confirmationRequired ? 'pending' : 'active',
        subscribedAt: new Date(),
        source: request.source || 'website',
        tags: request.tags || [],
        metadata: {},
      };

      // Store subscription
      this.subscriptions.set(subscription.id, subscription);

      // Send confirmation email if required
      if (NEWSLETTER_CONFIG.confirmationRequired) {
        await this.sendConfirmationEmail(subscription);
        return {
          success: true,
          subscription,
          requiresConfirmation: true,
        };
      }

      // Send welcome email for immediate subscription
      await this.sendWelcomeEmail(subscription);

      return {
        success: true,
        subscription,
        requiresConfirmation: false,
      };
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return {
        success: false,
        error: 'Failed to subscribe to newsletter',
      };
    }
  }

  /**
   * Confirm newsletter subscription
   */
  async confirmSubscription(token: string): Promise<{
    success: boolean;
    subscription?: NewsletterSubscription;
    error?: string;
  }> {
    try {
      // Find subscription by token (simplified - in real implementation, decode JWT token)
      const subscription = Array.from(this.subscriptions.values()).find(
        sub => sub.id === token && sub.status === 'pending'
      );

      if (!subscription) {
        return {
          success: false,
          error: 'Invalid or expired confirmation token',
        };
      }

      // Update subscription status
      subscription.status = 'active';
      subscription.confirmedAt = new Date();

      // Send welcome email
      await this.sendWelcomeEmail(subscription);

      return {
        success: true,
        subscription,
      };
    } catch (error) {
      console.error('Newsletter confirmation error:', error);
      return {
        success: false,
        error: 'Failed to confirm subscription',
      };
    }
  }

  /**
   * Unsubscribe from newsletter
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async unsubscribe(email: string, _token?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const subscription = this.findSubscriptionByEmail(email);
      
      if (!subscription) {
        return {
          success: false,
          error: 'Email not found in subscription list',
        };
      }

      if (subscription.status === 'unsubscribed') {
        return {
          success: true, // Already unsubscribed
        };
      }

      // Update subscription status
      subscription.status = 'unsubscribed';
      subscription.unsubscribedAt = new Date();

      // Send unsubscribe confirmation email
      await this.sendUnsubscribeEmail(subscription);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      return {
        success: false,
        error: 'Failed to unsubscribe',
      };
    }
  }

  /**
   * Update subscription preferences
   */
  async updatePreferences(
    email: string,
    preferences: Partial<NewsletterSubscription['preferences']>
  ): Promise<{
    success: boolean;
    subscription?: NewsletterSubscription;
    error?: string;
  }> {
    try {
      const subscription = this.findSubscriptionByEmail(email);
      
      if (!subscription || subscription.status === 'unsubscribed') {
        return {
          success: false,
          error: 'Subscription not found or inactive',
        };
      }

      // Update preferences
      subscription.preferences = {
        ...subscription.preferences,
        ...preferences,
      };

      return {
        success: true,
        subscription,
      };
    } catch (error) {
      console.error('Newsletter preferences update error:', error);
      return {
        success: false,
        error: 'Failed to update preferences',
      };
    }
  }

  /**
   * Get subscription by email
   */
  async getSubscription(email: string): Promise<NewsletterSubscription | null> {
    return this.findSubscriptionByEmail(email);
  }

  /**
   * Get newsletter statistics
   */
  async getStats(): Promise<NewsletterStats> {
    const subscriptions = Array.from(this.subscriptions.values());
    const campaigns = Array.from(this.campaigns.values());

    const activeSubscribers = subscriptions.filter(sub => sub.status === 'active').length;
    const pendingConfirmation = subscriptions.filter(sub => sub.status === 'pending').length;
    const unsubscribed = subscriptions.filter(sub => sub.status === 'unsubscribed').length;
    const bounced = subscriptions.filter(sub => sub.status === 'bounced').length;

    // Calculate engagement rates from campaigns
    const sentCampaigns = campaigns.filter(campaign => campaign.status === 'sent');
    const totalSent = sentCampaigns.reduce((sum, campaign) => sum + campaign.recipients.sent, 0);
    const totalOpened = sentCampaigns.reduce((sum, campaign) => sum + campaign.recipients.opened, 0);
    const totalClicked = sentCampaigns.reduce((sum, campaign) => sum + campaign.recipients.clicked, 0);

    return {
      totalSubscribers: subscriptions.length,
      activeSubscribers,
      pendingConfirmation,
      unsubscribed,
      bounced,
      growthRate: this.calculateGrowthRate(subscriptions),
      engagementRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      averageOpenRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      averageClickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
    };
  }

  /**
   * Send newsletter campaign
   */
  async sendCampaign(campaign: Omit<NewsletterCampaign, 'id' | 'createdAt' | 'recipients'>): Promise<{
    success: boolean;
    campaign?: NewsletterCampaign;
    error?: string;
  }> {
    try {
      const newCampaign: NewsletterCampaign = {
        ...campaign,
        id: this.generateId(),
        createdAt: new Date(),
        recipients: {
          total: 0,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0,
        },
      };

      // Get target subscribers
      const subscribers = this.getTargetSubscribers(campaign.segment, campaign.tags);
      newCampaign.recipients.total = subscribers.length;

      // Store campaign
      this.campaigns.set(newCampaign.id, newCampaign);

      // Send emails (simplified - in real implementation, use queue)
      if (campaign.status === 'sending') {
        await this.processCampaignSending(newCampaign, subscribers);
      }

      return {
        success: true,
        campaign: newCampaign,
      };
    } catch (error) {
      console.error('Newsletter campaign error:', error);
      return {
        success: false,
        error: 'Failed to send campaign',
      };
    }
  }

  /**
   * Private helper methods
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private findSubscriptionByEmail(email: string): NewsletterSubscription | null {
    return Array.from(this.subscriptions.values()).find(
      sub => sub.email === email.toLowerCase().trim()
    ) || null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async verifyRecaptcha(_token: string): Promise<{ success: boolean }> {
    try {
      const result = await RecaptchaAPI.validateNewsletter({ email: '' });
      return { success: !!result.token };
    } catch {
      return { success: false };
    }
  }

  private async sendConfirmationEmail(subscription: NewsletterSubscription): Promise<void> {
    // In real implementation, send actual email
    console.log(`Sending confirmation email to ${subscription.email}`);
    
    // Simulate email sending
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Confirmation email sent to ${subscription.email}`);
        resolve();
      }, 100);
    });
  }

  private async sendWelcomeEmail(subscription: NewsletterSubscription): Promise<void> {
    console.log(`Sending welcome email to ${subscription.email}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Welcome email sent to ${subscription.email}`);
        resolve();
      }, 100);
    });
  }

  private async sendUnsubscribeEmail(subscription: NewsletterSubscription): Promise<void> {
    console.log(`Sending unsubscribe confirmation to ${subscription.email}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Unsubscribe confirmation sent to ${subscription.email}`);
        resolve();
      }, 100);
    });
  }

  private calculateGrowthRate(subscriptions: NewsletterSubscription[]): number {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const recentSubscriptions = subscriptions.filter(
      sub => sub.subscribedAt >= lastMonth && sub.status === 'active'
    );
    
    const totalActive = subscriptions.filter(sub => sub.status === 'active').length;
    
    return totalActive > 0 ? (recentSubscriptions.length / totalActive) * 100 : 0;
  }

  private getTargetSubscribers(segment?: string, tags?: string[]): NewsletterSubscription[] {
    let subscribers = Array.from(this.subscriptions.values()).filter(
      sub => sub.status === 'active'
    );

    // Apply segment filter
    if (segment) {
      // Implement segment logic based on your needs
      subscribers = subscribers.filter(sub => {
        switch (segment) {
          case 'new_subscribers':
            return Date.now() - sub.subscribedAt.getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days
          case 'engaged':
            return true; // Implement engagement logic
          default:
            return true;
        }
      });
    }

    // Apply tags filter
    if (tags && tags.length > 0) {
      subscribers = subscribers.filter(sub =>
        tags.some(tag => sub.tags.includes(tag))
      );
    }

    return subscribers;
  }

  private async processCampaignSending(
    campaign: NewsletterCampaign,
    subscribers: NewsletterSubscription[]
  ): Promise<void> {
    // Simulate campaign sending
    campaign.status = 'sending';
    
    for (const subscriber of subscribers) {
      try {
        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 10));
        campaign.recipients.sent++;
        
        // Simulate delivery and engagement (simplified)
        if (Math.random() > 0.05) { // 95% delivery rate
          campaign.recipients.delivered++;
          
          if (Math.random() > 0.7) { // 30% open rate
            campaign.recipients.opened++;
            
            if (Math.random() > 0.9) { // 10% click rate of opens
              campaign.recipients.clicked++;
            }
          }
        } else {
          campaign.recipients.bounced++;
        }
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
      }
    }
    
    campaign.status = 'sent';
    campaign.sentAt = new Date();
  }
}

// Export singleton instance
export const newsletterService = NewsletterService.getInstance();

/**
 * Newsletter API functions
 */
export const NewsletterAPI = {
  /**
   * Subscribe to newsletter with reCAPTCHA
   */
  async subscribe(request: NewsletterSubscriptionRequest): Promise<{
    success: boolean;
    subscription?: NewsletterSubscription;
    error?: string;
    requiresConfirmation?: boolean;
  }> {
    // Add reCAPTCHA validation
    try {
      const recaptchaResult = await RecaptchaAPI.validateNewsletter({
        email: request.email,
      });
      
      if (!recaptchaResult.isValid) {
        return {
          success: false,
          error: 'Please verify that you are not a robot',
        };
      }

      request.recaptchaToken = recaptchaResult.token;
      return await newsletterService.subscribe(request);
    } catch (error) {
      console.error('Newsletter subscription API error:', error);
      return {
        success: false,
        error: 'Failed to subscribe to newsletter',
      };
    }
  },

  /**
   * Confirm subscription
   */
  async confirm(token: string): Promise<{
    success: boolean;
    subscription?: NewsletterSubscription;
    error?: string;
  }> {
    return await newsletterService.confirmSubscription(token);
  },

  /**
   * Unsubscribe from newsletter
   */
  async unsubscribe(email: string, token?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    return await newsletterService.unsubscribe(email, token);
  },

  /**
   * Update preferences
   */
  async updatePreferences(
    email: string,
    preferences: Partial<NewsletterSubscription['preferences']>
  ): Promise<{
    success: boolean;
    subscription?: NewsletterSubscription;
    error?: string;
  }> {
    return await newsletterService.updatePreferences(email, preferences);
  },

  /**
   * Get subscription status
   */
  async getStatus(email: string): Promise<NewsletterSubscription | null> {
    return await newsletterService.getSubscription(email);
  },

  /**
   * Get statistics
   */
  async getStats(): Promise<NewsletterStats> {
    return await newsletterService.getStats();
  },
};

/**
 * Newsletter React Hook
 */
export function useNewsletter() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<NewsletterSubscription | null>(null);

  const subscribe = async (request: Omit<NewsletterSubscriptionRequest, 'recaptchaToken'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await NewsletterAPI.subscribe(request);
      
      if (result.success) {
        setSubscription(result.subscription || null);
        setIsSubscribed(true);
      } else {
        setError(result.error || 'Subscription failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Subscription failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await NewsletterAPI.unsubscribe(email);
      
      if (result.success) {
        setIsSubscribed(false);
        setSubscription(null);
      } else {
        setError(result.error || 'Unsubscribe failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unsubscribe failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async (email: string) => {
    try {
      const result = await NewsletterAPI.getStatus(email);
      setSubscription(result);
      setIsSubscribed(result?.status === 'active');
      return result;
    } catch (err) {
      console.error('Failed to check newsletter status:', err);
      return null;
    }
  };

  return {
    isSubscribed,
    isLoading,
    error,
    subscription,
    subscribe,
    unsubscribe,
    checkStatus,
  };
}

// Basic useState implementation for non-React environments
function useState<T>(initialState: T): [T, (value: T) => void] {
  if (typeof window === 'undefined') {
    return [initialState, () => {}];
  }
  
  let state = initialState;
  const setState = (newState: T) => {
    state = newState;
  };
  
  return [state, setState];
}