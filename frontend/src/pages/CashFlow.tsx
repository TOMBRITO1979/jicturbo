import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface CashFlow {
  id: string;
  type: string;
  transactionDate: string;
  amount: number;
  category: string;
  subcategory: string | null;
  description: string;
  referenceNumber: string | null;
  paymentMethod: string | null;
  bankAccount: string | null;
  customerId: string | null;
  invoiceId: string | null;
  projectId: string | null;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  isRecurring: boolean;
  recurringInterval: string | null;
  nextOccurrence: string | null;
  notes: string | null;
  attachments: any;
  reconciled: boolean;
  reconciledAt: string | null;
  reconciledBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Summary {
  income: number;
  expense: number;
  balance?: number;
}

export default function CashFlow() {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCashFlow, setSelectedCashFlow] = useState<CashFlow | null>(null);
  const [summary, setSummary] = useState<Summary>({ income: 0, expense: 0, balance: 0 });

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    type: 'Entrada',
    transactionDate: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    subcategory: '',
    description: '',
    referenceNumber: '',
    paymentMethod: '',
    bankAccount: '',
    status: 'Confirmado',
    notes: '',
    isRecurring: false,
    reconciled: false,
  });

  const categories = [
    'Vendas',
    'Serviços',
    'Consultoria',
    'Produtos',
    'Salários',
    'Fornecedores',
    'Impostos',
    'Aluguel',
    'Energia',
    'Telefone/Internet',
    'Marketing',
    'Equipamentos',
    'Material de Escritório',
    'Transporte',
    'Alimentação',
    'Outros',
  ];

  const paymentMethods = [
    'Dinheiro',
    'PIX',
    'Boleto',
    'Cartão de Crédito',
    'Cartão de Débito',
    'Transferência Bancária',
    'Cheque',
  ];

  useEffect(() => {
    fetchCashFlows();
  }, [typeFilter, categoryFilter, statusFilter, startDateFilter, endDateFilter]);

  const fetchCashFlows = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (startDateFilter) params.append('startDate', startDateFilter);
      if (endDateFilter) params.append('endDate', endDateFilter);

      const response = await axios.get(`${API_URL}/cashflow?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCashFlows(response.data.data.cashFlows);
      setSummary(response.data.data.summary);
    } catch (error: any) {
      console.error('Error fetching cash flows:', error);
      alert(error.response?.data?.message || 'Erro ao carregar fluxo de caixa');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/cashflow`,
        {
          ...formData,
          amount: parseFloat(formData.amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowCreateModal(false);
      resetForm();
      fetchCashFlows();
      alert('Lançamento criado com sucesso!');
    } catch (error: any) {
      console.error('Error creating cash flow:', error);
      alert(error.response?.data?.message || 'Erro ao criar lançamento');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCashFlow) return;

    try {
      await axios.put(
        `${API_URL}/cashflow/${selectedCashFlow.id}`,
        {
          ...formData,
          amount: parseFloat(formData.amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowEditModal(false);
      resetForm();
      fetchCashFlows();
      alert('Lançamento atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating cash flow:', error);
      alert(error.response?.data?.message || 'Erro ao atualizar lançamento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;

    try {
      await axios.delete(`${API_URL}/cashflow/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchCashFlows();
      alert('Lançamento excluído com sucesso!');
    } catch (error: any) {
      console.error('Error deleting cash flow:', error);
      alert(error.response?.data?.message || 'Erro ao excluir lançamento');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'Entrada',
      transactionDate: new Date().toISOString().split('T')[0],
      amount: '',
      category: '',
      subcategory: '',
      description: '',
      referenceNumber: '',
      paymentMethod: '',
      bankAccount: '',
      status: 'Confirmado',
      notes: '',
      isRecurring: false,
      reconciled: false,
    });
    setSelectedCashFlow(null);
  };

  const openEditModal = (cashFlow: CashFlow) => {
    setSelectedCashFlow(cashFlow);
    setFormData({
      type: cashFlow.type,
      transactionDate: cashFlow.transactionDate.split('T')[0],
      amount: cashFlow.amount.toString(),
      category: cashFlow.category,
      subcategory: cashFlow.subcategory || '',
      description: cashFlow.description,
      referenceNumber: cashFlow.referenceNumber || '',
      paymentMethod: cashFlow.paymentMethod || '',
      bankAccount: cashFlow.bankAccount || '',
      status: cashFlow.status,
      notes: cashFlow.notes || '',
      isRecurring: cashFlow.isRecurring,
      reconciled: cashFlow.reconciled,
    });
    setShowEditModal(true);
  };

  const openViewModal = (cashFlow: CashFlow) => {
    setSelectedCashFlow(cashFlow);
    setShowViewModal(true);
  };

  const exportPDF = () => {
    const params = new URLSearchParams();
    if (typeFilter) params.append('type', typeFilter);
    if (categoryFilter) params.append('category', categoryFilter);
    if (statusFilter) params.append('status', statusFilter);
    if (startDateFilter) params.append('startDate', startDateFilter);
    if (endDateFilter) params.append('endDate', endDateFilter);

    window.open(
      `${API_URL}/cashflow/export/pdf?${params.toString()}&token=${token}`,
      '_blank'
    );
  };

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (typeFilter) params.append('type', typeFilter);
    if (categoryFilter) params.append('category', categoryFilter);
    if (statusFilter) params.append('status', statusFilter);
    if (startDateFilter) params.append('startDate', startDateFilter);
    if (endDateFilter) params.append('endDate', endDateFilter);

    window.open(
      `${API_URL}/cashflow/export/csv?${params.toString()}&token=${token}`,
      '_blank'
    );
  };

  const clearFilters = () => {
    setTypeFilter('');
    setCategoryFilter('');
    setStatusFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">💰 Fluxo de Caixa</h1>
          <p className="text-gray-600 mt-1">Gerencie entradas e saídas financeiras</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Entradas</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {summary.income.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-sm text-gray-600 mb-1">Saídas</p>
            <p className="text-2xl font-bold text-red-600">
              R$ {summary.expense.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div
            className={`bg-white rounded-lg shadow p-6 border-l-4 ${
              (summary.balance || 0) >= 0 ? 'border-blue-500' : 'border-orange-500'
            }`}
          >
            <p className="text-sm text-gray-600 mb-1">Saldo</p>
            <p
              className={`text-2xl font-bold ${
                (summary.balance || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}
            >
              R$ {(summary.balance || 0).toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {/* Actions and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#16a34a] text-white rounded-md hover:bg-green-700 transition"
            >
              ➕ Novo Lançamento
            </button>

            {/* Type Filter */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              >
                <option value="">Todos</option>
                <option value="Entrada">Entrada</option>
                <option value="Saída">Saída</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              >
                <option value="">Todos</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Pendente">Pendente</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              />
            </div>

            {/* End Date */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
              />
            </div>

            {/* Export Buttons */}
            <button
              onClick={exportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              📄 PDF
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              📊 CSV
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              🔄 Limpar
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16a34a] mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando...</p>
            </div>
          ) : cashFlows.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">Nenhum lançamento encontrado</p>
              <p className="text-sm mt-2">Clique em "Novo Lançamento" para começar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cashFlows.map((cashFlow) => (
                    <tr key={cashFlow.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(cashFlow.transactionDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            cashFlow.type === 'Entrada'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {cashFlow.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cashFlow.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {cashFlow.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <span
                          className={
                            cashFlow.type === 'Entrada' ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {cashFlow.type === 'Entrada' ? '+' : '-'} R${' '}
                          {parseFloat(cashFlow.amount.toString()).toFixed(2).replace('.', ',')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            cashFlow.status === 'Confirmado'
                              ? 'bg-blue-100 text-blue-800'
                              : cashFlow.status === 'Pendente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {cashFlow.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openViewModal(cashFlow)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => openEditModal(cashFlow)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(cashFlow.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Novo Lançamento</h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="Entrada">Entrada</option>
                        <option value="Saída">Saída</option>
                      </select>
                    </div>

                    {/* Transaction Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data *
                      </label>
                      <input
                        type="date"
                        value={formData.transactionDate}
                        onChange={(e) =>
                          setFormData({ ...formData, transactionDate: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="">Selecione...</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategory */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subcategoria
                      </label>
                      <input
                        type="text"
                        value={formData.subcategory}
                        onChange={(e) =>
                          setFormData({ ...formData, subcategory: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Método de Pagamento
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) =>
                          setFormData({ ...formData, paymentMethod: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="">Selecione...</option>
                        {paymentMethods.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bank Account */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conta Bancária
                      </label>
                      <input
                        type="text"
                        value={formData.bankAccount}
                        onChange={(e) =>
                          setFormData({ ...formData, bankAccount: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    {/* Reference Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Referência
                      </label>
                      <input
                        type="text"
                        value={formData.referenceNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, referenceNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="Confirmado">Confirmado</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isRecurring}
                          onChange={(e) =>
                            setFormData({ ...formData, isRecurring: e.target.checked })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Recorrente</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.reconciled}
                          onChange={(e) =>
                            setFormData({ ...formData, reconciled: e.target.checked })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Conciliado</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#16a34a] text-white rounded-md hover:bg-green-700 transition"
                    >
                      Criar Lançamento
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal - Same structure as Create Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Editar Lançamento</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleEdit} className="space-y-4">
                  {/* Same form fields as Create Modal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="Entrada">Entrada</option>
                        <option value="Saída">Saída</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data *
                      </label>
                      <input
                        type="date"
                        value={formData.transactionDate}
                        onChange={(e) =>
                          setFormData({ ...formData, transactionDate: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="">Selecione...</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subcategoria
                      </label>
                      <input
                        type="text"
                        value={formData.subcategory}
                        onChange={(e) =>
                          setFormData({ ...formData, subcategory: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Método de Pagamento
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) =>
                          setFormData({ ...formData, paymentMethod: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="">Selecione...</option>
                        {paymentMethods.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conta Bancária
                      </label>
                      <input
                        type="text"
                        value={formData.bankAccount}
                        onChange={(e) =>
                          setFormData({ ...formData, bankAccount: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Referência
                      </label>
                      <input
                        type="text"
                        value={formData.referenceNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, referenceNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="Confirmado">Confirmado</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isRecurring}
                          onChange={(e) =>
                            setFormData({ ...formData, isRecurring: e.target.checked })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Recorrente</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.reconciled}
                          onChange={(e) =>
                            setFormData({ ...formData, reconciled: e.target.checked })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Conciliado</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#16a34a] text-white rounded-md hover:bg-green-700 transition"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedCashFlow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Detalhes do Lançamento</h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tipo</p>
                      <p className="font-semibold">{selectedCashFlow.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data</p>
                      <p className="font-semibold">
                        {new Date(selectedCashFlow.transactionDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor</p>
                      <p className="font-semibold text-lg">
                        R${' '}
                        {parseFloat(selectedCashFlow.amount.toString())
                          .toFixed(2)
                          .replace('.', ',')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Categoria</p>
                      <p className="font-semibold">{selectedCashFlow.category}</p>
                    </div>
                    {selectedCashFlow.subcategory && (
                      <div>
                        <p className="text-sm text-gray-600">Subcategoria</p>
                        <p className="font-semibold">{selectedCashFlow.subcategory}</p>
                      </div>
                    )}
                    {selectedCashFlow.paymentMethod && (
                      <div>
                        <p className="text-sm text-gray-600">Método de Pagamento</p>
                        <p className="font-semibold">{selectedCashFlow.paymentMethod}</p>
                      </div>
                    )}
                    {selectedCashFlow.bankAccount && (
                      <div>
                        <p className="text-sm text-gray-600">Conta Bancária</p>
                        <p className="font-semibold">{selectedCashFlow.bankAccount}</p>
                      </div>
                    )}
                    {selectedCashFlow.referenceNumber && (
                      <div>
                        <p className="text-sm text-gray-600">Nº Referência</p>
                        <p className="font-semibold">{selectedCashFlow.referenceNumber}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold">{selectedCashFlow.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Conciliado</p>
                      <p className="font-semibold">
                        {selectedCashFlow.reconciled ? 'Sim' : 'Não'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Descrição</p>
                    <p className="font-semibold">{selectedCashFlow.description}</p>
                  </div>

                  {selectedCashFlow.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Observações</p>
                      <p className="font-semibold">{selectedCashFlow.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
