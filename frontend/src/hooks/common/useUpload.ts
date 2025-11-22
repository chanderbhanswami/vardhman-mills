import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

export interface UploadFile extends File {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
  preview?: string;
}

export interface UploadOptions {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  autoUpload?: boolean;
  onUploadStart?: (file: UploadFile) => void;
  onUploadProgress?: (file: UploadFile, progress: number) => void;
  onUploadSuccess?: (file: UploadFile, response: unknown) => void;
  onUploadError?: (file: UploadFile, error: Error) => void;
  onFileAdd?: (file: UploadFile) => void;
  onFileRemove?: (file: UploadFile) => void;
  validateFile?: (file: File) => string | null; // Return error message if invalid
}

export interface UploadReturn {
  files: UploadFile[];
  isDragOver: boolean;
  isUploading: boolean;
  progress: number; // Overall progress
  addFiles: (fileList: FileList | File[]) => void;
  removeFile: (id: string) => void;
  uploadFile: (id: string, uploadFn: (file: File, onProgress: (progress: number) => void) => Promise<unknown>) => Promise<void>;
  uploadAll: (uploadFn: (file: File, onProgress: (progress: number) => void) => Promise<unknown>) => Promise<void>;
  clearFiles: () => void;
  retryUpload: (id: string, uploadFn: (file: File, onProgress: (progress: number) => void) => Promise<unknown>) => Promise<void>;
  getFileById: (id: string) => UploadFile | undefined;
  getRejectedFiles: () => UploadFile[];
  getSuccessfulFiles: () => UploadFile[];
  dragHandlers: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  inputProps: {
    type: 'file';
    multiple: boolean;
    accept: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
}

const generateId = (): string => Math.random().toString(36).substr(2, 9);

const createUploadFile = (file: File): UploadFile => ({
  ...file,
  id: generateId(),
  progress: 0,
  status: 'pending',
});

const createPreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

const validateFileSize = (file: File, maxSize: number): string | null => {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return `File size must be less than ${maxSizeMB}MB`;
  }
  return null;
};

const validateFileType = (file: File, accept: string): string | null => {
  if (!accept) return null;
  
  const acceptedTypes = accept.split(',').map(type => type.trim());
  const fileType = file.type;
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  
  const isAccepted = acceptedTypes.some(acceptedType => {
    if (acceptedType.startsWith('.')) {
      return fileExtension === acceptedType.toLowerCase();
    }
    if (acceptedType.includes('/*')) {
      const [category] = acceptedType.split('/');
      return fileType.startsWith(`${category}/`);
    }
    return fileType === acceptedType;
  });
  
  return isAccepted ? null : `File type ${fileType} is not accepted`;
};

