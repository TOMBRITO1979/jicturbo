import { useState, useEffect } from 'react';
import api from '../services/api';

interface Project {
  id: string;
  name: string;
  internalCode: string | null;
  type: string | null;
  customerId: string;
  customer?: {
    id: string;
    fullName: string;
    email: string;
  };
  responsibleId: string | null;
  startDate: string;
  estimatedEndDate: string | null;
  actualEndDate: string | null;
  status: string;
  completionPercent: number;
  currentStage: string | null;
  priority: string | null;
  description: string | null;
  scope: string | null;
  createdAt: string;
  _count?: {
    tasks: number;
  };
}

interface Customer {
  id: string;
  fullName: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    internalCode: '',
    type: '',
    customerId: '',
    startDate: '',
    estimatedEndDate: '',
    status: 'Em Progresso',
    completionPercent: '0',
    currentStage: '',
    priority: 'Média',
    description: '',
    scope: '',
  });

  // Dummy data for better UX
  const dummyProjects: Project[] = [
    {
      id: 'demo-1',
      name: 'Implementação Sistema ERP',
      internalCode: 'PROJ-2025-001',
      type: 'Implementação',
      customerId: 'demo-customer-1',
      customer: {
        id: 'demo-customer-1',
        fullName: 'João Silva Santos',
        email: 'joao.silva@email.com',
      },
      responsibleId: 'user-1',
      startDate: '2025-01-15T00:00:00',
      estimatedEndDate: '2025-06-30T00:00:00',
      actualEndDate: null,
      status: 'Em Progresso',
      completionPercent: 45,
      currentStage: 'Desenvolvimento',
      priority: 'Alta',
      description: 'Implementação completa do sistema ERP para gestão empresarial',
      scope: 'Módulos: Financeiro, Estoque, Vendas, Compras',
      createdAt: new Date().toISOString(),
      _count: { tasks: 12 },
    },
    {
      id: 'demo-2',
      name: 'Migração Cloud AWS',
      internalCode: 'PROJ-2025-002',
      type: 'Migração',
      customerId: 'demo-customer-2',
      customer: {
        id: 'demo-customer-2',
        fullName: 'Maria Costa Oliveira',
        email: 'maria.costa@email.com',
      },
      responsibleId: 'user-2',
      startDate: '2025-02-01T00:00:00',
      estimatedEndDate: '2025-04-30T00:00:00',
      actualEndDate: null,
      status: 'Em Progresso',
      completionPercent: 70,
      currentStage: 'Testes',
      priority: 'Alta',
      description: 'Migração de infraestrutura on-premise para AWS',
      scope: 'Servidores, Banco de Dados, Storage, Backup',
      createdAt: new Date().toISOString(),
      _count: { tasks: 8 },
    },
    {
      id: 'demo-3',
      name: 'Desenvolvimento App Mobile',
      internalCode: 'PROJ-2025-003',
      type: 'Desenvolvimento',
      customerId: 'demo-customer-3',
      customer: {
        id: 'demo-customer-3',
        fullName: 'Pedro Henrique Souza',
        email: 'pedro.souza@email.com',
      },
      responsibleId: 'user-1',
      startDate: '2025-03-01T00:00:00',
      estimatedEndDate: '2025-07-31T00:00:00',
      actualEndDate: null,
      status: 'Aguardando',
      completionPercent: 15,
      currentStage: 'Planejamento',
      priority: 'Média',
      description: 'Aplicativo mobile para iOS e Android',
      scope: 'React Native, Firebase, Push Notifications',
      createdAt: new Date().toISOString(),
      _count: { tasks: 15 },
    },
    {
      id: 'demo-4',
      name: 'Consultoria Segurança da Informação',
      internalCode: 'PROJ-2025-004',
      type: 'Consultoria',
      customerId: 'demo-customer-4',
      customer: {
        id: 'demo-customer-4',
        fullName: 'Ana Paula Ferreira',
        email: 'ana.ferreira@email.com',
      },
      responsibleId: 'user-2',
      startDate: '2025-01-10T00:00:00',
      estimatedEndDate: '2025-03-31T00:00:00',
      actualEndDate: '2025-03-28T00:00:00',
      status: 'Concluído',
      completionPercent: 100,
      currentStage: 'Entregue',
      priority: 'Alta',
      description: 'Auditoria e implementação de políticas de segurança',
      scope: 'ISO 27001, LGPD, Pentest, Treinamento',
      createdAt: new Date().toISOString(),
      _count: { tasks: 10 },
    },
    {
      id: 'demo-5',
      name: 'Integração API Terceiros',
      internalCode: 'PROJ-2025-005',
      type: 'Integração',
      customerId: 'demo-customer-5',
      customer: {
        id: 'demo-customer-5',
        fullName: 'Carlos Eduardo Almeida',
        email: 'carlos.almeida@email.com',
      },
      responsibleId: 'user-1',
      startDate: '2025-04-01T00:00:00',
      estimatedEndDate: '2025-05-15T00:00:00',
      actualEndDate: null,
      status: 'Pausado',
      completionPercent: 30,
      currentStage: 'Desenvolvimento',
      priority: 'Baixa',
      description: 'Integração com APIs de pagamento e logística',
      scope: 'Stripe, PagSeguro, Correios, Jadlog',
      createdAt: new Date().toISOString(),
      _count: { tasks: 6 },
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
    fetchProjects();
    fetchCustomers();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      const data = response.data.data.projects || response.data.data;

      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
      } else {
        setProjects(dummyProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects(dummyProjects);
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
    setEditingProject(null);
    setFormData({
      name: '',
      internalCode: '',
      type: '',
      customerId: '',
      startDate: '',
      estimatedEndDate: '',
      status: 'Em Progresso',
      completionPercent: '0',
      currentStage: '',
      priority: 'Média',
      description: '',
      scope: '',
    });
    setShowModal(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      internalCode: project.internalCode || '',
      type: project.type || '',
      customerId: project.customerId,
      startDate: project.startDate.substring(0, 10), // Format for date input
      estimatedEndDate: project.estimatedEndDate ? project.estimatedEndDate.substring(0, 10) : '',
      status: project.status,
      completionPercent: String(project.completionPercent),
      currentStage: project.currentStage || '',
      priority: project.priority || 'Média',
      description: project.description || '',
      scope: project.scope || '',
    });
    setShowModal(true);
  };

  const handleView = (project: Project) => {
    setViewingProject(project);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) return;

    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Erro ao excluir projeto. Tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        completionPercent: parseInt(formData.completionPercent),
      };

      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, submitData);
      } else {
        await api.post('/projects', submitData);
      }
      setShowModal(false);
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Erro ao salvar projeto. Verifique os dados e tente novamente.');
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.internalCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      'Em Progresso': 'bg-green-100 text-green-800',
      'Aguardando': 'bg-yellow-100 text-yellow-800',
      'Pausado': 'bg-orange-100 text-orange-800',
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            + Novo Projeto
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nome, cliente, tipo ou código..."
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
          <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projeto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progresso
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
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhum projeto encontrado
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {project.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {project.internalCode || '-'} • {project.type || 'Sem tipo'}
                        </div>
                        {project._count && (
                          <div className="text-xs text-gray-400 mt-1">
                            {project._count.tasks} tarefa(s)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {project.customer?.fullName || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(project.startDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          até {formatDate(project.estimatedEndDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${project.completionPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-700">
                            {project.completionPercent}%
                          </span>
                        </div>
                        {project.priority && (
                          <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${getPriorityBadge(project.priority)}`}>
                            {project.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(project.status)}`}>
                          {project.status}
                        </span>
                        {project.currentStage && (
                          <div className="text-xs text-gray-500 mt-1">
                            {project.currentStage}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleView(project)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Visualizar
                        </button>
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
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
                {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Projeto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Código Interno */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Interno
                    </label>
                    <input
                      type="text"
                      value={formData.internalCode}
                      onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="PROJ-2025-001"
                    />
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="Implementação, Consultoria, etc."
                    />
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

                  {/* Data Início */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Início *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Data Estimada de Conclusão */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Estimada de Conclusão
                    </label>
                    <input
                      type="date"
                      value={formData.estimatedEndDate}
                      onChange={(e) => setFormData({ ...formData, estimatedEndDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
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
                      <option value="Em Progresso">Em Progresso</option>
                      <option value="Aguardando">Aguardando</option>
                      <option value="Pausado">Pausado</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  {/* Etapa Atual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etapa Atual
                    </label>
                    <input
                      type="text"
                      value={formData.currentStage}
                      onChange={(e) => setFormData({ ...formData, currentStage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="Planejamento, Desenvolvimento, Testes..."
                    />
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
                      placeholder="Descreva o projeto..."
                    />
                  </div>

                  {/* Escopo */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Escopo
                    </label>
                    <textarea
                      rows={2}
                      value={formData.scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder="Defina o escopo do projeto..."
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
                    {editingProject ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detalhes do Projeto</h2>
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
                {/* Nome */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nome do Projeto</label>
                  <p className="text-gray-900 font-medium text-lg">{viewingProject.name}</p>
                </div>

                {/* Código Interno */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Código Interno</label>
                  <p className="text-gray-900">{viewingProject.internalCode || '-'}</p>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
                  <p className="text-gray-900">{viewingProject.type || '-'}</p>
                </div>

                {/* Cliente */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Cliente</label>
                  <p className="text-gray-900">{viewingProject.customer?.fullName || '-'}</p>
                  {viewingProject.customer?.email && (
                    <p className="text-sm text-gray-500">{viewingProject.customer.email}</p>
                  )}
                </div>

                {/* Data Início */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Data Início</label>
                  <p className="text-gray-900">{formatDate(viewingProject.startDate)}</p>
                </div>

                {/* Data Estimada */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Data Estimada de Conclusão</label>
                  <p className="text-gray-900">{formatDate(viewingProject.estimatedEndDate)}</p>
                </div>

                {/* Data Conclusão Real */}
                {viewingProject.actualEndDate && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Data de Conclusão Real</label>
                    <p className="text-gray-900">{formatDate(viewingProject.actualEndDate)}</p>
                  </div>
                )}

                {/* Status e Etapa */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusBadge(viewingProject.status)}`}>
                    {viewingProject.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Etapa Atual</label>
                  <p className="text-gray-900">{viewingProject.currentStage || '-'}</p>
                </div>

                {/* Progresso */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Progresso</label>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                      <div
                        className="bg-primary-600 h-3 rounded-full"
                        style={{ width: `${viewingProject.completionPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-900 font-medium">{viewingProject.completionPercent}%</span>
                  </div>
                </div>

                {/* Prioridade */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Prioridade</label>
                  {viewingProject.priority && (
                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${getPriorityBadge(viewingProject.priority)}`}>
                      {viewingProject.priority}
                    </span>
                  )}
                </div>

                {/* Tarefas */}
                {viewingProject._count && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Tarefas</label>
                    <p className="text-gray-900">{viewingProject._count.tasks} tarefa(s)</p>
                  </div>
                )}

                {/* Descrição */}
                {viewingProject.description && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Descrição</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingProject.description}</p>
                  </div>
                )}

                {/* Escopo */}
                {viewingProject.scope && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Escopo</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingProject.scope}</p>
                  </div>
                )}

                {/* Data de Criação */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Data de Criação</label>
                  <p className="text-gray-900">{formatDate(viewingProject.createdAt)}</p>
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
                    handleEdit(viewingProject);
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
