export interface User {
  email: string;
  name: string;
  avatar?: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  amount: number;
  departments: string[];
  personnel: string[];
  description?: string;
  createdBy: string;
  createdAt: number;
  isSettled: boolean;
  settlementId?: string;
}

export interface Settlement {
  id: string;
  date: string;
  totalAmount: number;
  recordCount: number;
  periodStart?: string;
  periodEnd?: string;
  createdBy: string;
  createdAt: number;
}

export type DepartmentMap = {
  [key: string]: string[];
};

export interface DataContextState {
  records: ExpenseRecord[];
  settlements: Settlement[];
  refreshData: () => void;
}