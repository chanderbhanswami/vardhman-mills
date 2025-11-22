'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  avatar?: string;
  addresses?: {
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
  }[];
  isEmailVerified?: boolean;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
}

const roleColors = {
  user: 'bg-blue-100 text-blue-800',
  admin: 'bg-red-100 text-red-800',
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const resolvedParams = use(params);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch user');
        }

        setUser(data.data.customer);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load user details');
        router.push('/dashboard/users');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id && session?.accessToken) {
      loadUser();
    }
  }, [resolvedParams.id, session?.accessToken, router]);

  const handleDelete = async () => {
    if (!user) return;
    
    if (!confirm(`Are you sure you want to delete &quot;${user.firstName} ${user.lastName}&quot;? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      toast.success('User deleted successfully!');
      router.push('/dashboard/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleUserStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user status');
      }

      setUser({ ...user, isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
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
          <p className="mt-2 text-gray-600">The user you&apos;re looking for doesn&apos;t exist.</p>
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
              onClick={() => router.back()}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="page-title">{user.firstName} {user.lastName}</h1>
              <p className="page-description">
                User ID: {user._id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              {user.isActive ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${user.isActive ? 'text-green-700' : 'text-red-700'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            
            <button
              onClick={toggleUserStatus}
              className={`btn ${user.isActive ? 'btn-secondary' : 'btn-primary'}`}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
            
            <button
              onClick={() => router.push(`/dashboard/users/${resolvedParams.id}/edit`)}
              className="btn btn-primary"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="btn btn-danger"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Avatar */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
            
            <div className="flex justify-center">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  width={200}
                  height={200}
                  className="w-48 h-48 object-cover rounded-full border-4 border-white shadow-lg"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">First Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.firstName}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.lastName}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-1" />
                  Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  Mobile
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user.mobile || 'Not provided'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              
              {user.dateOfBirth && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Date of Birth
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(user.dateOfBirth).toLocaleDateString()}
                  </dd>
                </div>
              )}
              
              {user.gender && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{user.gender}</dd>
                </div>
              )}
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Address Information */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Address Information
            </h3>
            
            {user.addresses && user.addresses.length > 0 ? (
              <div className="space-y-4">
                {user.addresses.map((address, index) => (
                  <address key={address._id || index} className="text-sm text-gray-900 not-italic p-3 border rounded-lg">
                    <div className="font-medium text-blue-600 mb-2 capitalize">
                      {address.type} Address
                      {address.isDefault && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Default
                        </span>
                      )}
                    </div>
                    <div>
                      {address.firstName} {address.lastName}<br />
                      {address.addressLine1}<br />
                      {address.addressLine2 && <>{address.addressLine2}<br /></>}
                      {address.city}, {address.state} {address.pincode}<br />
                      {address.country}
                      {address.mobile && (
                        <>
                          <br />
                          <span className="text-gray-600">Mobile: {address.mobile}</span>
                        </>
                      )}
                    </div>
                  </address>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No address information available</p>
            )}
          </div>

          {/* Order Statistics */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-blue-600">{user.totalOrders || 0}</div>
                    <div className="text-sm text-blue-600">Total Orders</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{(user.totalSpent || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">Total Spent</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CalendarIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <div className="text-lg font-bold text-purple-600">
                      {user.lastOrderDate 
                        ? new Date(user.lastOrderDate).toLocaleDateString() 
                        : 'Never'
                      }
                    </div>
                    <div className="text-sm text-purple-600">Last Order</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push(`/dashboard/orders?customer=${user._id}`)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ShoppingBagIcon className="h-4 w-4 mr-2" />
                View Orders
              </button>
              
              <button
                onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
