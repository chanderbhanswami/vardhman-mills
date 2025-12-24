'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Accordion } from '@/components/ui/Accordion';

export interface DiscountOption {
    value: number; // e.g., 10 for "10% or more"
    label: string;
    count: number;
}

export interface DiscountFilterProps {
    selectedDiscount: number | null; // Single selection usually makes sense for ranges (e.g. 10%+)
    onDiscountChange: (discount: number | null) => void;
    className?: string;
    disabled?: boolean;
}

const discountOptions: DiscountOption[] = [
    { value: 10, label: '10% or more', count: 0 },
    { value: 20, label: '20% or more', count: 0 },
    { value: 30, label: '30% or more', count: 0 },
    { value: 40, label: '40% or more', count: 0 },
    { value: 50, label: '50% or more', count: 0 },
];

const DiscountFilter: React.FC<DiscountFilterProps> = ({
    selectedDiscount,
    onDiscountChange,
    className,
    disabled = false,
}) => {
    const handleSelect = (value: number) => {
        if (disabled) return;
        if (selectedDiscount === value) {
            onDiscountChange(null);
        } else {
            onDiscountChange(value);
        }
    };

    const content = (
        <div className="space-y-2 pt-1">
            {discountOptions.map((option) => {
                const isSelected = selectedDiscount === option.value;
                return (
                    <label
                        key={option.value}
                        className={cn(
                            "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                            isSelected ? "bg-primary-50" : "hover:bg-gray-50",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                name="discount"
                                checked={isSelected}
                                onChange={() => handleSelect(option.value)}
                                disabled={disabled}
                                className="w-4 h-4 rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className={cn("text-sm", isSelected ? "font-medium text-gray-900" : "text-gray-700")}>
                                {option.label}
                            </span>
                        </div>
                    </label>
                );
            })}
        </div>
    );

    const accordionItems = [
        {
            id: 'discount',
            title: <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Discount {selectedDiscount && <span className="text-primary-600 ml-1">({selectedDiscount}%+)</span>}
            </span>,
            content: content,
            className: 'border-b-0'
        }
    ];

    return (
        <Accordion
            type="single"
            collapsible
            items={accordionItems}
            className={cn("w-full", className)}
            defaultValue="discount"
        />
    );
};

export default DiscountFilter;
