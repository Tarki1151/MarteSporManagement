import React, { useState, useEffect } from 'react';
import { Member, MemberFilters } from '../types/member';
import { MemberTable } from '../components/members/MemberTable';
import { MemberFormModal } from '../components/members/MemberFormModal';

// Mock data - Gerçek uygulamada API'den çekilecek
const mockMembers: Member[] = [
  {
    id: '1',
    fullName: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '5551234567',
    membershipStartDate: '2024-01-01',
    membershipEndDate: '2024-12-31',
    membershipType: 'Yıllık',
    status: 'Aktif',
    birthDate: '1990-05-15',
    gender: 'Erkek',
    address: 'Örnek Mah. Test Sk. No:123',
    notes: 'VIP müşteri',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  // Daha fazla örnek üye eklenebilir
];

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [filters, setFilters] = useState<MemberFilters>({});

  // Üyeleri yükle (gerçek uygulamada API'den çekilecek)
  useEffect(() => {
    const loadMembers = async () => {
      try {
        // Simüle edilmiş yükleme süresi
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filtreleme uygula
        let filteredMembers = [...mockMembers];
        
        if (filters.status) {
          filteredMembers = filteredMembers.filter(member => member.status === filters.status);
        }
        
        if (filters.membershipType) {
          filteredMembers = filteredMembers.filter(member => member.membershipType === filters.membershipType);
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredMembers = filteredMembers.filter(
            member => 
              member.fullName.toLowerCase().includes(searchLower) ||
              (member.email && member.email.toLowerCase().includes(searchLower)) ||
              member.phone.includes(searchLower)
          );
        }
        
        setMembers(filteredMembers);
      } catch (error) {
        console.error('Üyeler yüklenirken hata oluştu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, [filters]);

  const handleAddMember = () => {
    setCurrentMember(null);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setCurrentMember(member);
    setIsModalOpen(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (window.confirm('Bu üyeyi silmek istediğinize emin misiniz?')) {
      try {
        setIsLoading(true);
        // Gerçek uygulamada API'ye silme isteği gönderilecek
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setMembers(prev => prev.filter(member => member.id !== memberId));
        alert('Üye başarıyla silindi.');
      } catch (error) {
        console.error('Üye silinirken hata oluştu:', error);
        alert('Üye silinirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmitMember = async (formData: any) => {
    try {
      setIsLoading(true);
      
      // Simüle edilmiş API isteği
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (currentMember) {
        // Güncelleme işlemi
        setMembers(prev => 
          prev.map(member => 
            member.id === currentMember.id 
              ? { ...formData, id: currentMember.id, updatedAt: new Date().toISOString() } 
              : member
          )
        );
        alert('Üye başarıyla güncellendi.');
      } else {
        // Yeni ekleme işlemi
        const newMember: Member = {
          ...formData,
          id: Math.random().toString(36).substr(2, 9), // Gerçek uygulamada sunucudan ID gelmeli
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setMembers(prev => [newMember, ...prev]);
        alert('Üye başarıyla eklendi.');
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('İşlem sırasında hata oluştu:', error);
      alert('İşlem sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value || undefined
    }));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Üye Yönetimi</h1>
        <button
          onClick={handleAddMember}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Yeni Üye Ekle
        </button>
      </div>

      {/* Filtreleme Alanı */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Filtrele</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Ara</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search || ''}
              onChange={handleFilterChange}
              placeholder="İsim, e-posta veya telefon ile ara"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Durum</label>
            <select
              id="status"
              name="status"
              value={filters.status || ''}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option value="Aktif">Aktif</option>
              <option value="Pasif">Pasif</option>
              <option value="Dondurulmuş">Dondurulmuş</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700">Üyelik Türü</label>
            <select
              id="membershipType"
              name="membershipType"
              value={filters.membershipType || ''}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option value="Aylık">Aylık</option>
              <option value="3 Aylık">3 Aylık</option>
              <option value="6 Aylık">6 Aylık</option>
              <option value="Yıllık">Yıllık</option>
              <option value="Ömür Boyu">Ömür Boyu</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({})}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Üye Tablosu */}
      <div className="bg-white p-6 rounded-lg shadow">
        <MemberTable 
          members={members} 
          onEdit={handleEditMember} 
          onDelete={handleDeleteMember}
          isLoading={isLoading}
        />
      </div>

      {/* Üye Ekleme/Düzenleme Modalı */}
      <MemberFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitMember}
        member={currentMember}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Members;
