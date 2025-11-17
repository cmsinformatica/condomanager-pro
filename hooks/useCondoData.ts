import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Resident, Payment, Expense, User } from '../types';
import { UserRole } from '../types';

const CONDO_DATA_KEY = 'condoData';

const getInitialData = () => {
  try {
    const item = window.localStorage.getItem(CONDO_DATA_KEY);
    if (item) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.warn('Error reading localStorage key "' + CONDO_DATA_KEY + '":', error);
  }

  // Return default initial data if localStorage is empty or corrupted
  return {
    residents: [
        {id: 'res-1', ownerName: 'Alice Silva', apartmentNumber: 1, tenantName: 'João da Silva'},
        {id: 'res-2', ownerName: 'Roberto Souza', apartmentNumber: 2},
    ],
    payments: [
        {id: 'pay-1', apartmentNumber: 1, amount: 500, date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), month: new Date().getMonth(), year: new Date().getFullYear()},
        {id: 'pay-2', apartmentNumber: 2, amount: 500, date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), month: new Date().getMonth(), year: new Date().getFullYear()},
        {id: 'pay-3', apartmentNumber: 1, amount: 500, date: new Date().toISOString(), month: new Date().getMonth() + 1, year: new Date().getFullYear()},
    ],
    expenses: [
        {id: 'exp-1', description: 'Manutenção do Jardim', amount: 350, category: 'Jardinagem', date: new Date().toISOString()},
        {id: 'exp-2', description: 'Eletricidade do Hall', amount: 600, category: 'Eletricidade', date: new Date().toISOString()},
    ],
    users: [
        {id: 'usr-1', name: 'Usuário Administrador', email: 'admin@condo.com', role: UserRole.ADMIN},
        {id: 'usr-2', name: 'Alice Silva', email: 'alice@email.com', role: UserRole.RESIDENT, apartmentNumber: 1},
    ]
  };
};

// Função auxiliar para converter dados do Supabase para o formato do app
const mapResidentFromDB = (data: any): Resident => ({
  id: data.id,
  ownerName: data.owner_name,
  tenantName: data.tenant_name,
  apartmentNumber: data.apartment_number
});

const mapPaymentFromDB = (data: any): Payment => ({
  id: data.id,
  apartmentNumber: data.apartment_number,
  amount: Number(data.amount),
  date: data.date,
  month: data.month,
  year: data.year
});

const mapExpenseFromDB = (data: any): Expense => ({
  id: data.id,
  description: data.description,
  amount: Number(data.amount),
  category: data.category,
  date: data.date
});

const mapUserFromDB = (data: any): User => ({
  id: data.id,
  name: data.name,
  email: data.email,
  role: data.role as UserRole,
  apartmentNumber: data.apartment_number
});

