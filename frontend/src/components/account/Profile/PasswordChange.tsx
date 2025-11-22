'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  KeyIcon,
  ArrowPathIcon,
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
import { formatDate } from '@/lib/formatters';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PasswordChangeProps {
  /** User ID */
  userId?: string;
  
  /** Show as modal */
  showAsModal?: boolean;
  
  /** Callback when password changed successfully */
  onPasswordChanged?: () => void;
  
  /** Callback when operation is cancelled */
  onCancel?: () => void;
  
  /** Require current password */
  requireCurrentPassword?: boolean;
  
  /** Enable 2FA setup after change */
  enable2FAPrompt?: boolean;
  
  /** Show password strength meter */
  showStrengthMeter?: boolean;
  
  /** Show password requirements */
  showRequirements?: boolean;
  
  /** Allow password generation */
  allowGeneration?: boolean;
  
  /** Minimum password length */
  minLength?: number;
  
  /** Custom CSS class */
  className?: string;
}

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  met: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  percentage: number;
  feedback: string[];
}

interface PasswordHistory {
  id: string;
  changedAt: string;
  method: 'manual' | 'reset' | 'forced' | 'expired';
  ipAddress?: string;
  device?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PASSWORD_REQUIREMENTS: Omit<PasswordRequirement, 'met'>[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    validator: (password: string) => password.length >= 8,
    icon: CheckCircleIcon,
  },
  {
    id: 'uppercase',
    label: 'Contains uppercase letter',
    validator: (password: string) => /[A-Z]/.test(password),
    icon: CheckCircleIcon,
  },
  {
    id: 'lowercase',
    label: 'Contains lowercase letter',
    validator: (password: string) => /[a-z]/.test(password),
    icon: CheckCircleIcon,
  },
  {
    id: 'number',
    label: 'Contains number',
    validator: (password: string) => /[0-9]/.test(password),
    icon: CheckCircleIcon,
  },
  {
    id: 'special',
    label: 'Contains special character (!@#$%^&*)',
    validator: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    icon: CheckCircleIcon,
  },
  {
    id: 'no-common',
    label: 'Not a common password',
    validator: (password: string) => {
      const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'letmein', 'admin', 'welcome'];
      return !commonPasswords.includes(password.toLowerCase());
    },
    icon: ShieldCheckIcon,
  },
];

