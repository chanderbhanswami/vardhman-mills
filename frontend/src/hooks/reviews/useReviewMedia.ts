import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for videos
  uploadedAt: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface MediaUploadOptions {
  maxFileSize?: number; // in MB
  maxFiles?: number;
  allowedTypes?: string[];
  compressionQuality?: number;
  thumbnailSize?: number;
}

export interface UseReviewMediaOptions {
  reviewId?: string;
  uploadOptions?: MediaUploadOptions;
  onUploadComplete?: (media: MediaFile[]) => void;
  onUploadError?: (error: string) => void;
}

export const useReviewMedia = (options: UseReviewMediaOptions = {}) => {
  const {
    reviewId,
    uploadOptions = {},
    onUploadComplete,
    onUploadError,
  } = options;

  const {
    maxFileSize = 10, // 10MB
    maxFiles = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
  } = uploadOptions;

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  // Fetch existing media for the review
  const {
    data: reviewMedia = [],
    isLoading: isLoadingMedia,
    error: mediaError,
    refetch: refetchMedia,
  } = useQuery({
    queryKey: ['reviews', reviewId, 'media'],
    queryFn: async (): Promise<MediaFile[]> => {
      if (!reviewId) return [];

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock media data
      return [
        {
          id: 'media_1',
          type: 'image',
          url: '/images/reviews/review1_image1.jpg',
          originalName: 'product_photo.jpg',
          size: 2048576, // 2MB
          mimeType: 'image/jpeg',
          thumbnail: '/images/reviews/thumbs/review1_image1_thumb.jpg',
          dimensions: { width: 1920, height: 1080 },
          uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'media_2',
          type: 'video',
          url: '/videos/reviews/review1_video1.mp4',
          originalName: 'product_review.mp4',
          size: 15728640, // 15MB
          mimeType: 'video/mp4',
          thumbnail: '/images/reviews/thumbs/review1_video1_thumb.jpg',
          dimensions: { width: 1280, height: 720 },
          duration: 45, // 45 seconds
          uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
      ];
    },
    enabled: !!reviewId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (files: File[]): Promise<MediaFile[]> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to upload media');
      }

      const uploadPromises = files.map(async (file, index) => {
        const fileId = `upload_${Date.now()}_${index}`;
        
        // Update progress
        setUploadProgress(prev => [
          ...prev,
          {
            fileId,
            fileName: file.name,
            progress: 0,
            status: 'uploading',
          },
        ]);

        // Simulate file upload with progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          
          setUploadProgress(prev => prev.map(item => 
            item.fileId === fileId 
              ? { ...item, progress, status: progress === 100 ? 'processing' : 'uploading' }
              : item
          ));
        }

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create media file object
        const mediaFile: MediaFile = {
          id: `media_${Date.now()}_${index}`,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: URL.createObjectURL(file), // In real app, this would be server URL
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          thumbnail: file.type.startsWith('video/') 
            ? '/images/video-placeholder.jpg' 
            : URL.createObjectURL(file),
          dimensions: { width: 1200, height: 800 }, // Mock dimensions
          duration: file.type.startsWith('video/') ? 30 : undefined,
          uploadedAt: new Date().toISOString(),
        };

        // Update progress to completed
        setUploadProgress(prev => prev.map(item => 
          item.fileId === fileId 
            ? { ...item, progress: 100, status: 'completed' }
            : item
        ));

        return mediaFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress([]);
      }, 2000);

      return uploadedFiles;
    },
    onSuccess: (uploadedFiles) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', reviewId, 'media'] });
      onUploadComplete?.(uploadedFiles);
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`, {
        duration: 3000,
        icon: '📁',
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload files';
      onUploadError?.(errorMessage);
      toast.error(errorMessage, { duration: 4000 });
      
      // Clear failed uploads from progress
      setUploadProgress(prev => prev.filter(item => item.status !== 'error'));
    },
  });

  // Delete media mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId: string): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to delete media');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`Deleting media ${mediaId}`);
    },
    onSuccess: (_, mediaId) => {
      // Remove from cache
      queryClient.setQueryData(['reviews', reviewId, 'media'], (oldMedia: MediaFile[] = []) => {
        return oldMedia.filter(media => media.id !== mediaId);
      });
      
      toast.success('Media deleted successfully', { duration: 2000, icon: '🗑️' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete media',
        { duration: 3000 }
      );
    },
  });

  // Reorder media mutation
  const reorderMediaMutation = useMutation({
    mutationFn: async (newOrder: string[]): Promise<void> => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to reorder media');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('New media order:', newOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', reviewId, 'media'] });
      toast.success('Media order updated', { duration: 2000 });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to reorder media',
        { duration: 3000 }
      );
    },
  });

  // File validation
  const validateFiles = useCallback((files: File[]): { valid: File[]; invalid: Array<{ file: File; error: string }> } => {
    const valid: File[] = [];
    const invalid: Array<{ file: File; error: string }> = [];

    files.forEach(file => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        invalid.push({
          file,
          error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        });
        return;
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSize) {
        invalid.push({
          file,
          error: `File size ${fileSizeMB.toFixed(1)}MB exceeds maximum of ${maxFileSize}MB`,
        });
        return;
      }

      valid.push(file);
    });

    // Check total number of files
    if (valid.length + reviewMedia.length > maxFiles) {
      const excess = valid.length + reviewMedia.length - maxFiles;
      const validFiles = valid.slice(0, valid.length - excess);
      valid.slice(validFiles.length).forEach(file => {
        invalid.push({
          file,
          error: `Maximum ${maxFiles} files allowed. Current: ${reviewMedia.length}`,
        });
      });
      
      return { valid: validFiles, invalid };
    }

    return { valid, invalid };
  }, [allowedTypes, maxFileSize, maxFiles, reviewMedia.length]);

  // Generate preview URLs
  const generatePreviews = useCallback((files: File[]) => {
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
    return urls;
  }, []);

  // Clean up preview URLs
  const cleanupPreviews = useCallback(() => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  }, [previewUrls]);

  // File selection handlers
  const handleFileSelect = useCallback((files: File[]) => {
    const { valid, invalid } = validateFiles(files);

    if (invalid.length > 0) {
      const errors = invalid.map(item => `${item.file.name}: ${item.error}`);
      toast.error(`Some files were rejected:\n${errors.join('\n')}`, {
        duration: 5000,
      });
    }

    if (valid.length > 0) {
      setSelectedFiles(prev => [...prev, ...valid]);
      generatePreviews(valid);
    }
  }, [validateFiles, generatePreviews]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFileSelect(files);
  }, [handleFileSelect]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [handleFileSelect]);

  // Action handlers
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeSelectedFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }
  }, [previewUrls]);

  const clearSelectedFiles = useCallback(() => {
    setSelectedFiles([]);
    cleanupPreviews();
  }, [cleanupPreviews]);

  const uploadSelectedFiles = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected', { duration: 2000 });
      return;
    }

    try {
      const result = await uploadMediaMutation.mutateAsync(selectedFiles);
      setSelectedFiles([]);
      cleanupPreviews();
      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }, [selectedFiles, uploadMediaMutation, cleanupPreviews]);

  const deleteMedia = useCallback(async (mediaId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this media file?');
    if (!confirmDelete) return;

    return deleteMediaMutation.mutateAsync(mediaId);
  }, [deleteMediaMutation]);

  const reorderMedia = useCallback(async (newOrder: string[]) => {
    return reorderMediaMutation.mutateAsync(newOrder);
  }, [reorderMediaMutation]);

  // Helper functions
  const getMediaByType = useCallback((type: 'image' | 'video') => {
    return reviewMedia.filter(media => media.type === type);
  }, [reviewMedia]);

  const getTotalSize = useCallback((): number => {
    return reviewMedia.reduce((total, media) => total + media.size, 0);
  }, [reviewMedia]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const canUploadMore = useCallback((): boolean => {
    return reviewMedia.length + selectedFiles.length < maxFiles;
  }, [reviewMedia.length, selectedFiles.length, maxFiles]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPreviews();
    };
  }, [cleanupPreviews]);

  return {
    // Media data
    reviewMedia,
    selectedFiles,
    previewUrls,
    uploadProgress,
    
    // State
    isLoadingMedia,
    isDragActive,
    canUploadMore: canUploadMore(),
    
    // File input ref
    fileInputRef,
    
    // Handlers
    handleInputChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    
    // Actions
    openFileDialog,
    removeSelectedFile,
    clearSelectedFiles,
    uploadSelectedFiles,
    deleteMedia,
    reorderMedia,
    refetchMedia,
    
    // Utilities
    getMediaByType,
    getTotalSize,
    formatFileSize,
    
    // Stats
    stats: {
      totalFiles: reviewMedia.length,
      totalSize: getTotalSize(),
      imageCount: getMediaByType('image').length,
      videoCount: getMediaByType('video').length,
      selectedCount: selectedFiles.length,
    },
    
    // Loading states
    isUploading: uploadMediaMutation.isPending,
    isDeleting: deleteMediaMutation.isPending,
    isReordering: reorderMediaMutation.isPending,
    
    // Errors
    mediaError,
    uploadError: uploadMediaMutation.error,
    deleteError: deleteMediaMutation.error,
    reorderError: reorderMediaMutation.error,
  };
};

export default useReviewMedia;
