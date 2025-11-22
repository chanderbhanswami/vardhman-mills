import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  bio?: string;
  website?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  preferences?: {
    newsletter?: boolean;
    smsNotifications?: boolean;
    emailNotifications?: boolean;
  };
}

export interface UpdateAvatarData {
  avatar: File | string;
}

export interface VerificationRequest {
  type: 'email' | 'phone';
  value?: string; // New email or phone number
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface UseUpdateProfileOptions {
  onSuccess?: (updatedProfile: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
  validateOnChange?: boolean;
}

export const useUpdateProfile = (options: UseUpdateProfileOptions = {}) => {
  const { onSuccess, onError, validateOnChange = true } = options;
  
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [pendingChanges, setPendingChanges] = useState<UpdateProfileData>({});

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: UpdateProfileData): Promise<Record<string, unknown>> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to update profile');
      }

      // Validate data before sending
      const errors = validateProfileData(profileData);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate some validation scenarios
      if (profileData.username && profileData.username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (profileData.phoneNumber && !/^\+?[\d\s-()]{10,}$/.test(profileData.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Return updated profile data
      return {
        ...user,
        ...profileData,
        updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: (updatedProfile) => {
      // Update the profile cache
      queryClient.setQueryData(['profile', user?.id], (oldData: Record<string, unknown>) => ({
        ...oldData,
        ...updatedProfile,
      }));

      // Also update auth cache if needed
      queryClient.setQueryData(['auth', 'user'], (oldUser: Record<string, unknown>) => ({
        ...oldUser,
        ...updatedProfile,
      }));

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast.success('Profile updated successfully!', { duration: 3000, icon: '👤' });
      setValidationErrors([]);
      setPendingChanges({});
      
      onSuccess?.(updatedProfile);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage, { duration: 4000 });
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    },
  });

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarData: UpdateAvatarData): Promise<string> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to update avatar');
      }

      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      let avatarUrl: string;

      if (typeof avatarData.avatar === 'string') {
        avatarUrl = avatarData.avatar;
      } else {
        // Simulate file upload and return URL
        const fileSize = avatarData.avatar.size;
        const fileType = avatarData.avatar.type;

        // Validation
        if (fileSize > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('File size must be less than 5MB');
        }

        if (!fileType.startsWith('image/')) {
          throw new Error('File must be an image');
        }

        // Mock uploaded URL
        avatarUrl = `/uploads/avatars/${user.id}_${Date.now()}.jpg`;
      }

      return avatarUrl;
    },
    onSuccess: (avatarUrl) => {
      // Update profile cache with new avatar
      queryClient.setQueryData(['profile', user?.id], (oldData: Record<string, unknown>) => ({
        ...oldData,
        avatar: avatarUrl,
        updatedAt: new Date().toISOString(),
      }));

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile photo updated!', { duration: 2000, icon: '📷' });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update avatar';
      toast.error(errorMessage, { duration: 4000 });
    },
  });

  // Send verification mutation
  const sendVerificationMutation = useMutation({
    mutationFn: async (verificationData: VerificationRequest): Promise<void> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to request verification');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`Sending ${verificationData.type} verification to ${verificationData.value || 'current'}`);
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Verification ${variables.type === 'email' ? 'email' : 'SMS'} sent successfully!`,
        { duration: 3000, icon: variables.type === 'email' ? '📧' : '📱' }
      );
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification';
      toast.error(errorMessage, { duration: 4000 });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: { 
      currentPassword: string; 
      newPassword: string; 
      confirmPassword: string; 
    }): Promise<void> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to change password');
      }

      // Validation
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New password and confirmation do not match');
      }

      if (passwordData.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      if (passwordData.currentPassword === passwordData.newPassword) {
        throw new Error('New password must be different from current password');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Simulate current password validation
      if (passwordData.currentPassword !== 'correct_password') {
        throw new Error('Current password is incorrect');
      }
    },
    onSuccess: () => {
      toast.success('Password changed successfully!', { duration: 3000, icon: '🔐' });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(errorMessage, { duration: 4000 });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (confirmationData: { 
      password: string; 
      confirmation: string; 
      reason?: string; 
    }): Promise<void> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to delete account');
      }

      if (confirmationData.confirmation !== 'DELETE') {
        throw new Error('You must type "DELETE" to confirm account deletion');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate password validation
      if (confirmationData.password !== 'correct_password') {
        throw new Error('Password is incorrect');
      }
    },
    onSuccess: () => {
      // Clear all cache data
      queryClient.clear();
      toast.success('Account deleted successfully', { duration: 3000, icon: '👋' });
      // Redirect would happen here
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account';
      toast.error(errorMessage, { duration: 4000 });
    },
  });

  // Validation function
  const validateProfileData = useCallback((data: UpdateProfileData): ValidationError[] => {
    const errors: ValidationError[] = [];

    // First name validation
    if (data.firstName !== undefined) {
      if (!data.firstName.trim()) {
        errors.push({ field: 'firstName', message: 'First name is required' });
      } else if (data.firstName.length < 2) {
        errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
      } else if (!/^[a-zA-Z\s'.-]+$/.test(data.firstName)) {
        errors.push({ field: 'firstName', message: 'First name contains invalid characters' });
      }
    }

    // Last name validation
    if (data.lastName !== undefined) {
      if (!data.lastName.trim()) {
        errors.push({ field: 'lastName', message: 'Last name is required' });
      } else if (data.lastName.length < 2) {
        errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters' });
      } else if (!/^[a-zA-Z\s'.-]+$/.test(data.lastName)) {
        errors.push({ field: 'lastName', message: 'Last name contains invalid characters' });
      }
    }

    // Username validation
    if (data.username !== undefined) {
      if (data.username && data.username.length < 3) {
        errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
      } else if (data.username && !/^[a-zA-Z0-9_.-]+$/.test(data.username)) {
        errors.push({ field: 'username', message: 'Username can only contain letters, numbers, dots, hyphens, and underscores' });
      }
    }

    // Phone number validation
    if (data.phoneNumber !== undefined && data.phoneNumber) {
      if (!/^\+?[\d\s-()]{10,}$/.test(data.phoneNumber)) {
        errors.push({ field: 'phoneNumber', message: 'Invalid phone number format' });
      }
    }

    // Date of birth validation
    if (data.dateOfBirth !== undefined && data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (isNaN(birthDate.getTime())) {
        errors.push({ field: 'dateOfBirth', message: 'Invalid date format' });
      } else if (birthDate > today) {
        errors.push({ field: 'dateOfBirth', message: 'Date of birth cannot be in the future' });
      } else if (age < 13) {
        errors.push({ field: 'dateOfBirth', message: 'You must be at least 13 years old' });
      } else if (age > 120) {
        errors.push({ field: 'dateOfBirth', message: 'Invalid date of birth' });
      }
    }

    // Website validation
    if (data.website !== undefined && data.website) {
      try {
        new URL(data.website);
      } catch {
        errors.push({ field: 'website', message: 'Invalid website URL' });
      }
    }

    // Bio validation
    if (data.bio !== undefined && data.bio && data.bio.length > 500) {
      errors.push({ field: 'bio', message: 'Bio must be less than 500 characters' });
    }

    // Social links validation
    if (data.socialLinks) {
      Object.entries(data.socialLinks).forEach(([platform, url]) => {
        if (url && url.trim()) {
          // Basic URL validation
          if (!url.includes('.') || url.length < 4) {
            errors.push({ 
              field: `socialLinks.${platform}`, 
              message: `Invalid ${platform} URL` 
            });
          }
        }
      });
    }

    return errors;
  }, []);

  // Update pending changes and validate if needed
  const updateField = useCallback((field: keyof UpdateProfileData, value: unknown) => {
    const newChanges = { ...pendingChanges, [field]: value };
    setPendingChanges(newChanges);

    if (validateOnChange) {
      const errors = validateProfileData(newChanges);
      setValidationErrors(errors);
    }
  }, [pendingChanges, validateOnChange, validateProfileData]);

  // Batch update multiple fields
  const updateFields = useCallback((updates: UpdateProfileData) => {
    const newChanges = { ...pendingChanges, ...updates };
    setPendingChanges(newChanges);

    if (validateOnChange) {
      const errors = validateProfileData(newChanges);
      setValidationErrors(errors);
    }
  }, [pendingChanges, validateOnChange, validateProfileData]);

  // Clear pending changes
  const clearPendingChanges = useCallback(() => {
    setPendingChanges({});
    setValidationErrors([]);
  }, []);

  // Get validation error for specific field
  const getFieldError = useCallback((field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  }, [validationErrors]);

  // Check if field has error
  const hasFieldError = useCallback((field: string) => {
    return validationErrors.some(error => error.field === field);
  }, [validationErrors]);

  // Action functions
  const updateProfile = useCallback(async (data?: UpdateProfileData) => {
    const dataToUpdate = data || pendingChanges;
    return updateProfileMutation.mutateAsync(dataToUpdate);
  }, [updateProfileMutation, pendingChanges]);

  const updateAvatar = useCallback(async (avatar: File | string) => {
    return updateAvatarMutation.mutateAsync({ avatar });
  }, [updateAvatarMutation]);

  const sendVerification = useCallback(async (type: 'email' | 'phone', value?: string) => {
    return sendVerificationMutation.mutateAsync({ type, value });
  }, [sendVerificationMutation]);

  const changePassword = useCallback(async (
    currentPassword: string, 
    newPassword: string, 
    confirmPassword: string
  ) => {
    return changePasswordMutation.mutateAsync({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  }, [changePasswordMutation]);

  const deleteAccount = useCallback(async (
    password: string, 
    confirmation: string, 
    reason?: string
  ) => {
    return deleteAccountMutation.mutateAsync({
      password,
      confirmation,
      reason,
    });
  }, [deleteAccountMutation]);

  return {
    // Data
    pendingChanges,
    validationErrors,
    
    // Validation helpers
    getFieldError,
    hasFieldError,
    validateProfileData,
    
    // Field updates
    updateField,
    updateFields,
    clearPendingChanges,
    
    // Actions
    updateProfile,
    updateAvatar,
    sendVerification,
    changePassword,
    deleteAccount,
    
    // Loading states
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingAvatar: updateAvatarMutation.isPending,
    isSendingVerification: sendVerificationMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,
    
    // Status
    hasChanges: Object.keys(pendingChanges).length > 0,
    hasErrors: validationErrors.length > 0,
    isValid: validationErrors.length === 0,
    
    // Stats
    stats: {
      pendingFields: Object.keys(pendingChanges).length,
      errorCount: validationErrors.length,
      fieldsWithErrors: Array.from(new Set(validationErrors.map(e => e.field))).length,
    },
  };
};

export default useUpdateProfile;
