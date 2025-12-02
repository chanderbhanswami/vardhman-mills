'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QuestionMarkCircleIcon,
  BugAntIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  TruckIcon,
  UserIcon,
  ShoppingBagIcon,
  Cog8ToothIcon,
  ClockIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

// Types and Interfaces
export type HelpRequestType = 'question' | 'bug_report' | 'feature_request' | 'account_issue' | 'billing' | 'shipping' | 'technical' | 'general';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type FormStep = 'category' | 'details' | 'contact' | 'review' | 'submitted';

export interface HelpFormAttachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  file: File;
  size: number;
  preview?: string;
}

export interface HelpFormData {
  // Category step
  type: HelpRequestType;
  category: string;
  priority: Priority;

  // Details step
  subject: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  browserInfo?: string;
  deviceInfo?: string;
  attachments: HelpFormAttachment[];

  // Contact step
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  preferredContact: 'email' | 'phone' | 'chat';
  urgencyLevel: 'can_wait' | 'business_hours' | 'urgent';

  // Additional
  orderId?: string;
  accountId?: string;
  previousTicketId?: string;
  tags: string[];
  agreeToTerms: boolean;
  allowFollowUp: boolean;
}

export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  type: HelpRequestType;
  fields: string[];
  estimatedResponse: string;
}

export interface HelpFormProps {
  onSubmit?: (data: HelpFormData) => void;
  onStepChange?: (step: FormStep, data: Partial<HelpFormData>) => void;
  initialData?: Partial<HelpFormData>;
  maxAttachments?: number;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
  showProgressBar?: boolean;
  enableAutoSave?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'wizard';
  enableAnimations?: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const stepVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  }
};

// Help categories data
const helpCategories: HelpCategory[] = [
  {
    id: 'account',
    name: 'Account Issues',
    description: 'Login problems, password reset, profile settings',
    icon: UserIcon,
    type: 'account_issue',
    fields: ['subject', 'description', 'accountId'],
    estimatedResponse: '2-4 hours'
  },
  {
    id: 'billing',
    name: 'Billing & Payments',
    description: 'Payment issues, invoices, refunds, subscription',
    icon: CreditCardIcon,
    type: 'billing',
    fields: ['subject', 'description', 'orderId'],
    estimatedResponse: '1-2 business days'
  },
  {
    id: 'orders',
    name: 'Orders & Shopping',
    description: 'Order status, cancellations, product questions',
    icon: ShoppingBagIcon,
    type: 'general',
    fields: ['subject', 'description', 'orderId'],
    estimatedResponse: '4-6 hours'
  },
  {
    id: 'shipping',
    name: 'Shipping & Delivery',
    description: 'Tracking, delivery issues, shipping options',
    icon: TruckIcon,
    type: 'general',
    fields: ['subject', 'description', 'orderId'],
    estimatedResponse: '2-4 hours'
  },
  {
    id: 'technical',
    name: 'Technical Support',
    description: 'Website issues, mobile app problems, bugs',
    icon: Cog8ToothIcon,
    type: 'technical',
    fields: ['subject', 'description', 'stepsToReproduce', 'browserInfo'],
    estimatedResponse: '1-3 business days'
  },
  {
    id: 'bug',
    name: 'Report a Bug',
    description: 'Something is not working as expected',
    icon: BugAntIcon,
    type: 'bug_report',
    fields: ['subject', 'description', 'stepsToReproduce', 'expectedBehavior', 'actualBehavior'],
    estimatedResponse: '2-5 business days'
  },
  {
    id: 'feature',
    name: 'Feature Request',
    description: 'Suggest new features or improvements',
    icon: QuestionMarkCircleIcon,
    type: 'feature_request',
    fields: ['subject', 'description'],
    estimatedResponse: '1-2 weeks'
  },
  {
    id: 'general',
    name: 'General Inquiry',
    description: 'Other questions or general support',
    icon: ChatBubbleLeftRightIcon,
    type: 'general',
    fields: ['subject', 'description'],
    estimatedResponse: '1-2 business days'
  }
];

