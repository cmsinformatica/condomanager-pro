import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CircleDollarSign, UserCog, Building, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Painel do Admin' },
    { to: '/residents', icon: Users, label: 'Moradores' },
    { to: '/finances', icon: CircleDollarSign, label: 'Finanças' },
    { to: '/users', icon: UserCog, label: 'Gestão de Usuários' },
    { to: '/resident-view', icon: Building, label: 'Visão do Morador' },
  ];

  const linkClasses = "flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-200 transition-colors duration-200";
  const activeLinkClasses = "bg-primary-500 text-white";
  const inactiveLinkClasses = "hover:bg-gray-200 dark:hover:bg-gray-700";

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
        <Building className="h-8 w-8 text-primary-500" />
        <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">CondoManager</span>
      </div>
      <nav className="flex-1 px-2 py-4">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) => 
              `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses} rounded-lg`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="mx-4 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-2 py-4 border-t dark:border-gray-700">
         {currentUser && (
            <div className="flex items-center p-2 mb-4">
                <UserCircle className="w-10 h-10 text-gray-500" />
                <div className="ml-3">
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                </div>
            </div>
        )}
        <button
          onClick={handleLogout}
          className={`${linkClasses} ${inactiveLinkClasses} w-full rounded-lg`}
        >
          <LogOut className="w-5 h-5" />
          <span className="mx-4 font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
