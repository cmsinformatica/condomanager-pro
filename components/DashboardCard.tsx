import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  // FIX: Updated the type of `icon` to be more specific.
  // This informs TypeScript that the element can accept a `className` prop,
  // which resolves the type error in the `React.cloneElement` call.
  icon: React.ReactElement<{ className?: string }>;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex items-center">
      <div className={`p-3 rounded-full ${color}`}>
        {React.cloneElement(icon, { className: "h-6 w-6 text-white" })}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
