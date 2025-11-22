'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  CameraIcon,
  PhotoIcon,
  LinkIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNotification } from '@/hooks/notification/useNotification';
import { formatFileSize } from '@/lib/formatters';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProfileAvatarProps {
  /** User ID */
  userId?: string;
  
  /** Current avatar URL */
  currentAvatar?: string;
  
  /** Callback when avatar is updated */
  onAvatarUpdate?: (url: string) => void;
  
  /** Callback when avatar is removed */
  onAvatarRemove?: () => void;
  
  /** Show as modal */
  showAsModal?: boolean;
  
  /** Allow removal */
  allowRemoval?: boolean;
  
  /** Max file size in MB */
  maxFileSizeMB?: number;
  
  /** Allowed file types */
  allowedTypes?: string[];
  
  /** Show avatar presets */
  showPresets?: boolean;
  
  /** Enable cropping */
  enableCropping?: boolean;
  
  /** Enable camera capture */
  enableCamera?: boolean;
  
  /** Enable URL upload */
  enableURL?: boolean;
  
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Custom CSS class */
  className?: string;
}

interface AvatarPreset {
  id: string;
  url: string;
  label: string;
  category: 'animal' | 'abstract' | 'geometric' | 'emoji';
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'preset-1', url: '/avatars/animal-1.png', label: 'Fox', category: 'animal' },
  { id: 'preset-2', url: '/avatars/animal-2.png', label: 'Cat', category: 'animal' },
  { id: 'preset-3', url: '/avatars/animal-3.png', label: 'Dog', category: 'animal' },
  { id: 'preset-4', url: '/avatars/abstract-1.png', label: 'Abstract 1', category: 'abstract' },
  { id: 'preset-5', url: '/avatars/abstract-2.png', label: 'Abstract 2', category: 'abstract' },
  { id: 'preset-6', url: '/avatars/geometric-1.png', label: 'Geometric 1', category: 'geometric' },
  { id: 'preset-7', url: '/avatars/geometric-2.png', label: 'Geometric 2', category: 'geometric' },
  { id: 'preset-8', url: '/avatars/emoji-1.png', label: '😊', category: 'emoji' },
  { id: 'preset-9', url: '/avatars/emoji-2.png', label: '🎨', category: 'emoji' },
  { id: 'preset-10', url: '/avatars/emoji-3.png', label: '🚀', category: 'emoji' },
];

const SIZE_MAP = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
};

