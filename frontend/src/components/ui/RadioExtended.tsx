'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface RadioGroupItemProps {
  value: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}>({});

const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  children,
  className,
  disabled = false
}) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
      <div
        role="radiogroup"
        className={cn('space-y-2', className)}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  id,
  disabled = false,
  className
}) => {
  const context = React.useContext(RadioGroupContext);
  const isChecked = context.value === value;
  const isDisabled = disabled || context.disabled;

  const handleChange = () => {
    if (!isDisabled) {
      context.onValueChange?.(value);
    }
  };

  const buttonProps = {
    type: 'button' as const,
    role: 'radio' as const,
    id,
    'aria-checked': (isChecked ? 'true' : 'false') as 'true' | 'false',
    onClick: handleChange,
    disabled: isDisabled,
  };

  return (
    <button
      {...buttonProps}
      className={cn(
        'h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isChecked && 'border-blue-600 bg-blue-600',
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isDisabled && 'hover:border-blue-400',
        className
      )}
    >
      {isChecked && (
        <div className="h-2 w-2 rounded-full bg-white" />
      )}
    </button>
  );
};

const Label: React.FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium leading-none cursor-pointer',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
    >
      {children}
    </label>
  );
};

export { RadioGroup, RadioGroupItem, Label };
export default RadioGroup;