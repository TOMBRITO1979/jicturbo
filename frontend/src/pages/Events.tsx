import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Event {
  id: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  location: string | null;
  customerId: string | null;
  customer?: {
    id: string;
    fullName: string;
    email: string;
  };
  description: string | null;
  priority: string | null;
  status: string;
  responsibleId: string | null;
  createdAt: string;
}

interface Customer {
  id: string;
  fullName: string;
}

export default function Events() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'Reunião',
    startDate: '',
    endDate: '',
    location: '',
    customerId: '',
    description: '',
    priority: 'Média',
    status: 'Agendado',
  });

  // Dummy data for better UX
  const dummyEvents: Event[] = [
    {
      id: 'demo-1',
      title: 'Reunião com Cliente - Projeto X',
      type: 'Reunião',
      startDate: '2025-10-24T10:00:00',
      endDate: '2025-10-24T11:00:00',
      location: 'Sala de Reuniões 1',
      customerId: 'demo-customer-1',
      customer: {
        id: 'demo-customer-1',
        fullName: 'João Silva Santos',
        email: 'joao.silva@email.com',
      },
      description: 'Apresentação da proposta comercial para o novo projeto de consultoria',
      priority: 'Alta',
      status: 'Agendado',
      responsibleId: 'user-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      title: 'Telefonema - Follow-up Proposta',
      type: 'Telefonema',
      startDate: '2025-10-24T14:30:00',
      endDate: '2025-10-24T15:00:00',
      location: null,
      customerId: 'demo-customer-2',
      customer: {
        id: 'demo-customer-2',
        fullName: 'Maria Costa Oliveira',
        email: 'maria.costa@email.com',
      },
      description: 'Ligar para verificar interesse na proposta enviada',
      priority: 'Média',
      status: 'Agendado',
      responsibleId: 'user-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      title: 'Treinamento Equipe - Sistema Novo',
      type: 'Tarefa',
      startDate: '2025-10-25T09:00:00',
      endDate: '2025-10-25T12:00:00',
      location: 'Sala de Treinamento',
      customerId: 'demo-customer-3',
      customer: {
        id: 'demo-customer-3',
        fullName: 'Pedro Henrique Souza',
        email: 'pedro.souza@email.com',
      },
      description: 'Treinamento da equipe do cliente no novo sistema implementado',
      priority: 'Alta',
      status: 'Em Andamento',
      responsibleId: 'user-2',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      title: 'Lembrete - Renovação Contrato',
      type: 'Lembrete',
      startDate: '2025-10-28T08:00:00',
      endDate: '2025-10-28T08:15:00',
      location: null,
      customerId: 'demo-customer-4',
      customer: {
        id: 'demo-customer-4',
        fullName: 'Ana Paula Ferreira',
        email: 'ana.ferreira@email.com',
      },
      description: 'Lembrar de enviar proposta de renovação de contrato',
      priority: 'Média',
      status: 'Agendado',
      responsibleId: 'user-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-5',
      title: 'Reunião de Revisão - Sprint',
      type: 'Reunião',
      startDate: '2025-10-23T16:00:00',
      endDate: '2025-10-23T17:00:00',
      location: 'Online - Zoom',
      customerId: 'demo-customer-5',
      customer: {
        id: 'demo-customer-5',
        fullName: 'Carlos Eduardo Almeida',
        email: 'carlos.almeida@email.com',
      },
      description: 'Revisão do progresso da sprint com equipe do cliente',
      priority: 'Baixa',
      status: 'Concluído',
      responsibleId: 'user-2',
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
    fetchEvents();
    fetchCustomers();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      const data = response.data.data.events || response.data.data;

      if (Array.isArray(data) && data.length > 0) {
        setEvents(data);
      } else {
        setEvents(dummyEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents(dummyEvents);
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
    setEditingEvent(null);
    setFormData({
      title: '',
      type: 'Reunião',
      startDate: '',
      endDate: '',
      location: '',
      customerId: '',
      description: '',
      priority: 'Média',
      status: 'Agendado',
    });
    setShowModal(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      startDate: event.startDate.substring(0, 16), // Format for datetime-local
      endDate: event.endDate.substring(0, 16),
      location: event.location || '',
      customerId: event.customerId || '',
      description: event.description || '',
      priority: event.priority || 'Média',
      status: event.status,
    });
    setShowModal(true);
  };

  const handleView = (event: Event) => {
    setViewingEvent(event);
    setShowViewModal(true);
  };

  const exportToCSV = () => {
    if (events.length === 0) {
      alert('Não há eventos para exportar.');
      return;
    }

    // Define CSV headers
    const headers = [
      'Título', 'Tipo', 'Data Início', 'Data Fim', 'Local', 'Cliente',
      'Descrição', 'Prioridade', 'Status'
    ];

    // Convert events to CSV rows
    const rows = events.map(event => [
      event.title || '',
      event.type || '',
      event.startDate || '',
      event.endDate || '',
      event.location || '',
      event.customerId || '',
      event.description || '',
      event.priority || '',
      event.status || ''
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `eventos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (events.length === 0) {
      alert('Não há eventos para exportar.');
      return;
    }

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Lista de Eventos Agendados', 14, 22);

    // Add date
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

    // Prepare table data
    const tableData = events.map(event => [
      event.title,
      event.type,
      new Date(event.startDate).toLocaleDateString('pt-BR'),
      new Date(event.endDate).toLocaleDateString('pt-BR'),
      event.location || '-',
      event.priority || '-',
      event.status
    ]);

    // Add table
    (doc as any).autoTable({
      startY: 35,
      head: [['Título', 'Tipo', 'Início', 'Fim', 'Local', 'Prioridade', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }, // Green color #16a34a
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 20 },
        2: { cellWidth: 22 },
        3: { cellWidth: 22 },
        4: { cellWidth: 30 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 }
      }
    });

    // Save PDF
    doc.save(`eventos_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Erro ao excluir evento. Tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: any = { ...formData };

    // Add tenantId for SUPER_ADMIN or use user's tenantId
    if (user) {
      if (user.role === 'SUPER_ADMIN' && !user.tenantId) {
        // Use default tenant for SUPER_ADMIN
        submitData.tenantId = 'a5533f0a-9356-485e-9ec9-d743d9884ace';
      } else if (user.tenantId) {
        submitData.tenantId = user.tenantId;
      }
    }

    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, submitData);
      } else {
        await api.post('/events', submitData);
      }
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Erro ao salvar evento. Verifique os dados e tente novamente.');
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      'Agendado': 'bg-green-100 text-green-800',
      'Em Andamento': 'bg-yellow-100 text-yellow-800',
      'Concluído': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      'Alta': 'bg-red-100 text-red-800',
      'Média': 'bg-yellow-100 text-yellow-800',
      'Baixa': 'bg-green-100 text-green-800',
    };
    return styles[priority as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Eventos</h1>

        {/* Action Buttons - Above Search */}
        <div className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <button
              onClick={exportToCSV}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Exportar CSV
            </button>
            <button
              onClick={exportToPDF}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              Exportar PDF
            </button>
            <button
              onClick={handleCreate}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-[#16a34a] text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Novo Evento
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por título, cliente, tipo ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-x-auto overflow-y-auto max-h-[600px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridade
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
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Nenhum evento encontrado
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {event.customer?.fullName || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateTime(event.startDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          até {formatDateTime(event.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {event.location || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.priority && (
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(event.priority)}`}>
                            {event.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleView(event)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Visualizar
                        </button>
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Título */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Reunião">Reunião</option>
                      <option value="Tarefa">Tarefa</option>
                      <option value="Lembrete">Lembrete</option>
                      <option value="Telefonema">Telefonema</option>
                    </select>
                  </div>

                  {/* Cliente */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente
                    </label>
                    <select
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

                  {/* Data/Hora Início */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data/Hora Início *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Data/Hora Fim */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data/Hora Fim *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Local */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Local
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="Sala de reuniões, endereço, link online..."
                    />
                  </div>

                  {/* Prioridade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Agendado">Agendado</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
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
                      placeholder="Detalhes sobre o evento..."
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
                    {editingEvent ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detalhes do Evento</h2>
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
                {/* Título */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Título</label>
                  <p className="text-gray-900 font-medium">{viewingEvent.title}</p>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
                  <p className="text-gray-900">{viewingEvent.type}</p>
                </div>

                {/* Cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Cliente</label>
                  <p className="text-gray-900">{viewingEvent.customer?.fullName || '-'}</p>
                  {viewingEvent.customer?.email && (
                    <p className="text-sm text-gray-500">{viewingEvent.customer.email}</p>
                  )}
                </div>

                {/* Data/Hora Início */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Data/Hora Início</label>
                  <p className="text-gray-900">{formatDateTime(viewingEvent.startDate)}</p>
                </div>

                {/* Data/Hora Fim */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Data/Hora Fim</label>
                  <p className="text-gray-900">{formatDateTime(viewingEvent.endDate)}</p>
                </div>

                {/* Local */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Local</label>
                  <p className="text-gray-900">{viewingEvent.location || '-'}</p>
                </div>

                {/* Prioridade */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Prioridade</label>
                  {viewingEvent.priority && (
                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${getPriorityBadge(viewingEvent.priority)}`}>
                      {viewingEvent.priority}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusBadge(viewingEvent.status)}`}>
                    {viewingEvent.status}
                  </span>
                </div>

                {/* Descrição */}
                {viewingEvent.description && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Descrição</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingEvent.description}</p>
                  </div>
                )}

                {/* Data de Criação */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Data de Criação</label>
                  <p className="text-gray-900">{formatDateTime(viewingEvent.createdAt)}</p>
                </div>
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
                    handleEdit(viewingEvent);
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
