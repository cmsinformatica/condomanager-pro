
import React, { useMemo } from 'react';
import { useCondo } from '../context/CondoDataContext';
import DashboardCard from '../components/DashboardCard';
import { DollarSign, Landmark, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MONTH_NAMES } from '../constants';

const Dashboard: React.FC = () => {
  const { payments, expenses } = useCondo();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyData = useMemo(() => {
    const monthlyIncome = payments
      .filter(p => new Date(p.date).getMonth() === currentMonth && new Date(p.date).getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyExpenses = expenses
      .filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      income: monthlyIncome,
      expenses: monthlyExpenses,
      balance: monthlyIncome - monthlyExpenses,
    };
  }, [payments, expenses, currentMonth, currentYear]);

  const annualChartData = useMemo(() => {
    return MONTH_NAMES.map((month, index) => {
      const monthlyIncome = payments
        .filter(p => new Date(p.date).getMonth() === index && new Date(p.date).getFullYear() === currentYear)
        .reduce((sum, p) => sum + p.amount, 0);
      const monthlyExpenses = expenses
        .filter(e => new Date(e.date).getMonth() === index && new Date(e.date).getFullYear() === currentYear)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        name: month.substring(0, 3),
        Receita: monthlyIncome,
        Despesas: monthlyExpenses,
      };
    });
  }, [payments, expenses, currentYear]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Painel do Administrador</h1>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Resumo do Mês ({MONTH_NAMES[currentMonth]} {currentYear})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard title="Receita Mensal" value={formatCurrency(monthlyData.income)} icon={<ArrowUpCircle />} color="bg-green-500" />
        <DashboardCard title="Despesas Mensais" value={formatCurrency(monthlyData.expenses)} icon={<ArrowDownCircle />} color="bg-red-500" />
        <DashboardCard title="Saldo Mensal" value={formatCurrency(monthlyData.balance)} icon={<DollarSign />} color={monthlyData.balance >= 0 ? "bg-blue-500" : "bg-yellow-500"}/>
      </div>

      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Visão Geral Financeira Anual ({currentYear})</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={annualChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(Number(value))}/>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="Receita" fill="#22c55e" />
            <Bar dataKey="Despesas" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;