// Utility functions
const getPriorityConfig = (priority: Priority) => {
  const configs = {
    low: {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'Low',
      description: 'General questions, not urgent'
    },
    medium: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      label: 'Medium',
      description: 'Issue affects work but workaround exists'
    },
    high: {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      label: 'High',
      description: 'Issue significantly affects operations'
    },
    urgent: {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: 'Urgent',
      description: 'Critical issue affecting business'
    }
  };
  return configs[priority];
};

const validateStep = (step: FormStep, data: Partial<HelpFormData>) => {
  const errors: Record<string, string> = {};

  switch (step) {
    case 'category':
      if (!data.type) errors.type = 'Please select a category';
      if (!data.priority) errors.priority = 'Please select priority level';
      break;

    case 'details':
      if (!data.subject?.trim()) errors.subject = 'Subject is required';
      if (!data.description?.trim()) errors.description = 'Description is required';
      if (data.type === 'bug_report') {
        if (!data.stepsToReproduce?.trim()) errors.stepsToReproduce = 'Steps to reproduce are required for bug reports';
        if (!data.expectedBehavior?.trim()) errors.expectedBehavior = 'Expected behavior is required for bug reports';
        if (!data.actualBehavior?.trim()) errors.actualBehavior = 'Actual behavior is required for bug reports';
      }
      break;

    case 'contact':
      if (!data.firstName?.trim()) errors.firstName = 'First name is required';
      if (!data.lastName?.trim()) errors.lastName = 'Last name is required';
      if (!data.email?.trim()) errors.email = 'Email is required';
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (data.preferredContact === 'phone' && !data.phone?.trim()) {
        errors.phone = 'Phone number is required when phone is preferred contact method';
      }
      break;

    case 'review':
      if (!data.agreeToTerms) errors.agreeToTerms = 'Please agree to terms and conditions';
      break;
  }

  return errors;
};

const getStepProgress = (currentStep: FormStep) => {
  const steps = ['category', 'details', 'contact', 'review', 'submitted'];
  const currentIndex = steps.indexOf(currentStep);
  return ((currentIndex + 1) / steps.length) * 100;
};

