import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Users as UsersIcon, 
  Package as PackageIcon, 
  Calendar as CalendarIcon, 
  BarChart2 as ChartIcon 
} from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    {
      to: '/app/members',
      icon: <UsersIcon className="h-icon-md w-icon-md" />,
      label: 'Üyeler',
      testId: 'nav-members',
    },
    {
      to: '/app/packages',
      icon: <PackageIcon className="h-icon-md w-icon-md" />,
      label: 'Paketler',
      testId: 'nav-packages',
    },
    {
      to: '/app/calendar',
      icon: <CalendarIcon className="h-icon-md w-icon-md" />,
      label: 'Takvim',
      testId: 'nav-calendar',
    },
    {
      to: '/app/reports',
      icon: <ChartIcon className="h-icon-md w-icon-md" />,
      label: 'Raporlar',
      testId: 'nav-reports',
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40"
      style={{
        height: 'calc(4rem + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="grid grid-cols-4 h-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={item.testId}
              className={`flex flex-col items-center justify-center text-xs font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-primary-500'}`}
            >
              <div className={`p-2 rounded-full ${isActive ? 'bg-primary-50' : ''}`}>
                {React.cloneElement(item.icon, {
                  className: `h-icon-md w-icon-md ${isActive ? 'text-primary-600' : 'text-gray-500'}`
                })}
              </div>
              <span className="text-xs mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
