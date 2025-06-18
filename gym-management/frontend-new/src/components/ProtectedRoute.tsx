import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    // Auth state değişikliklerini dinle
    const unsubscribe = auth.onAuthStateChanged(() => {
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!auth.currentUser) {
    // Orijinal URL'yi sakla ki login sonrası oraya yönlendirebilelim
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Kullanıcı giriş yapmışsa alt bileşenleri render et
  return <>{children}</>;
};

export default ProtectedRoute;
