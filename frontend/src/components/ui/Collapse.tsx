'use client';

import React, { useState, forwardRef, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Collapse variants
const collapseVariants = cva(
  'overflow-hidden transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'border border-border rounded-md',
        card: 'bg-card border border-border rounded-lg shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Collapse Props
export interface CollapseProps extends VariantProps<typeof collapseVariants> {
  children: React.ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  disabled?: boolean;
  animationDuration?: number;
  className?: string;
  contentClassName?: string;
  triggerClassName?: string;
}

// Main Collapse Component
export const Collapse = forwardRef<HTMLDivElement, CollapseProps>(
  ({
    children,
    isOpen: controlledOpen,
    defaultOpen = false,
    onToggle,
    trigger,
    title,
    disabled = false,
    animationDuration = 300,
    variant = 'default',
    className,
    contentClassName,
    triggerClassName,
    ...props
  }, ref) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | 'auto'>('auto');
    
    // Apply height to container when numeric
    const heightClass = typeof height === 'number' ? 'h-auto' : '';
    
    // Use controlled or internal state
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    
    const toggle = () => {
      if (disabled) return;
      
      const newState = !isOpen;
      if (controlledOpen === undefined) {
        setInternalOpen(newState);
      }
      onToggle?.(newState);
    };
    
    // Calculate height for smooth animation
    useEffect(() => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        setHeight(isOpen ? contentHeight : 0);
      }
    }, [isOpen, children]);
    
    // Reset height when content changes
    useEffect(() => {
      if (isOpen && contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    }, [children, isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(collapseVariants({ variant }), heightClass, className)}
        {...props}
      >
        {/* Trigger */}
        {(trigger || title) && (
          <div
            className={cn(
              'flex items-center justify-between cursor-pointer select-none',
              'px-4 py-3 hover:bg-accent/50 transition-colors',
              disabled && 'opacity-50 cursor-not-allowed',
              triggerClassName
            )}
            onClick={toggle}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={disabled ? -1 : 0}
            {...(isOpen !== undefined && { 'aria-expanded': Boolean(isOpen) })}
            {...{ 'aria-controls': 'collapse-content' }}
          >
            {trigger || (
              <>
                <span className="font-medium">{title}</span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.div>
              </>
            )}
          </div>
        )}
        
        {/* Content */}
        <motion.div
          id="collapse-content"
          animate={{ 
            height: isOpen ? 'auto' : 0,
            opacity: isOpen ? 1 : 0,
          }}
          transition={{ 
            duration: animationDuration / 1000,
            ease: 'easeInOut',
          }}
          className={cn(
            'overflow-hidden',
            contentClassName
          )}
        >
          <div ref={contentRef} className="px-4 py-3">
            {children}
          </div>
        </motion.div>
      </div>
    );
  }
);

Collapse.displayName = 'Collapse';

// Accordion Component (Multiple Collapses)
export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  trigger?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  className?: string;
  itemClassName?: string;
  variant?: VariantProps<typeof collapseVariants>['variant'];
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({
    items,
    type = 'single',
    defaultValue,
    value: controlledValue,
    onValueChange,
    collapsible = true,
    className,
    itemClassName,
    variant = 'bordered',
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState<string | string[]>(
      defaultValue || (type === 'multiple' ? [] : '')
    );
    
    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
    
    const handleToggle = (itemId: string) => {
      let newValue: string | string[];
      
      if (type === 'single') {
        const currentSingle = currentValue as string;
        newValue = currentSingle === itemId && collapsible ? '' : itemId;
      } else {
        const currentMultiple = currentValue as string[];
        newValue = currentMultiple.includes(itemId)
          ? currentMultiple.filter(id => id !== itemId)
          : [...currentMultiple, itemId];
      }
      
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };
    
    const isItemOpen = (itemId: string) => {
      if (type === 'single') {
        return currentValue === itemId;
      }
      return (currentValue as string[]).includes(itemId);
    };

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      >
        {items.map((item, itemIndex) => (
          <Collapse
            key={item.id}
            variant={variant}
            isOpen={isItemOpen(item.id)}
            onToggle={() => handleToggle(item.id)}
            title={item.title}
            trigger={item.trigger}
            disabled={item.disabled}
            className={cn(
              'border-b border-border last:border-b-0',
              `animation-delay-${itemIndex}`,
              itemClassName
            )}
          >
            {item.content}
          </Collapse>
        ))}
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';

// Collapsible Card Component
export interface CollapsibleCardProps extends CollapseProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const CollapsibleCard = forwardRef<HTMLDivElement, CollapsibleCardProps>(
  ({
    children,
    header,
    footer,
    padding = 'md',
    className,
    contentClassName,
    ...props
  }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <Collapse
        ref={ref}
        variant="card"
        className={cn('overflow-hidden', className)}
        contentClassName={cn(paddingClasses[padding], contentClassName)}
        {...props}
      >
        {header && (
          <div className="border-b border-border p-4 bg-muted/30">
            {header}
          </div>
        )}
        
        <div className={paddingClasses[padding]}>
          {children}
        </div>
        
        {footer && (
          <div className="border-t border-border p-4 bg-muted/30">
            {footer}
          </div>
        )}
      </Collapse>
    );
  }
);

CollapsibleCard.displayName = 'CollapsibleCard';

// Animated Collapse with custom animations
export interface AnimatedCollapseProps extends CollapseProps {
  animation?: 'slide' | 'fade' | 'scale' | 'rotate';
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const AnimatedCollapse = forwardRef<HTMLDivElement, AnimatedCollapseProps>(
  ({
    animation = 'slide',
    direction = 'down',
    children,
    isOpen,
    className,
    ...props
  }, ref) => {
    const getAnimationProps = () => {
      const baseTransition = { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] as const };
      
      switch (animation) {
        case 'fade':
          return {
            initial: { opacity: 0 },
            animate: { opacity: isOpen ? 1 : 0 },
            transition: baseTransition,
          };
        
        case 'scale':
          return {
            initial: { scale: 0, opacity: 0 },
            animate: { 
              scale: isOpen ? 1 : 0, 
              opacity: isOpen ? 1 : 0 
            },
            transition: baseTransition,
          };
        
        case 'rotate':
          return {
            initial: { rotateX: -90, opacity: 0 },
            animate: { 
              rotateX: isOpen ? 0 : -90, 
              opacity: isOpen ? 1 : 0 
            },
            transition: baseTransition,
          };
        
        default: // slide
          const slideProps = {
            up: { y: -20 },
            down: { y: 20 },
            left: { x: -20 },
            right: { x: 20 },
          };
          
          const selectedProps = slideProps[direction];
          return {
            initial: { ...selectedProps, opacity: 0 },
            animate: { 
              x: isOpen ? 0 : ('x' in selectedProps ? selectedProps.x : 0),
              y: isOpen ? 0 : ('y' in selectedProps ? selectedProps.y : 0),
              opacity: isOpen ? 1 : 0 
            },
            transition: baseTransition,
          };
      }
    };

    return (
      <Collapse
        ref={ref}
        isOpen={isOpen}
        className={className}
        {...props}
      >
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div {...getAnimationProps()}>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Collapse>
    );
  }
);

AnimatedCollapse.displayName = 'AnimatedCollapse';

// Export all components
export default Collapse;
