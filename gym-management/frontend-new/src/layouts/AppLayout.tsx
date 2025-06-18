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
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-xl">Gym Yönetimi</span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Çıkış Yap</span>
          </button>
        </div>
        
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto hide-scrollbar">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-4 pb-8">
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
