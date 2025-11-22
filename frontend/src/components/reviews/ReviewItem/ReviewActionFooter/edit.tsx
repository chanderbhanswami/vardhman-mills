'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Save, 
  X, 
  Loader2,
  Clock,
  Image as ImageIcon,
  FileText,
  Eye,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TextArea } from '@/components/ui/TextArea';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Rating } from '@/components/ui/Rating';
import { Progress } from '@/components/ui/Progress';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '@/lib/utils';

// Types
export interface ReviewData {
  id: string;
  rating: number;
  title: string;
  content: string;
  tags: string[];
  images: ReviewImage[];
  isAnonymous: boolean;
  isPublic: boolean;
  metadata?: {
    lastEdited?: string;
    editCount?: number;
    originalContent?: string;
    moderationNotes?: string[];
  };
}

export interface ReviewImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  size: number;
  type: string;
  order: number;
}

export interface EditReviewProps {
  review: ReviewData;
  userId: string;
  isOwner: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showIcon?: boolean;
  showText?: boolean;
  disabled?: boolean;
  onEditStart?: (reviewId: string) => void;
  onEditSuccess?: (reviewId: string, updatedReview: ReviewData) => void;
  onEditError?: (reviewId: string, error: Error) => void;
  onCancel?: () => void;
  maxLength?: number;
  maxImages?: number;
  allowTags?: boolean;
  allowAnonymous?: boolean;
  allowVisibilityChange?: boolean;
  editEndpoint?: string;
  uploadEndpoint?: string;
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    requiredFields?: string[];
    allowedImageTypes?: string[];
    maxImageSize?: number;
  };
  autoSave?: boolean;
  autoSaveInterval?: number;
  showPreview?: boolean;
  trackChanges?: boolean;
}

export interface EditFormData {
  rating: number;
  title: string;
  content: string;
  tags: string[];
  images: ReviewImage[];
  isAnonymous: boolean;
  isPublic: boolean;
  hasChanges: boolean;
}

