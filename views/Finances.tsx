
import React, { useState, useMemo } from 'react';
import { useCondo } from '../context/CondoDataContext';
import Modal from '../components/Modal';
import { APARTMENT_NUMBERS, EXPENSE_CATEGORIES, MONTH_NAMES } from '../constants';
import type { Payment, Expense } from '../types';
import { PlusCircle, Trash2, Edit2, Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const Finances: React.FC = () => {
  const [activeTab, setActiveTab] = useState('income');
  const { payments, expenses, addPayment, updatePayment, deletePayment, addExpense, updateExpense, deleteExpense } = useCondo();
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Filtros de mês e ano
  const [filterMonth, setFilterMonth] = useState<number | null>(null); // null = todos os meses
  const [filterYear, setFilterYear] = useState<number | null>(null); // null = todos os anos

  const [newPayment, setNewPayment] = useState<Omit<Payment, 'id'>>({
    apartmentNumber: 1,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    description: '',
    amount: 0,
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
  });

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentData = { ...newPayment, amount: Number(newPayment.amount) };
    if (editingPayment) {
      updatePayment(editingPayment.id, paymentData);
      setEditingPayment(null);
    } else {
      addPayment(paymentData);
    }
    setPaymentModalOpen(false);
    setNewPayment({
      apartmentNumber: 1, amount: 0, date: new Date().toISOString().split('T')[0],
      month: new Date().getMonth() + 1, year: new Date().getFullYear()
    });
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData = { ...newExpense, amount: Number(newExpense.amount) };
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
      setEditingExpense(null);
    } else {
      addExpense(expenseData);
    }
    setExpenseModalOpen(false);
    setNewExpense({
      description: '', amount: 0, category: EXPENSE_CATEGORIES[0], date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    const paymentDate = new Date(payment.date);
    setNewPayment({
      apartmentNumber: payment.apartmentNumber,
      amount: payment.amount,
      date: paymentDate.toISOString().split('T')[0],
      month: payment.month || paymentDate.getMonth() + 1,
      year: payment.year || paymentDate.getFullYear()
    });
    setPaymentModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    const expenseDate = new Date(expense.date);
    setNewExpense({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expenseDate.toISOString().split('T')[0]
    });
    setExpenseModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setEditingPayment(null);
    setNewPayment({
      apartmentNumber: 1, amount: 0, date: new Date().toISOString().split('T')[0],
      month: new Date().getMonth() + 1, year: new Date().getFullYear()
    });
  };

  const handleCloseExpenseModal = () => {
    setExpenseModalOpen(false);
    setEditingExpense(null);
    setNewExpense({
      description: '', amount: 0, category: EXPENSE_CATEGORIES[0], date: new Date().toISOString().split('T')[0]
    });
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  // Filtrar pagamentos e despesas
  const filteredPayments = useMemo(() => {
    if (filterMonth === null && filterYear === null) return payments;
    
    return payments.filter(p => {
      const paymentDate = new Date(p.date);
      const paymentMonth = paymentDate.getMonth() + 1;
      const paymentYear = paymentDate.getFullYear();
      
      const monthMatch = filterMonth === null || (p.month ? p.month === filterMonth : paymentMonth === filterMonth);
      const yearMatch = filterYear === null || (p.year ? p.year === filterYear : paymentYear === filterYear);
      
      return monthMatch && yearMatch;
    });
  }, [payments, filterMonth, filterYear]);

  const filteredExpenses = useMemo(() => {
    if (filterMonth === null && filterYear === null) return expenses;
    
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      const expenseMonth = expenseDate.getMonth() + 1;
      const expenseYear = expenseDate.getFullYear();
      
      const monthMatch = filterMonth === null || expenseMonth === filterMonth;
      const yearMatch = filterYear === null || expenseYear === filterYear;
      
      return monthMatch && yearMatch;
    });
  }, [expenses, filterMonth, filterYear]);

  // Gerar lista de anos disponíveis
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  }, []);

  const handleResetFilters = () => {
    setFilterMonth(null);
    setFilterYear(null);
  };

  const tabClasses = (tabName: string) => 
    `px-4 py-2 text-sm font-medium rounded-t-lg ${
      activeTab === tabName
        ? 'text-primary-600 border-b-2 border-primary-600'
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
    }`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Finanças</h1>
        <button
          onClick={() => activeTab === 'income' ? setPaymentModalOpen(true) : setExpenseModalOpen(true)}
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          {activeTab === 'income' ? 'Adicionar Pagamento' : 'Adicionar Despesa'}
        </button>
      </div>

      {/* Filtros de Mês e Ano */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar:</span>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filterMonth || ''}
              onChange={(e) => setFilterMonth(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos os meses</option>
              {MONTH_NAMES.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>

            <select
              value={filterYear || ''}
              onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos os anos</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {(filterMonth !== null || filterYear !== null) && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button className={tabClasses('income')} onClick={() => setActiveTab('income')}>
            Receitas {filterMonth !== null || filterYear !== null ? `(${filteredPayments.length})` : `(${payments.length})`}
          </button>
          <button className={tabClasses('expenses')} onClick={() => setActiveTab('expenses')}>
            Despesas {filterMonth !== null || filterYear !== null ? `(${filteredExpenses.length})` : `(${expenses.length})`}
          </button>
        </nav>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        {activeTab === 'income' ? (
          <IncomeTable payments={filteredPayments} deletePayment={deletePayment} editPayment={handleEditPayment} formatCurrency={formatCurrency} />
        ) : (
          <ExpenseTable expenses={filteredExpenses} deleteExpense={deleteExpense} editExpense={handleEditExpense} formatCurrency={formatCurrency} />
        )}
      </div>

      <Modal isOpen={isPaymentModalOpen} onClose={handleClosePaymentModal} title={editingPayment ? "Editar Pagamento" : "Adicionar Novo Pagamento"}>
        <form onSubmit={handlePaymentSubmit}>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Apartamento</label>
                <select value={newPayment.apartmentNumber} onChange={e => setNewPayment({...newPayment, apartmentNumber: Number(e.target.value)})} className="w-full p-2 border rounded bg-white dark:bg-gray-700">
                {APARTMENT_NUMBERS.map(num => <option key={num} value={num}>{num}</option>)}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Valor</label>
                <input type="number" step="0.01" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: Number(e.target.value)})} className="w-full p-2 border rounded bg-white dark:bg-gray-700" required/>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Data</label>
                <input 
                  type="date" 
                  value={newPayment.date} 
                  onChange={e => {
                    const selectedDate = new Date(e.target.value);
                    setNewPayment({
                      ...newPayment, 
                      date: e.target.value,
                      month: selectedDate.getMonth() + 1,
                      year: selectedDate.getFullYear()
                    });
                  }} 
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700" 
                  required
                />
            </div>
            <div className="flex justify-end mt-6">
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700">{editingPayment ? "Salvar Alterações" : "Adicionar Pagamento"}</button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isExpenseModalOpen} onClose={handleCloseExpenseModal} title={editingExpense ? "Editar Despesa" : "Adicionar Nova Despesa"}>
        <form onSubmit={handleExpenseSubmit}>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Descrição</label>
                <input type="text" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full p-2 border rounded bg-white dark:bg-gray-700" required/>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Valor</label>
                <input type="number" step="0.01" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} className="w-full p-2 border rounded bg-white dark:bg-gray-700" required/>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Categoria</label>
                <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full p-2 border rounded bg-white dark:bg-gray-700">
                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Data</label>
                <input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full p-2 border rounded bg-white dark:bg-gray-700" required/>
            </div>
            <div className="flex justify-end mt-6">
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700">{editingExpense ? "Salvar Alterações" : "Adicionar Despesa"}</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};


