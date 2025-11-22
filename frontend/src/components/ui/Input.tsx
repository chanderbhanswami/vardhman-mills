'use client';

import React, { forwardRef, useState, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Input variants configuration
const inputVariants = cva(
  [
    'w-full px-3 py-2 border rounded-md text-sm transition-all duration-200',
    'placeholder:text-muted-foreground',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted'
  ],
  {
    variants: {
      variant: {
        default: 'border-border bg-background focus:ring-primary',
        filled: 'border-0 bg-muted focus:bg-background focus:ring-primary',
        outlined: 'border-2 border-border bg-transparent focus:border-primary focus:ring-primary/20',
        ghost: 'border-0 bg-transparent focus:bg-muted focus:ring-primary',
        underline: 'border-0 border-b-2 border-border bg-transparent rounded-none focus:border-primary focus:ring-0 focus:ring-offset-0'
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        default: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
        xl: 'px-6 py-4 text-lg'
      },
      status: {
        default: '',
        error: 'border-destructive focus:ring-destructive text-destructive',
        warning: 'border-yellow-500 focus:ring-yellow-500 text-yellow-700',
        success: 'border-green-500 focus:ring-green-500 text-green-700'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      status: 'default'
    }
  }
);

// Label variants
const labelVariants = cva(
  'block text-sm font-medium mb-1 transition-colors',
  {
    variants: {
      status: {
        default: 'text-foreground',
        error: 'text-destructive',
        warning: 'text-yellow-700',
        success: 'text-green-700'
      },
      required: {
        true: "after:content-['*'] after:text-destructive after:ml-1",
        false: ''
      }
    },
    defaultVariants: {
      status: 'default',
      required: false
    }
  }
);

// Base Input Props
export interface InputProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  description?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  clearable?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  loading?: boolean;
  wrapperClassName?: string;
}

// Password Input Props
export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showPasswordToggle?: boolean;
  strengthMeter?: boolean;
}

// Search Input Props  
export interface SearchInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  onSearch?: (query: string) => void;
  searchDelay?: number;
  showSearchIcon?: boolean;
}

// File Input Props
export interface FileInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFileChange?: (files: File[]) => void;
  previewFiles?: boolean;
}

// Text Area Props
export interface TextAreaProps 
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  variant?: InputProps['variant'];
  size?: InputProps['size'];
  status?: InputProps['status'];
  loading?: boolean;
  error?: string;
  helperText?: string;
  description?: string;
  label?: string;
  required?: boolean;
  clearable?: boolean;
  autoResize?: boolean;
  maxHeight?: number;
  wrapperClassName?: string;
}

