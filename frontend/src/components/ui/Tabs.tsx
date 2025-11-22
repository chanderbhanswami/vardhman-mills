'use client';

import React, { createContext, useContext, useState, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Tabs Context
interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  variant: 'default' | 'pills' | 'underline' | 'bordered';
  size: 'sm' | 'default' | 'lg';
  activationMode: 'automatic' | 'manual';
  animated: boolean;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

// Tabs variants
const tabsVariants = cva(
  'w-full',
  {
    variants: {
      orientation: {
        horizontal: 'flex flex-col',
        vertical: 'flex flex-row'
      }
    },
    defaultVariants: {
      orientation: 'horizontal'
    }
  }
);

// Tabs List variants
const tabsListVariants = cva(
  'inline-flex items-center justify-start',
  {
    variants: {
      variant: {
        default: 'h-9 rounded-lg bg-muted p-1',
        pills: 'h-10 rounded-full bg-muted/50 p-1',
        underline: 'h-10 border-b border-border',
        bordered: 'h-10 border border-border rounded-lg bg-background'
      },
      orientation: {
        horizontal: 'flex-row w-full',
        vertical: 'flex-col h-full w-auto'
      },
      size: {
        sm: 'h-7 text-xs',
        default: 'h-9 text-sm',
        lg: 'h-11 text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      orientation: 'horizontal',
      size: 'default'
    }
  }
);

// Tabs Trigger variants
const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'rounded-md px-3 py-1 text-sm font-medium ring-offset-background data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
        pills: 'rounded-full px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        underline: 'rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-foreground',
        bordered: 'rounded-md border border-transparent px-3 py-1 text-sm font-medium data-[state=active]:border-border data-[state=active]:bg-muted'
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        default: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

// Tabs Content variants
const tabsContentVariants = cva(
  'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      orientation: {
        horizontal: 'w-full',
        vertical: 'flex-1 ml-4'
      }
    },
    defaultVariants: {
      orientation: 'horizontal'
    }
  }
);

// Base Tabs Props
export interface TabsProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof tabsVariants> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline' | 'bordered';
  size?: 'sm' | 'default' | 'lg';
  activationMode?: 'automatic' | 'manual';
  animated?: boolean;
}

