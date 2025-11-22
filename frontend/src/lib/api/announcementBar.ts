import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ApiResponse, PaginationParams, Announcement } from './types';

// Paginated Response Type
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
  link?: string;
  buttonText?: string;
  isActive?: boolean;
  showOnPages?: string[];
  startDate?: string;
  endDate?: string;
  priority?: number;
  dismissible?: boolean;
}

export type UpdateAnnouncementRequest = Partial<CreateAnnouncementRequest>;

export interface AnnouncementFilters {
  type?: 'info' | 'warning' | 'success' | 'error' | 'promotion';
  isActive?: boolean;
  showOnPage?: string;
  startDate?: string;
  endDate?: string;
  priority?: number;
  dismissible?: boolean;
}

export interface AnnouncementAnalytics {
  totalAnnouncements: number;
  activeAnnouncements: number;
  expiredAnnouncements: number;
  typeDistribution: {
    type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
    count: number;
    percentage: number;
  }[];
  impressions: {
    date: string;
    total: number;
    byType: Record<string, number>;
  }[];
  interactions: {
    date: string;
    clicks: number;
    dismissals: number;
    conversionRate: number;
  }[];
  topPerforming: {
    id: string;
    title: string;
    clicks: number;
    impressions: number;
    ctr: number;
  }[];
}

class AnnouncementApiClient {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // CRUD Operations
  async getAnnouncements(params?: PaginationParams & AnnouncementFilters): Promise<ApiResponse<PaginatedResponse<Announcement>>> {
    return this.client.get(endpoints.announcements.list, { params });
  }

  async getAnnouncement(id: string): Promise<ApiResponse<Announcement>> {
    return this.client.get(endpoints.announcements.byId(id));
  }

  async getActiveAnnouncements(page?: string): Promise<ApiResponse<Announcement[]>> {
    return this.client.get(endpoints.announcements.active, { 
      params: page ? { page } : undefined 
    });
  }

  async createAnnouncement(data: CreateAnnouncementRequest): Promise<ApiResponse<Announcement>> {
    return this.client.post(endpoints.announcements.create, data);
  }

  async updateAnnouncement(id: string, data: UpdateAnnouncementRequest): Promise<ApiResponse<Announcement>> {
    return this.client.put(endpoints.announcements.update(id), data);
  }

