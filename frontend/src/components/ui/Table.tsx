'use client';

import React, { forwardRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  FunnelIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Table variants
const tableVariants = cva(
  'w-full caption-bottom text-sm',
  {
    variants: {
      variant: {
        default: 'border-collapse border border-border',
        striped: 'border-collapse',
        bordered: 'border-collapse border-2 border-border',
        borderless: 'border-collapse'
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

// Table cell variants
const cellVariants = cva(
  'p-2 text-left align-middle transition-colors',
  {
    variants: {
      variant: {
        default: 'border-b border-border',
        striped: 'border-b border-border',
        bordered: 'border border-border',
        borderless: ''
      },
      size: {
        sm: 'p-1 text-xs',
        default: 'p-2 text-sm',
        lg: 'p-3 text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

// Column Definition Type
export interface ColumnDef<T = Record<string, unknown>> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, value: unknown) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
}

// Sort Configuration
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Filter Configuration
export interface FilterConfig {
  [key: string]: string;
}

// Base Table Props
export interface TableProps<T = Record<string, unknown>>
  extends React.TableHTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  data: T[];
  columns: ColumnDef<T>[];
  sortConfig?: SortConfig;
  onSort?: (config: SortConfig) => void;
  filterConfig?: FilterConfig;
  onFilter?: (config: FilterConfig) => void;
  loading?: boolean;
  emptyMessage?: string;
  rowSelection?: boolean;
  selectedRows?: string[];
  onRowSelectionChange?: (selectedRows: string[]) => void;
  getRowId?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  expandable?: boolean;
  renderExpandedRow?: (row: T) => React.ReactNode;
  stickyHeader?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
}

// Table Component Parts
export const Table = forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement> & VariantProps<typeof tableVariants>>(
  ({ className, variant, size, ...props }, ref) => (
    <table
      ref={ref}
      className={cn(tableVariants({ variant, size }), className)}
      {...props}
    />
  )
);

Table.displayName = 'Table';

export const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('border-b', className)} {...props} />
  )
);

TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  )
);

TableBody.displayName = 'TableBody';

export const TableFooter = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
);

TableFooter.displayName = 'TableFooter';

