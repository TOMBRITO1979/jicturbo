import { Response } from 'express';
import prisma from '../database';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantFilter } from '../middleware/tenant.middleware';

export const generateCashFlowCSV = async (req: AuthRequest, res: Response) => {
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
    });

    if (cashFlows.length === 0) {
      return res.status(404).json({ error: 'Nenhum lançamento encontrado' });
    }

    // CSV headers
    const headers = [
      'Data',
      'Tipo',
      'Categoria',
      'Subcategoria',
      'Descrição',
      'Valor',
      'Método de Pagamento',
      'Conta Bancária',
      'Número de Referência',
      'Status',
      'Conciliado',
      'Observações',
    ];

    // Build CSV content
    let csvContent = headers.join(';') + '\n';

    cashFlows.forEach((cashFlow) => {
      const row = [
        new Date(cashFlow.transactionDate).toLocaleDateString('pt-BR'),
        cashFlow.type,
        cashFlow.category,
        cashFlow.subcategory || '',
        `"${cashFlow.description.replace(/"/g, '""')}"`, // Escape quotes
        parseFloat(cashFlow.amount.toString()).toFixed(2).replace('.', ','),
        cashFlow.paymentMethod || '',
        cashFlow.bankAccount || '',
        cashFlow.referenceNumber || '',
        cashFlow.status,
        cashFlow.reconciled ? 'Sim' : 'Não',
        cashFlow.notes ? `"${cashFlow.notes.replace(/"/g, '""')}"` : '',
      ];

      csvContent += row.join(';') + '\n';
    });

    // Add summary rows
    const totalIncome = cashFlows
      .filter((cf) => cf.type === 'Entrada')
      .reduce((sum, cf) => sum + Number(cf.amount), 0);

    const totalExpense = cashFlows
      .filter((cf) => cf.type === 'Saída')
      .reduce((sum, cf) => sum + Number(cf.amount), 0);

    const balance = totalIncome - totalExpense;

    csvContent += '\n';
    csvContent += `Total de Entradas;;;;;"${totalIncome.toFixed(2).replace('.', ',')}"\n`;
    csvContent += `Total de Saídas;;;;;"${totalExpense.toFixed(2).replace('.', ',')}"\n`;
    csvContent += `Saldo;;;;;"${balance.toFixed(2).replace('.', ',')}"\n`;

    // Set response headers
    const dateRange =
      startDate && endDate
        ? `${new Date(startDate as string).toLocaleDateString('pt-BR').replace(/\//g, '-')}-${new Date(
            endDate as string
          )
            .toLocaleDateString('pt-BR')
            .replace(/\//g, '-')}`
        : 'todos';

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=fluxo-caixa-${dateRange}.csv`);

    // Add BOM for Excel UTF-8 compatibility
    res.write('\ufeff');
    res.write(csvContent);
    res.end();
  } catch (error: any) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: error.message });
  }
};
