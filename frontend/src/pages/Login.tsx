import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <div className="flex justify-center mb-4">
            <div className="bg-[#16a34a] text-white px-6 py-3 rounded-lg shadow-lg">
              <h1 className="text-2xl sm:text-3xl font-bold">CrWell</h1>
            </div>
          </div>
          <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            {t('auth.loginTitle')}
          </h2>
        </div>
        <form className="mt-6 sm:mt-8 space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-xl" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('common.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 sm:py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#16a34a] focus:border-[#16a34a] focus:z-10 text-base sm:text-sm"
                placeholder={t('common.email')}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('common.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 sm:py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#16a34a] focus:border-[#16a34a] focus:z-10 text-base sm:text-sm"
                placeholder={t('common.password')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm sm:text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-[#16a34a] hover:text-[#15803d] py-2 inline-block"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base sm:text-sm font-medium rounded-md text-white bg-[#16a34a] hover:bg-[#15803d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16a34a] disabled:opacity-50 transition-colors"
            >
              {loading ? t('common.loading') : t('common.login')}
            </button>
          </div>

          <div className="text-center text-sm sm:text-sm">
            <span className="text-gray-600">{t('auth.dontHaveAccount')} </span>
            <Link
              to="/register"
              className="font-medium text-[#16a34a] hover:text-[#15803d] py-2 inline-block"
            >
              {t('common.register')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
