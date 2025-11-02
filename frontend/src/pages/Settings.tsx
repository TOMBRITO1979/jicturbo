import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'about'>('profile');

  const TabButton = ({ id, label, active }: { id: string; label: string; active: boolean }) => (
    <button
      onClick={() => setActiveTab(id as 'profile' | 'system' | 'about')}
      className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors ${
        active
          ? 'bg-white text-primary-600 border-b-2 border-primary-600'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Configurações</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-2">
            <TabButton id="profile" label="Perfil" active={activeTab === 'profile'} />
            <TabButton id="system" label="Sistema" active={activeTab === 'system'} />
            <TabButton id="about" label="Sobre" active={activeTab === 'about'} />
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Informações do Perfil</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Função</label>
                <input
                  type="text"
                  value={user?.role || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                />
              </div>

              {user?.tenantId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tenant ID</label>
                  <input
                    type="text"
                    value={user.tenantId}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-mono text-xs"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Nota:</span> Para alterar suas informações de perfil, entre em contato com o administrador do sistema.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Configurações do Sistema</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Idioma</h3>
                    <p className="text-sm text-gray-600">Português (Brasil)</p>
                  </div>
                  <span className="text-2xl">🇧🇷</span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Fuso Horário</h3>
                    <p className="text-sm text-gray-600">America/Sao_Paulo (UTC-3)</p>
                  </div>
                  <span className="text-2xl">🕒</span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Formato de Moeda</h3>
                    <p className="text-sm text-gray-600">Real Brasileiro (R$)</p>
                  </div>
                  <span className="text-2xl">💰</span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Formato de Data</h3>
                    <p className="text-sm text-gray-600">DD/MM/AAAA</p>
                  </div>
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start">
                <span className="text-3xl mr-4">ℹ️</span>
                <div>
                  <h3 className="font-medium text-green-900 mb-2">Configurações Avançadas</h3>
                  <p className="text-sm text-green-800">
                    Configurações avançadas como integrações de API, SMTP e webhooks estão disponíveis apenas para administradores.
                    Entre em contato com o suporte para mais informações.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-primary-600 mb-2">CrWell</h2>
                <p className="text-gray-600">Sistema de Gestão de Relacionamento com Clientes</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Versão</dt>
                    <dd className="text-lg font-semibold text-gray-900">1.0.0</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Data de Lançamento</dt>
                    <dd className="text-lg font-semibold text-gray-900">Outubro 2025</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Ambiente</dt>
                    <dd className="text-lg font-semibold text-gray-900">Produção</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Backend API</dt>
                    <dd className="text-lg font-semibold text-gray-900">Node.js + TypeScript</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Frontend</dt>
                    <dd className="text-lg font-semibold text-gray-900">React 18 + Vite</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Banco de Dados</dt>
                    <dd className="text-lg font-semibold text-gray-900">PostgreSQL + Prisma</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Funcionalidades</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Gestão de Clientes</h4>
                    <p className="text-sm text-gray-600">CRUD completo com histórico</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Serviços</h4>
                    <p className="text-sm text-gray-600">Controle de contratos e serviços</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Eventos</h4>
                    <p className="text-sm text-gray-600">Agenda e calendário integrado</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Projetos</h4>
                    <p className="text-sm text-gray-600">Gerenciamento de projetos e tarefas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Financeiro</h4>
                    <p className="text-sm text-gray-600">Faturas e controle de pagamentos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Relatórios</h4>
                    <p className="text-sm text-gray-600">Dashboard com métricas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Multi-tenant</h4>
                    <p className="text-sm text-gray-600">Isolamento completo por tenant</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Autenticação JWT</h4>
                    <p className="text-sm text-gray-600">Sistema seguro de autenticação</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Tecnologias</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <p className="font-medium">React 18</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <p className="font-medium">TypeScript</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <p className="font-medium">Node.js 20</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <p className="font-medium">PostgreSQL</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <p className="font-medium">Prisma ORM</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <p className="font-medium">TailwindCSS</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <p className="font-medium">Docker</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <p className="font-medium">Vite</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-2">Desenvolvido com ❤️</p>
              <p className="text-sm text-gray-500">
                © 2025 CrWell. Todos os direitos reservados.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
