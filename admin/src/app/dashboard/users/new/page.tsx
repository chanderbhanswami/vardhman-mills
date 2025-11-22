'use client';

import React, { useState } from 'react';
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

export default function NewUserPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [creating, setCreating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    role: 'user' as 'user' | 'admin',
    isActive: true,
    isEmailVerified: false,
    dateOfBirth: '',
    gender: '' as '' | 'male' | 'female' | 'other',
    addresses: [] as Address[]
  });

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

  const handleCreate = async () => {
    // Validation
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.password.trim()) {
      toast.error('Password is required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setCreating(true);

      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add user data
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
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

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: submitData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('User created successfully!');
        router.push(`/dashboard/users/${data.data.user._id}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="page-title">Create New User</h1>
              <p className="page-description">Add a new user to the system</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/dashboard/users')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="btn btn-primary"
            >
              {creating ? 'Creating...' : 'Create User'}
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
                    alt="User avatar preview"
                    width={192}
                    height={192}
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
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      aria-label="Choose profile picture"
                      title="Choose profile picture"
                      placeholder="Choose profile picture"
                    />
                  </label>
                  {avatarPreview && (
                    <button
                      onClick={() => {
                        setAvatarPreview(null);
                        setAvatarFile(null);
                      }}
                      className="btn btn-danger"
                      title="Remove photo"
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
                  placeholder="Enter mobile number"
                />
              </div>
              
              <div>
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter password (min 8 characters)"
                />
              </div>
              
              <div>
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Confirm password"
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
                  aria-label="Date of birth"
                  title="Date of birth"
                  placeholder="YYYY-MM-DD"
                />
              </div>
              
              <div>
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="form-input"
                  aria-label="Select gender"
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
                  aria-label="Select user role"
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
                    aria-label="Active account"
                    title="Active account"
                    placeholder="Active account"
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
                    aria-label="Email verified"
                    title="Email verified"
                    placeholder="Email verified"
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
                          aria-label="Address type"
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
                            aria-label="Default address"
                            title="Default address"
                            placeholder="Default address"
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
                          placeholder="First name"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          value={address.lastName}
                          onChange={(e) => handleAddressChange(index, 'lastName', e.target.value)}
                          className="form-input"
                          placeholder="Last name"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Address Line 1</label>
                        <input
                          type="text"
                          value={address.addressLine1}
                          onChange={(e) => handleAddressChange(index, 'addressLine1', e.target.value)}
                          className="form-input"
                          placeholder="Street address"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Address Line 2</label>
                        <input
                          type="text"
                          value={address.addressLine2 || ''}
                          onChange={(e) => handleAddressChange(index, 'addressLine2', e.target.value)}
                          className="form-input"
                          placeholder="Apartment, suite, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                          className="form-input"
                          placeholder="City"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                          className="form-input"
                          placeholder="State"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Pincode</label>
                        <input
                          type="text"
                          value={address.pincode}
                          onChange={(e) => handleAddressChange(index, 'pincode', e.target.value)}
                          className="form-input"
                          placeholder="Pincode"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Country</label>
                        <input
                          type="text"
                          value={address.country}
                          onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                          className="form-input"
                          placeholder="Country"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Mobile</label>
                        <input
                          type="tel"
                          value={address.mobile || ''}
                          onChange={(e) => handleAddressChange(index, 'mobile', e.target.value)}
                          className="form-input"
                          placeholder="Mobile number"
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
