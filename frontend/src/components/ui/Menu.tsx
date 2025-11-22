'use client';

import React, { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Menu variants
const menuVariants = cva(
  'relative inline-block text-left',
  {
    variants: {
      variant: {
        default: 'bg-background border border-border rounded-md shadow-md',
        ghost: 'bg-transparent',
        solid: 'bg-popover border border-border',
      },
      size: {
        sm: 'min-w-32',
        md: 'min-w-48',
        lg: 'min-w-64',
        xl: 'min-w-80',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Menu item variants
const menuItemVariants = cva(
  'flex items-center w-full px-3 py-2 text-sm transition-colors cursor-pointer focus:outline-none',
  {
    variants: {
      variant: {
        default: 'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        destructive: 'text-destructive hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground',
        success: 'text-green-600 hover:bg-green-50 focus:bg-green-50',
        warning: 'text-yellow-600 hover:bg-yellow-50 focus:bg-yellow-50',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      disabled: false,
    },
  }
);

// Menu Context
interface MenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('Menu components must be used within a Menu');
  }
  return context;
};

// Menu Props
export interface MenuProps extends VariantProps<typeof menuVariants> {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left' | 'right';
  offset?: number;
  className?: string;
}

// Menu Item Props
export interface MenuItemProps extends VariantProps<typeof menuItemVariants> {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  shortcut?: string;
  className?: string;
}

// Menu Trigger Props
export interface MenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

// Menu Content Props
export interface MenuContentProps extends VariantProps<typeof menuVariants> {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}

// Main Menu Component
export const Menu: React.FC<MenuProps> & {
  Trigger: React.FC<MenuTriggerProps>;
  Content: React.FC<MenuContentProps>;
  Item: React.FC<MenuItemProps>;
  Separator: React.FC<{ className?: string }>;
  Label: React.FC<{ children: React.ReactNode; className?: string }>;
} = ({ children, onOpenChange, modal = true, ...props }) => {
  const [open, setOpen] = useState(false);
  
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [onOpenChange]);
  
  const onClose = useCallback(() => handleOpenChange(false), [handleOpenChange]);
  
  useEffect(() => {
    if (open && modal) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Element;
        if (!target.closest('[data-menu-content]')) {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open, modal, onClose]);
  
  return (
    <MenuContext.Provider value={{ open, setOpen: handleOpenChange, onClose }}>
      <div className="relative" {...props}>
        {children}
      </div>
    </MenuContext.Provider>
  );
};

// Menu Trigger
const MenuTrigger: React.FC<MenuTriggerProps> = ({ children, className }) => {
  const { open, setOpen } = useMenuContext();
  
  const handleClick = () => {
    setOpen(!open);
  };
  
  return (
    <div
      className={cn('cursor-pointer', className)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {children}
    </div>
  );
};

// Menu Content
const MenuContent: React.FC<MenuContentProps> = ({ 
  children, 
  className, 
  variant = 'default', 
  size = 'md',
  sideOffset = 4,
  align = 'start'
}) => {
  const { open, onClose } = useMenuContext();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Use onClose for cleanup if needed
  const handleClose = useCallback(() => onClose?.(), [onClose]);
  
  useEffect(() => {
    return () => {
      if (!open) handleClose();
    };
  }, [open, handleClose]);
  
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0',
  };
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={contentRef}
          data-menu-content
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.1 }}
          className={cn(
            'absolute z-50 mt-1 py-1 overflow-hidden',
            menuVariants({ variant, size }),
            alignmentClasses[align],
            className
          )}
          style={{ top: `calc(100% + ${sideOffset}px)` }}
          role="menu"
          aria-orientation="vertical"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Menu Item
const MenuItem: React.FC<MenuItemProps> = ({ 
  children, 
  onClick, 
  icon, 
  shortcut, 
  variant = 'default', 
  disabled = false,
  className 
}) => {
  const { onClose } = useMenuContext();
  
  const handleClick = () => {
    if (!disabled) {
      onClick?.();
      onClose();
    }
  };
  
  return (
    <div
      className={cn(menuItemVariants({ variant, disabled }), className)}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {icon && (
        <span className="mr-2 flex h-4 w-4 items-center justify-center">
          {icon}
        </span>
      )}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="ml-2 text-xs text-muted-foreground">
          {shortcut}
        </span>
      )}
    </div>
  );
};

// Menu Separator
const MenuSeparator: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn('my-1 h-px bg-border', className)}
      role="separator"
    />
  );
};

// Menu Label
const MenuLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div
      className={cn('px-3 py-2 text-xs font-medium text-muted-foreground', className)}
      role="presentation"
    >
      {children}
    </div>
  );
};

// Assign sub-components
Menu.Trigger = MenuTrigger;
Menu.Content = MenuContent;
Menu.Item = MenuItem;
Menu.Separator = MenuSeparator;
Menu.Label = MenuLabel;

// Context Menu (right-click menu)
export interface ContextMenuProps {
  children: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ 
  children, 
  content, 
  disabled = false,
  className 
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  
  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setOpen(true);
  };
  
  const handleClose = () => setOpen(false);
  
  useEffect(() => {
    if (open) {
      const handleClickOutside = () => handleClose();
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose();
      };
      
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open]);
  
  return (
    <>
      <div onContextMenu={handleContextMenu} className={className}>
        {children}
      </div>
      
      <AnimatePresence>
        {open && (
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 min-w-48 py-1 bg-popover border border-border rounded-md shadow-md overflow-hidden"
            style={{
              left: position.x,
              top: position.y,
            }}
            role="menu"
          >
            <MenuContext.Provider value={{ open, setOpen, onClose: handleClose }}>
              {content}
            </MenuContext.Provider>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Export all components
export default Menu;