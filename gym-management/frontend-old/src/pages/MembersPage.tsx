import React from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const MembersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Üyeler</h1>
          <p className="mt-1 text-sm text-gray-500">Spor salonu üyelerini yönetin</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Yeni Üye Ekle
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Üye ara..."
            />
          </div>
        </div>
        
        <div className="bg-white overflow-hidden">
          <div className="p-4 text-center text-gray-500">
            <p>Henüz üye bulunmamaktadır.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
