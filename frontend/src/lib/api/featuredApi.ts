import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { httpClient } from './client';
import { endpoints } from './endpoints';
import type {
  FeaturedContent,
  FeaturedRule,
  FeaturedDisplaySettings,
  FeaturedSectionConfig,
  FeaturedTemplate,
  FeaturedSchedule,
  FeaturedListParams,
  FeaturedBulkOperation,
  FeaturedABTest
} from '../../types/featured.types';

// ==================== Featured Content Management System ====================

// ==================== Featured Content API Service ====================

class FeaturedApi {
  // Basic CRUD Operations
  async getFeaturedContent(params?: FeaturedListParams) {
    const response = await httpClient.get(endpoints.featured.list, { params });
    return response.data;
  }

  async getFeaturedById(id: string) {
    const response = await httpClient.get(endpoints.featured.byId(id));
    return response.data;
  }

  async createFeatured(data: Partial<FeaturedContent>) {
    const response = await httpClient.post(endpoints.featured.create, data);
    return response.data;
  }

  async updateFeatured(id: string, data: Partial<FeaturedContent>) {
    const response = await httpClient.put(endpoints.featured.update(id), data);
    return response.data;
  }

  async deleteFeatured(id: string) {
    const response = await httpClient.delete(endpoints.featured.delete(id));
    return response.data;
  }

  async duplicateFeatured(id: string, data?: { title?: string; section?: string }) {
    const response = await httpClient.post(endpoints.featured.duplicate(id), data);
    return response.data;
  }

  // Status Management
  async activateFeatured(id: string) {
    const response = await httpClient.patch(endpoints.featured.activate(id));
    return response.data;
  }

  async deactivateFeatured(id: string) {
    const response = await httpClient.patch(endpoints.featured.deactivate(id));
    return response.data;
  }

  async scheduleFeatured(id: string, data: { startDate: Date; endDate?: Date }) {
    const response = await httpClient.patch(endpoints.featured.schedule(id), data);
    return response.data;
  }

  // Section Management
  async getFeaturedBySection(section: string, params?: Omit<FeaturedListParams, 'section'>) {
    const response = await httpClient.get(endpoints.featured.bySection(section), { params });
    return response.data;
  }

  async getSections() {
    const response = await httpClient.get(endpoints.featured.sections.list);
    return response.data;
  }

  async getSectionById(id: string) {
    const response = await httpClient.get(endpoints.featured.sections.byId(id));
    return response.data;
  }

  async createSection(data: Partial<FeaturedSectionConfig>) {
    const response = await httpClient.post(endpoints.featured.sections.create, data);
    return response.data;
  }

  async updateSection(id: string, data: Partial<FeaturedSectionConfig>) {
    const response = await httpClient.put(endpoints.featured.sections.update(id), data);
    return response.data;
  }

  async deleteSection(id: string) {
    const response = await httpClient.delete(endpoints.featured.sections.delete(id));
    return response.data;
  }

  // Position & Priority Management
  async reorderFeatured(section: string, items: { id: string; position: number }[]) {
    const response = await httpClient.patch(endpoints.featured.reorder(section), { items });
    return response.data;
  }

  async updatePriority(id: string, priority: number) {
    const response = await httpClient.patch(endpoints.featured.priority(id), { priority });
    return response.data;
  }

  // Content Type Management
  async getFeaturedByType(type: string, params?: Omit<FeaturedListParams, 'type'>) {
    const response = await httpClient.get(endpoints.featured.byType(type), { params });
    return response.data;
  }

  async getAvailableTypes() {
    const response = await httpClient.get(endpoints.featured.types);
    return response.data;
  }

  // Visibility & Audience
  async updateVisibility(id: string, data: { visibility: string; targetAudience?: string[] }) {
    const response = await httpClient.patch(endpoints.featured.visibility(id), data);
    return response.data;
  }

  async getFeaturedForAudience(audience: string, params?: FeaturedListParams) {
    const response = await httpClient.get(endpoints.featured.audience(audience), { params });
    return response.data;
  }

  // Rules & Conditions
  async updateRules(id: string, rules: FeaturedRule[]) {
    const response = await httpClient.patch(endpoints.featured.rules(id), { rules });
    return response.data;
  }

