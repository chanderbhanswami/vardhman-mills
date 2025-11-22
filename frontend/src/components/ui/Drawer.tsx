'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Drawer variants
const drawerVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b',
        bottom: 'inset-x-0 bottom-0 border-t',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
        right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

const drawerOverlayVariants = cva(
  'fixed inset-0 z-40 bg-background/80 backdrop-blur-sm'
);

// Types
export interface DrawerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof drawerVariants> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  dismissible?: boolean;
  preventScroll?: boolean;
  container?: HTMLElement | null;
}

// Context
interface DrawerContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType | null>(null);

const useDrawerContext = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('Drawer components must be used within Drawer');
  }
  return context;
};

// Main Drawer component
export const Drawer: React.FC<DrawerProps> = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  dismissible = true,
  preventScroll = true,
  side = 'right',
  className,
  ...props
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const drawerRef = useRef<HTMLDivElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (!preventScroll) return;

    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open, preventScroll]);

  // Close on outside click
  useEffect(() => {
    if (!open || !dismissible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        handleOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, dismissible, handleOpenChange]);

  // Close on escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, handleOpenChange]);

  const contextValue: DrawerContextType = {
    open,
    setOpen: handleOpenChange,
  };

  const slideVariants = {
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    top: {
      initial: { y: '-100%' },
      animate: { y: 0 },
      exit: { y: '-100%' },
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
  };

  return (
    <DrawerContext.Provider value={contextValue}>
      <AnimatePresence>
        {open && (
          <>
            {modal && (
              <motion.div
                className={drawerOverlayVariants()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
            
            <motion.div
              ref={drawerRef}
              className={cn(drawerVariants({ side }), className)}
              variants={slideVariants[side || 'right']}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              {...(Object.fromEntries(Object.entries(props).filter(([key]) => 
                !['onDrag', 'onDragStart', 'onDragEnd', 'onAnimationStart', 'onAnimationComplete'].includes(key)
              )))}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DrawerContext.Provider>
  );
};

// Drawer Trigger
export interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const { setOpen } = useDrawerContext();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(true);
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'h-10 px-4 py-2',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

DrawerTrigger.displayName = 'DrawerTrigger';

// Drawer Content
export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex h-full flex-col', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DrawerContent.displayName = 'DrawerContent';

// Drawer Header
export const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
));

DrawerHeader.displayName = 'DrawerHeader';

// Drawer Footer
export const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
));

DrawerFooter.displayName = 'DrawerFooter';

// Drawer Title
export const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));

DrawerTitle.displayName = 'DrawerTitle';

// Drawer Description
export const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

DrawerDescription.displayName = 'DrawerDescription';

// Drawer Close
export interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const { setOpen } = useDrawerContext();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(false);
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity',
          'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:pointer-events-none',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children || <XMarkIcon className="h-4 w-4" />}
        <span className="sr-only">Close</span>
      </button>
    );
  }
);

DrawerClose.displayName = 'DrawerClose';

// Simple drawer with common layout
export interface SimpleDrawerProps extends Omit<DrawerProps, 'children'> {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  triggerText?: string;
}

export const SimpleDrawer: React.FC<SimpleDrawerProps> = ({
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  triggerText = 'Open Drawer',
  ...drawerProps
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer {...drawerProps} open={open} onOpenChange={setOpen}>
      <DrawerTrigger onClick={() => setOpen(true)}>
        {triggerText}
      </DrawerTrigger>
      
      <DrawerContent>
        {showCloseButton && <DrawerClose />}
        
        <DrawerHeader>
          {title && <DrawerTitle>{title}</DrawerTitle>}
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        
        <div className="flex-1 px-6 py-4">
          {children}
        </div>
        
        {footer && (
          <DrawerFooter>
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

// Navigation drawer
export interface NavigationDrawerProps extends DrawerProps {
  navItems?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    active?: boolean;
  }>;
  title?: string;
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  navItems = [],
  title = 'Navigation',
  user,
  children,
  ...props
}) => {
  const { setOpen } = useDrawerContext();

  return (
    <Drawer {...props} side="left">
      <DrawerContent className="p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{title}</h2>
              <DrawerClose />
            </div>
            
            {user && (
              <div className="mt-4 flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  {user.email && (
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-auto">
            <nav className="p-2">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    'flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    item.active 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => {
                    item.onClick?.();
                    if (item.href) {
                      window.location.href = item.href;
                    }
                    setOpen(false);
                  }}
                >
                  {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                </button>
              ))}
            </nav>
            
            {children && (
              <div className="border-t p-4">
                {children}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

Drawer.displayName = 'Drawer';
SimpleDrawer.displayName = 'SimpleDrawer';
NavigationDrawer.displayName = 'NavigationDrawer';

export default Drawer;