// Base Input Component
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    status, 
    label, 
    description,
    error,
    helperText,
    required,
    clearable,
    leftIcon,
    rightIcon,
    onClear,
    loading,
    wrapperClassName,
    disabled,
    ...props 
  }, ref) => {
    const inputId = useId();
    const descriptionId = useId();
    const errorId = useId();
    
    const finalStatus = error ? 'error' : status;
    
    const handleClear = useCallback(() => {
      if (onClear) {
        onClear();
      }
    }, [onClear]);

    const StatusIcon = () => {
      switch (finalStatus) {
        case 'error':
          return <ExclamationTriangleIcon className="w-4 h-4 text-destructive" />;
        case 'warning':
          return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
        case 'success':
          return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
        default:
          return null;
      }
    };

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && (
          <label 
            htmlFor={inputId}
            className={labelVariants({ status: finalStatus, required })}
          >
            {label}
          </label>
        )}
        
        {description && (
          <p id={descriptionId} className="text-xs text-muted-foreground mb-2">
            {description}
          </p>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            className={cn(
              inputVariants({ variant, size, status: finalStatus }),
              leftIcon && 'pl-10',
              (rightIcon || clearable || loading || finalStatus !== 'default') && 'pr-10',
              className
            )}
            disabled={disabled || loading}
            aria-describedby={cn(
              description && descriptionId,
              error && errorId,
              helperText && `${inputId}-helper`
            )}
            {...(error && { 'aria-invalid': true })}
            {...(required && { 'aria-required': true })}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            )}
            
            <StatusIcon />
            
            {rightIcon && !loading && finalStatus === 'default' && (
              <div className="text-muted-foreground">
                {rightIcon}
              </div>
            )}
            
            {clearable && props.value && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear input"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.p
              id={errorId}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-destructive mt-1"
            >
              {error}
            </motion.p>
          )}
          
          {helperText && !error && (
            <p id={`${inputId}-helper`} className="text-xs text-muted-foreground mt-1">
              {helperText}
            </p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

// Password Input Component
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ 
    showPasswordToggle = true, 
    strengthMeter = false,
    onChange,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState(0);

    const calculateStrength = useCallback((password: string): number => {
      let score = 0;
      if (password.length >= 8) score += 25;
      if (/[A-Z]/.test(password)) score += 25;
      if (/[0-9]/.test(password)) score += 25;
      if (/[^A-Za-z0-9]/.test(password)) score += 25;
      return score;
    }, []);

    const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (strengthMeter) {
        setStrength(calculateStrength(value));
      }
      onChange?.(e);
    }, [strengthMeter, calculateStrength, onChange]);

    const getStrengthColor = useCallback((strength: number): string => {
      if (strength < 25) return 'bg-red-500';
      if (strength < 50) return 'bg-yellow-500';
      if (strength < 75) return 'bg-blue-500';
      return 'bg-green-500';
    }, []);

    const getStrengthText = useCallback((strength: number): string => {
      if (strength < 25) return 'Weak';
      if (strength < 50) return 'Fair';
      if (strength < 75) return 'Good';
      return 'Strong';
    }, []);

    return (
      <div className="w-full">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          rightIcon={showPasswordToggle ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          ) : undefined}
          onChange={handlePasswordChange}
          {...props}
        />
        
        {strengthMeter && props.value && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Password Strength:</span>
              <span className={cn(
                'text-xs font-medium',
                strength < 25 && 'text-red-500',
                strength >= 25 && strength < 50 && 'text-yellow-500',
                strength >= 50 && strength < 75 && 'text-blue-500',
                strength >= 75 && 'text-green-500'
              )}>
                {getStrengthText(strength)}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <motion.div
                className={cn('h-1.5 rounded-full transition-all', getStrengthColor(strength))}
                initial={{ width: 0 }}
                animate={{ width: `${strength}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

// Search Input Component
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    onSearch,
    searchDelay = 300,
    showSearchIcon = true,
    onChange,
    ...props 
  }, ref) => {
    const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout>();

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onChange?.(e);
      
      if (onSearch) {
        if (searchTimer) {
          clearTimeout(searchTimer);
        }
        
        const timer = setTimeout(() => {
          onSearch(value);
        }, searchDelay);
        
        setSearchTimer(timer);
      }
    }, [onSearch, searchDelay, searchTimer, onChange]);

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={showSearchIcon ? <MagnifyingGlassIcon className="w-4 h-4" /> : undefined}
        placeholder="Search..."
        onChange={handleSearchChange}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

// File Input Component
export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ 
    accept,
    multiple,
    maxSize,
    onFileChange,
    previewFiles = false,
    className,
    ...props 
  }, ref) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string>('');

    const validateFile = useCallback((file: File): boolean => {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        setError(`File "${file.name}" exceeds maximum size of ${maxSize}MB`);
        return false;
      }
      return true;
    }, [maxSize]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      setError('');
      
      const validFiles = files.filter(validateFile);
      
      if (validFiles.length !== files.length) {
        return;
      }
      
      setSelectedFiles(validFiles);
      onFileChange?.(validFiles);
    }, [validateFile, onFileChange]);

    const removeFile = useCallback((index: number) => {
      const updatedFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(updatedFiles);
      onFileChange?.(updatedFiles);
    }, [selectedFiles, onFileChange]);

    const formatFileSize = useCallback((bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    return (
      <div className="w-full">
        <Input
          ref={ref}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          error={error}
          className={cn('file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-muted file:text-muted-foreground hover:file:bg-muted/80', className)}
          leftIcon={<DocumentIcon className="w-4 h-4" />}
          {...props}
        />
        
        {previewFiles && selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 space-y-2"
          >
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 bg-muted rounded border">
                <div className="flex items-center space-x-2">
                  <DocumentIcon className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';

// TextArea Component
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    className, 
    variant, 
    size, 
    status,
    label,
    description,
    error,
    helperText,
    required,
    wrapperClassName,
    autoResize = false,
    maxHeight = 200,
    onChange,
    ...props 
  }, ref) => {
    const textareaId = useId();
    const descriptionId = useId();
    const errorId = useId();
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    React.useImperativeHandle(ref, () => textareaRef.current!);
    
    const finalStatus = error ? 'error' : status;

    const handleAutoResize = useCallback(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
        textareaRef.current.style.height = `${newHeight}px`;
        textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > maxHeight ? 'auto' : 'hidden';
      }
    }, [autoResize, maxHeight]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleAutoResize();
      onChange?.(e);
    }, [handleAutoResize, onChange]);

    React.useEffect(() => {
      handleAutoResize();
    }, [handleAutoResize]);

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && (
          <label 
            htmlFor={textareaId}
            className={labelVariants({ status: finalStatus, required })}
          >
            {label}
          </label>
        )}
        
        {description && (
          <p id={descriptionId} className="text-xs text-muted-foreground mb-2">
            {description}
          </p>
        )}
        
        <textarea
          id={textareaId}
          ref={textareaRef}
          className={cn(
            inputVariants({ variant, size, status: finalStatus }),
            'min-h-[80px] resize-vertical',
            autoResize && 'resize-none',
            className
          )}
          aria-describedby={cn(
            description && descriptionId,
            error && errorId,
            helperText && `${textareaId}-helper`
          )}
          {...(error && { 'aria-invalid': true })}
          {...(required && { 'aria-required': true })}
          onChange={handleChange}
          {...props}
        />
        
        <AnimatePresence>
          {error && (
            <motion.p
              id={errorId}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-destructive mt-1"
            >
              {error}
            </motion.p>
          )}
          
          {helperText && !error && (
            <p id={`${textareaId}-helper`} className="text-xs text-muted-foreground mt-1">
              {helperText}
            </p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default Input;
