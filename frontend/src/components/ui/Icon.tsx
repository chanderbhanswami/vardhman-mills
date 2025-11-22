'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import * as HeroIcons from '@heroicons/react/24/outline';
import * as HeroIconsSolid from '@heroicons/react/24/solid';

// Icon variants
const iconVariants = cva(
  'inline-flex shrink-0',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
        '2xl': 'h-10 w-10',
        '3xl': 'h-12 w-12',
      },
      variant: {
        default: 'text-current',
        primary: 'text-primary',
        secondary: 'text-secondary',
        success: 'text-green-500',
        warning: 'text-yellow-500',
        danger: 'text-red-500',
        info: 'text-blue-500',
        muted: 'text-muted-foreground',
      },
      animation: {
        none: '',
        spin: 'animate-spin',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        ping: 'animate-ping',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      animation: 'none',
    },
  }
);

// Type for all available Heroicons
type HeroIconName = keyof typeof HeroIcons;

// Icon Props
export interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'ref'>,
    VariantProps<typeof iconVariants> {
  name?: HeroIconName;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  solid?: boolean;
  rotating?: boolean;
  clickable?: boolean;
  loading?: boolean;
  badge?: string | number;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  tooltip?: string;
}

// Badge component for icon
const IconBadge: React.FC<{
  content: string | number;
  color: string;
  size: string;
}> = ({ content, color, size }) => {
  const badgeSize = size === 'xs' || size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'xs' || size === 'sm' ? 'text-xs' : 'text-xs';
  
  const colorClasses = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
  };

  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 flex items-center justify-center rounded-full border-2 border-background',
        badgeSize,
        textSize,
        colorClasses[color as keyof typeof colorClasses] || colorClasses.primary,
        typeof content === 'number' && content > 99 ? 'px-1' : ''
      )}
    >
      {typeof content === 'number' && content > 99 ? '99+' : content}
    </span>
  );
};

// Main Icon Component
export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({
    name,
    icon: CustomIcon,
    solid = false,
    size = 'md',
    variant = 'default',
    animation = 'none',
    rotating = false,
    clickable = false,
    loading = false,
    badge,
    badgeColor = 'primary',
    tooltip,
    className,
    onClick,
    ...props
  }, ref) => {
    // Determine which icon to render
    let IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>> | null = null;

    if (CustomIcon) {
      IconComponent = CustomIcon;
    } else if (name) {
      if (solid) {
        IconComponent = HeroIconsSolid[name as keyof typeof HeroIconsSolid] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
      } else {
        IconComponent = HeroIcons[name] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
      }
    }

    if (!IconComponent) {
      // Default fallback icon
      IconComponent = HeroIcons.QuestionMarkCircleIcon;
    }

    const finalAnimation = loading ? 'spin' : rotating ? 'spin' : animation;

    const iconElement = (
      <div className={cn('relative inline-flex', clickable && 'cursor-pointer')}>
        <IconComponent
          ref={ref}
          className={cn(
            iconVariants({ size, variant, animation: finalAnimation }),
            clickable && 'hover:opacity-75 transition-opacity',
            className
          )}
          onClick={clickable ? onClick : undefined}
          aria-hidden={!clickable}
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          onKeyDown={clickable ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick?.(e as unknown as React.MouseEvent<SVGSVGElement>);
            }
          } : undefined}
          {...props}
        />
        
        {/* Badge */}
        {badge && (
          <IconBadge
            content={badge}
            color={badgeColor}
            size={size || 'md'}
          />
        )}
      </div>
    );

    // Wrap with tooltip if provided
    if (tooltip) {
      return (
        <div
          className="relative group"
          title={tooltip}
        >
          {iconElement}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      );
    }

    return iconElement;
  }
);

Icon.displayName = 'Icon';

// Icon Button Component
export interface IconButtonProps extends Omit<IconProps, 'variant' | 'onClick'> {
  variant?: 'default' | 'ghost' | 'outline' | 'solid';
  rounded?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const IconButton = forwardRef<SVGSVGElement, IconButtonProps>(
  ({
    variant = 'default',
    rounded = true,
    disabled = false,
    size = 'md',
    className,
    onClick,
    ...iconProps
  }, ref) => {
    const buttonSizes = {
      xs: 'p-1',
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-2.5',
      xl: 'p-3',
      '2xl': 'p-4',
      '3xl': 'p-5',
    };

    const buttonVariants = {
      default: 'bg-background hover:bg-accent text-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      solid: 'bg-primary text-primary-foreground hover:bg-primary/90',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          buttonSizes[size || 'md'],
          buttonVariants[variant || 'default'],
          rounded ? 'rounded-md' : 'rounded-full',
          className
        )}
        disabled={disabled}
        onClick={onClick}
        type="button"
        title={`${name} icon button`}
        aria-label={`${name} icon button`}
      >
        <Icon
          ref={ref}
          size={size}
          clickable={false}
          {...iconProps}
        />
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Icon Group Component
export interface IconGroupProps {
  icons: (IconProps & { key?: string })[];
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export const IconGroup: React.FC<IconGroupProps> = ({
  icons,
  spacing = 'md',
  direction = 'horizontal',
  className,
}) => {
  const spacingClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  const directionClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };

  return (
    <div
      className={cn(
        'flex items-center',
        directionClasses[direction],
        spacingClasses[spacing],
        className
      )}
    >
      {icons.map((iconProps, index) => (
        <Icon
          key={iconProps.key || index}
          {...iconProps}
        />
      ))}
    </div>
  );
};

// Animated Icon Component
export interface AnimatedIconProps extends IconProps {
  hoverAnimation?: 'bounce' | 'pulse' | 'spin' | 'ping';
  duration?: 'fast' | 'normal' | 'slow';
}

export const AnimatedIcon = forwardRef<SVGSVGElement, AnimatedIconProps>(
  ({
    hoverAnimation = 'bounce',
    duration = 'normal',
    className,
    ...iconProps
  }, ref) => {
    const durationClasses = {
      fast: 'duration-150',
      normal: 'duration-300',
      slow: 'duration-500',
    };

    const hoverAnimations = {
      bounce: 'hover:animate-bounce',
      pulse: 'hover:animate-pulse',
      spin: 'hover:animate-spin',
      ping: 'hover:animate-ping',
    };

    return (
      <Icon
        ref={ref}
        className={cn(
          'transition-all',
          durationClasses[duration],
          hoverAnimations[hoverAnimation],
          className
        )}
        {...iconProps}
      />
    );
  }
);

AnimatedIcon.displayName = 'AnimatedIcon';

// Export all components
export default Icon;
