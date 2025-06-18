import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './lib/firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Calendar from './pages/Calendar';
import Payments from './pages/Payments';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth check wrapper component
const AuthCheck = () => {
  const [isLoading, setIsLoading] = useState(true);
  // useLocation kaldırıldı çünkü şu an kullanılmıyor

  useEffect(() => {
    // Firebase auth state değişikliklerini dinle
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

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Korumalı route'lar */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/payments" element={<Payments />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthCheck />
    </BrowserRouter>
  );
}

export default App;