  async validateRules(rules: FeaturedRule[]) {
    const response = await httpClient.post(endpoints.featured.validateRules, { rules });
    return response.data;
  }

  // Display Settings
  async updateDisplaySettings(id: string, settings: FeaturedDisplaySettings) {
    const response = await httpClient.patch(endpoints.featured.displaySettings(id), { settings });
    return response.data;
  }

  async previewDisplaySettings(id: string, settings: FeaturedDisplaySettings) {
    const response = await httpClient.post(endpoints.featured.preview(id), { settings });
    return response.data;
  }

  // Performance & Analytics
  async getFeaturedPerformance(id: string, period?: string) {
    const response = await httpClient.get(endpoints.featured.performance(id), {
      params: { period }
    });
    return response.data;
  }

  async getFeaturedAnalytics(params?: {
    section?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await httpClient.get(endpoints.featured.analytics, { params });
    return response.data;
  }

  async recordView(id: string, data?: { userId?: string; sessionId?: string }) {
    const response = await httpClient.post(endpoints.featured.recordView(id), data);
    return response.data;
  }

  async recordClick(id: string, data?: { userId?: string; sessionId?: string; target?: string }) {
    const response = await httpClient.post(endpoints.featured.recordClick(id), data);
    return response.data;
  }

  async recordConversion(id: string, data: { userId?: string; value?: number; type?: string }) {
    const response = await httpClient.post(endpoints.featured.recordConversion(id), data);
    return response.data;
  }

  // Templates
  async getTemplates(params?: { type?: string; section?: string; public?: boolean }) {
    const response = await httpClient.get(endpoints.featured.templates.list, { params });
    return response.data;
  }

  async getTemplateById(id: string) {
    const response = await httpClient.get(endpoints.featured.templates.byId(id));
    return response.data;
  }

  async createTemplate(data: Partial<FeaturedTemplate>) {
    const response = await httpClient.post(endpoints.featured.templates.create, data);
    return response.data;
  }

  async updateTemplate(id: string, data: Partial<FeaturedTemplate>) {
    const response = await httpClient.put(endpoints.featured.templates.update(id), data);
    return response.data;
  }

  async deleteTemplate(id: string) {
    const response = await httpClient.delete(endpoints.featured.templates.delete(id));
    return response.data;
  }

  async createFromTemplate(templateId: string, data: Partial<FeaturedContent>) {
    const response = await httpClient.post(endpoints.featured.templates.createContent(templateId), data);
    return response.data;
  }

  // Scheduling
  async getSchedules(params?: { status?: string; startDate?: string; endDate?: string }) {
    const response = await httpClient.get(endpoints.featured.schedules.list, { params });
    return response.data;
  }

  async getScheduleById(id: string) {
    const response = await httpClient.get(endpoints.featured.schedules.byId(id));
    return response.data;
  }

  async createSchedule(data: Partial<FeaturedSchedule>) {
    const response = await httpClient.post(endpoints.featured.schedules.create, data);
    return response.data;
  }

  async updateSchedule(id: string, data: Partial<FeaturedSchedule>) {
    const response = await httpClient.put(endpoints.featured.schedules.update(id), data);
    return response.data;
  }

  async deleteSchedule(id: string) {
    const response = await httpClient.delete(endpoints.featured.schedules.delete(id));
    return response.data;
  }

  async executeSchedule(id: string) {
    const response = await httpClient.post(endpoints.featured.schedules.execute(id));
    return response.data;
  }

  // A/B Testing
  async getABTests(params?: { section?: string; status?: string }) {
    const response = await httpClient.get(endpoints.featured.abTests.list, { params });
    return response.data;
  }

  async getABTestById(id: string) {
    const response = await httpClient.get(endpoints.featured.abTests.byId(id));
    return response.data;
  }

  async createABTest(data: Partial<FeaturedABTest>) {
    const response = await httpClient.post(endpoints.featured.abTests.create, data);
    return response.data;
  }

  async updateABTest(id: string, data: Partial<FeaturedABTest>) {
    const response = await httpClient.put(endpoints.featured.abTests.update(id), data);
    return response.data;
  }

  async startABTest(id: string) {
    const response = await httpClient.post(endpoints.featured.abTests.start(id));
    return response.data;
  }

  async pauseABTest(id: string) {
    const response = await httpClient.post(endpoints.featured.abTests.pause(id));
    return response.data;
  }

  async completeABTest(id: string, winningVariant?: string) {
    const response = await httpClient.post(endpoints.featured.abTests.complete(id), { winningVariant });
    return response.data;
  }

  async deleteABTest(id: string) {
    const response = await httpClient.delete(endpoints.featured.abTests.delete(id));
    return response.data;
  }

  // Bulk Operations
  async bulkOperation(operation: FeaturedBulkOperation) {
    const response = await httpClient.post(endpoints.featured.bulk, operation);
    return response.data;
  }

  async bulkActivate(ids: string[]) {
    return this.bulkOperation({ action: 'activate', ids });
  }

  async bulkDeactivate(ids: string[]) {
    return this.bulkOperation({ action: 'deactivate', ids });
  }

  async bulkDelete(ids: string[]) {
    return this.bulkOperation({ action: 'delete', ids });
  }

  async bulkMove(ids: string[], section: string) {
    return this.bulkOperation({ action: 'move', ids, data: { section } });
  }

  // Search & Filter
  async searchFeatured(query: string, params?: {
    section?: string;
    type?: string;
    limit?: number;
  }) {
    const response = await httpClient.get(endpoints.featured.search, {
      params: { q: query, ...params }
    });
    return response.data;
  }

  async getSearchSuggestions(query: string) {
    const response = await httpClient.get(endpoints.featured.searchSuggestions, {
      params: { q: query }
    });
    return response.data;
  }

  // Import/Export
  async importFeatured(data: { file: File; format: 'json' | 'csv'; section?: string }) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('format', data.format);
    if (data.section) formData.append('section', data.section);

    const response = await httpClient.post(endpoints.featured.import, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async exportFeatured(params?: {
    section?: string;
    type?: string;
    format?: 'json' | 'csv';
    status?: string;
  }) {
    const response = await httpClient.get(endpoints.featured.export, { params });
    return response.data;
  }

  // Validation
  async validateFeatured(data: Partial<FeaturedContent>) {
    const response = await httpClient.post(endpoints.featured.validate, data);
    return response.data;
  }

  async checkConflicts(data: {
    section: string;
    position?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const response = await httpClient.post(endpoints.featured.checkConflicts, data);
    return response.data;
  }

  // AI & Automation
  async generateAIContent(data: {
    type: string;
    section: string;
    theme?: string;
    audience?: string;
    count?: number;
  }) {
    const response = await httpClient.post(endpoints.featured.ai.generate, data);
    return response.data;
  }

  async optimizeContent(id: string, goals?: string[]) {
    const response = await httpClient.post(endpoints.featured.ai.optimize(id), { goals });
    return response.data;
  }

  async getRecommendations(section: string, params?: {
    audience?: string;
    type?: string;
    limit?: number;
  }) {
    const response = await httpClient.get(endpoints.featured.ai.recommendations(section), { params });
    return response.data;
  }

  async autoSchedule(data: {
    contentIds: string[];
    period: string;
    rules?: string[];
  }) {
    const response = await httpClient.post(endpoints.featured.ai.autoSchedule, data);
    return response.data;
  }

  // Content Curation
  async getSuggestedContent(section: string, params?: {
    type?: string;
    limit?: number;
    excludeIds?: string[];
  }) {
    const response = await httpClient.get(endpoints.featured.suggestions(section), { params });
    return response.data;
  }

  async getTrendingContent(params?: {
    section?: string;
    type?: string;
    period?: string;
    limit?: number;
  }) {
    const response = await httpClient.get(endpoints.featured.trending, { params });
    return response.data;
  }

  async getPopularContent(params?: {
    section?: string;
    type?: string;
    period?: string;
    limit?: number;
  }) {
    const response = await httpClient.get(endpoints.featured.popular, { params });
    return response.data;
  }

  // Advanced Analytics
  async getConversionFunnel(section: string, period?: string) {
    const response = await httpClient.get(endpoints.featured.conversionFunnel(section), {
      params: { period }
    });
    return response.data;
  }

  async getHeatmapData(section: string, period?: string) {
    const response = await httpClient.get(endpoints.featured.heatmap(section), {
      params: { period }
    });
    return response.data;
  }

  async getUserJourney(section: string, params?: {
    userId?: string;
    sessionId?: string;
    period?: string;
  }) {
    const response = await httpClient.get(endpoints.featured.userJourney(section), { params });
    return response.data;
  }

  // Mobile & Responsive
  async getMobileFeatured(params?: FeaturedListParams) {
    const response = await httpClient.get(endpoints.featured.mobile, { params });
    return response.data;
  }

  async updateMobileSettings(id: string, settings: {
    mobileLayout?: string;
    mobileSize?: string;
    hideOnMobile?: boolean;
    mobileImage?: string;
  }) {
    const response = await httpClient.patch(endpoints.featured.mobileSettings(id), settings);
    return response.data;
  }

  // Integration & Webhooks
  async syncWithCMS(data: { cmsType: string; config: Record<string, unknown> }) {
    const response = await httpClient.post(endpoints.featured.syncCMS, data);
    return response.data;
  }

  async setupWebhook(data: {
    url: string;
    events: string[];
    secret?: string;
    isActive: boolean;
  }) {
    const response = await httpClient.post(endpoints.featured.webhooks, data);
    return response.data;
  }

  async testWebhook(id: string) {
    const response = await httpClient.post(endpoints.featured.testWebhook(id));
    return response.data;
  }
}

export const featuredApi = new FeaturedApi();

// ==================== React Query Hooks ====================

// Featured Content Hooks
export const useFeaturedContent = (params?: FeaturedListParams) => {
  return useQuery({
    queryKey: ['featured', 'list', params],
    queryFn: () => featuredApi.getFeaturedContent(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFeaturedById = (id: string) => {
  return useQuery({
    queryKey: ['featured', 'detail', id],
    queryFn: () => featuredApi.getFeaturedById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedBySection = (section: string, params?: Omit<FeaturedListParams, 'section'>) => {
  return useQuery({
    queryKey: ['featured', 'section', section, params],
    queryFn: () => featuredApi.getFeaturedBySection(section, params),
    enabled: !!section,
    staleTime: 2 * 60 * 1000, // 2 minutes for section content
  });
};

export const useFeaturedByType = (type: string, params?: Omit<FeaturedListParams, 'type'>) => {
  return useQuery({
    queryKey: ['featured', 'type', type, params],
    queryFn: () => featuredApi.getFeaturedByType(type, params),
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
};

// Section Management Hooks
export const useFeaturedSections = () => {
  return useQuery({
    queryKey: ['featured', 'sections'],
    queryFn: () => featuredApi.getSections(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFeaturedSectionById = (id: string) => {
  return useQuery({
    queryKey: ['featured', 'sections', id],
    queryFn: () => featuredApi.getSectionById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// Templates Hooks
export const useFeaturedTemplates = (params?: { type?: string; section?: string; public?: boolean }) => {
  return useQuery({
    queryKey: ['featured', 'templates', params],
    queryFn: () => featuredApi.getTemplates(params),
    staleTime: 10 * 60 * 1000,
  });
};

export const useFeaturedTemplateById = (id: string) => {
  return useQuery({
    queryKey: ['featured', 'templates', id],
    queryFn: () => featuredApi.getTemplateById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// Scheduling Hooks
export const useFeaturedSchedules = (params?: { status?: string; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['featured', 'schedules', params],
    queryFn: () => featuredApi.getSchedules(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedScheduleById = (id: string) => {
  return useQuery({
    queryKey: ['featured', 'schedules', id],
    queryFn: () => featuredApi.getScheduleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// A/B Testing Hooks
export const useFeaturedABTests = (params?: { section?: string; status?: string }) => {
  return useQuery({
    queryKey: ['featured', 'ab-tests', params],
    queryFn: () => featuredApi.getABTests(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedABTestById = (id: string) => {
  return useQuery({
    queryKey: ['featured', 'ab-tests', id],
    queryFn: () => featuredApi.getABTestById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Analytics Hooks
export const useFeaturedPerformance = (id: string, period?: string) => {
  return useQuery({
    queryKey: ['featured', 'performance', id, period],
    queryFn: () => featuredApi.getFeaturedPerformance(id, period),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useFeaturedAnalytics = (params?: {
  section?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['featured', 'analytics', params],
    queryFn: () => featuredApi.getFeaturedAnalytics(params),
    staleTime: 2 * 60 * 1000,
  });
};

// Search Hooks
export const useFeaturedSearch = (query: string, params?: {
  section?: string;
  type?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['featured', 'search', query, params],
    queryFn: () => featuredApi.searchFeatured(query, params),
    enabled: !!query.trim(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useFeaturedSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ['featured', 'search-suggestions', query],
    queryFn: () => featuredApi.getSearchSuggestions(query),
    enabled: !!query.trim() && query.length >= 2,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Content Suggestions Hooks
export const useSuggestedContent = (section: string, params?: {
  type?: string;
  limit?: number;
  excludeIds?: string[];
}) => {
  return useQuery({
    queryKey: ['featured', 'suggestions', section, params],
    queryFn: () => featuredApi.getSuggestedContent(section, params),
    enabled: !!section,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTrendingContent = (params?: {
  section?: string;
  type?: string;
  period?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['featured', 'trending', params],
    queryFn: () => featuredApi.getTrendingContent(params),
    staleTime: 10 * 60 * 1000,
  });
};

export const usePopularContent = (params?: {
  section?: string;
  type?: string;
  period?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['featured', 'popular', params],
    queryFn: () => featuredApi.getPopularContent(params),
    staleTime: 10 * 60 * 1000,
  });
};

// Utility Hooks
export const useAvailableTypes = () => {
  return useQuery({
    queryKey: ['featured', 'types'],
    queryFn: () => featuredApi.getAvailableTypes(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useMobileFeatured = (params?: FeaturedListParams) => {
  return useQuery({
    queryKey: ['featured', 'mobile', params],
    queryFn: () => featuredApi.getMobileFeatured(params),
    staleTime: 2 * 60 * 1000,
  });
};

// ==================== Mutation Hooks ====================

export const useCreateFeatured = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<FeaturedContent>) => featuredApi.createFeatured(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
    },
  });
};

export const useUpdateFeatured = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FeaturedContent> }) => 
      featuredApi.updateFeatured(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'detail', id] });
    },
  });
};

export const useDeleteFeatured = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => featuredApi.deleteFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
    },
  });
};

export const useDuplicateFeatured = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { title?: string; section?: string } }) => 
      featuredApi.duplicateFeatured(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
    },
  });
};

// Status Management Mutations
export const useActivateFeatured = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => featuredApi.activateFeatured(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'detail', id] });
    },
  });
};

export const useDeactivateFeatured = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => featuredApi.deactivateFeatured(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'detail', id] });
    },
  });
};

export const useScheduleFeatured = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { startDate: Date; endDate?: Date } }) => 
      featuredApi.scheduleFeatured(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'detail', id] });
    },
  });
};

// Section Management Mutations
export const useCreateFeaturedSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<FeaturedSectionConfig>) => featuredApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'sections'] });
    },
  });
};

