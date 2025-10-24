import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-white text-xl font-bold">
                JICTurbo CRM
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="text-white hover:text-gray-200 text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
