// Sidebar Components Export
export { default as AccountSidebar } from './AccountSidebar';
export { default as CategorySidebar } from './CategorySidebar';
export { default as FilterSidebar } from './FilterSidebar';

// Export types
export type { AccountSidebarProps } from './AccountSidebar';
export type { CategorySidebarProps } from './CategorySidebar';
export type { FilterSidebarProps, FilterState } from './FilterSidebar';

// Import components for default component
import React from 'react';
import AccountSidebar from './AccountSidebar';
import CategorySidebar from './CategorySidebar';
import FilterSidebar from './FilterSidebar';

export interface SidebarProps {
  type: 'category' | 'filter' | 'account';
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

// Default Sidebar component that renders based on type
const Sidebar: React.FC<SidebarProps> = ({ type, ...props }) => {
  switch (type) {
    case 'account':
      return <AccountSidebar {...props} />;
    case 'category':
      return <CategorySidebar {...props} />;
    case 'filter':
      return <FilterSidebar {...props} />;
    default:
      return <CategorySidebar {...props} />;
  }
};

export default Sidebar;

// Common sidebar utilities
export const sidebarVariants = {
  closed: {
    x: '-100%',
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30
    }
  },
  open: {
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05
    }
  }
} as const;

export const itemVariants = {
  closed: { opacity: 0, x: -20 },
  open: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
};

// Common sidebar props
export interface BaseSidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}