/**
 * useAuth Hook - Re-export from AuthProvider
 * 
 * This hook provides the authentication state and methods from AuthProvider.
 * Use this hook in components instead of importing from providers directly.
 */

export { useAuth } from '@/components/providers/AuthProvider';
export { useAuth as default } from '@/components/providers/AuthProvider';
export type { User, AuthContextType as AuthState } from '@/components/providers/AuthProvider';
