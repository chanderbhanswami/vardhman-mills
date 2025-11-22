import { useState, useCallback, useMemo } from 'react';

export interface OrderItem {
  id: string | number;
  position: number;
  data?: unknown;
}

export interface DragItem {
  id: string | number;
  index: number;
  type?: string;
}

export interface OrderingOptions {
  initialOrder?: (string | number)[];
  enableDragAndDrop?: boolean;
  lockFirst?: boolean;
  lockLast?: boolean;
  maxItems?: number;
  onOrderChange?: (newOrder: (string | number)[], oldOrder: (string | number)[]) => void;
  onItemMove?: (item: OrderItem, fromIndex: number, toIndex: number) => void;
  onItemAdd?: (item: OrderItem, index: number) => void;
  onItemRemove?: (item: OrderItem, index: number) => void;
}

export interface OrderingReturn<T = unknown> {
  items: OrderItem[];
  order: (string | number)[];
  orderedData: T[];
  moveItem: (fromIndex: number, toIndex: number) => void;
  moveItemById: (id: string | number, toIndex: number) => void;
  moveItemToTop: (id: string | number) => void;
  moveItemToBottom: (id: string | number) => void;
  moveItemUp: (id: string | number) => void;
  moveItemDown: (id: string | number) => void;
  addItem: (id: string | number, index?: number, data?: T) => void;
  removeItem: (id: string | number) => void;
  updateItem: (id: string | number, data: Partial<T>) => void;
  setOrder: (newOrder: (string | number)[]) => void;
  resetOrder: () => void;
  canMoveUp: (id: string | number) => boolean;
  canMoveDown: (id: string | number) => boolean;
  canMove: (id: string | number, toIndex: number) => boolean;
  getItemPosition: (id: string | number) => number;
  getItemById: (id: string | number) => OrderItem | undefined;
  swapItems: (id1: string | number, id2: string | number) => void;
  reverseOrder: () => void;
  shuffleOrder: () => void;
  sortOrder: (compareFn?: (a: OrderItem, b: OrderItem) => number) => void;
  dragHandlers?: {
    onDragStart: (e: React.DragEvent, item: OrderItem) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, targetIndex: number) => void;
    onDragEnter: (e: React.DragEvent, targetIndex: number) => void;
    onDragLeave: (e: React.DragEvent) => void;
  };
}

