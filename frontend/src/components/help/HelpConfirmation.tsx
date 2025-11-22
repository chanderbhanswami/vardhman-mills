'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  CheckIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ChevronRightIcon,
  CalendarIcon,
  TagIcon,
  IdentificationIcon,
  ClipboardDocumentIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid
} from '@heroicons/react/24/solid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Types and Interfaces
export type ConfirmationType = 'success' | 'error' | 'warning' | 'info' | 'pending';

export interface ConfirmationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface ConfirmationDetail {
  label: string;
  value: string | React.ReactNode;
  type?: 'text' | 'email' | 'phone' | 'date' | 'currency' | 'link' | 'badge';
  copyable?: boolean;
}

export interface ConfirmationStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
  timestamp?: string;
  details?: string;
}

export interface HelpConfirmationProps {
  type: ConfirmationType;
  title: string;
  message: string;
  description?: string;
  confirmationId?: string;
  timestamp?: string;
  details?: ConfirmationDetail[];
  steps?: ConfirmationStep[];
  actions?: ConfirmationAction[];
  onClose?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  showActions?: boolean;
  showDetails?: boolean;
  showSteps?: boolean;
  showTimestamp?: boolean;
  showConfirmationId?: boolean;
  autoClose?: boolean;
  autoCloseDuration?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'detailed';
  enableAnimations?: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

const progressVariants = {
  hidden: { width: 0 },
  visible: { 
    width: '100%',
    transition: { duration: 2, ease: [0.4, 0, 0.2, 1] }
  }
} as const;

// Utility functions
const getTypeConfig = (type: ConfirmationType) => {
  const configs = {
    success: {
      icon: CheckCircleIconSolid,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      badgeColor: 'bg-green-100 text-green-800'
    },
    error: {
      icon: XCircleIconSolid,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      badgeColor: 'bg-red-100 text-red-800'
    },
    warning: {
      icon: ExclamationTriangleIconSolid,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      badgeColor: 'bg-yellow-100 text-yellow-800'
    },
    info: {
      icon: InformationCircleIconSolid,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    pending: {
      icon: ClockIcon,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      badgeColor: 'bg-gray-100 text-gray-800'
    }
  };
  return configs[type];
};

const getStepStatusConfig = (status: ConfirmationStep['status']) => {
  const configs = {
    completed: {
      icon: CheckCircleIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    current: {
      icon: ClockIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    pending: {
      icon: ClockIcon,
      color: 'text-gray-400',
      bgColor: 'bg-gray-100'
    },
    failed: {
      icon: XCircleIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    }
  };
  return configs[status];
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

const formatDetailValue = (detail: ConfirmationDetail) => {
  const { value, type } = detail;
  
  if (typeof value !== 'string') return value;
  
  switch (type) {
    case 'date':
      return format(new Date(value), 'PPP');
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(parseFloat(value));
    case 'phone':
      return value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    case 'badge':
      return <Badge variant="outline" size="sm">{value}</Badge>;
    case 'link':
      return (
        <a 
          href={value} 
          className="text-blue-600 hover:text-blue-800 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {value}
        </a>
      );
    default:
      return value;
  }
};

// Main Component
const HelpConfirmation: React.FC<HelpConfirmationProps> = ({
  type,
  title,
  message,
  description,
  confirmationId,
  timestamp = new Date().toISOString(),
  details = [],
  steps = [],
  actions = [],
  onClose,
  onPrint,
  onDownload,
  onShare,
  showActions = true,
  showDetails = true,
  showSteps = true,
  showTimestamp = true,
  showConfirmationId = true,
  autoClose = false,
  autoCloseDuration = 5000,
  className,
  size = 'md',
  variant = 'default',
  enableAnimations = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [autoCloseProgress, setAutoCloseProgress] = useState(0);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const config = getTypeConfig(type);

  // Handle close
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  }, [onClose]);

  // Auto-close functionality
  useEffect(() => {
    if (!autoClose) return;

    const interval = setInterval(() => {
      setAutoCloseProgress(prev => {
        const newProgress = prev + (100 / (autoCloseDuration / 100));
        if (newProgress >= 100) {
          handleClose();
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [autoClose, autoCloseDuration, handleClose]);

  // Handle copy
  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    const sizeMap = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
    };
    return sizeMap[size];
  };

  // Default actions
  const defaultActions: ConfirmationAction[] = [
    {
      id: 'print',
      label: 'Print',
      type: 'ghost',
      icon: PrinterIcon,
      onClick: onPrint
    },
    {
      id: 'download',
      label: 'Download',
      type: 'ghost',
      icon: ArrowDownTrayIcon,
      onClick: onDownload
    },
    {
      id: 'share',
      label: 'Share',
      type: 'ghost',
      icon: ShareIcon,
      onClick: onShare
    }
  ];

  const allActions = [...actions, ...defaultActions.filter(action => 
    !actions.some(a => a.id === action.id)
  )];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={enableAnimations ? containerVariants : undefined}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn(
          'mx-auto',
          getSizeClasses(),
          className
        )}
      >
        <Card className={cn(
          'relative overflow-hidden',
          config.borderColor,
          variant === 'detailed' && config.bgColor
        )}>
          {/* Auto-close progress bar */}
          {autoClose && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
              <motion.div
                className="h-full bg-blue-500"
                variants={enableAnimations ? progressVariants : undefined}
                initial="hidden"
                animate="visible"
                style={{ width: `${autoCloseProgress}%` }}
              />
            </div>
          )}

          {/* Close button */}
          {onClose && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              title="Close confirmation"
              aria-label="Close confirmation"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>
          )}

          <div className="p-6">
            {/* Header */}
            <motion.div
              variants={enableAnimations ? itemVariants : undefined}
              className="flex items-start gap-4 mb-6"
            >
              <div className={cn('p-2 rounded-full', config.bgColor)}>
                <config.icon className={cn('h-8 w-8', config.color)} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {title}
                </h2>
                <p className="text-gray-700 mb-2">{message}</p>
                {description && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </div>
            </motion.div>

            {/* Confirmation ID and Timestamp */}
            {(showConfirmationId || showTimestamp) && (
              <motion.div
                variants={enableAnimations ? itemVariants : undefined}
                className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600"
              >
                {showConfirmationId && confirmationId && (
                  <div className="flex items-center gap-2">
                    <IdentificationIcon className="h-4 w-4" />
                    <span>ID: {confirmationId}</span>
                    <button
                      onClick={() => handleCopy(confirmationId, 'confirmation-id')}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy confirmation ID"
                      aria-label="Copy confirmation ID to clipboard"
                    >
                      <ClipboardDocumentIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {showTimestamp && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(new Date(timestamp), 'PPpp')}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Details */}
            {showDetails && details.length > 0 && (
              <motion.div
                variants={enableAnimations ? itemVariants : undefined}
                className="mb-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
                <div className="space-y-3">
                  {details.map((detail, index) => {
                    const getDetailIcon = () => {
                      if (detail.label.toLowerCase().includes('email')) return EnvelopeIcon;
                      if (detail.label.toLowerCase().includes('phone')) return PhoneIcon;
                      if (detail.label.toLowerCase().includes('chat')) return ChatBubbleLeftRightIcon;
                      if (detail.label.toLowerCase().includes('tag')) return TagIcon;
                      if (detail.label.toLowerCase().includes('id')) return IdentificationIcon;
                      return ChevronRightIcon;
                    };
                    
                    const DetailIcon = getDetailIcon();
                    
                    return (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-2">
                          <DetailIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">
                            {detail.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">
                            {formatDetailValue(detail)}
                          </span>
                          {detail.copyable && typeof detail.value === 'string' && (
                            <button
                              onClick={() => handleCopy(detail.value as string, `detail-${index}`)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Copy to clipboard"
                              aria-label="Copy to clipboard"
                            >
                              {copiedItems.has(`detail-${index}`) ? (
                                <CheckCircleIcon className="h-3 w-3 text-green-500" />
                              ) : (
                                <ClipboardDocumentIcon className="h-3 w-3 text-gray-400" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Steps */}
            {showSteps && steps.length > 0 && (
              <motion.div
                variants={enableAnimations ? itemVariants : undefined}
                className="mb-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Progress</h3>
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const stepConfig = getStepStatusConfig(step.status);
                    return (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className={cn('p-1 rounded-full', stepConfig.bgColor)}>
                          <stepConfig.icon className={cn('h-4 w-4', stepConfig.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {step.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              size="sm"
                              className={cn(
                                'text-xs',
                                step.status === 'completed' && 'bg-green-100 text-green-800',
                                step.status === 'current' && 'bg-blue-100 text-blue-800',
                                step.status === 'pending' && 'bg-gray-100 text-gray-800',
                                step.status === 'failed' && 'bg-red-100 text-red-800'
                              )}
                            >
                              Step {index + 1}
                            </Badge>
                          </div>
                          {step.description && (
                            <p className="text-sm text-gray-600 mb-1">
                              {step.description}
                            </p>
                          )}
                          {(step.timestamp || step.details) && (
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {step.timestamp && (
                                <span>{formatDistanceToNow(new Date(step.timestamp), { addSuffix: true })}</span>
                              )}
                              {step.details && <span>{step.details}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            {showActions && allActions.length > 0 && (
              <motion.div
                variants={enableAnimations ? itemVariants : undefined}
                className="flex flex-wrap gap-3 pt-4 border-t border-gray-200"
              >
                {allActions.map((action) => {
                  const ActionIcon = action.icon || (
                    action.type === 'primary' ? CheckIcon :
                    action.type === 'danger' ? ExclamationTriangleIcon :
                    action.type === 'secondary' ? InformationCircleIcon :
                    action.type === 'ghost' ? DocumentCheckIcon :
                    ShieldCheckIcon
                  );
                  
                  return (
                    <Button
                      key={action.id}
                      variant={action.type === 'primary' ? 'default' : 
                              action.type === 'danger' ? 'destructive' : 
                              action.type === 'ghost' ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={action.onClick}
                      disabled={action.disabled || action.loading}
                      className="flex items-center gap-2"
                    >
                      <ActionIcon className="h-4 w-4" />
                      {action.label}
                    </Button>
                  );
                })}
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default HelpConfirmation;
