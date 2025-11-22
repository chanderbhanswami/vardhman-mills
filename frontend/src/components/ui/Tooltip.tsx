'use client';

import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Tooltip variants
const tooltipVariants = cva(
  'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
  {
    variants: {
      variant: {
        default: 'bg-popover text-popover-foreground border-border',
        dark: 'bg-gray-900 text-white border-gray-800',
        light: 'bg-white text-gray-900 border-gray-200',
        success: 'bg-green-500 text-white border-green-600',
        warning: 'bg-yellow-500 text-white border-yellow-600',
        error: 'bg-red-500 text-white border-red-600',
        info: 'bg-blue-500 text-white border-blue-600',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        default: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Arrow variants
const arrowVariants = cva(
  'absolute w-2 h-2 rotate-45',
  {
    variants: {
      variant: {
        default: 'bg-popover border-border',
        dark: 'bg-gray-900 border-gray-800',
        light: 'bg-white border-gray-200',
        success: 'bg-green-500 border-green-600',
        warning: 'bg-yellow-500 border-yellow-600',
        error: 'bg-red-500 border-red-600',
        info: 'bg-blue-500 border-blue-600',
      },
      placement: {
        top: '-bottom-1 left-1/2 -translate-x-1/2 border-r border-b',
        'top-start': '-bottom-1 left-3 border-r border-b',
        'top-end': '-bottom-1 right-3 border-r border-b',
        bottom: '-top-1 left-1/2 -translate-x-1/2 border-l border-t',
        'bottom-start': '-top-1 left-3 border-l border-t',
        'bottom-end': '-top-1 right-3 border-l border-t',
        left: '-right-1 top-1/2 -translate-y-1/2 border-t border-l',
        'left-start': '-right-1 top-3 border-t border-l',
        'left-end': '-right-1 bottom-3 border-t border-l',
        right: '-left-1 top-1/2 -translate-y-1/2 border-b border-r',
        'right-start': '-left-1 top-3 border-b border-r',
        'right-end': '-left-1 bottom-3 border-b border-r',
      },
    },
    defaultVariants: {
      variant: 'default',
      placement: 'top',
    },
  }
);

export type TooltipPlacement = 
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  variant?: VariantProps<typeof tooltipVariants>['variant'];
  size?: VariantProps<typeof tooltipVariants>['size'];
  placement?: TooltipPlacement;
  showArrow?: boolean;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  skipDelayDuration?: number;
  closeDelay?: number;
  offset?: number;
  className?: string;
  contentClassName?: string;
  arrowClassName?: string;
  disableHoverableContent?: boolean;
  forceMount?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionBoundary?: Element | Element[];
  collisionPadding?: number;
  sticky?: 'partial' | 'always';
}

// Tooltip context for managing global tooltip behavior
interface TooltipContextType {
  skipDelayDuration: number;
  isDelayGroup: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

export const TooltipProvider: React.FC<{
  children: React.ReactNode;
  skipDelayDuration?: number;
}> = ({
  children,
  skipDelayDuration = 300,
}) => {
  const [isDelayGroup, setIsDelayGroup] = useState(false);
  const skipDelayTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleOpen = () => {
    clearTimeout(skipDelayTimerRef.current);
    setIsDelayGroup(false);
  };

  const handleClose = () => {
    skipDelayTimerRef.current = setTimeout(() => {
      setIsDelayGroup(true);
    }, skipDelayDuration);
  };

  const contextValue: TooltipContextType = {
    skipDelayDuration: skipDelayDuration,
    isDelayGroup,
    onOpen: handleOpen,
    onClose: handleClose,
  };

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  );
};

// Hook for using tooltip context
const useTooltipContext = () => {
  const context = useContext(TooltipContext);
  return context;
};

// Hook for positioning calculation
const useTooltipPosition = (
  triggerRef: React.RefObject<HTMLElement | null>,
  tooltipRef: React.RefObject<HTMLElement | null>,
  placement: TooltipPlacement = 'top',
  offset: number = 8,
  avoidCollisions: boolean = true
) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [actualPlacement, setActualPlacement] = useState<TooltipPlacement>(placement);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let x = 0;
    let y = 0;
    let finalPlacement = placement;

    // Calculate base position based on placement
    switch (placement.split('-')[0]) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - offset;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + offset;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Handle alignment for start/end variants
    if (placement.includes('-')) {
      const align = placement.split('-')[1];
      const isVertical = placement.startsWith('top') || placement.startsWith('bottom');
      
      if (isVertical) {
        if (align === 'start') {
          x = triggerRect.left;
        } else if (align === 'end') {
          x = triggerRect.right - tooltipRect.width;
        }
      } else {
        if (align === 'start') {
          y = triggerRect.top;
        } else if (align === 'end') {
          y = triggerRect.bottom - tooltipRect.height;
        }
      }
    }

    // Collision detection and adjustment
    if (avoidCollisions) {
      const padding = 8;
      
      // Check if tooltip goes outside viewport
      if (x < padding) {
        x = padding;
      } else if (x + tooltipRect.width > viewport.width - padding) {
        x = viewport.width - tooltipRect.width - padding;
      }
      
      if (y < padding) {
        // If tooltip goes above viewport, try to show it below
        if (placement.startsWith('top')) {
          y = triggerRect.bottom + offset;
          finalPlacement = placement.replace('top', 'bottom') as TooltipPlacement;
        } else {
          y = padding;
        }
      } else if (y + tooltipRect.height > viewport.height - padding) {
        // If tooltip goes below viewport, try to show it above
        if (placement.startsWith('bottom')) {
          y = triggerRect.top - tooltipRect.height - offset;
          finalPlacement = placement.replace('bottom', 'top') as TooltipPlacement;
        } else {
          y = viewport.height - tooltipRect.height - padding;
        }
      }
      
      // Handle left/right collisions
      if (placement.startsWith('left') && x < padding) {
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        finalPlacement = placement.replace('left', 'right') as TooltipPlacement;
      } else if (placement.startsWith('right') && x + tooltipRect.width > viewport.width - padding) {
        x = triggerRect.left - tooltipRect.width - offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        finalPlacement = placement.replace('right', 'left') as TooltipPlacement;
      }
    }

    setPosition({ x, y });
    setActualPlacement(finalPlacement);
  };

  return { position, actualPlacement, calculatePosition };
};

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  variant = 'default',
  size = 'default',
  placement = 'top',
  showArrow = true,
  disabled = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delayDuration = 700,
  skipDelayDuration = 300,
  closeDelay = 0,
  offset = 8,
  className,
  contentClassName,
  arrowClassName,
  disableHoverableContent = false,
  forceMount = false,
  avoidCollisions = true,
}) => {
  const context = useTooltipContext();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const closeTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const { position, actualPlacement, calculatePosition } = useTooltipPosition(
    triggerRef,
    tooltipRef,
    placement,
    offset,
    avoidCollisions
  );

  const handleOpenChange = (open: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(open);
    }
    onOpenChange?.(open);
  };

  const handleOpen = () => {
    if (disabled) return;
    
    clearTimeout(closeTimerRef.current);
    
    const delay = context?.isDelayGroup ? skipDelayDuration : delayDuration;
    
    openTimerRef.current = setTimeout(() => {
      handleOpenChange(true);
      context?.onOpen();
    }, delay);
  };

  const handleClose = () => {
    clearTimeout(openTimerRef.current);
    
    closeTimerRef.current = setTimeout(() => {
      handleOpenChange(false);
      context?.onClose();
    }, closeDelay);
  };

  const handleTriggerEnter = () => {
    handleOpen();
  };

  const handleTriggerLeave = () => {
    handleClose();
  };

  const handleTooltipEnter = () => {
    if (!disableHoverableContent) {
      clearTimeout(closeTimerRef.current);
    }
  };

  const handleTooltipLeave = () => {
    if (!disableHoverableContent) {
      handleClose();
    }
  };

  // Calculate position when tooltip opens or window resizes
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      
      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isOpen, calculatePosition]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(openTimerRef.current);
      clearTimeout(closeTimerRef.current);
    };
  }, []);

  const triggerElement = React.cloneElement(children as React.ReactElement<React.HTMLProps<HTMLElement>>, {
    onMouseEnter: handleTriggerEnter,
    onMouseLeave: handleTriggerLeave,
    onFocus: handleOpen,
    onBlur: handleClose,
    'aria-describedby': isOpen ? 'tooltip' : undefined,
  });

  return (
    <>
      {triggerElement}
      <AnimatePresence>
        {(isOpen || forceMount) && (
          <motion.div
            ref={tooltipRef}
            role="tooltip"
            id="tooltip"
            className={cn(
              'fixed z-50 pointer-events-none',
              className
            )}
            style={{
              left: position.x,
              top: position.y,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            onMouseEnter={handleTooltipEnter}
            onMouseLeave={handleTooltipLeave}
          >
            <div className={cn(tooltipVariants({ variant, size }), contentClassName)}>
              {content}
            </div>
            
            {showArrow && (
              <div className={cn(arrowVariants({ variant, placement: actualPlacement }), arrowClassName)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Compound components for better API

// Simple tooltip hook
export const useTooltip = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
};

// Tooltip trigger component
export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ asChild = false, ...props }, ref) => {
    if (asChild) {
      return React.cloneElement(React.Children.only(props.children as React.ReactElement), {
        ...props,
      });
    }
    
    return (
      <button ref={ref as React.RefObject<HTMLButtonElement>} {...props} />
    );
  }
);

TooltipTrigger.displayName = 'TooltipTrigger';

// Tooltip content component
export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: VariantProps<typeof tooltipVariants>['variant'];
  size?: VariantProps<typeof tooltipVariants>['size'];
  showArrow?: boolean;
  placement?: TooltipPlacement;
  sideOffset?: number;
  alignOffset?: number;
  arrowPadding?: number;
  collisionPadding?: number;
  sticky?: 'partial' | 'always';
  hideWhenDetached?: boolean;
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    showArrow = true,
    placement = 'top',
    children,
    ...props
  }, ref) => (
    <div
      ref={ref}
      className={cn(tooltipVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {showArrow && (
        <div className={arrowVariants({ variant, placement })} />
      )}
    </div>
  )
);

TooltipContent.displayName = 'TooltipContent';

// Root tooltip component for compound pattern
export interface TooltipRootProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  disableHoverableContent?: boolean;
}

export const TooltipRoot: React.FC<TooltipRootProps> = ({
  children,
  onOpenChange,
}) => {
  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
  };  return (
    <TooltipContext.Provider value={{
      skipDelayDuration: 300,
      isDelayGroup: false,
      onOpen: () => handleOpenChange(true),
      onClose: () => handleOpenChange(false),
    }}>
      {children}
    </TooltipContext.Provider>
  );
};

// Preset tooltip variants

// Success tooltip
export const SuccessTooltip: React.FC<Omit<TooltipProps, 'variant'>> = (props) => (
  <Tooltip variant="success" {...props} />
);

// Error tooltip
export const ErrorTooltip: React.FC<Omit<TooltipProps, 'variant'>> = (props) => (
  <Tooltip variant="error" {...props} />
);

// Warning tooltip
export const WarningTooltip: React.FC<Omit<TooltipProps, 'variant'>> = (props) => (
  <Tooltip variant="warning" {...props} />
);

// Info tooltip
export const InfoTooltip: React.FC<Omit<TooltipProps, 'variant'>> = (props) => (
  <Tooltip variant="info" {...props} />
);

// Tooltip with delay
export const DelayedTooltip: React.FC<TooltipProps> = ({ delayDuration = 1000, ...props }) => (
  <Tooltip delayDuration={delayDuration} {...props} />
);

// Tooltip without arrow
export const SimpleTooltip: React.FC<Omit<TooltipProps, 'showArrow'>> = (props) => (
  <Tooltip showArrow={false} {...props} />
);

// Compound exports
export const TooltipCompound = {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
};

export default Tooltip;

