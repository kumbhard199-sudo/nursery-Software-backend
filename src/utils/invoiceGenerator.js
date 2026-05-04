const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceGenerator {
  /**
   * Generate PDF invoice for a sale
   */
  async generateInvoice(saleData, invoicePath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(invoicePath);

        doc.pipe(stream);

        // Header
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('INVOICE', { align: 'center' })
          .moveDown(0.5);

        // Nursery Info (placeholder)
        doc.fontSize(12).font('Helvetica').text('Nursery Management System', { align: 'center' });
        doc.text('Contact: +91 XXXXXXXXXX', { align: 'center' });
        doc.text(`Date: ${new Date(saleData.saleDate).toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(1);

        // Invoice Details
        doc.fontSize(14).font('Helvetica-Bold').text('Invoice Details:', { underline: true });
        doc.fontSize(11).font('Helvetica').moveDown(0.5);
        doc.text(`Invoice #: INV-${saleData.id}-${Date.now()}`);
        doc.text(`Sale Date: ${new Date(saleData.saleDate).toLocaleDateString()}`);
        doc.moveDown(1);

        // Customer Information
        doc.fontSize(14).font('Helvetica-Bold').text('Customer Information:', { underline: true });
        doc.fontSize(11).font('Helvetica').moveDown(0.5);
        doc.text(`Name: ${saleData.customer.name}`);
        doc.text(`Mobile: ${saleData.customer.mobileNumber}`);
        if (saleData.customer.address) {
          doc.text(`Address: ${saleData.customer.address}`);
        }
        doc.moveDown(1);

        // Batch Information
        doc.fontSize(14).font('Helvetica-Bold').text('Product Details:', { underline: true });
        doc.fontSize(11).font('Helvetica').moveDown(0.5);
        doc.text(`Batch Name: ${saleData.batch.batchName}`);
        doc.text(`Crop Type: ${saleData.batch.cropType}`);
        doc.moveDown(1);

        // Itemized Bill
        doc.fontSize(14).font('Helvetica-Bold').text('Bill Breakdown:', { underline: true });
        doc.moveDown(0.5);

        const lineHeight = 20;
        let yPos = doc.y;

        // Table headers
        doc.fontSize(11).font('Helvetica-Bold').text('Description', 50, yPos);
        doc.text('Quantity', 250, yPos);
        doc.text('Rate', 350, yPos);
        doc.text('Amount', 450, yPos, { align: 'right' });

        yPos += lineHeight;
        doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
        yPos += 10;

        // Crop items
        doc.fontSize(11).font('Helvetica').text('Crops', 50, yPos);
        doc.text(saleData.cropQuantity.toString(), 250, yPos);
        doc.text(`Rs.${saleData.pricePerCrop.toFixed(2)}`, 350, yPos);
        doc.text(
          `Rs.${(saleData.cropQuantity * saleData.pricePerCrop).toFixed(2)}`,
          450,
          yPos,
          { align: 'right' }
        );

        yPos += lineHeight * 1.5;

        // Additional costs
        if (saleData.travelingCost > 0) {
          doc.text('Traveling Cost', 50, yPos);
          doc.text(`Rs.${saleData.travelingCost.toFixed(2)}`, 450, yPos, { align: 'right' });
          yPos += lineHeight;
        }

        if (saleData.plantationCost > 0) {
          doc.text('Plantation Cost', 50, yPos);
          doc.text(`Rs.${saleData.plantationCost.toFixed(2)}`, 450, yPos, { align: 'right' });
          yPos += lineHeight;
        }

        yPos += 10;
        doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
        yPos += 10;

        // Total
        doc.fontSize(13).font('Helvetica-Bold').text('TOTAL AMOUNT', 350, yPos);
        doc.text(`Rs.${saleData.totalAmount.toFixed(2)}`, 450, yPos, { align: 'right' });

        // Footer
        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica').text('Thank you for your business!', { align: 'center' });
        doc.text('Terms & Conditions:', { align: 'left' }).fontSize(9);
        doc.text('• Payment due within 30 days', { align: 'left', indent: 20 });
        doc.text('• Please contact us for any queries regarding this invoice', {
          align: 'left',
          indent: 20,
        });

        doc.end();

        stream.on('finish', () => {
          resolve({
            invoicePath,
            invoiceNumber: `INV-${saleData.id}-${Date.now()}`,
          });
        });

        stream.on('error', error => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount) {
    return `₹${Math.floor(amount).toLocaleString()}`;
  }
}

module.exports = new InvoiceGenerator();
