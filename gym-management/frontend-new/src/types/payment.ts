export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'other';
  description?: string;
  receiptNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFormData extends Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export interface PaymentFilterOptions {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}
