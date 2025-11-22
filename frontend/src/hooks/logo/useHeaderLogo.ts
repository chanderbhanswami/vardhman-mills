import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface HeaderLogo {
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
  transparentBackground: boolean;
  darkModeUrl?: string;
  responsiveVersions?: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  stickyVersion?: string; // For sticky header
  position: 'left' | 'center' | 'right';
}

export interface HeaderLogoUploadData {
  file: File;
  name: string;
  altText: string;
  description?: string;
  tags?: string[];
  transparentBackground?: boolean;
  darkModeFile?: File;
  stickyVersionFile?: File;
  position?: HeaderLogo['position'];
  generateResponsive?: boolean;
}

export interface UseHeaderLogoOptions {
  enableCache?: boolean;
  cacheTime?: number;
  enableOptimization?: boolean;
  preloadImages?: boolean;
}

export const useHeaderLogo = (options: UseHeaderLogoOptions = {}) => {
  const {
    enableCache = true,
    cacheTime = 15 * 60 * 1000, // 15 minutes (longer for header)
    enableOptimization = true,
    preloadImages = true,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [optimizationProgress, setOptimizationProgress] = useState<number>(0);
  const [preloadStatus, setPreloadStatus] = useState<'idle' | 'loading' | 'complete' | 'error'>('idle');

  // Fetch header logos
  const {
    data: logos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['headerLogos'],
    queryFn: async (): Promise<HeaderLogo[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      const mockLogos: HeaderLogo[] = [
        {
          id: 'header_logo_1',
          name: 'Vardhman Mills Main Header',
          url: '/images/logos/header-logo-main.svg',
          altText: 'Vardhman Mills - Premium Textiles & Manufacturing',
          width: 220,
          height: 80,
          format: 'svg',
          fileSize: 15200,
          isActive: true,
          isDefault: true,
          uploadedBy: 'admin',
          uploadedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          lastModified: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          tags: ['header', 'main', 'primary'],
          description: 'Primary header logo for all pages',
          transparentBackground: true,
          darkModeUrl: '/images/logos/header-logo-dark.svg',
          responsiveVersions: {
            mobile: '/images/logos/header-logo-mobile.svg',
            tablet: '/images/logos/header-logo-tablet.svg',
            desktop: '/images/logos/header-logo-desktop.svg',
          },
          stickyVersion: '/images/logos/header-logo-sticky.svg',
          position: 'left',
        },
        {
          id: 'header_logo_2',
          name: 'Vardhman Centered Logo',
          url: '/images/logos/header-logo-center.png',
          altText: 'Vardhman Mills Centered',
          width: 180,
          height: 60,
          format: 'png',
          fileSize: 12800,
          isActive: false,
          isDefault: false,
          uploadedBy: user?.email || 'designer@vardhmanmills.com',
          uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          tags: ['header', 'centered', 'alternative'],
          description: 'Centered header layout version',
          transparentBackground: false,
          position: 'center',
        },
        {
          id: 'header_logo_3',
          name: 'Compact Header Logo',
          url: '/images/logos/header-logo-compact.svg',
          altText: 'Vardhman Mills Compact',
          width: 140,
          height: 50,
          format: 'svg',
          fileSize: 8900,
          isActive: false,
          isDefault: false,
          uploadedBy: user?.email || 'marketing@vardhmanmills.com',
          uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          tags: ['header', 'compact', 'mobile-first'],
          description: 'Compact version for mobile and sticky headers',
          transparentBackground: true,
          stickyVersion: '/images/logos/header-logo-compact-sticky.svg',
          position: 'left',
        },
      ];

      return mockLogos;
    },
    enabled: enableCache,
    staleTime: cacheTime,
    gcTime: cacheTime * 2,
  });

  // Preload images effect
  useEffect(() => {
    if (preloadImages && logos.length > 0) {
      setPreloadStatus('loading');
      
      const imagePromises = logos.map(logo => {
        const img = new Image();
        img.src = logo.url;
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      Promise.all(imagePromises)
        .then(() => setPreloadStatus('complete'))
        .catch(() => setPreloadStatus('error'));
    }
  }, [logos, preloadImages]);

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (data: HeaderLogoUploadData): Promise<HeaderLogo> => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      setUploadProgress(0);

      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + Math.random() * 15;
          return next >= 85 ? 85 : next;
        });
      }, 300);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      clearInterval(uploadInterval);
      setUploadProgress(100);

      // Simulate optimization if enabled
      if (enableOptimization) {
        setOptimizationProgress(0);
        const optimizationInterval = setInterval(() => {
          setOptimizationProgress(prev => {
            const next = prev + Math.random() * 20;
            return next >= 100 ? 100 : next;
          });
        }, 200);

        await new Promise(resolve => setTimeout(resolve, 2000));
        clearInterval(optimizationInterval);
        setOptimizationProgress(100);
      }

      const newLogo: HeaderLogo = {
        id: `header_logo_${Date.now()}`,
        name: data.name,
        url: `/images/logos/${data.file.name}`,
        altText: data.altText,
        width: undefined, // Would be detected from actual file
        height: undefined,
        format: data.file.type.split('/')[1] as HeaderLogo['format'],
        fileSize: data.file.size,
        isActive: false,
        isDefault: false,
        uploadedBy: user?.email || 'user@example.com',
        uploadedAt: new Date(),
        lastModified: new Date(),
        tags: data.tags || [],
        description: data.description,
        transparentBackground: data.transparentBackground ?? true,
        darkModeUrl: data.darkModeFile ? `/images/logos/dark-${data.darkModeFile.name}` : undefined,
        stickyVersion: data.stickyVersionFile ? `/images/logos/sticky-${data.stickyVersionFile.name}` : undefined,
        position: data.position || 'left',
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
      queryClient.invalidateQueries({ queryKey: ['headerLogos'] });
      toast.success(
        `Header logo "${newLogo.name}" uploaded successfully!`,
        { duration: 4000, icon: '🚀' }
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
      await new Promise(resolve => setTimeout(resolve, 900));
      
      console.log(`Setting active header logo: ${logoId}`);
    },
    onSuccess: (_, logoId) => {
      queryClient.setQueryData(['headerLogos'], (oldLogos: HeaderLogo[] | undefined) => {
        return oldLogos?.map(logo => ({
          ...logo,
          isActive: logo.id === logoId,
          isDefault: logo.id === logoId ? logo.isDefault : false,
        })) || [];
      });
      
      const selectedLogo = logos.find(logo => logo.id === logoId);
      toast.success(
        `"${selectedLogo?.name}" is now the active header logo`,
        { duration: 3000, icon: '🎯' }
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to set active logo',
        { duration: 4000 }
      );
    },
  });

  // Update logo position mutation
  const updateLogoPositionMutation = useMutation({
    mutationFn: async ({ logoId, position }: { logoId: string; position: HeaderLogo['position'] }): Promise<void> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      console.log(`Updating logo ${logoId} position to: ${position}`);
    },
    onSuccess: (_, { logoId, position }) => {
      queryClient.setQueryData(['headerLogos'], (oldLogos: HeaderLogo[] | undefined) => {
        return oldLogos?.map(logo => ({
          ...logo,
          position: logo.id === logoId ? position : logo.position,
        })) || [];
      });
      
      toast.success(
        `Logo position updated to ${position}`,
        { duration: 3000, icon: '📍' }
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update position',
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
      await new Promise(resolve => setTimeout(resolve, 1200));
    },
    onSuccess: (_, logoId) => {
      queryClient.setQueryData(['headerLogos'], (oldLogos: HeaderLogo[] | undefined) => {
        return oldLogos?.filter(logo => logo.id !== logoId) || [];
      });
      
      toast.success('Header logo deleted successfully', {
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
  const getActiveLogo = useCallback((): HeaderLogo | undefined => {
    return logos.find(logo => logo.isActive);
  }, [logos]);

  const getDefaultLogo = useCallback((): HeaderLogo | undefined => {
    return logos.find(logo => logo.isDefault);
  }, [logos]);

  const getLogosByPosition = useCallback((position: HeaderLogo['position']): HeaderLogo[] => {
    return logos.filter(logo => logo.position === position);
  }, [logos]);

  const getLogosByTag = useCallback((tag: string): HeaderLogo[] => {
    return logos.filter(logo => logo.tags?.includes(tag) || false);
  }, [logos]);

  const validateHeaderLogoFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    const maxSize = 8 * 1024 * 1024; // 8MB (larger for headers)
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
        error: 'File size too large. Maximum size is 8MB for header logos.',
      };
    }

    return { isValid: true };
  }, []);

  const generateLogoUrl = useCallback((logo: HeaderLogo, options?: { 
    darkMode?: boolean;
    sticky?: boolean;
    responsive?: 'mobile' | 'tablet' | 'desktop';
  }): string => {
    if (options?.sticky && logo.stickyVersion) {
      return logo.stickyVersion;
    }

    if (options?.darkMode && logo.darkModeUrl) {
      return logo.darkModeUrl;
    }

    if (options?.responsive && logo.responsiveVersions) {
      return logo.responsiveVersions[options.responsive];
    }

    return logo.url;
  }, []);

  const getLogoForBreakpoint = useCallback((breakpoint: 'mobile' | 'tablet' | 'desktop'): HeaderLogo | undefined => {
    const activeLogo = getActiveLogo();
    console.log(`Getting logo for breakpoint: ${breakpoint}`);
    return activeLogo;
  }, [getActiveLogo]);

  const previewLogo = useCallback((logo: HeaderLogo) => {
    // This would typically open a modal or navigate to preview page
    toast.success(`Previewing header logo: ${logo.name}`, {
      duration: 2000,
      icon: '👁️'
    });
  }, []);

  // Actions
  const uploadLogo = useCallback(async (data: HeaderLogoUploadData) => {
    const validation = validateHeaderLogoFile(data.file);
    if (!validation.isValid) {
      toast.error(validation.error!, { duration: 4000 });
      return;
    }

    return uploadLogoMutation.mutateAsync(data);
  }, [uploadLogoMutation, validateHeaderLogoFile]);

  const setActiveLogo = useCallback(async (logoId: string) => {
    return setActiveLogoMutation.mutateAsync(logoId);
  }, [setActiveLogoMutation]);

  const updateLogoPosition = useCallback(async (logoId: string, position: HeaderLogo['position']) => {
    return updateLogoPositionMutation.mutateAsync({ logoId, position });
  }, [updateLogoPositionMutation]);

  const deleteLogo = useCallback(async (logoId: string) => {
    const logoToDelete = logos.find(logo => logo.id === logoId);
    
    // Show confirmation for non-system logos
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
      toast.error('No default header logo found', { duration: 3000 });
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
    preloadStatus,
    
    // Mutations state
    isUploading: uploadLogoMutation.isPending,
    isSettingActive: setActiveLogoMutation.isPending,
    isUpdatingPosition: updateLogoPositionMutation.isPending,
    isDeleting: deleteLogoMutation.isPending,
    
    // Actions
    uploadLogo,
    setActiveLogo,
    updateLogoPosition,
    deleteLogo,
    resetToDefault,
    previewLogo,
    refetch,
    
    // Helpers
    getLogosByPosition,
    getLogosByTag,
    getLogoForBreakpoint,
    validateHeaderLogoFile,
    generateLogoUrl,
    
    // Mutation errors
    uploadError: uploadLogoMutation.error,
    deleteError: deleteLogoMutation.error,
    setActiveError: setActiveLogoMutation.error,
    positionError: updateLogoPositionMutation.error,
  };
};

export default useHeaderLogo;
