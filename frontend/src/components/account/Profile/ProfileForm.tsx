'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  GlobeAltIcon,
  LanguageIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  LinkIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNotification } from '@/hooks/notification/useNotification';
import { formatDate, formatPhoneNumber } from '@/lib/formatters';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProfileFormProps {
  /** User ID */
  userId?: string;
  
  /** Show as modal */
  showAsModal?: boolean;
  
  /** Callback when profile updated */
  onProfileUpdate?: (data: ProfileFormData) => void;
  
  /** Callback when operation cancelled */
  onCancel?: () => void;
  
  /** Enable auto-save */
  enableAutoSave?: boolean;
  
  /** Auto-save delay in ms */
  autoSaveDelay?: number;
  
  /** Show unsaved changes warning */
  showUnsavedWarning?: boolean;
  
  /** Read only mode */
  readOnly?: boolean;
  
  /** Show verification badges */
  showVerificationBadges?: boolean;
  
  /** Enable field validation */
  enableValidation?: boolean;
  
  /** Custom CSS class */
  className?: string;
}

export interface ProfileFormData {
  // Basic Information
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  
  // Location
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Professional
  occupation?: string;
  company?: string;
  industry?: string;
  jobTitle?: string;
  
  // Education
  education?: string;
  university?: string;
  graduationYear?: string;
  
  // Social & Web
  website?: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  
  // Preferences
  language?: string;
  timezone?: string;
  newsletter?: boolean;
  publicProfile?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
}

interface FormSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: string[];
}

interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FORM_SECTIONS: FormSection[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Your personal details',
    icon: UserIcon,
    fields: ['firstName', 'lastName', 'displayName', 'email', 'phone', 'dateOfBirth', 'gender'],
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Where you live',
    icon: MapPinIcon,
    fields: ['street', 'city', 'state', 'zipCode', 'country'],
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Career information',
    icon: BriefcaseIcon,
    fields: ['occupation', 'company', 'industry', 'jobTitle'],
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Academic background',
    icon: AcademicCapIcon,
    fields: ['education', 'university', 'graduationYear'],
  },
  {
    id: 'social',
    title: 'Social & Web',
    description: 'Online presence',
    icon: LinkIcon,
    fields: ['website', 'bio', 'linkedin', 'twitter', 'facebook', 'instagram', 'github'],
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Privacy and settings',
    icon: ShieldCheckIcon,
    fields: ['language', 'timezone', 'newsletter', 'publicProfile', 'showEmail', 'showPhone'],
  },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'hi', label: 'Hindi' },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Spain', 'Italy', 'Japan', 'China', 'India', 'Brazil'
];

// ============================================================================
// COMPONENT
// ============================================================================

