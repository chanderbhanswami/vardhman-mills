import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Spinner variants
const spinnerVariants = cva(
  'animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
  {
    variants: {
      variant: {
        default: 'border-2',
        border: 'border-2',
        dots: 'border-0',
        pulse: 'border-0',
        bars: 'border-0',
        ring: 'border-4 border-gray-200 border-t-blue-600',
        dual: 'border-2',
      },
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
        '2xl': 'h-16 w-16',
      },
      speed: {
        slow: 'animate-[spin_2s_linear_infinite]',
        normal: 'animate-spin',
        fast: 'animate-[spin_0.5s_linear_infinite]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      speed: 'normal',
    },
  }
);

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
  color?: string;
  thickness?: number;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    speed = 'normal',
    label = 'Loading...',
    color,
    thickness,
    ...props 
  }, ref) => {
    // Different spinner implementations based on variant
    const renderSpinner = () => {
      switch (variant) {
        case 'dots':
          return (
            <div className={cn('inline-flex space-x-1', className)} {...props} ref={ref}>
              <div
                className={cn(
                  'rounded-full bg-current',
                  size === 'xs' && 'h-1 w-1',
                  size === 'sm' && 'h-1.5 w-1.5',
                  size === 'default' && 'h-2 w-2',
                  size === 'lg' && 'h-2.5 w-2.5',
                  size === 'xl' && 'h-3 w-3',
                  size === '2xl' && 'h-4 w-4',
                  speed === 'slow' && 'animate-[bounce_2s_infinite_0ms]',
                  speed === 'normal' && 'animate-[bounce_1.4s_infinite_0ms]',
                  speed === 'fast' && 'animate-[bounce_0.7s_infinite_0ms]'
                )}
                data-color={color}
              />
              <div
                className={cn(
                  'rounded-full bg-current',
                  size === 'xs' && 'h-1 w-1',
                  size === 'sm' && 'h-1.5 w-1.5',
                  size === 'default' && 'h-2 w-2',
                  size === 'lg' && 'h-2.5 w-2.5',
                  size === 'xl' && 'h-3 w-3',
                  size === '2xl' && 'h-4 w-4',
                  speed === 'slow' && 'animate-[bounce_2s_infinite_200ms]',
                  speed === 'normal' && 'animate-[bounce_1.4s_infinite_200ms]',
                  speed === 'fast' && 'animate-[bounce_0.7s_infinite_100ms]'
                )}
                data-color={color}
                data-thickness={thickness}
              />
              <div
                className={cn(
                  'rounded-full bg-current',
                  size === 'xs' && 'h-1 w-1',
                  size === 'sm' && 'h-1.5 w-1.5',
                  size === 'default' && 'h-2 w-2',
                  size === 'lg' && 'h-2.5 w-2.5',
                  size === 'xl' && 'h-3 w-3',
                  size === '2xl' && 'h-4 w-4',
                  speed === 'slow' && 'animate-[bounce_2s_infinite_400ms]',
                  speed === 'normal' && 'animate-[bounce_1.4s_infinite_400ms]',
                  speed === 'fast' && 'animate-[bounce_0.7s_infinite_200ms]'
                )}
                data-color={color}
                data-thickness={thickness}
              />
              <span className="sr-only">{label}</span>
            </div>
          );

        case 'pulse':
          return (
            <div
              className={cn(
                'rounded-full bg-current',
                size === 'xs' && 'h-3 w-3',
                size === 'sm' && 'h-4 w-4',
                size === 'default' && 'h-6 w-6',
                size === 'lg' && 'h-8 w-8',
                size === 'xl' && 'h-12 w-12',
                size === '2xl' && 'h-16 w-16',
                speed === 'slow' && 'animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]',
                speed === 'normal' && 'animate-pulse',
                speed === 'fast' && 'animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite]',
                className
              )}
              data-color={color}
              data-thickness={thickness}
              {...props}
              ref={ref}
            >
              <span className="sr-only">{label}</span>
            </div>
          );

        case 'bars':
          return (
            <div className={cn('inline-flex space-x-0.5', className)} {...props} ref={ref}>
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={cn(
                    'bg-current',
                    size === 'xs' && 'h-2 w-0.5',
                    size === 'sm' && 'h-3 w-0.5',
                    size === 'default' && 'h-4 w-1',
                    size === 'lg' && 'h-6 w-1',
                    size === 'xl' && 'h-8 w-1.5',
                    size === '2xl' && 'h-12 w-2',
                    speed === 'slow' && 'animate-[pulse_2s_ease-in-out_infinite]',
                    speed === 'normal' && 'animate-[pulse_1.2s_ease-in-out_infinite]',
                    speed === 'fast' && 'animate-[pulse_0.6s_ease-in-out_infinite]'
                  )}
                  data-color={color}
                  data-thickness={thickness}
                  data-animation-delay={index * 0.1}
                />
              ))}
              <span className="sr-only">{label}</span>
            </div>
          );

        case 'dual':
          return (
            <div className={cn('relative', className)} {...props} ref={ref}>
              <div
                className={cn(
                  spinnerVariants({ variant: 'border', size, speed }),
                  'opacity-25'
                )}
                data-color={color}
                data-thickness={thickness}
              />
              <div
                className={cn(
                  spinnerVariants({ variant: 'border', size, speed }),
                  'absolute left-0 top-0 border-r-transparent border-t-current border-l-transparent border-b-transparent'
                )}
                data-color={color}
                data-thickness={thickness}
              />
              <span className="sr-only">{label}</span>
            </div>
          );

        case 'ring':
          return (
            <div
              className={cn(
                'inline-block rounded-full border-4 border-solid border-gray-200 border-t-blue-600',
                size === 'xs' && 'h-3 w-3 border-2',
                size === 'sm' && 'h-4 w-4 border-2',
                size === 'default' && 'h-6 w-6 border-4',
                size === 'lg' && 'h-8 w-8 border-4',
                size === 'xl' && 'h-12 w-12 border-[6px]',
                size === '2xl' && 'h-16 w-16 border-8',
                speed === 'slow' && 'animate-[spin_2s_linear_infinite]',
                speed === 'normal' && 'animate-spin',
                speed === 'fast' && 'animate-[spin_0.5s_linear_infinite]',
                className
              )}
              data-color={color}
              data-thickness={thickness}
              {...props}
              ref={ref}
            >
              <span className="sr-only">{label}</span>
            </div>
          );

        default:
          return (
            <div
              className={cn(spinnerVariants({ variant, size, speed }), className)}
              data-color={color}
              data-thickness={thickness}
              {...props}
              ref={ref}
              role="status"
              aria-label={label}
            >
              <span className="sr-only">{label}</span>
            </div>
          );
      }
    };

    return renderSpinner();
  }
);

