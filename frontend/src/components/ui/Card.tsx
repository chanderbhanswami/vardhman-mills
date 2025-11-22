'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import { cn } from '../../lib/utils';

// Card variants
const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200',
        elevated: 'bg-white border-gray-200 shadow-md hover:shadow-lg',
        outlined: 'bg-transparent border-2',
        filled: 'bg-gray-50 border-gray-200',
        glass: 'bg-white/80 backdrop-blur-sm border-white/20',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        none: '',
        lift: 'hover:shadow-md hover:-translate-y-1',
        glow: 'hover:shadow-lg hover:shadow-blue-500/25',
        scale: 'hover:scale-[1.02]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hover: 'none',
    },
  }
);

// Types
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  animated?: boolean;
  clickable?: boolean;
  loading?: boolean;
}

// Card Header Component
export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-0', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// Card Title Component
export const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

// Card Description Component
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground text-gray-600', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// Card Content Component
export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// Card Footer Component
export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Loading Skeleton Component
const CardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-300 rounded"></div>
      <div className="h-3 bg-gray-300 rounded w-5/6"></div>
    </div>
  </div>
);

// Main Card Component
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      hover = 'none',
      animated = false,
      clickable = false,
      loading = false,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const cardContent = (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, hover }),
          clickable && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          className
        )}
        onClick={clickable ? onClick : undefined}
        onKeyDown={clickable ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Trigger click programmatically
            if (onClick) {
              e.currentTarget.click();
            }
          }
        } : undefined}
        tabIndex={clickable ? 0 : undefined}
        {...(clickable && { role: 'button' })}
        {...props}
      >
        {loading ? <CardSkeleton /> : children}
      </div>
    );

    if (animated && !loading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={
            hover === 'scale' ? { scale: 1.02 } :
            hover === 'lift' ? { y: -4 } : undefined
          }
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  }
);
Card.displayName = 'Card';

// Preset Card Components
export const SimpleCard: React.FC<{
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className }) => (
  <Card className={className}>
    {(title || description) && (
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    )}
    {children && <CardContent>{children}</CardContent>}
  </Card>
);

export const ActionCard: React.FC<{
  title?: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, description, children, actions, className }) => (
  <Card className={className}>
    {(title || description) && (
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    )}
    {children && <CardContent>{children}</CardContent>}
    {actions && <CardFooter>{actions}</CardFooter>}
  </Card>
);

export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, value, change, changeType = 'neutral', icon, className }) => (
  <Card variant="elevated" hover="lift" className={cn('text-center', className)}>
    <CardContent className="pt-6">
      {icon && (
        <div className="flex justify-center mb-2 text-gray-600">
          {icon}
        </div>
      )}
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
      {change && (
        <div className={cn(
          'text-xs mt-2',
          changeType === 'positive' && 'text-green-600',
          changeType === 'negative' && 'text-red-600',
          changeType === 'neutral' && 'text-gray-600'
        )}>
          {change}
        </div>
      )}
    </CardContent>
  </Card>
);

export const ImageCard: React.FC<{
  src: string;
  alt: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ src, alt, title, description, children, className }) => (
  <Card className={cn('overflow-hidden', className)}>
    <div className="aspect-video relative">
      <Image 
        src={src} 
        alt={alt} 
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
    {(title || description) && (
      <CardHeader>
        {title && <CardTitle className="text-lg">{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    )}
    {children && <CardContent>{children}</CardContent>}
  </Card>
);

// Default export
export default Card;
