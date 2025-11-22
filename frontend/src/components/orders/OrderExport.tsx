'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order } from '@/types/cart.types';
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface OrderExportProps {
  orders: Order[];
  selectedOrders?: Order[];
  onExportComplete?: (format: string, count: number) => void;
  className?: string;
}

type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

interface ExportField {
  key: string;
  label: string;
  selected: boolean;
}

// Helper function to extract amount from Price object
const getPriceAmount = (price: { amount: number; formatted: string } | number): number => {
  return typeof price === 'number' ? price : price.amount;
};

export const OrderExport: React.FC<OrderExportProps> = ({
  orders,
  selectedOrders,
  onExportComplete,
  className,
}) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showFieldSelector, setShowFieldSelector] = useState(false);

  // Available export fields
  const [exportFields, setExportFields] = useState<ExportField[]>([
    { key: 'orderNumber', label: 'Order Number', selected: true },
    { key: 'createdAt', label: 'Order Date', selected: true },
    { key: 'status', label: 'Order Status', selected: true },
    { key: 'paymentStatus', label: 'Payment Status', selected: true },
    { key: 'fulfillmentStatus', label: 'Fulfillment Status', selected: true },
    { key: 'customerName', label: 'Customer Name', selected: true },
    { key: 'customerEmail', label: 'Customer Email', selected: true },
    { key: 'total', label: 'Total Amount', selected: true },
    { key: 'subtotal', label: 'Subtotal', selected: false },
    { key: 'taxAmount', label: 'Tax Amount', selected: false },
    { key: 'shippingAmount', label: 'Shipping Amount', selected: false },
    { key: 'discountAmount', label: 'Discount Amount', selected: false },
    { key: 'itemCount', label: 'Item Count', selected: false },
    { key: 'shippingMethod', label: 'Shipping Method', selected: false },
    { key: 'shippingAddress', label: 'Shipping Address', selected: false },
    { key: 'paymentMethod', label: 'Payment Method', selected: false },
    { key: 'trackingNumber', label: 'Tracking Number', selected: false },
  ]);

  const ordersToExport = selectedOrders && selectedOrders.length > 0 ? selectedOrders : orders;

  // Toggle field selection
  const toggleField = (key: string) => {
    setExportFields(prev =>
      prev.map(field =>
        field.key === key ? { ...field, selected: !field.selected } : field
      )
    );
  };

  // Select/Deselect all fields
  const toggleAllFields = (selected: boolean) => {
    setExportFields(prev => prev.map(field => ({ ...field, selected })));
  };

  // Extract field value from order
  const extractFieldValue = (order: Order, key: string): string => {
    switch (key) {
      case 'orderNumber':
        return order.orderNumber || '';
      case 'createdAt':
        return new Date(order.createdAt).toLocaleString();
      case 'status':
        return order.status || '';
      case 'paymentStatus':
        return order.paymentStatus || '';
      case 'fulfillmentStatus':
        return order.fulfillmentStatus || '';
      case 'customerName':
        return order.user ? `${order.user.firstName} ${order.user.lastName}` : 
               `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
      case 'customerEmail':
        return order.user?.email || order.shippingAddress.email || '';
      case 'total':
        return getPriceAmount(order.total).toFixed(2);
      case 'subtotal':
        return getPriceAmount(order.subtotal).toFixed(2);
      case 'taxAmount':
        return getPriceAmount(order.taxAmount).toFixed(2);
      case 'shippingAmount':
        return getPriceAmount(order.shippingAmount).toFixed(2);
      case 'discountAmount':
        return getPriceAmount(order.discountAmount).toFixed(2);
      case 'itemCount':
        return order.items.length.toString();
      case 'shippingMethod':
        return order.shippingMethod?.name || '';
      case 'shippingAddress':
        return `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`;
      case 'paymentMethod':
        return order.paymentMethod?.type || '';
      case 'trackingNumber':
        return order.trackingNumber || '';
      default:
        return '';
    }
  };

  // Generate CSV
  const generateCSV = useCallback(() => {
    const selectedFields = exportFields.filter(f => f.selected);
    const headers = selectedFields.map(f => f.label).join(',');
    
    const rows = ordersToExport.map(order =>
      selectedFields.map(field => {
        const value = extractFieldValue(order, field.key);
        return `"${value.replace(/"/g, '""')}"`;
      }).join(',')
    );

    return `${headers}\n${rows.join('\n')}`;
  }, [ordersToExport, exportFields]);

  // Generate JSON
  const generateJSON = useCallback(() => {
    const selectedFields = exportFields.filter(f => f.selected);
    
    const data = ordersToExport.map(order => {
      const obj: Record<string, string> = {};
      selectedFields.forEach(field => {
        obj[field.key] = extractFieldValue(order, field.key);
      });
      return obj;
    });

    return JSON.stringify(data, null, 2);
  }, [ordersToExport, exportFields]);

  // Handle export
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      let content = '';
      let mimeType = '';
      let fileExtension = '';

      switch (exportFormat) {
        case 'csv':
          content = generateCSV();
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'json':
          content = generateJSON();
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
        case 'excel':
          // For Excel, we'll use CSV format with .xls extension
          content = generateCSV();
          mimeType = 'application/vnd.ms-excel';
          fileExtension = 'xls';
          break;
        case 'pdf':
          // PDF generation would require a library like jsPDF
          // For now, we'll use CSV as fallback
          content = generateCSV();
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
      }

      // Create blob and download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-export-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      clearInterval(progressInterval);
      setExportProgress(100);
      setExportSuccess(true);

      setTimeout(() => {
        setIsExporting(false);
        setExportSuccess(false);
        setExportProgress(0);
      }, 2000);

      if (onExportComplete) {
        onExportComplete(exportFormat, ordersToExport.length);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [exportFormat, ordersToExport, generateCSV, generateJSON, onExportComplete]);

  const formatIcons = {
    csv: TableCellsIcon,
    excel: TableCellsIcon,
    pdf: DocumentTextIcon,
    json: DocumentArrowDownIcon,
  };

  const FormatIcon = formatIcons[exportFormat];

  const selectedFieldsCount = exportFields.filter(f => f.selected).length;

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Export Orders</h3>
            <p className="text-sm text-gray-600">
              Export {ordersToExport.length} order{ordersToExport.length !== 1 ? 's' : ''} to your preferred format
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <ArrowDownTrayIcon className="h-3 w-3" />
            {ordersToExport.length}
          </Badge>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Export Format</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['csv', 'excel', 'pdf', 'json'] as ExportFormat[]).map((format) => {
              const Icon = formatIcons[format];
              return (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                    exportFormat === format
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  )}
                >
                  <Icon className={cn('h-6 w-6', exportFormat === format ? 'text-blue-600' : 'text-gray-600')} />
                  <span className={cn('text-sm font-medium', exportFormat === format ? 'text-blue-900' : 'text-gray-700')}>
                    {format.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Field Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Export Fields ({selectedFieldsCount})
            </label>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFieldSelector(!showFieldSelector)}
            >
              {showFieldSelector ? 'Hide' : 'Show'} Fields
            </Button>
          </div>

          <AnimatePresence>
            {showFieldSelector && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                  {/* Select All */}
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedFieldsCount === exportFields.length}
                        onChange={() => toggleAllFields(selectedFieldsCount !== exportFields.length)}
                      />
                      <span className="text-sm font-medium text-gray-700">Select All</span>
                    </div>
                    {selectedFieldsCount > 0 && (
                      <button
                        onClick={() => toggleAllFields(false)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Field List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {exportFields.map((field) => (
                      <div
                        key={field.key}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors"
                      >
                        <Checkbox
                          checked={field.selected}
                          onChange={() => toggleField(field.key)}
                        />
                        <span className="text-sm text-gray-700">{field.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t">
          <Button
            variant="default"
            size="lg"
            onClick={handleExport}
            disabled={isExporting || selectedFieldsCount === 0}
            leftIcon={
              isExporting ? (
                <ClockIcon className="h-5 w-5 animate-spin" />
              ) : exportSuccess ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <FormatIcon className="h-5 w-5" />
              )
            }
            className="w-full"
          >
            {isExporting
              ? `Exporting... ${exportProgress}%`
              : exportSuccess
              ? 'Export Complete!'
              : `Export as ${exportFormat.toUpperCase()}`}
          </Button>

          {/* Progress Bar */}
          <AnimatePresence>
            {isExporting && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3"
              >
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${exportProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs text-blue-800">
            Your export will download automatically. The file will contain all selected fields for the {ordersToExport.length} order{ordersToExport.length !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default OrderExport;
