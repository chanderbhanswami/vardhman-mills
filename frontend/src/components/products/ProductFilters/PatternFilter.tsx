'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion } from '@/components/ui/Accordion';

export interface Pattern {
    id: string;
    name: string;
    count: number;
}

export interface PatternFilterProps {
    patterns: Pattern[];
    selectedPatterns: string[];
    onPatternChange: (patterns: string[]) => void;
    className?: string;
    disabled?: boolean;
}

const PatternFilter: React.FC<PatternFilterProps> = ({
    patterns,
    selectedPatterns,
    onPatternChange,
    className,
    disabled = false,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPatterns = useMemo(() => {
        if (!searchQuery) return patterns;
        const query = searchQuery.toLowerCase();
        return patterns.filter((p) => p.name.toLowerCase().includes(query));
    }, [patterns, searchQuery]);

    const handleToggle = (id: string) => {
        if (disabled) return;
        if (selectedPatterns.includes(id)) {
            onPatternChange(selectedPatterns.filter((p) => p !== id));
        } else {
            onPatternChange([...selectedPatterns, id]);
        }
    };

    const selectedCount = selectedPatterns.length;

    const content = (
        <div className="space-y-4 pt-1">
            {patterns.length > 5 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search patterns..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {filteredPatterns.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">No patterns found</p>
                ) : (
                    filteredPatterns.map((pattern) => {
                        const isSelected = selectedPatterns.includes(pattern.id);
                        return (
                            <label
                                key={pattern.id}
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
                                        onChange={() => handleToggle(pattern.id)}
                                        disabled={disabled || pattern.count === 0}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className={cn("text-sm", isSelected ? "font-medium text-gray-900" : "text-gray-700")}>
                                        {pattern.name}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">({pattern.count})</span>
                            </label>
                        );
                    })
                )}
            </div>
        </div>
    );

    const accordionItems = [
        {
            id: 'pattern',
            title: (
                <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Pattern {selectedCount > 0 && <span className="text-primary-600 ml-1">({selectedCount})</span>}
                </span>
            ),
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
            defaultValue="pattern"
        />
    );
};

export default PatternFilter;
