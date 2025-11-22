'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  ClockIcon,
  UserMinusIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNotification } from '@/hooks/notification/useNotification';
import { formatDate } from '@/lib/formatters';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AccountDeactivationProps {
  /** User ID */
  userId?: string;
  
  /** Callback when deactivation is successful */
  onDeactivationSuccess?: () => void;
  
  /** Callback when deactivation is cancelled */
  onCancel?: () => void;
  
  /** Show as modal */
  showAsModal?: boolean;
  
  /** Allow account deletion */
  allowDeletion?: boolean;
  
  /** Require feedback */
  requireFeedback?: boolean;
  
  /** Custom reasons */
  customReasons?: DeactivationReason[];
  
  /** Additional CSS classes */
  className?: string;
}

export interface DeactivationReason {
  id: string;
  label: string;
  description?: string;
  requireDetails?: boolean;
  category: 'common' | 'privacy' | 'technical' | 'other';
}

export interface DeactivationData {
  reason: string;
  details?: string;
  feedback?: string;
  keepData: boolean;
  subscribeNewsletter: boolean;
  allowReactivation: boolean;
  scheduledDate?: Date;
}

interface DeactivationStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_REASONS: DeactivationReason[] = [
  {
    id: 'not_using',
    label: "I'm not using the account anymore",
    category: 'common',
    requireDetails: false,
  },
  {
    id: 'too_many_emails',
    label: 'Too many emails',
    category: 'common',
    requireDetails: false,
  },
  {
    id: 'privacy_concerns',
    label: 'Privacy concerns',
    description: 'Worried about data privacy and security',
    category: 'privacy',
    requireDetails: true,
  },
  {
    id: 'found_alternative',
    label: 'Found a better alternative',
    category: 'common',
    requireDetails: true,
  },
  {
    id: 'technical_issues',
    label: 'Technical issues',
    description: 'Experiencing bugs or performance problems',
    category: 'technical',
    requireDetails: true,
  },
  {
    id: 'poor_experience',
    label: 'Poor user experience',
    category: 'common',
    requireDetails: true,
  },
  {
    id: 'cost_concerns',
    label: 'Cost or pricing concerns',
    category: 'common',
    requireDetails: false,
  },
  {
    id: 'account_compromise',
    label: 'Account security compromised',
    description: 'Believe my account has been compromised',
    category: 'privacy',
    requireDetails: true,
  },
  {
    id: 'temporary_break',
    label: 'Taking a temporary break',
    category: 'common',
    requireDetails: false,
  },
  {
    id: 'other',
    label: 'Other reason',
    category: 'other',
    requireDetails: true,
  },
];

const DEACTIVATION_STEPS: Omit<DeactivationStep, 'completed'>[] = [
  {
    id: 1,
    title: 'Select Reason',
    description: 'Tell us why you want to deactivate',
    icon: InformationCircleIcon,
  },
  {
    id: 2,
    title: 'Review Consequences',
    description: 'Understand what happens to your data',
    icon: ShieldExclamationIcon,
  },
  {
    id: 3,
    title: 'Confirm Decision',
    description: 'Verify your identity and confirm',
    icon: CheckCircleIcon,
  },
];

