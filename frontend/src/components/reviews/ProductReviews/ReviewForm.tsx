'use client';

import Image from 'next/image';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon,
  PhotoIcon,
  VideoCameraIcon,
  PaperClipIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid 
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Switch } from '@/components/ui/Switch';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Dialog } from '@/components/ui/Dialog';
import { Tooltip } from '@/components/ui/Tooltip';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui';
import Select from '@/components/ui/Select';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
// import MediaUploader from '../Shared/MediaUploader';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';
import { useAuth } from '@/components/providers';

// Types
interface ReviewUser {
  id: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
}

interface ReviewData {
  id: string;
  rating: number;
  title: string;
  content: string;
  productVariant?: string;
  purchaseDate?: string;
  usageDuration?: string;
  purchasePrice?: number;
  purchaseLocation?: string;
  qualityRating?: number;
  valueRating?: number;
  deliveryRating?: number;
  serviceRating?: number;
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
  isAnonymous?: boolean;
  allowComments?: boolean;
  notifyOnUpdates?: boolean;
  tags?: string[];
  comparisonProducts?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  useCase?: string;
  seasonality?: string;
  ageGroup?: string;
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

const validateReviewForm = (data: ReviewFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.rating) errors.rating = 'Rating is required';
  if (!data.content) errors.content = 'Review content is required';
  return errors;
};

const sanitizeContent = (content: string): string => {
  return content.replace(/<script[^>]*>.*?<\/script>/gi, '').trim();
};

const trackAnalytics = (event: string, data: Record<string, unknown>): void => {
  console.log('Analytics event:', event, data);
};

// Types
export interface ReviewFormData {
  // Core review data
  rating: number;
  title: string;
  content: string;
  isLoved?: boolean;
  
  // Product experience
  productVariant?: string;
  purchaseDate?: string;
  usageDuration?: string;
  purchasePrice?: number;
  purchaseLocation?: string;
  
  // Detailed ratings
  qualityRating?: number;
  valueRating?: number;
  deliveryRating?: number;
  serviceRating?: number;
  
  // Pros and cons
  pros: string[];
  cons: string[];
  
  // Media attachments
  images: File[];
  videos: File[];
  documents: File[];
  
  // Additional data
  wouldRecommend?: boolean;
  isAnonymous?: boolean;
  allowComments?: boolean;
  notifyOnUpdates?: boolean;
  tags: string[];
  
  // Advanced features
  comparisonProducts?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  useCase?: string;
  seasonality?: string;
  ageGroup?: string;
  
  // Voice recording
  voiceNote?: Blob;
  voiceTranscript?: string;
}

export interface ReviewFormProps {
  // Product information
  productId: string;
  productName: string;
  productImage?: string;
  productVariants?: Array<{
    id: string;
    name: string;
    attributes: Record<string, string>;
  }>;
  
  // User context
  user?: ReviewUser;
  isPurchaseVerified?: boolean;
  existingReview?: ReviewData;
  
  // Form configuration
  mode?: 'create' | 'edit' | 'reply';
  parentReviewId?: string;
  maxImages?: number;
  maxVideos?: number;
  maxFileSize?: number;
  allowedFormats?: string[];
  requiredFields?: string[];
  showAdvancedFeatures?: boolean;
  enableVoiceRecording?: boolean;
  enableAIDraft?: boolean;
  
  // Display options
  variant?: 'default' | 'compact' | 'detailed' | 'modal' | 'inline';
  showProgress?: boolean;
  showPreview?: boolean;
  showGuidelines?: boolean;
  showExamples?: boolean;
  multiStep?: boolean;
  
  // Styling
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  
  // Callbacks
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onDraft?: (data: Partial<ReviewFormData>) => void;
  onCancel?: () => void;
  onChange?: (data: Partial<ReviewFormData>) => void;
  onValidation?: (errors: Record<string, string>) => void;
  
  // Analytics
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

// Rating component
const RatingInput: React.FC<{
  value: number;
  onChange: (rating: number) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  error?: string;
}> = ({ value, onChange, label, description, size = 'md', required, error }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleMouseEnter = (rating: number) => {
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (rating: number) => {
    onChange(rating);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className={cn('block text-sm font-medium', error && 'text-red-600')}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const rating = i + 1;
          const isActive = rating <= (hoverRating || value);
          
          return (
            <button
              key={rating}
              type="button"
              className={cn(
                'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded',
                sizeClasses[size]
              )}
              onMouseEnter={() => handleMouseEnter(rating)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(rating)}
            >
              {isActive ? (
                <StarIconSolid className={cn(sizeClasses[size], 'text-yellow-400')} />
              ) : (
                <StarIcon className={cn(sizeClasses[size], 'text-gray-300 hover:text-yellow-300')} />
              )}
            </button>
          );
        })}
        
