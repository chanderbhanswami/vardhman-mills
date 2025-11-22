'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CategoryTable from '@/components/tables/CategoryTable';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocalSearch, setIsLocalSearch] = useState(true);
  const [searchTimeoutRef, setSearchTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const fetchCategories = useCallback(async (page = 1, search = '') => {
    if (!session?.accessToken) return;
    
    try {
      setLoading(true);

      const response = await fetch(
        `/api/categories/admin?page=${page}&search=${search}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const fetchedCategories = data.data || data.categories || [];
        setCategories(fetchedCategories);
        // Only update allCategories when not searching (initial load or reset)
        if (!search) {
          setAllCategories(fetchedCategories);
        }
        setPagination({
          page: data.page || 1,
          pages: data.pages || 1,
          total: data.total || 0,
        });
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setPagination({
        page: 1,
        pages: 1,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]); // fetchCategories is stable due to useCallback

  const handleEdit = (category: Category) => {
    router.push(`/dashboard/categories/${category._id}/edit`);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      if (!session?.accessToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/categories/admin/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchCategories(pagination.page);
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const handleView = (category: Category) => {
    router.push(`/dashboard/categories/${category._id}`);
  };

  const handleAdd = () => {
    router.push('/dashboard/categories/create');
  };

  // Local filtering function
  const filterCategoriesLocally = (query: string) => {
    if (!query.trim()) {
      setCategories(allCategories);
      return allCategories;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allCategories.filter(category => {
      const name = category.name.toLowerCase();
      const description = category.description?.toLowerCase() || '';
      const parentName = category.parentCategory?.name.toLowerCase() || '';
      
      return name.includes(lowerQuery) || 
             description.includes(lowerQuery) || 
             parentName.includes(lowerQuery);
    });
    
    setCategories(filtered);
    return filtered;
  };

  const handlePageChange = (page: number) => {
    if (isLocalSearch && searchQuery) {
      // For local search, don't change page
      return;
    }
    fetchCategories(page, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Cancel any pending search
    if (searchTimeoutRef) {
      clearTimeout(searchTimeoutRef);
      setSearchTimeoutRef(null);
    }
    
    if (!query.trim()) {
      // Reset to show all categories when search is cleared
      setCategories(allCategories);
      setIsLocalSearch(true);
      return;
    }

    // Always start with local filtering for immediate feedback
    setIsLocalSearch(true);
    filterCategoriesLocally(query);
    
    // For queries longer than 1 character, trigger server search faster
    if (query.length > 1) {
      // Set timeout for server search with faster timing
      const timeoutId = setTimeout(() => {
        setIsLocalSearch(false);
        fetchCategories(1, query);
        setSearchTimeoutRef(null);
      }, 500);
      setSearchTimeoutRef(timeoutId);
    }
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    console.log('Sort by:', field, direction);
    // Implement sorting logic
  };

  const handleResetSearch = () => {
    // Cancel any pending search
    if (searchTimeoutRef) {
      clearTimeout(searchTimeoutRef);
      setSearchTimeoutRef(null);
    }
    
    // Reset all search-related state to show all categories
    setSearchQuery('');
    setCategories(allCategories);
    setIsLocalSearch(true);
  };

  return (
    <div className="page-container">
      <CategoryTable
        categories={categories}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAdd={handleAdd}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onSort={handleSort}
        searchQuery={searchQuery}
        onResetSearch={handleResetSearch}
      />
    </div>
  );
}
