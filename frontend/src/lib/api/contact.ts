import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ApiResponse, PaginationParams, User } from './types';

// Contact Response Types
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: 'general' | 'support' | 'sales' | 'feedback' | 'complaint' | 'suggestion' | 'partnership' | 'press' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed' | 'spam';
  source: 'website' | 'mobile' | 'email' | 'phone' | 'chat' | 'social';
  
  // Additional Information
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  userId?: string;
  user?: User;
  sessionId?: string;
  
  // Attachments
  attachments: Array<{
    id: string;
    filename: string;
    size: number;
    mimeType: string;
    url: string;
    uploadedAt: string;
  }>;
  
  // Tracking
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  
  // Response Information
  responseTime?: number;
  responseCount: number;
  lastResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  
  // Satisfaction Rating
  satisfaction?: {
    rating: number; // 1-5
    feedback?: string;
    ratedAt: string;
  };
  
  // Tags and Labels
  tags: string[];
  labels: string[];
  
  // Custom Fields
  customFields: Record<string, unknown>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  source?: string;
  customFields?: Record<string, unknown>;
  attachments?: File[];
  recaptchaToken?: string;
}

export interface ContactResponse {
  id: string;
  message: string;
  response: string;
  responder: {
    id: string;
    name: string;
    role: string;
  };
  isPublic: boolean;
  attachments: Array<{
    id: string;
    filename: string;
    size: number;
    url: string;
  }>;
  createdAt: string;
}

export interface ContactTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  resolvedSubmissions: number;
  averageResponseTime: number;
  satisfactionRating: number;
  
  // By Category
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  
  // By Priority
  priorityBreakdown: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  
  // By Status
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  
  // Trends
  monthlyTrends: Array<{
    month: string;
    submissions: number;
    resolved: number;
    averageResponseTime: number;
  }>;
  
  // Top Issues
  topIssues: Array<{
    subject: string;
    count: number;
    averageResolutionTime: number;
  }>;
  
  // Performance Metrics
  performance: {
    firstResponseTime: number;
    resolutionTime: number;
    customerSatisfaction: number;
    reopenRate: number;
  };
}

export interface ContactSettings {
  id: string;
  emailNotifications: {
    newSubmission: boolean;
    statusChange: boolean;
    newResponse: boolean;
    dailyDigest: boolean;
  };
  autoResponses: {
    enabled: boolean;
    templates: Record<string, string>;
  };
  businessHours: {
    enabled: boolean;
    timezone: string;
    schedule: Record<string, {
      open: string;
      close: string;
      isOpen: boolean;
    }>;
  };
  slaTargets: {
    firstResponse: number; // hours
    resolution: number; // hours
  };
  spamFiltering: {
    enabled: boolean;
    keywords: string[];
    ipBlacklist: string[];
  };
  categories: Array<{
    id: string;
    name: string;
    description: string;
    assignedTo?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    isActive: boolean;
  }>;
}

class ContactApiClient {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Contact Form Submission
  async submitContact(data: ContactFormData): Promise<ApiResponse<{
    submission: ContactSubmission;
    ticketNumber: string;
    estimatedResponseTime: string;
  }>> {
    const formData = new FormData();
    
    // Add basic fields
    Object.keys(data).forEach(key => {
      if (key !== 'attachments' && data[key as keyof ContactFormData] !== undefined) {
        formData.append(key, String(data[key as keyof ContactFormData]));
      }
    });
    
    // Add attachments
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }
    
    // Add custom fields
    if (data.customFields) {
      formData.append('customFields', JSON.stringify(data.customFields));
    }

