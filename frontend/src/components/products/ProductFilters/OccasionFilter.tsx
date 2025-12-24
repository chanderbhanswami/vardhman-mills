'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Accordion } from '@/components/ui/Accordion';

export interface Occasion {
    id: string;
    name: string;
    count: number;
}

export interface OccasionFilterProps {
    occasions: Occasion[];
    selectedOccasions: string[];
    onOccasionChange: (occasions: string[]) => void;
    className?: string;
    disabled?: boolean;
}

const OccasionFilter: React.FC<OccasionFilterProps> = ({
    occasions,
    selectedOccasions,
    onOccasionChange,
    className,
    disabled = false,
}) => {
    const handleToggle = (id: string) => {
        if (disabled) return;
        if (selectedOccasions.includes(id)) {
            onOccasionChange(selectedOccasions.filter((o) => o !== id));
        } else {
            onOccasionChange([...selectedOccasions, id]);
        }
    };

    const selectedCount = selectedOccasions.length;

    const content = (
        <div className="space-y-2 pt-1 max-h-60 overflow-y-auto custom-scrollbar">
            {occasions.map((occasion) => {
                const isSelected = selectedOccasions.includes(occasion.id);
                return (
                    <label
                        key={occasion.id}
                        className={cn(
                            "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                            isSelected ? "bg-primary-50" : "hover:bg-gray-50",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggle(occasion.id)}
                                disabled={disabled || occasion.count === 0}
                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className={cn("text-sm", isSelected ? "font-medium text-gray-900" : "text-gray-700")}>
                                {occasion.name}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">({occasion.count})</span>
                    </label>
                );
            })}
        </div>
    );

    const accordionItems = [
        {
            id: 'occasion',
            title: (
                <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Occasion {selectedCount > 0 && <span className="text-primary-600 ml-1">({selectedCount})</span>}
                </span>
            ),
            content: content,
            className: 'border-b-0',
            triggerClassName: 'hover:no-underline py-3'
        }
    ];

    return (
        <Accordion
            type="single"
            collapsible
            items={accordionItems}
            className={cn("w-full", className)}
            defaultValue="occasion"
        />
    );
};

export default OccasionFilter;
