import { useState, useEffect } from 'react';
import api from '../services/api';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: {
    id: string;
    fullName: string;
    email: string;
  };
  serviceId: string | null;
  service?: {
    id: string;
    name: string;
  };
  description: string | null;
  issueDate: string;
  dueDate: string;
  paymentDate: string | null;
  amount: number;
  paidAmount: number;
  discountAmount: number;
  feeAmount: number;
  status: string;
  paymentMethod: string | null;
  isInstallment: boolean;
  installmentNumber: number | null;
  totalInstallments: number | null;
  notes: string | null;
  createdAt: string;
}

interface Customer {
  id: string;
  fullName: string;
}

interface Service {
  id: string;
  name: string;
}

export default function Financial() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    serviceId: '',
    description: '',
    issueDate: '',
    dueDate: '',
    paymentDate: '',
    amount: '',
    paidAmount: '0',
    discountAmount: '0',
    feeAmount: '0',
    status: 'Em Aberto',
    paymentMethod: '',
    isInstallment: false,
    installmentNumber: '',
    totalInstallments: '',
    notes: '',
  });

  // Dummy data for better UX
  const dummyInvoices: Invoice[] = [
    {
      id: 'demo-1',
      invoiceNumber: 'INV-2025-001',
      customerId: 'demo-customer-1',
      customer: {
        id: 'demo-customer-1',
        fullName: 'João Silva Santos',
        email: 'joao.silva@email.com',
      },
      serviceId: 'demo-service-1',
      service: {
        id: 'demo-service-1',
        name: 'Consultoria Empresarial',
      },
      description: 'Pagamento referente a consultoria empresarial - Janeiro 2025',
      issueDate: '2025-01-15T00:00:00',
      dueDate: '2025-02-15T00:00:00',
      paymentDate: null,
      amount: 5000,
      paidAmount: 0,
      discountAmount: 0,
      feeAmount: 0,
      status: 'Em Aberto',
      paymentMethod: 'Boleto',
      isInstallment: false,
      installmentNumber: null,
      totalInstallments: null,
      notes: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      invoiceNumber: 'INV-2025-002',
      customerId: 'demo-customer-2',
      customer: {
        id: 'demo-customer-2',
        fullName: 'Maria Costa Oliveira',
        email: 'maria.costa@email.com',
      },
      serviceId: 'demo-service-2',
      service: {
        id: 'demo-service-2',
        name: 'Desenvolvimento Software',
      },
      description: 'Parcela 1/3 - Desenvolvimento de Software',
      issueDate: '2025-01-10T00:00:00',
      dueDate: '2025-01-31T00:00:00',
      paymentDate: '2025-01-28T00:00:00',
      amount: 30000,
      paidAmount: 30000,
      discountAmount: 1500,
      feeAmount: 0,
      status: 'Pago',
      paymentMethod: 'PIX',
      isInstallment: true,
      installmentNumber: 1,
      totalInstallments: 3,
      notes: 'Pagamento antecipado com 5% de desconto',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      invoiceNumber: 'INV-2025-003',
      customerId: 'demo-customer-3',
      customer: {
        id: 'demo-customer-3',
        fullName: 'Pedro Henrique Souza',
        email: 'pedro.souza@email.com',
      },
      serviceId: 'demo-service-3',
      service: {
        id: 'demo-service-3',
        name: 'Manutenção de Sistemas',
      },
      description: 'Manutenção mensal - Janeiro 2025',
      issueDate: '2025-01-05T00:00:00',
      dueDate: '2025-01-20T00:00:00',
      paymentDate: null,
      amount: 2500,
      paidAmount: 0,
      discountAmount: 0,
      feeAmount: 125,
      status: 'Vencido',
      paymentMethod: 'Boleto',
      isInstallment: false,
      installmentNumber: null,
      totalInstallments: null,
      notes: 'Multa de 5% por atraso',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      invoiceNumber: 'INV-2025-004',
      customerId: 'demo-customer-4',
      customer: {
        id: 'demo-customer-4',
        fullName: 'Ana Paula Ferreira',
        email: 'ana.ferreira@email.com',
      },
      serviceId: 'demo-service-4',
      service: {
        id: 'demo-service-4',
        name: 'Suporte Técnico Premium',
      },
      description: 'Parcela 2/6 - Suporte Premium Anual',
      issueDate: '2025-02-01T00:00:00',
      dueDate: '2025-02-28T00:00:00',
      paymentDate: '2025-02-15T00:00:00',
      amount: 8000,
      paidAmount: 4000,
      discountAmount: 0,
      feeAmount: 0,
      status: 'Parcialmente Pago',
      paymentMethod: 'Cartão de Crédito',
      isInstallment: true,
      installmentNumber: 2,
      totalInstallments: 6,
      notes: 'Aguardando segunda parcela',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-5',
      invoiceNumber: 'INV-2025-005',
      customerId: 'demo-customer-5',
      customer: {
        id: 'demo-customer-5',
        fullName: 'Carlos Eduardo Almeida',
        email: 'carlos.almeida@email.com',
      },
      serviceId: null,
      service: undefined,
      description: 'Serviço de consultoria pontual',
      issueDate: '2025-02-10T00:00:00',
      dueDate: '2025-03-10T00:00:00',
      paymentDate: '2025-02-12T00:00:00',
      amount: 15000,
      paidAmount: 15000,
      discountAmount: 0,
      feeAmount: 0,
      status: 'Pago',
      paymentMethod: 'Transferência Bancária',
      isInstallment: false,
      installmentNumber: null,
      totalInstallments: null,
      notes: 'Pagamento efetuado em 48h',
      createdAt: new Date().toISOString(),
    },
  ];

  const dummyCustomers: Customer[] = [
    { id: 'demo-customer-1', fullName: 'João Silva Santos' },
    { id: 'demo-customer-2', fullName: 'Maria Costa Oliveira' },
    { id: 'demo-customer-3', fullName: 'Pedro Henrique Souza' },
    { id: 'demo-customer-4', fullName: 'Ana Paula Ferreira' },
    { id: 'demo-customer-5', fullName: 'Carlos Eduardo Almeida' },
  ];

  const dummyServices: Service[] = [
    { id: 'demo-service-1', name: 'Consultoria Empresarial' },
    { id: 'demo-service-2', name: 'Desenvolvimento Software' },
    { id: 'demo-service-3', name: 'Manutenção de Sistemas' },
    { id: 'demo-service-4', name: 'Suporte Técnico Premium' },
    { id: 'demo-service-5', name: 'Treinamento Equipe' },
  ];

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchServices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/financial/invoices');
      const data = response.data.data.invoices || response.data.data;

      if (Array.isArray(data) && data.length > 0) {
        setInvoices(data);
      } else {
        setInvoices(dummyInvoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices(dummyInvoices);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      const data = response.data.data.customers || response.data.data;

      if (Array.isArray(data) && data.length > 0) {
        setCustomers(data);
      } else {
        setCustomers(dummyCustomers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers(dummyCustomers);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      const data = response.data.data.services || response.data.data;

      if (Array.isArray(data) && data.length > 0) {
        setServices(data);
      } else {
        setServices(dummyServices);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices(dummyServices);
    }
  };

  const handleCreate = () => {
    setEditingInvoice(null);
    const today = new Date().toISOString().substring(0, 10);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dueDate = nextMonth.toISOString().substring(0, 10);

    setFormData({
      invoiceNumber: '',
      customerId: '',
      serviceId: '',
      description: '',
      issueDate: today,
      dueDate: dueDate,
      paymentDate: '',
      amount: '',
      paidAmount: '0',
      discountAmount: '0',
      feeAmount: '0',
      status: 'Em Aberto',
      paymentMethod: '',
      isInstallment: false,
      installmentNumber: '',
      totalInstallments: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      serviceId: invoice.serviceId || '',
      description: invoice.description || '',
      issueDate: invoice.issueDate.substring(0, 10),
      dueDate: invoice.dueDate.substring(0, 10),
      paymentDate: invoice.paymentDate ? invoice.paymentDate.substring(0, 10) : '',
      amount: String(invoice.amount),
      paidAmount: String(invoice.paidAmount),
      discountAmount: String(invoice.discountAmount),
      feeAmount: String(invoice.feeAmount),
      status: invoice.status,
      paymentMethod: invoice.paymentMethod || '',
      isInstallment: invoice.isInstallment,
      installmentNumber: invoice.installmentNumber ? String(invoice.installmentNumber) : '',
      totalInstallments: invoice.totalInstallments ? String(invoice.totalInstallments) : '',
      notes: invoice.notes || '',
    });
    setShowModal(true);
  };

  const handleView = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta fatura?')) return;

    try {
      await api.delete(`/financial/invoices/${id}`);
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Erro ao excluir fatura. Tente novamente.');
    }
  };

  const handleGeneratePDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await api.get(`/financial/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fatura-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        paidAmount: parseFloat(formData.paidAmount),
        discountAmount: parseFloat(formData.discountAmount),
        feeAmount: parseFloat(formData.feeAmount),
        installmentNumber: formData.installmentNumber ? parseInt(formData.installmentNumber) : null,
        totalInstallments: formData.totalInstallments ? parseInt(formData.totalInstallments) : null,
        serviceId: formData.serviceId || null,
        paymentDate: formData.paymentDate || null,
      };

      if (editingInvoice) {
        await api.put(`/financial/invoices/${editingInvoice.id}`, submitData);
      } else {
        await api.post('/financial/invoices', submitData);
      }
      setShowModal(false);
      fetchInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Erro ao salvar fatura. Verifique os dados e tente novamente.');
    }
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      'Em Aberto': 'bg-yellow-100 text-yellow-800',
      'Pago': 'bg-green-100 text-green-800',
      'Vencido': 'bg-red-100 text-red-800',
      'Parcialmente Pago': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Faturas</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            + Nova Fatura
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por número, cliente, descrição ou status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fatura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
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
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhuma fatura encontrada
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.service?.name || 'Sem serviço'}
                        </div>
                        {invoice.isInstallment && (
                          <div className="text-xs text-gray-400 mt-1">
                            Parcela {invoice.installmentNumber}/{invoice.totalInstallments}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {invoice.customer?.fullName || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </div>
                        {invoice.paidAmount > 0 && (
                          <div className="text-xs text-green-600">
                            Pago: {formatCurrency(invoice.paidAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(invoice.dueDate)}
                        </div>
                        {invoice.paymentDate && (
                          <div className="text-xs text-green-600">
                            Pago em: {formatDate(invoice.paymentDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(invoice.status)}`}>
                          {invoice.status}
                        </span>
                        {invoice.paymentMethod && (
                          <div className="text-xs text-gray-500 mt-1">
                            {invoice.paymentMethod}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleView(invoice)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Visualizar
                        </button>
                        <button
                          onClick={() => handleGeneratePDF(invoice.id, invoice.invoiceNumber)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Gerar PDF"
                        >
                          📄 PDF
                        </button>
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingInvoice ? 'Editar Fatura' : 'Nova Fatura'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Número da Fatura */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número da Fatura *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="INV-2025-001"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Em Aberto">Em Aberto</option>
                      <option value="Pago">Pago</option>
                      <option value="Vencido">Vencido</option>
                      <option value="Parcialmente Pago">Parcialmente Pago</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  {/* Cliente */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente *
                    </label>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Selecione um cliente</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Serviço */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serviço
                    </label>
                    <select
                      value={formData.serviceId}
                      onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Sem serviço vinculado</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Valor Total */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Total (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Valor Pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Pago (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Desconto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desconto (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Multa/Juros */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Multa/Juros (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.feeAmount}
                      onChange={(e) => setFormData({ ...formData, feeAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Data de Emissão */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Emissão *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Data de Vencimento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Vencimento *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Data de Pagamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Pagamento
                    </label>
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Método de Pagamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Método de Pagamento
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Selecione</option>
                      <option value="Boleto">Boleto</option>
                      <option value="PIX">PIX</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Transferência Bancária">Transferência Bancária</option>
                      <option value="Dinheiro">Dinheiro</option>
                    </select>
                  </div>

                  {/* É Parcelado */}
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isInstallment}
                        onChange={(e) => setFormData({ ...formData, isInstallment: e.target.checked })}
                        className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        É Parcelado
                      </span>
                    </label>
                  </div>

                  {formData.isInstallment && (
                    <>
                      {/* Número da Parcela */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número da Parcela
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.installmentNumber}
                          onChange={(e) => setFormData({ ...formData, installmentNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      {/* Total de Parcelas */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total de Parcelas
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.totalInstallments}
                          onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Descrição */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="Descreva a fatura..."
                    />
                  </div>

                  {/* Observações */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="Notas internas..."
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {editingInvoice ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detalhes da Fatura</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Número da Fatura */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Número da Fatura</label>
                  <p className="text-gray-900 font-medium text-lg">{viewingInvoice.invoiceNumber}</p>
                </div>

                {/* Cliente */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Cliente</label>
                  <p className="text-gray-900">{viewingInvoice.customer?.fullName || '-'}</p>
                  {viewingInvoice.customer?.email && (
                    <p className="text-sm text-gray-500">{viewingInvoice.customer.email}</p>
                  )}
                </div>

                {/* Serviço */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Serviço</label>
                  <p className="text-gray-900">{viewingInvoice.service?.name || '-'}</p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusBadge(viewingInvoice.status)}`}>
                    {viewingInvoice.status}
                  </span>
                </div>

                {/* Método de Pagamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Método de Pagamento</label>
                  <p className="text-gray-900">{viewingInvoice.paymentMethod || '-'}</p>
                </div>

                {/* Valores */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Valor Total</label>
                  <p className="text-gray-900 font-medium text-lg">{formatCurrency(viewingInvoice.amount)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Valor Pago</label>
                  <p className="text-green-600 font-medium">{formatCurrency(viewingInvoice.paidAmount)}</p>
                </div>

                {viewingInvoice.discountAmount > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Desconto</label>
                    <p className="text-gray-900">{formatCurrency(viewingInvoice.discountAmount)}</p>
                  </div>
                )}

                {viewingInvoice.feeAmount > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Multa/Juros</label>
                    <p className="text-red-600">{formatCurrency(viewingInvoice.feeAmount)}</p>
                  </div>
                )}

                {/* Datas */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Data de Emissão</label>
                  <p className="text-gray-900">{formatDate(viewingInvoice.issueDate)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Data de Vencimento</label>
                  <p className="text-gray-900">{formatDate(viewingInvoice.dueDate)}</p>
                </div>

                {viewingInvoice.paymentDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Data de Pagamento</label>
                    <p className="text-green-600">{formatDate(viewingInvoice.paymentDate)}</p>
                  </div>
                )}

                {/* Parcelamento */}
                {viewingInvoice.isInstallment && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Parcelamento</label>
                    <p className="text-gray-900">
                      Parcela {viewingInvoice.installmentNumber} de {viewingInvoice.totalInstallments}
                    </p>
                  </div>
                )}

                {/* Descrição */}
                {viewingInvoice.description && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Descrição</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingInvoice.description}</p>
                  </div>
                )}

                {/* Observações */}
                {viewingInvoice.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Observações</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingInvoice.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingInvoice);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
