// EXEMPLO: Como atualizar useCondoData.ts para usar Supabase
// Este é um exemplo de referência. Você precisará adaptar seu hook atual.

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Resident, Payment, Expense, User } from '../types';
import { UserRole } from '../types';

export const useCondoData = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar residents
        const { data: residentsData, error: residentsError } = await supabase
          .from('residents')
          .select('*')
          .order('apartment_number');
        
        if (residentsError) throw residentsError;
        setResidents(residentsData || []);

        // Carregar payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .order('date', { ascending: false });
        
        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);

        // Carregar expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });
        
        if (expensesError) throw expensesError;
        setExpenses(expensesData || []);

        // Carregar users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');
        
        if (usersError) throw usersError;
        setUsers(usersData || []);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addResident = async (resident: Omit<Resident, 'id'>) => {
    const { data, error } = await supabase
      .from('residents')
      .insert([{
        owner_name: resident.ownerName,
        tenant_name: resident.tenantName,
        apartment_number: resident.apartmentNumber
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding resident:', error);
      return;
    }
    
    setResidents(prev => [...prev, {
      id: data.id,
      ownerName: data.owner_name,
      tenantName: data.tenant_name,
      apartmentNumber: data.apartment_number
    }]);
  };

  const deleteResident = async (id: string) => {
    const { error } = await supabase
      .from('residents')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting resident:', error);
      return;
    }
    
    setResidents(prev => prev.filter(r => r.id !== id));
  };

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
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
    
    if (error) {
      console.error('Error adding payment:', error);
      return;
    }
    
    setPayments(prev => [...prev, {
      id: data.id,
      apartmentNumber: data.apartment_number,
      amount: data.amount,
      date: data.date,
      month: data.month,
      year: data.year
    }]);
  };

  const deletePayment = async (id: string) => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting payment:', error);
      return;
    }
    
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
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
    
    if (error) {
      console.error('Error adding expense:', error);
      return;
    }
    
    setExpenses(prev => [...prev, {
      id: data.id,
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date
    }]);
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting expense:', error);
      return;
    }
    
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addUser = async (user: Omit<User, 'id'>) => {
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
    
    if (error) {
      console.error('Error adding user:', error);
      return;
    }
    
    setUsers(prev => [...prev, {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      apartmentNumber: data.apartment_number
    }]);
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting user:', error);
      return;
    }
    
    setUsers(prev => prev.filter(u => u.id !== id));
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

