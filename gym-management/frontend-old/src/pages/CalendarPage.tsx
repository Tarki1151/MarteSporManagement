import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CalendarPage: React.FC = () => {
  // Get current date
  const currentDate = new Date();
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // Generate days of the week
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  // Generate days for the current month
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();
  
  // Adjust for Monday as first day of week (1 = Monday, 0 = Sunday)
  const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  // Generate empty cells for days before the first day of the month
  const emptyCells = Array(firstDayIndex).fill(null);
  const days = [...emptyCells, ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Takvim</h1>
          <p className="mt-1 text-sm text-gray-500">Etkinlik ve ders takvimi</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {currentMonth} {currentYear}
          </span>
          <button
            type="button"
            className="p-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Yeni Etkinlik
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200 border-b border-gray-200">
          {weekDays.map((day) => (
            <div key={day} className="bg-gray-100 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, index) => (
            <div 
              key={index} 
              className={`bg-white p-2 h-24 text-sm ${day === currentDate.getDate() ? 'ring-2 ring-primary-500' : ''} ${!day ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
            >
              {day && (
                <div className="flex justify-between">
                  <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-sm font-medium ${day === currentDate.getDate() ? 'bg-primary-500 text-white' : 'text-gray-900'}`}>
                    {day}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
