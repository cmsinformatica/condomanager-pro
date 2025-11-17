
import React, { useState } from 'react';
import { useCondo } from '../context/CondoDataContext';
import Modal from '../components/Modal';
import { UserRole } from '../types';
import type { User } from '../types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { APARTMENT_NUMBERS } from '../constants';

const UserManagement: React.FC = () => {
  const { users, addUser, deleteUser } = useCondo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    name: '',
    email: '',
    role: UserRole.RESIDENT,
    apartmentNumber: 1
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setNewUser(prev => ({
        ...prev,
        role,
        apartmentNumber: role === UserRole.ADMIN ? undefined : prev.apartmentNumber
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name && newUser.email) {
      addUser(newUser);
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', role: UserRole.RESIDENT, apartmentNumber: 1 });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestão de Usuários</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Adicionar Usuário
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nome</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Função</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Apartamento</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm"><p className="text-gray-900 dark:text-white">{user.name}</p></td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm"><p className="text-gray-900 dark:text-white">{user.email}</p></td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === UserRole.ADMIN ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user.role}
                   </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm"><p className="text-gray-900 dark:text-white">{user.apartmentNumber || 'N/D'}</p></td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm text-right">
                  <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Novo Usuário">
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Nome</label>
                <input type="text" name="name" value={newUser.name} onChange={handleInputChange} className="w-full p-2 border rounded bg-white dark:bg-gray-700" required/>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Email</label>
                <input type="email" name="email" value={newUser.email} onChange={handleInputChange} className="w-full p-2 border rounded bg-white dark:bg-gray-700" required/>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Função</label>
                <select name="role" value={newUser.role} onChange={handleRoleChange} className="w-full p-2 border rounded bg-white dark:bg-gray-700">
                    <option value={UserRole.ADMIN}>Administrador</option>
                    <option value={UserRole.RESIDENT}>Morador</option>
                </select>
            </div>
            {newUser.role === UserRole.RESIDENT && (
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Apartamento</label>
                    <select name="apartmentNumber" value={newUser.apartmentNumber} onChange={handleInputChange} className="w-full p-2 border rounded bg-white dark:bg-gray-700">
                        {APARTMENT_NUMBERS.map(num => <option key={num} value={num}>{num}</option>)}
                    </select>
                </div>
            )}
            <div className="flex justify-end mt-6">
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700">Adicionar Usuário</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;