    return this.client.post(endpoints.contact.submit, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async validateContactForm(data: Partial<ContactFormData>): Promise<ApiResponse<{
    isValid: boolean;
    errors: Record<string, string[]>;
    warnings: Record<string, string[]>;
  }>> {
    return this.client.post(endpoints.contact.validate, data);
  }

  async checkDuplicate(data: {
    email: string;
    subject: string;
    timeframe?: number; // hours
  }): Promise<ApiResponse<{
    isDuplicate: boolean;
    existingSubmission?: ContactSubmission;
    suggestions: string[];
  }>> {
    return this.client.post(endpoints.contact.checkDuplicate, data);
  }

  // Public Contact Operations
  async getContactInfo(): Promise<ApiResponse<{
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
    businessHours: {
      timezone: string;
      schedule: Record<string, {
        open: string;
        close: string;
        isOpen: boolean;
      }>;
    };
    supportChannels: Array<{
      type: 'email' | 'phone' | 'chat' | 'social';
      value: string;
      availability: string;
    }>;
    emergencyContact?: {
      phone: string;
      email: string;
    };
  }>> {
    return this.client.get(endpoints.contact.info);
  }

  async getContactCategories(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    estimatedResponseTime: string;
  }>>> {
    return this.client.get(endpoints.contact.categories);
  }

  async getFAQs(category?: string): Promise<ApiResponse<Array<{
    id: string;
    question: string;
    answer: string;
    category: string;
    helpfulCount: number;
    createdAt: string;
  }>>> {
    return this.client.get(endpoints.contact.faqs, {
      params: category ? { category } : undefined,
    });
  }

  // Submission Tracking
  async trackSubmission(ticketNumber: string): Promise<ApiResponse<{
    submission: ContactSubmission;
    responses: ContactResponse[];
    timeline: Array<{
      id: string;
      action: string;
      description: string;
      actor: {
        name: string;
        role: string;
      };
      timestamp: string;
    }>;
  }>> {
    return this.client.get(endpoints.contact.track(ticketNumber));
  }

  async getSubmissionByToken(token: string): Promise<ApiResponse<{
    submission: ContactSubmission;
    canRespond: boolean;
    canRate: boolean;
  }>> {
    return this.client.get(endpoints.contact.byToken(token));
  }

  // Customer Response
  async addCustomerResponse(submissionId: string, data: {
    message: string;
    attachments?: File[];
  }): Promise<ApiResponse<ContactResponse>> {
    const formData = new FormData();
    formData.append('message', data.message);
    
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    return this.client.post(endpoints.contact.addResponse(submissionId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async rateSatisfaction(submissionId: string, data: {
    rating: number;
    feedback?: string;
  }): Promise<ApiResponse<void>> {
    return this.client.post(endpoints.contact.rateSatisfaction(submissionId), data);
  }

  // Subscription Management
  async subscribeNewsletter(email: string, categories?: string[]): Promise<ApiResponse<{
    subscribed: boolean;
    confirmationRequired: boolean;
  }>> {
    return this.client.post(endpoints.contact.newsletter.subscribe, {
      email,
      categories,
    });
  }

  async unsubscribeNewsletter(email: string, token?: string): Promise<ApiResponse<{
    unsubscribed: boolean;
  }>> {
    return this.client.post(endpoints.contact.newsletter.unsubscribe, {
      email,
      token,
    });
  }

  async confirmNewsletterSubscription(token: string): Promise<ApiResponse<{
    confirmed: boolean;
  }>> {
    return this.client.post(endpoints.contact.newsletter.confirm(token));
  }

  // Admin Operations
  async getSubmissions(params?: PaginationParams & {
    status?: string;
    category?: string;
    priority?: string;
    assignedTo?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<ApiResponse<{
    submissions: ContactSubmission[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      statuses: Array<{ value: string; count: number }>;
      categories: Array<{ value: string; count: number }>;
      priorities: Array<{ value: string; count: number }>;
    };
  }>> {
    return this.client.get(endpoints.contact.admin.list, { params });
  }

  async getSubmission(id: string): Promise<ApiResponse<{
    submission: ContactSubmission;
    responses: ContactResponse[];
    relatedSubmissions: ContactSubmission[];
    suggestedResponses: string[];
    timeline: Array<{
      id: string;
      action: string;
      description: string;
      actor: {
        name: string;
        role: string;
      };
      timestamp: string;
    }>;
  }>> {
    return this.client.get(endpoints.contact.admin.byId(id));
  }

  async updateSubmissionStatus(id: string, data: {
    status: string;
    notes?: string;
    assignedTo?: string;
  }): Promise<ApiResponse<ContactSubmission>> {
    return this.client.patch(endpoints.contact.admin.updateStatus(id), data);
  }

  async assignSubmission(id: string, userId: string): Promise<ApiResponse<ContactSubmission>> {
    return this.client.patch(endpoints.contact.admin.assign(id), { userId });
  }

  async addResponse(id: string, data: {
    response: string;
    isPublic: boolean;
    attachments?: File[];
    closeSubmission?: boolean;
  }): Promise<ApiResponse<ContactResponse>> {
    const formData = new FormData();
    formData.append('response', data.response);
    formData.append('isPublic', String(data.isPublic));
    
    if (data.closeSubmission) {
      formData.append('closeSubmission', 'true');
    }
    
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    return this.client.post(endpoints.contact.admin.addResponse(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async bulkUpdateSubmissions(data: {
    submissionIds: string[];
    updates: {
      status?: string;
      assignedTo?: string;
      priority?: string;
      tags?: string[];
    };
  }): Promise<ApiResponse<{
    updated: number;
    failed: Array<{
      id: string;
      error: string;
    }>;
  }>> {
    return this.client.patch(endpoints.contact.admin.bulkUpdate, data);
  }

  async deleteSubmission(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.contact.admin.delete(id));
  }

  async exportSubmissions(params?: {
    format: 'csv' | 'xlsx' | 'json';
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    category?: string;
  }): Promise<ApiResponse<Blob>> {
    return this.client.get(endpoints.contact.admin.export, {
      params,
      responseType: 'blob',
    });
  }

  // Templates Management
  async getTemplates(): Promise<ApiResponse<ContactTemplate[]>> {
    return this.client.get(endpoints.contact.admin.templates.list);
  }

  async createTemplate(data: {
    name: string;
    subject: string;
    content: string;
    category: string;
    variables?: string[];
  }): Promise<ApiResponse<ContactTemplate>> {
    return this.client.post(endpoints.contact.admin.templates.create, data);
  }

  async updateTemplate(id: string, data: Partial<{
    name: string;
    subject: string;
    content: string;
    category: string;
    variables: string[];
    isActive: boolean;
  }>): Promise<ApiResponse<ContactTemplate>> {
    return this.client.put(endpoints.contact.admin.templates.update(id), data);
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.contact.admin.templates.delete(id));
  }

  // Statistics and Analytics
  async getContactStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<ContactStats>> {
    return this.client.get(endpoints.contact.admin.stats, { params });
  }

  async getPerformanceMetrics(params?: {
    dateFrom?: string;
    dateTo?: string;
    assignedTo?: string;
  }): Promise<ApiResponse<{
    totalHandled: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    customerSatisfaction: number;
    reopenRate: number;
    productivity: {
      submissionsPerDay: number;
      resolutionsPerDay: number;
      responseRate: number;
    };
    trends: Array<{
      date: string;
      handled: number;
      responseTime: number;
      satisfaction: number;
    }>;
  }>> {
    return this.client.get(endpoints.contact.admin.performance, { params });
  }

  // Settings Management
  async getSettings(): Promise<ApiResponse<ContactSettings>> {
    return this.client.get(endpoints.contact.admin.settings);
  }

  async updateSettings(data: Partial<ContactSettings>): Promise<ApiResponse<ContactSettings>> {
    return this.client.put(endpoints.contact.admin.settings, data);
  }

  async testEmailSettings(): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.client.post(endpoints.contact.admin.testEmail);
  }

  // Knowledge Base Integration
  async searchKnowledgeBase(query: string): Promise<ApiResponse<Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    relevanceScore: number;
    url: string;
  }>>> {
    return this.client.get(endpoints.contact.knowledgeBase.search, {
      params: { q: query },
    });
  }

  async suggestArticles(submissionId: string): Promise<ApiResponse<Array<{
    id: string;
    title: string;
    excerpt: string;
    relevanceScore: number;
    url: string;
  }>>> {
    return this.client.get(endpoints.contact.knowledgeBase.suggest(submissionId));
  }

  // Auto-response Management
  async testAutoResponse(category: string, message: string): Promise<ApiResponse<{
    response: string;
    confidence: number;
    suggestions: string[];
  }>> {
    return this.client.post(endpoints.contact.admin.autoResponse.test, {
      category,
      message,
    });
  }

  async updateAutoResponseTemplates(templates: Record<string, string>): Promise<ApiResponse<void>> {
    return this.client.put(endpoints.contact.admin.autoResponse.templates, {
      templates,
    });
  }
}

export const contactApi = new ContactApiClient();

// React Query Hooks

// Public Contact Hooks
export const useSubmitContact = () => {
  return useMutation({
    mutationFn: (data: ContactFormData) => contactApi.submitContact(data),
  });
};

export const useValidateContactForm = () => {
  return useMutation({
    mutationFn: (data: Partial<ContactFormData>) => contactApi.validateContactForm(data),
  });
};

export const useCheckDuplicateContact = () => {
  return useMutation({
    mutationFn: (data: { email: string; subject: string; timeframe?: number }) => 
      contactApi.checkDuplicate(data),
  });
};

export const useContactInfo = (options?: UseQueryOptions<ApiResponse<{
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  businessHours: {
    timezone: string;
    schedule: Record<string, {
      open: string;
      close: string;
      isOpen: boolean;
    }>;
  };
  supportChannels: Array<{
    type: 'email' | 'phone' | 'chat' | 'social';
    value: string;
    availability: string;
  }>;
  emergencyContact?: {
    phone: string;
    email: string;
  };
}>>) => {
  return useQuery({
    queryKey: ['contact-info'],
    queryFn: () => contactApi.getContactInfo(),
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

export const useContactCategories = (options?: UseQueryOptions<ApiResponse<Array<{
  id: string;
  name: string;
  description: string;
  estimatedResponseTime: string;
}>>>) => {
  return useQuery({
    queryKey: ['contact-categories'],
    queryFn: () => contactApi.getContactCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

export const useContactFAQs = (
  category?: string,
  options?: UseQueryOptions<ApiResponse<Array<{
    id: string;
    question: string;
    answer: string;
    category: string;
    helpfulCount: number;
    createdAt: string;
  }>>>
) => {
  return useQuery({
    queryKey: ['contact-faqs', category],
    queryFn: () => contactApi.getFAQs(category),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

// Tracking Hooks
export const useTrackSubmission = (
  ticketNumber: string,
  options?: UseQueryOptions<ApiResponse<{
    submission: ContactSubmission;
    responses: ContactResponse[];
    timeline: Array<{
      id: string;
      action: string;
      description: string;
      actor: {
        name: string;
        role: string;
      };
      timestamp: string;
    }>;
  }>>
) => {
  return useQuery({
    queryKey: ['track-submission', ticketNumber],
    queryFn: () => contactApi.trackSubmission(ticketNumber),
    enabled: !!ticketNumber,
    refetchInterval: 30000, // 30 seconds
    ...options,
  });
};

export const useSubmissionByToken = (
  token: string,
  options?: UseQueryOptions<ApiResponse<{
    submission: ContactSubmission;
    canRespond: boolean;
    canRate: boolean;
  }>>
) => {
  return useQuery({
    queryKey: ['submission-by-token', token],
    queryFn: () => contactApi.getSubmissionByToken(token),
    enabled: !!token,
    ...options,
  });
};

// Customer Response Hooks
export const useAddCustomerResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ submissionId, data }: { 
      submissionId: string; 
      data: { message: string; attachments?: File[] } 
    }) => contactApi.addCustomerResponse(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['track-submission'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['submission-by-token'] 
      });
    },
  });
};

export const useRateSatisfaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ submissionId, data }: { 
      submissionId: string; 
      data: { rating: number; feedback?: string } 
    }) => contactApi.rateSatisfaction(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['track-submission'] 
      });
    },
  });
};

// Newsletter Hooks
export const useSubscribeNewsletter = () => {
  return useMutation({
    mutationFn: ({ email, categories }: { email: string; categories?: string[] }) => 
      contactApi.subscribeNewsletter(email, categories),
  });
};

export const useUnsubscribeNewsletter = () => {
  return useMutation({
    mutationFn: ({ email, token }: { email: string; token?: string }) => 
      contactApi.unsubscribeNewsletter(email, token),
  });
};

export const useConfirmNewsletterSubscription = () => {
  return useMutation({
    mutationFn: (token: string) => contactApi.confirmNewsletterSubscription(token),
  });
};

// Admin Hooks
export const useContactSubmissions = (
  params?: PaginationParams & {
    status?: string;
    category?: string;
    priority?: string;
    assignedTo?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  },
  options?: UseQueryOptions<ApiResponse<{
    submissions: ContactSubmission[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      statuses: Array<{ value: string; count: number }>;
      categories: Array<{ value: string; count: number }>;
      priorities: Array<{ value: string; count: number }>;
    };
  }>>
) => {
  return useQuery({
    queryKey: ['contact-submissions', params],
    queryFn: () => contactApi.getSubmissions(params),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

export const useContactSubmission = (
  id: string,
  options?: UseQueryOptions<ApiResponse<{
    submission: ContactSubmission;
    responses: ContactResponse[];
    relatedSubmissions: ContactSubmission[];
    suggestedResponses: string[];
    timeline: Array<{
      id: string;
      action: string;
      description: string;
      actor: {
        name: string;
        role: string;
      };
      timestamp: string;
    }>;
  }>>
) => {
  return useQuery({
    queryKey: ['contact-submission', id],
    queryFn: () => contactApi.getSubmission(id),
    enabled: !!id,
    ...options,
  });
};

export const useUpdateSubmissionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { status: string; notes?: string; assignedTo?: string } 
    }) => contactApi.updateSubmissionStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['contact-submissions'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['contact-submission'] 
      });
    },
  });
};

