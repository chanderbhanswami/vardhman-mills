'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  InformationCircleIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  PrinterIcon,
  ShareIcon,
  BookmarkIcon,
  StarIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

// Types and Interfaces
export interface SizeChart {
  id: string;
  name: string;
  category: 'bedding' | 'curtains' | 'rugs' | 'furniture' | 'upholstery' | 'tableLinen' | 'towels' | 'quilts';
  room: 'bedroom' | 'livingRoom' | 'diningRoom' | 'kitchen' | 'bathroom' | 'outdoor' | 'universal';
  region: 'us' | 'uk' | 'eu' | 'asia' | 'international' | 'indian';
  unit: 'inches' | 'cm' | 'feet' | 'meters';
  headers: string[];
  rows: SizeRow[];
  notes?: string[];
  lastUpdated: string;
  popularity: number;
  material?: string;
  threadCount?: number;
}

export interface SizeRow {
  size: string;
  measurements: (string | number)[];
  fit?: 'tight' | 'regular' | 'loose' | 'fitted' | 'relaxed' | 'oversized';
  recommended?: boolean;
  available?: boolean;
  price?: number;
  material?: string;
}

export interface MeasurementTip {
  id: string;
  title: string;
  description: string;
  steps: string[];
  image?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tools: string[];
  roomType?: string;
}

export interface SizeRecommendation {
  size: string;
  confidence: number;
  reasoning: string[];
  alternatives: {
    size: string;
    reason: string;
  }[];
}

export interface RoomMeasurements {
  roomLength?: number;
  roomWidth?: number;
  windowWidth?: number;
  windowHeight?: number;
  bedSize?: string;
  tableLength?: number;
  tableWidth?: number;
  unit: 'metric' | 'imperial';
}

export interface SizeGuideProps {
  charts?: SizeChart[];
  selectedCategory?: string;
  selectedRoom?: string;
  selectedRegion?: string;
  onCategoryChange?: (category: string) => void;
  onRoomChange?: (room: string) => void;
  onRegionChange?: (region: string) => void;
  showSizeCalculator?: boolean;
  showMeasurementTips?: boolean;
  showFitGuide?: boolean;
  showReviews?: boolean;
  roomMeasurements?: RoomMeasurements;
  onMeasurementsChange?: (measurements: RoomMeasurements) => void;
  className?: string;
  enableAnimations?: boolean;
  showPrintButton?: boolean;
  showShareButton?: boolean;
  showBookmark?: boolean;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};



const tableVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4 }
  }
};

