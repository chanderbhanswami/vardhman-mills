'use client';

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

// HamburgerMenu variants
const hamburgerVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
      size: {
        sm: 'h-8 w-8',
        default: 'h-9 w-9',
        lg: 'h-10 w-10',
        xl: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default',
    },
  }
);

export interface HamburgerMenuProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onToggle'>,
    VariantProps<typeof hamburgerVariants> {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  animated?: boolean;
  srText?: string;
  iconSize?: number;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const HamburgerMenu = forwardRef<HTMLButtonElement, HamburgerMenuProps>(
  ({
    className,
    variant = 'ghost',
    size = 'default',
    isOpen = false,
    onToggle,
    animated = true,
    srText,
    // iconSize prop reserved for future custom sizing
    onClick,
    ...props
  }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      onToggle?.(!isOpen);
    };

    const iconClasses = cn(
      'transition-transform duration-200',
      size === 'sm' && 'h-4 w-4',
      size === 'default' && 'h-5 w-5',
      size === 'lg' && 'h-6 w-6',
      size === 'xl' && 'h-7 w-7'
    );

    const renderIcon = () => {
      if (animated) {
        return (
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className={iconClasses} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Bars3Icon className={iconClasses} />
              </motion.div>
            )}
          </AnimatePresence>
        );
      }

      return isOpen ? (
        <XMarkIcon className={iconClasses} />
      ) : (
        <Bars3Icon className={iconClasses} />
      );
    };

    return (
      <button
        ref={ref}
        className={cn(hamburgerVariants({ variant, size }), className)}
        onClick={handleClick}
        aria-label={srText || (isOpen ? 'Close menu' : 'Open menu')}
        {...(isOpen ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
        type="button"
        {...props}
      >
        {renderIcon()}
        <span className="sr-only">{srText || (isOpen ? 'Close menu' : 'Open menu')}</span>
      </button>
    );
  }
);

HamburgerMenu.displayName = 'HamburgerMenu';

// Animated hamburger with custom lines
export interface AnimatedHamburgerProps extends Omit<HamburgerMenuProps, 'animated'> {
  lineClassName?: string;
  animationType?: 'rotate' | 'arrow' | 'cross' | 'squeeze';
}

