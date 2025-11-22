import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IOrder } from '../models/Order.model.js';
import { IUser } from '../models/User.model.js';

interface InvoiceData {
  order: IOrder;
  user: IUser;
}

class InvoiceService {
  private invoicesDir: string;

  constructor() {
    this.invoicesDir = path.join(process.cwd(), 'src', 'uploads', 'invoices');
    this.ensureInvoicesDir();
  }

  /**
   * Ensure invoices directory exists
   */
  private ensureInvoicesDir(): void {
    if (!fs.existsSync(this.invoicesDir)) {
      fs.mkdirSync(this.invoicesDir, { recursive: true });
    }
  }

  /**
   * Generate invoice PDF
   */
  async generateInvoice(data: InvoiceData): Promise<string> {
    const { order, user } = data;
    const fileName = `invoice-${order.orderNumber}-${Date.now()}.pdf`;
    const filePath = path.join(this.invoicesDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        this.generateHeader(doc);
        
        // Customer & Order Info
        this.generateCustomerInfo(doc, order, user);
        
        // Invoice Table
        this.generateInvoiceTable(doc, order);
        
        // Summary
        this.generateSummary(doc, order);
        
        // Footer
        this.generateFooter(doc);

        doc.end();

        stream.on('finish', () => {
          resolve(filePath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate PDF header
   */
  private generateHeader(doc: typeof PDFDocument.prototype): void {
    doc
      .fillColor('#2563eb')
      .fontSize(28)
      .text('VARDHMAN MILLS', 50, 50)
      .fillColor('#000000')
      .fontSize(10)
      .text('Premium Textile Manufacturer', 50, 85)
      .text('123 Industrial Area, Textile Hub', 50, 100)
      .text('Mumbai, Maharashtra - 400001', 50, 115)
      .text('Email: info@vardhmanmills.com', 50, 130)
      .text('Phone: +91 22 1234 5678', 50, 145)
      .text('GST: 27AABCU9603R1ZM', 50, 160);

    // Invoice title
    doc
      .fillColor('#2563eb')
      .fontSize(20)
      .text('TAX INVOICE', 400, 50, { align: 'right' });

    doc.moveTo(50, 185).lineTo(560, 185).stroke();
  }

  /**
   * Generate customer information section
   */
  private generateCustomerInfo(doc: typeof PDFDocument.prototype, order: IOrder, user: IUser): void {
    const startY = 205;

    // Billing Information
    doc
      .fillColor('#000000')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Bill To:', 50, startY);

    doc
      .font('Helvetica')
      .fontSize(10)
      .text(`${user.firstName} ${user.lastName}`, 50, startY + 20)
      .text(`${order.shippingAddress.addressLine1}`, 50, startY + 35)
      .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 50, startY + 50)
      .text(`${order.shippingAddress.country}`, 50, startY + 65)
      .text(`Phone: ${order.shippingAddress.mobile || user.mobile || 'N/A'}`, 50, startY + 80)
      .text(`Email: ${user.email}`, 50, startY + 95);

    // Invoice Details
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Invoice Number:', 350, startY, { continued: true })
      .font('Helvetica')
      .text(` ${order.orderNumber}`, { align: 'right' });

    doc
      .font('Helvetica-Bold')
      .text('Invoice Date:', 350, startY + 20, { continued: true })
      .font('Helvetica')
      .text(` ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, { align: 'right' });

    doc
      .font('Helvetica-Bold')
      .text('Order Status:', 350, startY + 40, { continued: true })
      .font('Helvetica')
      .text(` ${order.status.toUpperCase()}`, { align: 'right' });

    doc
      .font('Helvetica-Bold')
      .text('Payment Method:', 350, startY + 60, { continued: true })
      .font('Helvetica')
      .text(` ${(order as any).paymentMethod?.toUpperCase() || 'N/A'}`, { align: 'right' });

    doc
      .font('Helvetica-Bold')
      .text('Payment Status:', 350, startY + 80, { continued: true })
      .font('Helvetica')
      .text(` ${((order as any).payment?.status || 'PENDING').toUpperCase()}`, { align: 'right' });

    doc.moveTo(50, startY + 120).lineTo(560, startY + 120).stroke();
  }

  /**
   * Generate invoice table
   */
  private generateInvoiceTable(doc: typeof PDFDocument.prototype, order: IOrder): void {
    const startY = 340;
    const tableTop = startY + 10;

    // Table header
    doc
      .fillColor('#f3f4f6')
      .rect(50, startY, 510, 25)
      .fill();

    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Item', 60, tableTop)
      .text('Quantity', 300, tableTop)
      .text('Price', 380, tableTop)
      .text('Total', 480, tableTop);

    // Table rows
    let currentY = tableTop + 30;
    doc.font('Helvetica').fontSize(9);

    order.items.forEach((item: any) => {
      const productName = item.product?.name || 'Product';
      const variant = item.variant ? ` (${item.variant.size || ''} ${item.variant.color || ''})` : '';
      
      doc
        .text(`${productName}${variant}`, 60, currentY, { width: 220 })
        .text(item.quantity.toString(), 300, currentY)
        .text(`₹${item.price.toFixed(2)}`, 380, currentY)
        .text(`₹${(item.price * item.quantity).toFixed(2)}`, 480, currentY);

      currentY += 25;
    });

    doc.moveTo(50, currentY + 10).lineTo(560, currentY + 10).stroke();
  }

  /**
   * Generate summary section
   */
  private generateSummary(doc: typeof PDFDocument.prototype, order: IOrder): void {
    const summaryY = 520;

    doc
      .font('Helvetica')
      .fontSize(10)
      .text('Subtotal:', 380, summaryY)
      .text(`₹${order.subtotal.toFixed(2)}`, 480, summaryY);

    if (order.discount && order.discount > 0) {
      doc
        .text('Discount:', 380, summaryY + 20)
        .text(`-₹${order.discount.toFixed(2)}`, 480, summaryY + 20);
    }

    doc
      .text('Shipping:', 380, summaryY + 40)
      .text(`₹${order.shippingCost.toFixed(2)}`, 480, summaryY + 40);

    doc
      .text('Tax (GST 18%):', 380, summaryY + 60)
      .text(`₹${order.tax.toFixed(2)}`, 480, summaryY + 60);

    doc.moveTo(380, summaryY + 85).lineTo(560, summaryY + 85).stroke();

    // Calculate total
    const total = order.subtotal - (order.discount || 0) + order.shippingCost + order.tax;

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Total Amount:', 380, summaryY + 95)
      .text(`₹${total.toFixed(2)}`, 480, summaryY + 95);

    doc.moveTo(380, summaryY + 120).lineTo(560, summaryY + 120).stroke();
  }

  /**
   * Generate PDF footer
   */
  private generateFooter(doc: typeof PDFDocument.prototype): void {
    doc
      .fontSize(8)
      .fillColor('#666666')
      .text(
        'Thank you for your business!',
        50,
        700,
        { align: 'center', width: 510 }
      )
      .text(
        'For any queries, contact us at support@vardhmanmills.com or call +91 22 1234 5678',
        50,
        715,
        { align: 'center', width: 510 }
      )
      .text(
        'Terms & Conditions apply. Please visit www.vardhmanmills.com/terms',
        50,
        730,
        { align: 'center', width: 510 }
      );
  }

  /**
   * Email invoice to customer
   */
  async emailInvoice(data: InvoiceData, invoicePath: string): Promise<void> {
    const { order, user } = data;
    const total = order.subtotal - (order.discount || 0) + order.shippingCost + order.tax;

    // Mock email sending (integrate with actual email service in production)
    console.log(`Sending invoice email to ${user.email}`);
    console.log(`Order: ${order.orderNumber}`);
    console.log(`Total: ₹${total.toFixed(2)}`);
    console.log(`Attachment: ${invoicePath}`);
    
    // In production, integrate with email service:
    // await emailService.sendEmail({
    //   to: user.email,
    //   subject: `Invoice for Order ${order.orderNumber}`,
    //   html: emailTemplate,
    //   attachments: [{ filename: `invoice-${order.orderNumber}.pdf`, path: invoicePath }]
    // });
  }

  /**
   * Get invoice file path
   */
  getInvoicePath(fileName: string): string {
    return path.join(this.invoicesDir, fileName);
  }

  /**
   * Delete invoice file
   */
  deleteInvoice(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Generate invoice number
   */
  generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV${timestamp}${random}`;
  }
}

export default new InvoiceService();
