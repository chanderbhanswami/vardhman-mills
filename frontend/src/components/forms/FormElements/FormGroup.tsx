/**
 * FormGroup Component
 * 
 * A component for grouping related form fields with consistent spacing,
 * layout, and styling. Supports various layouts and responsive behavior.
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';

// Types
export interface FormGroupProps {
  /** Group title */
  title?: React.ReactNode;
  /** Group description */
  description?: React.ReactNode;
  /** Form fields/content */
  children: React.ReactNode;
  /** Group layout */
  layout?: 'vertical' | 'horizontal' | 'grid' | 'inline';
  /** Grid columns for grid layout */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Responsive grid behavior */
  responsive?: boolean;
  /** Spacing between fields */
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show a border around the group */
  bordered?: boolean;
  /** Whether to show as a card */
  card?: boolean;
  /** Whether the group is collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Group validation state */
  state?: 'default' | 'error' | 'warning' | 'success';
  /** Custom CSS classes */
  className?: string;
  /** Title CSS classes */
  titleClassName?: string;
  /** Description CSS classes */
  descriptionClassName?: string;
  /** Content CSS classes */
  contentClassName?: string;
  /** Whether to animate state changes */
  animated?: boolean;
  /** Header actions */
  actions?: React.ReactNode;
  /** Whether to show dividers between fields */
  showDividers?: boolean;
  /** Custom divider component */
  divider?: React.ReactNode;
  /** Test ID for testing */
  'data-testid'?: string;
  /** ARIA attributes */
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  /** Group size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to stack on mobile */
  stackOnMobile?: boolean;
}