export const useUpdateFeaturedSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FeaturedSectionConfig> }) => 
      featuredApi.updateSection(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'sections'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'sections', id] });
    },
  });
};

export const useDeleteFeaturedSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => featuredApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'sections'] });
    },
  });
};

// Position & Priority Mutations
export const useReorderFeatured = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ section, items }: { 
      section: string; 
      items: { id: string; position: number }[] 
    }) => featuredApi.reorderFeatured(section, items),
    onSuccess: (_, { section }) => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'section', section] });
    },
  });
};

export const useUpdatePriority = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: number }) => 
      featuredApi.updatePriority(id, priority),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'detail', id] });
    },
  });
};

// Display Settings Mutations
export const useUpdateDisplaySettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: FeaturedDisplaySettings }) => 
      featuredApi.updateDisplaySettings(id, settings),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'detail', id] });
    },
  });
};

export const useUpdateVisibility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { visibility: string; targetAudience?: string[] } 
    }) => featuredApi.updateVisibility(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'detail', id] });
    },
  });
};

// Rules Mutations
export const useUpdateRules = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, rules }: { id: string; rules: FeaturedRule[] }) => 
      featuredApi.updateRules(id, rules),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'detail', id] });
    },
  });
};

// Template Mutations
export const useCreateFeaturedTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<FeaturedTemplate>) => featuredApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'templates'] });
    },
  });
};

