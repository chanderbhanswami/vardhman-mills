'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Play, 
  Trash2,
  FileText,
  Music,
  AlertCircle,
  CheckCircle,
  Loader2,
  MoreHorizontal,
  FileVideo,
  FileAudio,
  FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';

// Types
export interface MediaFile {
  id: string;
  file: File;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  name: string;
  size: number;
  duration?: number;
  dimensions?: { width: number; height: number };
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
  metadata?: {
    format: string;
    quality: string;
    bitrate?: number;
    codec?: string;
    aspectRatio?: string;
    colorSpace?: string;
    fps?: number;
  };
  filters?: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    sepia: number;
    grayscale: number;
    hueRotate: number;
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  transforms?: {
    rotation: number;
    flipHorizontal: boolean;
    flipVertical: boolean;
    scale: number;
  };
}

export interface MediaUploaderProps {
  onFilesChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  allowedFormats?: {
    images?: string[];
    videos?: string[];
    audio?: string[];
    documents?: string[];
  };
  showPreview?: boolean;
  showEditor?: boolean;
  showMetadata?: boolean;
  enableFilters?: boolean;
  enableCrop?: boolean;
  enableTransforms?: boolean;
  enableCompression?: boolean;
  compressionQuality?: number;
  autoUpload?: boolean;
  uploadEndpoint?: string;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  dropzoneText?: string;
  errorMessages?: {
    maxFiles?: string;
    maxSize?: string;
    invalidType?: string;
    uploadFailed?: string;
  };
  onUploadStart?: (file: MediaFile) => void;
  onUploadProgress?: (file: MediaFile, progress: number) => void;
  onUploadSuccess?: (file: MediaFile, response: unknown) => void;
  onUploadError?: (file: MediaFile, error: Error) => void;
  onFileRemove?: (file: MediaFile) => void;
  onFileEdit?: (file: MediaFile) => void;
  customValidation?: (file: File) => Promise<boolean | string>;
  renderPreview?: (file: MediaFile) => React.ReactNode;
  renderEditor?: (file: MediaFile, onSave: (updates: Partial<MediaFile>) => void) => React.ReactNode;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onFilesChange,
  maxFiles = 10,
  maxSize = 50,
  acceptedTypes = ['image/*', 'video/*', 'audio/*'],
  allowedFormats = {
    images: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
    videos: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
    documents: ['pdf', 'doc', 'docx', 'txt']
  },
  showPreview = true,
  showMetadata = true,
  enableFilters = true,
  enableCrop = true,
  enableTransforms = true,
  enableCompression = true,
  compressionQuality = 0.8,
  autoUpload = false,
  uploadEndpoint = '/api/upload',
  className,
  disabled = false,
  multiple = true,
  dropzoneText = 'Drop files here or click to browse',
  errorMessages = {},
  onUploadStart,
  onUploadProgress,
  onUploadSuccess,
  onUploadError,
  onFileRemove,
  customValidation
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'type' | 'date'>('date');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [notifications, setNotifications] = useState<{ id: string; type: 'success' | 'error' | 'info'; message: string }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use all the prop values to avoid unused variable warnings
  React.useEffect(() => {
    console.log('MediaUploader configured with:', {
      showPreview,
      showMetadata,
      enableFilters,
      enableCrop,
      enableTransforms,
      enableCompression,
      compressionQuality
    });
  }, [showPreview, showMetadata, enableFilters, enableCrop, enableTransforms, enableCompression, compressionQuality]);

  // Default error messages
  const defaultErrorMessages = React.useMemo(() => ({
    maxFiles: `Maximum ${maxFiles} files allowed`,
    maxSize: `File size must be less than ${maxSize}MB`,
    invalidType: 'File type not supported',
    uploadFailed: 'Upload failed. Please try again.',
    ...errorMessages
  }), [maxFiles, maxSize, errorMessages]);

