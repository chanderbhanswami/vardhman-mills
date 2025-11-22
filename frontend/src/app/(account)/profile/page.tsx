/**
 * Profile Page - Vardhman Mills
 * 
 * Comprehensive user profile management page with:
 * - View and edit profile information
 * - Avatar upload and management
 * - Personal details (name, email, phone, etc.)
 * - Business information
 * - Communication preferences
 * - Profile completion tracking
 * - Profile verification
 * - Account statistics
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  PencilIcon,
  CameraIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

// Account Components
import {
  ProfileForm,
  ProfileInfo,
  ProfileAvatar,
  PasswordChange,
  AccountDeactivation,
} from '@/components/account';
import type { ProfileFormData } from '@/components/account/Profile/ProfileForm';

// Common Components
import {
  Button,
  LoadingSpinner,
  SEOHead,
  BackToTop,
} from '@/components/common';

// UI Components
import { Container } from '@/components/ui/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks';

// Types
interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  avatar?: string;
  bio?: string;
  company?: string;
  designation?: string;
  website?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  social?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  preferences?: {
    language: string;
    timezone: string;
    currency: string;
    newsletter: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
}

interface PageState {
  profile: ProfileData | null;
  isLoading: boolean;
  isEditing: boolean;
  isSaving: boolean;
  showAvatarModal: boolean;
  showPasswordModal: boolean;
  showDeactivateModal: boolean;
  activeTab: 'profile' | 'password' | 'preferences' | 'danger';
  profileCompletion: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [state, setState] = useState<PageState>({
    profile: null,
    isLoading: true,
    isEditing: false,
    isSaving: false,
    showAvatarModal: false,
    showPasswordModal: false,
    showDeactivateModal: false,
    activeTab: 'profile',
    profileCompletion: 0,
  });

  // Load profile data
  const loadProfile = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockProfile: ProfileData = {
        firstName: user?.firstName || 'John',
        lastName: user?.lastName || 'Doe',
        email: user?.email || 'john.doe@example.com',
        phone: user?.phone || '+91 9876543210',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        avatar: '/images/avatars/default.jpg',
        bio: 'Textile enthusiast and business owner',
        company: 'Doe Textiles Pvt Ltd',
        designation: 'Managing Director',
        website: 'https://doetextiles.com',
        address: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        social: {
          facebook: 'https://facebook.com/johndoe',
          twitter: 'https://twitter.com/johndoe',
          linkedin: 'https://linkedin.com/in/johndoe',
        },
        preferences: {
          language: 'en',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          newsletter: true,
          emailNotifications: true,
          smsNotifications: false,
        },
      };

      setState(prev => ({
        ...prev,
        profile: mockProfile,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Calculate profile completion
  useEffect(() => {
    if (!state.profile) return;

    const fields = [
      state.profile.firstName,
      state.profile.lastName,
      state.profile.email,
      state.profile.phone,
      state.profile.dateOfBirth,
      state.profile.gender,
      state.profile.avatar,
      state.profile.bio,
      state.profile.company,
      state.profile.address?.city,
    ];

    const completed = fields.filter(Boolean).length;
    const completion = Math.round((completed / fields.length) * 100);

    setState(prev => ({ ...prev, profileCompletion: completion }));
  }, [state.profile]);

  // Handlers
  const handleUpdateProfile = useCallback(async (data: ProfileFormData) => {
    setState(prev => ({ ...prev, isSaving: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setState(prev => ({
        ...prev,
        profile: { ...prev.profile!, ...data },
        isEditing: false,
        isSaving: false,
      }));

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'error',
      });
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [toast]);

  const handleAvatarUpload = useCallback(async (url: string) => {
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      setState(prev => ({
        ...prev,
        profile: { ...prev.profile!, avatar: url },
        showAvatarModal: false,
      }));

      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been updated',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      toast({
        title: 'Error',
        description: 'Failed to upload avatar',
        variant: 'error',
      });
    }
  }, [toast]);

  const handlePasswordChange = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setState(prev => ({ ...prev, showPasswordModal: false }));

      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to change password:', err);
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'error',
      });
    }
  }, [toast]);

  // Computed values
  const isProfileComplete = useMemo(() => state.profileCompletion === 100, [state.profileCompletion]);
  const isVerified = useMemo(() => user?.isEmailVerified || false, [user?.isEmailVerified]);

  // Render functions
  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {state.profile?.avatar ? (
                <Image
                  src={state.profile.avatar}
                  alt={`${state.profile.firstName} ${state.profile.lastName}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-full h-full text-gray-400" />
              )}
            </div>
            <button
              onClick={() => setState(prev => ({ ...prev, showAvatarModal: true }))}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              title="Change avatar"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {state.profile?.firstName} {state.profile?.lastName}
              </h1>
              {isVerified && (
                <Badge variant="success" className="flex items-center gap-1">
                  <ShieldCheckIcon className="w-3 h-3" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                <span>{state.profile?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                <span>{state.profile?.phone}</span>
              </div>
              {state.profile?.company && (
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="w-4 h-4" />
                  <span>{state.profile.designation} at {state.profile.company}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={() => setState(prev => ({ ...prev, isEditing: !prev.isEditing }))}
          variant={state.isEditing ? 'outline' : 'default'}
        >
          <PencilIcon className="w-5 h-5 mr-2" />
          {state.isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Profile Completion */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Profile Completion
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isProfileComplete ? 'Your profile is complete!' : 'Complete your profile to unlock all features'}
              </p>
            </div>
            <div className="text-2xl font-bold text-primary-600">
              {state.profileCompletion}%
            </div>
          </div>
          <Progress value={state.profileCompletion} className="h-2" />
          {!isProfileComplete && (
            <div className="mt-4 flex items-start gap-2">
              <CheckCircleIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add missing information to complete your profile
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Alert */}
      {!isVerified && (
        <Alert variant="warning" className="mb-6">
          <ShieldCheckIcon className="w-5 h-5" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Verify Your Email</h4>
            <p className="text-sm">
              Please verify your email address to access all features
            </p>
          </div>
          <Button size="sm">Verify Now</Button>
        </Alert>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {state.isEditing ? (
        <ProfileForm
          userId={user?.id}
          onProfileUpdate={handleUpdateProfile}
          onCancel={() => setState(prev => ({ ...prev, isEditing: false }))}
        />
      ) : (
        <ProfileInfo userId={user?.id} />
      )}

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl font-bold text-primary-600">15</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Orders</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reviews</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl font-bold text-blue-600">3</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Addresses</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-2xl font-bold text-purple-600">
                <CalendarIcon className="w-6 h-6 mx-auto mb-1" />
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Member since 2023</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.profile?.bio && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{state.profile.bio}</p>
            </div>
          )}
          {state.profile?.website && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
              <a
                href={state.profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-primary-600 hover:text-primary-700 block"
              >
                {state.profile.website}
              </a>
            </div>
          )}
          {state.profile?.address && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                Address
              </label>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {state.profile.address.street}, {state.profile.address.city},{' '}
                {state.profile.address.state} {state.profile.address.pincode},{' '}
                {state.profile.address.country}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderPasswordTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordChange
            userId={user?.id}
            onPasswordChanged={handlePasswordChange}
            onCancel={() => setState(prev => ({ ...prev, activeTab: 'profile' }))}
          />
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderPreferencesTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Communication Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Newsletter</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive newsletters about new products and offers
              </p>
            </div>
            <input
              type="checkbox"
              aria-label="Newsletter subscription"
              checked={state.profile?.preferences?.newsletter}
              onChange={(e) => {
                setState(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile!,
                    preferences: {
                      ...prev.profile!.preferences!,
                      newsletter: e.target.checked,
                    },
                  },
                }));
              }}
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive email notifications about your orders
              </p>
            </div>
            <input
              type="checkbox"
              aria-label="Email notifications"
              checked={state.profile?.preferences?.emailNotifications}
              onChange={(e) => {
                setState(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile!,
                    preferences: {
                      ...prev.profile!.preferences!,
                      emailNotifications: e.target.checked,
                    },
                  },
                }));
              }}
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive SMS updates about your orders
              </p>
            </div>
            <input
              type="checkbox"
              aria-label="SMS notifications"
              checked={state.profile?.preferences?.smsNotifications}
              onChange={(e) => {
                setState(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile!,
                    preferences: {
                      ...prev.profile!.preferences!,
                      smsNotifications: e.target.checked,
                    },
                  },
                }));
              }}
              className="w-5 h-5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={state.profile?.preferences?.language}
              onChange={(e) => {
                setState(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile!,
                    preferences: {
                      ...prev.profile!.preferences!,
                      language: e.target.value,
                    },
                  },
                }));
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              title="Select language"
              aria-label="Language preference"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
              <option value="gu">Gujarati</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={state.profile?.preferences?.timezone}
              onChange={(e) => {
                setState(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile!,
                    preferences: {
                      ...prev.profile!.preferences!,
                      timezone: e.target.value,
                    },
                  },
                }));
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              title="Select timezone"
              aria-label="Timezone preference"
            >
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
              <option value="Asia/Singapore">Singapore Time (SGT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={state.profile?.preferences?.currency}
              onChange={(e) => {
                setState(prev => ({
                  ...prev,
                  profile: {
                    ...prev.profile!,
                    preferences: {
                      ...prev.profile!.preferences!,
                      currency: e.target.value,
                    },
                  },
                }));
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              title="Select currency"
              aria-label="Currency preference"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderDangerTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountDeactivation
            userId={user?.id}
            onDeactivationSuccess={() => {
              console.log('Deactivating account');
              setState(prev => ({ ...prev, showDeactivateModal: true }));
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );

  // Loading state
  if (state.isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    );
  }

  if (!state.profile) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Failed to load profile</p>
          <Button onClick={loadProfile} className="mt-4">
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <SEOHead
        title="Profile | Vardhman Mills"
        description="Manage your profile information"
        canonical="/account/profile"
      />

      <Container className="py-8">
        {renderHeader()}

        <Tabs value={state.activeTab} onValueChange={(value: string) => setState(prev => ({ ...prev, activeTab: value as PageState['activeTab'] }))}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">{renderProfileTab()}</TabsContent>
          <TabsContent value="password">{renderPasswordTab()}</TabsContent>
          <TabsContent value="preferences">{renderPreferencesTab()}</TabsContent>
          <TabsContent value="danger">{renderDangerTab()}</TabsContent>
        </Tabs>

        {/* Avatar Upload Modal */}
        <Modal
          open={state.showAvatarModal}
          onClose={() => setState(prev => ({ ...prev, showAvatarModal: false }))}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Update Profile Picture
            </h2>
            <ProfileAvatar
              userId={user?.id}
              currentAvatar={state.profile?.avatar}
              onAvatarUpdate={handleAvatarUpload}
            />
          </div>
        </Modal>

        {/* Hidden usage */}
        {false && state.profile && (
          <div className="sr-only">
            User profile page for {state.profile?.firstName || 'User'}
          </div>
        )}

        <BackToTop />
      </Container>
    </>
  );
}