        <span className="ml-2 text-sm text-gray-600">
          {value > 0 ? `${value} out of 5 stars` : 'No rating'}
        </span>
      </div>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

// Media upload component
const MediaUploadSection: React.FC<{
  images: File[];
  videos: File[];
  onImagesChange: (files: File[]) => void;
  onVideosChange: (files: File[]) => void;
  maxImages?: number;
  maxVideos?: number;
  maxFileSize?: number;
  allowedFormats?: string[];
}> = ({ 
  images, 
  videos, 
  onImagesChange, 
  onVideosChange, 
  maxImages = 10, 
  maxVideos = 3, 
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedFormats = ['jpg', 'jpeg', 'png', 'mp4', 'mov']
}) => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const handleImageUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (images.length + fileArray.length > maxImages) {
      toast({
        title: 'Too many images',
        description: `Maximum ${maxImages} images allowed`,
        variant: 'destructive'
      });
      return;
    }

    const validFiles = fileArray.filter(file => {
      if (file.size > maxFileSize) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than ${formatFileSize(maxFileSize)}`,
          variant: 'destructive'
        });
        return false;
      }
      
      // Validate file format using allowedFormats
      const fileExtension = file.name.toLowerCase().split('.').pop() || '';
      const isValidFormat = allowedFormats.some(format => 
        format.toLowerCase() === fileExtension.toLowerCase()
      );
      
      if (!isValidFormat) {
        toast({
          title: 'Invalid file format',
          description: `${file.name} format not supported. Allowed: ${allowedFormats.join(', ')}`,
          variant: 'destructive'
        });
        return false;
      }
      
      return true;
    });

    // Simulate upload progress
    setShowUploadProgress(true);
    validFiles.forEach((file, index) => {
      const fileId = `${file.name}-${index}-${generateId()}`;
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
          if (Object.keys(uploadProgress).length === 0) {
            setShowUploadProgress(false);
          }
        } else {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        }
      }, 100);
    });

    // Generate previews
    const newPreviews: Record<string, string> = {};
    for (const file of validFiles) {
      const url = URL.createObjectURL(file);
      newPreviews[file.name] = url;
    }
    setPreviews(prev => ({ ...prev, ...newPreviews }));

    onImagesChange([...images, ...validFiles]);
  }, [images, maxImages, maxFileSize, allowedFormats, onImagesChange, toast, uploadProgress, setUploadProgress, setShowUploadProgress]);

  const handleVideoUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (videos.length + fileArray.length > maxVideos) {
      toast({
        title: 'Too many videos',
        description: `Maximum ${maxVideos} videos allowed`,
        variant: 'destructive'
      });
      return;
    }

    const validFiles = fileArray.filter(file => {
      if (file.size > maxFileSize) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than ${formatFileSize(maxFileSize)}`,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });

