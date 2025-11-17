
import React, { useState } from 'react';
import { useCondo } from '../context/CondoDataContext';
import Modal from '../components/Modal';
import { APARTMENT_NUMBERS } from '../constants';
import type { Resident } from '../types';
import { PlusCircle, Trash2, User, Building2 } from 'lucide-react';

const Residents: React.FC = () => {
  const { residents, addResident, deleteResident } = useCondo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newResident, setNewResident] = useState<Omit<Resident, 'id'>>({
    ownerName: '',
    tenantName: '',
    apartmentNumber: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewResident(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newResident.ownerName && newResident.apartmentNumber) {
      addResident(newResident);
      setNewResident({ ownerName: '', tenantName: '', apartmentNumber: 1 });
      setIsModalOpen(false);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestão de Moradores</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Adicionar Morador
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Apartamento</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Proprietário</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Inquilino</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {residents.sort((a,b) => a.apartmentNumber - b.apartmentNumber).map((resident) => (
              <tr key={resident.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm">
                    <div className="flex items-center">
                        <Building2 className="w-5 h-5 text-gray-500 mr-3"/>
                        <p className="text-gray-900 dark:text-white whitespace-no-wrap">Apto {resident.apartmentNumber}</p>
                    </div>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm">
                    <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-500 mr-3"/>
                        <p className="text-gray-900 dark:text-white whitespace-no-wrap">{resident.ownerName}</p>
                    </div>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm">
                  <p className="text-gray-900 dark:text-white whitespace-no-wrap">{resident.tenantName || 'N/D'}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-600 text-sm text-right">
                  <button onClick={() => deleteResident(resident.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Novo Morador">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="apartmentNumber">
              Número do Apartamento
            </label>
            <select
              name="apartmentNumber"
              id="apartmentNumber"
              value={newResident.apartmentNumber}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              {APARTMENT_NUMBERS.map(num => <option key={num} value={num}>{num}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="ownerName">
              Nome do Proprietário
            </label>
            <input
              type="text"
              name="ownerName"
              id="ownerName"
              value={newResident.ownerName}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="tenantName">
              Nome do Inquilino (Opcional)
            </label>
            <input
              type="text"
              name="tenantName"
              id="tenantName"
              value={newResident.tenantName}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex justify-end mt-6">
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors">
              Adicionar Morador
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Residents;