Spinner.displayName = 'Spinner';

// Preset spinner components
export const LoadingSpinner: React.FC<Omit<SpinnerProps, 'variant'>> = (props) => (
  <Spinner variant="default" {...props} />
);

export const DotsSpinner: React.FC<Omit<SpinnerProps, 'variant'>> = (props) => (
  <Spinner variant="dots" {...props} />
);

export const PulseSpinner: React.FC<Omit<SpinnerProps, 'variant'>> = (props) => (
  <Spinner variant="pulse" {...props} />
);

export const BarsSpinner: React.FC<Omit<SpinnerProps, 'variant'>> = (props) => (
  <Spinner variant="bars" {...props} />
);

export const RingSpinner: React.FC<Omit<SpinnerProps, 'variant'>> = (props) => (
  <Spinner variant="ring" {...props} />
);

export const DualRingSpinner: React.FC<Omit<SpinnerProps, 'variant'>> = (props) => (
  <Spinner variant="dual" {...props} />
);

// Loading overlay component
export interface LoadingOverlayProps extends SpinnerProps {
  show: boolean;
  text?: string;
  backdrop?: boolean;
  backdropClassName?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  text = 'Loading...',
  backdrop = true,
  backdropClassName,
  className,
  ...spinnerProps
}) => {
  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        backdrop && 'bg-background/80 backdrop-blur-sm',
        backdropClassName
      )}
    >
      <div className="flex flex-col items-center space-y-2">
        <Spinner {...spinnerProps} className={className} />
        {text && (
          <p className="text-sm font-medium text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  );
};

// Loading button
export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  spinnerProps?: SpinnerProps;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  spinnerProps = {},
  disabled,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'h-10 px-4 py-2',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Spinner
          size="sm"
          className="mr-2"
          {...spinnerProps}
        />
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
};

// Inline spinner for text
export interface InlineSpinnerProps extends Omit<SpinnerProps, 'size'> {
  text?: string;
}

export const InlineSpinner: React.FC<InlineSpinnerProps> = ({
  text = 'Loading',
  className,
  ...props
}) => {
  return (
    <span className={cn('inline-flex items-center space-x-2', className)}>
      <Spinner size="xs" {...props} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </span>
  );
};

export default Spinner;
