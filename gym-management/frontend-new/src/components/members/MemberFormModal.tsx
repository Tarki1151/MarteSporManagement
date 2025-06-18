import { useState, useEffect, useMemo } from 'react';
import { Member, MemberFormData, MemberOption, ParentInfo } from '../../types/member';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormData) => void;
  member?: Member | null;
  isLoading: boolean;
}

export const MemberFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  member,
  isLoading,
}: MemberFormModalProps) => {
  const [formData, setFormData] = useState<MemberFormData>({
    fullName: '',
    email: '',
    phone: '',
    membershipStartDate: new Date().toISOString().split('T')[0],
    membershipEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    membershipType: 'Aylık',
    status: 'Aktif',
    birthDate: '',
    gender: 'Erkek',
    address: '',
    notes: '',
    isMinor: false,
    parentInfo: undefined
  });

  // Mock member list for parent selection
  const memberOptions: MemberOption[] = [
    { id: '1', fullName: 'Ali Yılmaz', phone: '5551112233', email: 'ali@example.com' },
    { id: '2', fullName: 'Ayşe Demir', phone: '5554445566', email: 'ayse@example.com' },
  ];

  // Check if member is minor based on birth date
  const isMinor = useMemo(() => {
    if (!formData.birthDate) return false;
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age < 18;
  }, [formData.birthDate]);

  // Update isMinor when birthDate changes
  useEffect(() => {
    if (formData.birthDate) {
      const newIsMinor = isMinor;
      setFormData(prev => ({
        ...prev,
        isMinor: newIsMinor,
        parentInfo: newIsMinor ? (prev.parentInfo || {
          fullName: '',
          phone: '',
          email: '',
          isMember: false,
          memberId: ''
        }) : undefined
      }));
    }
  }, [formData.birthDate, isMinor]);

  useEffect(() => {
    if (member) {
      // Convert member to form data, excluding id, createdAt, updatedAt
      const { id, createdAt, updatedAt, ...memberData } = member;
      setFormData(memberData);
    } else {
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        membershipStartDate: new Date().toISOString().split('T')[0],
        membershipEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        membershipType: 'Aylık',
        status: 'Aktif',
        birthDate: '',
        gender: 'Erkek',
        address: '',
        notes: '',
      });
    }
  }, [member, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkbox inputs
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleParentInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      parentInfo: {
        ...(prev.parentInfo || {} as ParentInfo),
        [name]: value
      } as ParentInfo
    }));
  };

  const handleParentMemberSelect = (member: MemberOption) => {
    setFormData(prev => ({
      ...prev,
      parentInfo: {
        fullName: member.fullName,
        phone: member.phone,
        email: member.email,
        isMember: true,
        memberId: member.id
      }
    }));
  };

  const toggleParentIsMember = (isMember: boolean) => {
    setFormData(prev => ({
      ...prev,
      parentInfo: {
        ...(prev.parentInfo || {} as ParentInfo),
        isMember,
        ...(isMember ? { 
          fullName: '',
          phone: '',
          email: '',
          memberId: ''
        } : { memberId: '' })
      } as ParentInfo
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {member ? 'Üye Düzenle' : 'Yeni Üye Ekle'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Ad Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Cinsiyet
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Erkek">Erkek</option>
                  <option value="Kadın">Kadın</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                  Doğum Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {formData.isMinor && (
                  <p className="mt-1 text-sm text-amber-600">
                    18 yaşından küçük olduğu için ebeveyn bilgileri gereklidir.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700">
                  Üyelik Türü <span className="text-red-500">*</span>
                </label>
                <select
                  id="membershipType"
                  name="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="Aylık">Aylık</option>
                  <option value="3 Aylık">3 Aylık</option>
                  <option value="6 Aylık">6 Aylık</option>
                  <option value="Yıllık">Yıllık</option>
                  <option value="Ömür Boyu">Ömür Boyu</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Durum <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                  <option value="Dondurulmuş">Dondurulmuş</option>
                </select>
              </div>

              <div>
                <label htmlFor="membershipStartDate" className="block text-sm font-medium text-gray-700">
                  Başlangıç Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="membershipStartDate"
                  name="membershipStartDate"
                  value={formData.membershipStartDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="membershipEndDate" className="block text-sm font-medium text-gray-700">
                  Bitiş Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="membershipEndDate"
                  name="membershipEndDate"
                  value={formData.membershipEndDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Adres
              </label>
              <textarea
                id="address"
                name="address"
                rows={2}
                value={formData.address || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Ebeveyn Bilgileri */}
            {formData.isMinor && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ebeveyn Bilgileri</h3>
                
                <div className="flex items-center mb-4">
                  <input
                    id="parentIsMember"
                    name="parentIsMember"
                    type="checkbox"
                    checked={formData.parentInfo?.isMember || false}
                    onChange={(e) => toggleParentIsMember(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="parentIsMember" className="ml-2 block text-sm text-gray-700">
                    Ebeveyn kayıtlı bir üye mi?
                  </label>
                </div>

                {formData.parentInfo?.isMember ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ebeveyn Üye Seçin <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.parentInfo?.memberId || ''}
                      onChange={(e) => {
                        const selectedMember = memberOptions.find(m => m.id === e.target.value);
                        if (selectedMember) {
                          handleParentMemberSelect(selectedMember);
                        }
                      }}
                      required
                    >
                      <option value="">Ebeveyn üye seçin</option>
                      {memberOptions.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.fullName} - {member.phone}
                        </option>
                      ))}
                    </select>
                    {formData.parentInfo?.memberId && (
                      <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
                        <p className="text-sm">
                          <span className="font-medium">Seçilen Ebeveyn:</span> {formData.parentInfo.fullName}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Telefon:</span> {formData.parentInfo.phone}
                        </p>
                        {formData.parentInfo.email && (
                          <p className="text-sm">
                            <span className="font-medium">E-posta:</span> {formData.parentInfo.email}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="parentFullName" className="block text-sm font-medium text-gray-700">
                        Ebeveyn Ad Soyad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="parentFullName"
                        name="fullName"
                        value={formData.parentInfo?.fullName || ''}
                        onChange={handleParentInfoChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required={formData.isMinor}
                      />
                    </div>
                    <div>
                      <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700">
                        Ebeveyn Telefon <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="parentPhone"
                        name="phone"
                        value={formData.parentInfo?.phone || ''}
                        onChange={handleParentInfoChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required={formData.isMinor}
                      />
                    </div>
                    <div>
                      <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700">
                        Ebeveyn E-posta
                      </label>
                      <input
                        type="email"
                        id="parentEmail"
                        name="email"
                        value={formData.parentInfo?.email || ''}
                        onChange={handleParentInfoChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notlar
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                value={formData.notes || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {member ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
