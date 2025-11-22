'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  TrashIcon,
  UserCircleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Address {
  _id?: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  mobile?: string;
  isDefault: boolean;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  avatar?: string;
  addresses?: Address[];
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
  updatedAt: string;
}

interface UserDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditUserPage({ params }: UserDetailsPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: 'user' as 'user' | 'admin',
    isActive: true,
    isEmailVerified: false,
    dateOfBirth: '',
    gender: '' as '' | 'male' | 'female' | 'other',
    addresses: [] as Address[]
  });

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.data.customer;
        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          mobile: userData.mobile || '',
          role: userData.role || 'user',
          isActive: userData.isActive ?? true,
          isEmailVerified: userData.isEmailVerified ?? false,
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
          gender: userData.gender || '',
          addresses: userData.addresses || []
        });
        setAvatarPreview(userData.avatar || null);
      } else {
        toast.error('Failed to fetch user data');
        router.push('/dashboard/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to fetch user data');
      router.push('/dashboard/users');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, session, router]);

  useEffect(() => {
    if (resolvedParams.id && session) {
      fetchUser();
    }
  }, [fetchUser, resolvedParams.id, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressChange = (index: number, field: keyof Address, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const addAddress = () => {
    const newAddress: Address = {
      type: 'home',
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      mobile: '',
      isDefault: formData.addresses.length === 0
    };
    
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddress]
    }));
  };

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add user data
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('mobile', formData.mobile);
      submitData.append('role', formData.role);
      submitData.append('isActive', formData.isActive.toString());
      submitData.append('isEmailVerified', formData.isEmailVerified.toString());
      
      if (formData.dateOfBirth) {
        submitData.append('dateOfBirth', formData.dateOfBirth);
      }
      
      if (formData.gender) {
        submitData.append('gender', formData.gender);
      }

      // Add addresses
      submitData.append('addresses', JSON.stringify(formData.addresses));

      // Add avatar file if selected
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      const response = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: submitData,
      });

      if (response.ok) {
        toast.success('User updated successfully!');
        router.push(`/dashboard/users/${resolvedParams.id}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">User Not Found</h1>
          <p className="mt-2 text-gray-600">The user you are looking for does not exist.</p>
          <button
            onClick={() => router.push('/dashboard/users')}
            className="mt-4 btn btn-primary"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/users')}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Users
            </button>
            <div>
              <h1 className="page-title">Edit User</h1>
              <p className="page-description">Update user information</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/dashboard/users/${resolvedParams.id}`)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Upload */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
            
            <div className="flex flex-col items-center">
              <div className="relative">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="User avatar"
                    width={200}
                    height={200}
                    className="w-48 h-48 object-cover rounded-full border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex space-x-2">
                <label className="btn btn-secondary cursor-pointer">
                  <PhotoIcon className="h-4 w-4 mr-2" />
                  Change Photo
                  <input
                    title="Input Field"
                    placeholder="Enter value"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                {avatarPreview && (
                  <button
                    onClick={() => {
                      setAvatarPreview(null);
                      setAvatarFile(null);
                    }}
                    className="btn btn-danger"
                    title="Remove profile picture"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter first name"
                  title="First Name"
                />
              </div>
              
              <div>
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  title="Last Name"
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  title="Email"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="form-label">Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="form-input"
                  title="Mobile"
                  placeholder="Enter mobile number"
                />
              </div>
              
              <div>
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="form-input"
                  title="Date of Birth"
                  placeholder="Enter date of birth"
                />
              </div>
              
              <div>
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="form-input"
                  title="Gender"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form-input"
                  title="Role"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="form-checkbox"
                    title="Active Account"
                    placeholder="Active Account"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active Account</span>
                </label>
                
                <label className="flex items-center">
                  <input
                      type="checkbox"
                      name="isEmailVerified"
                      checked={formData.isEmailVerified}
                      onChange={handleInputChange}
                      className="form-checkbox"
                      title="Email Verified"
                      placeholder="Email Verified"
                  />
                  <span className="ml-2 text-sm text-gray-700">Email Verified</span>
                </label>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Addresses</h3>
              <button
                onClick={addAddress}
                className="btn btn-secondary btn-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Address
              </button>
            </div>
            
            {formData.addresses.length > 0 ? (
              <div className="space-y-4">
                {formData.addresses.map((address, index) => (
                  <div key={index} className="border rounded-lg p-4 relative">
                    <button
                      onClick={() => removeAddress(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      title="Remove address"
                      aria-label="Remove address"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Type</label>
                        <select
                          value={address.type}
                          onChange={(e) => handleAddressChange(index, 'type', e.target.value as 'home' | 'work' | 'other')}
                          className="form-input"
                          title="Address Type"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={address.isDefault}
                            onChange={(e) => handleAddressChange(index, 'isDefault', e.target.checked)}
                            className="form-checkbox"
                            title="Default Address"
                            aria-label="Default Address"
                            placeholder="Default Address"
                          />
                          <span className="ml-2 text-sm text-gray-700">Default Address</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          value={address.firstName}
                          onChange={(e) => handleAddressChange(index, 'firstName', e.target.value)}
                          className="form-input"
                          title="First Name"
                          placeholder="Enter first name"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          value={address.lastName}
                          onChange={(e) => handleAddressChange(index, 'lastName', e.target.value)}
                          className="form-input"
                          title="Last Name"
                          placeholder="Enter last name"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Address Line 1</label>
                        <input
                          type="text"
                          value={address.addressLine1}
                          onChange={(e) => handleAddressChange(index, 'addressLine1', e.target.value)}
                          className="form-input"
                          title="Address Line 1"
                          placeholder="Enter address line 1"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Address Line 2</label>
                        <input
                          type="text"
                          value={address.addressLine2 || ''}
                          onChange={(e) => handleAddressChange(index, 'addressLine2', e.target.value)}
                          className="form-input"
                          title="Address Line 2"
                          placeholder="Enter address line 2"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                          className="form-input"
                          title="City"
                          placeholder="Enter city"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                          className="form-input"
                          title="State"
                          placeholder="Enter state"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Pincode</label>
                        <input
                          type="text"
                          value={address.pincode}
                          onChange={(e) => handleAddressChange(index, 'pincode', e.target.value)}
                          className="form-input"
                          title="Pincode"
                          placeholder="Enter pincode"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Country</label>
                        <input
                          type="text"
                          value={address.country}
                          onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                          className="form-input"
                          title="Country"
                          placeholder="Enter country"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Mobile</label>
                        <input
                          type="tel"
                          value={address.mobile || ''}
                          onChange={(e) => handleAddressChange(index, 'mobile', e.target.value)}
                          className="form-input"
                          title="Mobile"
                          placeholder="Enter mobile number"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No addresses added</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
