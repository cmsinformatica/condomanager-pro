
import React, { createContext, useContext, ReactNode } from 'react';
import { useCondoData } from '../hooks/useCondoData';
import type { Resident, Payment, Expense, User } from '../types';

interface CondoDataContextType {
  residents: Resident[];
  payments: Payment[];
  expenses: Expense[];
  users: User[];
  loading?: boolean;
  addResident: (resident: Omit<Resident, 'id'>) => void | Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => void | Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => void | Promise<void>;
  addUser: (user: Omit<User, 'id'>) => void | Promise<void>;
  deleteResident: (id: string) => void | Promise<void>;
  deletePayment: (id: string) => void | Promise<void>;
  deleteExpense: (id: string) => void | Promise<void>;
  deleteUser: (id: string) => void | Promise<void>;
}

const CondoDataContext = createContext<CondoDataContextType | undefined>(undefined);

export const CondoDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const condoData = useCondoData();

  return (
    <CondoDataContext.Provider value={condoData}>
      {children}
    </CondoDataContext.Provider>
  );
};

export const useCondo = (): CondoDataContextType => {
  const context = useContext(CondoDataContext);
  if (context === undefined) {
    throw new Error('useCondo must be used within a CondoDataProvider');
  }
  return context;
};