  async deleteAnnouncement(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.announcements.delete(id));
  }

  async duplicateAnnouncement(id: string): Promise<ApiResponse<Announcement>> {
    return this.client.post(endpoints.announcements.duplicate(id));
  }

  // Bulk Operations
  async bulkUpdateAnnouncements(data: {
    ids: string[];
    updates: UpdateAnnouncementRequest;
  }): Promise<ApiResponse<Announcement[]>> {
    return this.client.put(endpoints.announcements.bulkUpdate, data);
  }

  async bulkDeleteAnnouncements(ids: string[]): Promise<ApiResponse<void>> {
    return this.client.delete(endpoints.announcements.bulkDelete, { data: { ids } });
  }

  async reorderAnnouncements(data: {
    id: string;
    priority: number;
  }[]): Promise<ApiResponse<Announcement[]>> {
    return this.client.put(endpoints.announcements.reorder, { items: data });
  }

  // Status Management
  async toggleAnnouncementStatus(id: string): Promise<ApiResponse<Announcement>> {
    return this.client.patch(endpoints.announcements.toggleStatus(id));
  }

  async activateAnnouncement(id: string): Promise<ApiResponse<Announcement>> {
    return this.client.patch(endpoints.announcements.activate(id));
  }

  async deactivateAnnouncement(id: string): Promise<ApiResponse<Announcement>> {
    return this.client.patch(endpoints.announcements.deactivate(id));
  }

  // Schedule Management
  async scheduleAnnouncement(id: string, data: {
    startDate: string;
    endDate?: string;
  }): Promise<ApiResponse<Announcement>> {
    return this.client.put(endpoints.announcements.schedule(id), data);
  }

  async extendAnnouncement(id: string, endDate: string): Promise<ApiResponse<Announcement>> {
    return this.client.patch(endpoints.announcements.extend(id), { endDate });
  }

  // Analytics
  async getAnnouncementAnalytics(params?: {
    dateFrom?: string;
    dateTo?: string;
    type?: string;
    page?: string;
  }): Promise<ApiResponse<AnnouncementAnalytics>> {
    return this.client.get(endpoints.announcements.analytics, { params });
  }

  async getAnnouncementStats(id: string, params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{
    impressions: number;
    clicks: number;
    dismissals: number;
    ctr: number;
    conversionRate: number;
    timeline: Array<{
      date: string;
      impressions: number;
      clicks: number;
      dismissals: number;
    }>;
  }>> {
    return this.client.get(endpoints.announcements.stats(id), { params });
  }

  // User Interactions
  async trackClick(id: string): Promise<ApiResponse<void>> {
    return this.client.post(endpoints.announcements.trackClick(id));
  }

  async trackDismissal(id: string): Promise<ApiResponse<void>> {
    return this.client.post(endpoints.announcements.trackDismissal(id));
  }

  async trackImpression(id: string, data?: {
    page?: string;
    userAgent?: string;
    referrer?: string;
  }): Promise<ApiResponse<void>> {
    return this.client.post(endpoints.announcements.trackImpression(id), data);
  }

  // Template Management
  async getAnnouncementTemplates(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
    template: string;
    preview: string;
    isDefault: boolean;
  }>>> {
    return this.client.get(endpoints.announcements.templates);
  }

  async createFromTemplate(templateId: string, data: {
    title: string;
    content?: string;
    variables?: Record<string, string>;
  }): Promise<ApiResponse<Announcement>> {
    return this.client.post(endpoints.announcements.createFromTemplate(templateId), data);
  }

  // Export/Import
  async exportAnnouncements(format: 'csv' | 'xlsx' | 'json', filters?: AnnouncementFilters): Promise<ApiResponse<Blob>> {
    return this.client.get(endpoints.announcements.export, {
      params: { format, ...filters },
      responseType: 'blob'
    });
  }

  async importAnnouncements(file: File): Promise<ApiResponse<{
    imported: number;
    errors: string[];
    duplicates: number;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.post(endpoints.announcements.import, formData);
  }

  // Preview
  async previewAnnouncement(data: CreateAnnouncementRequest): Promise<ApiResponse<{
    html: string;
    css: string;
    preview: string;
  }>> {
    return this.client.post(endpoints.announcements.preview, data);
  }

  // Testing
  async testAnnouncement(id: string, data: {
    emails: string[];
    pages?: string[];
  }): Promise<ApiResponse<{
    sent: number;
    failed: number;
    errors: string[];
  }>> {
    return this.client.post(endpoints.announcements.test(id), data);
  }
}

export const announcementApi = new AnnouncementApiClient();

// React Query Hooks

// Basic CRUD Hooks
export const useAnnouncements = (
  params?: PaginationParams & AnnouncementFilters,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Announcement>>>
) => {
  return useQuery({
    queryKey: ['announcements', params],
    queryFn: () => announcementApi.getAnnouncements(params),
    ...options,
  });
};

export const useAnnouncement = (id: string, options?: UseQueryOptions<ApiResponse<Announcement>>) => {
  return useQuery({
    queryKey: ['announcements', id],
    queryFn: () => announcementApi.getAnnouncement(id),
    enabled: !!id,
    ...options,
  });
};

export const useActiveAnnouncements = (
  page?: string,
  options?: UseQueryOptions<ApiResponse<Announcement[]>>
) => {
  return useQuery({
    queryKey: ['announcements', 'active', page],
    queryFn: () => announcementApi.getActiveAnnouncements(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAnnouncementRequest) => announcementApi.createAnnouncement(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      if (response.data) {
        queryClient.setQueryData(['announcements', response.data.id], response);
      }
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementRequest }) => 
      announcementApi.updateAnnouncement(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.setQueryData(['announcements', id], response);
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => announcementApi.deleteAnnouncement(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.removeQueries({ queryKey: ['announcements', id] });
    },
  });
};

