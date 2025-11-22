/**
 * Nodemailer Email Service
 * Comprehensive email service using Nodemailer with advanced features
 */

import nodemailer, { Transporter, SendMailOptions, SentMessageInfo } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { z } from 'zod';
import { emailConfig, EmailServiceConfig, SMTPTestResult } from './smtp.config';

/**
 * Email Attachment Schema
 */
const EmailAttachmentSchema = z.object({
  filename: z.string(),
  content: z.union([z.string(), z.instanceof(Buffer)]).optional(),
  path: z.string().optional(),
  href: z.string().url().optional(),
  contentType: z.string().optional(),
  contentDisposition: z.enum(['attachment', 'inline']).default('attachment'),
  cid: z.string().optional(), // Content ID for inline attachments
  encoding: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  raw: z.string().optional(),
});

/**
 * Email Options Schema
 */
const EmailOptionsSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  from: z.object({
    name: z.string(),
    email: z.string().email(),
  }).optional(),
  replyTo: z.union([z.string().email(), z.object({
    name: z.string(),
    email: z.string().email(),
  })]).optional(),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  subject: z.string().min(1, 'Subject is required'),
  text: z.string().optional(),
  html: z.string().optional(),
  attachments: z.array(EmailAttachmentSchema).optional(),
  priority: z.enum(['high', 'normal', 'low']).default('normal'),
  headers: z.record(z.string(), z.string()).optional(),
  messageId: z.string().optional(),
  date: z.date().optional(),
  encoding: z.string().optional(),
  raw: z.string().optional(),
  textEncoding: z.enum(['quoted-printable', 'base64']).optional(),
  amp: z.string().optional(), // AMP4EMAIL
  icalEvent: z.object({
    filename: z.string().optional(),
    method: z.string().optional(),
    content: z.string(),
  }).optional(),
  alternatives: z.array(z.object({
    contentType: z.string(),
    content: z.union([z.string(), z.instanceof(Buffer)]),
  })).optional(),
  list: z.object({
    help: z.string().url().optional(),
    unsubscribe: z.union([z.string().url(), z.array(z.string().url())]).optional(),
    subscribe: z.string().url().optional(),
    post: z.string().url().optional(),
    owner: z.union([z.string().email(), z.array(z.string().email())]).optional(),
    archive: z.string().url().optional(),
  }).optional(),
});

export type EmailAttachment = z.infer<typeof EmailAttachmentSchema>;
export type EmailOptions = z.infer<typeof EmailOptionsSchema>;

/**
 * Email Send Result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  pending?: string[];
  response?: string;
  envelope?: {
    from: string;
    to: string[];
  };
  error?: string;
  timestamp: Date;
  provider: string;
}

/**
 * Email Queue Item
 */
export interface EmailQueueItem {
  id: string;
  options: EmailOptions;
  attempts: number;
  lastAttempt?: Date;
  nextAttempt?: Date;
  createdAt: Date;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  error?: string;
  result?: EmailSendResult;
}

/**
 * Email Statistics
 */
export interface EmailStats {
  sent: number;
  failed: number;
  pending: number;
  totalAttempts: number;
  successRate: number;
  averageResponseTime: number;
  lastSent?: Date;
  errors: {
    message: string;
    count: number;
    lastOccurred: Date;
  }[];
}

/**
 * Nodemailer Email Service Class
 */
