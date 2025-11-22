'use client';

import React, { useState, useCallback } from 'react';
import { Bookmark, BookmarkCheck, Folder, Tag, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Types
export interface BookmarkFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  postCount?: number;
  isPrivate?: boolean;
  createdAt: string;
}

export interface BookmarkData {
  id: string;
  postId: string;
  folderId?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  isPrivate?: boolean;
}

export interface BlogBookmarkProps {
  postId: string;
  isBookmarked?: boolean;
  bookmarkCount?: number;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  showLabel?: boolean;
  className?: string;
  onBookmark?: (postId: string, isBookmarked: boolean, bookmarkData?: Partial<BookmarkData>) => void;
  disabled?: boolean;
  enableFolders?: boolean;
  folders?: BookmarkFolder[];
  currentBookmark?: BookmarkData;
  animated?: boolean;
}

export const BlogBookmark: React.FC<BlogBookmarkProps> = ({
  postId,
  isBookmarked = false,
  bookmarkCount = 0,
  variant = 'default',
  size = 'md',
  showCount = true,
  showLabel = false,
  className,
  onBookmark,
  disabled = false,
  enableFolders = false,
  folders = [],
  currentBookmark,
  animated = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>(currentBookmark?.folderId || '');
  const [notes, setNotes] = useState(currentBookmark?.notes || '');
  const [tags, setTags] = useState<string[]>(currentBookmark?.tags || []);
  const [newTag, setNewTag] = useState('');

  // Handle simple bookmark toggle
  const handleSimpleBookmark = useCallback(async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onBookmark?.(postId, !isBookmarked);
      
      if (animated) {
        toast.success(
          isBookmarked ? 'Bookmark removed' : 'Post bookmarked',
          {
            icon: isBookmarked ? '💔' : '❤️',
            duration: 2000
          }
        );
      }
    } catch (error) {
      console.error('Failed to update bookmark:', error);
      toast.error('Failed to update bookmark');
    } finally {
      setIsLoading(false);
    }
  }, [postId, isBookmarked, disabled, isLoading, onBookmark, animated]);

  // Handle advanced bookmark
  const handleAdvancedBookmark = useCallback(async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      const bookmarkData: Partial<BookmarkData> = {
        folderId: selectedFolder || undefined,
        notes: notes || undefined,
        tags: tags.length > 0 ? tags : undefined
      };

      await onBookmark?.(postId, true, bookmarkData);
      setShowAdvanced(false);
      
      toast.success('Bookmark saved successfully', {
        icon: '📁',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to save bookmark:', error);
      toast.error('Failed to save bookmark');
    } finally {
      setIsLoading(false);
    }
  }, [postId, selectedFolder, notes, tags, disabled, isLoading, onBookmark]);

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-8 text-sm px-2';
      case 'md': return 'h-9 text-sm px-3';
      case 'lg': return 'h-10 text-base px-4';
      default: return 'h-9 text-sm px-3';
    }
  };

  // Get icon size
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'md': return 'w-4 h-4';
      case 'lg': return 'w-5 h-5';
      default: return 'w-4 h-4';
    }
  };

  // Bookmark icon with animation
  const BookmarkIcon = () => (
    <motion.div
      whileHover={animated ? { scale: 1.1 } : {}}
      whileTap={animated ? { scale: 0.9 } : {}}
    >
      {isBookmarked ? (
        <BookmarkCheck className={cn(getIconSize(), 'text-blue-600 dark:text-blue-400')} />
      ) : (
        <Bookmark className={cn(getIconSize(), 'text-gray-600 dark:text-gray-400')} />
      )}
    </motion.div>
  );

  // Advanced bookmark form
  const AdvancedBookmarkForm = () => (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
      <h4 className="font-medium">Bookmark Options</h4>
      
      {/* Folder Selection */}
      {enableFolders && folders.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Save to folder</label>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-sm"
            aria-label="Select bookmark folder"
          >
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name} ({folder.postCount} posts)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your thoughts about this post..."
          className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-sm min-h-[80px]"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center space-x-1 text-xs"
            >
              <Tag className="w-3 h-3" />
              <span>{tag}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-red-100"
                onClick={() => removeTag(tag)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button onClick={addTag} size="sm" disabled={!newTag.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <div className="flex space-x-2">
          {isBookmarked && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                handleSimpleBookmark();
                setShowAdvanced(false);
              }}
              disabled={isLoading}
            >
              Remove
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleAdvancedBookmark}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'icon-only':
      return (
        <Tooltip content={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}>
          <Button
            variant="ghost"
            size="sm"
            className={cn('p-2', className)}
            onClick={handleSimpleBookmark}
            disabled={disabled || isLoading}
          >
            <BookmarkIcon />
          </Button>
        </Tooltip>
      );

    case 'minimal':
      return (
        <Button
          variant="ghost"
          size="sm"
          className={cn('flex items-center space-x-1 text-gray-600 hover:text-blue-600', className)}
          onClick={handleSimpleBookmark}
          disabled={disabled || isLoading}
        >
          <BookmarkIcon />
          {showCount && bookmarkCount > 0 && (
            <span className="text-xs">{bookmarkCount}</span>
          )}
        </Button>
      );

    case 'compact':
      return (
        <div className={cn('flex items-center space-x-1', className)}>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1 px-2"
            onClick={handleSimpleBookmark}
            disabled={disabled || isLoading}
          >
            <BookmarkIcon />
            {showLabel && <span>Bookmark</span>}
          </Button>
          {showCount && bookmarkCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {bookmarkCount}
            </Badge>
          )}
        </div>
      );

    case 'detailed':
      return (
        <div className={cn('space-y-4', className)}>
          <div className="flex items-center space-x-2">
            <Button
              variant={isBookmarked ? "default" : "outline"}
              className={cn('flex items-center space-x-2', getSizeClasses())}
              onClick={handleSimpleBookmark}
              disabled={disabled}
            >
              <BookmarkIcon />
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              {showCount && bookmarkCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {bookmarkCount}
                </Badge>
              )}
            </Button>
            
            {(enableFolders || isBookmarked) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Folder className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {showAdvanced && <AdvancedBookmarkForm />}
        </div>
      );

    default:
      return (
        <div className={cn('space-y-2', className)}>
          <Button
            variant="ghost"
            className={cn('flex items-center space-x-2', getSizeClasses())}
            onClick={handleSimpleBookmark}
            disabled={disabled}
          >
            <BookmarkIcon />
            {showLabel && <span>Bookmark</span>}
            {showCount && bookmarkCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {bookmarkCount}
              </Badge>
            )}
          </Button>
          
          {showAdvanced && <AdvancedBookmarkForm />}
          
          {(enableFolders || isBookmarked) && !showAdvanced && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500"
              onClick={() => setShowAdvanced(true)}
            >
              More options
            </Button>
          )}
        </div>
      );
  }
};

