'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import UserTable from '@/components/tables/UserTable';
import { SearchSuggestion } from '@/components/ui/EnhancedSearch';

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

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLocalSearch, setIsLocalSearch] = useState(true);
  const [searchTimeoutRef, setSearchTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const fetchUsers = useCallback(async (page = 1, search = '', filters = {}) => {
    if (!session?.accessToken) return;
    
    try {
      setLoading(true);
      if (search) setIsSearching(true);
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...filters,
      });

      const response = await fetch(
        `/api/users/admin?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const fetchedUsers = data.customers || [];
        setUsers(fetchedUsers);
        // Only update allUsers when not searching (initial load or reset)
        if (!search) {
          setAllUsers(fetchedUsers);
        }
        setPagination({
          page: data.page || 1,
          pages: data.pages || 1,
          total: data.total || 0,
        });
        setSearchQuery(search);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]); // fetchUsers is stable due to useCallback

  const handleEdit = (user: User) => {
    // Navigate to edit page
    router.push(`/dashboard/users/${user._id}/edit`);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/admin/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        fetchUsers(pagination.page);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleView = (user: User) => {
    // Navigate to user details page
    router.push(`/dashboard/users/${user._id}`);
  };

  const handleAdd = () => {
    // Navigate to add user page
    router.push('/dashboard/users/new');
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/admin/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        fetchUsers(pagination.page);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleChangeRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      const response = await fetch(`/api/users/admin/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        fetchUsers(pagination.page);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  // Local filtering function
  const filterUsersLocally = (query: string) => {
    if (!query.trim()) {
      setUsers(allUsers);
      return allUsers;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allUsers.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      const mobile = user.mobile?.toLowerCase() || '';
      
      return fullName.includes(lowerQuery) || 
             email.includes(lowerQuery) || 
             mobile.includes(lowerQuery);
    });
    
    setUsers(filtered);
    return filtered;
  };

  const handlePageChange = (page: number) => {
    if (isLocalSearch && searchQuery) {
      // For local search, don't change page
      return;
    }
    fetchUsers(page, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Cancel any pending search
    if (searchTimeoutRef) {
      clearTimeout(searchTimeoutRef);
      setSearchTimeoutRef(null);
    }
    
    if (!query.trim()) {
      // Reset to show all users when search is cleared
      setUsers(allUsers);
      setIsLocalSearch(true);
      setSearchSuggestions([]);
      return;
    }

    // Always start with local filtering for immediate feedback
    setIsLocalSearch(true);
    filterUsersLocally(query);
    
    // For queries longer than 1 character, trigger server search faster
    if (query.length > 1) {
      // Set timeout for server search with faster timing
      const timeoutId = setTimeout(() => {
        setIsLocalSearch(false);
        fetchUsers(1, query);
        setSearchTimeoutRef(null);
      }, 500);
      setSearchTimeoutRef(timeoutId);
    }
  };

  const handleSearchSuggestions = useCallback((query: string) => {
    // Generate suggestions based on current users
    if (!query.trim()) {
      setSearchSuggestions([]);
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
      
    setSearchSuggestions(uniqueSuggestions);
  }, [users]);

  const handleResetSearch = () => {
    // Cancel any pending search
    if (searchTimeoutRef) {
      clearTimeout(searchTimeoutRef);
      setSearchTimeoutRef(null);
    }
    
    // Reset all search-related state to show all users
    setSearchQuery('');
    setUsers(allUsers);
    setIsLocalSearch(true);
    setSearchSuggestions([]);
  };

  const handleBulkDelete = async (userIds: string[]) => {
    try {
      const response = await fetch('/api/users/admin/bulk/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ userIds }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || `Successfully deleted ${userIds.length} user${userIds.length > 1 ? 's' : ''}`);
        fetchUsers(pagination.page, searchQuery);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete users');
      }
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      toast.error('Failed to delete users');
    }
  };

  const handleBulkToggleStatus = async (userIds: string[], isActive: boolean) => {
    try {
      const response = await fetch('/api/users/admin/bulk/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ userIds, isActive }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || `Successfully ${isActive ? 'activated' : 'deactivated'} ${userIds.length} user${userIds.length > 1 ? 's' : ''}`);
        fetchUsers(pagination.page, searchQuery);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error bulk updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleFilter = (filters: { role?: string; status?: string; verified?: string }) => {
    fetchUsers(1, '', filters);
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    console.log('Sort by:', field, direction);
    // Implement sorting logic
  };

  return (
    <div className="page-container">
      <UserTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAdd={handleAdd}
        onToggleStatus={handleToggleStatus}
        onChangeRole={handleChangeRole}
        onBulkDelete={handleBulkDelete}
        onBulkToggleStatus={handleBulkToggleStatus}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onSearchSuggestions={handleSearchSuggestions}
        searchSuggestions={searchSuggestions}
        onFilter={handleFilter}
        onSort={handleSort}
        searchQuery={searchQuery}
        isSearching={isSearching}
        onResetSearch={handleResetSearch}
      />
    </div>
  );
}