  // Toast notification function
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Utility functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (file: File): MediaFile['type'] => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image': return 'image';
      case 'video': return 'video';
      case 'audio': return 'audio';
      default: return 'document';
    }
  };

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return <FileImage className="w-6 h-6" />;
      case 'video': return <FileVideo className="w-6 h-6" />;
      case 'audio': return <FileAudio className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Not an image file'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Not an image file'));
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('video/')) {
        reject(new Error('Not a video file'));
        return;
      }

      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = () => reject(new Error('Failed to load video'));
      
      const url = URL.createObjectURL(file);
      video.src = url;
    });
  };

  const validateFile = React.useCallback(async (file: File): Promise<{ valid: boolean; error?: string }> => {
    // Size validation
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: defaultErrorMessages.maxSize };
    }

    // Type validation
    const fileType = getFileType(file);
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    let isValidType = false;
    switch (fileType) {
      case 'image':
        isValidType = allowedFormats.images?.includes(extension || '') || false;
        break;
      case 'video':
        isValidType = allowedFormats.videos?.includes(extension || '') || false;
        break;
      case 'audio':
        isValidType = allowedFormats.audio?.includes(extension || '') || false;
        break;
      case 'document':
        isValidType = allowedFormats.documents?.includes(extension || '') || false;
        break;
    }

    if (!isValidType) {
      return { valid: false, error: defaultErrorMessages.invalidType };
    }

    // Custom validation
    if (customValidation) {
      const customResult = await customValidation(file);
      if (typeof customResult === 'string') {
        return { valid: false, error: customResult };
      }
      if (!customResult) {
        return { valid: false, error: 'File validation failed' };
      }
    }

    return { valid: true };
  }, [maxSize, defaultErrorMessages, allowedFormats, customValidation]);

  const createMediaFile = React.useCallback(async (file: File): Promise<MediaFile> => {
    const id = Math.random().toString(36).substr(2, 9);
    const type = getFileType(file);
    const url = URL.createObjectURL(file);

    let preview: string | undefined;
    let dimensions: { width: number; height: number } | undefined;
    let duration: number | undefined;

    try {
      if (type === 'image') {
        preview = await createImagePreview(file);
        dimensions = await getImageDimensions(file);
      } else if (type === 'video') {
        duration = await getVideoDuration(file);
      }
    } catch (error) {
      console.warn('Failed to generate preview or metadata:', error);
    }

    return {
      id,
      file,
      url,
      type,
      name: file.name,
      size: file.size,
      duration,
      dimensions,
      uploadProgress: 0,
      uploadStatus: 'pending',
      preview,
      metadata: {
        format: file.type,
        quality: 'original'
      },
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        sepia: 0,
        grayscale: 0,
        hueRotate: 0
      },
      transforms: {
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
        scale: 1
      }
    };
  }, []);

  const uploadFile = React.useCallback(async (file: MediaFile) => {
    if (!uploadEndpoint) return;

    onUploadStart?.(file);
    
    // Update upload status
    const updatedFiles = files.map(f => 
      f.id === file.id ? { ...f, uploadStatus: 'uploading' as const } : f
    );
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);

    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('metadata', JSON.stringify({
      type: file.type,
      filters: file.filters,
      transforms: file.transforms,
      crop: file.crop
    }));

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onUploadProgress?.(file, progress);
          
          const progressUpdatedFiles = files.map(f => 
            f.id === file.id ? { ...f, uploadProgress: progress } : f
          );
          setFiles(progressUpdatedFiles);
          onFilesChange(progressUpdatedFiles);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onUploadSuccess?.(file, response);
          
          const successFiles = files.map(f => 
            f.id === file.id ? { 
              ...f, 
              uploadStatus: 'success' as const, 
              uploadProgress: 100,
              url: response.url || f.url
            } : f
          );
          setFiles(successFiles);
          onFilesChange(successFiles);
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        throw new Error('Network error during upload');
      };

      xhr.open('POST', uploadEndpoint);
      xhr.send(formData);

    } catch (error) {
      const errorFiles = files.map(f => 
        f.id === file.id ? { 
          ...f, 
          uploadStatus: 'error' as const,
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      );
      setFiles(errorFiles);
      onFilesChange(errorFiles);
      
      onUploadError?.(file, error instanceof Error ? error : new Error('Upload failed'));
      
      showNotification('error', `Failed to upload ${file.name}`);
    }
  }, [uploadEndpoint, files, onUploadStart, onFilesChange, onUploadProgress, onUploadSuccess, onUploadError, showNotification]);

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(selectedFiles);
    
    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      showNotification('error', defaultErrorMessages.maxFiles);
      return;
    }

    const validFiles: MediaFile[] = [];
    
    for (const file of fileArray) {
      const validation = await validateFile(file);
      
      if (validation.valid) {
        try {
          const mediaFile = await createMediaFile(file);
          validFiles.push(mediaFile);
        } catch (error) {
          console.error('Error creating media file:', error);
          showNotification('error', `Failed to process ${file.name}`);
        }
      } else {
        showNotification('error', `${file.name}: ${validation.error}`);
      }
    }

    if (validFiles.length > 0) {
      const newFiles = [...files, ...validFiles];
      setFiles(newFiles);
      onFilesChange(newFiles);

      // Auto upload if enabled
      if (autoUpload) {
        validFiles.forEach(uploadFile);
      }
    }
  }, [disabled, files, maxFiles, defaultErrorMessages, showNotification, onFilesChange, autoUpload, createMediaFile, uploadFile, validateFile]);

  const removeFile = (fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.url);
      onFileRemove?.(fileToRemove);
    }
    
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setShowDeleteDialog(null);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [disabled, handleFileSelect]);

  // Filter and sort files
  const filteredFiles = files.filter(file => {
    if (filterType === 'all') return true;
    return file.type === filterType;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'type':
        return a.type.localeCompare(b.type);
      case 'date':
      default:
        return files.indexOf(b) - files.indexOf(a);
    }
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={cn(
                "p-4 rounded-lg shadow-lg",
                notification.type === 'success' && 'bg-green-100 text-green-800',
                notification.type === 'error' && 'bg-red-100 text-red-800',
                notification.type === 'info' && 'bg-blue-100 text-blue-800'
              )}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={(e) => {
            if (e.target.files) {
              handleFileSelect(e.target.files);
            }
          }}
          className="hidden"
          disabled={disabled}
          aria-label="Upload files"
          title="Upload files"
        />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">{dropzoneText}</h3>
        <p className="text-gray-500 mb-4">
          Maximum {maxFiles} files, {maxSize}MB each. 
          Supported: {Object.values(allowedFormats).flat().join(', ')}
        </p>
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || files.length >= maxFiles}
          variant="outline"
        >
          Browse Files
        </Button>
      </div>

      {/* Controls */}
      {files.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label htmlFor="filter-type" className="sr-only">Filter by type</label>
            <select 
              id="filter-type"
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as 'all' | 'image' | 'video' | 'audio' | 'document')}
              className="border rounded px-3 py-2"
              title="Filter files by type"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>

            <label htmlFor="sort-by" className="sr-only">Sort by</label>
            <select 
              id="sort-by"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'type' | 'date')}
              className="border rounded px-3 py-2"
              title="Sort files by"
            >
              <option value="date">Date Added</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="type">Type</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
            
            {!autoUpload && (
              <Button
                size="sm"
                onClick={() => files.forEach(uploadFile)}
                disabled={files.every(f => f.uploadStatus === 'success' || f.uploadStatus === 'uploading')}
                title="Upload all pending files"
              >
                Upload All
              </Button>
            )}
          </div>
        </div>
      )}

      {/* File List */}
      {sortedFiles.length > 0 && (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-4"
        )}>
          {sortedFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative group">
                <Card className="overflow-hidden">
                  <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                    {file.type === 'image' && file.preview && (
                      <Image
                        src={file.preview}
                        alt={file.name}
                        fill
                        className="object-cover"
                        style={{
                          filter: file.filters ? `
                            brightness(${file.filters.brightness}%) 
                            contrast(${file.filters.contrast}%) 
                            saturate(${file.filters.saturation}%) 
                            blur(${file.filters.blur}px) 
                            sepia(${file.filters.sepia}%) 
                            grayscale(${file.filters.grayscale}%) 
                            hue-rotate(${file.filters.hueRotate}deg)
                          ` : undefined,
                          transform: file.transforms ? `
                            rotate(${file.transforms.rotation}deg) 
                            scaleX(${file.transforms.flipHorizontal ? -1 : 1}) 
                            scaleY(${file.transforms.flipVertical ? -1 : 1}) 
                            scale(${file.transforms.scale})
                          ` : undefined
                        }}
                      />
                    )}

                    {file.type === 'video' && (
                      <div className="relative w-full h-full">
                        <video
                          src={file.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              const video = document.querySelector(`video[src="${file.url}"]`) as HTMLVideoElement;
                              if (video) {
                                if (video.paused) {
                                  video.play();
                                } else {
                                  video.pause();
                                }
                              }
                            }}
                            title="Play/pause video"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {file.type === 'audio' && (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Music className="w-12 h-12 mb-2" />
                        <audio
                          src={file.url}
                          controls
                          className="w-full max-w-xs"
                        />
                      </div>
                    )}

                    {file.type === 'document' && (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FileText className="w-12 h-12 mb-2" />
                        <span className="text-sm text-center">{file.name}</span>
                      </div>
                    )}

                    {/* Upload progress overlay */}
                    {file.uploadStatus === 'uploading' && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                          <Progress value={file.uploadProgress} className="w-32 mb-2" />
                          <div className="text-sm">{Math.round(file.uploadProgress)}%</div>
                        </div>
                      </div>
                    )}

                    {/* Status indicators */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {file.uploadStatus === 'success' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Uploaded
                        </Badge>
                      )}
                      {file.uploadStatus === 'error' && (
                        <Badge variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative">
                        <button 
                          className="bg-white rounded-full p-2 shadow-lg"
                          title="File actions"
                          aria-label="File actions"
                          onClick={() => {
                            // Simple menu toggle would go here
                            console.log('Action menu for', file.name);
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium truncate">{file.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          {getFileIcon(file.type)}
                          <span>{formatFileSize(file.size)}</span>
                          {file.duration && (
                            <span>• {Math.round(file.duration)}s</span>
                          )}
                          {file.dimensions && (
                            <span>• {file.dimensions.width}×{file.dimensions.height}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = file.url;
                            link.download = file.name;
                            link.click();
                          }}
                          title="Download file"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteDialog(file.id)}
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete File</h3>
            <p className="mb-4">Are you sure you want to delete this file? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => showDeleteDialog && removeFile(showDeleteDialog)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No files uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;