// Bookmark Collection Component
export interface BookmarkCollectionProps {
  folders: BookmarkFolder[];
  onCreateFolder?: (folder: Omit<BookmarkFolder, 'id' | 'createdAt'>) => void;
  onDeleteFolder?: (folderId: string) => void;
  className?: string;
}

export const BookmarkCollection: React.FC<BookmarkCollectionProps> = ({
  folders,
  onCreateFolder,
  onDeleteFolder,
  className
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');

  const handleCreateFolder = () => {
    if (newFolderName.trim() && onCreateFolder) {
      onCreateFolder({
        name: newFolderName.trim(),
        description: newFolderDescription.trim() || undefined,
        color: '#3b82f6',
        postCount: 0
      });
      setNewFolderName('');
      setNewFolderDescription('');
      setShowCreateForm(false);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Bookmark Collections</h3>
          <Button 
            size="sm" 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        
        {showCreateForm && (
          <div className="space-y-3 p-3 border rounded-lg mb-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
            />
            <Input
              value={newFolderDescription}
              onChange={(e) => setNewFolderDescription(e.target.value)}
              placeholder="Description (optional)..."
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                Create
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <div className="flex items-center space-x-2">
                <Folder className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">{folder.name}</p>
                  {folder.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {folder.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {folder.postCount || 0}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteFolder?.(folder.id)}
                  className="p-1 h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          
          {folders.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">
              No folders yet. Create one to organize your bookmarks.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogBookmark;
