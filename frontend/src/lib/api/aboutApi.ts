import { HttpClient } from './client';
import { endpoints } from './endpoints';
import { About, ApiResponse } from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from './config';

/**
 * About API Service
 * Handles company information, history, team, and other about-related endpoints
 */

class AboutApiService {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient();
  }

  // Company Information
  async getCompanyInfo(): Promise<ApiResponse<About>> {
    return this.client.get<About>(endpoints.about.company);
  }

  async updateCompanyInfo(data: Partial<About>): Promise<ApiResponse<About>> {
    return this.client.put<About>(endpoints.about.company, data);
  }

  // Company History
  async getHistory(): Promise<ApiResponse<About[]>> {
    return this.client.get<About[]>(endpoints.about.history);
  }

  async addHistoryEntry(data: Omit<About, 'id'>): Promise<ApiResponse<About>> {
    return this.client.post<About>(endpoints.about.history, data);
  }

  async updateHistoryEntry(id: string, data: Partial<About>): Promise<ApiResponse<About>> {
    return this.client.put<About>(`${endpoints.about.history}/${id}`, data);
  }

  async deleteHistoryEntry(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(`${endpoints.about.history}/${id}`);
  }

  // Team Members
  async getTeamMembers(): Promise<ApiResponse<About[]>> {
    return this.client.get<About[]>(endpoints.about.team);
  }

  async getTeamMember(id: string): Promise<ApiResponse<About>> {
    return this.client.get<About>(`${endpoints.about.team}/${id}`);
  }

  async addTeamMember(data: Omit<About, 'id'>): Promise<ApiResponse<About>> {
    return this.client.post<About>(endpoints.about.team, data);
  }

  async updateTeamMember(id: string, data: Partial<About>): Promise<ApiResponse<About>> {
    return this.client.put<About>(`${endpoints.about.team}/${id}`, data);
  }

  async deleteTeamMember(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(`${endpoints.about.team}/${id}`);
  }

  // Mission & Vision
  async getMissionVision(): Promise<ApiResponse<About>> {
    return this.client.get<About>(endpoints.about.mission);
  }

  async updateMissionVision(data: Partial<About>): Promise<ApiResponse<About>> {
    return this.client.put<About>(endpoints.about.mission, data);
  }

  // Values
  async getValues(): Promise<ApiResponse<About[]>> {
    return this.client.get<About[]>(endpoints.about.values);
  }

  async addValue(data: Omit<About, 'id'>): Promise<ApiResponse<About>> {
    return this.client.post<About>(endpoints.about.values, data);
  }

  async updateValue(id: string, data: Partial<About>): Promise<ApiResponse<About>> {
    return this.client.put<About>(`${endpoints.about.values}/${id}`, data);
  }

  async deleteValue(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(`${endpoints.about.values}/${id}`);
  }

  // Awards & Certifications
  async getAwards(): Promise<ApiResponse<About[]>> {
    return this.client.get<About[]>(endpoints.about.awards);
  }

  async addAward(data: Omit<About, 'id'>): Promise<ApiResponse<About>> {
    return this.client.post<About>(endpoints.about.awards, data);
  }

  async updateAward(id: string, data: Partial<About>): Promise<ApiResponse<About>> {
    return this.client.put<About>(`${endpoints.about.awards}/${id}`, data);
  }

  async deleteAward(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(`${endpoints.about.awards}/${id}`);
  }

  // Statistics
  async getStatistics(): Promise<ApiResponse<About[]>> {
    return this.client.get<About[]>(endpoints.about.stats);
  }

  async updateStatistics(data: About[]): Promise<ApiResponse<About[]>> {
    return this.client.put<About[]>(endpoints.about.stats, data);
  }

  // Locations
  async getLocations(): Promise<ApiResponse<About[]>> {
    return this.client.get<About[]>(endpoints.about.locations);
  }

  async addLocation(data: Omit<About, 'id'>): Promise<ApiResponse<About>> {
    return this.client.post<About>(endpoints.about.locations, data);
  }

  async updateLocation(id: string, data: Partial<About>): Promise<ApiResponse<About>> {
    return this.client.put<About>(`${endpoints.about.locations}/${id}`, data);
  }

  async deleteLocation(id: string): Promise<ApiResponse<void>> {
    return this.client.delete(`${endpoints.about.locations}/${id}`);
  }
}

// Create service instance
const aboutApiService = new AboutApiService();

// React Query Hooks
export const useCompanyInfo = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.SETTINGS, 'company'],
    queryFn: () => aboutApiService.getCompanyInfo(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateCompanyInfo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<About>) => aboutApiService.updateCompanyInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'company'] });
    },
  });
};

export const useHistory = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.SETTINGS, 'history'],
    queryFn: () => aboutApiService.getHistory(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useAddHistoryEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<About, 'id'>) => aboutApiService.addHistoryEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'history'] });
    },
  });
};

export const useUpdateHistoryEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<About> }) => 
      aboutApiService.updateHistoryEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'history'] });
    },
  });
};

export const useDeleteHistoryEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => aboutApiService.deleteHistoryEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'history'] });
    },
  });
};

export const useTeamMembers = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.SETTINGS, 'team'],
    queryFn: () => aboutApiService.getTeamMembers(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useTeamMember = (id: string) => {
  return useQuery({
    queryKey: [CACHE_KEYS.SETTINGS, 'team', id],
    queryFn: () => aboutApiService.getTeamMember(id),
    enabled: !!id,
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<About, 'id'>) => aboutApiService.addTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'team'] });
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<About> }) => 
      aboutApiService.updateTeamMember(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'team'] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'team', id] });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => aboutApiService.deleteTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'team'] });
    },
  });
};

export const useMissionVision = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.SETTINGS, 'mission'],
    queryFn: () => aboutApiService.getMissionVision(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useUpdateMissionVision = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<About>) => aboutApiService.updateMissionVision(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'mission'] });
    },
  });
};

export const useValues = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.SETTINGS, 'values'],
    queryFn: () => aboutApiService.getValues(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useAddValue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<About, 'id'>) => aboutApiService.addValue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'values'] });
    },
  });
};

export const useUpdateValue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<About> }) => 
      aboutApiService.updateValue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'values'] });
    },
  });
};

export const useDeleteValue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => aboutApiService.deleteValue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'values'] });
    },
  });
};

export const useAwards = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.SETTINGS, 'awards'],
    queryFn: () => aboutApiService.getAwards(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useAddAward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<About, 'id'>) => aboutApiService.addAward(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'awards'] });
    },
  });
};

export const useUpdateAward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<About> }) => 
      aboutApiService.updateAward(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'awards'] });
    },
  });
};

export const useDeleteAward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => aboutApiService.deleteAward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'awards'] });
    },
  });
};

export const useStatistics = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.SETTINGS, 'statistics'],
    queryFn: () => aboutApiService.getStatistics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useUpdateStatistics = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: About[]) => aboutApiService.updateStatistics(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'statistics'] });
    },
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: [CACHE_KEYS.SETTINGS, 'locations'],
    queryFn: () => aboutApiService.getLocations(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useAddLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<About, 'id'>) => aboutApiService.addLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'locations'] });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<About> }) => 
      aboutApiService.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'locations'] });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => aboutApiService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.SETTINGS, 'locations'] });
    },
  });
};

export default aboutApiService;
