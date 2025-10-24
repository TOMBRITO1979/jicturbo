import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const modules = [
    { name: t('customers.title'), path: '/customers', icon: '👥' },
    { name: t('services.title'), path: '/services', icon: '📦' },
    { name: t('events.title'), path: '/events', icon: '📅' },
    { name: t('financial.title'), path: '/financial', icon: '💰' },
    { name: t('projects.title'), path: '/projects', icon: '📊' },
    { name: t('reports.title'), path: '/reports', icon: '📈' },
    { name: t('settings.title'), path: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 mb-8">
            {t('dashboard.welcome')}, {user?.name}!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Link
                key={module.path}
                to={module.path}
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg hover:border-primary-600 transition-all"
              >
                <div className="flex items-center">
                  <span className="text-4xl mr-4">{module.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {module.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