class NodemailerService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;
  private config: EmailServiceConfig;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;
  private stats: EmailStats = {
    sent: 0,
    failed: 0,
    pending: 0,
    totalAttempts: 0,
    successRate: 0,
    averageResponseTime: 0,
    errors: [],
  };
  private queue: EmailQueueItem[] = [];
  private isProcessingQueue = false;

  constructor(config?: Partial<EmailServiceConfig>) {
    this.config = { ...emailConfig, ...config };
    this.initializeTransporter();
  }

  /**
   * Initialize Nodemailer Transporter
   */
  private initializeTransporter(): void {
    try {
      const transporterOptions: SMTPTransport.Options = {
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.auth.user,
          pass: this.config.auth.pass,
        },
        tls: this.config.tls,
        name: 'vardhman-mills',
        logger: process.env.NODE_ENV === 'development',
        debug: process.env.NODE_ENV === 'development',
      };

      this.transporter = nodemailer.createTransport(transporterOptions);

      // Handle transporter events if available
      if (this.transporter) {
        this.transporter.on?.('idle', () => {
          console.log('📧 SMTP transporter is idle');
          this.processQueue();
        });

        this.transporter.on?.('error', (error) => {
          console.error('📧 SMTP transporter error:', error);
          this.isConnected = false;
          this.addError(error.message);
        });
      }

    } catch (error) {
      console.error('📧 Failed to initialize email transporter:', error);
      throw new Error(`Email service initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test SMTP Connection
   */
  public async testConnection(): Promise<SMTPTestResult> {
    const startTime = Date.now();
    
    try {
      if (!this.transporter) {
        throw new Error('Transporter not initialized');
      }

      const verified = await this.transporter.verify();
      const responseTime = Date.now() - startTime;

      const result: SMTPTestResult = {
        success: verified,
        provider: this.config.provider,
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        responseTime,
        details: {
          authentication: true,
          connection: true,
          tlsSupport: this.config.secure || false,
        },
      };

      this.isConnected = verified;
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        provider: this.config.provider,
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          authentication: false,
          connection: false,
          tlsSupport: false,
        },
      };
    }
  }

  /**
   * Connect to SMTP Server
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.performConnection();
    return this.connectionPromise;
  }

  private async performConnection(): Promise<void> {
    try {
      const testResult = await this.testConnection();
      if (!testResult.success) {
        throw new Error(testResult.error || 'Connection test failed');
      }
      console.log('📧 Email service connected successfully');
    } catch (error) {
      console.error('📧 Failed to connect to email service:', error);
      throw error;
    } finally {
      this.connectionPromise = null;
    }
  }

  /**
   * Send Email
   */
  public async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    const startTime = Date.now();
    this.stats.totalAttempts++;

    try {
      // Validate options
      const validatedOptions = EmailOptionsSchema.parse(options);

      // Ensure connection
      await this.connect();

      if (!this.transporter) {
        throw new Error('Email transporter not available');
      }

      // Prepare mail options
      const mailOptions: SendMailOptions = {
        ...validatedOptions,
        from: validatedOptions.from ? 
          `"${validatedOptions.from.name}" <${validatedOptions.from.email}>` :
          `"${this.config.from.name}" <${this.config.from.email}>`,
        replyTo: validatedOptions.replyTo ? 
          (typeof validatedOptions.replyTo === 'string' ? 
            validatedOptions.replyTo : 
            `"${validatedOptions.replyTo.name}" <${validatedOptions.replyTo.email}>`) :
          (this.config.replyTo ? 
            `"${this.config.replyTo.name}" <${this.config.replyTo.email}>` : 
            undefined),
      };

      // Add tracking if enabled
      if (this.config.tracking.enabled && validatedOptions.html) {
        mailOptions.html = this.addEmailTracking(validatedOptions.html, validatedOptions.to);
      }

      // Send email
      const info: SentMessageInfo = await this.transporter.sendMail(mailOptions);

      // Update statistics
      this.stats.sent++;
      this.stats.lastSent = new Date();
      this.updateSuccessRate();

      const result: EmailSendResult = {
        success: true,
        messageId: info.messageId,
        accepted: info.accepted as string[],
        rejected: info.rejected as string[],
        pending: info.pending as string[],
        response: info.response,
        envelope: info.envelope ? {
          from: info.envelope.from,
          to: Array.isArray(info.envelope.to) ? info.envelope.to : [info.envelope.to],
        } : undefined,
        timestamp: new Date(),
        provider: this.config.provider,
      };

      console.log('📧 Email sent successfully:', {
        messageId: result.messageId,
        to: validatedOptions.to,
        subject: validatedOptions.subject,
        responseTime: Date.now() - startTime,
      });

      return result;

    } catch (error) {
      this.stats.failed++;
      this.updateSuccessRate();
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addError(errorMessage);

      const result: EmailSendResult = {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
        provider: this.config.provider,
      };

      console.error('📧 Failed to send email:', {
        error: errorMessage,
        to: options.to,
        subject: options.subject,
        responseTime: Date.now() - startTime,
      });

      return result;
    }
  }

  /**
   * Send Bulk Emails
   */
  public async sendBulkEmails(emails: EmailOptions[]): Promise<EmailSendResult[]> {
    const results: EmailSendResult[] = [];
    const batchSize = this.config.maxConnections || 5;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchPromises = batch.map(email => this.sendEmail(email));
      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Unknown error',
            timestamp: new Date(),
            provider: this.config.provider,
          });
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, this.config.rateDelta || 1000));
      }
    }

    return results;
  }

  /**
   * Add Email to Queue
   */
  public async queueEmail(options: EmailOptions): Promise<string> {
    const queueItem: EmailQueueItem = {
      id: this.generateId(),
      options,
      attempts: 0,
      createdAt: new Date(),
      status: 'pending',
    };

    this.queue.push(queueItem);
    this.stats.pending++;

    // Start processing queue if not already processing
    if (!this.isProcessingQueue) {
      this.processQueue();
    }

    return queueItem.id;
  }

  /**
   * Process Email Queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.queue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      const pendingItems = this.queue.filter(item => 
        item.status === 'pending' && 
        (!item.nextAttempt || item.nextAttempt <= new Date())
      );

      for (const item of pendingItems) {
        if (item.attempts >= 3) { // Max retries
          item.status = 'failed';
          item.error = 'Maximum retry attempts exceeded';
          this.stats.pending--;
          this.stats.failed++;
          continue;
        }

        item.status = 'processing';
        item.attempts++;
        item.lastAttempt = new Date();

        try {
          const result = await this.sendEmail(item.options);
          
          if (result.success) {
            item.status = 'sent';
            item.result = result;
            this.stats.pending--;
          } else {
            item.status = 'pending';
            item.error = result.error;
            item.nextAttempt = new Date(Date.now() + (item.attempts * 5000)); // Exponential backoff
          }
        } catch (error) {
          item.status = 'pending';
          item.error = error instanceof Error ? error.message : 'Unknown error';
          item.nextAttempt = new Date(Date.now() + (item.attempts * 5000));
        }
      }

    } finally {
      this.isProcessingQueue = false;
      
      // Schedule next queue processing
      setTimeout(() => this.processQueue(), 5000);
    }
  }

  /**
   * Get Queue Status
   */
  public getQueueStatus(): {
    pending: number;
    processing: number;
    sent: number;
    failed: number;
    total: number;
  } {
    const pending = this.queue.filter(item => item.status === 'pending').length;
    const processing = this.queue.filter(item => item.status === 'processing').length;
    const sent = this.queue.filter(item => item.status === 'sent').length;
    const failed = this.queue.filter(item => item.status === 'failed').length;

    return {
      pending,
      processing,
      sent,
      failed,
      total: this.queue.length,
    };
  }

  /**
   * Clear Queue
   */
  public clearQueue(): void {
    this.queue = [];
    this.stats.pending = 0;
  }

  /**
   * Get Statistics
   */
  public getStats(): EmailStats {
    return { ...this.stats };
  }

  /**
   * Reset Statistics
   */
  public resetStats(): void {
    this.stats = {
      sent: 0,
      failed: 0,
      pending: 0,
      totalAttempts: 0,
      successRate: 0,
      averageResponseTime: 0,
      errors: [],
    };
  }

  /**
   * Close Connection
   */
  public async close(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
      this.transporter = null;
    }
    this.isConnected = false;
    console.log('📧 Email service connection closed');
  }

  /**
   * Add Email Tracking
   */
  private addEmailTracking(html: string, to: string | string[]): string {
    if (!this.config.tracking.enabled || !this.config.tracking.pixelUrl) {
      return html;
    }

    const recipients = Array.isArray(to) ? to.join(',') : to;
    const trackingId = Buffer.from(`${recipients}:${Date.now()}`).toString('base64');
    const pixelUrl = `${this.config.tracking.pixelUrl}?id=${trackingId}`;
    
    const trackingPixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
    
    // Add tracking pixel before closing body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', `${trackingPixel}</body>`);
    }
    
    // If no body tag, append at the end
    return html + trackingPixel;
  }

  /**
   * Add Error to Statistics
   */
  private addError(message: string): void {
    const existingError = this.stats.errors.find(error => error.message === message);
    
    if (existingError) {
      existingError.count++;
      existingError.lastOccurred = new Date();
    } else {
      this.stats.errors.push({
        message,
        count: 1,
        lastOccurred: new Date(),
      });
    }

    // Keep only last 10 unique errors
    if (this.stats.errors.length > 10) {
      this.stats.errors.sort((a, b) => b.lastOccurred.getTime() - a.lastOccurred.getTime());
      this.stats.errors = this.stats.errors.slice(0, 10);
    }
  }

  /**
   * Update Success Rate
   */
  private updateSuccessRate(): void {
    if (this.stats.totalAttempts > 0) {
      this.stats.successRate = (this.stats.sent / this.stats.totalAttempts) * 100;
    }
  }

  /**
   * Generate Unique ID
   */
  private generateId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Singleton Email Service Instance
 */
let emailService: NodemailerService | null = null;

/**
 * Get Email Service Instance
 */
export const getEmailService = (config?: Partial<EmailServiceConfig>): NodemailerService => {
  if (!emailService) {
    emailService = new NodemailerService(config);
  }
  return emailService;
};

/**
 * Send Email Helper Function
 */
export const sendEmail = async (options: EmailOptions): Promise<EmailSendResult> => {
  const service = getEmailService();
  return service.sendEmail(options);
};

/**
 * Send Bulk Emails Helper Function
 */
export const sendBulkEmails = async (emails: EmailOptions[]): Promise<EmailSendResult[]> => {
  const service = getEmailService();
  return service.sendBulkEmails(emails);
};

/**
 * Test Email Connection Helper Function
 */
export const testEmailConnection = async (): Promise<SMTPTestResult> => {
  const service = getEmailService();
  return service.testConnection();
};

/**
 * Export Types and Classes
 */
export { NodemailerService };