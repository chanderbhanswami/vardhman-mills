'use client';

import React, { useState, forwardRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import {
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  BuildingOfficeIcon,
  TagIcon,
  DocumentIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';

// Timeline variants
const timelineVariants = cva(
  'relative',
  {
    variants: {
      orientation: {
        vertical: 'flex flex-col',
        horizontal: 'flex flex-row overflow-x-auto pb-4',
      },
      variant: {
        default: '',
        card: 'space-y-4',
        compact: 'space-y-2',
        detailed: 'space-y-6',
      },
      size: {
        sm: 'text-sm',
        default: '',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
      variant: 'default',
      size: 'default',
    },
  }
);

// Timeline item variants
const timelineItemVariants = cva(
  'relative flex items-start',
  {
    variants: {
      orientation: {
        vertical: 'flex-row',
        horizontal: 'flex-col min-w-fit',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  }
);

// Types
export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  content?: React.ReactNode;
  date: Date | string;
  time?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'draft';
  category?: string;
  location?: string;
  attendees?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  tags?: string[];
  icon?: React.ReactNode;
  color?: string;
  href?: string;
  metadata?: Record<string, unknown>;
}

export interface TimelineProps extends VariantProps<typeof timelineVariants> {
  items: TimelineItem[];
  className?: string;
  showConnector?: boolean;
  connectorColor?: string;
  onItemClick?: (item: TimelineItem) => void;
  onItemHover?: (item: TimelineItem | null) => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  sortBy?: 'date' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
  filterBy?: {
    status?: string[];
    category?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  groupBy?: 'date' | 'category' | 'status' | 'month' | 'year';
  showGroupHeaders?: boolean;
  itemRenderer?: (item: TimelineItem, index: number) => React.ReactNode;
}

export interface InteractiveTimelineProps extends TimelineProps {
  editable?: boolean;
  onItemEdit?: (item: TimelineItem) => void;
  onItemDelete?: (itemId: string) => void;
  onItemAdd?: (afterItemId?: string) => void;
  onItemMove?: (itemId: string, newIndex: number) => void;
  draggable?: boolean;
}

// Utility functions
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (time: string | Date): string => {
  if (typeof time === 'string') return time;
  return time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusIcon = (status: TimelineItem['status']) => {
  switch (status) {
    case 'completed':
      return <CheckIcon className="h-4 w-4" />;
    case 'cancelled':
      return <XMarkIcon className="h-4 w-4" />;
    case 'in-progress':
      return <div className="h-2 w-2 rounded-full bg-current animate-pulse" />;
    case 'draft':
      return <DocumentIcon className="h-4 w-4" />;
    default:
      return <ClockIcon className="h-4 w-4" />;
  }
};

const getStatusColor = (status: TimelineItem['status']) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100 border-green-300';
    case 'cancelled':
      return 'text-red-600 bg-red-100 border-red-300';
    case 'in-progress':
      return 'text-blue-600 bg-blue-100 border-blue-300';
    case 'draft':
      return 'text-gray-600 bg-gray-100 border-gray-300';
    default:
      return 'text-yellow-600 bg-yellow-100 border-yellow-300';
  }
};

const sortItems = (items: TimelineItem[], sortBy: string, sortOrder: string) => {
  return [...items].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
        const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
        comparison = dateA.getTime() - dateB.getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = (a.status || 'pending').localeCompare(b.status || 'pending');
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

const filterItems = (items: TimelineItem[], filterBy?: TimelineProps['filterBy']) => {
  if (!filterBy) return items;
  
  return items.filter(item => {
    if (filterBy.status && filterBy.status.length > 0) {
      if (!filterBy.status.includes(item.status || 'pending')) return false;
    }
    
    if (filterBy.category && filterBy.category.length > 0) {
      if (!item.category || !filterBy.category.includes(item.category)) return false;
    }
    
    if (filterBy.dateRange) {
      const itemDate = typeof item.date === 'string' ? new Date(item.date) : item.date;
      if (itemDate < filterBy.dateRange.start || itemDate > filterBy.dateRange.end) return false;
    }
    
    return true;
  });
};

const groupItems = (items: TimelineItem[], groupBy?: string) => {
  if (!groupBy) return { ungrouped: items };
  
  return items.reduce((groups, item) => {
    let key: string;
    
    switch (groupBy) {
      case 'date':
        key = formatDate(item.date);
        break;
      case 'category':
        key = item.category || 'Uncategorized';
        break;
      case 'status':
        key = item.status || 'pending';
        break;
      case 'month':
        const monthDate = typeof item.date === 'string' ? new Date(item.date) : item.date;
        key = monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        break;
      case 'year':
        const yearDate = typeof item.date === 'string' ? new Date(item.date) : item.date;
        key = yearDate.getFullYear().toString();
        break;
      default:
        key = 'ungrouped';
    }
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    
    return groups;
  }, {} as Record<string, TimelineItem[]>);
};

// Timeline Dot component
const TimelineDot: React.FC<{
  item: TimelineItem;
  className?: string;
}> = ({ item, className }) => {
  const statusColor = getStatusColor(item.status);
  
  return (
    <div className={cn('relative z-10 flex items-center justify-center', className)}>
      <div
        className={cn(
          'w-8 h-8 rounded-full border-2 flex items-center justify-center',
          item.color ? `bg-${item.color}-100 border-${item.color}-300 text-${item.color}-600` : statusColor
        )}
      >
        {item.icon || getStatusIcon(item.status)}
      </div>
    </div>
  );
};

// Timeline Content component
const TimelineContent: React.FC<{
  item: TimelineItem;
  orientation: 'vertical' | 'horizontal';
  variant: string;
  onItemClick?: (item: TimelineItem) => void;
  className?: string;
}> = ({ item, orientation, variant, onItemClick, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleClick = () => {
    if (onItemClick) {
      onItemClick(item);
    } else if (item.content) {
      setIsExpanded(!isExpanded);
    }
  };

  const contentClickable = Boolean(onItemClick || item.content || item.href);

  return (
    <motion.div
      className={cn(
        'flex-1 pb-8',
        orientation === 'horizontal' ? 'pt-4 px-4' : 'pl-6',
        className
      )}
      layout
    >
      <div
        className={cn(
          'group',
          variant === 'card' && 'bg-card border border-border rounded-lg p-4 shadow-sm',
          variant === 'detailed' && 'bg-background border-l-4 border-primary pl-4',
          contentClickable && 'cursor-pointer hover:bg-accent/50 transition-colors',
          !variant || variant === 'default' ? 'pb-2' : ''
        )}
        onClick={contentClickable ? handleClick : undefined}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                'font-medium',
                variant === 'compact' ? 'text-sm' : 'text-base'
              )}>
                {item.href ? (
                  <a 
                    href={item.href}
                    className="hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </h3>
              
              {item.status && (
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  getStatusColor(item.status)
                )}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              )}
            </div>
            
            {item.subtitle && (
              <p className="text-sm text-muted-foreground mb-2">
                {item.subtitle}
              </p>
            )}
            
            {item.description && (
              <p className="text-sm mb-3">
                {item.description}
              </p>
            )}
          </div>
          
          <div className="text-right text-xs text-muted-foreground ml-4">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <time dateTime={typeof item.date === 'string' ? item.date : item.date.toISOString()}>
                {formatDate(item.date)}
              </time>
            </div>
            {item.time && (
              <div className="flex items-center gap-1 mt-1">
                <ClockIcon className="h-3 w-3" />
                <span>{typeof item.time === 'string' ? item.time : formatTime(item.time)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        {(item.location || item.category || item.attendees || item.tags) && (
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            {item.location && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-3 w-3" />
                <span>{item.location}</span>
              </div>
            )}
            
            {item.category && (
              <div className="flex items-center gap-1">
                <BuildingOfficeIcon className="h-3 w-3" />
                <span>{item.category}</span>
              </div>
            )}
            
            {item.attendees && item.attendees.length > 0 && (
              <div className="flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                <span>{item.attendees.length} attendees</span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs"
              >
                <TagIcon className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expandable Content */}
        <AnimatePresence>
          {item.content && (isExpanded || variant === 'detailed') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 overflow-hidden"
            >
              <div className="border-t border-border pt-3">
                {item.content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand/Collapse Button */}
        {item.content && variant !== 'detailed' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUpIcon className="h-3 w-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-3 w-3" />
                Show more
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Timeline Connector component
const TimelineConnector: React.FC<{
  orientation: 'vertical' | 'horizontal';
  isLast: boolean;
  color?: string;
  className?: string;
}> = ({ orientation, isLast, color = 'border-border', className }) => {
  if (isLast) return null;
  
  return (
    <div
      className={cn(
        'absolute z-0',
        orientation === 'vertical' ? 'left-4 top-8 bottom-0 w-px border-l-2' : 'top-4 left-8 right-0 h-px border-t-2',
        color,
        className
      )}
    />
  );
};

// Main Timeline component
export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  ({
    items,
    className,
    orientation = 'vertical',
    variant = 'default',
    size = 'default',
    showConnector = true,
    connectorColor = 'border-border',
    onItemClick,
    onItemHover,
    sortBy = 'date',
    sortOrder = 'asc',
    filterBy,
    groupBy,
    showGroupHeaders = true,
    itemRenderer,
    ...props
  }, ref) => {
    // Process items
    const processedItems = useMemo(() => {
      let result = filterItems(items, filterBy);
      result = sortItems(result, sortBy, sortOrder);
      return result;
    }, [items, filterBy, sortBy, sortOrder]);

    const groupedItems = useMemo(() => {
      return groupItems(processedItems, groupBy);
    }, [processedItems, groupBy]);

    return (
      <div
        ref={ref}
        className={cn(timelineVariants({ orientation, variant, size }), className)}
        {...props}
      >
        {Object.entries(groupedItems).map(([groupKey, groupItems]) => (
          <div key={groupKey} className={orientation === 'horizontal' ? 'flex flex-col mr-8' : ''}>
            {/* Group Header */}
            {showGroupHeaders && groupBy && groupKey !== 'ungrouped' && (
              <div className={cn(
                'mb-4 pb-2 border-b border-border',
                orientation === 'horizontal' ? 'mb-2 pb-1' : ''
              )}>
                <h3 className="text-lg font-semibold text-foreground">
                  {groupKey}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {groupItems.length} {groupItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            )}

            {/* Items */}
            <div className={cn(
              orientation === 'vertical' ? 'space-y-0' : 'flex gap-6'
            )}>
              {groupItems.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(timelineItemVariants({ orientation }))}
                  onMouseEnter={() => onItemHover?.(item)}
                  onMouseLeave={() => onItemHover?.(null)}
                >
                  {/* Custom Renderer */}
                  {itemRenderer ? (
                    itemRenderer(item, index)
                  ) : (
                    <>
                      {/* Timeline Dot */}
                      <TimelineDot item={item} />

                      {/* Connector */}
                      {showConnector && (
                        <TimelineConnector
                          orientation={orientation || 'vertical'}
                          isLast={index === groupItems.length - 1 && 
                                  Object.keys(groupedItems).indexOf(groupKey) === Object.keys(groupedItems).length - 1}
                          color={connectorColor}
                        />
                      )}

                      {/* Content */}
                      <TimelineContent
                        item={item}
                        orientation={orientation || 'vertical'}
                        variant={variant || 'default'}
                        onItemClick={onItemClick}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {processedItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ClockIcon className="h-8 w-8 mx-auto mb-2" />
            <p>No timeline items found</p>
          </div>
        )}
      </div>
    );
  }
);

Timeline.displayName = 'Timeline';

// Interactive Timeline with editing capabilities
export const InteractiveTimeline = forwardRef<HTMLDivElement, InteractiveTimelineProps>(
  ({
    items,
    editable = false,
    onItemEdit,
    onItemDelete,
    onItemAdd,
    onItemMove,
    draggable = false,
    ...timelineProps
  }, ref) => {
    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, itemId: string) => {
      if (!draggable) return;
      setDraggedItem(itemId);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
      if (!draggable) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
      if (!draggable || !draggedItem) return;
      e.preventDefault();
      
      onItemMove?.(draggedItem, targetIndex);
      setDraggedItem(null);
    };

    const customItemRenderer = (item: TimelineItem, index: number) => (
      <div className="relative group">
        <div
          draggable={draggable}
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          className={cn(
            draggable && 'cursor-move',
            draggedItem === item.id && 'opacity-50'
          )}
        >
          {/* Timeline Dot */}
          <TimelineDot item={item} />

          {/* Connector */}
          <TimelineConnector
            orientation={timelineProps.orientation || 'vertical'}
            isLast={index === items.length - 1}
            color={timelineProps.connectorColor}
          />

          {/* Content */}
          <TimelineContent
            item={item}
            orientation={timelineProps.orientation || 'vertical'}
            variant={timelineProps.variant || 'default'}
            onItemClick={timelineProps.onItemClick}
          />
        </div>

        {/* Edit Controls */}
        {editable && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 bg-background border border-border rounded-md p-1 shadow-sm">
              {onItemEdit && (
                <button
                  type="button"
                  onClick={() => onItemEdit(item)}
                  className="p-1 hover:bg-accent rounded"
                  title="Edit item"
                >
                  <DocumentIcon className="h-3 w-3" />
                </button>
              )}
              
              {onItemAdd && (
                <button
                  type="button"
                  onClick={() => onItemAdd(item.id)}
                  className="p-1 hover:bg-accent rounded"
                  title="Add item after"
                >
                  <PlusIcon className="h-3 w-3" />
                </button>
              )}
              
              {onItemDelete && (
                <button
                  type="button"
                  onClick={() => onItemDelete(item.id)}
                  className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded"
                  title="Delete item"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              )}
              
              {draggable && (
                <div className="p-1 cursor-move" title="Drag to reorder">
                  <ArrowsUpDownIcon className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );

    return (
      <Timeline
        ref={ref}
        items={items}
        itemRenderer={customItemRenderer}
        {...timelineProps}
      />
    );
  }
);

InteractiveTimeline.displayName = 'InteractiveTimeline';

// Timeline Stats component
export const TimelineStats: React.FC<{
  items: TimelineItem[];
  className?: string;
}> = ({ items, className }) => {
  const stats = useMemo(() => {
    const statusCounts = items.reduce((acc, item) => {
      const status = item.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categories = new Set(items.map(item => item.category).filter(Boolean));
    const dateRange = items.length > 0 ? {
      earliest: new Date(Math.min(...items.map(item => 
        typeof item.date === 'string' ? new Date(item.date).getTime() : item.date.getTime()
      ))),
      latest: new Date(Math.max(...items.map(item => 
        typeof item.date === 'string' ? new Date(item.date).getTime() : item.date.getTime()
      ))),
    } : null;

    return {
      total: items.length,
      statusCounts,
      categories: categories.size,
      dateRange,
    };
  }, [items]);

  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-2xl font-bold text-foreground">{stats.total}</div>
        <div className="text-sm text-muted-foreground">Total Items</div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-2xl font-bold text-green-600">
          {stats.statusCounts.completed || 0}
        </div>
        <div className="text-sm text-muted-foreground">Completed</div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-2xl font-bold text-blue-600">
          {stats.statusCounts['in-progress'] || 0}
        </div>
        <div className="text-sm text-muted-foreground">In Progress</div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-2xl font-bold text-foreground">{stats.categories}</div>
        <div className="text-sm text-muted-foreground">Categories</div>
      </div>

      {stats.dateRange && (
        <div className="col-span-2 lg:col-span-4 bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Date Range</div>
          <div className="text-sm">
            {formatDate(stats.dateRange.earliest)} - {formatDate(stats.dateRange.latest)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
