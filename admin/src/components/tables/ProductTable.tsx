'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

interface Product {
  _id: string;
  name: string;
  category: { name: string };
  variants: { price: number; stock: number }[];
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  onDelete: (productId: string) => void;
  onAdd?: () => void;
  onBulkDelete?: (productIds: string[]) => Promise<void>;
  onBulkToggleStatus?: (productIds: string[], isActive: boolean) => Promise<void>;
  onBulkToggleFeatured?: (productIds: string[], isFeatured: boolean) => Promise<void>;
  pagination?: {
    page: number;
    pages: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onSearchSuggestions?: (query: string) => void;
  searchSuggestions?: SearchSuggestion[];
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  searchQuery?: string;
  isSearching?: boolean;
  onResetSearch?: () => void;
}

export default function ProductTable({ 
  products, 
  loading = false, 
  onDelete, 
  onAdd,
  onBulkDelete,
  onBulkToggleStatus,
  onBulkToggleFeatured,
  pagination,
  onPageChange,
  onSearch,
  onSearchSuggestions,
  onSort,
  isSearching = false,
  onResetSearch,
  searchQuery,
}: ProductTableProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchSuggestionsList, setSearchSuggestionsList] = useState<SearchSuggestion[]>([]);
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
  
  // Sync local search query with parent search query
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);
  
  // Update suggestions when search query changes
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
      
      products.forEach(product => {
        const name = product.name.toLowerCase();
        const categoryName = product.category?.name?.toLowerCase() || '';
        
        if (name.includes(lowerQuery)) {
          suggestions.push({
            id: `name-${product._id}`,
            text: product.name,
            type: 'Product',
            data: { productId: product._id, type: 'name' }
          });
        }
        
        if (categoryName.includes(lowerQuery)) {
          suggestions.push({
            id: `category-${product._id}`,
            text: product.category.name,
            type: 'Category',
            data: { productId: product._id, type: 'category' }
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
  }, [localSearchQuery, onSearchSuggestions]); // products is intentionally excluded to prevent infinite loops
  
  // Selection action definitions
  const selectionActions: SelectionAction[] = [
    {
      ...commonActions.delete,
      disabled: !onBulkDelete || isPerformingBulkAction,
    },
    {
      ...commonActions.activate,
      label: 'Activate',
      disabled: !onBulkToggleStatus || isPerformingBulkAction,
    },
    {
      ...commonActions.deactivate,
      label: 'Deactivate',
      disabled: !onBulkToggleStatus || isPerformingBulkAction,
    },
    {
      id: 'feature',
      label: 'Mark Featured',
      icon: commonActions.activate.icon,
      variant: 'primary' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Mark Products as Featured',
      confirmationMessage: 'Are you sure you want to mark the selected products as featured?',
      disabled: !onBulkToggleFeatured || isPerformingBulkAction,
    },
    {
      id: 'unfeature',
      label: 'Remove Featured',
      icon: commonActions.deactivate.icon,
      variant: 'warning' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Remove Featured Status',
      confirmationMessage: 'Are you sure you want to remove featured status from the selected products?',
      disabled: !onBulkToggleFeatured || isPerformingBulkAction,
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
        case 'feature':
          if (onBulkToggleFeatured) {
            await onBulkToggleFeatured(selectedIds, true);
          }
          break;
        case 'unfeature':
          if (onBulkToggleFeatured) {
            await onBulkToggleFeatured(selectedIds, false);
          }
          break;
      }
      
      // Clear selection after successful action
      setSelectedProducts([]);
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
      setSelectedProducts(products.map(product => product._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
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
            <h3 className="text-lg leading-6 font-medium text-gray-900">Products</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your product inventory and details
            </p>
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              Add Product
            </button>
          )}
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
            placeholder="Search products by name or category..."
            suggestions={searchSuggestionsList}
            isLoading={isSearching}
          />
        </div>
      </div>

      {/* Selection Action Bar */}
      {selectedProducts.length > 0 && (
        <SelectionActionBar
          selectedCount={selectedProducts.length}
          totalCount={products.length}
          actions={selectionActions}
          onActionExecute={handleBulkAction}
          selectedIds={selectedProducts}
          onClearSelection={() => setSelectedProducts([])}
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
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    title="Select all products"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Product
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
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
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={(e) => handleSelectProduct(product._id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      title={`Select product ${product.name}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.images && product.images.length > 0 ? (
                      <div className="h-10 w-10 flex-shrink-0">
                        <Image
                          className="h-10 w-10 rounded-lg object-cover"
                          src={product.images[0]}
                          alt={product.name}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        <HighlightedText text={product.name} highlight={localSearchQuery} />
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.isFeatured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <HighlightedText text={product.category.name} highlight={localSearchQuery} />
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.variants.length > 0 && `₹${product.variants[0].price.toLocaleString()}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.variants.reduce((total, variant) => total + variant.stock, 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/dashboard/products/${product._id}`}>
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link href={`/dashboard/products/${product._id}/edit`}>
                        <button
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => onDelete(product._id)}
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