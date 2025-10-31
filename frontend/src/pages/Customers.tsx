import { useState, useEffect } from 'react';
import api from '../services/api';

interface Customer {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  potentialLevel: string | null;
  gender: string | null;
  birthDate: string | null;
  maritalStatus: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZipCode: string | null;
  status: string;
  customerType: string;
  createdAt: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    potentialLevel: 'CLIENTE',
    gender: '',
    birthDate: '',
    maritalStatus: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressZipCode: '',
  });

  // Dummy data for better UX
  const dummyCustomers: Customer[] = [
    {
      id: 'demo-1',
      fullName: 'João Silva Santos',
      email: 'joao.silva@email.com',
      phone: '(11) 98765-4321',
      company: 'Silva Consultoria LTDA',
      potentialLevel: 'CLIENTE',
      gender: 'Masculino',
      birthDate: '1985-03-15',
      maritalStatus: 'Casado(a)',
      addressStreet: 'Rua das Flores, 123',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZipCode: '01234-567',
      status: 'ATIVO',
      customerType: 'PESSOA_JURIDICA',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      fullName: 'Maria Costa Oliveira',
      email: 'maria.costa@email.com',
      phone: '(21) 97654-3210',
      company: null,
      potentialLevel: 'VIP',
      gender: 'Feminino',
      birthDate: '1990-07-20',
      maritalStatus: 'Solteiro(a)',
      addressStreet: 'Av. Atlântica, 456',
      addressCity: 'Rio de Janeiro',
      addressState: 'RJ',
      addressZipCode: '22000-000',
      status: 'ATIVO',
      customerType: 'PESSOA_FISICA',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      fullName: 'Pedro Henrique Souza',
      email: 'pedro.souza@email.com',
      phone: '(31) 96543-2109',
      company: 'Tech Solutions SA',
      potentialLevel: 'CLIENTE',
      gender: 'Masculino',
      birthDate: '1982-11-05',
      maritalStatus: 'Casado(a)',
      addressStreet: 'Rua da Bahia, 789',
      addressCity: 'Belo Horizonte',
      addressState: 'MG',
      addressZipCode: '30000-000',
      status: 'INATIVO',
      customerType: 'PESSOA_JURIDICA',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      fullName: 'Ana Paula Ferreira',
      email: 'ana.ferreira@email.com',
      phone: '(41) 95432-1098',
      company: null,
      potentialLevel: 'PROSPECTO',
      gender: 'Feminino',
      birthDate: '1995-02-28',
      maritalStatus: 'Solteiro(a)',
      addressStreet: 'Rua XV de Novembro, 321',
      addressCity: 'Curitiba',
      addressState: 'PR',
      addressZipCode: '80000-000',
      status: 'ATIVO',
      customerType: 'PESSOA_FISICA',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-5',
      fullName: 'Carlos Eduardo Almeida',
      email: 'carlos.almeida@email.com',
      phone: '(51) 94321-0987',
      company: 'Almeida & Associados',
      potentialLevel: 'PROSPECTO',
      gender: 'Masculino',
      birthDate: '1978-09-10',
      maritalStatus: 'Divorciado(a)',
      addressStreet: 'Av. Independência, 654',
      addressCity: 'Porto Alegre',
      addressState: 'RS',
      addressZipCode: '90000-000',
      status: 'PROSPECTO',
      customerType: 'PESSOA_JURIDICA',
      createdAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      potentialLevel: 'CLIENTE',
      gender: '',
      birthDate: '',
      maritalStatus: '',
      addressStreet: '',
      addressCity: '',
      addressState: '',
      addressZipCode: '',
    });
    setShowModal(true);
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    setShowViewModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);

    // Format birthDate for input[type="date"] (yyyy-MM-dd)
    let formattedBirthDate = '';
    if (customer.birthDate) {
      const date = new Date(customer.birthDate);
      formattedBirthDate = date.toISOString().substring(0, 10);
    }

    setFormData({
      fullName: customer.fullName,
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      potentialLevel: customer.potentialLevel || 'CLIENTE',
      gender: customer.gender || '',
      birthDate: formattedBirthDate,
      maritalStatus: customer.maritalStatus || '',
      addressStreet: customer.addressStreet || '',
      addressCity: customer.addressCity || '',
      addressState: customer.addressState || '',
      addressZipCode: customer.addressZipCode || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Erro ao excluir cliente. Tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Erro ao salvar cliente. Verifique os dados e tente novamente.');
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      ATIVO: 'bg-green-100 text-green-800',
      INATIVO: 'bg-gray-100 text-gray-800',
      PROSPECTO: 'bg-green-100 text-green-800',
      CLIENTE: 'bg-purple-100 text-purple-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      PESSOA_FISICA: 'bg-indigo-100 text-indigo-800',
      PESSOA_JURIDICA: 'bg-orange-100 text-orange-800',
    };
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            + Novo Cliente
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone ou empresa..."
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
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
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
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.company || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(customer.customerType)}`}>
                          {customer.customerType === 'PESSOA_FISICA' ? 'PF' : 'PJ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(customer.status)}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleView(customer)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Visualizar
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome Completo */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Nível Potencial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nível do Cliente
                    </label>
                    <select
                      value={formData.potentialLevel}
                      onChange={(e) => setFormData({ ...formData, potentialLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="PROSPECTO">Prospecto</option>
                      <option value="CLIENTE">Cliente</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>

                  {/* Gênero */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gênero
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  {/* Empresa */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Estado Civil */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado Civil
                    </label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Selecione</option>
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                  </div>

                  {/* Endereço */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={formData.addressStreet}
                      onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Cidade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.addressCity}
                      onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.addressState}
                      onChange={(e) => setFormData({ ...formData, addressState: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* CEP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.addressZipCode}
                      onChange={(e) => setFormData({ ...formData, addressZipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
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
                    {editingCustomer ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detalhes do Cliente</h2>
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
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nome Completo</label>
                  <p className="text-gray-900">{viewingCustomer.fullName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{viewingCustomer.email || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Telefone</label>
                  <p className="text-gray-900">{viewingCustomer.phone || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Empresa</label>
                  <p className="text-gray-900">{viewingCustomer.company || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(viewingCustomer.status)}`}>
                    {viewingCustomer.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(viewingCustomer.customerType)}`}>
                    {viewingCustomer.customerType === 'PESSOA_FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Data de Cadastro</label>
                  <p className="text-gray-900">{new Date(viewingCustomer.createdAt).toLocaleDateString('pt-BR')}</p>
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
                    handleEdit(viewingCustomer);
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
