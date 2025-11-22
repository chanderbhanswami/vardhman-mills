'use client';

import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// File upload variants
const fileUploadVariants = cva(
  'relative border-2 border-dashed rounded-lg transition-colors',
  {
    variants: {
      variant: {
        default: 'border-gray-300 hover:border-gray-400',
        primary: 'border-blue-300 hover:border-blue-400',
        success: 'border-green-300 hover:border-green-400',
        danger: 'border-red-300 hover:border-red-400',
      },
      size: {
        sm: 'p-4 min-h-32',
        md: 'p-6 min-h-40',
        lg: 'p-8 min-h-48',
        xl: 'p-10 min-h-64',
      },
      state: {
        idle: '',
        dragOver: 'border-solid bg-blue-50 border-blue-400',
        uploading: 'border-solid bg-gray-50',
        success: 'border-solid bg-green-50 border-green-400',
        error: 'border-solid bg-red-50 border-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'idle',
    },
  }
);

// File type interface
export interface FileWithPreview extends File {
  id: string;
  preview?: string;
  progress?: number;
  status?: 'uploading' | 'success' | 'error';
  error?: string | null;
}

// File upload props
export interface FileUploadProps extends VariantProps<typeof fileUploadVariants> {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  minSize?: number; // in bytes
  disabled?: boolean;
  onFilesChange?: (files: FileWithPreview[]) => void;
  onUpload?: (files: FileWithPreview[]) => Promise<void>;
  onRemove?: (fileId: string) => void;
  validator?: (file: File) => string | null;
  showPreview?: boolean;
  showProgress?: boolean;
  allowReorder?: boolean;
  dropzoneText?: string;
  browseText?: string;
  className?: string;
  children?: React.ReactNode;
}

// Main FileUpload Component
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  ({
    accept,
    multiple = false,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB
    minSize = 0,
    disabled = false,
    onFilesChange,
    onUpload,
    onRemove,
    validator,
    showPreview = true,
    showProgress = true,

    dropzoneText = 'Drop files here or click to browse',
    browseText = 'Browse files',
    variant = 'default',
    size = 'md',
    state = 'idle',
    className,
    children,
    ...props
  }, ref) => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [currentState, setCurrentState] = useState<typeof state>(state);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCountRef = useRef(0);
    
    // Generate file ID
    const generateFileId = () => Math.random().toString(36).substring(2, 15);
    
    // Create file preview
    const createFilePreview = useCallback((file: File): Promise<string> => {
      return new Promise((resolve) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        } else {
          resolve('');
        }
      });
    }, []);
    
    // Validate file
    const validateFile = useCallback((file: File): string | null => {
      // Size validation
      if (file.size > maxSize) {
        return `File size exceeds ${formatFileSize(maxSize)}`;
      }
      
      if (file.size < minSize) {
        return `File size is below ${formatFileSize(minSize)}`;
      }
      
      // Type validation
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(type.replace('*', '.*'));
        });
        
        if (!isAccepted) {
          return `File type not accepted. Accepted types: ${accept}`;
        }
      }
      
      // Custom validation
      if (validator) {
        return validator(file);
      }
      
      return null;
    }, [accept, maxSize, minSize, validator]);
    
    // Process files
    const processFiles = useCallback(async (newFiles: File[]) => {
      const processedFiles: FileWithPreview[] = [];
      
      for (const file of newFiles) {
        const error = validateFile(file);
        const preview = showPreview ? await createFilePreview(file) : undefined;
        
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: generateFileId(),
          preview,
          progress: 0,
          status: error ? 'error' as const : undefined,
          error: error || undefined,
        });
        
        processedFiles.push(fileWithPreview);
      }
      
      const updatedFiles = multiple 
        ? [...files, ...processedFiles].slice(0, maxFiles)
        : processedFiles.slice(0, 1);
      
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
      
      // Note: Auto upload is handled separately in useEffect to avoid circular dependency
    }, [files, multiple, maxFiles, validateFile, showPreview, createFilePreview, onFilesChange]);
    
    // Handle file input change
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        processFiles(selectedFiles);
      }
      // Reset input value to allow re-selecting the same file
      e.target.value = '';
    }, [processFiles]);
    
    // Handle upload
    const handleUpload = useCallback(async (filesToUpload: FileWithPreview[]) => {
      if (!onUpload) return;
      
      setCurrentState('uploading');
      
      try {
        // Update files to show uploading status
        setFiles(prevFiles => 
          prevFiles.map(file => 
            filesToUpload.find(f => f.id === file.id)
              ? { ...file, status: 'uploading' as const, progress: 0 }
              : file
          )
        );
        
        await onUpload(filesToUpload);
        
        // Update files to show success status
        setFiles(prevFiles => 
          prevFiles.map(file => 
            filesToUpload.find(f => f.id === file.id)
              ? { ...file, status: 'success' as const, progress: 100 }
              : file
          )
        );
        
        setCurrentState('success');
      } catch (error) {
        // Update files to show error status
        setFiles(prevFiles => 
          prevFiles.map(file => 
            filesToUpload.find(f => f.id === file.id)
              ? { 
                  ...file, 
                  status: 'error' as const, 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                }
              : file
          )
        );
        
        setCurrentState('error');
      }
    }, [onUpload]);

    // Auto-upload effect to handle files after processing
    useEffect(() => {
      if (onUpload && files.length > 0) {
        const validFiles = files.filter(f => !f.error && f.status !== 'uploading');
        if (validFiles.length > 0) {
          handleUpload(validFiles);
        }
      }
    }, [files, onUpload, handleUpload]);
    
    // Handle remove file
    const handleRemoveFile = useCallback((fileId: string) => {
      const updatedFiles = files.filter(file => file.id !== fileId);
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
      onRemove?.(fileId);
    }, [files, onFilesChange, onRemove]);
    
    // Drag and drop handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCountRef.current++;
      
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragOver(true);
      }
    }, []);
    
    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCountRef.current--;
      
      if (dragCountRef.current === 0) {
        setIsDragOver(false);
      }
    }, []);
    
    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);
    
    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      dragCountRef.current = 0;
      setIsDragOver(false);
      
      if (disabled) return;
      
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles);
      }
    }, [disabled, processFiles]);
    
    // Click handler
    const handleClick = useCallback(() => {
      if (!disabled) {
        fileInputRef.current?.click();
      }
    }, [disabled]);
    
    // Update state based on drag over
    useEffect(() => {
      setCurrentState(isDragOver ? 'dragOver' : state);
    }, [isDragOver, state]);
    
    // Get file icon
    const getFileIcon = (file: FileWithPreview) => {
      if (file.type.startsWith('image/')) {
        return <PhotoIcon className="w-8 h-8" />;
      }
      if (file.type.startsWith('video/')) {
        return <VideoCameraIcon className="w-8 h-8" />;
      }
      return <DocumentIcon className="w-8 h-8" />;
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          fileUploadVariants({ variant, size, state: currentState }),
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        aria-label="File upload area"
        {...props}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
          aria-label="File upload input"
        />
        
        {/* Drop zone content */}
        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ 
                y: isDragOver ? -5 : 0,
                scale: isDragOver ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-4" />
            </motion.div>
            
            <p className="text-lg font-medium text-gray-700 mb-2">
              {dropzoneText}
            </p>
            
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              {browseText}
            </button>
            
            {(accept || maxSize) && (
              <div className="mt-4 text-sm text-gray-500">
                {accept && <p>Accepted formats: {accept}</p>}
                {maxSize && <p>Max file size: {formatFileSize(maxSize)}</p>}
                {multiple && maxFiles && <p>Max files: {maxFiles}</p>}
              </div>
            )}
          </div>
        )}
        
        {/* File list */}
        {showPreview && files.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                >
                  {/* File preview/icon */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <div
                        className="w-12 h-12 bg-cover bg-center bg-no-repeat rounded"
                        data-preview-url={file.preview}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>
                  
                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {/* Progress bar */}
                    {showProgress && file.status === 'uploading' && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div 
                          className="bg-blue-600 h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${file.progress || 0}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    
                    {/* Error message */}
                    {file.error && (
                      <p className="mt-1 text-sm text-red-600">
                        {file.error}
                      </p>
                    )}
                  </div>
                  
                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    {file.status === 'success' && (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    )}
                    {(file.status === 'error' || file.error) && (
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                    )}
                    {file.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    )}
                  </div>
                  
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file.id);
                    }}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    aria-label="Remove file"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Add more files button */}
            {multiple && files.length < maxFiles && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                + Add more files
              </button>
            )}
          </div>
        )}
        
        {/* Custom children */}
        {children}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

// Format file size helper
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Image Upload Component
export interface ImageUploadProps extends Omit<FileUploadProps, 'accept'> {
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  cropEnabled?: boolean;
}

export const ImageUpload = forwardRef<HTMLDivElement, ImageUploadProps>(
  ({
    // aspectRatio,
    // cropEnabled = false,
    ...props
  }, ref) => {
    return (
      <FileUpload
        ref={ref}
        accept="image/*"
        {...props}
      />
    );
  }
);

ImageUpload.displayName = 'ImageUpload';

// Document Upload Component
export const DocumentUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  (props, ref) => {
    return (
      <FileUpload
        ref={ref}
        accept=".pdf,.doc,.docx,.txt,.rtf"
        {...props}
      />
    );
  }
);

DocumentUpload.displayName = 'DocumentUpload';

export default FileUpload;
