'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { format, isValid, parse } from 'date-fns';
import { cn } from '../../lib/utils';
import Calendar from './Calendar';

// Types
export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  className?: string;
  inputClassName?: string;
  calendarClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
  clearable?: boolean;
  position?: 'bottom' | 'top';
}

// DatePicker Component
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  defaultValue,
  onChange,
  placeholder = 'Select date...',
  disabled = false,
  minDate,
  maxDate,
  format: dateFormat = 'MMM dd, yyyy',
  className,
  inputClassName,
  calendarClassName,
  size = 'md',
  variant = 'default',
  error = false,
  errorMessage,
  helperText,
  required = false,
  clearable = true,
  position = 'bottom',
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value || defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const currentDate = isControlled ? value : selectedDate;

  // Update input value when date changes
  useEffect(() => {
    if (currentDate && isValid(currentDate)) {
      setInputValue(format(currentDate, dateFormat));
    } else {
      setInputValue('');
    }
  }, [currentDate, dateFormat]);

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (!isControlled) {
      setSelectedDate(date);
    }
    onChange?.(date);
    setIsOpen(false);
  };

  // Handle input change (manual typing)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Try to parse the date
    if (newValue) {
      const parsedDate = parse(newValue, dateFormat, new Date());
      if (isValid(parsedDate)) {
        if (!isControlled) {
          setSelectedDate(parsedDate);
        }
        onChange?.(parsedDate);
      }
    } else {
      if (!isControlled) {
        setSelectedDate(undefined);
      }
      onChange?.(undefined);
    }
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
    if (!isControlled) {
      setSelectedDate(undefined);
    }
    onChange?.(undefined);
  };

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const sizeStyles = {
    sm: 'h-8 text-sm px-2',
    md: 'h-10 text-base px-3',
    lg: 'h-12 text-lg px-4',
  };

  const variantStyles = {
    default: 'border border-gray-300 bg-white',
    filled: 'border border-gray-300 bg-gray-50',
    outlined: 'border-2 border-gray-300 bg-white',
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full rounded-md transition-colors duration-200 pr-10',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            sizeStyles[size],
            variantStyles[variant],
            error && 'border-red-500 focus:ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
            inputClassName
          )}
        />
        
        {/* Icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {clearable && currentDate && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 mr-1"
            >
              <span className="text-xs">×</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="p-1 text-gray-400 hover:text-gray-600"
            aria-label="Open calendar"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: position === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === 'bottom' ? -10 : 10 }}
            className={cn(
              'absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg',
              position === 'top' && 'bottom-full mb-1 mt-0',
              calendarClassName
            )}
          >
            <Calendar
              value={currentDate}
              onChange={handleDateSelect}
              minDate={minDate}
              maxDate={maxDate}
              size="md"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper/Error Text */}
      {(helperText || errorMessage) && (
        <p className={cn(
          'mt-1 text-xs',
          error ? 'text-red-600' : 'text-gray-600'
        )}>
          {error ? errorMessage : helperText}
        </p>
      )}
    </div>
  );
};

export default DatePicker;
