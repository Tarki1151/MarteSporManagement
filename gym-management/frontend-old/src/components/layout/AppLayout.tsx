import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="container mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
