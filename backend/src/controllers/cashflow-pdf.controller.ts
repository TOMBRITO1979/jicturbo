import { Response } from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../database';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { getTenantFilter } from '../middleware/tenant.middleware';

export const generateCashFlowPDF = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type = '', category = '', status = '', startDate = '', endDate = '' } = req.query;

    const tenantFilter = getTenantFilter(req.user);

    const where: any = {
      ...tenantFilter,
    };

    if (type) {
      where.type = type as string;
    }

    if (category) {
      where.category = category as string;
    }

    if (status) {
      where.status = status as string;
    }

    // Date range filter
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) {
        where.transactionDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.transactionDate.lte = new Date(endDate as string);
      }
    }

    const cashFlows = await prisma.cashFlow.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      include: {
        tenant: true,
      },
    });

    if (cashFlows.length === 0) {
      return res.status(404).json({ error: 'Nenhum lançamento encontrado' });
    }

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;

    cashFlows.forEach((cf) => {
      if (cf.type === 'Entrada') {
        totalIncome += Number(cf.amount);
      } else {
        totalExpense += Number(cf.amount);
      }
    });

    const balance = totalIncome - totalExpense;

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers
    const dateRange = startDate && endDate
      ? `${new Date(startDate as string).toLocaleDateString('pt-BR')}-${new Date(endDate as string).toLocaleDateString('pt-BR')}`
      : 'todos';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=fluxo-caixa-${dateRange}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Colors
    const primaryColor = '#16a34a'; // Green
    const secondaryColor = '#15803d';
    const textColor = '#1f2937';
    const lightGray = '#f3f4f6';
    const mediumGray = '#9ca3af';
    const redColor = '#dc2626';

    // Header
    doc
      .fillColor(primaryColor)
      .fontSize(24)
      .text('Relatório de Fluxo de Caixa', 50, 50);

    doc
      .fillColor(textColor)
      .fontSize(12)
      .text(cashFlows[0].tenant?.name || 'Empresa', 50, 85);

    // Date range
    doc
      .fontSize(10)
      .fillColor(mediumGray)
      .text(
        `Período: ${startDate ? new Date(startDate as string).toLocaleDateString('pt-BR') : 'Início'} até ${
          endDate ? new Date(endDate as string).toLocaleDateString('pt-BR') : 'Hoje'
        }`,
        50,
        105
      );

    doc
      .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 50, 120);

    // Line separator
    doc
      .strokeColor(primaryColor)
      .lineWidth(2)
      .moveTo(50, 145)
      .lineTo(545, 145)
      .stroke();

    // Summary boxes
    const summaryY = 160;

    // Income box
    doc
      .fillColor(lightGray)
      .rect(50, summaryY, 160, 60)
      .fill();

    doc
      .fillColor(primaryColor)
      .fontSize(12)
      .text('Total de Entradas', 60, summaryY + 10);

    doc
      .fillColor(textColor)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(`R$ ${totalIncome.toFixed(2).replace('.', ',')}`, 60, summaryY + 30);

    // Expense box
    doc
      .fillColor(lightGray)
      .rect(220, summaryY, 160, 60)
      .fill();

    doc
      .fillColor(redColor)
      .fontSize(12)
      .font('Helvetica')
      .text('Total de Saídas', 230, summaryY + 10);

    doc
      .fillColor(textColor)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(`R$ ${totalExpense.toFixed(2).replace('.', ',')}`, 230, summaryY + 30);

    // Balance box
    doc
      .fillColor(lightGray)
      .rect(390, summaryY, 155, 60)
      .fill();

    doc
      .fillColor(balance >= 0 ? primaryColor : redColor)
      .fontSize(12)
      .font('Helvetica')
      .text('Saldo', 400, summaryY + 10);

    doc
      .fillColor(textColor)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(`R$ ${balance.toFixed(2).replace('.', ',')}`, 400, summaryY + 30);

    doc.font('Helvetica');

    // Table header
    let yPosition = 250;

    doc
      .fillColor(secondaryColor)
      .fontSize(14)
      .text('Lançamentos', 50, yPosition);

    yPosition += 25;

    // Table header background
    doc.fillColor(lightGray).rect(50, yPosition, 495, 25).fill();

    // Table headers
    doc
      .fillColor(textColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Data', 55, yPosition + 8)
      .text('Tipo', 110, yPosition + 8)
      .text('Categoria', 160, yPosition + 8)
      .text('Descrição', 250, yPosition + 8)
      .text('Valor', 475, yPosition + 8);

    doc.font('Helvetica');

    yPosition += 35;

    // Table rows
    cashFlows.forEach((cashFlow, index) => {
      // Check if we need a new page
      if (yPosition > 720) {
        doc.addPage();
        yPosition = 50;

        // Repeat table header on new page
        doc.fillColor(lightGray).rect(50, yPosition, 495, 25).fill();
        doc
          .fillColor(textColor)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('Data', 55, yPosition + 8)
          .text('Tipo', 110, yPosition + 8)
          .text('Categoria', 160, yPosition + 8)
          .text('Descrição', 250, yPosition + 8)
          .text('Valor', 475, yPosition + 8);

        doc.font('Helvetica');
        yPosition += 35;
      }

      // Alternate row colors
      if (index % 2 === 0) {
        doc.fillColor('#fafafa').rect(50, yPosition - 5, 495, 20).fill();
      }

      const valueColor = cashFlow.type === 'Entrada' ? primaryColor : redColor;
      const valuePrefix = cashFlow.type === 'Entrada' ? '+' : '-';

      doc
        .fillColor(textColor)
        .fontSize(8)
        .text(new Date(cashFlow.transactionDate).toLocaleDateString('pt-BR'), 55, yPosition)
        .text(cashFlow.type === 'Entrada' ? 'Entrada' : 'Saída', 110, yPosition)
        .text(cashFlow.category.substring(0, 15), 160, yPosition)
        .text(cashFlow.description.substring(0, 30), 250, yPosition);

      doc
        .fillColor(valueColor)
        .text(
          `${valuePrefix} R$ ${parseFloat(cashFlow.amount.toString()).toFixed(2).replace('.', ',')}`,
          465,
          yPosition
        );

      yPosition += 20;
    });

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
      .text('Este documento foi gerado eletronicamente.', 50, footerY + 15, {
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