const EditReview: React.FC<EditReviewProps> = ({
  review,
  userId,
  isOwner,
  isAdmin = false,
  isModerator = false,
  className,
  size = 'md',
  variant = 'ghost',
  showIcon = true,
  showText = false,
  disabled = false,
  onEditStart,
  onEditSuccess,
  onEditError,
  onCancel,
  maxLength = 5000,
  maxImages = 10,
  allowTags = true,
  allowAnonymous = true,
  allowVisibilityChange = true,
  editEndpoint = '/api/reviews',
  uploadEndpoint = '/api/upload',
  validationRules = {
    minLength: 10,
    maxLength: 5000,
    requiredFields: ['content'],
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 5 * 1024 * 1024 // 5MB
  },
  autoSave = true,
  autoSaveInterval = 30000, // 30 seconds
  showPreview = true,
  trackChanges = true
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'history'>('edit');
  const [formData, setFormData] = useState<EditFormData>({
    rating: review.rating,
    title: review.title,
    content: review.content,
    tags: [...review.tags],
    images: [...review.images],
    isAnonymous: review.isAnonymous,
    isPublic: review.isPublic,
    hasChanges: false
  });
  const [originalData, setOriginalData] = useState<EditFormData>({
    rating: review.rating,
    title: review.title,
    content: review.content,
    tags: [...review.tags],
    images: [...review.images],
    isAnonymous: review.isAnonymous,
    isPublic: review.isPublic,
    hasChanges: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [saveProgress, setSaveProgress] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [changeHistory, setChangeHistory] = useState<Array<{
    timestamp: Date;
    field: string;
    oldValue: string | number | boolean | string[];
    newValue: string | number | boolean | string[];
  }>>([]);

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Permission checking
  const canEdit = React.useMemo(() => {
    return isOwner || isAdmin || isModerator;
  }, [isOwner, isAdmin, isModerator]);

  const hasUnsavedChanges = React.useMemo(() => {
    return formData.hasChanges;
  }, [formData.hasChanges]);

  // Change tracking
  const trackChange = useCallback((field: string, oldValue: string | number | boolean | string[] | ReviewImage[], newValue: string | number | boolean | string[] | ReviewImage[]) => {
    if (!trackChanges) return;
    
    setChangeHistory(prev => [...prev, {
      timestamp: new Date(),
      field,
      oldValue: typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue),
      newValue: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)
    }]);
  }, [trackChanges]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    validationRules.requiredFields?.forEach(field => {
      if (field === 'content' && !formData.content.trim()) {
        newErrors.content = 'Review content is required';
      }
      if (field === 'title' && !formData.title.trim()) {
        newErrors.title = 'Review title is required';
      }
      if (field === 'rating' && formData.rating === 0) {
        newErrors.rating = 'Rating is required';
      }
    });

    // Length validation
    if (validationRules.minLength && formData.content.length < validationRules.minLength) {
      newErrors.content = `Content must be at least ${validationRules.minLength} characters`;
    }
    if (validationRules.maxLength && formData.content.length > validationRules.maxLength) {
      newErrors.content = `Content must not exceed ${validationRules.maxLength} characters`;
    }

    // Images validation
    if (formData.images.length > maxImages) {
      newErrors.images = `Maximum ${maxImages} images allowed`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-save functionality
  const autoSaveReview = useCallback(async () => {
    if (!hasUnsavedChanges || !autoSave) return;

    try {
      const response = await fetch(`${editEndpoint}/${review.id}/autosave`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          userId,
          isAutoSave: true
        })
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [hasUnsavedChanges, autoSave, editEndpoint, review.id, formData, userId]);

  // Set up auto-save timer
  React.useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      autoSaveTimer.current = setTimeout(autoSaveReview, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [autoSave, hasUnsavedChanges, autoSaveReview, autoSaveInterval]);

  // Handle form changes
  const handleFormChange = (field: keyof EditFormData, value: string | number | boolean | string[] | ReviewImage[]) => {
    const oldValue = formData[field];
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
      hasChanges: true
    }));

    trackChange(field, oldValue, value);

    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Image upload handling
  const handleImageUpload = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!validationRules.allowedImageTypes?.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: `${file.name} is not a supported image format`,
          variant: 'error'
        });
        return false;
      }
      if (validationRules.maxImageSize && file.size > validationRules.maxImageSize) {
        toast({
          title: 'File Too Large',
          description: `${file.name} exceeds the maximum file size`,
          variant: 'error'
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const uploadPromises = validFiles.map(async (file) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      setUploadingImages(prev => [...prev, tempId]);

      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('type', 'review-image');

        const response = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: uploadFormData
        });

        if (!response.ok) throw new Error('Upload failed');

        const result = await response.json();
        
        const newImage: ReviewImage = {
          id: result.id || tempId,
          url: result.url,
          alt: file.name,
          caption: '',
          size: file.size,
          type: file.type,
          order: formData.images.length
        };

        handleFormChange('images', [...formData.images, newImage]);
        
        return newImage;
      } catch (error) {
        console.error('Image upload failed:', error);
        toast({
          title: 'Upload Failed',
          description: `Failed to upload ${file.name}`,
          variant: 'error'
        });
        return null;
      } finally {
        setUploadingImages(prev => prev.filter(id => id !== tempId));
      }
    });

    await Promise.all(uploadPromises);
  };

  // Remove image
  const removeImage = (imageId: string) => {
    const updatedImages = formData.images.filter(img => img.id !== imageId);
    handleFormChange('images', updatedImages);
  };

  // Handle tag management
  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      handleFormChange('tags', [...formData.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleFormChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // Save review
  const saveReview = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveProgress(0);
    onEditStart?.(review.id);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSaveProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch(`${editEndpoint}/${review.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          userId,
          editedAt: new Date().toISOString(),
          hasChanges: false
        })
      });

      clearInterval(progressInterval);
      setSaveProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save review');
      }

      const updatedReview = await response.json();

      // Update form state
      setFormData(prev => ({ ...prev, hasChanges: false }));
      setOriginalData({ ...formData, hasChanges: false });
      setLastSaved(new Date());

      toast({
        title: 'Review Updated',
        description: 'Your review has been successfully updated.',
        variant: 'success'
      });

      onEditSuccess?.(review.id, updatedReview);
      setShowEditModal(false);

    } catch (error) {
      console.error('Save failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to save review';
      
      toast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'error'
      });

      onEditError?.(review.id, error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsSaving(false);
      setSaveProgress(0);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ ...originalData });
    setErrors({});
    setChangeHistory([]);
  };

  // Handle edit click
  const handleEditClick = () => {
    if (disabled || !canEdit) return;
    setShowEditModal(true);
    setIsEditing(true);
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        resetForm();
        setShowEditModal(false);
        setIsEditing(false);
        onCancel?.();
      }
    } else {
      setShowEditModal(false);
      setIsEditing(false);
      onCancel?.();
    }
  };

  // Render preview
  const renderPreview = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Rating value={formData.rating} readOnly size="sm" />
          <span className="text-sm text-gray-600">({formData.rating}/5)</span>
        </div>
        
        {formData.title && (
          <h3 className="text-lg font-semibold">{formData.title}</h3>
        )}
        
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{formData.content}</p>
        </div>

        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {formData.images.map((image) => (
              <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.alt}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary">#{tag}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600">
          {formData.isAnonymous && (
            <Badge variant="outline">Anonymous</Badge>
          )}
          {!formData.isPublic && (
            <Badge variant="outline">Private</Badge>
          )}
        </div>
      </div>
    );
  };

  // Don't render if no permission
  if (!canEdit) {
    return null;
  }

  const buttonText = showText ? (isOwner ? 'Edit' : 'Moderate') : null;
  const tooltipText = isOwner ? 'Edit your review' : 
                     isAdmin ? 'Edit review (Admin)' : 
                     isModerator ? 'Edit review (Moderator)' : 'Edit review';

  return (
    <>
      <Tooltip content={tooltipText}>
        <Button
          variant={variant}
          size={size}
          onClick={handleEditClick}
          disabled={disabled || isEditing}
          className={cn(
            "relative transition-all duration-200",
            "hover:scale-105 active:scale-95",
            "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            className
          )}
          aria-label={tooltipText}
        >
          {showIcon && (
            <motion.div
              animate={{ rotate: isEditing ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isEditing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
            </motion.div>
          )}
          {buttonText && (
            <span className={cn(showIcon && "ml-2")}>
              {buttonText}
            </span>
          )}
        </Button>
      </Tooltip>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <Modal
            open={showEditModal}
            onClose={handleCancel}
            className="max-w-4xl max-h-[90vh]"
            closeOnOverlayClick={!hasUnsavedChanges}
            closeOnEscape={!hasUnsavedChanges}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-semibold">Edit Review</h2>
                  {lastSaved && (
                    <p className="text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasUnsavedChanges && (
                    <Badge variant="warning">Unsaved Changes</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={cn(
                      "py-4 px-1 border-b-2 font-medium text-sm",
                      activeTab === 'edit'
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Edit
                  </button>
                  {showPreview && (
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={cn(
                        "py-4 px-1 border-b-2 font-medium text-sm",
                        activeTab === 'preview'
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      )}
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      Preview
                    </button>
                  )}
                  {trackChanges && changeHistory.length > 0 && (
                    <button
                      onClick={() => setActiveTab('history')}
                      className={cn(
                        "py-4 px-1 border-b-2 font-medium text-sm",
                        activeTab === 'history'
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      )}
                    >
                      <Clock className="w-4 h-4 inline mr-2" />
                      History ({changeHistory.length})
                    </button>
                  )}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'edit' && (
                  <div className="space-y-6">
                    {/* Rating */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating *</label>
                      <Rating
                        value={formData.rating}
                        onChange={(value) => handleFormChange('rating', value)}
                        size="lg"
                      />
                      {errors.rating && (
                        <p className="text-sm text-red-600">{errors.rating}</p>
                      )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title (Optional)</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        placeholder="Give your review a title..."
                        maxLength={100}
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Review Content *</label>
                      <TextArea
                        ref={textareaRef}
                        value={formData.content}
                        onChange={(e) => handleFormChange('content', e.target.value)}
                        placeholder="Share your experience..."
                        maxLength={maxLength}
                        rows={8}
                        className={cn(
                          "resize-none",
                          errors.content && 'border-red-500'
                        )}
                      />
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>{formData.content.length}/{maxLength} characters</span>
                        {errors.content && (
                          <span className="text-red-600">{errors.content}</span>
                        )}
                      </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Images</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={formData.images.length >= maxImages}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Add Images
                        </Button>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                        className="hidden"
                        title="Upload review images"
                        aria-label="Upload review images"
                      />

                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {formData.images.map((image) => (
                            <div key={image.id} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border">
                                <Image
                                  src={image.url}
                                  alt={image.alt}
                                  width={200}
                                  height={200}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeImage(image.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {uploadingImages.length > 0 && (
                        <div className="text-sm text-gray-600">
                          Uploading {uploadingImages.length} image(s)...
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {allowTags && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="group">
                              #{tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                title={`Remove tag ${tag}`}
                                aria-label={`Remove tag ${tag}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder="Add tags (press Enter)"
                          title="Add tags to your review"
                          aria-label="Add tags to your review"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Privacy Settings */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Privacy Settings</h3>
                      
                      {allowAnonymous && (
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Anonymous Review</label>
                            <p className="text-xs text-gray-600">Hide your name from this review</p>
                          </div>
                          <Switch
                            checked={formData.isAnonymous}
                            onCheckedChange={(checked) => handleFormChange('isAnonymous', checked)}
                          />
                        </div>
                      )}

                      {allowVisibilityChange && (
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Public Review</label>
                            <p className="text-xs text-gray-600">Make this review visible to others</p>
                          </div>
                          <Switch
                            checked={formData.isPublic}
                            onCheckedChange={(checked) => handleFormChange('isPublic', checked)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'preview' && renderPreview()}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Change History</h3>
                    <div className="space-y-2">
                      {changeHistory.map((change, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{change.field}</span>
                            <span className="text-gray-600">
                              {change.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            From: {String(change.oldValue)} → To: {String(change.newValue)}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={resetForm}
                    disabled={isSaving || !hasUnsavedChanges}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  {isSaving && (
                    <div className="flex items-center gap-2">
                      <Progress value={saveProgress} className="w-24" />
                      <span className="text-sm text-gray-600">{saveProgress}%</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveReview}
                    disabled={isSaving || !hasUnsavedChanges}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditReview;
