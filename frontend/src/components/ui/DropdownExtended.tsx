'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

export interface DropdownTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface DropdownContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const DropdownContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {}
});

const Dropdown: React.FC<DropdownProps> = ({ children, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className={cn('relative inline-block text-left', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

const DropdownTrigger: React.FC<DropdownTriggerProps> = ({ 
  asChild = false, 
  children, 
  className,
  onClick
}) => {
  const { isOpen, setIsOpen } = React.useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent) => {
    setIsOpen(!isOpen);
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    // For asChild, we'll use a wrapper div to avoid complex cloning issues
    return (
      <div onClick={handleClick} className={cn('cursor-pointer', className)}>
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn('inline-flex items-center', className)}
    >
      {children}
    </button>
  );
};

const DropdownContent: React.FC<DropdownContentProps> = ({ 
  children, 
  className,
  align = 'start',
  side = 'bottom'
}) => {
  const { isOpen, setIsOpen } = React.useContext(DropdownContext);

  if (!isOpen) return null;

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  const sideClasses = {
    top: 'bottom-full mb-1',
    right: 'left-full ml-1',
    bottom: 'top-full mt-1',
    left: 'right-full mr-1'
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsOpen(false)}
      />
      <div
        className={cn(
          'absolute z-50 min-w-32 overflow-hidden rounded-md border bg-white py-1 shadow-md',
          alignClasses[align],
          sideClasses[side],
          className
        )}
      >
        {children}
      </div>
    </>
  );
};

const DropdownItem: React.FC<DropdownItemProps> = ({ 
  children, 
  onClick, 
  disabled = false, 
  className 
}) => {
  const { setIsOpen } = React.useContext(DropdownContext);

  const handleClick = () => {
    if (!disabled) {
      onClick?.();
      setIsOpen(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
};

// Export individual components
export { DropdownTrigger, DropdownContent, DropdownItem };

export default Dropdown;