// Default data for Vardhman Mills Home Furnishing
const defaultCharts: SizeChart[] = [
  {
    id: 'bed-sheets',
    name: 'Bed Sheets & Fitted Sheets',
    category: 'bedding',
    room: 'bedroom',
    region: 'indian',
    unit: 'inches',
    headers: ['Size', 'Length', 'Width', 'Fitted Depth', 'Pillowcase'],
    rows: [
      { size: 'Single', measurements: [90, 60, 8, '18x28'], fit: 'fitted', available: true, material: 'Cotton' },
      { size: 'Double', measurements: [90, 78, 8, '18x28'], fit: 'fitted', available: true, recommended: true, material: 'Cotton' },
      { size: 'Queen', measurements: [100, 90, 10, '20x30'], fit: 'fitted', available: true, material: 'Cotton', price: 2500 },
      { size: 'King', measurements: [108, 90, 10, '20x30'], fit: 'fitted', available: true, material: 'Cotton', price: 3200 },
      { size: 'Super King', measurements: [108, 108, 12, '20x30'], fit: 'fitted', available: true, material: 'Premium Cotton', price: 4000 }
    ],
    notes: [
      'All measurements are in inches',
      'Fitted depth accommodates mattress thickness',
      'Thread count: 200-400 TC available',
      'Machine washable cotton fabric'
    ],
    lastUpdated: '2024-01-15T10:00:00Z',
    popularity: 98,
    material: 'Cotton',
    threadCount: 300
  },
  {
    id: 'curtains-window',
    name: 'Window Curtains & Drapes',
    category: 'curtains',
    room: 'livingRoom',
    region: 'indian',
    unit: 'inches',
    headers: ['Size', 'Width', 'Height', 'Rod Pocket', 'Tiebacks'],
    rows: [
      { size: 'Small Window', measurements: [48, 60, 3, 'Included'], fit: 'regular', available: true, material: 'Polyester' },
      { size: 'Medium Window', measurements: [60, 84, 3, 'Included'], fit: 'regular', available: true, recommended: true, material: 'Cotton Blend' },
      { size: 'Large Window', measurements: [84, 96, 3, 'Included'], fit: 'regular', available: true, material: 'Silk Blend', price: 3500 },
      { size: 'Patio Door', measurements: [120, 108, 3, 'Included'], fit: 'loose', available: true, material: 'Linen', price: 5000 },
      { size: 'Custom Size', measurements: ['Custom', 'Custom', 3, 'Included'], fit: 'regular', available: true, material: 'Various', price: 4500 }
    ],
    notes: [
      'Measure window width and add 6-12 inches for full coverage',
      'Height includes rod pocket allowance',
      'Blackout lining available on request',
      'Professional installation service available'
    ],
    lastUpdated: '2024-01-15T10:00:00Z',
    popularity: 95
  },
  {
    id: 'area-rugs',
    name: 'Area Rugs & Carpets',
    category: 'rugs',
    room: 'universal',
    region: 'indian',
    unit: 'feet',
    headers: ['Size', 'Length', 'Width', 'Pile Height', 'Weight'],
    rows: [
      { size: 'Small (3x5)', measurements: [5, 3, 0.5, '15 lbs'], fit: 'regular', available: true, material: 'Jute', price: 2500 },
      { size: 'Medium (5x8)', measurements: [8, 5, 0.5, '35 lbs'], fit: 'regular', available: true, recommended: true, material: 'Wool Blend', price: 6500 },
      { size: 'Large (8x10)', measurements: [10, 8, 0.75, '65 lbs'], fit: 'regular', available: true, material: 'Pure Wool', price: 12000 },
      { size: 'Runner (2x8)', measurements: [8, 2, 0.5, '18 lbs'], fit: 'regular', available: true, material: 'Cotton', price: 3500 },
      { size: 'Extra Large (9x12)', measurements: [12, 9, 0.75, '85 lbs'], fit: 'regular', available: true, material: 'Silk Blend', price: 18000 }
    ],
    notes: [
      'Leave 18-24 inches between rug edge and wall',
      'For dining areas, ensure rug extends 24 inches beyond table',
      'Professional cleaning recommended',
      'Anti-slip padding available separately'
    ],
    lastUpdated: '2024-01-15T10:00:00Z',
    popularity: 92
  },
  {
    id: 'table-linen',
    name: 'Table Runners & Tablecloths',
    category: 'tableLinen',
    room: 'diningRoom',
    region: 'indian',
    unit: 'inches',
    headers: ['Size', 'Length', 'Width', 'Drop Length', 'Seats'],
    rows: [
      { size: '4-Seater Round', measurements: [60, 60, 10, '4'], fit: 'fitted', available: true, material: 'Cotton' },
      { size: '6-Seater Rectangular', measurements: [90, 60, 12, '6'], fit: 'fitted', available: true, recommended: true, material: 'Linen' },
      { size: '8-Seater Rectangular', measurements: [108, 60, 12, '8'], fit: 'fitted', available: true, material: 'Silk Blend' },
      { size: 'Table Runner', measurements: [72, 14, 0, 'N/A'], fit: 'regular', available: true, material: 'Jacquard' },
      { size: '10-Seater Oval', measurements: [120, 84, 15, '10'], fit: 'fitted', available: true, material: 'Premium Linen' }
    ],
    notes: [
      'Drop length is overhang from table edge',
      'Formal dining: 15-inch drop, casual: 8-12 inch drop',
      'Table runners should be 12-18 inches longer than table',
      'Stain-resistant treatments available'
    ],
    lastUpdated: '2024-01-15T10:00:00Z',
    popularity: 88
  },
  {
    id: 'bath-towels',
    name: 'Bath Towels & Bath Linens',
    category: 'towels',
    room: 'bathroom',
    region: 'indian',
    unit: 'inches',
    headers: ['Type', 'Length', 'Width', 'GSM', 'Absorbency'],
    rows: [
      { size: 'Face Towel', measurements: [12, 12, 400, 'Medium'], fit: 'regular', available: true, material: 'Cotton' },
      { size: 'Hand Towel', measurements: [16, 24, 450, 'High'], fit: 'regular', available: true, material: 'Cotton' },
      { size: 'Bath Towel', measurements: [27, 54, 500, 'High'], fit: 'regular', available: true, recommended: true, material: 'Premium Cotton' },
      { size: 'Bath Sheet', measurements: [35, 70, 600, 'Ultra High'], fit: 'oversized', available: true, material: 'Egyptian Cotton' },
      { size: 'Beach Towel', measurements: [30, 60, 450, 'High'], fit: 'oversized', available: true, material: 'Quick Dry' }
    ],
    notes: [
      'GSM indicates towel thickness and absorbency',
      'Higher GSM = more absorbent and luxurious feel',
      'Pre-shrunk and colorfast fabric',
      'Available in sets with matching accessories'
    ],
    lastUpdated: '2024-01-15T10:00:00Z',
    popularity: 90
  }
];

