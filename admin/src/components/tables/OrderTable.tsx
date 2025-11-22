'use client';

import { useState, useEffect } from 'react';
import {
  EyeIcon,
  PencilIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronUpDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import EnhancedSearch, { SearchSuggestion } from '@/components/ui/EnhancedSearch';
import SelectionActionBar, { commonActions, SelectionAction } from '@/components/ui/SelectionActionBar';
import HighlightedText from '@/components/ui/HighlightedText';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    image?: string;
  };
  variant: {
    size: string;
    color: string;
    sku: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  guestEmail?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentInfo: {
    method: string;
    status: string;
    transactionId?: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderTableProps {
  orders: Order[];
  loading?: boolean;
  onView: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onEdit: (order: Order) => void;
  pagination?: {
    page: number;
    pages: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onSearchSuggestions?: (query: string) => void;
  onFilter?: (filters: { status?: string; dateRange?: string }) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  isSearching?: boolean;
  searchQuery?: string;
  onResetSearch?: () => void;
  onBulkDelete?: (orderIds: string[]) => Promise<void>;
  onBulkUpdateStatus?: (orderIds: string[], status: Order['status']) => Promise<void>;
}

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pending' },
  confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, label: 'Confirmed' },
  processing: { color: 'bg-purple-100 text-purple-800', icon: ClockIcon, label: 'Processing' },
  shipped: { color: 'bg-indigo-100 text-indigo-800', icon: TruckIcon, label: 'Shipped' },
  delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Delivered' },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Cancelled' },
  returned: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon, label: 'Returned' },
};

export default function OrderTable({
  orders,
  loading = false,
  onView,
  onUpdateStatus,
  onEdit,
  pagination,
  onPageChange,
  onSearch,
  onSearchSuggestions,
  onFilter,
  onSort,
  isSearching = false,
  searchQuery,
  onResetSearch,
  onBulkDelete,
  onBulkUpdateStatus,
}: OrderTableProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchSuggestionsList, setSearchSuggestionsList] = useState<SearchSuggestion[]>([]);
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sync local search query with parent search query
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  // Update suggestions when orders or search query changes
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
      
      orders.forEach(order => {
        const orderNumber = order.orderNumber.toLowerCase();
        const customerName = order.user 
          ? `${order.user.firstName} ${order.user.lastName}`.toLowerCase()
          : order.guestEmail?.toLowerCase() || '';
        const email = order.user?.email?.toLowerCase() || order.guestEmail?.toLowerCase() || '';
        
        if (orderNumber.includes(lowerQuery)) {
          suggestions.push({
            id: `order-${order._id}`,
            text: order.orderNumber,
            type: 'Order Number',
            data: { orderId: order._id, type: 'orderNumber' }
          });
        }
        
        if (customerName.includes(lowerQuery)) {
          suggestions.push({
            id: `customer-${order._id}`,
            text: order.user 
              ? `${order.user.firstName} ${order.user.lastName}`
              : order.guestEmail || '',
            type: 'Customer',
            data: { orderId: order._id, type: 'customer' }
          });
        }
        
        if (email.includes(lowerQuery)) {
          suggestions.push({
            id: `email-${order._id}`,
            text: order.user?.email || order.guestEmail || '',
            type: 'Email',
            data: { orderId: order._id, type: 'email' }
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
  }, [localSearchQuery, onSearchSuggestions]); // orders is intentionally excluded to prevent infinite loops

  // Selection action definitions
  const selectionActions: SelectionAction[] = [
    {
      ...commonActions.delete,
      disabled: !onBulkDelete || isPerformingBulkAction,
    },
    {
      id: 'confirm',
      label: 'Confirm Orders',
      icon: CheckCircleIcon,
      variant: 'primary' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Confirm Orders',
      confirmationMessage: 'Are you sure you want to confirm the selected orders?',
      disabled: !onBulkUpdateStatus || isPerformingBulkAction,
    },
    {
      id: 'ship',
      label: 'Mark as Shipped',
      icon: TruckIcon,
      variant: 'primary' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Mark Orders as Shipped',
      confirmationMessage: 'Are you sure you want to mark the selected orders as shipped?',
      disabled: !onBulkUpdateStatus || isPerformingBulkAction,
    },
    {
      id: 'cancel',
      label: 'Cancel Orders',
      icon: XCircleIcon,
      variant: 'danger' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Cancel Orders',
      confirmationMessage: 'Are you sure you want to cancel the selected orders?',
      disabled: !onBulkUpdateStatus || isPerformingBulkAction,
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
        case 'confirm':
          if (onBulkUpdateStatus) {
            await onBulkUpdateStatus(selectedIds, 'confirmed');
          }
          break;
        case 'ship':
          if (onBulkUpdateStatus) {
            await onBulkUpdateStatus(selectedIds, 'shipped');
          }
          break;
        case 'cancel':
          if (onBulkUpdateStatus) {
            await onBulkUpdateStatus(selectedIds, 'cancelled');
          }
          break;
      }
      
      // Clear selection after successful action
      setSelectedOrders([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const handleFilter = () => {
    onFilter?.({
      status: statusFilter || undefined,
      dateRange: dateFilter || undefined,
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
      setSelectedOrders(orders.map(order => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getCustomerName = (order: Order) => {
    if (order.user) {
      return `${order.user.firstName} ${order.user.lastName}`;
    }
    return order.guestEmail || 'Guest Customer';
  };

  const getCustomerEmail = (order: Order) => {
    return order.user?.email || order.guestEmail || '';
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
            <h3 className="text-lg leading-6 font-medium text-gray-900">Orders</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage customer orders and track their status
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FunnelIcon className="-ml-1 mr-2 h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 space-y-4">
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
            placeholder="Search by order number, customer name, or email..."
            suggestions={searchSuggestionsList}
            isLoading={isSearching}
          />

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  title="Order Status"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Date Range"
                  title="Date Range"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
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
      {selectedOrders.length > 0 && (
        <SelectionActionBar
          selectedCount={selectedOrders.length}
          totalCount={orders.length}
          actions={selectionActions}
          onActionExecute={handleBulkAction}
          selectedIds={selectedOrders}
          onClearSelection={() => setSelectedOrders([])}
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
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    title="Select all orders"
                    placeholder="Select all orders"
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('orderNumber')}
                >
                  <div className="flex items-center">
                    Order #
                    {sortField === 'orderNumber' && (
                      <ChevronUpDownIcon className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center">
                    Customer
                    {sortField === 'customer' && (
                      <ChevronUpDownIcon className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center">
                    Total
                    {sortField === 'total' && (
                      <ChevronUpDownIcon className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      <ChevronUpDownIcon className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Date
                    {sortField === 'createdAt' && (
                      <ChevronUpDownIcon className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const status = statusConfig[order.status];

                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={(e) => handleSelectOrder(order._id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        title={`Select order ${order.orderNumber}`}
                        placeholder={`Select order ${order.orderNumber}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <HighlightedText text={order.orderNumber} highlight={localSearchQuery} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <HighlightedText text={getCustomerName(order)} highlight={localSearchQuery} />
                      </div>
                      <div className="text-sm text-gray-500">
                        <HighlightedText text={getCustomerEmail(order)} highlight={localSearchQuery} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateStatus(order._id, e.target.value as Order['status'])}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${status.color}`}
                        title="Click to change order status"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onView(order)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onEdit(order)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
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
                    disabled={pagination.page === 1}
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
                    disabled={pagination.page === pagination.pages}
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
