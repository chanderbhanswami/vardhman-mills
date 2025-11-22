'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronUpDownIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import EnhancedSearch, { SearchSuggestion } from '@/components/ui/EnhancedSearch';
import SelectionActionBar, { commonActions, SelectionAction } from '@/components/ui/SelectionActionBar';
import HighlightedText from '@/components/ui/HighlightedText';

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

interface CategoryTableProps {
  categories: Category[];
  loading?: boolean;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onView: (category: Category) => void;
  onAdd: () => void;
  pagination?: {
    page: number;
    pages: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onSearchSuggestions?: (query: string) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  isSearching?: boolean;
  searchQuery?: string;
  onResetSearch?: () => void;
  onBulkDelete?: (categoryIds: string[]) => Promise<void>;
  onBulkToggleStatus?: (categoryIds: string[], isActive: boolean) => Promise<void>;
}

export default function CategoryTable({
  categories,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onAdd,
  pagination,
  onPageChange,
  onSearch,
  onSearchSuggestions,
  onSort,
  isSearching = false,
  searchQuery,
  onResetSearch,
  onBulkDelete,
  onBulkToggleStatus,
}: CategoryTableProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchSuggestionsList, setSearchSuggestionsList] = useState<SearchSuggestion[]>([]);
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);

  // Sync local search query with parent search query
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  // Update suggestions when categories or search query changes
  useEffect(() => {
    if (onSearchSuggestions) {
      onSearchSuggestions(localSearchQuery);
    } else {
      // Generate suggestions inline to avoid dependency issues
      if (!localSearchQuery.trim()) {
        setSearchSuggestionsList([]);
        return;
      }
      
      const lowerQuery = localSearchQuery.toLowerCase();
      const suggestions: SearchSuggestion[] = [];
      
      categories.forEach(category => {
        const name = category.name.toLowerCase();
        const description = category.description?.toLowerCase() || '';
        
        if (name.includes(lowerQuery)) {
          suggestions.push({
            id: `name-${category._id}`,
            text: category.name,
            type: 'Category',
            data: { categoryId: category._id, type: 'name' }
          });
        }
        
        if (description.includes(lowerQuery)) {
          suggestions.push({
            id: `description-${category._id}`,
            text: category.description!,
            type: 'Description',
            data: { categoryId: category._id, type: 'description' }
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
  }, [localSearchQuery, onSearchSuggestions]); // categories is intentionally excluded to prevent infinite loops

  // Selection action definitions
  const selectionActions: SelectionAction[] = [
    {
      ...commonActions.delete,
      disabled: !onBulkDelete || isPerformingBulkAction,
    },
    {
      id: 'activate',
      label: 'Activate Categories',
      icon: commonActions.activate.icon,
      variant: 'primary' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Activate Categories',
      confirmationMessage: 'Are you sure you want to activate the selected categories?',
      disabled: !onBulkToggleStatus || isPerformingBulkAction,
    },
    {
      id: 'deactivate',
      label: 'Deactivate Categories',
      icon: commonActions.deactivate.icon,
      variant: 'warning' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Deactivate Categories',
      confirmationMessage: 'Are you sure you want to deactivate the selected categories?',
      disabled: !onBulkToggleStatus || isPerformingBulkAction,
    },
  ];

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
      setSelectedCategories([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort?.(field, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(categories.map(category => category._id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
            <h3 className="text-lg leading-6 font-medium text-gray-900">Categories</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your product categories and subcategories
            </p>
          </div>
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            Add Category
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-4">
          <EnhancedSearch
            value={localSearchQuery}
            onSearch={(query) => {
              setLocalSearchQuery(query);
              onSearch?.(query);
            }}
            onReset={() => {
              setLocalSearchQuery('');
              onResetSearch?.();
            }}
            showReset={!!localSearchQuery}
            placeholder="Search categories by name or description..."
            suggestions={searchSuggestionsList}
            isLoading={isSearching}
          />
        </div>
      </div>

      {/* Selection Action Bar */}
      {selectedCategories.length > 0 && (
        <SelectionActionBar
          selectedCount={selectedCategories.length}
          totalCount={categories.length}
          actions={selectionActions}
          onActionExecute={handleBulkAction}
          selectedIds={selectedCategories}
          onClearSelection={() => setSelectedCategories([])}
        />
      )}

      {/* Table */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === categories.length && categories.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    title="Select all categories"
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('productCount')}
                >
                  <div className="flex items-center">
                    Products
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category._id)}
                      onChange={(e) => handleSelectCategory(category._id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      title={`Select category ${category.name}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        <HighlightedText text={category.name} highlight={localSearchQuery} />
                      </div>
                      {category.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          <HighlightedText text={category.description} highlight={localSearchQuery} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.image ? (
                      <div className="h-10 w-10 flex-shrink-0">
                        <Image
                          className="h-10 w-10 rounded-lg object-cover"
                          src={category.image}
                          alt={category.name}
                          width={40}
                          height={40}
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.parentCategory ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {category.parentCategory.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">Root Category</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {category.productCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(category.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onView(category)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(category)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(category._id)}
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
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.page - 1) * 10 + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * 10, pagination.total)}
              </span>{' '}
              of <span className="font-medium">{pagination.total}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  pagination.page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  pagination.page === pagination.pages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
