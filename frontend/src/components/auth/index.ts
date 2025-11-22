/**
 * Authentication Components - Vardhman Mills Frontend
 * 
 * Centralized exports for all authentication-related components.
 * Includes login, registration, password management, social auth,
 * guards, session management, and verification components.
 * 
 * @module components/auth
 * @version 1.0.0
 */

// ============================================================================
// FORM COMPONENTS
// ============================================================================

// Login & Registration
export { default as LoginForm } from './LoginForm';
export { default as RegisterForm } from './RegisterForm';

// Password Management
export { default as ForgotPasswordForm } from './ForgotPasswordForm';
export { default as ForgotPasswordOTP } from './ForgotPasswordOTP';
export { default as ResetPasswordForm } from './ResetPasswordForm';
export { default as RememberPassword } from './RememberPassword';

// ============================================================================
// SOCIAL AUTHENTICATION
// ============================================================================

export { default as SocialLogin } from './SocialLogin';
export { GoogleLogin, GoogleLoginButton } from './GoogleLogin';
export { FacebookLogin, FacebookLoginButton } from './FacebookLogin';

// ============================================================================
// VERIFICATION COMPONENTS
// ============================================================================

export { EmailVerification, useEmailVerification } from './EmailVerification';
export { default as OTPVerification } from './OTPVerification';

// ============================================================================
// SECURITY & PROTECTION
// ============================================================================

// Route Guards
export { default as AuthGuard } from './AuthGuard';
export { default as GuestGuard } from './GuestGuard';
export { default as ProtectedRoute, withProtectedRoute } from './ProtectedRoute';

// reCAPTCHA
export { ReCaptcha3, useReCaptcha3, withReCaptcha3 } from './ReCaptcha3';

// ============================================================================
// SESSION & STATUS MANAGEMENT
// ============================================================================

export { default as AuthSessionManager } from './AuthSessionManager';
export { default as AuthStatusBar } from './AuthStatusBar';

// ============================================================================
// ADDITIONAL COMPONENTS
// ============================================================================

export { NewsletterCheckbox, NewsletterForm } from './NewsletterCheckbox';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Form Props
export type { LoginFormProps } from './LoginForm';
export type { RegisterFormProps } from './RegisterForm';
export type { ForgotPasswordFormProps } from './ForgotPasswordForm';
export type { ForgotPasswordOTPProps, OTPState as ForgotPasswordOTPState } from './ForgotPasswordOTP';
export type { ResetPasswordFormProps } from './ResetPasswordForm';
export type { RememberPasswordProps } from './RememberPassword';

// Social Auth Props
export type { SocialLoginProps } from './SocialLogin';
export type { GoogleLoginProps } from './GoogleLogin';
export type { FacebookLoginProps } from './FacebookLogin';

// Verification Props
export type { OTPVerificationProps } from './OTPVerification';

// Guard Props
export type { AuthGuardProps } from './AuthGuard';
export type { GuestGuardProps } from './GuestGuard';
export type { ProtectedRouteProps } from './ProtectedRoute';

// Security Props
export type { ReCaptcha3Props } from './ReCaptcha3';

// Additional Props
export type { NewsletterCheckboxProps, NewsletterFormProps } from './NewsletterCheckbox';

// Note: Some component prop types (AuthSessionManagerProps, AuthStatusBarProps) 
// are defined internally and not exported separately