const measurementTips: MeasurementTip[] = [
  {
    id: 'window-measurement',
    title: 'How to Measure Windows for Curtains',
    description: 'Get perfect curtain fit with accurate window measurements',
    steps: [
      'Measure the width of your window frame from outside edge to outside edge',
      'Add 6-12 inches on each side for full coverage and privacy',
      'Measure height from curtain rod to desired length (sill, apron, or floor)',
      'For floor-length curtains, subtract 1/2 inch to avoid dragging',
      'Note any obstacles like radiators or furniture below the window'
    ],
    category: 'curtains',
    difficulty: 'easy',
    tools: ['Measuring tape', 'Step ladder', 'Notepad', 'Helper (recommended)'],
    roomType: 'Any room with windows'
  },
  {
    id: 'bed-measurement',
    title: 'How to Measure Your Bed for Linens',
    description: 'Ensure perfect fit for sheets, comforters, and bed accessories',
    steps: [
      'Measure mattress length from head to foot',
      'Measure mattress width from side to side',
      'Measure mattress depth/thickness for fitted sheets',
      'Add 8-12 inches to length and width for comforter overhang',
      'Measure pillow dimensions for appropriate pillowcase size'
    ],
    category: 'bedding',
    difficulty: 'easy',
    tools: ['Measuring tape', 'Notepad'],
    roomType: 'Bedroom'
  },
  {
    id: 'room-measurement',
    title: 'How to Measure Room for Area Rugs',
    description: 'Choose the right rug size for your space',
    steps: [
      'Measure the length and width of your room',
      'Identify furniture placement and traffic patterns',
      'Leave 18-24 inches between rug edge and walls',
      'For dining areas, ensure rug extends 24 inches beyond table on all sides',
      'In living rooms, front legs of furniture should sit on the rug'
    ],
    category: 'rugs',
    difficulty: 'medium',
    tools: ['Measuring tape', 'Chalk or painter\'s tape', 'Graph paper (optional)'],
    roomType: 'Living room, dining room, bedroom'
  },
  {
    id: 'table-measurement',
    title: 'How to Measure Tables for Linen',
    description: 'Perfect tablecloth sizing for any occasion',
    steps: [
      'Measure table length and width (or diameter for round tables)',
      'Decide on drop length: 8-12 inches for casual, 15+ inches for formal',
      'Add double the drop length to each dimension',
      'For table runners, measure table length and add 12-18 inches',
      'Consider table leaf extensions for expandable tables'
    ],
    category: 'tableLinen',
    difficulty: 'easy',
    tools: ['Measuring tape', 'Calculator', 'Notepad'],
    roomType: 'Dining room, kitchen'
  },
  {
    id: 'upholstery-measurement',
    title: 'How to Measure Furniture for Covers',
    description: 'Accurate measurements for custom furniture covers',
    steps: [
      'Measure furniture width at the widest point',
      'Measure depth from front to back including cushions',
      'Measure height from floor to highest point',
      'Note arm style and height for proper fit',
      'Consider tucking allowance for secure fit'
    ],
    category: 'upholstery',
    difficulty: 'hard',
    tools: ['Measuring tape', 'Flexible ruler', 'Camera for reference', 'Helper'],
    roomType: 'Living room, family room'
  }
];