export const useOrdering = <T = unknown>(
  data: T[] = [],
  options: OrderingOptions = {}
): OrderingReturn<T> => {
  const {
    initialOrder,
    enableDragAndDrop = false,
    lockFirst = false,
    lockLast = false,
    maxItems,
    onOrderChange,
    onItemMove,
    onItemAdd,
    onItemRemove,
  } = options;

  // Initialize order based on data indices or provided initial order
  const [order, setOrderState] = useState<(string | number)[]>(() => {
    if (initialOrder && initialOrder.length > 0) {
      return initialOrder;
    }
    return data.map((_, index) => index);
  });

  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [, setDragOverIndex] = useState<number | null>(null);

  // Create ordered items based on current order
  const items = useMemo(() => {
    return order.map((id, position) => ({
      id,
      position,
      data: typeof id === 'number' && data[id] ? data[id] : undefined,
    }));
  }, [order, data]);

  // Get ordered data based on current order
  const orderedData = useMemo(() => {
    return order.map(id => {
      if (typeof id === 'number' && data[id]) {
        return data[id];
      }
      // If id is not a data index, try to find matching item
      const item = items.find(item => item.id === id);
      return item?.data as T;
    }).filter(Boolean);
  }, [order, data, items]);

  const isValidMove = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return false;
      if (fromIndex < 0 || toIndex < 0) return false;
      if (fromIndex >= order.length || toIndex >= order.length) return false;
      
      // Check lock constraints
      if (lockFirst && (fromIndex === 0 || toIndex === 0)) return false;
      if (lockLast && (fromIndex === order.length - 1 || toIndex === order.length - 1)) return false;
      
      return true;
    },
    [order.length, lockFirst, lockLast]
  );

  const setOrder = useCallback(
    (newOrder: (string | number)[]) => {
      const oldOrder = [...order];
      setOrderState(newOrder);
      onOrderChange?.(newOrder, oldOrder);
    },
    [order, onOrderChange]
  );

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!isValidMove(fromIndex, toIndex)) return;

      const newOrder = [...order];
      const [movedItem] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedItem);
      
      setOrder(newOrder);
      
      const item = items.find(item => item.position === fromIndex);
      if (item) {
        onItemMove?.(item, fromIndex, toIndex);
      }
    },
    [order, isValidMove, setOrder, items, onItemMove]
  );

  const moveItemById = useCallback(
    (id: string | number, toIndex: number) => {
      const fromIndex = order.indexOf(id);
      if (fromIndex !== -1) {
        moveItem(fromIndex, toIndex);
      }
    },
    [order, moveItem]
  );

  const moveItemToTop = useCallback(
    (id: string | number) => {
      const targetIndex = lockFirst ? 1 : 0;
      moveItemById(id, targetIndex);
    },
    [moveItemById, lockFirst]
  );

  const moveItemToBottom = useCallback(
    (id: string | number) => {
      const targetIndex = lockLast ? order.length - 2 : order.length - 1;
      moveItemById(id, targetIndex);
    },
    [moveItemById, lockLast, order.length]
  );

  const moveItemUp = useCallback(
    (id: string | number) => {
      const currentIndex = order.indexOf(id);
      if (currentIndex > 0) {
        const targetIndex = lockFirst && currentIndex === 1 ? 1 : currentIndex - 1;
        moveItem(currentIndex, targetIndex);
      }
    },
    [order, moveItem, lockFirst]
  );

  const moveItemDown = useCallback(
    (id: string | number) => {
      const currentIndex = order.indexOf(id);
      if (currentIndex !== -1 && currentIndex < order.length - 1) {
        const targetIndex = lockLast && currentIndex === order.length - 2 
          ? order.length - 2 
          : currentIndex + 1;
        moveItem(currentIndex, targetIndex);
      }
    },
    [order, moveItem, lockLast]
  );

  const addItem = useCallback(
    (id: string | number, index?: number, itemData?: T) => {
      if (maxItems && order.length >= maxItems) return;
      
      const insertIndex = index !== undefined ? index : order.length;
      const newOrder = [...order];
      newOrder.splice(insertIndex, 0, id);
      
      setOrder(newOrder);
      
      const newItem: OrderItem = {
        id,
        position: insertIndex,
        data: itemData,
      };
      
      onItemAdd?.(newItem, insertIndex);
    },
    [order, maxItems, setOrder, onItemAdd]
  );

  const removeItem = useCallback(
    (id: string | number) => {
      const index = order.indexOf(id);
      if (index !== -1) {
        const newOrder = order.filter(itemId => itemId !== id);
        setOrder(newOrder);
        
        const item = items.find(item => item.id === id);
        if (item) {
          onItemRemove?.(item, index);
        }
      }
    },
    [order, setOrder, items, onItemRemove]
  );

  const updateItem = useCallback(
    (id: string | number, itemData: Partial<T>) => {
      // This would typically update the data associated with the item
      // Implementation depends on how data is managed in the parent component
      const item = items.find(item => item.id === id);
      if (item && item.data) {
        item.data = { ...item.data as T, ...itemData };
      }
    },
    [items]
  );

  const resetOrder = useCallback(() => {
    const originalOrder = initialOrder || data.map((_, index) => index);
    setOrder(originalOrder);
  }, [initialOrder, data, setOrder]);

  const canMoveUp = useCallback(
    (id: string | number) => {
      const index = order.indexOf(id);
      const targetIndex = index - 1;
      return index > 0 && !(lockFirst && targetIndex === 0);
    },
    [order, lockFirst]
  );

  const canMoveDown = useCallback(
    (id: string | number) => {
      const index = order.indexOf(id);
      const targetIndex = index + 1;
      return index !== -1 && 
             index < order.length - 1 && 
             !(lockLast && targetIndex === order.length - 1);
    },
    [order, lockLast]
  );

  const canMove = useCallback(
    (id: string | number, toIndex: number) => {
      const fromIndex = order.indexOf(id);
      return fromIndex !== -1 && isValidMove(fromIndex, toIndex);
    },
    [order, isValidMove]
  );

  const getItemPosition = useCallback(
    (id: string | number) => {
      return order.indexOf(id);
    },
    [order]
  );

  const getItemById = useCallback(
    (id: string | number) => {
      return items.find(item => item.id === id);
    },
    [items]
  );

  const swapItems = useCallback(
    (id1: string | number, id2: string | number) => {
      const index1 = order.indexOf(id1);
      const index2 = order.indexOf(id2);
      
      if (index1 !== -1 && index2 !== -1 && isValidMove(index1, index2)) {
        const newOrder = [...order];
        [newOrder[index1], newOrder[index2]] = [newOrder[index2], newOrder[index1]];
        setOrder(newOrder);
      }
    },
    [order, isValidMove, setOrder]
  );

  const reverseOrder = useCallback(() => {
    const newOrder = [...order].reverse();
    setOrder(newOrder);
  }, [order, setOrder]);

  const shuffleOrder = useCallback(() => {
    const shuffled = [...order];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Respect lock constraints
      if ((lockFirst && (i === 0 || i === 1)) || (lockLast && (i === shuffled.length - 1 || i === shuffled.length - 2))) {
        continue;
      }
      
      const j = Math.floor(Math.random() * (i + 1));
      
      // Skip locked positions
      if ((lockFirst && j === 0) || (lockLast && j === shuffled.length - 1)) {
        continue;
      }
      
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setOrder(shuffled);
  }, [order, setOrder, lockFirst, lockLast]);

  const sortOrder = useCallback(
    (compareFn?: (a: OrderItem, b: OrderItem) => number) => {
      const itemsToSort = [...items];
      
      if (compareFn) {
        itemsToSort.sort(compareFn);
      } else {
        // Default sort by id
        itemsToSort.sort((a, b) => {
          if (typeof a.id === 'number' && typeof b.id === 'number') {
            return a.id - b.id;
          }
          return String(a.id).localeCompare(String(b.id));
        });
      }
      
      const newOrder = itemsToSort.map(item => item.id);
      setOrder(newOrder);
    },
    [items, setOrder]
  );

  // Drag and drop handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, item: OrderItem) => {
      if (!enableDragAndDrop) return;
      
      setDraggedItem({
        id: item.id,
        index: item.position,
      });
      
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(item.id));
    },
    [enableDragAndDrop]
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDraggedItem(null);
      setDragOverIndex(null);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!enableDragAndDrop || !draggedItem) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    [enableDragAndDrop, draggedItem]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      if (!enableDragAndDrop || !draggedItem) return;
      
      e.preventDefault();
      
      const fromIndex = draggedItem.index;
      moveItem(fromIndex, targetIndex);
      
      setDraggedItem(null);
      setDragOverIndex(null);
    },
    [enableDragAndDrop, draggedItem, moveItem]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      if (!enableDragAndDrop) return;
      e.preventDefault();
      setDragOverIndex(targetIndex);
    },
    [enableDragAndDrop]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!enableDragAndDrop) return;
      e.preventDefault();
      
      // Only clear if we're actually leaving the drop zone
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setDragOverIndex(null);
      }
    },
    [enableDragAndDrop]
  );

  const dragHandlers = enableDragAndDrop ? {
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
  } : undefined;

  return {
    items,
    order,
    orderedData,
    moveItem,
    moveItemById,
    moveItemToTop,
    moveItemToBottom,
    moveItemUp,
    moveItemDown,
    addItem,
    removeItem,
    updateItem,
    setOrder,
    resetOrder,
    canMoveUp,
    canMoveDown,
    canMove,
    getItemPosition,
    getItemById,
    swapItems,
    reverseOrder,
    shuffleOrder,
    sortOrder,
    dragHandlers,
  };
};