export const useUpload = (options: UploadOptions = {}): UploadReturn => {
  const {
    accept = '',
    multiple = false,
    maxSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 10,
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onFileAdd,
    onFileRemove,
    validateFile,
  } = options;

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const isUploading = files.some(file => file.status === 'uploading');
  const progress = files.length > 0 
    ? files.reduce((sum, file) => sum + file.progress, 0) / files.length 
    : 0;

  const validateAndProcessFile = useCallback(async (file: File): Promise<UploadFile | null> => {
    // File size validation
    const sizeError = validateFileSize(file, maxSize);
    if (sizeError) {
      toast.error(sizeError);
      return null;
    }

    // File type validation
    const typeError = validateFileType(file, accept);
    if (typeError) {
      toast.error(typeError);
      return null;
    }

    // Custom validation
    if (validateFile) {
      const customError = validateFile(file);
      if (customError) {
        toast.error(customError);
        return null;
      }
    }

    const uploadFile = createUploadFile(file);

    // Create preview for images
    try {
      if (file.type.startsWith('image/')) {
        uploadFile.preview = await createPreview(file);
      }
    } catch {
      // Preview creation failed, but file is still valid
    }

    return uploadFile;
  }, [maxSize, accept, validateFile]);

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles: File[] = Array.from(fileList);

    // Check file limit
    if (!multiple && files.length > 0) {
      toast.error('Only one file is allowed');
      return;
    }

    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: UploadFile[] = [];

    for (const file of newFiles) {
      const uploadFile = await validateAndProcessFile(file);
      if (uploadFile) {
        validFiles.push(uploadFile);
        onFileAdd?.(uploadFile);
      }
    }

    setFiles(prev => {
      if (!multiple) {
        return validFiles;
      }
      return [...prev, ...validFiles];
    });

    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} file(s) added`);
    }
  }, [files.length, multiple, maxFiles, validateAndProcessFile, onFileAdd]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        onFileRemove?.(file);
        // Revoke object URL to prevent memory leaks
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      }
      return prev.filter(f => f.id !== id);
    });
  }, [onFileRemove]);

  const uploadFile = useCallback(async (
    id: string,
    uploadFn: (file: File, onProgress: (progress: number) => void) => Promise<unknown>
  ) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === id 
          ? { ...file, status: 'uploading' as const, progress: 0 }
          : file
      )
    );

    const file = files.find(f => f.id === id);
    if (!file) return;

    onUploadStart?.(file);

    try {
      const onProgress = (progress: number) => {
        setFiles(prev =>
          prev.map(f =>
            f.id === id ? { ...f, progress: Math.min(100, Math.max(0, progress)) } : f
          )
        );
        onUploadProgress?.(file, progress);
      };

      const response = await uploadFn(file, onProgress);

      setFiles(prev =>
        prev.map(f =>
          f.id === id
            ? {
                ...f,
                status: 'success' as const,
                progress: 100,
                url: typeof response === 'object' && response && 'url' in response 
                  ? (response as { url: string }).url 
                  : undefined,
              }
            : f
        )
      );

      const updatedFile = { ...file, status: 'success' as const, progress: 100 };
      onUploadSuccess?.(updatedFile, response);
      toast.success(`${file.name} uploaded successfully`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setFiles(prev =>
        prev.map(f =>
          f.id === id
            ? {
                ...f,
                status: 'error' as const,
                error: errorMessage,
              }
            : f
        )
      );

      const errorFile = { ...file, status: 'error' as const, error: errorMessage };
      onUploadError?.(errorFile, error instanceof Error ? error : new Error(errorMessage));
      toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
    }
  }, [files, onUploadStart, onUploadProgress, onUploadSuccess, onUploadError]);

  const uploadAll = useCallback(async (
    uploadFn: (file: File, onProgress: (progress: number) => void) => Promise<unknown>
  ) => {
    const pendingFiles = files.filter(file => file.status === 'pending' || file.status === 'error');
    
    for (const file of pendingFiles) {
      await uploadFile(file.id, uploadFn);
    }
  }, [files, uploadFile]);

  const clearFiles = useCallback(() => {
    // Revoke all preview URLs
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    setFiles([]);
  }, [files]);

  const retryUpload = useCallback(async (
    id: string,
    uploadFn: (file: File, onProgress: (progress: number) => void) => Promise<unknown>
  ) => {
    setFiles(prev =>
      prev.map(file =>
        file.id === id
          ? { ...file, status: 'pending' as const, error: undefined, progress: 0 }
          : file
      )
    );
    
    await uploadFile(id, uploadFn);
  }, [uploadFile]);

  const getFileById = useCallback((id: string) => {
    return files.find(file => file.id === id);
  }, [files]);

  const getRejectedFiles = useCallback(() => {
    return files.filter(file => file.status === 'error');
  }, [files]);

  const getSuccessfulFiles = useCallback(() => {
    return files.filter(file => file.status === 'success');
  }, [files]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
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
    
    dragCounterRef.current = 0;
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  // Input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [addFiles]);

  return {
    files,
    isDragOver,
    isUploading,
    progress,
    addFiles,
    removeFile,
    uploadFile,
    uploadAll,
    clearFiles,
    retryUpload,
    getFileById,
    getRejectedFiles,
    getSuccessfulFiles,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
    inputProps: {
      type: 'file' as const,
      multiple,
      accept,
      onChange: handleInputChange,
    },
  };
};

// Specialized upload hooks
export const useImageUpload = (options: Omit<UploadOptions, 'accept'> = {}) => {
  return useUpload({
    ...options,
    accept: 'image/*',
  });
};

export const useDocumentUpload = (options: Omit<UploadOptions, 'accept'> = {}) => {
  return useUpload({
    ...options,
    accept: '.pdf,.doc,.docx,.txt,.rtf',
  });
};

export const useVideoUpload = (options: Omit<UploadOptions, 'accept'> = {}) => {
  return useUpload({
    ...options,
    accept: 'video/*',
    maxSize: options.maxSize || 100 * 1024 * 1024, // 100MB for videos
  });
};

export default useUpload;