const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// ============================================================================
// COMPONENT
// ============================================================================

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  userId: userIdProp,
  currentAvatar: currentAvatarProp,
  onAvatarUpdate,
  onAvatarRemove,
  showAsModal = false,
  allowRemoval = true,
  maxFileSizeMB = 5,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  showPresets = true,
  enableCropping = true,
  enableCamera = true,
  enableURL = true,
  size = 'lg',
  className,
}) => {
  const { user, updateProfile } = useAuth();
  const notification = useNotification();
  const activeUserId = userIdProp || user?.id;
  const currentUserAvatar = currentAvatarProp || user?.avatar;

  // ============================================================================
  // REFS
  // ============================================================================

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================================================
  // STATE
  // ============================================================================

  const [uploadMethod, setUploadMethod] = useState<'file' | 'camera' | 'url' | 'preset' | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetCategory, setPresetCategory] = useState<'all' | 'animal' | 'abstract' | 'geometric' | 'emoji'>('all');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [showCropper, setShowCropper] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredPresets = useMemo(() => {
    if (presetCategory === 'all') return AVATAR_PRESETS;
    return AVATAR_PRESETS.filter(preset => preset.category === presetCategory);
  }, [presetCategory]);

  const maxFileSizeBytes = useMemo(() => maxFileSizeMB * 1024 * 1024, [maxFileSizeMB]);

  const canSave = useMemo(() => {
    return (
      (uploadMethod === 'file' && selectedFile !== null) ||
      (uploadMethod === 'camera' && selectedFile !== null) ||
      (uploadMethod === 'url' && urlInput.trim() !== '') ||
      (uploadMethod === 'preset' && selectedPreset !== null)
    );
  }, [uploadMethod, selectedFile, urlInput, selectedPreset]);

  // ============================================================================
  // FILE VALIDATION
  // ============================================================================

  const validateFile = useCallback((file: File): boolean => {
    setErrors({});

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      setErrors({ file: `File type not allowed. Accepted types: ${allowedTypes.join(', ')}` });
      notification.error('Please upload a valid image file', {
        duration: 3000,
      });
      return false;
    }

    // Check file size
    if (file.size > maxFileSizeBytes) {
      setErrors({ file: `File size exceeds ${maxFileSizeMB}MB limit` });
      notification.error(`Maximum file size is ${maxFileSizeMB}MB`, {
        duration: 3000,
      });
      return false;
    }

    return true;
  }, [allowedTypes, maxFileSizeBytes, maxFileSizeMB, notification]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setSelectedFile(file);
    setUploadMethod('file');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setPreviewUrl(url);
      if (enableCropping) {
        setShowCropper(true);
      }
    };
    reader.readAsDataURL(file);
  }, [validateFile, enableCropping]);

  const handleCameraCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setSelectedFile(file);
    setUploadMethod('camera');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setPreviewUrl(url);
      if (enableCropping) {
        setShowCropper(true);
      }
    };
    reader.readAsDataURL(file);
  }, [validateFile, enableCropping]);

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) {
      setErrors({ url: 'Please enter a valid URL' });
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      setErrors({ url: 'Invalid URL format' });
      notification.error('Please enter a valid image URL', {
        duration: 3000,
      });
      return;
    }

    setUploadMethod('url');
    setPreviewUrl(urlInput);
    setErrors({});
    
    if (enableCropping) {
      setShowCropper(true);
    }
  }, [urlInput, enableCropping, notification]);

  const handlePresetSelect = useCallback((preset: AvatarPreset) => {
    setSelectedPreset(preset.id);
    setPreviewUrl(preset.url);
    setUploadMethod('preset');
    setErrors({});
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setSelectedFile(file);
    setUploadMethod('file');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setPreviewUrl(url);
      if (enableCropping) {
        setShowCropper(true);
      }
    };
    reader.readAsDataURL(file);
  }, [validateFile, enableCropping]);

  const handleReset = useCallback(() => {
    setUploadMethod(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUrlInput('');
    setSelectedPreset(null);
    setShowCropper(false);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
    setZoom(1);
    setRotation(0);
    setErrors({});
    
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, []);

  const handleSave = useCallback(async () => {
    if (!canSave) return;

    setIsUploading(true);
    setErrors({});

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (!prev) return { loaded: 10, total: 100, percentage: 10 };
          if (prev.percentage >= 90) return prev;
          return {
            loaded: prev.loaded + 10,
            total: 100,
            percentage: prev.percentage + 10,
          };
        });
      }, 200);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(progressInterval);
      
      setUploadProgress({ loaded: 100, total: 100, percentage: 100 });

      const finalUrl = previewUrl || '';

      // In a real app, upload to server and get URL
      console.log('Uploading avatar:', {
        userId: activeUserId,
        method: uploadMethod,
        file: selectedFile?.name,
        url: urlInput,
        preset: selectedPreset,
        showAsModal,
      });

      if (updateProfile) {
        await updateProfile({ avatar: finalUrl as unknown as File });
      }

      notification.success('Your profile picture has been updated', {
        duration: 3000,
      });

      setShowSuccessMessage(true);
      onAvatarUpdate?.(finalUrl);

      setTimeout(() => {
        setShowSuccessMessage(false);
        handleReset();
      }, 2000);

    } catch (error) {
      console.error('Avatar upload error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to upload avatar',
      });
      
      notification.error('Failed to update your profile picture', {
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [canSave, previewUrl, activeUserId, uploadMethod, selectedFile, urlInput, selectedPreset, showAsModal, updateProfile, notification, onAvatarUpdate, handleReset]);

  const handleRemove = useCallback(async () => {
    if (!allowRemoval) return;

    setIsUploading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Removing avatar for user:', activeUserId);

      if (updateProfile) {
        await updateProfile({ avatar: null as unknown as File });
      }

      notification.success('Your profile picture has been removed', {
        duration: 3000,
      });

      onAvatarRemove?.();
      handleReset();

    } catch (error) {
      console.error('Avatar removal error:', error);
      notification.error('Failed to remove your profile picture', {
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  }, [allowRemoval, activeUserId, updateProfile, notification, onAvatarRemove, handleReset]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleRotateLeft = useCallback(() => {
    setRotation(prev => prev - 90);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation(prev => prev + 90);
  }, []);

  const handleApplyCrop = useCallback(() => {
    // In a real app, apply crop using canvas
    if (canvasRef.current && previewUrl) {
      // Canvas manipulation code would go here
      console.log('Applying crop:', cropArea, 'zoom:', zoom, 'rotation:', rotation);
    }
    setShowCropper(false);
  }, [cropArea, zoom, rotation, previewUrl]);

  // ============================================================================
  // RENDER - SUCCESS SCREEN
  // ============================================================================

  if (showSuccessMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('flex items-center justify-center p-8', className)}
      >
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Avatar Updated!
            </h2>
            <p className="text-gray-600">
              Your profile picture has been updated successfully
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ============================================================================
  // RENDER - CROPPER
  // ============================================================================

  if (showCropper && previewUrl) {
    return (
      <Card className={cn('max-w-4xl mx-auto', className)}>
        <CardHeader>
          <h3 className="text-xl font-bold text-gray-900">Adjust Your Photo</h3>
          <p className="text-sm text-gray-600">Crop, zoom, and rotate to get the perfect shot</p>
        </CardHeader>

        <CardContent>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden h-[400px]">
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-in-out"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
            
            {/* Crop overlay */}
            <div className="absolute inset-0 border-4 border-dashed border-white pointer-events-none" />
          </div>

          {/* Crop controls */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom: {zoom.toFixed(1)}x
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                >
                  <MagnifyingGlassMinusIcon className="w-4 h-4" />
                </Button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1"
                  title="Adjust zoom level"
                  aria-label="Zoom level slider"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                >
                  <MagnifyingGlassPlusIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleRotateLeft}
              >
                <ArrowsPointingInIcon className="w-4 h-4 mr-2 -rotate-45" />
                Rotate Left
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleRotateRight}
              >
                <ArrowsPointingOutIcon className="w-4 h-4 mr-2 rotate-45" />
                Rotate Right
              </Button>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCropper(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApplyCrop}
            className="flex-1"
          >
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            Apply
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // ============================================================================
  // RENDER - MAIN INTERFACE
  // ============================================================================

  return (
    <div className={cn('w-full', className)}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className={cn('relative', SIZE_MAP[size])}>
              {currentUserAvatar ? (
                <div className="relative w-full h-full">
                  <Image
                    src={currentUserAvatar}
                    alt="Current avatar"
                    fill
                    className="rounded-full object-cover border-4 border-gray-200"
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                  <UserCircleIcon className="w-3/4 h-3/4 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">Profile Picture</h2>
                {uploadMethod && (
                  <Badge variant="info" className="capitalize">{uploadMethod}</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Upload a photo or choose from our presets
              </p>
              {selectedFile && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(selectedFile.size)}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-6 w-6 p-0"
                    title="Clear selection"
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upload Methods */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              type="button"
              variant={uploadMethod === 'file' ? 'default' : 'outline'}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-auto py-4 flex-col"
            >
              <PhotoIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Upload Photo</span>
            </Button>

            {enableCamera ? (
              <Button
                type="button"
                variant={uploadMethod === 'camera' ? 'default' : 'outline'}
                onClick={() => cameraInputRef.current?.click()}
                disabled={isUploading}
                className="h-auto py-4 flex-col"
              >
                <CameraIcon className="w-6 h-6 mb-2" />
                <span className="text-sm">Take Photo</span>
              </Button>
            ) : null}

            {enableURL ? (
              <Button
                type="button"
                variant={uploadMethod === 'url' ? 'default' : 'outline'}
                onClick={() => {
                  setUploadMethod('url');
                  setTimeout(() => urlInputRef.current?.focus(), 100);
                }}
                disabled={isUploading}
                className="h-auto py-4 flex-col"
              >
                <LinkIcon className="w-6 h-6 mb-2" />
                <span className="text-sm">From URL</span>
              </Button>
            ) : null}

            {showPresets ? (
              <Button
                type="button"
                variant={uploadMethod === 'preset' ? 'default' : 'outline'}
                onClick={() => setUploadMethod('preset')}
                disabled={isUploading}
                className="h-auto py-4 flex-col"
              >
                <UserCircleIcon className="w-6 h-6 mb-2" />
                <span className="text-sm">Choose Preset</span>
              </Button>
            ) : null}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload profile picture file"
            title="Upload profile picture file"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleCameraCapture}
            className="hidden"
            aria-label="Capture profile picture from camera"
            title="Capture profile picture from camera"
          />

          {/* Drag and Drop Area */}
          {uploadMethod === 'file' || !uploadMethod ? (
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-700 font-medium mb-1">
                Drag and drop your photo here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click the Upload Photo button above
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: {allowedTypes.join(', ')} • Max size: {maxFileSizeMB}MB
              </p>
            </div>
          ) : null}

          {/* URL Input */}
          {uploadMethod === 'url' ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <div className="flex gap-2">
                <Input
                  ref={urlInputRef}
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  placeholder="https://example.com/image.jpg"
                  disabled={isUploading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim() || isUploading}
                >
                  Load
                </Button>
              </div>
              {errors.url ? (
                <p className="text-sm text-red-600">{errors.url}</p>
              ) : null}
            </div>
          ) : null}

          {/* Avatar Presets */}
          {uploadMethod === 'preset' && showPresets ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {(['all', 'animal', 'abstract', 'geometric', 'emoji'] as const).map((category) => (
                  <Button
                    key={category}
                    type="button"
                    size="sm"
                    variant={presetCategory === category ? 'default' : 'outline'}
                    onClick={() => setPresetCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    title={`Select ${preset.label} avatar`}
                    aria-label={`Select ${preset.label} avatar`}
                    className={cn(
                      'aspect-square rounded-full overflow-hidden border-4 transition-all hover:scale-110',
                      selectedPreset === preset.id
                        ? 'border-primary-500 ring-4 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    disabled={isUploading}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={preset.url}
                        alt={preset.label}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Preview */}
          {previewUrl && !showCropper ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Preview
                  </label>
                  {enableCropping ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCropper(true)}
                      disabled={isUploading}
                    >
                      <ArrowsPointingOutIcon className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : null}
                </div>
                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8">
                  <div className="relative w-32 h-32">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                </div>
                {selectedFile ? (
                  <div className="text-sm text-gray-600 text-center">
                    <p>{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          ) : null}

          {/* Upload Progress */}
          {isUploading && uploadProgress ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Uploading...</span>
                <span className="text-gray-600">{uploadProgress.percentage}%</span>
              </div>
              <Progress value={uploadProgress.percentage} />
            </div>
          ) : null}

          {/* Errors */}
          {errors.file || errors.submit ? (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <div className="ml-2">
                <p className="font-medium">Error</p>
                <p className="text-sm">{errors.file || errors.submit}</p>
              </div>
            </Alert>
          ) : null}

          {/* File Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-sm text-blue-900">
                <p className="font-medium mb-1">Upload Guidelines</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Use a square image for best results</li>
                  <li>Recommended size: at least 400x400 pixels</li>
                  <li>Maximum file size: {maxFileSizeMB}MB</li>
                  <li>Supported formats: JPG, PNG, WEBP, GIF</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3 bg-gray-50">
          {allowRemoval && currentUserAvatar ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={isUploading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Remove
            </Button>
          ) : null}
          
          <div className="flex-1" />
          
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isUploading || !uploadMethod}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave || isUploading}
          >
            {isUploading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Save Avatar
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileAvatar;
