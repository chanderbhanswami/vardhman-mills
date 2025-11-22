'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

export interface MaterialOption {
  id: string;
  name: string;
  count: number;
  description?: string;
  properties?: string[];
}

export interface MaterialFilterProps {
  materials: MaterialOption[];
  selectedMaterials: string[];
  onMaterialChange: (materials: string[]) => void;
  maxVisible?: number;
  className?: string;
  disabled?: boolean;
  showSearch?: boolean;
  showDescriptions?: boolean;
}

const MaterialFilter: React.FC<MaterialFilterProps> = ({
  materials,
  selectedMaterials,
  onMaterialChange,
  maxVisible = 6,
  className,
  disabled = false,
  showSearch = true,
  showDescriptions = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredMaterials = useMemo(() => {
    if (!searchQuery) return materials;
    const query = searchQuery.toLowerCase();
    return materials.filter(
      (material) =>
        material.name.toLowerCase().includes(query) ||
        material.description?.toLowerCase().includes(query)
    );
  }, [materials, searchQuery]);

  const visibleMaterials = isExpanded
    ? filteredMaterials
    : filteredMaterials.slice(0, maxVisible);
  const hasMore = filteredMaterials.length > maxVisible;

  const handleMaterialToggle = (materialId: string) => {
    if (disabled) return;

    if (selectedMaterials.includes(materialId)) {
      onMaterialChange(selectedMaterials.filter((id) => id !== materialId));
    } else {
      onMaterialChange([...selectedMaterials, materialId]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onMaterialChange(filteredMaterials.map((material) => material.id));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onMaterialChange([]);
  };

  const selectedCount = selectedMaterials.length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Material</h3>
        {selectedCount > 0 && (
          <button
            onClick={handleClearAll}
            disabled={disabled}
            className="text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            Clear ({selectedCount})
          </button>
        )}
      </div>

      {showSearch && materials.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials..."
            disabled={disabled}
            className={cn(
              'w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      )}

      {filteredMaterials.length > 0 ? (
        <>
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {visibleMaterials.map((material, index) => {
                const isSelected = selectedMaterials.includes(material.id);

                return (
                  <motion.label
                    key={material.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                      isSelected ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50',
                      disabled && 'opacity-50 cursor-not-allowed',
                      material.count === 0 && 'opacity-40'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleMaterialToggle(material.id)}
                      disabled={disabled || material.count === 0}
                      className={cn(
                        'mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600',
                        'focus:ring-2 focus:ring-primary-500',
                        'disabled:cursor-not-allowed'
                      )}
                      aria-label={`Select ${material.name} material`}
                      title={material.name}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-sm',
                              isSelected ? 'font-medium text-gray-900' : 'text-gray-700'
                            )}
                          >
                            {material.name}
                          </span>
                          {showDescriptions && material.description && (
                            <Tooltip content={material.description}>
                              <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                            </Tooltip>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          ({material.count})
                        </span>
                      </div>

                      {showDescriptions && material.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {material.description}
                        </p>
                      )}

                      {material.properties && material.properties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {material.properties.slice(0, 3).map((property, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                            >
                              {property}
                            </span>
                          ))}
                          {material.properties.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-gray-500">
                              +{material.properties.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.label>
                );
              })}
            </AnimatePresence>
          </div>

          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Show All ({filteredMaterials.length})</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}

          {filteredMaterials.length > 1 && selectedCount < filteredMaterials.length && (
            <button
              onClick={handleSelectAll}
              disabled={disabled}
              className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 disabled:opacity-50"
            >
              Select All Visible
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No materials found</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {selectedCount > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Selected Materials:</p>
          <div className="flex flex-wrap gap-2">
            {materials
              .filter((material) => selectedMaterials.includes(material.id))
              .map((material) => (
                <div
                  key={material.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                >
                  <span>{material.name}</span>
                  <button
                    onClick={() => handleMaterialToggle(material.id)}
                    disabled={disabled}
                    className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                    aria-label={`Remove ${material.name} material filter`}
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialFilter;