export const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement> & {
  striped?: boolean;
  selected?: boolean;
  clickable?: boolean;
}>(
  ({ className, striped, selected, clickable, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b transition-colors',
        striped && 'even:bg-muted/50',
        selected && 'bg-muted',
        clickable && 'cursor-pointer hover:bg-muted/50',
        'data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  )
);

TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement> & 
  VariantProps<typeof cellVariants> & {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  sticky?: boolean;
}>(
  ({ className, variant, size, sortable, sortDirection, onSort, sticky, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        cellVariants({ variant, size }),
        'h-10 px-2 text-left align-middle font-medium text-muted-foreground',
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        sortable && 'cursor-pointer select-none hover:bg-muted/50',
        sticky && 'sticky top-0 bg-background z-10',
        className
      )}
      onClick={sortable ? onSort : undefined}
      role="columnheader"
      {...(sortable && {
        'aria-sort': sortDirection === 'asc' ? 'ascending' as const : 
                     sortDirection === 'desc' ? 'descending' as const : 
                     'none' as const
      })}
      tabIndex={sortable ? 0 : undefined}
      {...props}
    >
      <div className={cn('flex items-center gap-2', sortable && 'justify-between')}>
        {children}
        {sortable && (
          <div className="flex items-center">
            {sortDirection === 'asc' && <ChevronUpIcon className="w-4 h-4" />}
            {sortDirection === 'desc' && <ChevronDownIcon className="w-4 h-4" />}
            {sortDirection === null && <ChevronUpDownIcon className="w-4 h-4 text-muted-foreground/50" />}
          </div>
        )}
      </div>
    </th>
  )
);

TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement> & 
  VariantProps<typeof cellVariants>>(
  ({ className, variant, size, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        cellVariants({ variant, size }),
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
);

TableCell.displayName = 'TableCell';

export const TableCaption = forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);

TableCaption.displayName = 'TableCaption';

// Data Table Component
export const DataTable = forwardRef<HTMLDivElement, TableProps>(
  ({ 
    data,
    columns,
    variant = 'default',
    size = 'default',
    sortConfig,
    onSort,
    filterConfig,
    onFilter,
    loading = false,
    emptyMessage = 'No data available',
    rowSelection = false,
    selectedRows = [],
    onRowSelectionChange,
    getRowId = (_, index) => index.toString(),
    onRowClick,
    expandable = false,
    renderExpandedRow,
    stickyHeader = false,
    pagination,
    className,
    ...props 
  }, ref) => {
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [localFilters, setLocalFilters] = useState<FilterConfig>(filterConfig || {});

    // Handle sorting
    const handleSort = useCallback((columnId: string) => {
      if (!onSort) return;
      
      const direction = sortConfig?.key === columnId && sortConfig.direction === 'asc' ? 'desc' : 'asc';
      onSort({ key: columnId, direction });
    }, [sortConfig, onSort]);

    // Handle row selection
    const handleRowSelect = useCallback((rowId: string, selected: boolean) => {
      if (!onRowSelectionChange) return;
      
      const newSelection = selected
        ? [...selectedRows, rowId]
        : selectedRows.filter(id => id !== rowId);
      
      onRowSelectionChange(newSelection);
    }, [selectedRows, onRowSelectionChange]);

    // Handle select all
    const handleSelectAll = useCallback((selected: boolean) => {
      if (!onRowSelectionChange) return;
      
      const allRowIds = data.map((row, index) => getRowId(row, index));
      onRowSelectionChange(selected ? allRowIds : []);
    }, [data, getRowId, onRowSelectionChange]);

    // Handle row expansion
    const handleRowExpand = useCallback((rowId: string) => {
      setExpandedRows(prev => 
        prev.includes(rowId)
          ? prev.filter(id => id !== rowId)
          : [...prev, rowId]
      );
    }, []);

    // Get cell value
    const getCellValue = useCallback((row: Record<string, unknown>, column: ColumnDef): React.ReactNode => {
      if (column.cell) {
        const value = column.accessorKey ? row[column.accessorKey] : row;
        return column.cell(row, value);
      }
      const cellValue = column.accessorKey ? row[column.accessorKey] : '';
      return cellValue as React.ReactNode;
    }, []);

    // Check if all rows are selected
    const isAllSelected = useMemo(() => {
      if (data.length === 0) return false;
      return data.every((row, index) => selectedRows.includes(getRowId(row, index)));
    }, [data, selectedRows, getRowId]);

    // Check if some rows are selected
    const isSomeSelected = useMemo(() => {
      return selectedRows.length > 0 && !isAllSelected;
    }, [selectedRows.length, isAllSelected]);

    return (
      <div ref={ref} className={cn('relative w-full', className)} {...props}>
        {/* Filter Bar */}
        {onFilter && (
          <div className="mb-4 flex flex-wrap gap-2">
            {columns
              .filter(column => column.filterable)
              .map(column => (
                <div key={column.id} className="flex items-center gap-2">
                  <FunnelIcon className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Filter ${column.header}...`}
                    value={localFilters[column.id] || ''}
                    onChange={(e) => {
                      const newFilters = { ...localFilters, [column.id]: e.target.value };
                      setLocalFilters(newFilters);
                      onFilter(newFilters);
                    }}
                    className="px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    aria-label={`Filter by ${column.header}`}
                    title={`Filter ${column.header} column`}
                  />
                </div>
              ))}
          </div>
        )}

        {/* Table Container */}
        <div className="relative overflow-auto rounded-md border">
          <Table variant={variant} size={size}>
            <TableHeader className={stickyHeader ? 'sticky top-0 z-10' : ''}>
              <TableRow>
                {rowSelection && (
                  <TableHead variant={variant} size={size}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isSomeSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-border"
                      aria-label={isAllSelected ? 'Deselect all rows' : 'Select all rows'}
                      title={isAllSelected ? 'Deselect all rows' : 'Select all rows'}
                    />
                  </TableHead>
                )}
                
                {expandable && (
                  <TableHead variant={variant} size={size}>
                    <span className="sr-only">Expand</span>
                  </TableHead>
                )}
                
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    variant={variant}
                    size={size}
                    sortable={column.sortable}
                    sortDirection={sortConfig?.key === column.id ? sortConfig.direction : null}
                    onSort={() => handleSort(column.id)}
                    sticky={column.sticky}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      textAlign: column.align
                    }}
                  >
                    {column.header}
                  </TableHead>
                ))}
                
                <TableHead variant={variant} size={size}>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              <AnimatePresence>
                {loading ? (
                  <TableRow>
                    <TableCell 
                      variant={variant} 
                      size={size}
                      colSpan={columns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0) + 1}
                      className="text-center py-8"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      variant={variant} 
                      size={size}
                      colSpan={columns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0) + 1}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, rowIndex) => {
                    const rowId = getRowId(row, rowIndex);
                    const isSelected = selectedRows.includes(rowId);
                    const isExpanded = expandedRows.includes(rowId);
                    
                    return (
                      <React.Fragment key={rowId}>
                        <motion.tr
                          className={cn(
                            'border-b transition-colors',
                            variant === 'striped' && rowIndex % 2 === 1 && 'bg-muted/50',
                            isSelected && 'bg-muted',
                            onRowClick && 'cursor-pointer hover:bg-muted/50'
                          )}
                          onClick={() => onRowClick?.(row, rowIndex)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
                        >
                          {rowSelection && (
                            <TableCell variant={variant} size={size}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                                className="rounded border-border"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={isSelected ? `Deselect row ${rowIndex + 1}` : `Select row ${rowIndex + 1}`}
                                title={isSelected ? 'Deselect this row' : 'Select this row'}
                              />
                            </TableCell>
                          )}
                          
                          {expandable && (
                            <TableCell variant={variant} size={size}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowExpand(rowId);
                                }}
                                className="p-1 hover:bg-muted rounded"
                                aria-label={isExpanded ? `Collapse row ${rowIndex + 1}` : `Expand row ${rowIndex + 1}`}
                                title={isExpanded ? 'Collapse row details' : 'Expand row details'}
                              >
                                {isExpanded ? (
                                  <ChevronUpIcon className="w-4 h-4" />
                                ) : (
                                  <ChevronDownIcon className="w-4 h-4" />
                                )}
                              </button>
                            </TableCell>
                          )}
                          
                          {columns.map((column) => (
                            <TableCell
                              key={column.id}
                              variant={variant}
                              size={size}
                              style={{
                                width: column.width,
                                minWidth: column.minWidth,
                                maxWidth: column.maxWidth,
                                textAlign: column.align
                              }}
                            >
                              {getCellValue(row, column)}
                            </TableCell>
                          ))}
                          
                          <TableCell variant={variant} size={size}>
                            <button 
                              className="p-1 hover:bg-muted rounded"
                              aria-label={`Open menu for row ${rowIndex + 1}`}
                              title="Open row menu"
                            >
                              <EllipsisHorizontalIcon className="w-4 h-4" />
                            </button>
                          </TableCell>
                        </motion.tr>
                        
                        {expandable && isExpanded && renderExpandedRow && (
                          <TableRow>
                            <TableCell 
                              variant={variant} 
                              size={size}
                              colSpan={columns.length + (rowSelection ? 1 : 0) + 2}
                              className="p-0"
                            >
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 bg-muted/30">
                                  {renderExpandedRow(row)}
                                </div>
                              </motion.div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Pagination Info */}
        {pagination && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div>
              Showing {Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalItems)} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </div>
            {selectedRows.length > 0 && (
              <div>
                {selectedRows.length} of {data.length} row(s) selected
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';

export default DataTable;

