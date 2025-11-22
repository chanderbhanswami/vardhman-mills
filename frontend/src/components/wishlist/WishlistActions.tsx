'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EllipsisVerticalIcon,
  ShareIcon,
  TrashIcon,
  FolderIcon,
  ShoppingCartIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ListBulletIcon,
  Squares2X2Icon,
  PrinterIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';

// UI Components
import { Button } from '@/components/ui/Button';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Slider } from '@/components/ui/Slider';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';

// Hooks and Contexts
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/useToast';

// Utils
import { cn } from '@/lib/utils';

// Types
interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  addedAt: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface WishlistActionsProps {
  items: WishlistItem[];
  selectedItems: string[];
  onSelectionChange: (itemIds: string[]) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  filters: {
    category?: string;
    priceRange?: [number, number];
    inStock?: boolean;
    priority?: string;
    tags?: string[];
  };
  onFiltersChange: (filters: {
    category?: string;
    priceRange?: [number, number];
    inStock?: boolean;
    priority?: string;
    tags?: string[];
  }) => void;
  className?: string;
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (itemIds: string[]) => Promise<void>;
  destructive?: boolean;
  disabled?: boolean;
}

const WishlistActions: React.FC<WishlistActionsProps> = ({
  items,
  selectedItems,
  onSelectionChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  filters,
  onFiltersChange,
  className
}) => {
  // Hooks
  const { removeFromWishlist, moveToCart } = useWishlist();
  const { toast } = useToast();
  
  // Mock missing function
  const updateWishlistItem = useCallback(async (id: string, updates: { priority?: string }) => {
    console.log('Update wishlist item:', id, updates);
    return Promise.resolve();
  }, []);

  // State
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isCreateListDialogOpen, setIsCreateListDialogOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    allowComments: false,
    showPrices: true,
    showNotes: false
  });

  // Computed values
  const hasSelectedItems = selectedItems.length > 0;
  const selectedItemsCount = selectedItems.length;
  const totalItems = items.length;
  const isAllSelected = selectedItems.length === items.length && items.length > 0;
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < items.length;

  const availableCategories = useMemo(() => {
    const categories = new Set(items.map(item => item.category));
    return Array.from(categories);
  }, [items]);

  const availableTags = useMemo(() => {
    const tags = new Set(items.flatMap(item => item.tags));
    return Array.from(tags);
  }, [items]);

  const priceRange = useMemo(() => {
    const prices = items.map(item => item.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [items]);

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'addedAt', label: 'Date Added' },
    { value: 'priority', label: 'Priority' },
    { value: 'category', label: 'Category' },
    { value: 'rating', label: 'Rating' }
  ];

  // Utility functions
  const exportToCSV = useCallback((items: WishlistItem[]) => {
    const headers = ['Name', 'Price', 'Category', 'Rating', 'In Stock', 'Priority', 'Added Date', 'Notes'];
    const rows = items.map(item => [
      item.name,
      item.price.toString(),
      item.category,
      item.rating.toString(),
      item.inStock ? 'Yes' : 'No',
      item.priority,
      new Date(item.addedAt).toLocaleDateString(),
      item.notes || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  }, []);

  const downloadCSV = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const printWishlist = useCallback((itemIds: string[]) => {
    const printItems = items.filter(item => itemIds.includes(item.id));
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>My Wishlist</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .item { border-bottom: 1px solid #ddd; padding: 10px 0; }
              .item-name { font-weight: bold; }
              .item-price { color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>My Wishlist</h1>
              <p>Total Items: ${printItems.length}</p>
            </div>
            ${printItems.map(item => `
              <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-price">$${item.price.toFixed(2)}</div>
                <div>Category: ${item.category}</div>
                <div>Priority: ${item.priority}</div>
                ${item.notes ? `<div>Notes: ${item.notes}</div>` : ''}
              </div>
            `).join('')}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [items]);

  // Event handlers
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  }, [isAllSelected, items, onSelectionChange]);

  const handleBulkAction = useCallback(async (actionId: string) => {
    setBulkActionLoading(actionId);
    
    try {
      switch (actionId) {
        case 'remove':
          await Promise.all(selectedItems.map(id => removeFromWishlist(id)));
          toast({
            title: 'Items removed',
            description: `${selectedItemsCount} items removed from wishlist`
          });
          break;

        case 'moveToCart':
          await Promise.all(selectedItems.map(id => moveToCart(id)));
          toast({
            title: 'Moved to cart',
            description: `${selectedItemsCount} items moved to cart`
          });
          break;

        case 'setPriorityHigh':
          await Promise.all(selectedItems.map(id => 
            updateWishlistItem(id, { priority: 'high' })
          ));
          toast({
            title: 'Priority updated',
            description: `${selectedItemsCount} items set to high priority`
          });
          break;

        case 'setPriorityMedium':
          await Promise.all(selectedItems.map(id => 
            updateWishlistItem(id, { priority: 'medium' })
          ));
          toast({
            title: 'Priority updated',
            description: `${selectedItemsCount} items set to medium priority`
          });
          break;

        case 'setPriorityLow':
          await Promise.all(selectedItems.map(id => 
            updateWishlistItem(id, { priority: 'low' })
          ));
          toast({
            title: 'Priority updated',
            description: `${selectedItemsCount} items set to low priority`
          });
          break;

        case 'export':
          const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
          const csvContent = exportToCSV(selectedItemsData);
          downloadCSV(csvContent, 'wishlist.csv');
          toast({
            title: 'Export successful',
            description: `${selectedItemsCount} items exported`
          });
          break;

        case 'print':
          printWishlist(selectedItems);
          break;

        default:
          break;
      }

      // Clear selection after successful action
      onSelectionChange([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast({
        title: 'Action failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setBulkActionLoading(null);
    }
  }, [selectedItems, selectedItemsCount, removeFromWishlist, moveToCart, updateWishlistItem, items, onSelectionChange, toast, exportToCSV, downloadCSV, printWishlist]);

  const handleShareWishlist = useCallback(async () => {
    try {
      // Mock share functionality
      const shareUrl = `${window.location.origin}/wishlist/shared/mock-id`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied',
        description: 'Wishlist link copied to clipboard'
      });
      setIsShareDialogOpen(false);
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: 'Share failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const handleCreateNewList = useCallback(async () => {
    if (!newListName.trim()) return;
    
    try {
      // This would be an API call to create a new wishlist
      console.log('Creating new list:', { name: newListName, description: newListDescription });
      
      toast({
        title: 'List created',
        description: `"${newListName}" has been created`
      });
      
      setIsCreateListDialogOpen(false);
      setNewListName('');
      setNewListDescription('');
    } catch (error) {
      console.error('Create list failed:', error);
      toast({
        title: 'Failed to create list',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  }, [newListName, newListDescription, toast]);

  // Bulk actions configuration
  const bulkActions: BulkAction[] = useMemo(() => [
    {
      id: 'moveToCart',
      label: 'Move to Cart',
      icon: ShoppingCartIcon,
      action: () => handleBulkAction('moveToCart')
    },
    {
      id: 'setPriorityHigh',
      label: 'Set High Priority',
      icon: StarSolidIcon,
      action: () => handleBulkAction('setPriorityHigh')
    },
    {
      id: 'setPriorityMedium',
      label: 'Set Medium Priority',
      icon: StarSolidIcon,
      action: () => handleBulkAction('setPriorityMedium')
    },
    {
      id: 'setPriorityLow',
      label: 'Set Low Priority',
      icon: StarSolidIcon,
      action: () => handleBulkAction('setPriorityLow')
    },
    {
      id: 'export',
      label: 'Export to CSV',
      icon: ArrowDownTrayIcon,
      action: () => handleBulkAction('export')
    },
    {
      id: 'print',
      label: 'Print List',
      icon: PrinterIcon,
      action: () => handleBulkAction('print')
    },
    {
      id: 'remove',
      label: 'Remove Items',
      icon: TrashIcon,
      action: () => handleBulkAction('remove'),
      destructive: true
    }
  ], [handleBulkAction]);

  // Render components
  const renderBulkActions = useCallback(() => {
    if (!hasSelectedItems) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
      >
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {selectedItemsCount} selected
        </Badge>
        
        <div className="flex items-center gap-1">
          {bulkActions.slice(0, 3).map((action) => (
            <Tooltip key={action.id} content={action.label}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => action.action(selectedItems)}
                disabled={bulkActionLoading === action.id}
                className={cn(
                  'p-2',
                  action.destructive && 'text-red-600 hover:text-red-700 hover:bg-red-50'
                )}
              >
                <action.icon className="w-4 h-4" />
              </Button>
            </Tooltip>
          ))}
          
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" className="p-2">
                <EllipsisVerticalIcon className="w-4 h-4" />
              </Button>
            }
            items={bulkActions.slice(3).map(action => ({
              key: action.id,
              label: action.label,
              icon: action.icon,
              destructive: action.destructive,
              onClick: () => action.action(selectedItems)
            }))}
            align="end"
          />
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectionChange([])}
          className="p-2 ml-auto"
        >
          <XMarkIcon className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }, [hasSelectedItems, selectedItemsCount, bulkActions, bulkActionLoading, onSelectionChange, selectedItems]);

  const renderFilters = useCallback(() => {
    if (!isFiltersOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              options={[
                { value: 'all', label: 'All Categories' },
                ...availableCategories.map(category => ({ value: category, label: category }))
              ]}
              value={filters.category || 'all'} 
              onValueChange={(value) => 
                onFiltersChange({ 
                  ...filters, 
                  category: value === 'all' ? undefined : value as string
                })
              }
              placeholder="All Categories"
            />
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select 
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
              ]}
              value={filters.priority || 'all'} 
              onValueChange={(value) => 
                onFiltersChange({ 
                  ...filters, 
                  priority: value === 'all' ? undefined : value as string
                })
              }
              placeholder="All Priorities"
            />
          </div>

          {/* Stock Filter */}
          <div className="space-y-2">
            <Label>Availability</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="in-stock"
                checked={filters.inStock === true}
                onCheckedChange={(checked) => 
                  onFiltersChange({ 
                    ...filters, 
                    inStock: checked ? true : undefined 
                  })
                }
              />
              <Label htmlFor="in-stock">In Stock Only</Label>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="px-2">
              <Slider
                value={filters.priceRange || priceRange}
                onValueChange={(value) => 
                  onFiltersChange({ 
                    ...filters, 
                    priceRange: value as [number, number]
                  })
                }
                max={priceRange[1]}
                min={priceRange[0]}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>${(filters.priceRange?.[0] || priceRange[0]).toFixed(0)}</span>
                <span>${(filters.priceRange?.[1] || priceRange[1]).toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags Filter */}
        {availableTags.length > 0 && (
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={filters.tags?.includes(tag) || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const currentTags = filters.tags || [];
                      const newTags = checked
                        ? [...currentTags, tag]
                        : currentTags.filter(t => t !== tag);
                      onFiltersChange({
                        ...filters,
                        tags: newTags.length > 0 ? newTags : undefined
                      });
                    }}
                  />
                  <Label htmlFor={`tag-${tag}`} className="text-sm">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFiltersChange({})}
          >
            Clear All Filters
          </Button>
        </div>
      </motion.div>
    );
  }, [isFiltersOpen, filters, availableCategories, availableTags, priceRange, onFiltersChange]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left Side - Selection & Bulk Actions */}
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isPartiallySelected;
                }}
                onChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm text-gray-600">
                {isAllSelected ? 'Deselect All' : 'Select All'} ({totalItems})
              </Label>
            </div>
          )}
        </div>

        {/* Right Side - View & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={cn(
              'gap-2',
              isFiltersOpen && 'bg-gray-100'
            )}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
          </Button>

          {/* Sort */}
          <div className="flex items-center gap-1">
            <Select 
              options={sortOptions}
              value={sortBy} 
              onValueChange={(value) => onSortChange(value as string)}
              className="w-auto"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2"
            >
              {sortOrder === 'asc' ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* View Mode */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="p-2"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="p-2"
            >
              <ListBulletIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* More Actions */}
          <DropdownMenu
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <EllipsisVerticalIcon className="w-4 h-4" />
                More
              </Button>
            }
            items={[
              {
                key: 'share',
                label: 'Share Wishlist',
                icon: ShareIcon,
                onClick: () => setIsShareDialogOpen(true)
              },
              {
                key: 'create-list',
                label: 'Create New List',
                icon: FolderIcon,
                onClick: () => setIsCreateListDialogOpen(true)
              },
              {
                key: 'export-all',
                label: 'Export All',
                icon: ArrowDownTrayIcon,
                onClick: () => {
                  const csvContent = exportToCSV(items);
                  downloadCSV(csvContent, 'complete-wishlist.csv');
                }
              },
              {
                key: 'print-all',
                label: 'Print All',
                icon: PrinterIcon,
                onClick: () => printWishlist(items.map(i => i.id))
              }
            ]}
            align="end"
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {renderBulkActions()}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {renderFilters()}
      </AnimatePresence>

      {/* Share Dialog */}
      <Modal open={isShareDialogOpen} onClose={() => setIsShareDialogOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Share Your Wishlist</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-2">
              <Label>Share Settings</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="public">Make public</Label>
                  <Switch
                    id="public"
                    checked={shareSettings.isPublic}
                    onCheckedChange={(checked) => 
                      setShareSettings(prev => ({ ...prev, isPublic: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="comments">Allow comments</Label>
                  <Switch
                    id="comments"
                    checked={shareSettings.allowComments}
                    onCheckedChange={(checked) => 
                      setShareSettings(prev => ({ ...prev, allowComments: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="prices">Show prices</Label>
                  <Switch
                    id="prices"
                    checked={shareSettings.showPrices}
                    onCheckedChange={(checked) => 
                      setShareSettings(prev => ({ ...prev, showPrices: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notes">Show notes</Label>
                  <Switch
                    id="notes"
                    checked={shareSettings.showNotes}
                    onCheckedChange={(checked) => 
                      setShareSettings(prev => ({ ...prev, showNotes: checked }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleShareWishlist}>
                <ShareIcon className="w-4 h-4 mr-2" />
                Create Share Link
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Create List Dialog */}
      <Modal open={isCreateListDialogOpen} onClose={() => setIsCreateListDialogOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Create New Wishlist</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-2">
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Birthday Wishlist, Holiday Gifts"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="list-description">Description (optional)</Label>
              <TextArea
                id="list-description"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Describe what this list is for..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateListDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNewList} disabled={!newListName.trim()}>
                <FolderIcon className="w-4 h-4 mr-2" />
                Create List
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default WishlistActions;