// Utility functions
const formatMeasurement = (value: string | number, unit: string) => {
  if (typeof value === 'string') return value;
  
  switch (unit) {
    case 'inches':
      return `${value}"`;
    case 'cm':
      return `${value}cm`;
    default:
      return value.toString();
  }
};

const getFitColor = (fit?: string) => {
  const colors = {
    tight: 'bg-red-100 text-red-800',
    regular: 'bg-green-100 text-green-800',
    loose: 'bg-blue-100 text-blue-800'
  };
  return fit ? colors[fit as keyof typeof colors] : '';
};

const calculateSizeRecommendation = (
  measurements: RoomMeasurements,
  chart: SizeChart
): SizeRecommendation | null => {
  // Home furnishing recommendation logic
  const availableRows = chart.rows.filter(row => row.available);
  if (availableRows.length === 0) return null;

  // Find the best matching size based on room dimensions
  const roomLength = measurements.roomLength || measurements.windowWidth || measurements.tableLength || 0;
  const roomWidth = measurements.roomWidth || measurements.windowHeight || measurements.tableWidth || 0;
  
  if (roomLength === 0 && roomWidth === 0) return null;

  let bestMatch = availableRows[0];
  let minDifference = Infinity;

  availableRows.forEach(row => {
    // Calculate difference based on product category
    let difference = 0;
    if (chart.category === 'rugs') {
      const rugLength = row.measurements[0] as number;
      const rugWidth = row.measurements[1] as number;
      difference = Math.abs(rugLength - roomLength) + Math.abs(rugWidth - roomWidth);
    } else if (chart.category === 'curtains') {
      const curtainWidth = row.measurements[0] as number;
      difference = Math.abs(curtainWidth - (roomLength + 12)); // Add 12 inches for coverage
    } else if (chart.category === 'bedding') {
      // Use recommended sizes for bed types
      if (measurements.roomLength && measurements.roomWidth) {
        const bedArea = roomLength * roomWidth;
        const recommendedArea = (row.measurements[0] as number) * (row.measurements[1] as number);
        difference = Math.abs(bedArea - recommendedArea);
      }
    }
    
    if (difference < minDifference) {
      minDifference = difference;
      bestMatch = row;
    }
  });

  const confidence = Math.max(0, 100 - (minDifference * 2));
  
  return {
    size: bestMatch.size,
    confidence,
    reasoning: [
      `Based on your room dimensions: ${roomLength}" x ${roomWidth}"`,
      `Recommended size: ${bestMatch.size}`,
      `Best fit for ${chart.category} in ${chart.room}`
    ],
    alternatives: availableRows
      .filter(row => row.size !== bestMatch.size)
      .slice(0, 2)
      .map(row => ({
        size: row.size,
        reason: `Alternative option for different coverage preference`
      }))
  };
};