const CONSEQUENCES = [
  {
    id: 'profile_hidden',
    title: 'Profile will be hidden',
    description: 'Your profile will no longer be visible to other users',
    icon: EyeSlashIcon,
    severity: 'warning' as const,
  },
  {
    id: 'login_disabled',
    title: 'Login access disabled',
    description: "You won't be able to log in with your credentials",
    icon: UserMinusIcon,
    severity: 'destructive' as const,
  },
  {
    id: 'data_retained',
    title: 'Data retained for 30 days',
    description: 'You can reactivate within 30 days with all data intact',
    icon: ClockIcon,
    severity: 'info' as const,
  },
  {
    id: 'subscriptions_cancelled',
    title: 'Subscriptions will be cancelled',
    description: 'All active subscriptions and notifications will stop',
    icon: XCircleIcon,
    severity: 'warning' as const,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AccountDeactivation: React.FC<AccountDeactivationProps> = ({
  userId: userIdProp,
  onDeactivationSuccess,
  onCancel,
  showAsModal = false,
  allowDeletion = false,
  requireFeedback = true,
  customReasons,
  className,
}) => {
  const { user, logout } = useAuth();
  const activeUserId = userIdProp || user?.id;
  const toast = useNotification();

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [feedback, setFeedback] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepData, setKeepData] = useState(true);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [allowReactivation, setAllowReactivation] = useState(true);
  const [scheduleDeactivation, setScheduleDeactivation] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Computed values
  const reasons = useMemo(
    () => customReasons || DEFAULT_REASONS,
    [customReasons]
  );

  const selectedReasonData = useMemo(
    () => reasons.find((r) => r.id === selectedReason),
    [reasons, selectedReason]
  );

  const steps: DeactivationStep[] = useMemo(
    () =>
      DEACTIVATION_STEPS.map((step) => ({
        ...step,
        completed: step.id < currentStep,
      })),
    [currentStep]
  );

  const progress = useMemo(
    () => ((currentStep - 1) / (DEACTIVATION_STEPS.length - 1)) * 100,
    [currentStep]
  );

  const canProceedStep1 = useMemo(() => {
    if (!selectedReason) return false;
    if (selectedReasonData?.requireDetails && !reasonDetails.trim()) {
      return false;
    }
    return true;
  }, [selectedReason, selectedReasonData, reasonDetails]);

  const canProceedStep2 = useMemo(() => {
    if (requireFeedback && !feedback.trim()) return false;
    return true;
  }, [requireFeedback, feedback]);

  const canProceedStep3 = useMemo(() => {
    if (!password.trim()) return false;
    if (!agreeTerms) return false;
    if (scheduleDeactivation && !scheduledDate) return false;
    return true;
  }, [password, agreeTerms, scheduleDeactivation, scheduledDate]);

  // Handlers
  const handleReasonSelect = useCallback((reasonId: string) => {
    setSelectedReason(reasonId);
    setReasonDetails('');
    setErrors((prev) => ({ ...prev, reason: '' }));
  }, []);

  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && !canProceedStep1) {
      setErrors((prev) => ({
        ...prev,
        reason: 'Please select a reason and provide details if required',
      }));
      return;
    }

    if (currentStep === 2 && !canProceedStep2) {
      setErrors((prev) => ({
        ...prev,
        feedback: 'Please provide feedback before proceeding',
      }));
      return;
    }

    if (currentStep < DEACTIVATION_STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      setErrors({});
    }
  }, [currentStep, canProceedStep1, canProceedStep2]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
    }
  }, [currentStep]);

  const handleDeactivate = useCallback(async () => {
    if (!canProceedStep3) {
      toast?.error('Please complete all required fields');
      return;
    }

    setIsProcessing(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const deactivationData: DeactivationData = {
        reason: selectedReason,
        details: reasonDetails,
        feedback,
        keepData,
        subscribeNewsletter,
        allowReactivation,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      };

      console.log('Deactivating account with data:', deactivationData, 'User ID:', activeUserId, 'Modal:', showAsModal);

      setShowConfirmation(true);

      // Call success callback after showing confirmation
      setTimeout(() => {
        if (onDeactivationSuccess) {
          onDeactivationSuccess();
        } else {
          logout();
        }
      }, 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to deactivate account';
      setErrors({ submit: errorMessage });
      toast?.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [
    canProceedStep3,
    selectedReason,
    reasonDetails,
    feedback,
    keepData,
    subscribeNewsletter,
    allowReactivation,
    scheduledDate,
    activeUserId,
    showAsModal,
    toast,
    onDeactivationSuccess,
    logout,
  ]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const handleDeleteAccount = useCallback(async () => {
    if (!window.confirm('Are you absolutely sure? This action cannot be undone!')) {
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast?.success('Account deletion initiated');
      logout();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete account';
      toast?.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [toast, logout]);

  // Render success confirmation
  if (showConfirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('max-w-2xl mx-auto', className)}
      >
        <Card>
          <CardContent className="pt-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Deactivated
            </h2>
            <p className="text-gray-600 mb-4">
              {scheduleDeactivation && scheduledDate ? (
                <>
                  Your account will be deactivated on{' '}
                  {formatDate(new Date(scheduledDate))}
                </>
              ) : (
                <>Your account has been successfully deactivated</>
              )}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                You have 30 days to reactivate your account by logging in again.
                After 30 days, your data will be permanently deleted.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              You will be logged out in a moment...
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Deactivate Account
            </h1>
            <p className="text-gray-600">
              We&apos;re sorry to see you go. Please help us understand why.
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex items-center',
                  index < steps.length - 1 && 'flex-1'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                      step.completed
                        ? 'bg-green-500 border-green-500'
                        : currentStep === step.id
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300'
                    )}
                  >
                    {step.completed ? (
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    ) : (
                      <step.icon
                        className={cn(
                          'w-5 h-5',
                          currentStep === step.id ? 'text-white' : 'text-gray-400'
                        )}
                      />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        currentStep === step.id
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      )}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 ? (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-4',
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    )}
                  />
                ) : null}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 ? (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Why are you leaving?</h2>
                <p className="text-sm text-gray-600">
                  Your feedback helps us improve our service
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {reasons.map((reason) => (
                    <motion.button
                      key={reason.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleReasonSelect(reason.id)}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 text-left transition-colors',
                        selectedReason === reason.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {reason.label}
                          </p>
                          {reason.description ? (
                            <p className="text-sm text-gray-600 mt-1">
                              {reason.description}
                            </p>
                          ) : null}
                        </div>
                        <Badge
                          variant={
                            reason.category === 'privacy'
                              ? 'destructive'
                              : reason.category === 'technical'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="ml-2"
                        >
                          {reason.category}
                        </Badge>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {selectedReasonData?.requireDetails ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please provide more details *
                    </label>
                    <textarea
                      value={reasonDetails}
                      onChange={(e) => setReasonDetails(e.target.value)}
                      placeholder="Tell us more about your reason..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </motion.div>
                ) : null}

                {errors.reason ? (
                  <Alert variant="destructive">{errors.reason}</Alert>
                ) : null}
              </CardContent>
            </Card>
          ) : currentStep === 2 ? (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  What happens to your account?
                </h2>
                <p className="text-sm text-gray-600">
                  Please review the following information carefully
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Consequences */}
                <div className="space-y-3">
                  {CONSEQUENCES.map((consequence) => (
                    <Alert key={consequence.id} variant={consequence.severity}>
                      <div className="flex items-start gap-3">
                        <consequence.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{consequence.title}</p>
                          <p className="text-sm mt-1">{consequence.description}</p>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>

                {/* Options */}
                <div className="space-y-4 pt-4 border-t">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={keepData}
                      onChange={(e) => setKeepData(e.target.checked)}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Keep my data for reactivation
                      </p>
                      <p className="text-sm text-gray-600">
                        Store my account data for 30 days in case I want to come
                        back
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={allowReactivation}
                      onChange={(e) => setAllowReactivation(e.target.checked)}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Allow account reactivation
                      </p>
                      <p className="text-sm text-gray-600">
                        I may want to reactivate my account in the future
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={subscribeNewsletter}
                      onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Keep me updated via email
                      </p>
                      <p className="text-sm text-gray-600">
                        Receive occasional updates about new features and
                        improvements
                      </p>
                    </div>
                  </label>
                </div>

                {/* Feedback */}
                {requireFeedback ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final feedback (required) *
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Is there anything we could have done better?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                    {errors.feedback ? (
                      <p className="text-sm text-red-600 mt-1">{errors.feedback}</p>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Confirm deactivation</h2>
                <p className="text-sm text-gray-600">
                  Enter your password to confirm this action
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Schedule option */}
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={scheduleDeactivation}
                      onChange={(e) => setScheduleDeactivation(e.target.checked)}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Schedule deactivation for later
                      </p>
                      <p className="text-sm text-gray-600">
                        Choose a future date for account deactivation
                      </p>
                    </div>
                  </label>

                  {scheduleDeactivation ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="max-w-xs"
                      />
                    </motion.div>
                  ) : null}
                </div>

                {/* Password confirmation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm with password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms agreement */}
                <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <div>
                    <p className="text-sm text-gray-900">
                      I understand that deactivating my account will:
                    </p>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                      <li>Hide my profile from other users</li>
                      <li>Cancel all active subscriptions</li>
                      <li>Disable login access</li>
                      <li>
                        {keepData
                          ? 'Keep my data for 30 days for reactivation'
                          : 'Permanently delete my data after 30 days'}
                      </li>
                    </ul>
                  </div>
                </label>

                {errors.submit ? (
                  <Alert variant="destructive">{errors.submit}</Alert>
                ) : null}

                {/* Delete account option */}
                {allowDeletion ? (
                  <Alert variant="destructive">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">Permanent deletion</p>
                        <p className="text-sm mt-1">
                          If you want to permanently delete your account
                          immediately, click the button on the right. This action
                          cannot be undone.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteAccount}
                        disabled={isProcessing}
                        className="ml-4"
                      >
                        Delete Now
                      </Button>
                    </div>
                  </Alert>
                ) : null}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <Card className="mt-6">
        <CardFooter className="flex items-center justify-between">
          <div className="flex gap-3">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={isProcessing}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Previous
              </Button>
            ) : null}
            <Button variant="ghost" onClick={handleCancel} disabled={isProcessing}>
              Cancel
            </Button>
          </div>

          <div>
            {currentStep < DEACTIVATION_STEPS.length ? (
              <Button
                onClick={handleNextStep}
                disabled={
                  isProcessing ||
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2)
                }
              >
                Continue
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                disabled={!canProceedStep3 || isProcessing}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : scheduleDeactivation && scheduledDate ? (
                  <>Schedule Deactivation</>
                ) : (
                  <>Deactivate Account</>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountDeactivation;