export const AnimatedHamburger = forwardRef<HTMLButtonElement, AnimatedHamburgerProps>(
  ({
    className,
    variant = 'ghost',
    size = 'default',
    isOpen = false,
    onToggle,
    lineClassName,
    animationType = 'cross',
    srText,
    onClick,
    ...props
  }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      onToggle?.(!isOpen);
    };

    const lineSize = size === 'sm' ? 'w-4 h-0.5' : size === 'lg' ? 'w-6 h-0.5' : size === 'xl' ? 'w-7 h-0.5' : 'w-5 h-0.5';
    const baseLineClasses = cn('bg-current transition-all duration-300 ease-in-out', lineSize, lineClassName);

    const renderLines = () => {
      switch (animationType) {
        case 'rotate':
          return (
            <div className="flex flex-col space-y-1">
              <div className={cn(baseLineClasses, isOpen && 'rotate-45 translate-y-1.5')} />
              <div className={cn(baseLineClasses, isOpen && 'opacity-0')} />
              <div className={cn(baseLineClasses, isOpen && '-rotate-45 -translate-y-1.5')} />
            </div>
          );

        case 'arrow':
          return (
            <div className="flex flex-col space-y-1">
              <div className={cn(baseLineClasses, isOpen && 'rotate-45 translate-y-1 translate-x-0.5')} />
              <div className={cn(baseLineClasses, isOpen && 'opacity-0')} />
              <div className={cn(baseLineClasses, isOpen && '-rotate-45 -translate-y-1 translate-x-0.5')} />
            </div>
          );

        case 'squeeze':
          return (
            <div className="flex flex-col space-y-1">
              <div className={cn(baseLineClasses, isOpen && 'rotate-45 translate-y-1.5 scale-x-75')} />
              <div className={cn(baseLineClasses, isOpen && 'scale-x-0')} />
              <div className={cn(baseLineClasses, isOpen && '-rotate-45 -translate-y-1.5 scale-x-75')} />
            </div>
          );

        default: // cross
          return (
            <div className="relative">
              <div className={cn(baseLineClasses, 'absolute', isOpen ? 'rotate-45' : 'translate-y-0')} />
              <div className={cn(baseLineClasses, 'absolute', isOpen ? 'opacity-0' : 'translate-y-1.5')} />
              <div className={cn(baseLineClasses, 'absolute', isOpen ? '-rotate-45' : 'translate-y-3')} />
            </div>
          );
      }
    };

    return (
      <button
        ref={ref}
        className={cn(hamburgerVariants({ variant, size }), className)}
        onClick={handleClick}
        aria-label={srText || (isOpen ? 'Close menu' : 'Open menu')}
        {...(isOpen ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
        type="button"
        {...props}
      >
        {renderLines()}
        <span className="sr-only">{srText || (isOpen ? 'Close menu' : 'Open menu')}</span>
      </button>
    );
  }
);

AnimatedHamburger.displayName = 'AnimatedHamburger';

// Mobile menu wrapper
export interface MobileMenuProps {
  trigger?: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'left' | 'right' | 'top' | 'bottom';
  overlay?: boolean;
  className?: string;
  menuClassName?: string;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  trigger,
  children,
  isOpen = false,
  onOpenChange,
  side = 'left',
  overlay = true,
  className,
  menuClassName,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;

  const handleToggle = (newOpen: boolean) => {
    if (isOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
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

  const sideClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full',
  };

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className={className}>
      {trigger ? (
        <div onClick={() => handleToggle(true)}>
          {trigger}
        </div>
      ) : (
        <HamburgerMenu
          isOpen={open}
          onToggle={handleToggle}
        />
      )}

      <AnimatePresence>
        {open && (
          <>
            {overlay && (
              <motion.div
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => handleToggle(false)}
              />
            )}
            
            <motion.div
              className={cn(
                'fixed z-50 bg-background border-r border-border shadow-lg',
                sideClasses[side],
                side === 'left' || side === 'right' ? 'w-80 max-w-[80vw]' : 'h-80 max-h-[80vh]',
                menuClassName
              )}
              variants={slideVariants[side]}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="p-4">
                <div className="flex justify-end mb-4">
                  <HamburgerMenu
                    isOpen
                    onToggle={() => handleToggle(false)}
                    size="sm"
                  />
                </div>
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

MobileMenu.displayName = 'MobileMenu';

// Simple hamburger with tooltip
export interface HamburgerWithTooltipProps extends HamburgerMenuProps {
  tooltip?: string;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}

export const HamburgerWithTooltip = forwardRef<HTMLButtonElement, HamburgerWithTooltipProps>(
  ({
    tooltip = 'Menu',
    tooltipSide = 'bottom',
    ...props
  }, ref) => {
    const [showTooltip, setShowTooltip] = React.useState(false);

    return (
      <div className="relative">
        <HamburgerMenu
          {...props}
          ref={ref}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
        
        {showTooltip && (
          <div
            className={cn(
              'absolute z-50 px-2 py-1 text-xs bg-popover text-popover-foreground border border-border rounded shadow-md whitespace-nowrap',
              tooltipSide === 'top' && 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
              tooltipSide === 'bottom' && 'top-full left-1/2 transform -translate-x-1/2 mt-2',
              tooltipSide === 'left' && 'right-full top-1/2 transform -translate-y-1/2 mr-2',
              tooltipSide === 'right' && 'left-full top-1/2 transform -translate-y-1/2 ml-2'
            )}
          >
            {tooltip}
          </div>
        )}
      </div>
    );
  }
);

HamburgerWithTooltip.displayName = 'HamburgerWithTooltip';

export default HamburgerMenu;
