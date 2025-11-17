import React, { useMemo, useState } from 'react';
import { useCondo } from '../context/CondoDataContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MONTH_NAMES, APARTMENT_NUMBERS } from '../constants';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const EXPENSE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19D5FF', '#FFD519', '#8A2BE2'];
const DELINQUENCY_COLORS = ['#22c55e', '#ef4444']; // Verde para Pagos, Vermelho para Inadimplentes
const INCOME_EXPENSE_COLORS = ['#3b82f6', '#f97316']; // Azul para Receitas, Laranja para Despesas

const ChartCard: React.FC<{ title: string; children: React.ReactNode; footer?: React.ReactNode }> = ({ title, children, footer }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col h-full">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">{title}</h3>
        <div className="flex-grow">
            {children}
        </div>
        {footer && <div className="text-center mt-4">{footer}</div>}
    </div>
);


const ResidentView: React.FC = () => {
  const { expenses, payments } = useCondo();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const currentMonth = selectedMonth - 1; // Para usar com Date (0-11)
  const currentYear = selectedYear;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
  
  const { paidCount, delinquentCount, delinquencyData } = useMemo(() => {
    const totalApartments = APARTMENT_NUMBERS.length;
    const paidApartments = new Set(
        payments
            .filter(p => new Date(p.date).getMonth() === currentMonth && new Date(p.date).getFullYear() === currentYear)
            .map(p => p.apartmentNumber)
    );
    const paidCount = paidApartments.size;
    const delinquentCount = totalApartments - paidCount;

    return {
        paidCount,
        delinquentCount,
        delinquencyData: [
            { name: 'Pagos', value: paidCount },
            { name: 'Inadimplentes', value: delinquentCount }
        ]
    };
  }, [payments, currentMonth, currentYear]);


  const { totalMonthlyIncome, totalMonthlyExpense, incomeVsExpenseData } = useMemo(() => {
     const income = payments
      .filter(p => new Date(p.date).getMonth() === currentMonth && new Date(p.date).getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.amount, 0);

    const expense = expenses
      .filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
        totalMonthlyIncome: income,
        totalMonthlyExpense: expense,
        incomeVsExpenseData: [
            { name: 'Receitas', value: income },
            { name: 'Despesas', value: expense }
        ]
    }
  }, [payments, expenses, currentMonth, currentYear]);

  const monthlyExpenseData = useMemo(() => {
    const currentMonthExpenses = expenses.filter(
      (e) => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear
    );

    const expenseByCategory = currentMonthExpenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as { [key: string]: number });
    
    return Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  }, [expenses, currentMonth, currentYear]);

  // Gerar lista de anos disponíveis
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  }, []);

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleResetToCurrent = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  };

  const renderPercentLabel = ({ percent }: any) => `${(percent * 100).toFixed(0)}%`;

  const isCurrentMonth = selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
                <Building className="h-8 w-8 text-primary-500" />
                <h1 className="ml-3 text-3xl font-bold text-gray-800 dark:text-white">Painel do Morador</h1>
            </div>
            <Link to="/login" className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
            </Link>
        </div>

        {/* Filtros de Mês e Ano */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visualizar:</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreviousMonth}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Mês anterior"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {MONTH_NAMES.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Próximo mês"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {!isCurrentMonth && (
                <button
                  onClick={handleResetToCurrent}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Mês Atual
                </button>
              )}
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Resumo Financeiro de {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ChartCard 
                title="Taxa de Inadimplência"
                footer={
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-bold text-green-500">{paidCount}</span> de <span className="font-bold">{APARTMENT_NUMBERS.length}</span> apartamentos pagaram.
                    </p>
                }
            >
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={delinquencyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={renderPercentLabel} labelLine={false}>
                            {delinquencyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={DELINQUENCY_COLORS[index % DELINQUENCY_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} aptos`, name]} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard 
                title="Receitas vs. Despesas"
                footer={
                    <h3 className={`text-lg font-bold ${totalMonthlyIncome >= totalMonthlyExpense ? 'text-green-500' : 'text-red-500'}`}>
                        Saldo do Mês: {formatCurrency(totalMonthlyIncome - totalMonthlyExpense)}
                    </h3>
                }
            >
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={incomeVsExpenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={renderPercentLabel} labelLine={false}>
                            {incomeVsExpenseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={INCOME_EXPENSE_COLORS[index % INCOME_EXPENSE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard 
                title="Detalhamento das Despesas"
                footer={
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        Despesa Total: {formatCurrency(totalMonthlyExpense)}
                    </h3>
                }
            >
            {monthlyExpenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={monthlyExpenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5}>
                    {monthlyExpenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Valor"]} />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">Não há dados de despesas para este mês.</p>
                </div>
            )}
            </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default ResidentView;