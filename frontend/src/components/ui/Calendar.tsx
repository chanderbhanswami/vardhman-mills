'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, Locale } from 'date-fns';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Calendar variants
const calendarVariants = cva(
  'p-4 bg-white rounded-lg shadow-md border',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// Types
export interface CalendarProps extends VariantProps<typeof calendarVariants> {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  disabledDates?: Date[];
  highlightedDates?: Date[];
  showWeekNumbers?: boolean;
  showOutsideDays?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?: Locale;
  className?: string;
  animated?: boolean;
}

// Calendar Component
export const Calendar: React.FC<CalendarProps> = ({
  value,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  disabledDates = [],
  highlightedDates = [],
  showWeekNumbers = false,
  showOutsideDays = true,
  weekStartsOn = 0,
  size = 'md',
  className,
  animated = true,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value || defaultValue);
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date());

  const handleDateSelect = (date: Date) => {
    if (disabled) return;
    
    const isDisabled = disabledDates.some(disabledDate => isSameDay(date, disabledDate));
    const isBeforeMin = minDate && date < minDate;
    const isAfterMax = maxDate && date > maxDate;
    
    if (isDisabled || isBeforeMin || isAfterMax) return;

    setSelectedDate(date);
    onChange?.(date);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks = useMemo(() => {
    const weeksArray = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArray.push(days.slice(i, i + 7));
    }
    return weeksArray;
  }, [days]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className={cn(calendarVariants({ size }), className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePreviousMonth}
          disabled={disabled}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        
        <h2 className="font-semibold text-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <button
          type="button"
          onClick={handleNextMonth}
          disabled={disabled}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Next month"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {showWeekNumbers && <div className="text-center text-xs text-gray-500 p-2">Wk</div>}
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-gray-500 p-2 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        <AnimatePresence mode="wait">
          {weeks.map((week, weekIndex) => (
            <motion.div
              key={`week-${weekIndex}-${format(currentMonth, 'yyyy-MM')}`}
              className="grid grid-cols-7 gap-1"
              initial={animated ? { opacity: 0, y: 10 } : undefined}
              animate={animated ? { opacity: 1, y: 0 } : undefined}
              transition={animated ? { delay: weekIndex * 0.05 } : undefined}
            >
              {showWeekNumbers && (
                <div className="text-center text-xs text-gray-400 p-2 flex items-center justify-center">
                  {format(week[0], 'w')}
                </div>
              )}
              
              {week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isDayToday = isToday(day);
                const isHighlighted = highlightedDates.some(date => isSameDay(date, day));
                const isDisabled = disabledDates.some(date => isSameDay(date, day)) ||
                  (minDate && day < minDate) ||
                  (maxDate && day > maxDate);

                return (
                  <motion.button
                    key={dayIndex}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={disabled || isDisabled}
                    whileHover={animated ? { scale: 1.05 } : undefined}
                    whileTap={animated ? { scale: 0.95 } : undefined}
                    className={cn(
                      'h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors relative',
                      'hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                      {
                        'text-gray-400': !isCurrentMonth && !showOutsideDays,
                        'invisible': !isCurrentMonth && !showOutsideDays,
                        'text-gray-500': !isCurrentMonth && showOutsideDays,
                        'text-gray-900': isCurrentMonth,
                        'bg-blue-500 text-white hover:bg-blue-600': isSelected,
                        'bg-red-100 text-red-600': isDayToday && !isSelected,
                        'bg-yellow-100 text-yellow-800': isHighlighted && !isSelected,
                        'opacity-50 cursor-not-allowed': isDisabled,
                      }
                    )}
                  >
                    {format(day, 'd')}
                    {isDayToday && !isSelected && (
                      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Calendar;