// Main Component
const SizeGuide: React.FC<SizeGuideProps> = ({
  charts = defaultCharts,
  selectedCategory = 'bedding',
  selectedRoom = 'bedroom',
  selectedRegion = 'indian',
  onCategoryChange,
  onRoomChange,
  onRegionChange,
  showSizeCalculator = true,
  showMeasurementTips = true,
  showReviews = false,
  roomMeasurements,
  onMeasurementsChange,
  className,
  enableAnimations = true,
  showPrintButton = true,
  showShareButton = true,
  showBookmark = true,
  isBookmarked = false,
  onBookmarkToggle
}) => {
  const [activeTab, setActiveTab] = useState<'charts' | 'calculator' | 'tips' | 'reviews'>('charts');
  const [searchTerm, setSearchTerm] = useState('');
  const [localMeasurements, setLocalMeasurements] = useState<RoomMeasurements>(
    roomMeasurements || { unit: 'imperial' }
  );
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());

  // Filter charts based on selections
  const filteredCharts = useMemo(() => {
    return charts.filter(chart => {
      const categoryMatch = chart.category === selectedCategory;
      const roomMatch = chart.room === selectedRoom || chart.room === 'universal';
      const regionMatch = chart.region === selectedRegion;
      const searchMatch = searchTerm === '' || 
        chart.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return categoryMatch && roomMatch && regionMatch && searchMatch;
    });
  }, [charts, selectedCategory, selectedRoom, selectedRegion, searchTerm]);

  // Get size recommendation
  const sizeRecommendation = useMemo(() => {
    if ((!localMeasurements.roomLength && !localMeasurements.windowWidth && !localMeasurements.tableLength) || filteredCharts.length === 0) return null;
    return calculateSizeRecommendation(localMeasurements, filteredCharts[0]);
  }, [localMeasurements, filteredCharts]);

  // Handle measurement change
  const handleMeasurementChange = (field: keyof RoomMeasurements, value: string | number) => {
    const updated = { ...localMeasurements, [field]: value };
    setLocalMeasurements(updated);
    onMeasurementsChange?.(updated);
  };

  // Toggle tip expansion
  const toggleTip = (tipId: string) => {
    setExpandedTips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tipId)) {
        newSet.delete(tipId);
      } else {
        newSet.add(tipId);
      }
      return newSet;
    });
  };

  // Render size chart table
  const renderSizeChart = (chart: SizeChart) => (
    <motion.div
      key={chart.id}
      variants={enableAnimations ? tableVariants : undefined}
      initial="hidden"
      animate="visible"
    >
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{chart.name}</h3>
              <p className="text-sm text-gray-600">
                {chart.region.toUpperCase()} • {chart.room} • Updated {new Date(chart.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                {chart.unit}
              </Badge>
              <div className="flex items-center gap-1">
                <StarIconSolid className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-600">{chart.popularity}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {chart.headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chart.rows.map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    row.recommended && 'bg-blue-50 border-blue-200',
                    !row.available && 'opacity-50'
                  )}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-medium',
                        row.recommended ? 'text-blue-900' : 'text-gray-900'
                      )}>
                        {row.size}
                      </span>
                      {row.recommended && (
                        <Badge variant="default" size="sm" className="bg-blue-100 text-blue-800">
                          Recommended
                        </Badge>
                      )}
                    </div>
                  </td>
                  {row.measurements.map((measurement, measurementIndex) => (
                    <td key={measurementIndex} className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatMeasurement(measurement, chart.unit)}
                    </td>
                  ))}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {row.available ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircleIconSolid className="h-4 w-4" />
                          <span className="text-xs">Available</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <XMarkIcon className="h-4 w-4" />
                          <span className="text-xs">Out of Stock</span>
                        </div>
                      )}
                      {row.fit && (
                        <Badge variant="outline" size="sm" className={getFitColor(row.fit)}>
                          {row.fit}
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {chart.notes && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
              <InformationCircleIcon className="h-4 w-4" />
              Important Notes
            </h4>
            <ul className="space-y-1">
              {chart.notes.map((note, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </motion.div>
  );

  // Render size calculator
  const renderSizeCalculator = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Room & Space Calculator
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit System
              </label>
              <Select
                options={[
                  { value: 'imperial', label: 'Imperial (inches, feet)' },
                  { value: 'metric', label: 'Metric (cm, meters)' }
                ]}
                value={localMeasurements.unit}
                onValueChange={(value) => handleMeasurementChange('unit', value as 'metric' | 'imperial')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Length ({localMeasurements.unit === 'imperial' ? 'feet' : 'meters'})
                </label>
                <Input
                  type="number"
                  value={localMeasurements.roomLength || ''}
                  onChange={(e) => handleMeasurementChange('roomLength', parseFloat(e.target.value) || 0)}
                  placeholder={localMeasurements.unit === 'imperial' ? '12' : '3.6'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Width ({localMeasurements.unit === 'imperial' ? 'feet' : 'meters'})
                </label>
                <Input
                  type="number"
                  value={localMeasurements.roomWidth || ''}
                  onChange={(e) => handleMeasurementChange('roomWidth', parseFloat(e.target.value) || 0)}
                  placeholder={localMeasurements.unit === 'imperial' ? '10' : '3.0'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Window Width ({localMeasurements.unit === 'imperial' ? 'inches' : 'cm'})
                </label>
                <Input
                  type="number"
                  value={localMeasurements.windowWidth || ''}
                  onChange={(e) => handleMeasurementChange('windowWidth', parseFloat(e.target.value) || 0)}
                  placeholder={localMeasurements.unit === 'imperial' ? '48' : '122'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Window Height ({localMeasurements.unit === 'imperial' ? 'inches' : 'cm'})
                </label>
                <Input
                  type="number"
                  value={localMeasurements.windowHeight || ''}
                  onChange={(e) => handleMeasurementChange('windowHeight', parseFloat(e.target.value) || 0)}
                  placeholder={localMeasurements.unit === 'imperial' ? '60' : '152'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Table Length ({localMeasurements.unit === 'imperial' ? 'inches' : 'cm'})
                </label>
                <Input
                  type="number"
                  value={localMeasurements.tableLength || ''}
                  onChange={(e) => handleMeasurementChange('tableLength', parseFloat(e.target.value) || 0)}
                  placeholder={localMeasurements.unit === 'imperial' ? '72' : '183'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Table Width ({localMeasurements.unit === 'imperial' ? 'inches' : 'cm'})
                </label>
                <Input
                  type="number"
                  value={localMeasurements.tableWidth || ''}
                  onChange={(e) => handleMeasurementChange('tableWidth', parseFloat(e.target.value) || 0)}
                  placeholder={localMeasurements.unit === 'imperial' ? '36' : '91'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bed Size (if applicable)
              </label>
              <Select
                options={[
                  { value: '', label: 'Select bed size' },
                  { value: 'single', label: 'Single (90" x 60")' },
                  { value: 'double', label: 'Double (90" x 78")' },
                  { value: 'queen', label: 'Queen (100" x 90")' },
                  { value: 'king', label: 'King (108" x 90")' },
                  { value: 'super-king', label: 'Super King (108" x 108")' }
                ]}
                value={localMeasurements.bedSize || ''}
                onValueChange={(value) => handleMeasurementChange('bedSize', value)}
              />
            </div>
          </div>

          {/* Size Recommendation */}
          <div>
            {sizeRecommendation ? (
              <Card className="p-4 bg-green-50 border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircleIconSolid className="h-5 w-5" />
                  Size Recommendation
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-green-900">
                      {sizeRecommendation.size}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="text-sm text-green-700">
                        {sizeRecommendation.confidence}% confidence
                      </div>
                      <div className="w-16 bg-green-200 rounded-full h-2">
                        <div
                          className={cn(
                            "bg-green-600 h-2 rounded-full transition-all duration-300",
                            sizeRecommendation.confidence >= 90 ? "w-full" :
                            sizeRecommendation.confidence >= 80 ? "w-5/6" :
                            sizeRecommendation.confidence >= 70 ? "w-4/6" :
                            sizeRecommendation.confidence >= 60 ? "w-3/6" :
                            sizeRecommendation.confidence >= 50 ? "w-2/6" :
                            sizeRecommendation.confidence >= 40 ? "w-1/6" : "w-1/12"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {sizeRecommendation.reasoning.map((reason, index) => (
                      <p key={index} className="text-xs text-green-700">
                        • {reason}
                      </p>
                    ))}
                  </div>
                  {sizeRecommendation.alternatives.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-900 mb-2">Alternatives:</p>
                      <div className="space-y-1">
                        {sizeRecommendation.alternatives.map((alt, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="outline" size="sm">{alt.size}</Badge>
                            <span className="text-xs text-green-700">{alt.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-4 bg-gray-50 border-gray-200">
                <div className="text-center text-gray-600">
                  <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Enter your room or space measurements to get size recommendations</p>
                  <p className="text-xs text-gray-500 mt-1">Perfect for curtains, rugs, bedding, and table linens</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  // Render measurement tips
  const renderMeasurementTips = () => (
    <div className="space-y-4">
      {measurementTips.map((tip) => {
        const isExpanded = expandedTips.has(tip.id);
        return (
          <Card key={tip.id} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleTip(tip.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    tip.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                    tip.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  )}>
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{tip.title}</h3>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm" className={cn(
                    tip.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                    tip.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  )}>
                    {tip.difficulty}
                  </Badge>
                  <ChevronRightIcon 
                    className={cn(
                      'h-5 w-5 text-gray-400 transition-transform',
                      isExpanded && 'rotate-90'
                    )} 
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Steps:</h4>
                        <ol className="space-y-2">
                          {tip.steps.map((step, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <span className="text-sm text-gray-700">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Tools Needed:</h4>
                        <div className="space-y-2">
                          {tip.tools.map((tool, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircleIconSolid className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-700">{tool}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vardhman Mills Size Guide</h1>
          <p className="text-gray-600 mt-1">Find the perfect fit for all your home furnishing needs - from bed linens to curtains, rugs to table accessories</p>
        </div>
        
        <div className="flex items-center gap-2">
          {showPrintButton && (
            <Button variant="outline" size="sm">
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </Button>
          )}
          {showShareButton && (
            <Button variant="outline" size="sm">
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          {showBookmark && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBookmarkToggle}
            >
              {isBookmarked ? (
                <BookmarkIconSolid className="h-4 w-4 mr-2 text-blue-600" />
              ) : (
                <BookmarkIcon className="h-4 w-4 mr-2" />
              )}
              {isBookmarked ? 'Saved' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <Select
              options={[
                { value: 'bedding', label: 'Bedding & Linens' },
                { value: 'curtains', label: 'Curtains & Drapes' },
                { value: 'rugs', label: 'Rugs & Carpets' },
                { value: 'furniture', label: 'Furniture Covers' },
                { value: 'upholstery', label: 'Upholstery' },
                { value: 'tableLinen', label: 'Table Linens' },
                { value: 'towels', label: 'Bath Towels' },
                { value: 'quilts', label: 'Quilts & Comforters' }
              ]}
              value={selectedCategory}
              onValueChange={(value) => onCategoryChange?.(value as string)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
            <Select
              options={[
                { value: 'universal', label: 'All Rooms' },
                { value: 'bedroom', label: 'Bedroom' },
                { value: 'livingRoom', label: 'Living Room' },
                { value: 'diningRoom', label: 'Dining Room' },
                { value: 'kitchen', label: 'Kitchen' },
                { value: 'bathroom', label: 'Bathroom' },
                { value: 'outdoor', label: 'Outdoor' }
              ]}
              value={selectedRoom}
              onValueChange={(value) => onRoomChange?.(value as string)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
            <Select
              options={[
                { value: 'indian', label: 'Indian Sizes' },
                { value: 'us', label: 'US' },
                { value: 'uk', label: 'UK' },
                { value: 'eu', label: 'EU' },
                { value: 'asia', label: 'Asia' },
                { value: 'international', label: 'International' }
              ]}
              value={selectedRegion}
              onValueChange={(value) => onRegionChange?.(value as string)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search charts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'charts', label: 'Size Charts', icon: InformationCircleIcon },
            ...(showSizeCalculator ? [{ id: 'calculator' as const, label: 'Room Calculator', icon: UserIcon }] : []),
            ...(showMeasurementTips ? [{ id: 'tips' as const, label: 'Measuring Guide', icon: QuestionMarkCircleIcon }] : []),
            ...(showReviews ? [{ id: 'reviews' as const, label: 'Customer Reviews', icon: StarIcon }] : [])
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'charts' | 'calculator' | 'tips' | 'reviews')}
                className={cn(
                  'flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <motion.div
        variants={enableAnimations ? containerVariants : undefined}
        initial="hidden"
        animate="visible"
      >
        {activeTab === 'charts' && (
          <div className="space-y-6">
            {filteredCharts.length > 0 ? (
              filteredCharts.map(chart => renderSizeChart(chart))
            ) : (
              <Card className="p-8 text-center">
                <InformationCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No size charts found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search term to find the size charts you&apos;re looking for.
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'calculator' && renderSizeCalculator()}
        {activeTab === 'tips' && renderMeasurementTips()}
        {activeTab === 'reviews' && (
          <Card className="p-8 text-center">
            <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Reviews</h3>
            <p className="text-gray-600">
              Read what our customers say about the fit and quality of Vardhman Mills home furnishing products.
            </p>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default SizeGuide;
