'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  PhoneIcon,
  EnvelopeIcon,
  FingerPrintIcon,
  LockClosedIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import {
  ShieldCheckIcon as ShieldCheckSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNotification } from '@/hooks/notification/useNotification';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TwoFactorMethod = 'app' | 'sms' | 'email' | 'hardware';

interface TwoFactorSettings {
  enabled: boolean;
  primaryMethod: TwoFactorMethod;
  backupMethods: TwoFactorMethod[];
  backupCodes: string[];
  backupCodesUsedCount: number;
  trustedDevices: TrustedDevice[];
  lastVerified?: Date;
  setupCompletedAt?: Date;
}

interface TrustedDevice {
  id: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  location: string;
  addedAt: Date;
  lastUsed: Date;
  expiresAt: Date;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface TwoFactorAuthProps {
  userId?: string;
  onSetupComplete?: () => void;
  onDisable?: () => void;
  className?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const generateMockBackupCodes = (): string[] => {
  return Array.from({ length: 10 }, () => {
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${part1}-${part2}`;
  });
};

const generateMockTrustedDevices = (): TrustedDevice[] => {
  const devices = [
    {
      name: 'Windows Desktop',
      deviceType: 'desktop' as const,
      browser: 'Chrome 120',
      os: 'Windows 11',
      location: 'New York, US',
    },
    {
      name: 'iPhone 15 Pro',
      deviceType: 'mobile' as const,
      browser: 'Safari Mobile',
      os: 'iOS 17',
      location: 'San Francisco, US',
    },
    {
      name: 'MacBook Pro',
      deviceType: 'desktop' as const,
      browser: 'Safari',
      os: 'macOS Sonoma',
      location: 'Seattle, US',
    },
  ];

  return devices.map((device, index) => ({
    id: `device-${index + 1}`,
    ...device,
    addedAt: new Date(Date.now() - (index + 1) * 7 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + (30 - index * 7) * 24 * 60 * 60 * 1000),
  }));
};

// ============================================================================
// COMPONENT
// ============================================================================

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  userId,
  onSetupComplete,
  onDisable,
  className,
}) => {
  const { user } = useAuth();
  const notification = useNotification();
  
  // Use userId with fallback to authenticated user
  const activeUserId = userId || user?.id;

  // ============================================================================
  // STATE
  // ============================================================================

  const [settings, setSettings] = useState<TwoFactorSettings>({
    enabled: false,
    primaryMethod: 'app',
    backupMethods: [],
    backupCodes: [],
    backupCodesUsedCount: 0,
    trustedDevices: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod>('app');
  
  // Setup states
  const [qrCode, setQrCode] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [showSecret, setShowSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCode, setCopiedBackupCode] = useState<string | null>(null);
  
  // Backup codes
  const [generatedBackupCodes, setGeneratedBackupCodes] = useState<string[]>([]);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);
  
  // Disable 2FA
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  
  // Trusted devices
  const [showTrustedDevicesModal, setShowTrustedDevicesModal] = useState(false);
  const [selectedDeviceToRemove, setSelectedDeviceToRemove] = useState<TrustedDevice | null>(null);
  const [autoTrustDevice, setAutoTrustDevice] = useState(false);
  
  // Method switching
  const [showMethodSwitchModal, setShowMethodSwitchModal] = useState(false);
  const [newMethod, setNewMethod] = useState<TwoFactorMethod>('app');

  // ============================================================================
  // SETUP STEPS
  // ============================================================================

  const setupSteps: SetupStep[] = useMemo(() => {
    const baseSteps: SetupStep[] = [
      {
        id: 'method',
        title: 'Choose Authentication Method',
        description: 'Select how you want to receive verification codes',
        completed: !!selectedMethod,
      },
    ];

    if (selectedMethod === 'app') {
      baseSteps.push(
        {
          id: 'scan-qr',
          title: 'Scan QR Code',
          description: 'Use your authenticator app to scan the QR code',
          completed: false,
        },
        {
          id: 'verify',
          title: 'Verify Setup',
          description: 'Enter the code from your authenticator app',
          completed: verificationCode.length === 6,
        }
      );
    } else if (selectedMethod === 'sms') {
      baseSteps.push(
        {
          id: 'phone',
          title: 'Add Phone Number',
          description: 'Enter your phone number to receive SMS codes',
          completed: phoneNumber.length >= 10,
        },
        {
          id: 'verify',
          title: 'Verify Number',
          description: 'Enter the verification code sent to your phone',
          completed: verificationCode.length === 6,
        }
      );
    } else if (selectedMethod === 'email') {
      baseSteps.push(
        {
          id: 'email',
          title: 'Confirm Email',
          description: 'Verify your email address for authentication',
          completed: email.length > 0,
        },
        {
          id: 'verify',
          title: 'Verify Email',
          description: 'Enter the verification code sent to your email',
          completed: verificationCode.length === 6,
        }
      );
    }

    baseSteps.push({
      id: 'backup-codes',
      title: 'Save Backup Codes',
      description: 'Download backup codes for account recovery',
      completed: backupCodesSaved,
    });

    return baseSteps;
  }, [selectedMethod, verificationCode, phoneNumber, email, backupCodesSaved]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call - Use activeUserId for fetching user-specific 2FA settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log user ID for debugging
      if (activeUserId) {
        console.log('Fetching 2FA settings for user:', activeUserId);
      }
      
      // Mock settings - 2FA enabled
      const mockSettings: TwoFactorSettings = {
        enabled: true,
        primaryMethod: 'app',
        backupMethods: ['sms'],
        backupCodes: generateMockBackupCodes(),
        backupCodesUsedCount: 2,
        trustedDevices: generateMockTrustedDevices(),
        lastVerified: new Date(Date.now() - 6 * 60 * 60 * 1000),
        setupCompletedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
      
      setSettings(mockSettings);
      
    } catch (error) {
      console.error('Failed to fetch 2FA settings:', error);
      notification.error('Failed to load two-factor authentication settings');
    } finally {
      setIsLoading(false);
    }
  }, [notification, activeUserId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ============================================================================
  // SETUP HANDLERS
  // ============================================================================

  const handleStartSetup = useCallback(() => {
    setShowSetupWizard(true);
    setCurrentStep(0);
    setSelectedMethod('app');
    setVerificationCode('');
    setPhoneNumber('');
    setEmail(user?.email || '');
    setBackupCodesSaved(false);
    
    // Generate QR code and secret
    const mockSecret = 'JBSWY3DPEHPK3PXP';
    const mockQR = `otpauth://totp/YourApp:${user?.email}?secret=${mockSecret}&issuer=YourApp`;
    setSecretKey(mockSecret);
    setQrCode(mockQR);
  }, [user]);

  const handleMethodSelect = useCallback((method: TwoFactorMethod) => {
    setSelectedMethod(method);
    setCurrentStep(1);
  }, []);

  const handleNextStep = useCallback(async () => {
    const step = setupSteps[currentStep];
    
    if (step.id === 'scan-qr' || step.id === 'phone' || step.id === 'email') {
      // Send verification code
      try {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        notification.success('Verification code sent');
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error('Send verification error:', error);
        notification.error('Failed to send verification code');
      } finally {
        setIsSaving(false);
      }
    } else if (step.id === 'verify') {
      // Verify code
      if (verificationCode === '123456') {
        notification.success('Verification successful');
        // Generate backup codes
        const codes = generateMockBackupCodes();
        setGeneratedBackupCodes(codes);
        setCurrentStep(currentStep + 1);
      } else {
        notification.error('Invalid verification code');
      }
    } else if (step.id === 'backup-codes') {
      // Complete setup
      try {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setSettings(prev => ({
          ...prev,
          enabled: true,
          primaryMethod: selectedMethod,
          backupCodes: generatedBackupCodes,
          setupCompletedAt: new Date(),
        }));
        
        notification.success('Two-factor authentication enabled successfully');
        setShowSetupWizard(false);
        onSetupComplete?.();
        
      } catch (error) {
        console.error('Enable 2FA error:', error);
        notification.error('Failed to enable two-factor authentication');
      } finally {
        setIsSaving(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, setupSteps, verificationCode, selectedMethod, generatedBackupCodes, notification, onSetupComplete]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  const handleDisable2FA = useCallback(async () => {
    if (!disablePassword) {
      notification.error('Please enter your password');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSettings(prev => ({
        ...prev,
        enabled: false,
        backupCodes: [],
        trustedDevices: [],
      }));
      
      notification.success('Two-factor authentication disabled');
      setShowDisableDialog(false);
      setDisablePassword('');
      onDisable?.();
      
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      notification.error('Failed to disable two-factor authentication');
    } finally {
      setIsSaving(false);
    }
  }, [disablePassword, notification, onDisable]);

  const handleCopySecret = useCallback(() => {
    navigator.clipboard.writeText(secretKey);
    setCopiedSecret(true);
    notification.success('Secret key copied to clipboard');
    setTimeout(() => setCopiedSecret(false), 2000);
  }, [secretKey, notification]);

  const handleCopyBackupCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBackupCode(code);
    notification.success('Backup code copied');
    setTimeout(() => setCopiedBackupCode(null), 2000);
  }, [notification]);

  const handleDownloadBackupCodes = useCallback(() => {
    const content = `Two-Factor Authentication Backup Codes
Generated: ${format(new Date(), 'PPpp')}

IMPORTANT: Store these codes in a safe place. Each code can only be used once.

${generatedBackupCodes.map((code, idx) => `${idx + 1}. ${code}`).join('\n')}

If you lose access to your authentication device, you can use these codes to log in.
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    notification.success('Backup codes downloaded');
    setBackupCodesSaved(true);
  }, [generatedBackupCodes, notification]);

  const handlePrintBackupCodes = useCallback(() => {
    const printContent = `
      <html>
        <head>
          <title>Two-Factor Authentication Backup Codes</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #333; }
            .code { font-family: monospace; font-size: 18px; padding: 8px; margin: 8px 0; }
            .warning { color: #d97706; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Two-Factor Authentication Backup Codes</h1>
          <p>Generated: ${format(new Date(), 'PPpp')}</p>
          <p><strong>IMPORTANT:</strong> Store these codes in a safe place. Each code can only be used once.</p>
          ${generatedBackupCodes.map((code, idx) => `<div class="code">${idx + 1}. ${code}</div>`).join('')}
          <p class="warning">If you lose access to your authentication device, you can use these codes to log in.</p>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    notification.success('Opening print dialog');
    setBackupCodesSaved(true);
  }, [generatedBackupCodes, notification]);

  const handleRemoveTrustedDevice = useCallback(async (device: TrustedDevice) => {
    try {
      setIsSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(prev => ({
        ...prev,
        trustedDevices: prev.trustedDevices.filter(d => d.id !== device.id),
      }));
      
      notification.success('Trusted device removed');
      setSelectedDeviceToRemove(null);
      
    } catch (error) {
      console.error('Failed to remove device:', error);
      notification.error('Failed to remove trusted device');
    } finally {
      setIsSaving(false);
    }
  }, [notification]);

  const handleSwitchMethod = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSettings(prev => ({
        ...prev,
        primaryMethod: newMethod,
      }));
      
      notification.success(`Authentication method switched to ${newMethod}`);
      setShowMethodSwitchModal(false);
      
    } catch (error) {
      console.error('Failed to switch method:', error);
      notification.error('Failed to switch authentication method');
    } finally {
      setIsSaving(false);
    }
  }, [newMethod, notification]);

  const handleRegenerateBackupCodes = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCodes = generateMockBackupCodes();
      setGeneratedBackupCodes(newCodes);
      setSettings(prev => ({
        ...prev,
        backupCodes: newCodes,
        backupCodesUsedCount: 0,
      }));
      
      setShowBackupCodesModal(true);
      notification.success('New backup codes generated');
      
    } catch (error) {
      console.error('Failed to regenerate codes:', error);
      notification.error('Failed to generate backup codes');
    } finally {
      setIsSaving(false);
    }
  }, [notification]);

  // ============================================================================
  // METHOD ICONS
  // ============================================================================

  const getMethodIcon = useCallback((method: TwoFactorMethod) => {
    switch (method) {
      case 'app':
        return <DevicePhoneMobileIcon className="w-5 h-5" />;
      case 'sms':
        return <PhoneIcon className="w-5 h-5" />;
      case 'email':
        return <EnvelopeIcon className="w-5 h-5" />;
      case 'hardware':
        return <FingerPrintIcon className="w-5 h-5" />;
    }
  }, []);

  const getMethodLabel = useCallback((method: TwoFactorMethod) => {
    switch (method) {
      case 'app':
        return 'Authenticator App';
      case 'sms':
        return 'SMS Text Message';
      case 'email':
        return 'Email Code';
      case 'hardware':
        return 'Hardware Security Key';
    }
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                Two-Factor Authentication
                {settings.enabled && (
                  <Badge variant="success" className="ml-2">
                    <CheckCircleSolidIcon className="w-4 h-4 mr-1" />
                    Enabled
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                Add an extra layer of security to your account by enabling two-factor authentication.
                You&apos;ll need to provide a verification code in addition to your password when logging in.
              </CardDescription>
            </div>
          </div>

          {settings.enabled && settings.lastVerified && (
            <Alert variant="success" className="mt-4">
              <CheckCircleSolidIcon className="w-5 h-5" />
              <AlertDescription>
                Two-factor authentication is active. Last verified: {formatDistanceToNow(settings.lastVerified, { addSuffix: true })}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {!settings.enabled ? (
            /* NOT ENABLED STATE */
            <div className="space-y-6">
              <Alert variant="warning">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <AlertDescription>
                  <p className="font-semibold">Two-factor authentication is not enabled</p>
                  <p className="text-sm mt-1">
                    Your account is vulnerable to unauthorized access. Enable 2FA to protect your account with an additional security layer.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheckSolidIcon className="w-5 h-5 text-blue-600" />
                  Why Enable Two-Factor Authentication?
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Adds an extra layer of security beyond just your password</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Protects against unauthorized access even if your password is compromised</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Receive alerts when someone tries to access your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Industry standard for securing online accounts</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleStartSetup}
                size="lg"
                className="w-full"
              >
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Enable Two-Factor Authentication
              </Button>
            </div>
          ) : (
            /* ENABLED STATE */
            <div className="space-y-6">
              {/* Current Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Primary Authentication Method</CardTitle>
                  <CardDescription>
                    This is your current method for receiving verification codes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary-100 rounded-lg">
                        {getMethodIcon(settings.primaryMethod)}
                      </div>
                      <div>
                        <p className="font-semibold">{getMethodLabel(settings.primaryMethod)}</p>
                        <p className="text-sm text-gray-600">
                          {settings.setupCompletedAt && `Enabled ${formatDistanceToNow(settings.setupCompletedAt, { addSuffix: true })}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowMethodSwitchModal(true)}
                    >
                      Switch Method
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Backup Methods */}
              {settings.backupMethods.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Backup Methods</CardTitle>
                    <CardDescription>
                      Alternative ways to authenticate if your primary method is unavailable
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {settings.backupMethods.map((method) => (
                        <div key={method} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-gray-200 rounded">
                            {getMethodIcon(method)}
                          </div>
                          <span className="font-medium">{getMethodLabel(method)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Preferred Backup Method</label>
                      <Select
                        value={settings.backupMethods[0] || 'sms'}
                        onValueChange={(value) => {
                          console.log('Preferred backup method changed:', value);
                          // In a real implementation, this would update the order of backup methods
                        }}
                        options={settings.backupMethods.map((method) => ({
                          value: method,
                          label: getMethodLabel(method),
                        }))}
                        placeholder="Select preferred backup method"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Backup Codes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <KeyIcon className="w-5 h-5" />
                    Backup Codes
                  </CardTitle>
                  <CardDescription>
                    Use backup codes to access your account if you lose your authentication device
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {settings.backupCodes.length - settings.backupCodesUsedCount} of {settings.backupCodes.length} codes remaining
                      </p>
                      <p className="text-sm text-gray-600">
                        {settings.backupCodesUsedCount} backup {settings.backupCodesUsedCount === 1 ? 'code' : 'codes'} used
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowBackupCodesModal(true)}
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View Codes
                      </Button>
                      <Button
                        onClick={handleRegenerateBackupCodes}
                        disabled={isSaving}
                      >
                        <ArrowPathIcon className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>

                  {settings.backupCodesUsedCount > settings.backupCodes.length / 2 && (
                    <Alert variant="warning">
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      <AlertDescription>
                        You have used more than half of your backup codes. Consider regenerating them soon.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <p className="text-xs text-gray-600">
                    💡 Tip: Store backup codes in a secure location like a password manager or safe
                  </p>
                </CardFooter>
              </Card>

              {/* Trusted Devices */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DevicePhoneMobileIcon className="w-5 h-5" />
                    Trusted Devices ({settings.trustedDevices.length})
                  </CardTitle>
                  <CardDescription>
                    Devices that don&apos;t require 2FA for 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {settings.trustedDevices.length > 0 ? (
                    <div className="space-y-2">
                      {settings.trustedDevices.slice(0, 3).map((device) => (
                        <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-200 rounded">
                              {device.deviceType === 'desktop' ? (
                                <DevicePhoneMobileIcon className="w-5 h-5" />
                              ) : (
                                <DevicePhoneMobileIcon className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{device.name}</p>
                              <p className="text-xs text-gray-600">
                                {device.browser} • {device.location} • Last used {formatDistanceToNow(device.lastUsed, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDeviceToRemove(device)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      {settings.trustedDevices.length > 3 && (
                        <Button
                          variant="outline"
                          onClick={() => setShowTrustedDevicesModal(true)}
                          className="w-full"
                        >
                          View All {settings.trustedDevices.length} Trusted Devices
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 text-center py-4">
                      No trusted devices yet
                    </p>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Auto-trust this device</span>
                      <Tooltip content="Automatically add this device to trusted devices when you log in successfully">
                        <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
                      </Tooltip>
                    </div>
                    <Switch
                      checked={autoTrustDevice}
                      onCheckedChange={(checked) => {
                        setAutoTrustDevice(checked);
                        console.log('Auto-trust device changed:', checked);
                        // In a real implementation, this would update settings
                      }}
                    />
                  </div>
                </CardFooter>
              </Card>

              {/* Security Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5" />
                    Security Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Keep your backup codes in a safe, offline location</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Never share your 2FA codes with anyone, including support staff</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Regularly review and remove old trusted devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Use an authenticator app for better security than SMS</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    Disable Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    This will make your account less secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => setShowDisableDialog(true)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Disable 2FA
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Wizard Modal */}
      <Modal
        open={showSetupWizard}
        onClose={() => setShowSetupWizard(false)}
        title="Enable Two-Factor Authentication"
        size="lg"
      >
        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {setupSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    )}
                  >
                    {index < currentStep ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <p className={cn(
                    'text-xs mt-2 text-center',
                    index === currentStep ? 'font-semibold' : 'text-gray-600'
                  )}>
                    {step.title}
                  </p>
                </div>
                {index < setupSteps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-[300px]"
            >
              {setupSteps[currentStep].id === 'method' && (
                <div className="space-y-4">
                  <p className="text-gray-700">{setupSteps[currentStep].description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['app', 'sms', 'email', 'hardware'] as TwoFactorMethod[]).map((method) => (
                      <button
                        key={method}
                        onClick={() => handleMethodSelect(method)}
                        className={cn(
                          'p-4 border-2 rounded-lg text-left transition-all hover:border-primary-300',
                          selectedMethod === method ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded">
                            {getMethodIcon(method)}
                          </div>
                          <div>
                            <p className="font-semibold">{getMethodLabel(method)}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {method === 'app' && 'Most secure option'}
                              {method === 'sms' && 'Quick and easy'}
                              {method === 'email' && 'Simple verification'}
                              {method === 'hardware' && 'Maximum security'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {setupSteps[currentStep].id === 'scan-qr' && (
                <div className="space-y-4">
                  <p className="text-gray-700">{setupSteps[currentStep].description}</p>
                  <Alert variant="info">
                    <InformationCircleIcon className="w-5 h-5" />
                    <AlertDescription>
                      <p className="font-semibold">Recommended Apps:</p>
                      <p className="text-sm">Google Authenticator, Authy, Microsoft Authenticator, 1Password</p>
                    </AlertDescription>
                  </Alert>
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
                      {qrCode ? (
                        <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                          <div className="text-center">
                            <QrCodeIcon className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-600">QR Code: {qrCode.substring(0, 30)}...</p>
                          </div>
                        </div>
                      ) : (
                        <QrCodeIcon className="w-48 h-48 text-gray-400" />
                      )}
                    </div>
                    <div className="w-full space-y-2">
                      <label className="text-sm font-medium">Or enter this secret key manually:</label>
                      <div className="flex gap-2">
                        <Input
                          value={secretKey}
                          readOnly
                          type={showSecret ? 'text' : 'password'}
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCopySecret}
                        >
                          {copiedSecret ? (
                            <ClipboardDocumentCheckIcon className="w-5 h-5" />
                          ) : (
                            <ClipboardDocumentIcon className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {setupSteps[currentStep].id === 'phone' && (
                <div className="space-y-4">
                  <p className="text-gray-700">{setupSteps[currentStep].description}</p>
                  <Input
                    type="tel"
                    label="Phone Number"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <Alert variant="info">
                    <InformationCircleIcon className="w-5 h-5" />
                    <AlertDescription>
                      <p className="text-sm">Standard messaging rates may apply. We&apos;ll only use this number for authentication.</p>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {setupSteps[currentStep].id === 'email' && (
                <div className="space-y-4">
                  <p className="text-gray-700">{setupSteps[currentStep].description}</p>
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Alert variant="info">
                    <InformationCircleIcon className="w-5 h-5" />
                    <AlertDescription>
                      <p className="text-sm">We&apos;ll send a verification code to this email address each time you log in.</p>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {setupSteps[currentStep].id === 'verify' && (
                <div className="space-y-4">
                  <p className="text-gray-700">{setupSteps[currentStep].description}</p>
                  <div className="flex flex-col items-center gap-4">
                    <Input
                      type="text"
                      label="Verification Code"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                    />
                    <Alert variant="info">
                      <InformationCircleIcon className="w-5 h-5" />
                      <AlertDescription>
                        <p className="text-sm">
                          {selectedMethod === 'app' && 'Enter the 6-digit code from your authenticator app'}
                          {selectedMethod === 'sms' && 'Enter the 6-digit code sent to your phone'}
                          {selectedMethod === 'email' && 'Enter the 6-digit code sent to your email'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">For testing, use code: 123456</p>
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}

              {setupSteps[currentStep].id === 'backup-codes' && (
                <div className="space-y-4">
                  <Alert variant="warning">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <AlertDescription>
                      <p className="font-semibold">Important: Save your backup codes</p>
                      <p className="text-sm">You&apos;ll need these codes to access your account if you lose your authentication device. Each code can only be used once.</p>
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                    {generatedBackupCodes.map((code, idx) => (
                      <div key={code} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="font-mono text-sm">{idx + 1}. {code}</span>
                        <button
                          onClick={() => handleCopyBackupCode(code)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedBackupCode === code ? (
                            <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-600" />
                          ) : (
                            <ClipboardDocumentIcon className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDownloadBackupCodes}
                      className="flex-1"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handlePrintBackupCodes}
                      className="flex-1"
                    >
                      <PrinterIcon className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={backupCodesSaved}
                      onChange={(e) => setBackupCodesSaved(e.target.checked)}
                      id="backup-saved"
                    />
                    <label htmlFor="backup-saved" className="text-sm cursor-pointer">
                      I have saved my backup codes in a safe place
                    </label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 0 || isSaving}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={
                isSaving ||
                (setupSteps[currentStep].id === 'backup-codes' && !backupCodesSaved) ||
                (setupSteps[currentStep].id === 'verify' && verificationCode.length !== 6)
              }
            >
              {isSaving ? (
                'Processing...'
              ) : currentStep === setupSteps.length - 1 ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Backup Codes Modal */}
      <Modal
        open={showBackupCodesModal}
        onClose={() => setShowBackupCodesModal(false)}
        title="Backup Codes"
        size="lg"
      >
        <div className="space-y-4">
          <Alert variant="warning">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <AlertDescription>
              Store these codes securely. Each code can only be used once.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
            {settings.backupCodes.map((code, idx) => (
              <div
                key={code}
                className={cn(
                  'flex items-center justify-between p-2 rounded border',
                  idx < settings.backupCodesUsedCount ? 'bg-gray-200 line-through opacity-50' : 'bg-white'
                )}
              >
                <span className="font-mono text-sm">{idx + 1}. {code}</span>
                {idx >= settings.backupCodesUsedCount && (
                  <button
                    onClick={() => handleCopyBackupCode(code)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedBackupCode === code ? (
                      <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <ClipboardDocumentIcon className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadBackupCodes} className="flex-1">
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handlePrintBackupCodes} className="flex-1">
              <PrinterIcon className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </Modal>

      {/* Trusted Devices Modal */}
      <Modal
        open={showTrustedDevicesModal}
        onClose={() => setShowTrustedDevicesModal(false)}
        title="Trusted Devices"
        size="lg"
      >
        <div className="space-y-3">
          {settings.trustedDevices.map((device) => (
            <div key={device.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-gray-100 rounded">
                    <DevicePhoneMobileIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{device.name}</p>
                    <p className="text-sm text-gray-600">{device.browser} on {device.os}</p>
                    <p className="text-xs text-gray-500 mt-1">{device.location}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span>Added {formatDistanceToNow(device.addedAt, { addSuffix: true })}</span>
                      <span>Last used {formatDistanceToNow(device.lastUsed, { addSuffix: true })}</span>
                      <span>Expires {formatDistanceToNow(device.expiresAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDeviceToRemove(device);
                    setShowTrustedDevicesModal(false);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Method Switch Modal */}
      <Modal
        open={showMethodSwitchModal}
        onClose={() => setShowMethodSwitchModal(false)}
        title="Switch Authentication Method"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-700">Choose a new primary authentication method:</p>
          <div className="space-y-2">
            {(['app', 'sms', 'email', 'hardware'] as TwoFactorMethod[]).map((method) => (
              <button
                key={method}
                onClick={() => setNewMethod(method)}
                disabled={method === settings.primaryMethod}
                className={cn(
                  'w-full p-4 border-2 rounded-lg text-left transition-all',
                  method === settings.primaryMethod
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : newMethod === method
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded">
                    {getMethodIcon(method)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{getMethodLabel(method)}</p>
                    {method === settings.primaryMethod && (
                      <Badge variant="success" className="mt-1">Current Method</Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowMethodSwitchModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSwitchMethod}
              disabled={isSaving || newMethod === settings.primaryMethod}
              className="flex-1"
            >
              {isSaving ? 'Switching...' : 'Switch Method'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Disable 2FA Dialog */}
      <Modal
        open={showDisableDialog}
        onClose={() => setShowDisableDialog(false)}
        title="Disable Two-Factor Authentication"
        size="lg"
      >
        <div className="space-y-4">
          <Alert variant="warning">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <AlertDescription>
              <p className="font-semibold">Warning: This will make your account less secure</p>
              <p className="text-sm">Disabling 2FA will remove the extra security layer from your account. You&apos;ll only need your password to log in.</p>
            </AlertDescription>
          </Alert>
          <Input
            type="password"
            label="Confirm your password to disable 2FA"
            placeholder="Enter your password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            leftIcon={<LockClosedIcon className="w-5 h-5" />}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowDisableDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleDisable2FA}
              disabled={isSaving || !disablePassword}
              variant="destructive"
              className="flex-1"
            >
              <XCircleIcon className="w-5 h-5 mr-2" />
              {isSaving ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Device Confirmation */}
      <ConfirmDialog
        open={!!selectedDeviceToRemove}
        onOpenChange={(open) => !open && setSelectedDeviceToRemove(null)}
        title="Remove Trusted Device?"
        description={`This device will need to verify with 2FA the next time it's used. Device: ${selectedDeviceToRemove?.name}`}
        confirmLabel="Remove Device"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (selectedDeviceToRemove) {
            await handleRemoveTrustedDevice(selectedDeviceToRemove);
          }
        }}
        isLoading={isSaving}
      />
    </>
  );
};

export default TwoFactorAuth;