export const ProfileForm: React.FC<ProfileFormProps> = ({
  userId: userIdProp,
  showAsModal = false,
  onProfileUpdate,
  onCancel,
  enableAutoSave = false,
  autoSaveDelay = 2000,
  showUnsavedWarning = true,
  readOnly = false,
  showVerificationBadges = true,
  enableValidation = true,
  className,
}) => {
  const { user, updateProfile } = useAuth();
  const notification = useNotification();
  const activeUserId = userIdProp || user?.id;

  // ============================================================================
  // STATE
  // ============================================================================

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    gender: undefined,
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || '',
    occupation: '',
    company: '',
    industry: '',
    jobTitle: '',
    education: '',
    university: '',
    graduationYear: '',
    website: '',
    bio: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    github: '',
    language: user?.preferences?.language || 'en',
    timezone: 'America/New_York',
    newsletter: false,
    publicProfile: true,
    showEmail: user?.preferences?.privacy?.showEmail || false,
    showPhone: user?.preferences?.privacy?.showPhone || false,
  });

  const [originalData, setOriginalData] = useState<ProfileFormData>(formData);
  const [activeSection, setActiveSection] = useState('basic');
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  const profileCompletion = useMemo(() => {
    const allFields = Object.keys(formData);
    const filledFields = allFields.filter(key => {
      const value = formData[key as keyof ProfileFormData];
      return value !== '' && value !== undefined && value !== null;
    });
    return Math.round((filledFields.length / allFields.length) * 100);
  }, [formData]);

  const sectionCompletion = useMemo(() => {
    const completion: Record<string, number> = {};
    
    FORM_SECTIONS.forEach(section => {
      const sectionFields = section.fields;
      const filledFields = sectionFields.filter(field => {
        const value = formData[field as keyof ProfileFormData];
        return value !== '' && value !== undefined && value !== null;
      });
      completion[section.id] = Math.round((filledFields.length / sectionFields.length) * 100);
    });
    
    return completion;
  }, [formData]);

  const canSubmit = useMemo(() => {
    return (
      !isLoading &&
      !isSaving &&
      hasUnsavedChanges &&
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      validationErrors.length === 0
    );
  }, [isLoading, isSaving, hasUnsavedChanges, formData.firstName, formData.lastName, formData.email, validationErrors]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateField = useCallback((field: string, value: unknown): string | null => {
    if (!enableValidation) return null;

    // Type guard for string values
    const stringValue = typeof value === 'string' ? value : '';

    switch (field) {
      case 'firstName':
      case 'lastName':
        if (!stringValue || stringValue.trim() === '') {
          return 'This field is required';
        }
        if (stringValue.length < 2) {
          return 'Must be at least 2 characters';
        }
        if (stringValue.length > 50) {
          return 'Must be less than 50 characters';
        }
        break;

      case 'email':
        if (!stringValue || stringValue.trim() === '') {
          return 'Email is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(stringValue)) {
          return 'Invalid email format';
        }
        break;

      case 'phone':
        if (stringValue && stringValue.trim() !== '') {
          const phoneRegex = /^[\d\s\-\(\)\+]+$/;
          if (!phoneRegex.test(stringValue)) {
            return 'Invalid phone format';
          }
        }
        break;

      case 'website':
      case 'linkedin':
      case 'twitter':
      case 'facebook':
      case 'instagram':
      case 'github':
        if (stringValue && stringValue.trim() !== '') {
          try {
            new URL(stringValue);
          } catch {
            return 'Invalid URL format';
          }
        }
        break;

      case 'zipCode':
        if (stringValue && stringValue.trim() !== '') {
          const zipRegex = /^\d{5}(-\d{4})?$/;
          if (!zipRegex.test(stringValue)) {
            return 'Invalid ZIP code format';
          }
        }
        break;

      case 'bio':
        if (stringValue && stringValue.length > 500) {
          return 'Bio must be less than 500 characters';
        }
        break;
    }

    return null;
  }, [enableValidation]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const newValidationErrors: ValidationError[] = [];

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof ProfileFormData]);
      if (error) {
        newErrors[field] = error;
        newValidationErrors.push({ field, message: error });
      }
    });

    setErrors(newErrors);
    setValidationErrors(newValidationErrors);
    return newValidationErrors.length === 0;
  }, [formData, validateField]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !canSubmit) return;

    setIsSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Auto-saving profile:', { userId: activeUserId, data: formData, showAsModal });
      
      setLastSaved(new Date());
      setOriginalData(formData);
      
      notification.success('Profile auto-saved', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, canSubmit, activeUserId, formData, showAsModal, notification]);

  const handleFieldChange = useCallback((field: keyof ProfileFormData, value: unknown) => {
    if (readOnly) return;

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));

    // Clear field error
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Auto-save logic
    if (enableAutoSave) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      
      const timeout = setTimeout(() => {
        handleAutoSave();
      }, autoSaveDelay);
      
      setAutoSaveTimeout(timeout);
    }
  }, [readOnly, errors, enableAutoSave, autoSaveTimeout, autoSaveDelay, handleAutoSave]);

  const handleFieldBlur = useCallback((field: string) => {
    const error = validateField(field, formData[field as keyof ProfileFormData]);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error,
      }));
    }
  }, [formData, validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      notification.error('Please fix validation errors', {
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Updating profile:', { userId: activeUserId, data: formData });

      if (updateProfile) {
        await updateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          preferences: {
            language: formData.language || 'en',
            privacy: {
              showEmail: formData.showEmail || false,
              showPhone: formData.showPhone || false,
              allowDataCollection: true,
            },
            notifications: {
              email: formData.newsletter || false,
              push: true,
              sms: false,
              marketing: formData.newsletter || false,
            },
            theme: user?.preferences?.theme || 'system',
          },
        });
      }

      setOriginalData(formData);
      setLastSaved(new Date());
      setShowSuccessMessage(true);

      notification.success('Profile updated successfully', {
        duration: 3000,
      });

      onProfileUpdate?.(formData);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update profile',
      });
      
      notification.error('Failed to update profile', {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, activeUserId, formData, updateProfile, user?.preferences?.theme, notification, onProfileUpdate]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges && showUnsavedWarning) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }

    setFormData(originalData);
    setErrors({});
    setTouched({});
    onCancel?.();
  }, [hasUnsavedChanges, showUnsavedWarning, originalData, onCancel]);

  const handleReset = useCallback(() => {
    if (hasUnsavedChanges && showUnsavedWarning) {
      const confirmed = window.confirm('Are you sure you want to reset all changes?');
      if (!confirmed) return;
    }

    setFormData(originalData);
    setErrors({});
    setTouched({});
    
    notification.info('Form reset to original values', {
      duration: 2000,
    });
  }, [hasUnsavedChanges, showUnsavedWarning, originalData, notification]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setCompletionPercentage(profileCompletion);
  }, [profileCompletion]);

  useEffect(() => {
    if (enableValidation && Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [formData, enableValidation, touched, validateForm]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // ============================================================================
  // RENDER - SUCCESS MESSAGE
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
              Profile Updated!
            </h2>
            <p className="text-gray-600">
              Your profile information has been saved successfully
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ============================================================================
  // RENDER - MAIN FORM
  // ============================================================================

  return (
    <div className={cn('w-full', className)}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {lastSaved ? `Last saved ${formatDate(lastSaved)}` : 'Update your profile information'}
                </p>
              </div>
              
              {isSaving ? (
                <Badge variant="default" className="flex items-center gap-2">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Saving...
                </Badge>
              ) : lastSaved ? (
                <Badge variant="success" className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  Saved
                </Badge>
              ) : null}
            </div>

            {/* Profile Completion */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Profile Completion
                </span>
                <span className="text-sm font-bold text-blue-900">
                  {completionPercentage}%
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-xs text-blue-700 mt-2">
                Complete your profile to unlock all features
              </p>
            </div>

            {/* Unsaved Changes Warning */}
            {hasUnsavedChanges && showUnsavedWarning ? (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="warning">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <div className="ml-2">
                      <p className="font-medium">Unsaved Changes</p>
                      <p className="text-sm">You have unsaved changes. Don&apos;t forget to save!</p>
                    </div>
                  </Alert>
                </motion.div>
              </AnimatePresence>
            ) : null}

            {/* Validation Errors */}
            {validationErrors.length > 0 ? (
              <Alert variant="destructive">
                <XCircleIcon className="w-5 h-5" />
                <div className="ml-2">
                  <p className="font-medium">Validation Errors ({validationErrors.length})</p>
                  <ul className="text-sm mt-1 list-disc list-inside">
                    {validationErrors.slice(0, 3).map((error, index) => (
                      <li key={index}>{error.field}: {error.message}</li>
                    ))}
                    {validationErrors.length > 3 ? (
                      <li>And {validationErrors.length - 3} more...</li>
                    ) : null}
                  </ul>
                </div>
              </Alert>
            ) : null}
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {FORM_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.includes(section.id);
              const completion = sectionCompletion[section.id] || 0;

              return (
                <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Section Header */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleSection(section.id);
                      setActiveSection(section.id);
                    }}
                    className="w-full bg-gray-50 hover:bg-gray-100 transition-colors p-4 flex items-center justify-between"
                    data-active={activeSection === section.id}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{section.title}</h3>
                        <p className="text-xs text-gray-600">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-medium text-gray-700">{completion}% Complete</div>
                        <Progress value={completion} className="h-1 w-20 mt-1" />
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </div>
                  </button>

                  {/* Section Content */}
                  <AnimatePresence>
                    {isExpanded ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-200"
                      >
                        <div className="p-4 space-y-4">
                          {/* Basic Information Section */}
                          {section.id === 'basic' ? (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name *
                                    {showVerificationBadges && user?.isEmailVerified ? (
                                      <Badge variant="success" className="ml-2 text-xs">Verified</Badge>
                                    ) : null}
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                    onBlur={() => handleFieldBlur('firstName')}
                                    placeholder="John"
                                    disabled={readOnly || isLoading}
                                    className={errors.firstName ? 'border-red-500' : ''}
                                  />
                                  {errors.firstName ? (
                                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                                  ) : null}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name *
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                    onBlur={() => handleFieldBlur('lastName')}
                                    placeholder="Doe"
                                    disabled={readOnly || isLoading}
                                    className={errors.lastName ? 'border-red-500' : ''}
                                  />
                                  {errors.lastName ? (
                                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                                  ) : null}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Display Name
                                </label>
                                <Input
                                  type="text"
                                  value={formData.displayName || ''}
                                  onChange={(e) => handleFieldChange('displayName', e.target.value)}
                                  placeholder="How you want to be called"
                                  disabled={readOnly || isLoading}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <EnvelopeIcon className="inline w-4 h-4 mr-1" />
                                    Email *
                                    {showVerificationBadges && user?.isEmailVerified ? (
                                      <ShieldCheckIcon className="inline w-4 h-4 ml-1 text-green-600" />
                                    ) : null}
                                  </label>
                                  <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleFieldChange('email', e.target.value)}
                                    onBlur={() => handleFieldBlur('email')}
                                    placeholder="john@example.com"
                                    disabled={readOnly || isLoading}
                                    className={errors.email ? 'border-red-500' : ''}
                                  />
                                  {errors.email ? (
                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                  ) : null}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <PhoneIcon className="inline w-4 h-4 mr-1" />
                                    Phone
                                    {showVerificationBadges && user?.isPhoneVerified ? (
                                      <ShieldCheckIcon className="inline w-4 h-4 ml-1 text-green-600" />
                                    ) : null}
                                  </label>
                                  <Input
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                                    onBlur={() => handleFieldBlur('phone')}
                                    placeholder="+1 (555) 123-4567"
                                    disabled={readOnly || isLoading}
                                    className={errors.phone ? 'border-red-500' : ''}
                                  />
                                  {errors.phone ? (
                                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                                  ) : (formData.phone ? (
                                    <p className="mt-1 text-xs text-gray-600">Formatted: {formatPhoneNumber(formData.phone)}</p>
                                  ) : null)}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <CalendarIcon className="inline w-4 h-4 mr-1" />
                                    Date of Birth
                                  </label>
                                  <Input
                                    type="date"
                                    value={formData.dateOfBirth || ''}
                                    onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                                    disabled={readOnly || isLoading}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                  </label>
                                  <select
                                    value={formData.gender || ''}
                                    onChange={(e) => handleFieldChange('gender', e.target.value)}
                                    disabled={readOnly || isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    aria-label="Select gender"
                                    title="Select your gender"
                                  >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                  </select>
                                </div>
                              </div>
                            </>
                          ) : null}

                          {/* Location Section */}
                          {section.id === 'location' ? (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Street Address
                                </label>
                                <Input
                                  type="text"
                                  value={formData.street || ''}
                                  onChange={(e) => handleFieldChange('street', e.target.value)}
                                  placeholder="123 Main St"
                                  disabled={readOnly || isLoading}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.city || ''}
                                    onChange={(e) => handleFieldChange('city', e.target.value)}
                                    placeholder="New York"
                                    disabled={readOnly || isLoading}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    State/Province
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.state || ''}
                                    onChange={(e) => handleFieldChange('state', e.target.value)}
                                    placeholder="NY"
                                    disabled={readOnly || isLoading}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ZIP/Postal Code
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.zipCode || ''}
                                    onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                                    onBlur={() => handleFieldBlur('zipCode')}
                                    placeholder="10001"
                                    disabled={readOnly || isLoading}
                                    className={errors.zipCode ? 'border-red-500' : ''}
                                  />
                                  {errors.zipCode ? (
                                    <p className="mt-1 text-xs text-red-600">{errors.zipCode}</p>
                                  ) : null}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country
                                  </label>
                                  <select
                                    value={formData.country || ''}
                                    onChange={(e) => handleFieldChange('country', e.target.value)}
                                    disabled={readOnly || isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    aria-label="Select country"
                                    title="Select your country"
                                  >
                                    <option value="">Select country</option>
                                    {COUNTRIES.map(country => (
                                      <option key={country} value={country}>{country}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </>
                          ) : null}

                          {/* Professional Section */}
                          {section.id === 'professional' ? (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Occupation
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.occupation || ''}
                                    onChange={(e) => handleFieldChange('occupation', e.target.value)}
                                    placeholder="Software Engineer"
                                    disabled={readOnly || isLoading}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.company || ''}
                                    onChange={(e) => handleFieldChange('company', e.target.value)}
                                    placeholder="Acme Inc."
                                    disabled={readOnly || isLoading}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Industry
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.industry || ''}
                                    onChange={(e) => handleFieldChange('industry', e.target.value)}
                                    placeholder="Technology"
                                    disabled={readOnly || isLoading}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Title
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.jobTitle || ''}
                                    onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                                    placeholder="Senior Developer"
                                    disabled={readOnly || isLoading}
                                  />
                                </div>
                              </div>
                            </>
                          ) : null}

                          {/* Education Section */}
                          {section.id === 'education' ? (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Education Level
                                </label>
                                <select
                                  value={formData.education || ''}
                                  onChange={(e) => handleFieldChange('education', e.target.value)}
                                  disabled={readOnly || isLoading}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  aria-label="Select education level"
                                  title="Select your education level"
                                >
                                  <option value="">Select education</option>
                                  <option value="high_school">High School</option>
                                  <option value="associate">Associate Degree</option>
                                  <option value="bachelor">Bachelor&apos;s Degree</option>
                                  <option value="master">Master&apos;s Degree</option>
                                  <option value="phd">Ph.D.</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    University
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.university || ''}
                                    onChange={(e) => handleFieldChange('university', e.target.value)}
                                    placeholder="University of Example"
                                    disabled={readOnly || isLoading}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Graduation Year
                                  </label>
                                  <Input
                                    type="text"
                                    value={formData.graduationYear || ''}
                                    onChange={(e) => handleFieldChange('graduationYear', e.target.value)}
                                    placeholder="2020"
                                    disabled={readOnly || isLoading}
                                  />
                                </div>
                              </div>
                            </>
                          ) : null}

                          {/* Social & Web Section */}
                          {section.id === 'social' ? (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  <GlobeAltIcon className="inline w-4 h-4 mr-1" />
                                  Website
                                </label>
                                <Input
                                  type="url"
                                  value={formData.website || ''}
                                  onChange={(e) => handleFieldChange('website', e.target.value)}
                                  onBlur={() => handleFieldBlur('website')}
                                  placeholder="https://yourwebsite.com"
                                  disabled={readOnly || isLoading}
                                  className={errors.website ? 'border-red-500' : ''}
                                />
                                {errors.website ? (
                                  <p className="mt-1 text-xs text-red-600">{errors.website}</p>
                                ) : null}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  <PencilIcon className="inline w-4 h-4 mr-1" />
                                  Bio
                                </label>
                                <textarea
                                  value={formData.bio || ''}
                                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                                  onBlur={() => handleFieldBlur('bio')}
                                  placeholder="Tell us about yourself..."
                                  disabled={readOnly || isLoading}
                                  rows={4}
                                  className={cn(
                                    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                                    errors.bio && 'border-red-500'
                                  )}
                                />
                                <div className="flex items-center justify-between mt-1">
                                  {errors.bio ? (
                                    <p className="text-xs text-red-600">{errors.bio}</p>
                                  ) : (
                                    <span className="text-xs text-gray-500">
                                      {formData.bio?.length || 0}/500 characters
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    LinkedIn
                                  </label>
                                  <Input
                                    type="url"
                                    value={formData.linkedin || ''}
                                    onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    disabled={readOnly || isLoading}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Twitter
                                  </label>
                                  <Input
                                    type="url"
                                    value={formData.twitter || ''}
                                    onChange={(e) => handleFieldChange('twitter', e.target.value)}
                                    placeholder="https://twitter.com/yourusername"
                                    disabled={readOnly || isLoading}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Facebook
                                  </label>
                                  <Input
                                    type="url"
                                    value={formData.facebook || ''}
                                    onChange={(e) => handleFieldChange('facebook', e.target.value)}
                                    placeholder="https://facebook.com/yourprofile"
                                    disabled={readOnly || isLoading}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Instagram
                                  </label>
                                  <Input
                                    type="url"
                                    value={formData.instagram || ''}
                                    onChange={(e) => handleFieldChange('instagram', e.target.value)}
                                    placeholder="https://instagram.com/yourusername"
                                    disabled={readOnly || isLoading}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  GitHub
                                </label>
                                <Input
                                  type="url"
                                  value={formData.github || ''}
                                  onChange={(e) => handleFieldChange('github', e.target.value)}
                                  placeholder="https://github.com/yourusername"
                                  disabled={readOnly || isLoading}
                                />
                              </div>
                            </>
                          ) : null}

                          {/* Preferences Section */}
                          {section.id === 'preferences' ? (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <LanguageIcon className="inline w-4 h-4 mr-1" />
                                    Language
                                  </label>
                                  <select
                                    value={formData.language || 'en'}
                                    onChange={(e) => handleFieldChange('language', e.target.value)}
                                    disabled={readOnly || isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    aria-label="Select language"
                                    title="Select your preferred language"
                                  >
                                    {LANGUAGES.map(lang => (
                                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Timezone
                                  </label>
                                  <select
                                    value={formData.timezone || ''}
                                    onChange={(e) => handleFieldChange('timezone', e.target.value)}
                                    disabled={readOnly || isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    aria-label="Select timezone"
                                    title="Select your timezone"
                                  >
                                    {TIMEZONES.map(tz => (
                                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-3 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                  <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                                  Privacy Settings
                                </h4>
                                
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id="publicProfile"
                                    checked={formData.publicProfile || false}
                                    onChange={(e) => handleFieldChange('publicProfile', e.target.checked)}
                                    disabled={readOnly || isLoading}
                                  />
                                  <div className="flex-1">
                                    <label htmlFor="publicProfile" className="text-sm font-medium text-gray-700 cursor-pointer">
                                      Make profile public
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Allow others to view your profile information
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id="showEmail"
                                    checked={formData.showEmail || false}
                                    onChange={(e) => handleFieldChange('showEmail', e.target.checked)}
                                    disabled={readOnly || isLoading}
                                  />
                                  <div className="flex-1">
                                    <label htmlFor="showEmail" className="text-sm font-medium text-gray-700 cursor-pointer">
                                      Show email on profile
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Display your email address on your public profile
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id="showPhone"
                                    checked={formData.showPhone || false}
                                    onChange={(e) => handleFieldChange('showPhone', e.target.checked)}
                                    disabled={readOnly || isLoading}
                                  />
                                  <div className="flex-1">
                                    <label htmlFor="showPhone" className="text-sm font-medium text-gray-700 cursor-pointer">
                                      Show phone on profile
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Display your phone number on your public profile
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id="newsletter"
                                    checked={formData.newsletter || false}
                                    onChange={(e) => handleFieldChange('newsletter', e.target.checked)}
                                    disabled={readOnly || isLoading}
                                  />
                                  <div className="flex-1">
                                    <label htmlFor="newsletter" className="text-sm font-medium text-gray-700 cursor-pointer">
                                      Subscribe to newsletter
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Receive updates, tips, and exclusive offers via email
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Submit Error */}
            {errors.submit ? (
              <Alert variant="destructive">
                <XCircleIcon className="w-5 h-5" />
                <div className="ml-2">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{errors.submit}</p>
                </div>
              </Alert>
            ) : null}
          </CardContent>

          <CardFooter className="flex gap-3 bg-gray-50">
            {!readOnly ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges || isLoading}
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                
                <div className="flex-1" />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={onCancel}
                className="w-full"
              >
                Close
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfileForm;