const IncomeTable: React.FC<{payments: Payment[], deletePayment: (id: string) => void, editPayment: (payment: Payment) => void, formatCurrency: (v: number) => string}> = ({payments, deletePayment, editPayment, formatCurrency}) => (
    <table className="min-w-full leading-normal">
        <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Apartamento</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Valor</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Data</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600"></th>
            </tr>
        </thead>
        <tbody>
        {payments.map(payment => (
            <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm"><p className="text-gray-900 dark:text-white">Apto {payment.apartmentNumber}</p></td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm"><p className="text-green-600 dark:text-green-400 font-semibold">{formatCurrency(payment.amount)}</p></td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm"><p className="text-gray-900 dark:text-white">{new Date(payment.date).toLocaleDateString('pt-BR')}</p></td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => editPayment(payment)} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-5 h-5" /></button>
                        <button onClick={() => deletePayment(payment.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                    </div>
                </td>
            </tr>
        ))}
        </tbody>
    </table>
);

const ExpenseTable: React.FC<{expenses: Expense[], deleteExpense: (id: string) => void, editExpense: (expense: Expense) => void, formatCurrency: (v: number) => string}> = ({expenses, deleteExpense, editExpense, formatCurrency}) => (
    <table className="min-w-full leading-normal">
        <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Descrição</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Categoria</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Valor</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Data</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600"></th>
            </tr>
        </thead>
        <tbody>
        {expenses.map(expense => (
            <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm"><p className="text-gray-900 dark:text-white">{expense.description}</p></td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm"><span className="relative inline-block px-3 py-1 font-semibold text-purple-900 leading-tight"><span aria-hidden className="absolute inset-0 bg-purple-200 opacity-50 rounded-full"></span><span className="relative">{expense.category}</span></span></td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm"><p className="text-red-600 dark:text-red-400 font-semibold">{formatCurrency(expense.amount)}</p></td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm"><p className="text-gray-900 dark:text-white">{new Date(expense.date).toLocaleDateString('pt-BR')}</p></td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => editExpense(expense)} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-5 h-5" /></button>
                        <button onClick={() => deleteExpense(expense.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                    </div>
                </td>
            </tr>
        ))}
        </tbody>
    </table>
);

export default Finances;