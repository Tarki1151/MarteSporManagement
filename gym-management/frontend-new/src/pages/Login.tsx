import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';
import { signInWithGoogle, signInWithEmail, auth } from '../lib/firebase';
import { User } from 'firebase/auth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  // Sadece ilk yüklemede ve login sayfasındayken kontrol et
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      if (user && window.location.pathname === '/login') {
        navigate(redirectUrl, { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate, redirectUrl]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithEmail(email, password);
      if (!result.success) {
        throw new Error(result.error || 'Bilinmeyen bir hata oluştu');
      }
      navigate(redirectUrl, { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      setError(`Giriş başarısız: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        throw new Error(result.error || 'Bilinmeyen bir hata oluştu');
      }
      navigate(redirectUrl, { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      setError(`Google ile giriş başarısız: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/logo-big.png" 
            alt="Logo" 
            className="max-w-full h-auto max-h-32 w-auto" 
            style={{ maxWidth: '300px' }}
          />
        </div>
        
        {/* Giriş Formu */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Hesabınıza Giriş Yapın</h2>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleEmailLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                  E-posta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
            
            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm">VEYA</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-2"
            >
              <FaGoogle className="text-red-500" />
              Google ile Giriş Yap
            </button>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 text-center">
            <p className="text-gray-600 text-sm">
              Hesabınız yok mu?{' '}
              <button className="text-blue-600 hover:underline font-medium">
                Kayıt Olun
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