export const useDuplicateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => announcementApi.duplicateAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

// Bulk Operations Hooks
export const useBulkUpdateAnnouncements = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { ids: string[]; updates: UpdateAnnouncementRequest }) => 
      announcementApi.bulkUpdateAnnouncements(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useBulkDeleteAnnouncements = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => announcementApi.bulkDeleteAnnouncements(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useReorderAnnouncements = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: string; priority: number }[]) => 
      announcementApi.reorderAnnouncements(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

// Status Management Hooks
export const useToggleAnnouncementStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => announcementApi.toggleAnnouncementStatus(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.setQueryData(['announcements', id], response);
    },
  });
};

export const useActivateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => announcementApi.activateAnnouncement(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.setQueryData(['announcements', id], response);
    },
  });
};

export const useDeactivateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => announcementApi.deactivateAnnouncement(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.setQueryData(['announcements', id], response);
    },
  });
};

// Schedule Management Hooks
export const useScheduleAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { startDate: string; endDate?: string } 
    }) => announcementApi.scheduleAnnouncement(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.setQueryData(['announcements', id], response);
    },
  });
};

export const useExtendAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, endDate }: { id: string; endDate: string }) => 
      announcementApi.extendAnnouncement(id, endDate),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.setQueryData(['announcements', id], response);
    },
  });
};

// Analytics Hooks
export const useAnnouncementAnalytics = (
  params?: {
    dateFrom?: string;
    dateTo?: string;
    type?: string;
    page?: string;
  },
  options?: UseQueryOptions<ApiResponse<AnnouncementAnalytics>>
) => {
  return useQuery({
    queryKey: ['announcements', 'analytics', params],
    queryFn: () => announcementApi.getAnnouncementAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useAnnouncementStats = (
  id: string,
  params?: {
    dateFrom?: string;
    dateTo?: string;
  },
  options?: UseQueryOptions<ApiResponse<{
    impressions: number;
    clicks: number;
    dismissals: number;
    ctr: number;
    conversionRate: number;
    timeline: Array<{
      date: string;
      impressions: number;
      clicks: number;
      dismissals: number;
    }>;
  }>>
) => {
  return useQuery({
    queryKey: ['announcements', 'stats', id, params],
    queryFn: () => announcementApi.getAnnouncementStats(id, params),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// User Interaction Hooks
export const useTrackClick = () => {
  return useMutation({
    mutationFn: (id: string) => announcementApi.trackClick(id),
  });
};

export const useTrackDismissal = () => {
  return useMutation({
    mutationFn: (id: string) => announcementApi.trackDismissal(id),
  });
};

export const useTrackImpression = () => {
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data?: { page?: string; userAgent?: string; referrer?: string } 
    }) => announcementApi.trackImpression(id, data),
  });
};

// Template Hooks
export const useAnnouncementTemplates = (options?: UseQueryOptions<ApiResponse<Array<{
  id: string;
  name: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
  template: string;
  preview: string;
  isDefault: boolean;
}>>>) => {
  return useQuery({
    queryKey: ['announcements', 'templates'],
    queryFn: () => announcementApi.getAnnouncementTemplates(),
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

export const useCreateFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, data }: { 
      templateId: string; 
      data: { title: string; content?: string; variables?: Record<string, string> } 
    }) => announcementApi.createFromTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

// Export/Import Hooks
export const useExportAnnouncements = () => {
  return useMutation({
    mutationFn: ({ format, filters }: { 
      format: 'csv' | 'xlsx' | 'json'; 
      filters?: AnnouncementFilters 
    }) => announcementApi.exportAnnouncements(format, filters),
  });
};

export const useImportAnnouncements = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => announcementApi.importAnnouncements(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

// Preview Hook
export const usePreviewAnnouncement = () => {
  return useMutation({
    mutationFn: (data: CreateAnnouncementRequest) => announcementApi.previewAnnouncement(data),
  });
};

// Testing Hook
export const useTestAnnouncement = () => {
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { emails: string[]; pages?: string[] } 
    }) => announcementApi.testAnnouncement(id, data),
  });
};
