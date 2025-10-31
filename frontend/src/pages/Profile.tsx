import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Profile() {
  const [user, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      setUserData(response.data.data.user);
      // Update localStorage with latest user data
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!window.confirm('Tem certeza que deseja gerar um novo token? O token anterior será invalidado.')) {
      return;
    }

    try {
      setGeneratingToken(true);
      const response = await api.post('/auth/regenerate-token');
      setUserData(response.data.data.user);
      // Update localStorage with latest user data
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      alert('Token gerado com sucesso!');
      setShowToken(true);
    } catch (error) {
      console.error('Error regenerating token:', error);
      alert('Erro ao gerar token. Tente novamente.');
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleCopyToken = () => {
    if (user?.apiToken) {
      navigator.clipboard.writeText(user.apiToken);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleName = (role: string) => {
    const roles: { [key: string]: string } = {
      SUPER_ADMIN: 'Super Administrador',
      ADMIN: 'Administrador',
      USER: 'Usuário',
    };
    return roles[role] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Perfil do Usuário</h1>
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Perfil do Usuário</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">Erro ao carregar dados do usuário.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Perfil do Usuário</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e token de API</p>
        </div>

        {/* Informações Pessoais */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Nome</label>
              <p className="text-gray-900 text-lg">{user.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-gray-900 text-lg">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Função</label>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {getRoleName(user.role)}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Data de Cadastro</label>
              <p className="text-gray-900">{formatDate(user.createdAt)}</p>
            </div>

            {user.tenant && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Empresa</label>
                  <p className="text-gray-900">{user.tenant.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status da Conta</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Token de API */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Token de API</h2>
              <p className="text-sm text-gray-600">
                Use este token para integrar com sistemas externos. Mantenha-o seguro e não o compartilhe.
              </p>
            </div>
          </div>

          {user.apiToken ? (
            <div className="space-y-4">
              {/* Token Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu Token de API
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={user.apiToken}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    title={showToken ? 'Ocultar' : 'Mostrar'}
                  >
                    {showToken ? '🙈' : '👁️'}
                  </button>
                  <button
                    onClick={handleCopyToken}
                    className="px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    title="Copiar"
                  >
                    {copySuccess ? '✓ Copiado!' : '📋 Copiar'}
                  </button>
                </div>
              </div>

              {/* Regenerate Button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">
                    Precisa de um novo token? Gere um novo e o anterior será invalidado.
                  </p>
                </div>
                <button
                  onClick={handleRegenerateToken}
                  disabled={generatingToken}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {generatingToken ? 'Gerando...' : '🔄 Gerar Novo Token'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Você ainda não possui um token de API
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Gere seu primeiro token para começar a integrar com sistemas externos
              </p>
              <button
                onClick={handleRegenerateToken}
                disabled={generatingToken}
                className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {generatingToken ? 'Gerando...' : '🔑 Gerar Token de API'}
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Sobre o Token de API</h3>
              <div className="mt-2 text-sm text-green-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Use o token para autenticar requisições à API do sistema</li>
                  <li>Cada usuário possui um token único e pessoal</li>
                  <li>Você pode regenerar o token a qualquer momento</li>
                  <li>Nunca compartilhe seu token com outras pessoas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
