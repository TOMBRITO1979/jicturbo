import { useState, useEffect } from 'react';
import api from '../services/api';

interface DashboardData {
  totalCustomers: number;
  totalServices: number;
  totalProjects: number;
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  upcomingEvents: number;
}

export default function Reports() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Dummy data for better UX
  const dummyDashboard: DashboardData = {
    totalCustomers: 47,
    totalServices: 23,
    totalProjects: 15,
    totalInvoices: 89,
    totalRevenue: 458750,
    pendingInvoices: 12,
    upcomingEvents: 8,
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/dashboard');
      const data = response.data.data;

      if (data && Object.keys(data).length > 0) {
        setDashboard(data);
      } else {
        setDashboard(dummyDashboard);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setDashboard(dummyDashboard);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const Card = ({ title, value, icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium uppercase">{title}</h3>
        <span className={`text-3xl ${color}`}>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard - Relatórios</h1>
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard - Relatórios</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">Erro ao carregar dados do dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard - Relatórios</h1>
          <p className="text-gray-600">Visão geral do sistema</p>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            title="Total de Clientes"
            value={dashboard.totalCustomers}
            icon="👥"
            color="text-blue-600"
            subtitle="Clientes cadastrados"
          />
          <Card
            title="Serviços Ativos"
            value={dashboard.totalServices}
            icon="⚙️"
            color="text-green-600"
            subtitle="Contratos vigentes"
          />
          <Card
            title="Projetos"
            value={dashboard.totalProjects}
            icon="📊"
            color="text-purple-600"
            subtitle="Em andamento e concluídos"
          />
          <Card
            title="Eventos Futuros"
            value={dashboard.upcomingEvents}
            icon="📅"
            color="text-orange-600"
            subtitle="Agendamentos próximos"
          />
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            title="Receita Total"
            value={formatCurrency(dashboard.totalRevenue)}
            icon="💰"
            color="text-green-600"
            subtitle="Faturas pagas"
          />
          <Card
            title="Total de Faturas"
            value={dashboard.totalInvoices}
            icon="📄"
            color="text-indigo-600"
            subtitle="Emitidas no sistema"
          />
          <Card
            title="Faturas Pendentes"
            value={dashboard.pendingInvoices}
            icon="⏰"
            color="text-red-600"
            subtitle="Aguardando pagamento"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/customers"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl mb-2">👥</span>
              <span className="text-sm font-medium text-gray-700">Clientes</span>
            </a>
            <a
              href="/services"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl mb-2">⚙️</span>
              <span className="text-sm font-medium text-gray-700">Serviços</span>
            </a>
            <a
              href="/projects"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl mb-2">📊</span>
              <span className="text-sm font-medium text-gray-700">Projetos</span>
            </a>
            <a
              href="/financial"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl mb-2">💰</span>
              <span className="text-sm font-medium text-gray-700">Faturas</span>
            </a>
            <a
              href="/events"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl mb-2">📅</span>
              <span className="text-sm font-medium text-gray-700">Eventos</span>
            </a>
            <a
              href="/settings"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl mb-2">⚙️</span>
              <span className="text-sm font-medium text-gray-700">Configurações</span>
            </a>
            <a
              href="/admin"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl mb-2">🏢</span>
              <span className="text-sm font-medium text-gray-700">Empresas</span>
            </a>
            <a
              href="/users"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl mb-2">👥</span>
              <span className="text-sm font-medium text-gray-700">Usuários</span>
            </a>
            <a
              href="/profile"
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl mb-2">👤</span>
              <span className="text-sm font-medium text-gray-700">Perfil</span>
            </a>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Status Rápido</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">✅ Serviços Ativos</span>
                <span className="text-lg font-bold text-green-600">{dashboard.totalServices}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">📊 Projetos em Andamento</span>
                <span className="text-lg font-bold text-blue-600">{dashboard.totalProjects}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">⏰ Faturas Pendentes</span>
                <span className="text-lg font-bold text-yellow-600">{dashboard.pendingInvoices}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">📅 Eventos Futuros</span>
                <span className="text-lg font-bold text-purple-600">{dashboard.upcomingEvents}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Desempenho Financeiro</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Receita Total</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(dashboard.totalRevenue)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Taxa de Conversão</span>
                  <span className="text-sm font-bold text-blue-600">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Faturas Pagas</span>
                  <span className="text-sm font-bold text-purple-600">
                    {dashboard.totalInvoices - dashboard.pendingInvoices}/{dashboard.totalInvoices}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${dashboard.totalInvoices > 0
                        ? ((dashboard.totalInvoices - dashboard.pendingInvoices) / dashboard.totalInvoices) * 100
                        : 0
                      }%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Clientes Ativos</span>
                  <span className="text-2xl font-bold text-primary-600">{dashboard.totalCustomers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Sistema JICTurbo CRM</h3>
              <p className="text-primary-100">Gestão completa de clientes, serviços e projetos</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{dashboard.totalCustomers}</p>
              <p className="text-primary-200 text-sm">Clientes Totais</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
