import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { auth } from '../lib/firebase';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/members', label: 'Üyeler' },
  { to: '/calendar', label: 'Takvim' },
  { to: '/payments', label: 'Ödemeler' },
];

const AppLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white py-4 px-8 flex items-center justify-between">
        <span className="font-bold text-xl">Gym Yönetimi</span>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
        >
          <FaSignOutAlt />
          Çıkış Yap
        </button>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <nav className="bg-white border-t flex justify-around py-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-1 rounded ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;
