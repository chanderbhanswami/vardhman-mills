'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon,
  ChevronUpDownIcon,
  FunnelIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import EnhancedSearch, { SearchSuggestion } from '@/components/ui/EnhancedSearch';
import SelectionActionBar, { commonActions, SelectionAction } from '@/components/ui/SelectionActionBar';
import HighlightedText from '@/components/ui/HighlightedText';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  lastLogin?: string;
  totalOrders?: number;
  totalSpent?: number;
  addresses?: Array<{
    _id: string;
    type: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface UserTableProps {
  users: User[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onView: (user: User) => void;
  onAdd: () => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onChangeRole: (userId: string, role: 'user' | 'admin') => void;
  onBulkDelete?: (userIds: string[]) => Promise<void>;
  onBulkToggleStatus?: (userIds: string[], isActive: boolean) => Promise<void>;
  pagination?: {
    page: number;
    pages: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onSearchSuggestions?: (query: string) => void;
  searchSuggestions?: SearchSuggestion[];
  onFilter?: (filters: { role?: string; status?: string; verified?: string }) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  searchQuery?: string;
  isSearching?: boolean;
  onResetSearch?: () => void;
}

export default function UserTable({
  users,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onToggleStatus,
  onChangeRole,
  onBulkDelete,
  onBulkToggleStatus,
  pagination,
  onPageChange,
  onSearch,
  onSearchSuggestions,
  searchSuggestions = [],
  onFilter,
  onSort,
  searchQuery = '',
  isSearching = false,
  onResetSearch,
}: UserTableProps) {
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchSuggestionsList, setSearchSuggestionsList] = useState<SearchSuggestion[]>([]);
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
  
  // Generate search suggestions when searchQuery changes
  useEffect(() => {
    if (onSearchSuggestions) {
      onSearchSuggestions(searchQuery);
    } else {
      // Generate suggestions inline to avoid dependency issues
      if (!searchQuery.trim()) {
        setSearchSuggestionsList([]);
        return;
      }
      
      const lowerQuery = searchQuery.toLowerCase();
      const suggestions: SearchSuggestion[] = [];
      
      users.forEach(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        const mobile = user.mobile?.toLowerCase() || '';
        
        if (fullName.includes(lowerQuery)) {
          suggestions.push({
            id: `name-${user._id}`,
            text: `${user.firstName} ${user.lastName}`,
            type: 'Name',
            data: { userId: user._id, type: 'name' }
          });
        }
        
        if (email.includes(lowerQuery)) {
          suggestions.push({
            id: `email-${user._id}`,
            text: user.email,
            type: 'Email',
            data: { userId: user._id, type: 'email' }
          });
        }
        
        if (mobile.includes(lowerQuery)) {
          suggestions.push({
            id: `mobile-${user._id}`,
            text: user.mobile!,
            type: 'Mobile',
            data: { userId: user._id, type: 'mobile' }
          });
        }
      });
      
      // Remove duplicates and limit to 10
      const uniqueSuggestions = suggestions
        .filter((suggestion, index, self) => 
          index === self.findIndex(s => s.text === suggestion.text)
        )
        .slice(0, 10);
        
      setSearchSuggestionsList(uniqueSuggestions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, onSearchSuggestions]); // users is intentionally excluded to prevent infinite loops
  
  // Selection action definitions
  const selectionActions: SelectionAction[] = [
    {
      ...commonActions.delete,
      disabled: !onBulkDelete || isPerformingBulkAction,
    },
    {
      ...commonActions.activate,
      disabled: !onBulkToggleStatus || isPerformingBulkAction,
    },
    {
      ...commonActions.deactivate,
      disabled: !onBulkToggleStatus || isPerformingBulkAction,
    },
  ];

  // Handle enhanced search
  const handleEnhancedSearch = (query: string) => {
    if (onSearch) {
      onSearch(query);
    }
  };

  // Handle search suggestions
  const handleSearchSuggestions = (query: string) => {
    if (onSearchSuggestions) {
      onSearchSuggestions(query);
    } else {
      // Generate suggestions inline
      if (!query.trim()) {
        setSearchSuggestionsList([]);
        return;
      }
      
      const lowerQuery = query.toLowerCase();
      const suggestions: SearchSuggestion[] = [];
      
      users.forEach(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        const mobile = user.mobile?.toLowerCase() || '';
        
        if (fullName.includes(lowerQuery)) {
          suggestions.push({
            id: `name-${user._id}`,
            text: `${user.firstName} ${user.lastName}`,
            type: 'Name',
            data: { userId: user._id, type: 'name' }
          });
        }
        
        if (email.includes(lowerQuery)) {
          suggestions.push({
            id: `email-${user._id}`,
            text: user.email,
            type: 'Email',
            data: { userId: user._id, type: 'email' }
          });
        }
        
        if (mobile.includes(lowerQuery)) {
          suggestions.push({
            id: `mobile-${user._id}`,
            text: user.mobile!,
            type: 'Mobile',
            data: { userId: user._id, type: 'mobile' }
          });
        }
      });
      
      // Remove duplicates and limit to 10
      const uniqueSuggestions = suggestions
        .filter((suggestion, index, self) => 
          index === self.findIndex(s => s.text === suggestion.text)
        )
        .slice(0, 10);
        
      setSearchSuggestionsList(uniqueSuggestions);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (onSearch) {
      onSearch(suggestion.text);
    }
  };

  // Handle search reset
  const handleSearchReset = () => {
    setSearchSuggestionsList([]);
    if (onResetSearch) {
      onResetSearch();
    } else if (onSearch) {
      onSearch('');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    try {
      setIsPerformingBulkAction(true);
      
      switch (actionId) {
        case 'delete':
          if (onBulkDelete) {
            await onBulkDelete(selectedIds);
          }
          break;
        case 'activate':
          if (onBulkToggleStatus) {
            await onBulkToggleStatus(selectedIds, true);
          }
          break;
        case 'deactivate':
          if (onBulkToggleStatus) {
            await onBulkToggleStatus(selectedIds, false);
          }
          break;
      }
      
      // Clear selection after successful action
      setSelectedUsers([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const handleFilter = () => {
    onFilter?.({
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      verified: verifiedFilter || undefined,
    });
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort?.(field, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Users</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FunnelIcon className="-ml-1 mr-2 h-4 w-4" />
              Filters
            </button>
            <button
              onClick={onAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlusIcon className="-ml-1 mr-2 h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="mt-4 space-y-4">
          <EnhancedSearch
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onSearch={handleEnhancedSearch}
            onReset={handleSearchReset}
            showReset={!!searchQuery}
            suggestions={searchSuggestions.length > 0 ? searchSuggestions : searchSuggestionsList}
            onSuggestionSelect={handleSuggestionSelect}
            onSuggestionsFetch={handleSearchSuggestions}
            highlightTerm={searchQuery}
            isLoading={isSearching}
            className="flex-1"
          />

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Role"
                  title="Role"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  title="Status"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification
                </label>
                <select
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  title="Verification"
                >
                  <option value="">All</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleFilter}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selection Action Bar */}
      <SelectionActionBar
        selectedCount={selectedUsers.length}
        totalCount={users.length}
        onClearSelection={() => setSelectedUsers([])}
        actions={selectionActions}
        onActionExecute={handleBulkAction}
        selectedIds={selectedUsers}
        className="mx-4 mb-4"
      />

      {/* Table */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    title="Select all users"
                    placeholder="Select all users"
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('firstName')}
                >
                  <div className="flex items-center">
                    User
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center">
                    Role
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('isActive')}
                >
                  <div className="flex items-center">
                    Status
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('isEmailVerified')}
                >
                  <div className="flex items-center">
                    Verified
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalSpent')}
                >
                  <div className="flex items-center">
                    Spent
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Created
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) => handleSelectUser(user._id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      title="Select user"
                      placeholder="Select user"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          <HighlightedText 
                            text={`${user.firstName} ${user.lastName}`}
                            highlight={searchQuery}
                          />
                        </div>
                        {user.mobile && (
                          <div className="text-sm text-gray-500">
                            <HighlightedText 
                              text={user.mobile}
                              highlight={searchQuery}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <HighlightedText 
                        text={user.email}
                        highlight={searchQuery}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onChangeRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                      title={`Click to change role to ${user.role === 'admin' ? 'user' : 'admin'}`}
                    >
                      {user.role}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleStatus(user._id, !user.isActive)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                        user.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                      title={`Click to ${user.isActive ? 'deactivate' : 'activate'} user`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.isEmailVerified ? (
                        <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ShieldExclamationIcon className="h-5 w-5 text-red-500" />
                      )}
                      <span className="ml-2 text-sm text-gray-900">
                        {user.isEmailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.totalSpent !== undefined ? formatCurrency(user.totalSpent) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onView(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(user._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * 10, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => onPageChange?.(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => onPageChange?.(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => onPageChange?.(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}