// Main Component
const HelpForm: React.FC<HelpFormProps> = ({
  onSubmit,
  onStepChange,
  initialData = {},
  maxAttachments = 5,
  maxFileSize = 10,
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', '.doc', '.docx'],
  showProgressBar = true,
  enableAutoSave = true,
  className,
  enableAnimations = true
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('category');
  const [formData, setFormData] = useState<Partial<HelpFormData>>({
    type: 'general',
    priority: 'medium',
    attachments: [],
    tags: [],
    preferredContact: 'email',
    urgencyLevel: 'business_hours',
    agreeToTerms: false,
    allowFollowUp: true,
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (enableAutoSave && Object.keys(formData).length > 0) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('helpFormData', JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, enableAutoSave]);

  // Load saved data
  useEffect(() => {
    if (enableAutoSave) {
      const savedData = localStorage.getItem('helpFormData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Failed to parse saved form data:', error);
        }
      }
    }
  }, [enableAutoSave]);

  // Handle input changes
  const handleInputChange = (field: keyof HelpFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: HelpCategory) => {
    setSelectedCategory(category);
    handleInputChange('type', category.type);
    handleInputChange('category', category.id);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentAttachments = formData.attachments || [];

    if (currentAttachments.length + files.length > maxAttachments) {
      setErrors(prev => ({ ...prev, attachments: `Maximum ${maxAttachments} files allowed` }));
      return;
    }

    const oversizedFiles = files.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({ ...prev, attachments: `Files must be smaller than ${maxFileSize}MB` }));
      return;
    }

    const newAttachments: HelpFormAttachment[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      file,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    handleInputChange('attachments', [...currentAttachments, ...newAttachments]);
    setErrors(prev => ({ ...prev, attachments: '' }));
  };

  // Remove attachment
  const removeAttachment = (id: string) => {
    const updatedAttachments = (formData.attachments || []).filter(att => att.id !== id);
    handleInputChange('attachments', updatedAttachments);
  };

  // Navigate steps
  const goToNextStep = () => {
    const stepErrors = validateStep(currentStep, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setErrors({});
    const steps: FormStep[] = ['category', 'details', 'contact', 'review', 'submitted'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      onStepChange?.(nextStep, formData);
    }
  };

  const goToPreviousStep = () => {
    const steps: FormStep[] = ['category', 'details', 'contact', 'review', 'submitted'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      setCurrentStep(prevStep);
      onStepChange?.(prevStep, formData);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    const stepErrors = validateStep('review', formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(formData as HelpFormData);
      setCurrentStep('submitted');
      if (enableAutoSave) {
        localStorage.removeItem('helpFormData');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'category':
        return (
          <motion.div
            variants={enableAnimations ? stepVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we help you?</h2>
              <p className="text-gray-600">Select the category that best describes your request</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {helpCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                    'hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                    selectedCategory?.id === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <category.icon className="h-6 w-6 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm">
                          Response: {category.estimatedResponse}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((priority) => {
                    const config = getPriorityConfig(priority);
                    return (
                      <button
                        key={priority}
                        onClick={() => handleInputChange('priority', priority)}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all duration-200',
                          'hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
                          formData.priority === priority
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        )}
                      >
                        <div className="text-center">
                          <div className={cn('text-sm font-medium', config.color)}>
                            {config.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {config.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.priority && (
                  <p className="text-sm text-red-600 mt-1">{errors.priority}</p>
                )}
              </div>
            )}
          </motion.div>
        );

      case 'details':
        return (
          <motion.div
            variants={enableAnimations ? stepVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us more</h2>
              <p className="text-gray-600">Provide details about your request</p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <Input
                type="text"
                placeholder="Brief description of your issue"
                value={formData.subject || ''}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className={errors.subject ? 'border-red-300' : ''}
              />
              {errors.subject && (
                <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <TextArea
                placeholder="Please describe your issue in detail..."
                rows={4}
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={errors.description ? 'border-red-300' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Bug report specific fields */}
            {formData.type === 'bug_report' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Steps to Reproduce *
                  </label>
                  <TextArea
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. Notice that..."
                    rows={3}
                    value={formData.stepsToReproduce || ''}
                    onChange={(e) => handleInputChange('stepsToReproduce', e.target.value)}
                    className={errors.stepsToReproduce ? 'border-red-300' : ''}
                  />
                  {errors.stepsToReproduce && (
                    <p className="text-sm text-red-600 mt-1">{errors.stepsToReproduce}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Behavior *
                    </label>
                    <TextArea
                      placeholder="What should happen?"
                      rows={3}
                      value={formData.expectedBehavior || ''}
                      onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
                      className={errors.expectedBehavior ? 'border-red-300' : ''}
                    />
                    {errors.expectedBehavior && (
                      <p className="text-sm text-red-600 mt-1">{errors.expectedBehavior}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Behavior *
                    </label>
                    <TextArea
                      placeholder="What actually happens?"
                      rows={3}
                      value={formData.actualBehavior || ''}
                      onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
                      className={errors.actualBehavior ? 'border-red-300' : ''}
                    />
                    {errors.actualBehavior && (
                      <p className="text-sm text-red-600 mt-1">{errors.actualBehavior}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Technical details */}
            {(formData.type === 'bug_report' || formData.type === 'technical') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Browser Info
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Chrome 91.0.4472.124"
                    value={formData.browserInfo || ''}
                    onChange={(e) => handleInputChange('browserInfo', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Info
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., iPhone 12, Windows 10"
                    value={formData.deviceInfo || ''}
                    onChange={(e) => handleInputChange('deviceInfo', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Order/Account IDs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID (if applicable)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., ORD-123456"
                  value={formData.orderId || ''}
                  onChange={(e) => handleInputChange('orderId', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Ticket ID (if any)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., TKT-789012"
                  value={formData.previousTicketId || ''}
                  onChange={(e) => handleInputChange('previousTicketId', e.target.value)}
                />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (max {maxAttachments}, {maxFileSize}MB each)
              </label>
              <div className="space-y-3">
                {/* File Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept={allowedFileTypes.join(',')}
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="Upload files"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={(formData.attachments?.length || 0) >= maxAttachments}
                  >
                    <PhotoIcon className="h-4 w-4 mr-2" />
                    Add Files
                  </Button>
                  <span className="text-xs text-gray-500">
                    Images, PDF, DOC files
                  </span>
                </div>

                {/* Attachment List */}
                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        {attachment.type === 'image' ? (
                          <PhotoIcon className="h-5 w-5 text-blue-500" />
                        ) : (
                          <DocumentIcon className="h-5 w-5 text-red-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.attachments && (
                  <p className="text-sm text-red-600">{errors.attachments}</p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 'contact':
        return (
          <motion.div
            variants={enableAnimations ? stepVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-gray-600">How can we reach you with updates?</p>
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <Input
                  type="text"
                  placeholder="John"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-300' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <Input
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-300' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-300' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone & Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-300' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company (optional)
                </label>
                <Input
                  type="text"
                  placeholder="Company Name"
                  value={formData.company || ''}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
            </div>

            {/* Preferred Contact Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Contact Method
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'email', label: 'Email', icon: EnvelopeIcon },
                  { value: 'phone', label: 'Phone', icon: PhoneIcon },
                  { value: 'chat', label: 'Live Chat', icon: ChatBubbleLeftRightIcon }
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => handleInputChange('preferredContact', method.value)}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-2',
                      'hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
                      formData.preferredContact === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    )}
                  >
                    <method.icon className="h-5 w-5" />
                    <span className="font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How urgent is this request?
              </label>
              <Select
                options={[
                  { value: 'can_wait', label: 'Can wait - No rush' },
                  { value: 'business_hours', label: 'Business hours - Normal priority' },
                  { value: 'urgent', label: 'Urgent - Needs immediate attention' }
                ]}
                value={formData.urgencyLevel || 'business_hours'}
                onValueChange={(value) => handleInputChange('urgencyLevel', value)}
                placeholder="Select urgency level..."
              />
            </div>
          </motion.div>
        );

      case 'review':
        return (
          <motion.div
            variants={enableAnimations ? stepVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Request</h2>
              <p className="text-gray-600">Please review your information before submitting</p>
            </div>

            {/* Summary */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Request Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{selectedCategory?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <Badge className={getPriorityConfig(formData.priority!).bgColor} size="sm">
                    {getPriorityConfig(formData.priority!).label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium text-right max-w-xs truncate">{formData.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact:</span>
                  <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attachments:</span>
                    <span className="font-medium">{formData.attachments.length} file(s)</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Terms and Conditions */}
            <div className="space-y-3">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms || false}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to the <a href="/terms" className="text-primary hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> *
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
              )}

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={formData.allowFollowUp || false}
                  onChange={(e) => handleInputChange('allowFollowUp', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I allow follow-up questions to help resolve my request
                </span>
              </label>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}
          </motion.div>
        );

      case 'submitted':
        return (
          <motion.div
            variants={enableAnimations ? stepVariants : undefined}
            initial="hidden"
            animate="visible"
            className="text-center py-8"
          >
            <CheckCircleIconSolid className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for contacting us. We&apos;ve received your request and will get back to you soon.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-sm text-gray-600 mb-2">Your ticket reference:</p>
              <p className="font-mono font-bold text-lg text-gray-900">
                TKT-{Date.now().toString().slice(-6)}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p>Expected response time: <strong>{selectedCategory?.estimatedResponse}</strong></p>
              <p className="mt-2">We&apos;ll send updates to: <strong>{formData.email}</strong></p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('max-w-3xl mx-auto', className)}>
      {/* Progress Bar */}
      {showProgressBar && currentStep !== 'submitted' && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(getStepProgress(currentStep))}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out",
                getStepProgress(currentStep) >= 25 && "w-1/4",
                getStepProgress(currentStep) >= 50 && "w-1/2",
                getStepProgress(currentStep) >= 75 && "w-3/4",
                getStepProgress(currentStep) >= 100 && "w-full",
                getStepProgress(currentStep) < 25 && "w-0"
              )}
            />
          </div>
        </div>
      )}

      {/* Form Content */}
      <motion.div
        variants={enableAnimations ? containerVariants : undefined}
        initial="hidden"
        animate="visible"
      >
        <Card className="p-6">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          {/* Navigation */}
          {currentStep !== 'submitted' && (
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 'category'}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === 'review' ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={goToNextStep}>
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default HelpForm;
