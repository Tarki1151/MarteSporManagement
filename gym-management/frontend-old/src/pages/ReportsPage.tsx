import React from 'react';
import { UserGroupIcon, CurrencyDollarIcon, ClockIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Toplam Üye',
    value: '0',
    icon: UserGroupIcon,
    change: '0%',
    changeType: 'increase',
  },
  {
    name: 'Aylık Gelir',
    value: '₺0',
    icon: CurrencyDollarIcon,
    change: '0%',
    changeType: 'decrease',
  },
  {
    name: 'Ortalama Katılım',
    value: '0%',
    icon: ClockIcon,
    change: '0%',
    changeType: 'increase',
  },
];

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
        <p className="mt-1 text-sm text-gray-500">Spor salonu istatistikleri ve performans metrikleri</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span
                  className={`font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>{' '}
                <span className="text-gray-500">geçen aya göre</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reports Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Aylık Raporlar</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Spor salonu aylık performans özeti</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Dışa Aktar
          </button>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Rapor verisi yok</h3>
              <p className="mt-1 text-sm text-gray-500">Henüz rapor oluşturulmamış.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
