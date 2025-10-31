import { Response } from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../database';
import { AuthRequest } from '../middleware/auth.middleware';

export const generateInvoicePDF = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    // Fetch invoice with related data
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        tenantId: tenantId || undefined,
      },
      include: {
        customer: true,
        service: true,
        tenant: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=fatura-${invoice.invoiceNumber}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Colors
    const primaryColor = '#16a34a'; // Green
    const secondaryColor = '#15803d';
    const textColor = '#1f2937';
    const lightGray = '#f3f4f6';
    const mediumGray = '#9ca3af';

    // Header with company info
    doc
      .fillColor(primaryColor)
      .fontSize(28)
      .text(invoice.tenant?.name || 'Empresa', 50, 50);

    doc
      .fillColor(textColor)
      .fontSize(10)
      .text('Fatura / Invoice', 50, 85);

    // Invoice number and date (right aligned)
    doc
      .fillColor(primaryColor)
      .fontSize(16)
      .text(`Nº ${invoice.invoiceNumber}`, 400, 50, { align: 'right' });

    doc
      .fillColor(textColor)
      .fontSize(10)
      .text(`Data de Emissão: ${new Date(invoice.issueDate).toLocaleDateString('pt-BR')}`, 400, 75, { align: 'right' })
      .text(`Vencimento: ${new Date(invoice.dueDate).toLocaleDateString('pt-BR')}`, 400, 90, { align: 'right' });

    // Line separator
    doc
      .strokeColor(primaryColor)
      .lineWidth(2)
      .moveTo(50, 120)
      .lineTo(545, 120)
      .stroke();

    // Customer info section
    doc
      .fillColor(secondaryColor)
      .fontSize(12)
      .text('CLIENTE / CUSTOMER', 50, 140);

    doc
      .fillColor(textColor)
      .fontSize(10)
      .text(invoice.customer.fullName, 50, 160)
      .text(invoice.customer.email || '', 50, 175)
      .text(invoice.customer.phone || '', 50, 190);

    if (invoice.customer.company) {
      doc.text(`Empresa: ${invoice.customer.company}`, 50, 205);
    }

    // Service details section (if available)
    if (invoice.service) {
      doc
        .fillColor(secondaryColor)
        .fontSize(12)
        .text('SERVIÇO / SERVICE', 50, 240);

      doc
        .fillColor(textColor)
        .fontSize(10)
        .text(invoice.service.name, 50, 260)
        .text(invoice.service.description || '', 50, 275, { width: 495 });
    }

    // Invoice details table
    const tableTop = 330;

    doc
      .fillColor(secondaryColor)
      .fontSize(12)
      .text('DETALHES DA FATURA / INVOICE DETAILS', 50, tableTop);

    // Table header background
    doc
      .fillColor(lightGray)
      .rect(50, tableTop + 25, 495, 25)
      .fill();

    // Table headers
    doc
      .fillColor(textColor)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Descrição', 60, tableTop + 33)
      .text('Valor', 450, tableTop + 33);

    doc.font('Helvetica');

    // Table rows
    let yPosition = tableTop + 65;

    // Main amount
    doc
      .fillColor(textColor)
      .text(invoice.description || 'Serviço prestado', 60, yPosition)
      .text(`R$ ${parseFloat(invoice.amount.toString()).toFixed(2)}`, 450, yPosition);

    yPosition += 20;

    // Discount (if any)
    if (invoice.discountAmount && parseFloat(invoice.discountAmount.toString()) > 0) {
      doc
        .fillColor(primaryColor)
        .text('Desconto', 60, yPosition)
        .text(`- R$ ${parseFloat(invoice.discountAmount.toString()).toFixed(2)}`, 450, yPosition);
      yPosition += 20;
    }

    // Fee (if any)
    if (invoice.feeAmount && parseFloat(invoice.feeAmount.toString()) > 0) {
      doc
        .fillColor('#dc2626')
        .text('Juros/Multa', 60, yPosition)
        .text(`+ R$ ${parseFloat(invoice.feeAmount.toString()).toFixed(2)}`, 450, yPosition);
      yPosition += 20;
    }

    // Separator line
    yPosition += 10;
    doc
      .strokeColor(mediumGray)
      .lineWidth(1)
      .moveTo(50, yPosition)
      .lineTo(545, yPosition)
      .stroke();

    yPosition += 15;

    // Total
    const totalAmount = parseFloat(invoice.amount.toString()) -
                       parseFloat(invoice.discountAmount?.toString() || '0') +
                       parseFloat(invoice.feeAmount?.toString() || '0');

    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(primaryColor)
      .text('TOTAL', 60, yPosition)
      .text(`R$ ${totalAmount.toFixed(2)}`, 450, yPosition);

    doc.font('Helvetica');

    // Payment info
    yPosition += 50;

    doc
      .fillColor(secondaryColor)
      .fontSize(12)
      .text('INFORMAÇÕES DE PAGAMENTO / PAYMENT INFO', 50, yPosition);

    yPosition += 25;

    doc
      .fillColor(textColor)
      .fontSize(10);

    // Status
    const statusColors: any = {
      'Em Aberto': '#eab308',
      'Pago': '#16a34a',
      'Vencido': '#dc2626',
      'Parcialmente Pago': '#3b82f6',
      'Cancelado': '#6b7280',
    };

    doc
      .fillColor(statusColors[invoice.status] || textColor)
      .text(`Status: ${invoice.status}`, 50, yPosition);

    yPosition += 20;

    if (invoice.paymentMethod) {
      doc
        .fillColor(textColor)
        .text(`Método de Pagamento: ${invoice.paymentMethod}`, 50, yPosition);
      yPosition += 20;
    }

    if (invoice.isInstallment && invoice.installmentNumber && invoice.totalInstallments) {
      doc.text(`Parcela: ${invoice.installmentNumber}/${invoice.totalInstallments}`, 50, yPosition);
      yPosition += 20;
    }

    if (invoice.paymentDate) {
      doc
        .fillColor(primaryColor)
        .text(`Pago em: ${new Date(invoice.paymentDate).toLocaleDateString('pt-BR')}`, 50, yPosition);
    }

    // Footer
    const footerY = 750;

    doc
      .strokeColor(mediumGray)
      .lineWidth(1)
      .moveTo(50, footerY)
      .lineTo(545, footerY)
      .stroke();

    doc
      .fillColor(mediumGray)
      .fontSize(8)
      .text('Este documento foi gerado eletronicamente e é válido sem assinatura.', 50, footerY + 15, {
        align: 'center',
        width: 495,
      })
      .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 50, footerY + 30, {
        align: 'center',
        width: 495,
      });

    // Finalize PDF
    doc.end();

  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
};
