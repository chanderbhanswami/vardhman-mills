import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface Logo {
  id: string;
  name: string;
  url: string;
  altText: string;
  width?: number;
  height?: number;
  format: 'png' | 'jpg' | 'svg' | 'webp';
  fileSize: number;
  isActive: boolean;
  isDefault: boolean;
  uploadedBy: string;
  uploadedAt: Date;
  lastModified: Date;
  tags?: string[];
  description?: string;
  darkModeUrl?: string;
  responsiveVersions?: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export interface LogoUploadData {
  file: File;
  name: string;
  altText: string;
  description?: string;
  tags?: string[];
  darkModeFile?: File;
  generateResponsive?: boolean;
}

export interface UseFooterLogoOptions {
  enableCache?: boolean;
  cacheTime?: number;
  enableOptimization?: boolean;
}

export const useFooterLogo = (options: UseFooterLogoOptions = {}) => {
  const {
    enableCache = true,
    cacheTime = 10 * 60 * 1000, // 10 minutes
    enableOptimization = true,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [optimizationProgress, setOptimizationProgress] = useState<number>(0);

  // Fetch footer logos
  const {
    data: logos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['footerLogos'],
    queryFn: async (): Promise<Logo[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockLogos: Logo[] = [
        {
          id: 'footer_logo_1',
          name: 'Vardhman Mills Footer Logo',
          url: '/images/logos/footer-logo-light.svg',
          altText: 'Vardhman Mills - Premium Textiles',
          width: 180,
          height: 60,
          format: 'svg',
          fileSize: 12500,
          isActive: true,
          isDefault: true,
          uploadedBy: 'admin',
          uploadedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          tags: ['footer', 'main', 'light-theme'],
          description: 'Primary footer logo for light theme',
          darkModeUrl: '/images/logos/footer-logo-dark.svg',
          responsiveVersions: {
            mobile: '/images/logos/footer-logo-mobile.svg',
            tablet: '/images/logos/footer-logo-tablet.svg',
            desktop: '/images/logos/footer-logo-desktop.svg',
          },
        },
        {
          id: 'footer_logo_2',
          name: 'Vardhman Mills Compact Footer',
          url: '/images/logos/footer-logo-compact.png',
          altText: 'Vardhman Mills Compact',
          width: 120,
          height: 40,
          format: 'png',
          fileSize: 8500,
          isActive: false,
          isDefault: false,
          uploadedBy: user?.email || 'designer@vardhmanmills.com',
          uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lastModified: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          tags: ['footer', 'compact', 'alternative'],
          description: 'Compact version for small footer layouts',
        },
      ];

      return mockLogos;
    },
    enabled: enableCache,
    staleTime: cacheTime,
    gcTime: cacheTime * 2,
  });

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (data: LogoUploadData): Promise<Logo> => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      setUploadProgress(0);

      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + Math.random() * 20;
          return next >= 90 ? 90 : next;
        });
      }, 200);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(uploadInterval);
      setUploadProgress(100);

      // Simulate optimization if enabled
      if (enableOptimization) {
        setOptimizationProgress(0);
        const optimizationInterval = setInterval(() => {
          setOptimizationProgress(prev => {
            const next = prev + Math.random() * 25;
            return next >= 100 ? 100 : next;
          });
        }, 150);

        await new Promise(resolve => setTimeout(resolve, 1500));
        clearInterval(optimizationInterval);
        setOptimizationProgress(100);
      }

      const newLogo: Logo = {
        id: `footer_logo_${Date.now()}`,
        name: data.name,
        url: `/images/logos/${data.file.name}`,
        altText: data.altText,
        width: undefined, // Would be detected from actual file
        height: undefined,
        format: data.file.type.split('/')[1] as Logo['format'],
        fileSize: data.file.size,
        isActive: false,
        isDefault: false,
        uploadedBy: user?.email || 'user@example.com',
        uploadedAt: new Date(),
        lastModified: new Date(),
        tags: data.tags || [],
        description: data.description,
        darkModeUrl: data.darkModeFile ? `/images/logos/dark-${data.darkModeFile.name}` : undefined,
        responsiveVersions: data.generateResponsive ? {
          mobile: `/images/logos/mobile-${data.file.name}`,
          tablet: `/images/logos/tablet-${data.file.name}`,
          desktop: `/images/logos/desktop-${data.file.name}`,
        } : undefined,
      };

      setUploadProgress(0);
      setOptimizationProgress(0);

      return newLogo;
    },
    onSuccess: (newLogo) => {
      queryClient.invalidateQueries({ queryKey: ['footerLogos'] });
      toast.success(
        `Footer logo "${newLogo.name}" uploaded successfully!`,
        { duration: 4000, icon: '🖼️' }
      );
    },
    onError: (error) => {
      setUploadProgress(0);
      setOptimizationProgress(0);
      toast.error(
        error instanceof Error ? error.message : 'Upload failed',
        { duration: 4000 }
      );
    },
  });

  // Set active logo mutation
  const setActiveLogoMutation = useMutation({
    mutationFn: async (logoId: string): Promise<void> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In real implementation, this would update the backend with logoId
      console.log(`Setting active logo: ${logoId}`);
    },
    onSuccess: (_, logoId) => {
      queryClient.setQueryData(['footerLogos'], (oldLogos: Logo[] | undefined) => {
        return oldLogos?.map(logo => ({
          ...logo,
          isActive: logo.id === logoId,
          isDefault: logo.id === logoId ? logo.isDefault : false,
        })) || [];
      });
      
      const selectedLogo = logos.find(logo => logo.id === logoId);
      toast.success(
        `"${selectedLogo?.name}" is now the active footer logo`,
        { duration: 3000, icon: '✅' }
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to set active logo',
        { duration: 4000 }
      );
    },
  });

  // Delete logo mutation
  const deleteLogoMutation = useMutation({
    mutationFn: async (logoId: string): Promise<void> => {
      const logoToDelete = logos.find(logo => logo.id === logoId);
      
      if (logoToDelete?.isActive) {
        throw new Error('Cannot delete the active logo. Please set another logo as active first.');
      }

      if (logoToDelete?.isDefault) {
        throw new Error('Cannot delete the default logo.');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: (_, logoId) => {
      queryClient.setQueryData(['footerLogos'], (oldLogos: Logo[] | undefined) => {
        return oldLogos?.filter(logo => logo.id !== logoId) || [];
      });
      
      toast.success('Logo deleted successfully', {
        duration: 3000,
        icon: '🗑️'
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete logo',
        { duration: 4000 }
      );
    },
  });

  // Helper functions
  const getActiveLogo = useCallback((): Logo | undefined => {
    return logos.find(logo => logo.isActive);
  }, [logos]);

  const getDefaultLogo = useCallback((): Logo | undefined => {
    return logos.find(logo => logo.isDefault);
  }, [logos]);

  const getLogosByTag = useCallback((tag: string): Logo[] => {
    return logos.filter(logo => logo.tags?.includes(tag) || false);
  }, [logos]);

  const validateLogoFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload PNG, JPG, SVG, or WebP files.',
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size too large. Maximum size is 5MB.',
      };
    }

    return { isValid: true };
  }, []);

  const generateLogoUrl = useCallback((logo: Logo, options?: { 
    darkMode?: boolean;
    responsive?: 'mobile' | 'tablet' | 'desktop';
  }): string => {
    if (options?.darkMode && logo.darkModeUrl) {
      return logo.darkModeUrl;
    }

    if (options?.responsive && logo.responsiveVersions) {
      return logo.responsiveVersions[options.responsive];
    }

    return logo.url;
  }, []);

  const previewLogo = useCallback((logo: Logo) => {
    // This would typically open a modal or navigate to preview page
    toast.success(`Previewing: ${logo.name}`, {
      duration: 2000,
      icon: '👁️'
    });
  }, []);

  // Actions
  const uploadLogo = useCallback(async (data: LogoUploadData) => {
    const validation = validateLogoFile(data.file);
    if (!validation.isValid) {
      toast.error(validation.error!, { duration: 4000 });
      return;
    }

    return uploadLogoMutation.mutateAsync(data);
  }, [uploadLogoMutation, validateLogoFile]);

  const setActiveLogo = useCallback(async (logoId: string) => {
    return setActiveLogoMutation.mutateAsync(logoId);
  }, [setActiveLogoMutation]);

  const deleteLogo = useCallback(async (logoId: string) => {
    const logoToDelete = logos.find(logo => logo.id === logoId);
    
    // Show confirmation toast for non-system logos
    if (logoToDelete && !logoToDelete.isDefault) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${logoToDelete.name}"? This action cannot be undone.`
      );
      
      if (!confirmDelete) {
        return;
      }
    }

    return deleteLogoMutation.mutateAsync(logoId);
  }, [deleteLogoMutation, logos]);

  const resetToDefault = useCallback(async () => {
    const defaultLogo = getDefaultLogo();
    if (defaultLogo) {
      return setActiveLogoMutation.mutateAsync(defaultLogo.id);
    } else {
      toast.error('No default logo found', { duration: 3000 });
    }
  }, [getDefaultLogo, setActiveLogoMutation]);

  return {
    // Data
    logos,
    activeLogo: getActiveLogo(),
    defaultLogo: getDefaultLogo(),
    
    // State
    isLoading,
    error,
    uploadProgress,
    optimizationProgress,
    
    // Mutations state
    isUploading: uploadLogoMutation.isPending,
    isSettingActive: setActiveLogoMutation.isPending,
    isDeleting: deleteLogoMutation.isPending,
    
    // Actions
    uploadLogo,
    setActiveLogo,
    deleteLogo,
    resetToDefault,
    previewLogo,
    refetch,
    
    // Helpers
    getLogosByTag,
    validateLogoFile,
    generateLogoUrl,
    
    // Mutation errors
    uploadError: uploadLogoMutation.error,
    deleteError: deleteLogoMutation.error,
    setActiveError: setActiveLogoMutation.error,
  };
};

export default useFooterLogo;