const FormGroup: React.FC<FormGroupProps> = ({
  title,
  description,
  children,
  layout = 'vertical',
  columns = 2,
  responsive = true,
  spacing = 'md',
  bordered = false,
  card = false,
  collapsible = false,
  defaultCollapsed = false,
  disabled = false,
  state = 'default',
  className,
  titleClassName,
  descriptionClassName,
  contentClassName,
  animated = true,
  actions,
  showDividers = false,
  divider,
  'data-testid': testId,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  size = 'md',
  stackOnMobile = true,
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [titleId] = React.useState(() => `form-group-title-${Math.random().toString(36).substr(2, 9)}`);
  const [descriptionId] = React.useState(() => `form-group-desc-${Math.random().toString(36).substr(2, 9)}`);

  // Toggle collapse state
  const toggleCollapse = React.useCallback(() => {
    if (collapsible && !disabled) {
      setIsCollapsed(prev => !prev);
    }
  }, [collapsible, disabled]);

  // Spacing classes
  const spacingClasses = {
    none: 'space-y-0',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8'
  };

  // Layout classes
  const getLayoutClasses = () => {
    const baseClasses = {
      vertical: spacingClasses[spacing],
      horizontal: clsx(
        'flex flex-wrap gap-4',
        {
          'flex-col sm:flex-row': stackOnMobile
        }
      ),
      inline: 'flex flex-wrap items-center gap-3',
      grid: clsx(
        'grid gap-4',
        {
          'grid-cols-1': !responsive || columns === 1,
          'grid-cols-1 sm:grid-cols-2': columns === 2 && responsive,
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': columns === 3 && responsive,
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': columns === 4 && responsive,
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5': columns === 5 && responsive,
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6': columns === 6 && responsive,
          'grid-cols-2': columns === 2 && !responsive,
          'grid-cols-3': columns === 3 && !responsive,
          'grid-cols-4': columns === 4 && !responsive,
          'grid-cols-5': columns === 5 && !responsive,
          'grid-cols-6': columns === 6 && !responsive
        }
      )
    };

    return baseClasses[layout];
  };

  // State classes
  const stateClasses = {
    default: '',
    error: 'border-red-200 dark:border-red-800',
    warning: 'border-amber-200 dark:border-amber-800',
    success: 'border-green-200 dark:border-green-800'
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Animation variants
  const contentVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
    }
  };

  const headerVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  // Process children with dividers
  const processChildren = () => {
    if (!showDividers) return children;

    const childArray = React.Children.toArray(children);
    const processedChildren: React.ReactNode[] = [];

    childArray.forEach((child, index) => {
      processedChildren.push(child);
      
      if (index < childArray.length - 1) {
        if (divider) {
          processedChildren.push(
            <React.Fragment key={`divider-${index}`}>
              {divider}
            </React.Fragment>
          );
        } else {
          processedChildren.push(
            <Divider key={`divider-${index}`} className="my-4" />
          );
        }
      }
    });

    return processedChildren;
  };

  // Render header
  const renderHeader = () => {
    if (!title && !description && !actions) return null;

    const headerContent = (
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {title && (
            <h3
              id={titleId}
              className={clsx(
                'font-medium text-gray-900 dark:text-white',
                sizeClasses[size],
                {
                  'cursor-pointer select-none': collapsible,
                  'opacity-50': disabled
                },
                titleClassName
              )}
              onClick={collapsible ? toggleCollapse : undefined}
              {...(collapsible ? {
                role: 'button',
                tabIndex: 0,
                'aria-expanded': !isCollapsed,
                'aria-controls': `${titleId}-content`
              } : {})}
              onKeyDown={collapsible ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleCollapse();
                }
              } : undefined}
            >
              <div className="flex items-center gap-2">
                {title}
                {collapsible && (
                  <motion.div
                    animate={{ rotate: isCollapsed ? -90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </h3>
          )}
          
          {description && !isCollapsed && (
            <p
              id={descriptionId}
              className={clsx(
                'mt-1 text-sm text-gray-600 dark:text-gray-400',
                {
                  'opacity-50': disabled
                },
                descriptionClassName
              )}
            >
              {description}
            </p>
          )}
        </div>

        {actions && !isCollapsed && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    );

    if (animated) {
      return (
        <motion.div
          variants={headerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {headerContent}
        </motion.div>
      );
    }

    return headerContent;
  };

  // Render content
  const renderContent = () => {
    const content = (
      <div
        className={clsx(
          getLayoutClasses(),
          {
            'opacity-50 cursor-not-allowed pointer-events-none': disabled
          },
          contentClassName
        )}
        id={collapsible ? `${titleId}-content` : undefined}
      >
        {processChildren()}
      </div>
    );

    if (collapsible) {
      return (
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              key="content"
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              style={{ overflow: 'hidden' }}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      );
    }

    return (
      <div className={!title && !description ? '' : 'mt-4'}>
        {content}
      </div>
    );
  };

  // Container classes
  const containerClasses = clsx(
    'form-group',
    sizeClasses[size],
    {
      'border rounded-lg': bordered && !card,
      'border': bordered && card,
      'opacity-50': disabled
    },
    stateClasses[state],
    className
  );

  // Main content
  const mainContent = (
    <div
      className={containerClasses}
      data-testid={testId}
      aria-labelledby={ariaLabelledBy || (title ? titleId : undefined)}
      aria-describedby={ariaDescribedBy || (description ? descriptionId : undefined)}
      role="group"
      {...props}
    >
      <div className={clsx(
        {
          'p-4': bordered || card,
          'p-6': card && size === 'lg',
          'p-3': card && size === 'sm'
        }
      )}>
        {renderHeader()}
        {renderContent()}
      </div>
    </div>
  );

  if (card) {
    return (
      <Card className={className} {...props}>
        <div
          className="p-6"
          data-testid={testId}
          aria-labelledby={ariaLabelledBy || (title ? titleId : undefined)}
          aria-describedby={ariaDescribedBy || (description ? descriptionId : undefined)}
          role="group"
        >
          {renderHeader()}
          {renderContent()}
        </div>
      </Card>
    );
  }

  return mainContent;
};

// Named exports for different layouts
export const VerticalFormGroup: React.FC<Omit<FormGroupProps, 'layout'>> = (props) => (
  <FormGroup {...props} layout="vertical" />
);

export const HorizontalFormGroup: React.FC<Omit<FormGroupProps, 'layout'>> = (props) => (
  <FormGroup {...props} layout="horizontal" />
);

export const GridFormGroup: React.FC<Omit<FormGroupProps, 'layout'>> = (props) => (
  <FormGroup {...props} layout="grid" />
);

export const InlineFormGroup: React.FC<Omit<FormGroupProps, 'layout'>> = (props) => (
  <FormGroup {...props} layout="inline" />
);

export const CardFormGroup: React.FC<Omit<FormGroupProps, 'card'>> = (props) => (
  <FormGroup {...props} card={true} />
);

export const CollapsibleFormGroup: React.FC<Omit<FormGroupProps, 'collapsible'>> = (props) => (
  <FormGroup {...props} collapsible={true} />
);

// Hook for form group state management
export const useFormGroup = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [state, setState] = React.useState<'default' | 'error' | 'warning' | 'success'>('default');

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const collapse = React.useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const expand = React.useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const setError = React.useCallback(() => {
    setState('error');
  }, []);

  const setWarning = React.useCallback(() => {
    setState('warning');
  }, []);

  const setSuccess = React.useCallback(() => {
    setState('success');
  }, []);

  const clearState = React.useCallback(() => {
    setState('default');
  }, []);

  return {
    isCollapsed,
    state,
    toggleCollapse,
    collapse,
    expand,
    setError,
    setWarning,
    setSuccess,
    clearState,
    groupProps: {
      defaultCollapsed: isCollapsed,
      state
    }
  };
};

// Utility function to create form group sections
export const createFormSection = (
  title: string,
  fields: React.ReactNode[],
  options: Partial<FormGroupProps> = {}
): React.ReactElement => {
  return (
    <FormGroup
      title={title}
      layout="grid"
      columns={2}
      spacing="md"
      {...options}
    >
      {fields}
    </FormGroup>
  );
};

export default FormGroup;
