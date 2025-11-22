/**
 * Profile Management Components
 * 
 * Centralized exports for user profile components including
 * profile forms, avatar, password change, and account deactivation.
 * 
 * @module components/account/Profile
 * @version 1.0.0
 */

// Profile Components
export { default as ProfileForm } from './ProfileForm';
export { default as ProfileInfo } from './ProfileInfo';
export { default as ProfileAvatar } from './ProfileAvatar';
export { default as PasswordChange } from './PasswordChange';
export { default as AccountDeactivation } from './AccountDeactivation';

// Export types
export type { 
  ProfileFormProps, 
  ProfileFormData 
} from './ProfileForm';
export type { ProfileInfoProps } from './ProfileInfo';
export type { ProfileAvatarProps } from './ProfileAvatar';
export type { PasswordChangeProps } from './PasswordChange';
export type { 
  AccountDeactivationProps, 
  DeactivationReason,
  DeactivationData
} from './AccountDeactivation';
