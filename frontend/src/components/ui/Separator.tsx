import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Separator variants
const separatorVariants = cva(
  'shrink-0 border-none',
  {
    variants: {
      variant: {
        default: 'bg-border',
        solid: 'bg-border',
        dashed: 'border-t border-dashed border-border bg-transparent',
        dotted: 'border-t border-dotted border-border bg-transparent',
        gradient: 'bg-gradient-to-r from-transparent via-border to-transparent',
        thick: 'bg-border',
        thin: 'bg-border/50'
      },
      orientation: {
        horizontal: 'w-full',
        vertical: 'h-full'
      },
      size: {
        xs: '',
        sm: '',
        default: '',
        lg: '',
        xl: ''
      }
    },
    compoundVariants: [
      // Horizontal sizes
      {
        orientation: 'horizontal',
        size: 'xs',
        className: 'h-px'
      },
      {
        orientation: 'horizontal',
        size: 'sm',
        className: 'h-0.5'
      },
      {
        orientation: 'horizontal',
        size: 'default',
        className: 'h-px'
      },
      {
        orientation: 'horizontal',
        size: 'lg',
        className: 'h-1'
      },
      {
        orientation: 'horizontal',
        size: 'xl',
        className: 'h-1.5'
      },
      // Vertical sizes
      {
        orientation: 'vertical',
        size: 'xs',
        className: 'w-px'
      },
      {
        orientation: 'vertical',
        size: 'sm',
        className: 'w-0.5'
      },
      {
        orientation: 'vertical',
        size: 'default',
        className: 'w-px'
      },
      {
        orientation: 'vertical',
        size: 'lg',
        className: 'w-1'
      },
      {
        orientation: 'vertical',
        size: 'xl',
        className: 'w-1.5'
      },
      // Thick variant adjustments
      {
        variant: 'thick',
        orientation: 'horizontal',
        className: 'h-1'
      },
      {
        variant: 'thick',
        orientation: 'vertical',
        className: 'w-1'
      }
    ],
    defaultVariants: {
      variant: 'default',
      orientation: 'horizontal',
      size: 'default'
    }
  }
);

// Separator Props
export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
  decorative?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

// Main Separator Component
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ 
    className,
    variant = 'default',
    orientation = 'horizontal',
    size = 'default',
    decorative = true,
    label,
    icon,
    ...props 
  }, ref) => {
    // If there's a label or icon, we need a different layout
    if (label || icon) {
      return (
        <div
          ref={ref}
          {...(decorative ? {} : { role: 'separator', 'aria-orientation': orientation || 'horizontal' })}
          className={cn(
            'flex items-center',
            orientation === 'horizontal' ? 'w-full' : 'flex-col h-full',
            className
          )}
          {...props}
        >
          <div className={cn(separatorVariants({ variant, orientation, size }))} />
          
          {(label || icon) && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground bg-background',
              orientation === 'vertical' && 'flex-col px-1 py-3'
            )}>
              {icon && <span className="flex-shrink-0">{icon}</span>}
              {label && <span className="whitespace-nowrap">{label}</span>}
            </div>
          )}
          
          <div className={cn(separatorVariants({ variant, orientation, size }))} />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        {...(decorative ? {} : { role: 'separator', 'aria-orientation': orientation || 'horizontal' })}
        className={cn(separatorVariants({ variant, orientation, size }), className)}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

// Horizontal Separator
export const HorizontalSeparator = forwardRef<HTMLDivElement, Omit<SeparatorProps, 'orientation'>>(
  (props, ref) => {
    return <Separator ref={ref} orientation="horizontal" {...props} />;
  }
);

HorizontalSeparator.displayName = 'HorizontalSeparator';

// Vertical Separator
export const VerticalSeparator = forwardRef<HTMLDivElement, Omit<SeparatorProps, 'orientation'>>(
  (props, ref) => {
    return <Separator ref={ref} orientation="vertical" {...props} />;
  }
);

VerticalSeparator.displayName = 'VerticalSeparator';

// Dashed Separator
export const DashedSeparator = forwardRef<HTMLDivElement, Omit<SeparatorProps, 'variant'>>(
  (props, ref) => {
    return <Separator ref={ref} variant="dashed" {...props} />;
  }
);

DashedSeparator.displayName = 'DashedSeparator';