    onVideosChange([...videos, ...validFiles]);
  }, [videos, maxVideos, maxFileSize, onVideosChange, toast]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // Clean up preview URL
    const removedFile = images[index];
    if (previews[removedFile.name]) {
      URL.revokeObjectURL(previews[removedFile.name]);
      setPreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[removedFile.name];
        return newPreviews;
      });
    }
  }, [images, onImagesChange, previews]);

  const removeVideo = useCallback((index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    onVideosChange(newVideos);
  }, [videos, onVideosChange]);

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            <PhotoIcon className="w-4 h-4 mr-2 inline" />
            Photos ({images.length}/{maxImages})
          </Label>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer block">
            <div className="text-center">
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload photos or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG up to {formatFileSize(maxFileSize)}
              </p>
            </div>
          </label>
        </div>

        {/* Upload Progress */}
        {showUploadProgress && Object.keys(uploadProgress).length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Uploading...</Label>
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>File {fileId.slice(0, 8)}...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ))}
          </div>
        )}

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {previews[file.name] ? (
                    <Image
                      src={previews[file.name]}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                <div className="mt-1 text-xs text-gray-500 truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            <VideoCameraIcon className="w-4 h-4 mr-2 inline" />
            Videos ({videos.length}/{maxVideos})
          </Label>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={(e) => e.target.files && handleVideoUpload(e.target.files)}
            className="hidden"
            id="video-upload"
          />
          <label htmlFor="video-upload" className="cursor-pointer block">
            <div className="text-center">
              <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload videos or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                MP4, MOV, AVI up to {formatFileSize(maxFileSize)}
              </p>
            </div>
          </label>
        </div>

        {/* Video List */}
        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <VideoCameraIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remove video"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Voice recording component
const VoiceRecordingSection: React.FC<{
  voiceNote?: Blob;
  transcript?: string;
  onVoiceNoteChange: (blob: Blob | undefined) => void;
  onTranscriptChange: (transcript: string) => void;
}> = ({ voiceNote, transcript, onVoiceNoteChange, onTranscriptChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      const chunks: Blob[] = [];
      mediaRecorder.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        onVoiceNoteChange(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [onVoiceNoteChange]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
  }, [isRecording]);

  const playRecording = useCallback(() => {
    if (audioUrl && audioElement.current) {
      audioElement.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl]);

  const pauseRecording = useCallback(() => {
    if (audioElement.current) {
      audioElement.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const deleteRecording = useCallback(() => {
    onVoiceNoteChange(undefined);
    onTranscriptChange('');
    setAudioUrl(undefined);
    setRecordingTime(0);
  }, [onVoiceNoteChange, onTranscriptChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (voiceNote) {
      setAudioUrl(URL.createObjectURL(voiceNote));
    }
  }, [voiceNote]);

  useEffect(() => {
    if (audioElement.current) {
      audioElement.current.onended = () => setIsPlaying(false);
    }
  }, [audioUrl]);

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">
        <MicrophoneIcon className="w-4 h-4 mr-2 inline" />
        Voice Note
      </Label>

      {!voiceNote ? (
        <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          {isRecording ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-red-600 font-medium">Recording...</span>
              </div>
              <div className="text-2xl font-mono">{formatTime(recordingTime)}</div>
              <Button onClick={stopRecording} variant="outline">
                <StopIcon className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <MicrophoneIcon className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600">
                Record a voice note to add to your review
              </p>
              <Button onClick={startRecording}>
                <MicrophoneIcon className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={isPlaying ? pauseRecording : playRecording}
                className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </button>
              <div>
                <p className="text-sm font-medium">Voice Note</p>
                <p className="text-xs text-gray-500">Click to play</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={startRecording}>
                Re-record
              </Button>
              <Button variant="outline" size="sm" onClick={deleteRecording}>
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {audioUrl && (
            <audio
              ref={audioElement}
              src={audioUrl}
              className="hidden"
            />
          )}

          {transcript && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Transcript</Label>
              <TextArea
                value={transcript}
                onChange={(e) => onTranscriptChange(e.target.value)}
                placeholder="Voice note transcript..."
                rows={3}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main ReviewForm component
const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  productName,
  productImage,
  productVariants = [],
  user,
  isPurchaseVerified = false,
  existingReview,
  mode = 'create',
  parentReviewId,
  maxImages = 10,
  maxVideos = 3,
  maxFileSize = 10 * 1024 * 1024,
  allowedFormats = ['jpg', 'jpeg', 'png', 'mp4', 'mov'],
  requiredFields = ['rating', 'content'],
  showAdvancedFeatures = true,
  enableVoiceRecording = true,
  enableAIDraft = false,
  variant = 'default',
  showProgress = true,
  showPreview = false,
  showGuidelines = true,
  showExamples = false,
  multiStep = false,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  onSubmit,
  onDraft,
  onCancel,
  onChange,
  onValidation,
  onAnalyticsEvent
}) => {
  // Hook for draft data
  const { user: authUser } = useAuth();
  const { value: draftData, setValue: setDraftData } = useLocalStorage('review-draft', {} as ReviewFormData | null);
  
  // State management
  const [formData, setFormData] = useState<ReviewFormData>({
    // Merge existing review, draft, and defaults
    ...(draftData || {}),
    ...(existingReview ? {
      rating: existingReview.rating,
      title: existingReview.title,
      content: existingReview.content,
      productVariant: existingReview.productVariant,
      purchaseDate: existingReview.purchaseDate,
      usageDuration: existingReview.usageDuration,
      purchasePrice: existingReview.purchasePrice,
      purchaseLocation: existingReview.purchaseLocation,
      qualityRating: existingReview.qualityRating,
      valueRating: existingReview.valueRating,
      deliveryRating: existingReview.deliveryRating,
      serviceRating: existingReview.serviceRating,
      pros: existingReview.pros || [],
      cons: existingReview.cons || [],
      wouldRecommend: existingReview.wouldRecommend,
      isAnonymous: existingReview.isAnonymous || false,
      allowComments: existingReview.allowComments !== false,
      notifyOnUpdates: existingReview.notifyOnUpdates !== false,
      tags: existingReview.tags || [],
      comparisonProducts: existingReview.comparisonProducts || [],
      experienceLevel: existingReview.experienceLevel,
      useCase: existingReview.useCase,
      seasonality: existingReview.seasonality,
      ageGroup: existingReview.ageGroup
    } : {}),
    // Default values
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    content: existingReview?.content || '',
    productVariant: existingReview?.productVariant,
    purchaseDate: existingReview?.purchaseDate,
    usageDuration: existingReview?.usageDuration,
    purchasePrice: existingReview?.purchasePrice,
    purchaseLocation: existingReview?.purchaseLocation,
    qualityRating: existingReview?.qualityRating,
    valueRating: existingReview?.valueRating,
    deliveryRating: existingReview?.deliveryRating,
    serviceRating: existingReview?.serviceRating,
    pros: existingReview?.pros || [],
    cons: existingReview?.cons || [],
    images: [],
    videos: [],
    documents: [],
    wouldRecommend: existingReview?.wouldRecommend,
    isAnonymous: existingReview?.isAnonymous || false,
    allowComments: existingReview?.allowComments !== false,
    notifyOnUpdates: existingReview?.notifyOnUpdates !== false,
    tags: existingReview?.tags || [],
    comparisonProducts: existingReview?.comparisonProducts || [],
    experienceLevel: existingReview?.experienceLevel,
    useCase: existingReview?.useCase,
    seasonality: existingReview?.seasonality,
    ageGroup: existingReview?.ageGroup,
    isLoved: false
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(!!draftData);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [newTag, setNewTag] = useState('');

  // Hooks
  const { toast } = useToast();
  
  const saveToDraft = useCallback((data: ReviewFormData | null) => {
    if (data) {
      setDraftData(data);
      setIsDraft(true);
      trackAnalytics('draft_saved', { productId });
    } else {
      setIsDraft(false);
    }
  }, [productId, setDraftData]);
  
  // Helper function to get user display name
  const getUserDisplayName = (userObj: typeof user | typeof authUser) => {
    if (!userObj) return 'User';
    // For ReviewUser type
    if ('name' in userObj && userObj.name) return userObj.name;
    // For User type from auth context
    if ('fullName' in userObj && userObj.fullName) return userObj.fullName;
    if ('firstName' in userObj && userObj.firstName) return userObj.firstName;
    return 'User';
  };

  // Helper function to get user initials
  const getUserInitials = (userObj: typeof user | typeof authUser) => {
    const displayName = getUserDisplayName(userObj);
    return displayName.charAt(0).toUpperCase();
  };

  // Steps for multi-step form
  const steps = useMemo(() => [
    { id: 'basic', title: 'Basic Review', description: 'Rating and main content' },
    { id: 'details', title: 'Product Details', description: 'Specific product information' },
    { id: 'media', title: 'Media & Files', description: 'Photos, videos, and attachments' },
    { id: 'advanced', title: 'Additional Info', description: 'Tags, pros/cons, and more' },
    { id: 'preview', title: 'Review & Submit', description: 'Final review before submission' }
  ], []);

  // Calculate progress
  useEffect(() => {
    const requiredFieldsProgress = requiredFields.reduce((acc, field) => {
      if (formData[field as keyof ReviewFormData]) acc += 1;
      return acc;
    }, 0);
    
    const totalFields = requiredFields.length;
    setProgress((requiredFieldsProgress / totalFields) * 100);
  }, [formData, requiredFields]);

  // Auto-save draft
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mode === 'create' && (formData.content || formData.rating > 0)) {
        saveToDraft(formData);
        onDraft?.(formData);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData, mode, saveToDraft, onDraft]);

  // Handle form validation
  const validateForm = useCallback(() => {
    // First use the utility validation function
    const utilityErrors = validateReviewForm(formData);
    const newErrors: Record<string, string> = { ...utilityErrors };
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof ReviewFormData]) {
        newErrors[field] = `${field} is required`;
      }
    });

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Please select a rating between 1 and 5 stars';
    }

    if (formData.content.length < 10) {
      newErrors.content = 'Review content must be at least 10 characters';
    }

    if (formData.content.length > 5000) {
      newErrors.content = 'Review content must be less than 5000 characters';
    }

    // Validate content using sanitizeContent
    const sanitizedContent = sanitizeContent(formData.content);
    if (sanitizedContent !== formData.content) {
      newErrors.content = 'Content contains invalid characters';
    }

    setErrors(newErrors);
    onValidation?.(newErrors);
    
    return Object.keys(newErrors).length === 0;
  }, [formData, requiredFields, onValidation]);

  // Handle form data changes
  const handleChange = useCallback((field: keyof ReviewFormData, value: unknown) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      onChange?.(newData);
      return newData;
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [onChange, errors]);

  // Handle array operations
  const handleArrayAdd = useCallback((field: 'pros' | 'cons' | 'tags', value: string) => {
    if (value.trim()) {
      handleChange(field, [...formData[field], value.trim()]);
    }
  }, [formData, handleChange]);

  const handleArrayRemove = useCallback((field: 'pros' | 'cons' | 'tags', index: number) => {
    handleChange(field, formData[field].filter((_, i) => i !== index));
  }, [formData, handleChange]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your review!',
        variant: 'default'
      });
      
      // Clear draft
      saveToDraft(null);
      
      onAnalyticsEvent?.('review_submitted', {
        productId,
        rating: formData.rating,
        hasImages: formData.images.length > 0,
        hasVideos: formData.videos.length > 0,
        hasVoiceNote: !!formData.voiceNote,
        isAnonymous: formData.isAnonymous
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Review submission error:', error);
      trackAnalytics('review_submit_error', { productId, error: errorMessage });
      toast({
        title: 'Submission Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit, formData, toast, saveToDraft, onAnalyticsEvent, productId]);

  // Handle step navigation
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Render different steps
  const renderBasicStep = () => (
    <div className="space-y-6">
      {/* Product Info */}
      <Card className="p-4">
        <div className="flex items-start gap-4">
          {productImage && (
            <Image
              src={productImage}
              alt={productName}
              width={64}
              height={64}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div>
            <h3 className="font-semibold text-lg">{productName}</h3>
            {isPurchaseVerified && (
              <Badge variant="secondary" className="mt-1">
                <ShieldCheckIcon className="w-3 h-3 mr-1" />
                Verified Purchase
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Main Rating */}
      <RatingInput
        value={formData.rating}
        onChange={(rating) => handleChange('rating', rating)}
        label="Overall Rating"
        description="How would you rate this product overall?"
        size="lg"
        required={requiredFields.includes('rating')}
        error={errors.rating}
      />

      {/* Review Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className={cn('block text-sm font-medium', errors.title && 'text-red-600')}>
          Review Title
          {requiredFields.includes('title') && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Summarize your experience..."
          className={cn(errors.title && 'border-red-500')}
        />
        {errors.title && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <ExclamationTriangleIcon className="w-3 h-3" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <Label htmlFor="content" className={cn('block text-sm font-medium', errors.content && 'text-red-600')}>
          <DocumentTextIcon className="w-4 h-4 mr-1 inline" />
          Your Review
          {requiredFields.includes('content') && <span className="text-red-500 ml-1">*</span>}
          <Tooltip content="Write a detailed review to help others make informed decisions.">
            <InformationCircleIcon className="w-4 h-4 ml-1 inline text-gray-400 cursor-help" />
          </Tooltip>
        </Label>
        <TextArea
          id="content"
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Share your experience with this product..."
          rows={6}
          className={cn(errors.content && 'border-red-500')}
        />
        {enableAIDraft && (
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // AI draft functionality placeholder
                const aiSuggestion = `Based on your ${formData.rating}-star rating, here's a suggested review: "I found this product to be ${formData.rating >= 4 ? 'excellent' : formData.rating >= 3 ? 'good' : 'disappointing'}. "`;
                handleChange('content', aiSuggestion);
                toast({
                  title: 'AI Draft Generated',
                  description: 'Review content has been generated. Feel free to edit it.',
                });
              }}
              className="flex items-center gap-2"
            >
              <SparklesIcon className="w-4 h-4" />
              Generate AI Draft
            </Button>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {formData.content.length}/5000 characters
          </div>
          {errors.content && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <ExclamationTriangleIcon className="w-3 h-3" />
              {errors.content}
            </p>
          )}
        </div>
      </div>

      {/* Recommendation */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Would you recommend this product?</Label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleChange('wouldRecommend', true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
              formData.wouldRecommend === true
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-gray-50 border-gray-300 hover:border-gray-400'
            )}
          >
            <HandThumbUpIcon className="w-4 h-4" />
            Yes, I recommend it
          </button>
          <button
            type="button"
            onClick={() => handleChange('wouldRecommend', false)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
              formData.wouldRecommend === false
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-gray-50 border-gray-300 hover:border-gray-400'
            )}
          >
            <HandThumbDownIcon className="w-4 h-4" />
            No, I don&apos;t recommend it
          </button>
        </div>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      {/* Product Variant */}
      {productVariants.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Product Variant</Label>
          <Select
            value={formData.productVariant || ''}
            onValueChange={(value) => handleChange('productVariant', String(value))}
            options={[
              { label: 'Select variant...', value: '' },
              ...productVariants.map(variant => ({
                label: variant.name,
                value: variant.id
              }))
            ]}
          />
        </div>
      )}

      {/* Detailed Ratings */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Detailed Ratings</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RatingInput
            value={formData.qualityRating || 0}
            onChange={(rating) => handleChange('qualityRating', rating)}
            label="Quality"
            description="Product build and materials"
          />
          <RatingInput
            value={formData.valueRating || 0}
            onChange={(rating) => handleChange('valueRating', rating)}
            label="Value for Money"
            description="Price vs. quality ratio"
          />
          <RatingInput
            value={formData.deliveryRating || 0}
            onChange={(rating) => handleChange('deliveryRating', rating)}
            label="Delivery"
            description="Shipping speed and packaging"
          />
          <RatingInput
            value={formData.serviceRating || 0}
            onChange={(rating) => handleChange('serviceRating', rating)}
            label="Customer Service"
            description="Support and assistance"
          />
        </div>
      </div>

      {/* Purchase Information */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Purchase Information</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchase-date" className="text-sm">Purchase Date</Label>
            <Input
              id="purchase-date"
              type="date"
              value={formData.purchaseDate || ''}
              onChange={(e) => handleChange('purchaseDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usage-duration" className="text-sm">Usage Duration</Label>
            <Select
              value={formData.usageDuration || ''}
              onValueChange={(value) => handleChange('usageDuration', String(value))}
              options={[
                { label: 'Select duration...', value: '' },
                { label: 'Less than a week', value: 'less_than_week' },
                { label: '1-4 weeks', value: '1_4_weeks' },
                { label: '1-3 months', value: '1_3_months' },
                { label: '3-6 months', value: '3_6_months' },
                { label: '6+ months', value: '6_plus_months' }
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchase-price" className="text-sm">Purchase Price</Label>
            <Input
              id="purchase-price"
              type="number"
              min="0"
              step="0.01"
              value={formData.purchasePrice || ''}
              onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchase-location" className="text-sm">Where did you buy it?</Label>
            <Input
              id="purchase-location"
              value={formData.purchaseLocation || ''}
              onChange={(e) => handleChange('purchaseLocation', e.target.value)}
              placeholder="Store name or website"
            />
          </div>
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Your Experience Level</Label>
        <div className="flex gap-2">
          {[
            { value: 'beginner', label: 'Beginner', icon: '🌱' },
            { value: 'intermediate', label: 'Intermediate', icon: '🌿' },
            { value: 'expert', label: 'Expert', icon: '🌳' }
          ].map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => handleChange('experienceLevel', level.value)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                formData.experienceLevel === level.value
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-300 hover:border-gray-400'
              )}
            >
              <span>{level.icon}</span>
              {level.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMediaStep = () => (
    <div className="space-y-6">
      <MediaUploadSection
        images={formData.images}
        videos={formData.videos}
        onImagesChange={(images) => handleChange('images', images)}
        onVideosChange={(videos) => handleChange('videos', videos)}
        maxImages={maxImages}
        maxVideos={maxVideos}
        maxFileSize={maxFileSize}
        allowedFormats={allowedFormats}
      />

      {enableVoiceRecording && (
        <VoiceRecordingSection
          voiceNote={formData.voiceNote}
          transcript={formData.voiceTranscript}
          onVoiceNoteChange={(voiceNote) => handleChange('voiceNote', voiceNote)}
          onTranscriptChange={(transcript) => handleChange('voiceTranscript', transcript)}
        />
      )}

      {/* Document Upload */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            <PaperClipIcon className="w-4 h-4 mr-2 inline" />
            Documents ({formData.documents.length}/5)
          </Label>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                const files = Array.from(e.target.files);
                handleChange('documents', [...formData.documents, ...files]);
              }
            }}
            className="hidden"
            id="document-upload"
          />
          <label htmlFor="document-upload" className="cursor-pointer block">
            <div className="text-center">
              <PaperClipIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload documents
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, TXT up to {formatFileSize(maxFileSize)}
              </p>
            </div>
          </label>
        </div>

        {/* Document List */}
        {formData.documents.length > 0 && (
          <div className="space-y-2">
            {formData.documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <PaperClipIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newDocs = formData.documents.filter((_, i) => i !== index);
                    handleChange('documents', newDocs);
                  }}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remove document"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAdvancedStep = () => (
    <div className="space-y-6">
      {/* Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center">
            <FaceSmileIcon className="w-4 h-4 mr-1 text-green-600" />
            Pros
          </Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                placeholder="Add a positive point..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayAdd('pros', newPro);
                    setNewPro('');
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  handleArrayAdd('pros', newPro);
                  setNewPro('');
                }}
                disabled={!newPro.trim()}
              >
                Add
              </Button>
            </div>
            <div className="space-y-1">
              {formData.pros.map((pro, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm text-green-800">{pro}</span>
                  <button
                    type="button"
                    onClick={() => handleArrayRemove('pros', index)}
                    className="text-green-600 hover:text-green-800"
                    aria-label="Remove pro"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center">
            <FaceFrownIcon className="w-4 h-4 mr-1 text-red-600" />
            Cons
          </Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                placeholder="Add a negative point..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayAdd('cons', newCon);
                    setNewCon('');
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  handleArrayAdd('cons', newCon);
                  setNewCon('');
                }}
                disabled={!newCon.trim()}
              >
                Add
              </Button>
            </div>
            <div className="space-y-1">
              {formData.cons.map((con, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm text-red-800">{con}</span>
                  <button
                    type="button"
                    onClick={() => handleArrayRemove('cons', index)}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Remove con"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          <SparklesIcon className="w-4 h-4 mr-1 inline" />
          Tags
        </Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleArrayAdd('tags', newTag);
                  setNewTag('');
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                handleArrayAdd('tags', newTag);
                setNewTag('');
              }}
              disabled={!newTag.trim()}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleArrayRemove('tags', index)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Remove tag"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Privacy & Notifications</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Anonymous Review</Label>
              <p className="text-xs text-gray-500">Hide your name from this review</p>
            </div>
            <Switch
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => handleChange('isAnonymous', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium flex items-center">
                <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                Allow Comments
              </Label>
              <p className="text-xs text-gray-500">Let others comment on your review</p>
            </div>
            <Switch
              checked={formData.allowComments}
              onCheckedChange={(checked) => handleChange('allowComments', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Notify on Updates</Label>
              <p className="text-xs text-gray-500">Get notified about responses and updates</p>
            </div>
            <Switch
              checked={formData.notifyOnUpdates}
              onCheckedChange={(checked) => handleChange('notifyOnUpdates', checked)}
            />
          </div>
          
          {/* Terms agreement */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms-agreement"
              className="mt-0.5"
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="terms-agreement"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the review guidelines
              </Label>
              <p className="text-xs text-gray-500">
                I confirm this review is based on my own experience and complies with the community guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Review Preview</h3>
        
        {/* Preview content will be displayed here */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <StarIconSolid
                key={i}
                className={cn(
                  'w-5 h-5',
                  i < formData.rating ? 'text-yellow-400' : 'text-gray-300'
                )}
              />
            ))}
            <span className="text-sm text-gray-600">({formData.rating}/5)</span>
          </div>
          
          {formData.title && (
            <h4 className="font-semibold">{formData.title}</h4>
          )}
          
          <p className="text-gray-700 whitespace-pre-wrap">{formData.content}</p>
          
          {(formData.pros.length > 0 || formData.cons.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.pros.length > 0 && (
                <div>
                  <h5 className="font-medium text-green-700 mb-2">Pros:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {formData.pros.map((pro, index) => (
                      <li key={index} className="text-sm text-green-600">{pro}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {formData.cons.length > 0 && (
                <div>
                  <h5 className="font-medium text-red-700 mb-2">Cons:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {formData.cons.map((con, index) => (
                      <li key={index} className="text-sm text-red-600">{con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {formData.images.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">Photos ({formData.images.length})</h5>
              <div className="text-sm text-gray-600">
                {formData.images.map((img) => img.name).join(', ')}
              </div>
            </div>
          )}
          
          {formData.videos.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">Videos ({formData.videos.length})</h5>
              <div className="text-sm text-gray-600">
                {formData.videos.map((vid) => vid.name).join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    if (!multiStep) {
      return (
        <>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isLoved: !prev.isLoved }))}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  formData.isLoved 
                    ? "bg-red-50 text-red-600 border border-red-200" 
                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                )}
              >
                {formData.isLoved ? (
                  <HeartIconSolid className="w-4 h-4" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
                Love this product
              </button>
            </div>
            {isDraft && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <DocumentTextIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Draft saved</span>
              </div>
            )}
          </div>
        
          <div className="space-y-8">
            {showAdvancedFeatures ? (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="mt-6">
                {renderBasicStep()}
              </TabsContent>
              <TabsContent value="details" className="mt-6">
                {renderDetailsStep()}
              </TabsContent>
              <TabsContent value="media" className="mt-6">
                {renderMediaStep()}
              </TabsContent>
              <TabsContent value="advanced" className="mt-6">
                {renderAdvancedStep()}
              </TabsContent>
            </Tabs>
          ) : (
            renderBasicStep()
          )}
          </div>
        </>
      );
    }

    switch (currentStep) {
      case 0: return renderBasicStep();
      case 1: return renderDetailsStep();
      case 2: return renderMediaStep();
      case 3: return renderAdvancedStep();
      case 4: return renderPreviewStep();
      default: return renderBasicStep();
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'max-w-4xl mx-auto',
          {
            'max-w-2xl': variant === 'compact',
            'max-w-6xl': variant === 'detailed',
            'rounded-none shadow-none': variant === 'modal',
            'border-none shadow-none bg-transparent': variant === 'inline'
          },
          className
        )}
      >
      <Card className="overflow-hidden">
        {/* Header */}
        <div className={cn('p-6 bg-gray-50 border-b', headerClassName)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(user || authUser) && (
                <Avatar
                  src={(user || authUser)?.avatar}
                  alt={getUserDisplayName(user || authUser)}
                  size="md"
                  fallback={getUserInitials(user || authUser)}
                />
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  {mode === 'edit' ? 'Edit Review' : 'Write a Review'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {parentReviewId 
                  ? `Replying to a review for ${productName}`
                  : `Share your experience with ${productName}`
                }
                {user && (
                  <span className="block text-xs mt-1">
                    Posting as {getUserDisplayName(user)}
                    {user.isVerified && (
                      <Badge variant="secondary" className="ml-2">
                        <ShieldCheckIcon className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </span>
                )}
                </p>
              </div>
            </div>
            
            {showProgress && (
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">
                  {Math.round(progress)}% Complete
                </div>
                <Progress value={progress} className="w-32" />
              </div>
            )}
          </div>

          {/* Multi-step progress */}
          {multiStep && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer',
                      index === currentStep
                        ? 'bg-blue-100 text-blue-700'
                        : index < currentStep
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    )}
                    onClick={() => setCurrentStep(index)}
                  >
                    <span className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs',
                      index === currentStep
                        ? 'bg-blue-500 text-white'
                        : index < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    )}>
                      {index + 1}
                    </span>
                    {step.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn('p-6', contentClassName)}>
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <div className={cn('p-6 bg-gray-50 border-t flex items-center justify-between', footerClassName)}>
          <div className="flex items-center gap-4">
            {multiStep && currentStep > 0 && (
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
            
            {onCancel && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel
                </Button>
                {showCancelDialog && (
                  <Dialog
                    open={showCancelDialog}
                    onClose={() => setShowCancelDialog(false)}
                  >
                    <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Cancel Review</h3>
                        <p className="text-gray-600">
                          Are you sure you want to cancel? Your progress will be saved as a draft.
                        </p>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <Button 
                          variant="outline"
                          onClick={() => setShowCancelDialog(false)}
                        >
                          Continue Writing
                        </Button>
                        <Button 
                          onClick={() => {
                            saveToDraft(formData);
                            setShowCancelDialog(false);
                            onCancel();
                          }}
                          variant="destructive"
                        >
                          Yes, Cancel
                        </Button>
                      </div>
                    </div>
                  </Dialog>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showPreview && !multiStep && (
              <Button
                variant="outline"
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-2"
              >
                {showPreviewModal ? (
                  <>
                    <EyeSlashIcon className="w-4 h-4" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-4 h-4" />
                    Preview
                  </>
                )}
              </Button>
            )}

            {multiStep && currentStep < steps.length - 1 ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loading size="sm" />
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
                {mode === 'edit' ? 'Update Review' : 'Submit Review'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      {showPreviewModal && (
        <Modal
          open={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Review Preview</h3>
            {renderPreviewStep()}
          </div>
        </Modal>
      )}

      {/* Guidelines */}
      {showGuidelines && (
        <Card className="mt-6 p-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-500" />
            Review Guidelines
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Be honest and fair in your review</li>
            <li>• Focus on the product, not the seller</li>
            <li>• Include specific details about your experience</li>
            <li>• Keep your language respectful and constructive</li>
            <li>• Avoid including personal information</li>
          </ul>
        </Card>
      )}

      {/* Examples */}
      {showExamples && (
        <Card className="mt-6 p-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2 text-green-500" />
            Review Examples
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-800">Good Example:</p>
              <p className="text-green-700 mt-1">
                &ldquo;I&rsquo;ve been using this product for 3 months and it has exceeded my expectations. 
                The build quality is excellent and it works exactly as described. Highly recommend!&rdquo;
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="font-medium text-yellow-800">Tips:</p>
              <ul className="text-yellow-700 mt-1 space-y-1">
                <li>• Mention how long you&rsquo;ve used the product</li>
                <li>• Include specific features you liked or disliked</li>
                <li>• Compare it to similar products if relevant</li>
                <li>• Mention the use case or purpose</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewForm;
