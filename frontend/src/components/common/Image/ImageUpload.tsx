'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import OptimizedImage from './OptimizedImage';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export interface ImageUploadProps {
  className?: string;
  variant?: 'default' | 'compact' | 'gallery' | 'avatar';
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string;
  disabled?: boolean;
  showPreview?: boolean;
  showProgress?: boolean;
  allowRemove?: boolean;
  uploadText?: string;
  dragText?: string;
  errorText?: string;
  onFilesSelected?: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>;
  onRemove?: (fileId: string) => void;
  onError?: (error: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  className = '',
  variant = 'default',
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = 'image/*',
  disabled = false,
  showPreview = true,
  showProgress = true,
  allowRemove = true,
  uploadText = 'Upload Images',
  dragText = 'Drop images here or click to browse',
  errorText = 'Upload failed',
  onFilesSelected,
  onUpload,
  onRemove,
  onError,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      return 'Invalid file type';
    }
    
    return null;
  }, [maxSize, accept]);

  const handleFiles = useCallback(async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    
    // Check file limits
    if (!multiple && fileArray.length > 1) {
      onError?.('Only one file is allowed');
      return;
    }
    
    if (files.length + fileArray.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate and process files
    const validFiles: File[] = [];
    const newFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      
      if (validationError) {
        onError?.(validationError);
        continue;
      }

      validFiles.push(file);
      
      const preview = await createFilePreview(file);
      newFiles.push({
        id: generateFileId(),
        file,
        preview,
        status: 'uploading',
        progress: 0,
      });
    }

    if (validFiles.length === 0) return;

    // Update state with new files
    setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);
    onFilesSelected?.(validFiles);

    // Start upload if onUpload is provided
    if (onUpload) {
      setIsUploading(true);
      
      try {
        // Simulate upload progress
        newFiles.forEach((uploadFile) => {
          const interval = setInterval(() => {
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress: Math.min((f.progress || 0) + 10, 90) }
                : f
            ));
          }, 200);

          setTimeout(() => clearInterval(interval), 1800);
        });

        await onUpload(validFiles);
        
        // Mark as completed
        setFiles(prev => prev.map(f => {
          const fileIndex = newFiles.findIndex(nf => nf.id === f.id);
          if (fileIndex !== -1) {
            return { ...f, status: 'success' as const, progress: 100 };
          }
          return f;
        }));
      } catch (error) {
        // Mark as error
        setFiles(prev => prev.map(f => {
          const fileIndex = newFiles.findIndex(nf => nf.id === f.id);
          if (fileIndex !== -1) {
            return { 
              ...f, 
              status: 'error' as const, 
              error: error instanceof Error ? error.message : errorText 
            };
          }
          return f;
        }));
        onError?.(error instanceof Error ? error.message : errorText);
      } finally {
        setIsUploading(false);
      }
    }
  }, [files.length, multiple, maxFiles, onFilesSelected, onUpload, onError, errorText, validateFile]);

  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      handleFiles(selectedFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    onRemove?.(fileId);
  }, [onRemove]);

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return (
          <motion.div
            className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        );
    }
  };

  const variantClasses = {
    default: 'p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg',
    compact: 'p-4 border border-gray-300 dark:border-gray-600 rounded-lg',
    gallery: 'p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl',
    avatar: 'w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full p-4',
  };

  const renderUploadArea = () => (
    <motion.div
      className={`
        ${variantClasses[variant]}
        ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
        transition-all duration-200
        ${className}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={openFileDialog}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <div className="text-center">
        <motion.div
          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          className="mb-4"
        >
          <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto" />
        </motion.div>
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {uploadText}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {dragText}
        </p>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Supported formats: {accept}</p>
          <p>Maximum size: {Math.round(maxSize / 1024 / 1024)}MB</p>
          {multiple && <p>Maximum files: {maxFiles}</p>}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
        aria-label="File upload input"
      />
    </motion.div>
  );

  const renderFilePreview = (uploadedFile: UploadedFile) => (
    <motion.div
      key={uploadedFile.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
    >
      {/* Image preview */}
      <div className="aspect-square relative">
        {uploadedFile.file.type.startsWith('image/') ? (
          <OptimizedImage
            src={uploadedFile.preview}
            alt={uploadedFile.file.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700">
            <DocumentIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Status overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          {getStatusIcon(uploadedFile.status)}
        </div>
        
        {/* Remove button */}
        {allowRemove && (
          <button
            onClick={() => removeFile(uploadedFile.id)}
            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            aria-label="Remove file"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* File info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {uploadedFile.file.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {(uploadedFile.file.size / 1024).toFixed(1)} KB
        </p>
        
        {/* Progress bar */}
        {showProgress && uploadedFile.status === 'uploading' && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadedFile.progress || 0}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {uploadedFile.progress || 0}%
            </p>
          </div>
        )}
        
        {/* Error message */}
        {uploadedFile.status === 'error' && uploadedFile.error && (
          <p className="text-xs text-red-500 mt-2">
            {uploadedFile.error}
          </p>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Upload area */}
      {(files.length === 0 || multiple) && renderUploadArea()}
      
      {/* File previews */}
      {showPreview && files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {files.map(renderFilePreview)}
          </AnimatePresence>
        </div>
      )}
      
      {/* Upload status */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        >
          <motion.div
            className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-3"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span className="text-blue-700 dark:text-blue-300">
            Uploading {files.filter(f => f.status === 'uploading').length} files...
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default ImageUpload;