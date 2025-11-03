import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Customer {
  id: string;
  // 1. Informações Pessoais
  fullName: string;
  gender: string | null;
  birthDate: string | null;
  maritalStatus: string | null;
  nationality: string | null;

  // 2. Informações de Contato
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZipCode: string | null;
  socialLinks: any;

  // 3. Informações Profissionais
  jobTitle: string | null;
  company: string | null;
  marketSegment: string | null;
  acquisitionSource: string | null;

  // 4. Histórico
  firstContactDate: string;
  lastInteractionDate: string | null;
  purchaseHistory: any;
  feedback: any;
  supportHistory: any;

  // 5. Preferências
  preferredChannel: string | null;
  contactFrequency: string | null;
  interestedInPromotions: boolean;
  productPreferences: any;

  // 6. Status
  potentialLevel: string | null;
  satisfactionLevel: number | null;
  loyaltyScore: number | null;
  riskScore: number | null;

  // 7. Campanhas
  participatedCampaigns: any;
  newProductInterest: boolean;
  engagementStatus: string | null;

  // 8. Notas Internas
  internalNotes: string | null;
  assignedToId: string | null;
  importantDates: any;

  createdAt: string;
  updatedAt: string;
}

export default function Customers() {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  const [formData, setFormData] = useState({
    // 1. Informações Pessoais
    fullName: '',
    gender: '',
    birthDate: '',
    maritalStatus: '',
    nationality: '',

    // 2. Informações de Contato
    email: '',
    phone: '',
    whatsapp: '',
    addressStreet: '',
    addressNumber: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    addressZipCode: '',
    socialLinks: '',

    // 3. Informações Profissionais
    jobTitle: '',
    company: '',
    marketSegment: '',
    acquisitionSource: '',

    // 4. Histórico
    lastInteractionDate: '',
    purchaseHistory: '',
    feedback: '',
    supportHistory: '',

    // 5. Preferências
    preferredChannel: '',
    contactFrequency: '',
    interestedInPromotions: true,
    productPreferences: '',

    // 6. Status
    potentialLevel: 'Potencial',
    satisfactionLevel: '',
    loyaltyScore: '',
    riskScore: '',

    // 7. Campanhas
    participatedCampaigns: '',
    newProductInterest: false,
    engagementStatus: '',

    // 8. Notas Internas
    internalNotes: '',
    assignedToId: '',
    importantDates: '',
  });

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
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setFormData({
      fullName: '',
      gender: '',
      birthDate: '',
      maritalStatus: '',
      nationality: '',
      email: '',
      phone: '',
      whatsapp: '',
      addressStreet: '',
      addressNumber: '',
      addressNeighborhood: '',
      addressCity: '',
      addressState: '',
      addressZipCode: '',
      socialLinks: '',
      jobTitle: '',
      company: '',
      marketSegment: '',
      acquisitionSource: '',
      lastInteractionDate: '',
      purchaseHistory: '',
      feedback: '',
      supportHistory: '',
      preferredChannel: '',
      contactFrequency: '',
      interestedInPromotions: true,
      productPreferences: '',
      potentialLevel: 'Potencial',
      satisfactionLevel: '',
      loyaltyScore: '',
      riskScore: '',
      participatedCampaigns: '',
      newProductInterest: false,
      engagementStatus: '',
      internalNotes: '',
      assignedToId: '',
      importantDates: '',
    });
    setActiveTab('personal');
    setShowModal(true);
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    setShowViewModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);

    // Format dates for input[type="date"]
    const formatDate = (date: string | null) => {
      if (!date) return '';
      return new Date(date).toISOString().substring(0, 10);
    };

    // Parse JSON fields
    const parseJsonField = (field: any) => {
      if (!field) return '';
      if (typeof field === 'string') return field;
      return JSON.stringify(field, null, 2);
    };

    setFormData({
      fullName: customer.fullName || '',
      gender: customer.gender || '',
      birthDate: formatDate(customer.birthDate),
      maritalStatus: customer.maritalStatus || '',
      nationality: customer.nationality || '',
      email: customer.email || '',
      phone: customer.phone || '',
      whatsapp: customer.whatsapp || '',
      addressStreet: customer.addressStreet || '',
      addressNumber: customer.addressNumber || '',
      addressNeighborhood: customer.addressNeighborhood || '',
      addressCity: customer.addressCity || '',
      addressState: customer.addressState || '',
      addressZipCode: customer.addressZipCode || '',
      socialLinks: parseJsonField(customer.socialLinks),
      jobTitle: customer.jobTitle || '',
      company: customer.company || '',
      marketSegment: customer.marketSegment || '',
      acquisitionSource: customer.acquisitionSource || '',
      lastInteractionDate: formatDate(customer.lastInteractionDate),
      purchaseHistory: parseJsonField(customer.purchaseHistory),
      feedback: parseJsonField(customer.feedback),
      supportHistory: parseJsonField(customer.supportHistory),
      preferredChannel: customer.preferredChannel || '',
      contactFrequency: customer.contactFrequency || '',
      interestedInPromotions: customer.interestedInPromotions ?? true,
      productPreferences: parseJsonField(customer.productPreferences),
      potentialLevel: customer.potentialLevel || 'Potencial',
      satisfactionLevel: customer.satisfactionLevel?.toString() || '',
      loyaltyScore: customer.loyaltyScore?.toString() || '',
      riskScore: customer.riskScore?.toString() || '',
      participatedCampaigns: parseJsonField(customer.participatedCampaigns),
      newProductInterest: customer.newProductInterest ?? false,
      engagementStatus: customer.engagementStatus || '',
      internalNotes: customer.internalNotes || '',
      assignedToId: customer.assignedToId || '',
      importantDates: parseJsonField(customer.importantDates),
    });
    setActiveTab('personal');
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

  const exportToCSV = () => {
    if (customers.length === 0) {
      alert('Não há clientes para exportar.');
      return;
    }

    // Define CSV headers
    const headers = [
      'Nome Completo', 'Gênero', 'Data Nascimento', 'Estado Civil', 'Nacionalidade',
      'Email', 'Telefone', 'WhatsApp', 'Endereço', 'Número', 'Bairro', 'Cidade', 'Estado', 'CEP',
      'Cargo', 'Empresa', 'Segmento', 'Fonte Aquisição',
      'Data Primeiro Contato', 'Última Interação',
      'Canal Preferido', 'Frequência Contato', 'Interessado em Promoções',
      'Nível Potencial', 'Nível Satisfação', 'Score Lealdade', 'Score Risco',
      'Interesse Novos Produtos', 'Status Engajamento',
      'Notas Internas', 'Responsável'
    ];

    // Convert customers to CSV rows
    const rows = customers.map(customer => [
      customer.fullName || '',
      customer.gender || '',
      customer.birthDate || '',
      customer.maritalStatus || '',
      customer.nationality || '',
      customer.email || '',
      customer.phone || '',
      customer.whatsapp || '',
      customer.addressStreet || '',
      customer.addressNumber || '',
      customer.addressNeighborhood || '',
      customer.addressCity || '',
      customer.addressState || '',
      customer.addressZipCode || '',
      customer.jobTitle || '',
      customer.company || '',
      customer.marketSegment || '',
      customer.acquisitionSource || '',
      customer.firstContactDate || '',
      customer.lastInteractionDate || '',
      customer.preferredChannel || '',
      customer.contactFrequency || '',
      customer.interestedInPromotions ? 'Sim' : 'Não',
      customer.potentialLevel || '',
      customer.satisfactionLevel?.toString() || '',
      customer.loyaltyScore?.toString() || '',
      customer.riskScore?.toString() || '',
      customer.newProductInterest ? 'Sim' : 'Não',
      customer.engagementStatus || '',
      customer.internalNotes || '',
      customer.assignedToId || ''
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
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          alert('Arquivo CSV vazio ou inválido.');
          return;
        }

        // Skip header (first line)
        const dataLines = lines.slice(1);

        // Parse CSV data
        const parsedCustomers = dataLines.map(line => {
          // Simple CSV parser - handles quoted values
          const values: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          // Map CSV values to customer object
          return {
            fullName: values[0] || '',
            gender: values[1] || null,
            birthDate: values[2] || null,
            maritalStatus: values[3] || null,
            nationality: values[4] || null,
            email: values[5] || null,
            phone: values[6] || null,
            whatsapp: values[7] || null,
            addressStreet: values[8] || null,
            addressNumber: values[9] || null,
            addressNeighborhood: values[10] || null,
            addressCity: values[11] || null,
            addressState: values[12] || null,
            addressZipCode: values[13] || null,
            jobTitle: values[14] || null,
            company: values[15] || null,
            marketSegment: values[16] || null,
            acquisitionSource: values[17] || null,
            // Skip firstContactDate (auto-generated)
            lastInteractionDate: values[19] || null,
            preferredChannel: values[20] || null,
            contactFrequency: values[21] || null,
            interestedInPromotions: values[22] === 'Sim',
            potentialLevel: values[23] || null,
            satisfactionLevel: values[24] ? parseInt(values[24]) : null,
            loyaltyScore: values[25] ? parseInt(values[25]) : null,
            riskScore: values[26] ? parseInt(values[26]) : null,
            newProductInterest: values[27] === 'Sim',
            engagementStatus: values[28] || null,
            internalNotes: values[29] || null,
            assignedToId: values[30] || null,
          };
        });

        // Send to backend
        const importData: any = {
          customers: parsedCustomers,
        };

        // Add tenantId for SUPER_ADMIN or use user's tenantId
        if (user) {
          if (user.role === 'SUPER_ADMIN' && !user.tenantId) {
            importData.tenantId = 'a5533f0a-9356-485e-9ec9-d743d9884ace';
          } else if (user.tenantId) {
            importData.tenantId = user.tenantId;
          }
        }

        const response = await api.post('/customers/import', importData);

        const result = response.data.data;
        alert(`Importação concluída!\n✅ ${result.success} clientes importados\n❌ ${result.failed} falharam`);

        // Show detailed errors if any
        if (result.errors.length > 0 && result.errors.length <= 5) {
          const errorDetails = result.errors.map((err: any) =>
            `Linha ${err.row}: ${err.error}`
          ).join('\n');
          console.log('Erros de importação:', errorDetails);
        }

        // Refresh customer list
        fetchCustomers();

        // Reset file input
        event.target.value = '';
      } catch (error: any) {
        console.error('Error importing CSV:', error);
        alert('Erro ao importar CSV. Verifique o formato do arquivo e tente novamente.');
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Parse JSON fields
      const parseJson = (str: string) => {
        if (!str || str.trim() === '') return null;
        try {
          return JSON.parse(str);
        } catch {
          return str; // Return as string if not valid JSON
        }
      };

      // Prepare data
      const submitData: any = {
        fullName: formData.fullName,
        gender: formData.gender || null,
        birthDate: formData.birthDate || null,
        maritalStatus: formData.maritalStatus || null,
        nationality: formData.nationality || null,
        email: formData.email || null,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        addressStreet: formData.addressStreet || null,
        addressNumber: formData.addressNumber || null,
        addressNeighborhood: formData.addressNeighborhood || null,
        addressCity: formData.addressCity || null,
        addressState: formData.addressState || null,
        addressZipCode: formData.addressZipCode || null,
        socialLinks: parseJson(formData.socialLinks),
        jobTitle: formData.jobTitle || null,
        company: formData.company || null,
        marketSegment: formData.marketSegment || null,
        acquisitionSource: formData.acquisitionSource || null,
        lastInteractionDate: formData.lastInteractionDate || null,
        purchaseHistory: parseJson(formData.purchaseHistory),
        feedback: parseJson(formData.feedback),
        supportHistory: parseJson(formData.supportHistory),
        preferredChannel: formData.preferredChannel || null,
        contactFrequency: formData.contactFrequency || null,
        interestedInPromotions: formData.interestedInPromotions,
        productPreferences: parseJson(formData.productPreferences),
        potentialLevel: formData.potentialLevel || null,
        satisfactionLevel: formData.satisfactionLevel ? parseInt(formData.satisfactionLevel) : null,
        loyaltyScore: formData.loyaltyScore ? parseInt(formData.loyaltyScore) : null,
        riskScore: formData.riskScore ? parseInt(formData.riskScore) : null,
        participatedCampaigns: parseJson(formData.participatedCampaigns),
        newProductInterest: formData.newProductInterest,
        engagementStatus: formData.engagementStatus || null,
        internalNotes: formData.internalNotes || null,
        assignedToId: formData.assignedToId || null,
        importantDates: parseJson(formData.importantDates),
      };

      // Add tenantId for SUPER_ADMIN or use user's tenantId
      if (user) {
        if (user.role === 'SUPER_ADMIN' && !user.tenantId) {
          // Use default tenant for SUPER_ADMIN
          submitData.tenantId = 'a5533f0a-9356-485e-9ec9-d743d9884ace';
        } else if (user.tenantId) {
          submitData.tenantId = user.tenantId;
        }
      }

      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, submitData);
      } else {
        await api.post('/customers', submitData);
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

  const getPotentialBadge = (level: string | null) => {
    const styles: Record<string, string> = {
      'Potencial': 'bg-yellow-100 text-yellow-800',
      'Ativo': 'bg-green-100 text-green-800',
      'Inativo': 'bg-gray-100 text-gray-800',
      'Perdido': 'bg-red-100 text-red-800',
      'VIP': 'bg-purple-100 text-purple-800',
    };
    return styles[level || 'Potencial'] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'personal', label: '👤 Pessoais' },
    { id: 'contact', label: '📞 Contato' },
    { id: 'professional', label: '💼 Profissionais' },
    { id: 'preferences', label: '⚙️ Preferências' },
    { id: 'status', label: '📊 Status' },
    { id: 'campaigns', label: '📢 Campanhas' },
    { id: 'history', label: '📝 Histórico' },
    { id: 'notes', label: '📋 Notas' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <div className="flex gap-3">
            <input
              type="file"
              id="csv-upload"
              accept=".csv"
              onChange={handleImportCSV}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => document.getElementById('csv-upload')?.click()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Importar CSV
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Exportar CSV
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-[#16a34a] text-white rounded-md hover:bg-green-700 transition-colors"
            >
              + Novo Cliente
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
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
                    Empresa/Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nível
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
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
                        {customer.nationality && (
                          <div className="text-xs text-gray-500">{customer.nationality}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email || '-'}</div>
                        <div className="text-sm text-gray-500">{customer.phone || customer.whatsapp || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.company || '-'}</div>
                        <div className="text-xs text-gray-500">{customer.jobTitle || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPotentialBadge(customer.potentialLevel)}`}>
                          {customer.potentialLevel || 'Potencial'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleView(customer)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Ver
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>

              {/* Tabs */}
              <div className="flex space-x-2 mb-6 overflow-x-auto border-b">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#16a34a] text-[#16a34a]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Tab Content */}

                {/* 1. Informações Pessoais */}
                {activeTab === 'personal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="">Selecione</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                      <select
                        value={formData.maritalStatus}
                        onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="">Selecione</option>
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="Viúvo(a)">Viúvo(a)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidade</label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Informações de Contato */}
                {activeTab === 'contact' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                      <input
                        type="text"
                        value={formData.addressZipCode}
                        onChange={(e) => setFormData({ ...formData, addressZipCode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (Rua)</label>
                      <input
                        type="text"
                        value={formData.addressStreet}
                        onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                      <input
                        type="text"
                        value={formData.addressNumber}
                        onChange={(e) => setFormData({ ...formData, addressNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                      <input
                        type="text"
                        value={formData.addressNeighborhood}
                        onChange={(e) => setFormData({ ...formData, addressNeighborhood: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        value={formData.addressCity}
                        onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <input
                        type="text"
                        value={formData.addressState}
                        onChange={(e) => setFormData({ ...formData, addressState: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Redes Sociais
                      </label>
                      <textarea
                        rows={3}
                        value={formData.socialLinks}
                        onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                        placeholder="Links das redes sociais (Facebook, Instagram, LinkedIn, etc.)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Informações Profissionais */}
                {activeTab === 'professional' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cargo/Profissão</label>
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Segmento de Mercado</label>
                      <input
                        type="text"
                        value={formData.marketSegment}
                        onChange={(e) => setFormData({ ...formData, marketSegment: e.target.value })}
                        placeholder="Ex: Tecnologia, Varejo, Consultoria"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fonte de Aquisição</label>
                      <select
                        value={formData.acquisitionSource}
                        onChange={(e) => setFormData({ ...formData, acquisitionSource: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="">Selecione</option>
                        <option value="Referência">Referência</option>
                        <option value="Marketing Digital">Marketing Digital</option>
                        <option value="Redes Sociais">Redes Sociais</option>
                        <option value="Publicidade">Publicidade</option>
                        <option value="Evento">Evento</option>
                        <option value="Indicação">Indicação</option>
                        <option value="Site">Site</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 4. Preferências de Comunicação */}
                {activeTab === 'preferences' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Canal Preferido de Contato</label>
                      <select
                        value={formData.preferredChannel}
                        onChange={(e) => setFormData({ ...formData, preferredChannel: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="">Selecione</option>
                        <option value="Email">Email</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Telefone">Telefone</option>
                        <option value="SMS">SMS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequência de Contato</label>
                      <select
                        value={formData.contactFrequency}
                        onChange={(e) => setFormData({ ...formData, contactFrequency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="">Selecione</option>
                        <option value="Diária">Diária</option>
                        <option value="Semanal">Semanal</option>
                        <option value="Quinzenal">Quinzenal</option>
                        <option value="Mensal">Mensal</option>
                        <option value="Sob Demanda">Sob Demanda</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.interestedInPromotions}
                          onChange={(e) => setFormData({ ...formData, interestedInPromotions: e.target.checked })}
                          className="rounded border-gray-300 text-[#16a34a] focus:ring-[#16a34a]"
                        />
                        <span className="text-sm font-medium text-gray-700">Interessado em receber promoções</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferências de Produtos/Serviços
                      </label>
                      <textarea
                        rows={3}
                        value={formData.productPreferences}
                        onChange={(e) => setFormData({ ...formData, productPreferences: e.target.value })}
                        placeholder="Descreva as preferências e interesses do cliente..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Status do Cliente */}
                {activeTab === 'status' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nível Potencial</label>
                      <select
                        value={formData.potentialLevel}
                        onChange={(e) => setFormData({ ...formData, potentialLevel: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="Potencial">Potencial</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Perdido">Perdido</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Satisfação (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={formData.satisfactionLevel}
                        onChange={(e) => setFormData({ ...formData, satisfactionLevel: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pontuação de Fidelidade (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.loyaltyScore}
                        onChange={(e) => setFormData({ ...formData, loyaltyScore: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pontuação de Risco (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.riskScore}
                        onChange={(e) => setFormData({ ...formData, riskScore: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                      <p className="text-xs text-gray-500 mt-1">Risco de inadimplência ou churn</p>
                    </div>
                  </div>
                )}

                {/* 6. Campanhas e Marketing */}
                {activeTab === 'campaigns' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Campanhas Participadas
                      </label>
                      <textarea
                        rows={3}
                        value={formData.participatedCampaigns}
                        onChange={(e) => setFormData({ ...formData, participatedCampaigns: e.target.value })}
                        placeholder="Liste as campanhas que o cliente participou..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.newProductInterest}
                          onChange={(e) => setFormData({ ...formData, newProductInterest: e.target.checked })}
                          className="rounded border-gray-300 text-[#16a34a] focus:ring-[#16a34a]"
                        />
                        <span className="text-sm font-medium text-gray-700">Interesse em novos produtos</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status de Engajamento</label>
                      <select
                        value={formData.engagementStatus}
                        onChange={(e) => setFormData({ ...formData, engagementStatus: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      >
                        <option value="">Selecione</option>
                        <option value="Alto">Alto</option>
                        <option value="Médio">Médio</option>
                        <option value="Baixo">Baixo</option>
                        <option value="Nenhum">Nenhum</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 7. Histórico */}
                {activeTab === 'history' && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Última Interação</label>
                      <input
                        type="date"
                        value={formData.lastInteractionDate}
                        onChange={(e) => setFormData({ ...formData, lastInteractionDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Histórico de Compras
                      </label>
                      <textarea
                        rows={4}
                        value={formData.purchaseHistory}
                        onChange={(e) => setFormData({ ...formData, purchaseHistory: e.target.value })}
                        placeholder="Descreva o histórico de compras do cliente (produtos, datas, valores)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Feedback do Cliente
                      </label>
                      <textarea
                        rows={4}
                        value={formData.feedback}
                        onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                        placeholder="Comentários, avaliações e sugestões do cliente..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Histórico de Suporte
                      </label>
                      <textarea
                        rows={4}
                        value={formData.supportHistory}
                        onChange={(e) => setFormData({ ...formData, supportHistory: e.target.value })}
                        placeholder="Descreva o histórico de chamados e atendimentos ao cliente..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>
                  </div>
                )}

                {/* 8. Notas Internas */}
                {activeTab === 'notes' && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notas Internas</label>
                      <textarea
                        rows={6}
                        value={formData.internalNotes}
                        onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                        placeholder="Observações e informações relevantes sobre o cliente..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID do Responsável</label>
                      <input
                        type="text"
                        value={formData.assignedToId}
                        onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                        placeholder="ID do usuário responsável pelo atendimento"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Datas Importantes
                      </label>
                      <textarea
                        rows={4}
                        value={formData.importantDates}
                        onChange={(e) => setFormData({ ...formData, importantDates: e.target.value })}
                        placeholder="Aniversários, datas comemorativas e outros eventos importantes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16a34a]"
                      />
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#16a34a] text-white rounded-md hover:bg-green-700"
                  >
                    {editingCustomer ? 'Salvar Alterações' : 'Criar Cliente'}
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

              <div className="space-y-6">
                {/* Informações Pessoais */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#16a34a]">👤 Informações Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Nome Completo</label>
                      <p className="text-gray-900">{viewingCustomer.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Gênero</label>
                      <p className="text-gray-900">{viewingCustomer.gender || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Data de Nascimento</label>
                      <p className="text-gray-900">
                        {viewingCustomer.birthDate ? new Date(viewingCustomer.birthDate).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Estado Civil</label>
                      <p className="text-gray-900">{viewingCustomer.maritalStatus || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Nacionalidade</label>
                      <p className="text-gray-900">{viewingCustomer.nationality || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Informações de Contato */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#16a34a]">📞 Informações de Contato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                      <p className="text-gray-900">{viewingCustomer.email || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Telefone</label>
                      <p className="text-gray-900">{viewingCustomer.phone || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">WhatsApp</label>
                      <p className="text-gray-900">{viewingCustomer.whatsapp || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Endereço</label>
                      <p className="text-gray-900">
                        {[
                          viewingCustomer.addressStreet,
                          viewingCustomer.addressNumber,
                          viewingCustomer.addressNeighborhood,
                          viewingCustomer.addressCity,
                          viewingCustomer.addressState,
                          viewingCustomer.addressZipCode
                        ].filter(Boolean).join(', ') || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informações Profissionais */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#16a34a]">💼 Informações Profissionais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Cargo/Profissão</label>
                      <p className="text-gray-900">{viewingCustomer.jobTitle || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Empresa</label>
                      <p className="text-gray-900">{viewingCustomer.company || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Segmento de Mercado</label>
                      <p className="text-gray-900">{viewingCustomer.marketSegment || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Fonte de Aquisição</label>
                      <p className="text-gray-900">{viewingCustomer.acquisitionSource || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#16a34a]">📊 Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Nível</label>
                      <span className={`px-3 py-1 text-sm rounded-full ${getPotentialBadge(viewingCustomer.potentialLevel)}`}>
                        {viewingCustomer.potentialLevel || 'Potencial'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Satisfação</label>
                      <p className="text-gray-900">
                        {viewingCustomer.satisfactionLevel ? `${viewingCustomer.satisfactionLevel}/5 ⭐` : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Fidelidade</label>
                      <p className="text-gray-900">{viewingCustomer.loyaltyScore || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Risco</label>
                      <p className="text-gray-900">{viewingCustomer.riskScore || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Notas Internas */}
                {viewingCustomer.internalNotes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-[#16a34a]">📋 Notas Internas</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingCustomer.internalNotes}</p>
                  </div>
                )}

                {/* Datas */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#16a34a]">📅 Datas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Primeiro Contato</label>
                      <p className="text-gray-900">
                        {new Date(viewingCustomer.firstContactDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Última Interação</label>
                      <p className="text-gray-900">
                        {viewingCustomer.lastInteractionDate
                          ? new Date(viewingCustomer.lastInteractionDate).toLocaleDateString('pt-BR')
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
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
                  className="px-4 py-2 bg-[#16a34a] text-white rounded-md hover:bg-green-700"
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
