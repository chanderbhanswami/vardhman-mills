'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  PrinterIcon,
  ShareIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Order, OrderInvoice } from '@/types/order.types';
import type { Price } from '@/types/common.types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface InvoiceDownloadProps {
  order: Order;
  invoice?: OrderInvoice;
  className?: string;
  onDownloadSuccess?: () => void;
  onDownloadError?: (error: Error) => void;
}

export const InvoiceDownload: React.FC<InvoiceDownloadProps> = ({
  order,
  invoice,
  className,
  onDownloadSuccess,
  onDownloadError,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'html'>('pdf');
  const [showPreview, setShowPreview] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Helper function to convert Price to number
  const getPriceAmount = (price: Price | number): number => {
    return typeof price === 'number' ? price : price.amount;
  };

  // Generate Invoice HTML
  const generateInvoiceHTML = useCallback(() => {
    const invoiceNumber = invoice?.invoiceNumber || `INV-${order.orderNumber}`;
    const issueDate = invoice?.issueDate || order.createdAt;
    const customerName = order.user?.firstName && order.user?.lastName
      ? `${order.user.firstName} ${order.user.lastName}`
      : `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
    const customerEmail = order.user?.email || order.shippingAddress.email || '';
    const customerPhone = order.user?.phone || order.shippingAddress.phone || '';
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .invoice { max-width: 800px; margin: 40px auto; padding: 40px; background: white; }
          .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
          .company-info { flex: 1; }
          .company-name { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
          .company-details { font-size: 14px; color: #666; line-height: 1.8; }
          .invoice-info { text-align: right; }
          .invoice-number { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 8px; }
          .invoice-date { font-size: 14px; color: #666; }
          .addresses { display: flex; justify-content: space-between; margin: 30px 0; }
          .address-block { flex: 1; }
          .address-title { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px; text-transform: uppercase; }
          .address-content { font-size: 14px; color: #666; line-height: 1.8; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          thead { background: #f3f4f6; }
          th { padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #333; border-bottom: 2px solid #e5e7eb; }
          td { padding: 12px; font-size: 14px; color: #666; border-bottom: 1px solid #f3f4f6; }
          .text-right { text-align: right; }
          .totals { margin-top: 30px; }
          .totals-row { display: flex; justify-content: flex-end; margin-bottom: 8px; }
          .totals-label { width: 150px; text-align: right; padding-right: 20px; font-size: 14px; color: #666; }
          .totals-value { width: 120px; text-align: right; font-size: 14px; color: #333; }
          .grand-total { font-weight: bold; font-size: 18px; padding-top: 12px; border-top: 2px solid #e5e7eb; margin-top: 12px; }
          .grand-total .totals-label, .grand-total .totals-value { color: #1e40af; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #999; }
          .notes { margin-top: 30px; padding: 15px; background: #f9fafb; border-left: 4px solid #2563eb; }
          .notes-title { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px; }
          .notes-content { font-size: 13px; color: #666; line-height: 1.6; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
          .status-paid { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          @media print { body { margin: 0; } .invoice { margin: 0; box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="company-info">
              <div class="company-name">Vardhman Mills</div>
              <div class="company-details">
                123 Fashion Street, Textile District<br>
                Mumbai, Maharashtra 400001<br>
                India<br>
                Phone: +91 22 1234 5678<br>
                Email: info@vardhmanmills.com<br>
                GST: 27AABCU9603R1ZX
              </div>
            </div>
            <div class="invoice-info">
              <div class="invoice-number">INVOICE</div>
              <div class="invoice-date">#${invoiceNumber}</div>
              <div class="invoice-date" style="margin-top: 10px;">
                Date: ${formatDate(issueDate, 'medium')}
              </div>
              <div style="margin-top: 10px;">
                <span class="status-badge ${invoice?.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}">
                  ${invoice?.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          <div class="addresses">
            <div class="address-block">
              <div class="address-title">Bill To:</div>
              <div class="address-content">
                ${customerName}<br>
                ${order.billingAddress?.addressLine1 || order.shippingAddress.addressLine1}<br>
                ${order.billingAddress?.city || order.shippingAddress.city}, ${order.billingAddress?.state || order.shippingAddress.state} ${order.billingAddress?.postalCode || order.shippingAddress.postalCode}<br>
                ${order.billingAddress?.country || order.shippingAddress.country}<br>
                ${customerEmail}<br>
                ${customerPhone}
              </div>
            </div>
            <div class="address-block">
              <div class="address-title">Ship To:</div>
              <div class="address-content">
                ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                ${order.shippingAddress.addressLine1}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}<br>
                ${order.shippingAddress.phone || ''}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50px;">#</th>
                <th>Item Description</th>
                <th style="width: 80px;" class="text-right">Qty</th>
                <th style="width: 120px;" class="text-right">Unit Price</th>
                <th style="width: 120px;" class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>
                    <strong>${item.product?.name || 'Product'}</strong><br>
                    <span style="font-size: 12px; color: #999;">SKU: ${item.product?.sku || 'N/A'}</span>
                    ${item.variant ? `<br><span style="font-size: 12px; color: #999;">${item.variant.name || ''}</span>` : ''}
                  </td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${formatCurrency(getPriceAmount(item.unitPrice))}</td>
                  <td class="text-right">${formatCurrency(getPriceAmount(item.totalPrice))}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <div class="totals-label">Subtotal:</div>
              <div class="totals-value">${formatCurrency(getPriceAmount(order.subtotal))}</div>
            </div>
            ${
              getPriceAmount(order.discountAmount) > 0
                ? `
              <div class="totals-row">
                <div class="totals-label">Discount:</div>
                <div class="totals-value">-${formatCurrency(getPriceAmount(order.discountAmount))}</div>
              </div>
            `
                : ''
            }
            <div class="totals-row">
              <div class="totals-label">Shipping:</div>
              <div class="totals-value">${getPriceAmount(order.shippingAmount) > 0 ? formatCurrency(getPriceAmount(order.shippingAmount)) : 'FREE'}</div>
            </div>
            <div class="totals-row">
              <div class="totals-label">Tax (GST):</div>
              <div class="totals-value">${formatCurrency(getPriceAmount(order.taxAmount))}</div>
            </div>
            <div class="totals-row grand-total">
              <div class="totals-label">Grand Total:</div>
              <div class="totals-value">${formatCurrency(getPriceAmount(order.total))}</div>
            </div>
          </div>

          ${
            invoice?.notes || order.customerNotes
              ? `
            <div class="notes">
              <div class="notes-title">Notes:</div>
              <div class="notes-content">${invoice?.notes || order.customerNotes || ''}</div>
            </div>
          `
              : ''
          }

          <div class="footer">
            <p>Thank you for your business!</p>
            <p style="margin-top: 10px;">
              For any queries, please contact us at support@vardhmanmills.com or call +91 22 1234 5678
            </p>
            <p style="margin-top: 20px; font-size: 11px;">
              This is a computer-generated invoice and does not require a signature.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }, [order, invoice]);

  // Download as PDF
  const downloadAsPDF = useCallback(async () => {
    setIsDownloading(true);
    try {
      const invoiceHTML = generateInvoiceHTML();
      
      // Create a temporary container
      const container = document.createElement('div');
      container.innerHTML = invoiceHTML;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '800px';
      document.body.appendChild(container);

      // Generate canvas from HTML
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileName = `invoice-${invoice?.invoiceNumber || order.orderNumber}.pdf`;
      pdf.save(fileName);

      toast.success('Invoice downloaded successfully!');
      onDownloadSuccess?.();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice. Please try again.');
      onDownloadError?.(error as Error);
    } finally {
      setIsDownloading(false);
    }
  }, [generateInvoiceHTML, invoice, order, onDownloadSuccess, onDownloadError]);

  // Download as HTML
  const downloadAsHTML = useCallback(() => {
    setIsDownloading(true);
    try {
      const invoiceHTML = generateInvoiceHTML();
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice?.invoiceNumber || order.orderNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully!');
      onDownloadSuccess?.();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice. Please try again.');
      onDownloadError?.(error as Error);
    } finally {
      setIsDownloading(false);
    }
  }, [generateInvoiceHTML, invoice, order, onDownloadSuccess, onDownloadError]);

  // Print Invoice
  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    try {
      const invoiceHTML = generateInvoiceHTML();
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load before printing
        setTimeout(() => {
          printWindow.print();
          setIsPrinting(false);
        }, 500);
      } else {
        throw new Error('Failed to open print window');
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast.error('Failed to print invoice. Please check your browser settings.');
      setIsPrinting(false);
    }
  }, [generateInvoiceHTML]);

  // Share Invoice
  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Invoice ${invoice?.invoiceNumber || order.orderNumber}`,
          text: `Invoice for Order #${order.orderNumber}`,
          url: window.location.href,
        });
        toast.success('Invoice shared successfully!');
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing invoice:', error);
        toast.error('Failed to share invoice.');
      }
    } finally {
      setIsSharing(false);
    }
  }, [invoice, order]);

  // Send Invoice via Email
  const handleSendEmail = useCallback(async () => {
    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/orders/invoice/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          email: order.user?.email || order.shippingAddress.email,
          invoiceNumber: invoice?.invoiceNumber || `INV-${order.orderNumber}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      toast.success('Invoice sent to your email!');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send invoice via email.');
    } finally {
      setIsSendingEmail(false);
    }
  }, [order, invoice]);

  const handleDownload = () => {
    if (downloadFormat === 'pdf') {
      downloadAsPDF();
    } else {
      downloadAsHTML();
    }
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Invoice</h3>
            <p className="text-sm text-gray-500">
              {invoice?.invoiceNumber || `INV-${order.orderNumber}`}
            </p>
          </div>
        </div>
        
        {invoice && (
          <Badge
            variant={invoice.paymentStatus === 'paid' ? 'success' : 'warning'}
            size="sm"
          >
            {invoice.paymentStatus === 'paid' ? (
              <>
                <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                Paid
              </>
            ) : (
              <>
                <ClockIcon className="h-3.5 w-3.5 mr-1" />
                Pending
              </>
            )}
          </Badge>
        )}
      </div>

      {/* Invoice Details */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Issue Date</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(invoice?.issueDate || order.createdAt, 'medium')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(getPriceAmount(invoice?.total || order.total))}
            </p>
          </div>
        </div>
      </div>

      {/* Download Format Selection */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Download Format
        </label>
        <div className="flex gap-2">
          <Button
            variant={downloadFormat === 'pdf' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDownloadFormat('pdf')}
            className="flex-1"
          >
            PDF
          </Button>
          <Button
            variant={downloadFormat === 'html' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDownloadFormat('html')}
            className="flex-1"
          >
            HTML
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          fullWidth
          variant="default"
          onClick={handleDownload}
          disabled={isDownloading}
          loading={isDownloading}
          leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
        >
          {isDownloading ? 'Downloading...' : `Download as ${downloadFormat.toUpperCase()}`}
        </Button>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={isPrinting}
            leftIcon={<PrinterIcon className="h-4 w-4" />}
          >
            Print
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={isSharing}
            leftIcon={<ShareIcon className="h-4 w-4" />}
          >
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            leftIcon={<EnvelopeIcon className="h-4 w-4" />}
          >
            Email
          </Button>
        </div>
      </div>

      {/* Preview Toggle */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="mt-4 w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        {showPreview ? 'Hide Preview' : 'Show Preview'}
      </button>

      {/* Invoice Preview */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border-t border-gray-200 pt-4"
          >
            <div
              ref={invoiceRef}
              className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg"
              dangerouslySetInnerHTML={{ __html: generateInvoiceHTML() }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Count */}
      {invoice && invoice.downloadCount > 0 && (
        <p className="mt-4 text-xs text-gray-500 text-center">
          Downloaded {invoice.downloadCount} {invoice.downloadCount === 1 ? 'time' : 'times'}
        </p>
      )}
    </div>
  );
};

export default InvoiceDownload;