export const useAssignSubmission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      contactApi.assignSubmission(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['contact-submissions'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['contact-submission'] 
      });
    },
  });
};

export const useAddContactResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        response: string;
        isPublic: boolean;
        attachments?: File[];
        closeSubmission?: boolean;
      }
    }) => contactApi.addResponse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['contact-submission'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['contact-submissions'] 
      });
    },
  });
};

export const useBulkUpdateSubmissions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      submissionIds: string[];
      updates: {
        status?: string;
        assignedTo?: string;
        priority?: string;
        tags?: string[];
      };
    }) => contactApi.bulkUpdateSubmissions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['contact-submissions'] 
      });
    },
  });
};

export const useDeleteContactSubmission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => contactApi.deleteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['contact-submissions'] 
      });
    },
  });
};

export const useExportContactSubmissions = () => {
  return useMutation({
    mutationFn: (params?: {
      format: 'csv' | 'xlsx' | 'json';
      dateFrom?: string;
      dateTo?: string;
      status?: string;
      category?: string;
    }) => contactApi.exportSubmissions(params),
  });
};

// Templates Hooks
export const useContactTemplates = (options?: UseQueryOptions<ApiResponse<ContactTemplate[]>>) => {
  return useQuery({
    queryKey: ['contact-templates'],
    queryFn: () => contactApi.getTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useCreateContactTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      subject: string;
      content: string;
      category: string;
      variables?: string[];
    }) => contactApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['contact-templates'] 
      });
    },
  });
};