// Dotted Separator
export const DottedSeparator = forwardRef<HTMLDivElement, Omit<SeparatorProps, 'variant'>>(
  (props, ref) => {
    return <Separator ref={ref} variant="dotted" {...props} />;
  }
);

DottedSeparator.displayName = 'DottedSeparator';

// Gradient Separator
export const GradientSeparator = forwardRef<HTMLDivElement, Omit<SeparatorProps, 'variant'>>(
  (props, ref) => {
    return <Separator ref={ref} variant="gradient" {...props} />;
  }
);

GradientSeparator.displayName = 'GradientSeparator';

// Thick Separator
export const ThickSeparator = forwardRef<HTMLDivElement, Omit<SeparatorProps, 'variant'>>(
  (props, ref) => {
    return <Separator ref={ref} variant="thick" {...props} />;
  }
);

ThickSeparator.displayName = 'ThickSeparator';

// Text Separator (with label)
export interface TextSeparatorProps extends Omit<SeparatorProps, 'label'> {
  children: React.ReactNode;
}

export const TextSeparator = forwardRef<HTMLDivElement, TextSeparatorProps>(
  ({ children, ...props }, ref) => {
    return <Separator ref={ref} label={children as string} {...props} />;
  }
);

TextSeparator.displayName = 'TextSeparator';

// Icon Separator
export interface IconSeparatorProps extends Omit<SeparatorProps, 'icon'> {
  children: React.ReactNode;
}

export const IconSeparator = forwardRef<HTMLDivElement, IconSeparatorProps>(
  ({ children, ...props }, ref) => {
    return <Separator ref={ref} icon={children} {...props} />;
  }
);

IconSeparator.displayName = 'IconSeparator';

// Section Separator (for content sections)
export interface SectionSeparatorProps extends SeparatorProps {
  spacing?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
}

export const SectionSeparator = forwardRef<HTMLDivElement, SectionSeparatorProps>(
  ({ className, spacing = 'default', ...props }, ref) => {
    const spacingClasses = {
      none: '',
      sm: 'my-2',
      default: 'my-4',
      lg: 'my-6',
      xl: 'my-8'
    };

    return (
      <Separator
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      />
    );
  }
);

SectionSeparator.displayName = 'SectionSeparator';

// Breadcrumb Separator
export const BreadcrumbSeparator = forwardRef<HTMLDivElement, Omit<SeparatorProps, 'orientation' | 'decorative'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        aria-hidden="true"
        className={cn('text-muted-foreground', className)}
        {...props}
      >
        {children || '/'}
      </div>
    );
  }
);

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

// Menu Separator (for dropdown menus)
export const MenuSeparator = forwardRef<HTMLDivElement, Omit<SeparatorProps, 'orientation'>>(
  ({ className, ...props }, ref) => {
    return (
      <Separator
        ref={ref}
        className={cn('mx-1 my-1', className)}
        orientation="horizontal"
        {...props}
      />
    );
  }
);

MenuSeparator.displayName = 'MenuSeparator';

// Sidebar Separator (for navigation)
export const SidebarSeparator = forwardRef<HTMLDivElement, Omit<SeparatorProps, 'orientation'>>(
  ({ className, ...props }, ref) => {
    return (
      <Separator
        ref={ref}
        className={cn('my-2', className)}
        orientation="horizontal"
        variant="thin"
        {...props}
      />
    );
  }
);

SidebarSeparator.displayName = 'SidebarSeparator';

// Card Separator (for card sections)
export const CardSeparator = forwardRef<HTMLDivElement, Omit<SeparatorProps, 'orientation'>>(
  ({ className, ...props }, ref) => {
    return (
      <Separator
        ref={ref}
        className={cn('my-3', className)}
        orientation="horizontal"
        {...props}
      />
    );
  }
);

CardSeparator.displayName = 'CardSeparator';

// Form Separator (for form sections)
export const FormSeparator = forwardRef<HTMLDivElement, SectionSeparatorProps>(
  ({ className, spacing = 'lg', ...props }, ref) => {
    return (
      <SectionSeparator
        ref={ref}
        className={cn('border-muted', className)}
        spacing={spacing}
        variant="thin"
        {...props}
      />
    );
  }
);

FormSeparator.displayName = 'FormSeparator';

export default Separator;