export const useUpdateFeaturedTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FeaturedTemplate> }) => 
      featuredApi.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'templates', id] });
    },
  });
};

export const useDeleteFeaturedTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => featuredApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'templates'] });
    },
  });
};

export const useCreateFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: Partial<FeaturedContent> }) => 
      featuredApi.createFromTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
    },
  });
};

// Schedule Mutations
export const useCreateFeaturedSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<FeaturedSchedule>) => featuredApi.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'schedules'] });
    },
  });
};

export const useUpdateFeaturedSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FeaturedSchedule> }) => 
      featuredApi.updateSchedule(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'schedules'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'schedules', id] });
    },
  });
};

export const useDeleteFeaturedSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => featuredApi.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'schedules'] });
    },
  });
};

export const useExecuteSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => featuredApi.executeSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'schedules'] });
    },
  });
};

// A/B Testing Mutations
export const useCreateABTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<FeaturedABTest>) => featuredApi.createABTest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'ab-tests'] });
    },
  });
};

export const useUpdateABTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FeaturedABTest> }) => 
      featuredApi.updateABTest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'ab-tests'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'ab-tests', id] });
    },
  });
};

export const useStartABTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => featuredApi.startABTest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'ab-tests'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'ab-tests', id] });
    },
  });
};