export const useCondoData = () => {
  const useSupabase = isSupabaseConfigured();
  
  const [residents, setResidents] = useState<Resident[]>(() => 
    useSupabase ? [] : getInitialData().residents
  );
  const [payments, setPayments] = useState<Payment[]>(() => 
    useSupabase ? [] : getInitialData().payments
  );
  const [expenses, setExpenses] = useState<Expense[]>(() => 
    useSupabase ? [] : getInitialData().expenses
  );
  const [users, setUsers] = useState<User[]>(() => 
    useSupabase ? [] : getInitialData().users
  );
  const [loading, setLoading] = useState(useSupabase);

  // Carregar dados do Supabase se configurado
  useEffect(() => {
    if (!useSupabase || !supabase) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Carregar residents
        const { data: residentsData, error: residentsError } = await supabase
          .from('residents')
          .select('*')
          .order('apartment_number');
        
        if (residentsError) throw residentsError;
        setResidents((residentsData || []).map(mapResidentFromDB));

        // Carregar payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .order('date', { ascending: false });
        
        if (paymentsError) throw paymentsError;
        setPayments((paymentsData || []).map(mapPaymentFromDB));

        // Carregar expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });
        
        if (expensesError) throw expensesError;
        setExpenses((expensesData || []).map(mapExpenseFromDB));

        // Carregar users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');
        
        if (usersError) throw usersError;
        setUsers((usersData || []).map(mapUserFromDB));

      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // Fallback para localStorage em caso de erro
        const localData = getInitialData();
        setResidents(localData.residents);
        setPayments(localData.payments);
        setExpenses(localData.expenses);
        setUsers(localData.users);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [useSupabase]);

  // Salvar no localStorage apenas se não estiver usando Supabase
  useEffect(() => {
    if (!useSupabase) {
      try {
        const dataToStore = JSON.stringify({ residents, payments, expenses, users });
        window.localStorage.setItem(CONDO_DATA_KEY, dataToStore);
      } catch (error) {
        console.warn('Error writing to localStorage:', error);
      }
    }
  }, [residents, payments, expenses, users, useSupabase]);
  
  const addResident = async (resident: Omit<Resident, 'id'>) => {
    if (useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('residents')
          .insert([{
            owner_name: resident.ownerName,
            tenant_name: resident.tenantName,
            apartment_number: resident.apartmentNumber
          }])
          .select()
          .single();
        
        if (error) throw error;
        setResidents(prev => [...prev, mapResidentFromDB(data)]);
      } catch (error) {
        console.error('Error adding resident:', error);
      }
    } else {
      const newResident = { ...resident, id: `res-${Date.now()}` };
      setResidents(prev => [...prev, newResident]);
    }
  };

  const deleteResident = async (id: string) => {
    if (useSupabase && supabase) {
      try {
        const { error } = await supabase
          .from('residents')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        setResidents(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting resident:', error);
      }
    } else {
      setResidents(prev => prev.filter(r => r.id !== id));
    }
  };

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    if (useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .insert([{
            apartment_number: payment.apartmentNumber,
            amount: payment.amount,
            date: payment.date,
            month: payment.month,
            year: payment.year
          }])
          .select()
          .single();
        
        if (error) throw error;
        setPayments(prev => [...prev, mapPaymentFromDB(data)]);
      } catch (error) {
        console.error('Error adding payment:', error);
      }
    } else {
      const newPayment = { ...payment, id: `pay-${Date.now()}` };
      setPayments(prev => [...prev, newPayment]);
    }
  };

  const deletePayment = async (id: string) => {
    if (useSupabase && supabase) {
      try {
        const { error } = await supabase
          .from('payments')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        setPayments(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    } else {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .insert([{
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: expense.date
          }])
          .select()
          .single();
        
        if (error) throw error;
        setExpenses(prev => [...prev, mapExpenseFromDB(data)]);
      } catch (error) {
        console.error('Error adding expense:', error);
      }
    } else {
      const newExpense = { ...expense, id: `exp-${Date.now()}` };
      setExpenses(prev => [...prev, newExpense]);
    }
  };

  const deleteExpense = async (id: string) => {
    if (useSupabase && supabase) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        setExpenses(prev => prev.filter(e => e.id !== id));
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    } else {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    if (useSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([{
            name: user.name,
            email: user.email,
            role: user.role,
            apartment_number: user.apartmentNumber
          }])
          .select()
          .single();
        
        if (error) throw error;
        setUsers(prev => [...prev, mapUserFromDB(data)]);
      } catch (error) {
        console.error('Error adding user:', error);
      }
    } else {
      const newUser = { ...user, id: `usr-${Date.now()}` };
      setUsers(prev => [...prev, newUser]);
    }
  };

  const deleteUser = async (id: string) => {
    if (useSupabase && supabase) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    } else {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return { 
    residents, 
    payments, 
    expenses, 
    users,
    loading,
    addResident, 
    addPayment, 
    addExpense, 
    addUser,
    deleteResident, 
    deletePayment, 
    deleteExpense, 
    deleteUser
  };
};