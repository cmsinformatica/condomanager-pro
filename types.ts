
export enum UserRole {
  ADMIN = 'Administrador',
  RESIDENT = 'Morador',
}

export interface Resident {
  id: string;
  ownerName: string;
  tenantName?: string;
  apartmentNumber: number;
}

export interface Payment {
  id:string;
  apartmentNumber: number;
  amount: number;
  date: string; // ISO string format
  month: number;
  year: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO string format
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  apartmentNumber?: number;
}