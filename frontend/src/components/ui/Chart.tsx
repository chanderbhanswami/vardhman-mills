'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  PresentationChartBarIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// Chart data types
export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface ChartLine {
  key: string;
  color: string;
  name: string;
  yAxis?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: boolean;
}

export interface ChartBar {
  key: string;
  color: string;
  name: string;
  stackId?: string;
  radius?: number;
}

export interface ChartArea {
  key: string;
  color: string;
  name: string;
  stackId?: string;
  strokeWidth?: number;
  fillOpacity?: number;
}

export interface ChartProps {
  // Data
  data: ChartDataPoint[];
  
  // Chart type
  type: 'line' | 'bar' | 'area' | 'pie' | 'composed';
  
  // Axes
  xAxisKey: string;
  yAxisKey?: string;
  
  // Chart elements
  lines?: ChartLine[];
  bars?: ChartBar[];
  areas?: ChartArea[];
  
  // Dimensions
  width?: number | string;
  height?: number | string;
  
  // Styling
  className?: string;
  containerClassName?: string;
  
  // Options
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  showAxes?: boolean;
  animated?: boolean;
  responsive?: boolean;
  
  // Colors
  colors?: string[];
  theme?: 'light' | 'dark';
  
  // Events
  onDataPointClick?: (data: ChartDataPoint, index: number) => void;
  onLegendClick?: (dataKey: string) => void;
}

// Color palette
const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6b7280'  // gray-500
];

// Simple chart implementation with placeholders for future chart library integration
const Chart: React.FC<ChartProps> = ({
  data,
  type,
  xAxisKey,
  yAxisKey,
  lines = [],
  bars = [],
  areas = [],
  width = '100%',
  height = 300,
  className,
  containerClassName,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  showAxes = true,
  animated = true,
  responsive = true,
  colors = DEFAULT_COLORS,
  theme = 'light',
  onDataPointClick,
  onLegendClick
}) => {
  // Calculate chart metrics
  const chartMetrics = useMemo(() => {
    if (!data.length) return { min: 0, max: 0, dataPoints: 0 };
    
    const allValues: number[] = [];
    
    // Collect all numeric values for scaling
    data.forEach(point => {
      Object.entries(point).forEach(([key, value]) => {
        if (key !== xAxisKey && typeof value === 'number') {
          allValues.push(value);
        }
      });
    });
    
    return {
      min: Math.min(...allValues),
      max: Math.max(...allValues),
      dataPoints: data.length
    };
  }, [data, xAxisKey]);

  // Get chart icon based on type
  const getChartIcon = () => {
    switch (type) {
      case 'line':
        return PresentationChartBarIcon;
      case 'bar':
        return ChartBarIcon;
      case 'area':
        return PresentationChartBarIcon;
      case 'pie':
        return ChartPieIcon;
      default:
        return ChartBarIcon;
    }
  };

  const ChartIcon = getChartIcon();

  // Get data series info
  const getSeriesInfo = () => {
    switch (type) {
      case 'line':
        return lines.map(line => line.name).join(', ') || 'Line Chart';
      case 'bar':
        return bars.map(bar => bar.name).join(', ') || 'Bar Chart';
      case 'area':
        return areas.map(area => area.name).join(', ') || 'Area Chart';
      default:
        return `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`;
    }
  };

  // Legend component
  const Legend = () => {
    if (!showLegend) return null;

    const legendItems = [...lines, ...bars, ...areas];
    if (!legendItems.length) return null;

    return (
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {legendItems.map((item, index) => (
          <button
            key={item.key}
            onClick={() => onLegendClick?.(item.key)}
            className="flex items-center gap-2 text-sm hover:opacity-75 transition-opacity"
          >
            <div
              className="w-3 h-3 rounded-full bg-blue-500"
              data-color={item.color || colors[index % colors.length]}
            />
            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              {item.name}
            </span>
          </button>
        ))}
      </div>
    );
  };

  // Chart placeholder with animation
  const ChartPlaceholder = () => (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.95 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.3 }}
      className={cn(
        'w-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-600 text-gray-300' 
          : 'bg-gray-50 border-gray-300 text-gray-500'
      )}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <ChartIcon className="w-16 h-16 mb-3 opacity-60" />
      <div className="text-center space-y-1">
        <p className="font-medium">{getSeriesInfo()}</p>
        <p className="text-sm opacity-75">
          {chartMetrics.dataPoints} data points
        </p>
        {chartMetrics.dataPoints > 0 && (
          <p className="text-xs opacity-60">
            Range: {chartMetrics.min.toFixed(1)} - {chartMetrics.max.toFixed(1)}
          </p>
        )}
      </div>
      
      {/* Data preview bars */}
      {data.length > 0 && (
        <div className="flex items-end gap-1 mt-4 h-12">
          {data.slice(0, 8).map((point, index) => {
            const value = typeof point[yAxisKey || Object.keys(point)[1]] === 'number' 
              ? point[yAxisKey || Object.keys(point)[1]] as number
              : Math.random() * 40 + 10;
            const height = Math.max(8, (value / chartMetrics.max) * 40);
            
            return (
              <motion.div
                key={index}
                initial={animated ? { height: 0 } : { height }}
                animate={{ height }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={cn(
                  'w-2 rounded-t transition-colors',
                  theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                )}
                data-color={colors[index % colors.length]}
              />
            );
          })}
          {data.length > 8 && (
            <span className="text-xs opacity-50 ml-1">
              +{data.length - 8}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );

  return (
    <div 
      className={cn(
        'w-full',
        responsive && 'max-w-full overflow-hidden',
        containerClassName
      )}
      data-width={typeof width === 'number' ? `${width}px` : width}
    >
      <div className={cn('relative', className)}>
        <ChartPlaceholder />
        <Legend />
      </div>
      
      {/* Development note */}
      {process.env.NODE_ENV === 'development' && (
        <div className={cn(
          'mt-2 p-2 rounded text-xs',
          theme === 'dark' 
            ? 'bg-yellow-900/20 text-yellow-200 border border-yellow-600/30' 
            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        )}>
          <strong>Dev Note:</strong> Chart component placeholder. 
          Features available: {[showGrid && 'grid', showTooltip && 'tooltip', showAxes && 'axes'].filter(Boolean).join(', ') || 'basic'}.
          Click handler: {onDataPointClick ? 'enabled' : 'disabled'}.
          Integrate with a chart library like Recharts, Chart.js, or D3.js for full functionality.
        </div>
      )}
    </div>
  );
};

export default Chart;