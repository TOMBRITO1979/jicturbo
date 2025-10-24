import { useState, useEffect } from 'react';
import api from '../services/api';

interface Service {
  id: string;
  name: string;
  customerId: string;
  customer?: {
    id: string;
    fullName: string;
    email: string;
  };
  startDate: string;
  endDate: string | null;
  periodicity: string;
  status: string;
  totalValue: number;
  category: string | null;
  description: string | null;
  completionPercent: number;
  paymentMethod: string | null;
  createdAt: string;
}

interface Customer {
  id: string;
  fullName: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    customerId: '',
    startDate: '',
    endDate: '',
    periodicity: 'Mensal',
    status: 'Ativo',
    totalValue: '',
    category: '',
    description: '',
    completionPercent: '0',
    paymentMethod: '',
  });

  // Dummy data for better UX
  const dummyServices: Service[] = [
    {
      id: 'demo-1',
      name: 'Consultoria Empresarial',
      customerId: 'demo-customer-1',
      customer: {
        id: 'demo-customer-1',
        fullName: 'João Silva Santos',
        email: 'joao.silva@email.com',
      },
      startDate: '2025-01-15',
      endDate: '2025-12-31',
      periodicity: 'Mensal',
      status: 'Ativo',
      totalValue: 60000,
      category: 'Consultoria',
      description: 'Consultoria estratégica para transformação digital',
      completionPercent: 35,
      paymentMethod: 'Boleto',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      name: 'Suporte Técnico Premium',
      customerId: 'demo-customer-2',
      customer: {
        id: 'demo-customer-2',
        fullName: 'Maria Costa Oliveira',
        email: 'maria.costa@email.com',
      },
      startDate: '2025-02-01',
      endDate: null,
      periodicity: 'Mensal',
      status: 'Ativo',
      totalValue: 5000,
      category: 'Suporte',
      description: 'Suporte técnico 24/7 com SLA de 2 horas',
      completionPercent: 0,
      paymentMethod: 'Cartão de Crédito',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      name: 'Desenvolvimento de Software Customizado',
      customerId: 'demo-customer-3',
      customer: {
        id: 'demo-customer-3',
        fullName: 'Pedro Henrique Souza',
        email: 'pedro.souza@email.com',
      },
      startDate: '2025-03-10',
      endDate: '2025-09-10',
      periodicity: 'Único',
      status: 'Em Andamento',
      totalValue: 120000,
      category: 'Desenvolvimento',
      description: 'Sistema de gestão empresarial personalizado',
      completionPercent: 65,
      paymentMethod: 'Transferência',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      name: 'Treinamento Corporativo',
      customerId: 'demo-customer-4',
      customer: {
        id: 'demo-customer-4',
        fullName: 'Ana Paula Ferreira',
        email: 'ana.ferreira@email.com',
      },
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      periodicity: 'Único',
      status: 'Finalizado',
      totalValue: 15000,
      category: 'Treinamento',
      description: 'Treinamento em metodologias ágeis',
      completionPercent: 100,
      paymentMethod: 'PIX',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-5',
      name: 'Manutenção de Sistemas',
      customerId: 'demo-customer-5',
      customer: {
        id: 'demo-customer-5',
        fullName: 'Carlos Eduardo Almeida',
        email: 'carlos.almeida@email.com',
      },
      startDate: '2025-01-01',
      endDate: null,
      periodicity: 'Anual',
      status: 'Ativo',
      totalValue: 24000,
      category: 'Manutenção',
      description: 'Manutenção preventiva e corretiva de sistemas',
      completionPercent: 20,
      paymentMethod: 'Boleto',
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

  useEffect(() => {
    fetchServices();
    fetchCustomers();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
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

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      customerId: '',
      startDate: '',
      endDate: '',
      periodicity: 'Mensal',
      status: 'Ativo',
      totalValue: '',
      category: '',
      description: '',
      completionPercent: '0',
      paymentMethod: '',
    });
    setShowModal(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);

    // Format dates for input[type="date"] (yyyy-MM-dd)
    const formatDateForInput = (dateString: string | null) => {
      if (!dateString) return '';
      // Handle both ISO format with timezone and simple date strings
      return dateString.substring(0, 10);
    };

    setFormData({
      name: service.name,
      customerId: service.customerId,
      startDate: formatDateForInput(service.startDate),
      endDate: formatDateForInput(service.endDate),
      periodicity: service.periodicity,
      status: service.status,
      totalValue: service.totalValue.toString(),
      category: service.category || '',
      description: service.description || '',
      completionPercent: service.completionPercent.toString(),
      paymentMethod: service.paymentMethod || '',
    });
    setShowModal(true);
  };

  const handleView = (service: Service) => {
    setViewingService(service);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Erro ao excluir serviço. Tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data
    const submitData = {
      ...formData,
      totalValue: parseFloat(formData.totalValue),
      completionPercent: parseInt(formData.completionPercent),
    };

    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, submitData);
      } else {
        await api.post('/services', submitData);
      }
      setShowModal(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Erro ao salvar serviço. Verifique os dados e tente novamente.');
    }
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      'Ativo': 'bg-green-100 text-green-800',
      'Em Andamento': 'bg-blue-100 text-blue-800',
      'Finalizado': 'bg-gray-100 text-gray-800',
      'Cancelado': 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            + Novo Serviço
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nome, cliente ou categoria..."
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
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Nenhum serviço encontrado
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {service.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.category || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {service.customer?.fullName || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(service.startDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.endDate ? formatDate(service.endDate) : 'Indeterminado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(service.totalValue)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.periodicity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(service.status)}`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">{service.completionPercent}%</div>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${service.completionPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleView(service)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Visualizar
                        </button>
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome do Serviço */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Serviço *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Cliente */}
                  <div className="md:col-span-2">
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

                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="Consultoria, Suporte, etc."
                    />
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
                      value={formData.totalValue}
                      onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Data de Início */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Data de Término */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Término
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Periodicidade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Periodicidade *
                    </label>
                    <select
                      required
                      value={formData.periodicity}
                      onChange={(e) => setFormData({ ...formData, periodicity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Único">Único</option>
                      <option value="Mensal">Mensal</option>
                      <option value="Anual">Anual</option>
                      <option value="Recorrente">Recorrente</option>
                    </select>
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
                      <option value="Ativo">Ativo</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  {/* Progresso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Progresso (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.completionPercent}
                      onChange={(e) => setFormData({ ...formData, completionPercent: e.target.value })}
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
                      <option value="Transferência">Transferência Bancária</option>
                    </select>
                  </div>

                  {/* Descrição */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="Detalhes sobre o serviço..."
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
                    {editingService ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detalhes do Serviço</h2>
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
                {/* Nome do Serviço */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nome do Serviço</label>
                  <p className="text-gray-900 font-medium">{viewingService.name}</p>
                </div>

                {/* Cliente */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Cliente</label>
                  <p className="text-gray-900">{viewingService.customer?.fullName || '-'}</p>
                  {viewingService.customer?.email && (
                    <p className="text-sm text-gray-500">{viewingService.customer.email}</p>
                  )}
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Categoria</label>
                  <p className="text-gray-900">{viewingService.category || '-'}</p>
                </div>

                {/* Valor Total */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Valor Total</label>
                  <p className="text-gray-900 font-semibold">{formatCurrency(viewingService.totalValue)}</p>
                </div>

                {/* Data de Início */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Data de Início</label>
                  <p className="text-gray-900">{formatDate(viewingService.startDate)}</p>
                </div>

                {/* Data de Término */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Data de Término</label>
                  <p className="text-gray-900">
                    {viewingService.endDate ? formatDate(viewingService.endDate) : 'Indeterminado'}
                  </p>
                </div>

                {/* Periodicidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Periodicidade</label>
                  <p className="text-gray-900">{viewingService.periodicity}</p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusBadge(viewingService.status)}`}>
                    {viewingService.status}
                  </span>
                </div>

                {/* Progresso */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Progresso</label>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-primary-600 h-3 rounded-full transition-all"
                        style={{ width: `${viewingService.completionPercent}%` }}
                      ></div>
                    </div>
                    <span className="ml-3 text-sm font-semibold text-gray-900">
                      {viewingService.completionPercent}%
                    </span>
                  </div>
                </div>

                {/* Método de Pagamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Método de Pagamento</label>
                  <p className="text-gray-900">{viewingService.paymentMethod || '-'}</p>
                </div>

                {/* Data de Criação */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Data de Criação</label>
                  <p className="text-gray-900">{formatDate(viewingService.createdAt)}</p>
                </div>

                {/* Descrição */}
                {viewingService.description && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Descrição</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingService.description}</p>
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
                    handleEdit(viewingService);
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