// Main Tabs Component
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    className,
    children,
    value,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    variant = 'default',
    size = 'default',
    activationMode = 'automatic',
    animated = true,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    
    const currentValue = value !== undefined ? value : internalValue;
    const handleValueChange = useCallback((newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }, [value, onValueChange]);

    return (
      <TabsContext.Provider value={{ 
        value: currentValue, 
        onValueChange: handleValueChange,
        orientation,
        variant,
        size,
        activationMode,
        animated
      }}>
        <div
          ref={ref}
          className={cn(tabsVariants({ orientation }), className)}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

// Tabs List Component
export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  loop?: boolean;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, loop = true, ...props }, ref) => {
    const { orientation, variant, size } = useTabsContext();
    const shouldLoop = loop && React.Children.count(children) > 1;
    const tabCount = React.Children.count(children);

    // Use shouldLoop and tabCount for navigation logic
    const canNavigate = shouldLoop || tabCount > 1;

    return (
      <div
        ref={ref}
        role="group"
        aria-label="Tab navigation"
        className={cn(tabsListVariants({ variant, orientation, size }), className)}
        data-can-navigate={canNavigate}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = 'TabsList';

// Tabs Trigger Component
export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
  badge?: string | number;
  closable?: boolean;
  onClose?: () => void;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ 
    className,
    children,
    value: triggerValue,
    icon,
    badge,
    closable = false,
    onClose,
    onClick,
    onKeyDown,
    disabled,
    ...props 
  }, ref) => {
    const { value, onValueChange, variant, size, activationMode } = useTabsContext();
    const isActive = value === triggerValue;

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        // Both activation modes support clicking
        onValueChange(triggerValue);
        onClick?.(event);
      }
    }, [disabled, onValueChange, triggerValue, onClick]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!disabled && activationMode === 'manual') {
          onValueChange(triggerValue);
        }
      }
      onKeyDown?.(event);
    }, [disabled, activationMode, onValueChange, triggerValue, onKeyDown]);

    const handleFocus = useCallback(() => {
      if (!disabled && activationMode === 'automatic') {
        onValueChange(triggerValue);
      }
    }, [disabled, activationMode, onValueChange, triggerValue]);

    const handleClose = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onClose?.();
    }, [onClose]);

    return (

      <button
        ref={ref}
        role="button"
        aria-controls={`content-${triggerValue}`}
        data-state={isActive ? 'active' : 'inactive'}
        id={`trigger-${triggerValue}`}
        className={cn(tabsTriggerVariants({ variant, size }), className)}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        {...props}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
          {badge && (
            <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
              {badge}
            </span>
          )}
          {closable && (
            <button
              type="button"
              className="ml-1 p-0.5 hover:bg-muted rounded-sm transition-colors"
              onClick={handleClose}
              aria-label={`Close ${children} tab`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </button>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

// Tabs Content Component
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, children, value: contentValue, forceMount = false, ...props }, ref) => {
    const { value, orientation, animated } = useTabsContext();
    const isActive = value === contentValue;

    if (!isActive && !forceMount) {
      return null;
    }

    if (animated) {
      return (
        <AnimatePresence mode="wait">
          {(isActive || forceMount) && (
            <motion.div
              ref={ref}
              role="tabpanel"
              aria-labelledby={`trigger-${contentValue}`}
              id={`content-${contentValue}`}
              tabIndex={0}
              className={cn(
                tabsContentVariants({ orientation }),
                !isActive && forceMount && 'hidden',
                className
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              {...(props as Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDragStart' | 'onDrop' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'>)}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      );
    }

    // Non-animated version
    return (isActive || forceMount) ? (
      <div
        ref={ref}
        role="tabpanel"
        aria-labelledby={`trigger-${contentValue}`}
        id={`content-${contentValue}`}
        tabIndex={0}
        className={cn(
          tabsContentVariants({ orientation }),
          !isActive && forceMount && 'hidden',
          className
        )}
        {...props}
      >
        {children}
      </div>
    ) : null;
  }
);

TabsContent.displayName = 'TabsContent';

// Animated Tabs Component with built-in animations
export interface AnimatedTabsProps extends TabsProps {
  tabs: {
    value: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
    content: React.ReactNode;
    disabled?: boolean;
  }[];
}

export const AnimatedTabs = forwardRef<HTMLDivElement, AnimatedTabsProps>(
  ({ tabs, className, ...props }, ref) => {
    return (
      <Tabs ref={ref} className={className} {...props}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              badge={tab.badge}
              disabled={tab.disabled}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    );
  }
);

AnimatedTabs.displayName = 'AnimatedTabs';

// Closable Tabs Component
export interface ClosableTabsProps extends TabsProps {
  tabs: {
    value: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
    content: React.ReactNode;
    closable?: boolean;
  }[];
  onTabClose?: (value: string) => void;
}

export const ClosableTabs = forwardRef<HTMLDivElement, ClosableTabsProps>(
  ({ tabs, onTabClose, className, ...props }, ref) => {
    return (
      <Tabs ref={ref} className={className} {...props}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              badge={tab.badge}
              closable={tab.closable}
              onClose={() => onTabClose?.(tab.value)}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    );
  }
);

ClosableTabs.displayName = 'ClosableTabs';

// Vertical Tabs Component
export interface VerticalTabsProps extends Omit<TabsProps, 'orientation'> {
  tabs: {
    value: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
    content: React.ReactNode;
  }[];
  tabsWidth?: string;
}

export const VerticalTabs = forwardRef<HTMLDivElement, VerticalTabsProps>(
  ({ tabs, tabsWidth = 'w-48', className, ...props }, ref) => {
    return (
      <Tabs 
        ref={ref} 
        orientation="vertical" 
        className={cn('flex', className)} 
        {...props}
      >
        <TabsList className={cn('flex-col h-auto', tabsWidth)}>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              badge={tab.badge}
              className="w-full justify-start"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="flex-1 ml-4">
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    );
  }
);

VerticalTabs.displayName = 'VerticalTabs';

// Scrollable Tabs Component
export interface ScrollableTabsProps extends TabsProps {
  tabs: {
    value: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
    content: React.ReactNode;
  }[];
}

export const ScrollableTabs = forwardRef<HTMLDivElement, ScrollableTabsProps>(
  ({ tabs, className, ...props }, ref) => {
    return (
      <Tabs ref={ref} className={className} {...props}>
        <div className="relative">
          <TabsList className="overflow-x-auto scrollbar-hide">
            <div className="flex">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  icon={tab.icon}
                  badge={tab.badge}
                  className="flex-shrink-0"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </div>
          </TabsList>
          
          {/* Scroll indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
        
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    );
  }
);

ScrollableTabs.displayName = 'ScrollableTabs';

export default Tabs;

