import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  UserCircleIcon, 
  ChartBarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

// Mock data - Gerçek uygulamada API'den çekilecek
const dashboardData = {
  stats: {
    totalMembers: 247,
    activeMembers: 198,
    monthlyRevenue: 125600,
    attendanceRate: 78,
  },
  recentPayments: [
    { id: 1, member: 'Ahmet Yılmaz', amount: 1200, date: '2025-06-18', status: 'completed' },
    { id: 2, member: 'Ayşe Demir', amount: 1000, date: '2025-06-17', status: 'completed' },
    { id: 3, member: 'Mehmet Kaya', amount: 1500, date: '2025-06-16', status: 'pending' },
    { id: 4, member: 'Zeynep Şahin', amount: 900, date: '2025-06-15', status: 'completed' },
    { id: 5, member: 'Ali Veli', amount: 1100, date: '2025-06-14', status: 'completed' },
  ],
  upcomingPayments: [
    { id: 6, member: 'Deniz Yıldız', amount: 1200, dueDate: '2025-06-20' },
    { id: 7, member: 'Can Demir', amount: 1000, dueDate: '2025-06-21' },
    { id: 8, member: 'Elif Korkmaz', amount: 1300, dueDate: '2025-06-22' },
  ],
  recentMembers: [
    { id: 1, name: 'Ahmet Yılmaz', joinDate: '2025-06-18', membership: 'Aylık' },
    { id: 2, name: 'Ayşe Demir', joinDate: '2025-06-17', membership: '3 Aylık' },
    { id: 3, name: 'Mehmet Kaya', joinDate: '2025-06-16', membership: 'Yıllık' },
    { id: 4, name: 'Zeynep Şahin', joinDate: '2025-06-15', membership: 'Aylık' },
  ]
};

const StatCard = ({ title, value, icon, trend, description }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  description?: string;
}) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-md bg-blue-500 text-white flex items-center justify-center">
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {trend && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className={`font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>{' '}
            <span className="text-gray-500">{description}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Gerçek uygulamada API'den veri çekme işlemi burada yapılacak
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  return (
    <div className="space-y-6 py-2">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
        <p className="mt-1 text-sm text-gray-500">Spor salonunuzun genel istatistikleri ve özet bilgileri</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Üye"
          value={dashboardData.stats.totalMembers}
          icon={<UserGroupIcon className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
          description="Geçen aya göre"
        />
        <StatCard
          title="Aktif Üye"
          value={dashboardData.stats.activeMembers}
          icon={<UserCircleIcon className="h-6 w-6" />}
          trend={{ value: 5, isPositive: true }}
          description="Geçen aya göre"
        />
        <StatCard
          title="Aylık Gelir"
          value={formatCurrency(dashboardData.stats.monthlyRevenue)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          trend={{ value: 8, isPositive: true }}
          description="Geçen aya göre"
        />
        <StatCard
          title="Katılım Oranı"
          value={`%${dashboardData.stats.attendanceRate}`}
          icon={<ChartBarIcon className="h-6 w-6" />}
          trend={{ value: 3, isPositive: true }}
          description="Geçen aya göre"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Son Ödemeler */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg lg:col-span-2">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Son Ödemeler</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Son tamamlanan ödemelerin listesi</p>
          </div>
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
                    Tarih
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.member}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right text-sm font-medium text-gray-500">
            <a href="/app/payments" className="text-blue-600 hover:text-blue-900">
              Tüm ödemeleri görüntüle →
            </a>
          </div>
        </div>

        {/* Yaklaşan Ödemeler */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Yaklaşan Ödemeler</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Önümüzdeki ödemeler</p>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData.upcomingPayments.map((payment) => (
              <div key={payment.id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{payment.member}</p>
                    <p className="text-sm text-gray-500">Son ödeme: {payment.dueDate}</p>
                  </div>
                  <div className="ml-auto">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right text-sm font-medium text-gray-500">
            <a href="/app/payments" className="text-blue-600 hover:text-blue-900">
              Tüm ödemeleri görüntüle →
            </a>
          </div>
        </div>
      </div>

      {/* Son Eklenen Üyeler */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Son Eklenen Üyeler</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Sisteme son kaydolan üyeler</p>
        </div>
        <div className="divide-y divide-gray-200">
          {dashboardData.recentMembers.map((member) => (
            <div key={member.id} className="px-4 py-4 hover:bg-gray-50">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserPlusIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">Kayıt Tarihi: {member.joinDate}</p>
                </div>
                <div className="ml-auto">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {member.membership}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 px-4 py-3 text-right text-sm font-medium text-gray-500">
          <a href="/app/members" className="text-blue-600 hover:text-blue-900">
            Tüm üyeleri görüntüle →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