export const usePauseABTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => featuredApi.pauseABTest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'ab-tests'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'ab-tests', id] });
    },
  });
};

export const useCompleteABTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, winningVariant }: { id: string; winningVariant?: string }) => 
      featuredApi.completeABTest(id, winningVariant),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'ab-tests'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'ab-tests', id] });
    },
  });
};

export const useDeleteABTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => featuredApi.deleteABTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'ab-tests'] });
    },
  });
};

// Bulk Operations Mutations
export const useBulkFeaturedOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operation: FeaturedBulkOperation) => featuredApi.bulkOperation(operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
    },
  });
};

// Performance Tracking Mutations
export const useRecordView = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { userId?: string; sessionId?: string } }) => 
      featuredApi.recordView(id, data),
  });
};

export const useRecordClick = () => {
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data?: { userId?: string; sessionId?: string; target?: string } 
    }) => featuredApi.recordClick(id, data),
  });
};

export const useRecordConversion = () => {
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { userId?: string; value?: number; type?: string } 
    }) => featuredApi.recordConversion(id, data),
  });
};

// Import/Export Mutations
export const useImportFeatured = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { file: File; format: 'json' | 'csv'; section?: string }) => 
      featuredApi.importFeatured(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
    },
  });
};

// AI & Automation Mutations
export const useGenerateAIContent = () => {
  return useMutation({
    mutationFn: (data: {
      type: string;
      section: string;
      theme?: string;
      audience?: string;
      count?: number;
    }) => featuredApi.generateAIContent(data),
  });
};

export const useOptimizeContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, goals }: { id: string; goals?: string[] }) => 
      featuredApi.optimizeContent(id, goals),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'detail', id] });
    },
  });
};

export const useAutoSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      contentIds: string[];
      period: string;
      rules?: string[];
    }) => featuredApi.autoSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured'] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'schedules'] });
    },
  });
};

// Mobile Settings Mutation
export const useUpdateMobileSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, settings }: { 
      id: string; 
      settings: {
        mobileLayout?: string;
        mobileSize?: string;
        hideOnMobile?: boolean;
        mobileImage?: string;
      }
    }) => featuredApi.updateMobileSettings(id, settings),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['featured', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['featured', 'mobile'] });
    },
  });
};

export default featuredApi;
