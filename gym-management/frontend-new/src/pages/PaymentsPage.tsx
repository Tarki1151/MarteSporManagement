import { useState, useEffect } from 'react';
import { PlusIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Payment, PaymentFilterOptions } from '../types/payment';

// Mock data - Gerçek uygulamada API'den çekilecek
const mockPayments: Payment[] = [
  {
    id: '1',
    memberId: '101',
    memberName: 'Ahmet Yılmaz',
    amount: 1200,
    paymentDate: '2025-06-10',
    dueDate: '2025-06-01',
    status: 'paid',
    paymentMethod: 'credit_card',
    receiptNumber: 'RC-2025-001',
    description: 'Haziran ayı üyelik ücreti',
    createdAt: '2025-06-10T10:30:00',
    updatedAt: '2025-06-10T10:30:00',
  },
  {
    id: '2',
    memberId: '102',
    memberName: 'Ayşe Demir',
    amount: 1000,
    paymentDate: '',
    dueDate: '2025-06-15',
    status: 'overdue',
    paymentMethod: 'bank_transfer',
    receiptNumber: '',
    description: 'Haziran ayı üyelik ücreti',
    createdAt: '2025-05-25T14:20:00',
    updatedAt: '2025-05-25T14:20:00',
  },
  // Diğer örnek ödemeler...
];

export const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [filters, setFilters] = useState<PaymentFilterOptions>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock verileri yükle
  useEffect(() => {
    // Gerçek uygulamada API'den çekilecek
    setPayments(mockPayments);
    setFilteredPayments(mockPayments);
  }, []);

  // Filtreleme işlemi
  useEffect(() => {
    let result = [...payments];

    // Arama sorgusuna göre filtrele
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.memberName.toLowerCase().includes(query) ||
          payment.receiptNumber?.toLowerCase().includes(query) ||
          payment.description?.toLowerCase().includes(query)
      );
    }

    // Diğer filtreler
    if (filters.status) {
      result = result.filter((payment) => payment.status === filters.status);
    }

    if (filters.paymentMethod) {
      result = result.filter((payment) => payment.paymentMethod === filters.paymentMethod);
    }

    setFilteredPayments(result);
  }, [filters, payments, searchQuery]);

  const handleFilterChange = (key: keyof PaymentFilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Nakit';
      case 'credit_card':
        return 'Kredi Kartı';
      case 'bank_transfer':
        return 'Banka Havalesi';
      default:
        return 'Diğer';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ödemeler</h1>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Yeni Ödeme
        </button>
      </div>

      {/* Filtreleme Alanı */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Üye adı, makbuz no veya açıklamada ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FunnelIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Filtrele
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Temizle
            </button>
          </div>
        </div>

        {/* Gelişmiş Filtreler */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  id="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Tümü</option>
                  <option value="paid">Ödendi</option>
                  <option value="pending">Bekliyor</option>
                  <option value="overdue">Gecikmiş</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Ödeme Yöntemi
                </label>
                <select
                  id="paymentMethod"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filters.paymentMethod || ''}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                >
                  <option value="">Tümü</option>
                  <option value="cash">Nakit</option>
                  <option value="credit_card">Kredi Kartı</option>
                  <option value="bank_transfer">Banka Havalesi</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ödeme Tablosu */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Üye
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ödeme Tarihi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Ödeme Tarihi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yöntem
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.memberName}</div>
                      <div className="text-sm text-gray-500">{payment.receiptNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.amount.toFixed(2)} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentDate || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          payment.status
                        )}`}
                      >
                        {payment.status === 'paid' && 'Ödendi'}
                        {payment.status === 'pending' && 'Bekliyor'}
                        {payment.status === 'overdue' && 'Gecikmiş'}
                        {payment.status === 'cancelled' && 'İptal Edildi'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getPaymentMethodLabel(payment.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Düzenle</button>
                      <button className="text-red-600 hover:text-red-900">Sil</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sayfalama ve Özet Bilgileri */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-700">
        <div className="mb-2 sm:mb-0">
          Toplam <span className="font-medium">{filteredPayments.length}</span> kayıt listeleniyor.
        </div>
        <div className="flex space-x-2">
          <button
            disabled
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
          >
            Önceki
          </button>
          <span className="px-3 py-1">1</span>
          <button
            disabled
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