export const useUpdateContactTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<{
        name: string;
        subject: string;
        content: string;
        category: string;
        variables: string[];
        isActive: boolean;
      }>
    }) => contactApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['contact-templates'] 
      });
    },
  });
};

export const useDeleteContactTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => contactApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['contact-templates'] 
      });
    },
  });
};

// Analytics Hooks
export const useContactStats = (
  params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  },
  options?: UseQueryOptions<ApiResponse<ContactStats>>
) => {
  return useQuery({
    queryKey: ['contact-stats', params],
    queryFn: () => contactApi.getContactStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useContactPerformanceMetrics = (
  params?: {
    dateFrom?: string;
    dateTo?: string;
    assignedTo?: string;
  },
  options?: UseQueryOptions<ApiResponse<{
    totalHandled: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    customerSatisfaction: number;
    reopenRate: number;
    productivity: {
      submissionsPerDay: number;
      resolutionsPerDay: number;
      responseRate: number;
    };
    trends: Array<{
      date: string;
      handled: number;
      responseTime: number;
      satisfaction: number;
    }>;
  }>>
) => {
  return useQuery({
    queryKey: ['contact-performance', params],
    queryFn: () => contactApi.getPerformanceMetrics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Settings Hooks
export const useContactSettings = (options?: UseQueryOptions<ApiResponse<ContactSettings>>) => {
  return useQuery({
    queryKey: ['contact-settings'],
    queryFn: () => contactApi.getSettings(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

export const useUpdateContactSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<ContactSettings>) => contactApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['contact-settings'] 
      });
    },
  });
};

export const useTestEmailSettings = () => {
  return useMutation({
    mutationFn: () => contactApi.testEmailSettings(),
  });
};

// Knowledge Base Hooks
export const useSearchKnowledgeBase = () => {
  return useMutation({
    mutationFn: (query: string) => contactApi.searchKnowledgeBase(query),
  });
};

export const useSuggestArticles = (
  submissionId: string,
  options?: UseQueryOptions<ApiResponse<Array<{
    id: string;
    title: string;
    excerpt: string;
    relevanceScore: number;
    url: string;
  }>>>
) => {
  return useQuery({
    queryKey: ['suggest-articles', submissionId],
    queryFn: () => contactApi.suggestArticles(submissionId),
    enabled: !!submissionId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

// Auto-response Hooks
export const useTestAutoResponse = () => {
  return useMutation({
    mutationFn: ({ category, message }: { category: string; message: string }) => 
      contactApi.testAutoResponse(category, message),
  });
};

export const useUpdateAutoResponseTemplates = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (templates: Record<string, string>) => 
      contactApi.updateAutoResponseTemplates(templates),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['contact-settings'] 
      });
    },
  });
};