// Specialized ordering hooks
export const useListOrdering = <T>(list: T[], getId: (item: T) => string | number) => {
  const ids = list.map(getId);
  return useOrdering(list, { initialOrder: ids });
};

export const useDragAndDropOrdering = <T>(
  data: T[],
  options: Omit<OrderingOptions, 'enableDragAndDrop'> = {}
) => {
  return useOrdering(data, { ...options, enableDragAndDrop: true });
};

export const useKanbanOrdering = <T>(
  columns: Record<string, T[]>,
  options: OrderingOptions = {}
) => {
  const [columnOrders, setColumnOrders] = useState<Record<string, (string | number)[]>>({});

  const moveItemBetweenColumns = useCallback(
    (itemId: string | number, fromColumn: string, toColumn: string, toIndex: number) => {
      setColumnOrders(prev => ({
        ...prev,
        [fromColumn]: prev[fromColumn]?.filter(id => id !== itemId) || [],
        [toColumn]: [
          ...(prev[toColumn]?.slice(0, toIndex) || []),
          itemId,
          ...(prev[toColumn]?.slice(toIndex) || []),
        ],
      }));
    },
    []
  );

  // Create individual ordering hooks for each column
  const createColumnOrdering = useCallback((columnId: string) => {
    return {
      columnId,
      data: columns[columnId] || [],
      initialOrder: columnOrders[columnId],
      onOrderChange: (newOrder: (string | number)[]) => {
        setColumnOrders(prev => ({ ...prev, [columnId]: newOrder }));
      },
      ...options,
    };
  }, [columns, columnOrders, options]);

  return {
    createColumnOrdering,
    moveItemBetweenColumns,
    columnOrders,
  };
};

export default useOrdering;
