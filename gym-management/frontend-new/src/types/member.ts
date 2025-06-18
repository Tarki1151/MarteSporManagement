export interface ParentInfo {
  fullName: string;
  phone: string;
  email?: string;
  isMember: boolean;
  memberId?: string; // Eğer ebeveyn üye ise üye ID'si
}

export interface Member {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipType: 'Aylık' | '3 Aylık' | '6 Aylık' | 'Yıllık' | 'Ömür Boyu';
  status: 'Aktif' | 'Pasif' | 'Dondurulmuş';
  birthDate?: string;
  gender?: 'Erkek' | 'Kadın' | 'Diğer';
  address?: string;
  notes?: string;
  hasHealthIssues?: boolean;
  healthIssues?: string;
  isMinor?: boolean; // 18 yaşından küçük mü?
  parentInfo?: ParentInfo; // Sadece isMinor true ise dolu olacak
  createdAt: string;
  updatedAt: string;
}

export interface MemberFormData extends Omit<Member, 'id' | 'createdAt' | 'updatedAt'> {}

export interface MemberFilters {
  status?: string;
  membershipType?: string;
  search?: string;
}

export interface MemberOption {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
}