const STRENGTH_LEVELS: Record<number, { label: string; color: string; feedback: string }> = {
  0: { label: 'Very Weak', color: 'bg-red-500', feedback: 'This password is too weak. Please choose a stronger password.' },
  1: { label: 'Weak', color: 'bg-orange-500', feedback: 'This password could be stronger. Add more characters and complexity.' },
  2: { label: 'Fair', color: 'bg-yellow-500', feedback: 'This password is acceptable but could be improved.' },
  3: { label: 'Good', color: 'bg-blue-500', feedback: 'This is a good password. Consider adding more special characters.' },
  4: { label: 'Strong', color: 'bg-green-500', feedback: 'Excellent! This is a strong password.' },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const PasswordChange: React.FC<PasswordChangeProps> = ({
  userId: userIdProp,
  showAsModal = false,
  onPasswordChanged,
  onCancel,
  requireCurrentPassword = true,
  enable2FAPrompt = true,
  showStrengthMeter = true,
  showRequirements = true,
  allowGeneration = true,
  minLength = 8,
  className,
}) => {
  const { user, changePassword } = useAuth();
  const notification = useNotification();
  const activeUserId = userIdProp || user?.id;

  // ============================================================================
  // STATE
  // ============================================================================

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [show2FAPrompt, setShow2FAPrompt] = useState(false);
  
  const [logoutOtherDevices, setLogoutOtherDevices] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [enable2FA, setEnable2FA] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([]);
  const [lastChanged, setLastChanged] = useState<string | null>(null);

  // ============================================================================
  // PASSWORD STRENGTH CALCULATION
  // ============================================================================

  const passwordStrength = useMemo<PasswordStrength>(() => {
    if (!newPassword) {
      return {
        score: 0,
        label: 'None',
        color: 'bg-gray-300',
        percentage: 0,
        feedback: [],
      };
    }

    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (newPassword.length >= minLength) score++;
    if (newPassword.length >= 12) score++;
    else if (newPassword.length < minLength) {
      feedback.push(`Password should be at least ${minLength} characters`);
    }

    // Character variety
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score++;
    else feedback.push('Use both uppercase and lowercase letters');

    if (/[0-9]/.test(newPassword)) score++;
    else feedback.push('Add numbers to your password');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;
    else feedback.push('Include special characters for better security');

    // Common password check
    const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'letmein'];
    if (commonPasswords.includes(newPassword.toLowerCase())) {
      score = Math.max(0, score - 2);
      feedback.push('Avoid common passwords');
    }

    // Sequential characters
    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(newPassword)) {
      score = Math.max(0, score - 1);
      feedback.push('Avoid sequential characters');
    }

    // Repeated characters
    if (/(.)\1{2,}/.test(newPassword)) {
      score = Math.max(0, score - 1);
      feedback.push('Avoid repeated characters');
    }

    const finalScore = Math.min(4, Math.max(0, score - 1));
    const level = STRENGTH_LEVELS[finalScore];

    return {
      score: finalScore,
      label: level.label,
      color: level.color,
      percentage: (finalScore / 4) * 100,
      feedback: feedback.length > 0 ? feedback : [level.feedback],
    };
  }, [newPassword, minLength]);

  // ============================================================================
  // PASSWORD REQUIREMENTS VALIDATION
  // ============================================================================

  const requirements = useMemo<PasswordRequirement[]>(() => {
    return PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      met: req.validator(newPassword),
    }));
  }, [newPassword]);

  const allRequirementsMet = useMemo(() => {
    return requirements.every(req => req.met);
  }, [requirements]);

  // ============================================================================
  // FORM VALIDATION
  // ============================================================================

  const validateForm = useCallback(() => {
    setIsValidating(true);
    const newErrors: Record<string, string> = {};

    if (requireCurrentPassword && !currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < minLength) {
      newErrors.newPassword = `Password must be at least ${minLength} characters`;
    } else if (!allRequirementsMet) {
      newErrors.newPassword = 'Password does not meet all requirements';
    } else if (passwordStrength.score < 2) {
      newErrors.newPassword = 'Password is too weak. Please choose a stronger password';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    setIsValidating(false);
    return Object.keys(newErrors).length === 0;
  }, [currentPassword, newPassword, confirmPassword, requireCurrentPassword, minLength, allRequirementsMet, passwordStrength.score]);

  const canSubmit = useMemo(() => {
    return (
      (!requireCurrentPassword || currentPassword.trim().length > 0) &&
      newPassword.trim().length >= minLength &&
      confirmPassword === newPassword &&
      allRequirementsMet &&
      passwordStrength.score >= 2
    );
  }, [requireCurrentPassword, currentPassword, newPassword, confirmPassword, minLength, allRequirementsMet, passwordStrength.score]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleGeneratePassword = useCallback(() => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()'[Math.floor(Math.random() * 10)];
    
    // Fill remaining length
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setNewPassword(password);
    setConfirmPassword(password);
    setShowNewPassword(true);
    setShowConfirmPassword(true);
    
    notification.success('A strong password has been generated for you', {
      duration: 3000,
    });
  }, [notification]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notification.error('Please fix the errors before submitting', {
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Changing password:', {
        userId: activeUserId,
        currentPassword: '***',
        newPassword: '***',
        logoutOtherDevices,
        sendNotification,
        showAsModal,
      });

      // Mock password history
      const newHistory: PasswordHistory = {
        id: `history-${Date.now()}`,
        changedAt: new Date().toISOString(),
        method: 'manual',
        ipAddress: '192.168.1.1',
        device: 'Chrome on Windows',
      };
      
      setPasswordHistory(prev => [newHistory, ...prev.slice(0, 4)]);
      setLastChanged(new Date().toISOString());

      if (changePassword) {
        await changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });
      }

      notification.success('Password changed successfully', {
        duration: 3000,
      });

      setShowSuccessScreen(true);
      
      if (enable2FAPrompt && enable2FA) {
        setTimeout(() => {
          setShow2FAPrompt(true);
        }, 2000);
      } else {
        setTimeout(() => {
          onPasswordChanged?.();
        }, 3000);
      }

    } catch (error) {
      console.error('Password change error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to change password. Please try again.',
      });
      
      notification.error('Failed to change password. Please try again.', {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, activeUserId, logoutOtherDevices, sendNotification, showAsModal, enable2FA, enable2FAPrompt, changePassword, notification, onPasswordChanged, currentPassword, newPassword, confirmPassword]);

  const handleCancel = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setTouched({});
    onCancel?.();
  }, [onCancel]);

  const handleFieldBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  }, [validateForm]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Fetch password history
    const fetchHistory = async () => {
      try {
        // Mock data
        const mockHistory: PasswordHistory[] = [
          {
            id: 'history-1',
            changedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            method: 'manual',
            ipAddress: '192.168.1.100',
            device: 'Firefox on macOS',
          },
          {
            id: 'history-2',
            changedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            method: 'reset',
            ipAddress: '192.168.1.50',
            device: 'Safari on iOS',
          },
        ];
        
        setPasswordHistory(mockHistory);
        if (mockHistory.length > 0) {
          setLastChanged(mockHistory[0].changedAt);
        }
      } catch (error) {
        console.error('Error fetching password history:', error);
      }
    };

    if (activeUserId) {
      fetchHistory();
    }
  }, [activeUserId]);

  useEffect(() => {
    if (touched.newPassword || touched.confirmPassword) {
      validateForm();
    }
  }, [newPassword, confirmPassword, touched.newPassword, touched.confirmPassword, validateForm]);

  // ============================================================================
  // RENDER - SUCCESS SCREEN
  // ============================================================================

  if (showSuccessScreen && !show2FAPrompt) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
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
              Password Changed Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been updated. You can now use your new password to log in.
            </p>
            
            {logoutOtherDevices ? (
              <Alert className="mb-4">
                <InformationCircleIcon className="w-5 h-5" />
                <div className="ml-2">
                  <p className="font-medium">Other devices logged out</p>
                  <p className="text-sm text-gray-600">
                    You&apos;ve been logged out from all other devices for security.
                  </p>
                </div>
              </Alert>
            ) : null}
            
            <div className="text-sm text-gray-500">
              Redirecting in 3 seconds...
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </AnimatePresence>
    );
  }

  // ============================================================================
  // RENDER - 2FA PROMPT
  // ============================================================================

  if (show2FAPrompt) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn('p-8', className)}
      >
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Enable Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-700 mb-4">
              Now that you&apos;ve changed your password, we recommend enabling two-factor 
              authentication to make your account even more secure.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Protect your account from unauthorized access
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Receive alerts about suspicious login attempts
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Easy setup with authenticator apps or SMS
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onPasswordChanged?.()}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                notification.success('Setting up two-factor authentication...', {
                  duration: 3000,
                });
                setTimeout(() => onPasswordChanged?.(), 1000);
              }}
              className="flex-1"
            >
              Enable 2FA
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // ============================================================================
  // RENDER - MAIN FORM
  // ============================================================================

  return (
    <div className={cn('w-full', className)}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <LockClosedIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-600">
                  {lastChanged
                    ? `Last changed ${formatDate(lastChanged)}`
                    : 'Update your account password'}
                </p>
              </div>
            </div>
            
            {allowGeneration ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeneratePassword}
                disabled={isLoading}
              >
                <KeyIcon className="w-4 h-4 mr-2" />
                Generate
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Current Password */}
            {requireCurrentPassword ? (
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    onBlur={() => handleFieldBlur('currentPassword')}
                    placeholder="Enter your current password"
                    disabled={isLoading}
                    className={cn(
                      'pr-10',
                      touched.currentPassword && errors.currentPassword && 'border-red-500'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {touched.currentPassword && errors.currentPassword ? (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                ) : null}
              </div>
            ) : null}

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => handleFieldBlur('newPassword')}
                  placeholder="Enter your new password"
                  disabled={isLoading}
                  className={cn(
                    'pr-10',
                    touched.newPassword && errors.newPassword && 'border-red-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {touched.newPassword && errors.newPassword ? (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              ) : null}

              {/* Password Strength Meter */}
              {showStrengthMeter && newPassword ? (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Password Strength:
                    </span>
                    <Badge
                      variant={passwordStrength.score >= 3 ? 'success' : passwordStrength.score >= 2 ? 'warning' : 'destructive'}
                    >
                      {passwordStrength.label}
                    </Badge>
                  </div>
                  <Progress value={passwordStrength.percentage} className="h-2" />
                  <div className="mt-2 space-y-1">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <p key={index} className="text-xs text-gray-600 flex items-start gap-1">
                        <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {feedback}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleFieldBlur('confirmPassword')}
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                  className={cn(
                    'pr-10',
                    touched.confirmPassword && errors.confirmPassword && 'border-red-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword ? (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              ) : null}
            </div>

            {/* Password Requirements */}
            {showRequirements && newPassword ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Password Requirements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {requirements.map((req) => {
                    const Icon = req.met ? CheckCircleIcon : XCircleIcon;
                    return (
                      <div
                        key={req.id}
                        className={cn(
                          'flex items-center gap-2 text-sm',
                          req.met ? 'text-green-600' : 'text-gray-500'
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{req.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Additional Options */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">Additional Options</h4>
              
              <div className="flex items-start gap-3">
                <Checkbox
                  id="logoutOtherDevices"
                  checked={logoutOtherDevices}
                  onChange={(e) => setLogoutOtherDevices(e.target.checked)}
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <label
                    htmlFor="logoutOtherDevices"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Log out from all other devices
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    You will be logged out from all devices except this one
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="sendNotification"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <label
                    htmlFor="sendNotification"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Send me an email notification
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Get notified about this password change via email
                  </p>
                </div>
              </div>

              {enable2FAPrompt ? (
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="enable2FA"
                    checked={enable2FA}
                    onChange={(e) => setEnable2FA(e.target.checked)}
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="enable2FA"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Enable two-factor authentication
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Password History */}
            {passwordHistory.length > 0 ? (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Changes</h4>
                <div className="space-y-2">
                  {passwordHistory.slice(0, 3).map((history) => (
                    <div
                      key={history.id}
                      className="flex items-start justify-between text-xs text-gray-600 bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-start gap-2">
                        <ArrowPathIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-700">
                            Password {history.method === 'manual' ? 'changed' : history.method}
                          </p>
                          <p className="text-gray-500">
                            {history.device} • {history.ipAddress}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-500 whitespace-nowrap">
                        {formatDate(history.changedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Error Alert */}
            {errors.submit ? (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <div className="ml-2">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{errors.submit}</p>
                </div>
              </Alert>
            ) : null}
          </CardContent>

          <CardFooter className="flex gap-3 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isLoading || isValidating}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <LockClosedIcon className="w-4 h-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PasswordChange;
