import React, { useState, useRef } from 'react';
import { Product, Person, OutputLog } from '../types';
import { CameraIcon } from './icons';
import BarcodeScanner from './BarcodeScanner';

interface OutputFormProps {
  products: Product[];
  people: Person[];
  onSubmit: (outputLog: Omit<OutputLog, 'id' | 'timestamp' | 'productName' | 'personName'>) => Promise<boolean>; // Returns true on success
  onClose: () => void;
}

const OutputForm: React.FC<OutputFormProps> = ({ products, people, onSubmit, onClose }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [searchCode, setSearchCode] = useState('');

  // Ref for the search input to focus it automatically if needed
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!selectedProductId) {
      setError('Por favor, selecione um produto.');
      setIsSubmitting(false);
      return;
    }
    if (!selectedPersonId) {
      setError('Por favor, selecione uma pessoa.');
      setIsSubmitting(false);
      return;
    }
    if (quantity <= 0) {
      setError('A quantidade deve ser maior que zero.');
      setIsSubmitting(false);
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (product && quantity > product.quantity) {
      setError(`Não é possível registrar a saída de ${quantity} itens. Apenas ${product.quantity} disponíveis para ${product.name}.`);
      setIsSubmitting(false);
      return;
    }

    const success = await onSubmit({
      productId: selectedProductId,
      personId: selectedPersonId,
      quantity,
    });

    setIsSubmitting(false);
    if (success) {
      // onClose will be called by App.tsx after successful submission and data refresh
    }
  };

  const findAndSelectProduct = (code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    // Search by SKU, Serial Number, or Asset Tag
    const product = products.find(p =>
      p.sku.toLowerCase() === trimmedCode.toLowerCase() ||
      p.serialNumber?.toLowerCase() === trimmedCode.toLowerCase() ||
      p.assetTag?.toLowerCase() === trimmedCode.toLowerCase()
    );

    if (product) {
      if (product.quantity > 0) {
        setSelectedProductId(product.id);
        setError('');
        // Optional: Play a short beep sound here
      } else {
        setError(`Produto "${product.name}" encontrado, mas está SEM ESTOQUE.`);
      }
    } else {
      setError(`Produto com código "${trimmedCode}" não encontrado.`);
    }
  };

  const handleScan = (code: string) => {
    setSearchCode(code);
    findAndSelectProduct(code);
    setScannerOpen(false);
  };

  // Handle "Enter" key in search input (common for USB scanners)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      findAndSelectProduct(searchCode);
    }
  };

  const formFieldClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm";
  const labelClasses = "block text-sm font-medium text-neutral-DEFAULT";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded-md">{error}</p>}

      {/* Search / Scan Field */}
      <div className="bg-neutral-light p-3 rounded-md border border-neutral-200 mb-4">
        <label htmlFor="scanInput" className="block text-sm font-bold text-neutral-dark mb-1">
          🔍 Busca Rápida (Scanner USB ou Digite)
        </label>
        <div className="flex gap-2">
          <input
            ref={searchInputRef}
            type="text"
            id="scanInput"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className={formFieldClasses}
            placeholder="Clique aqui e use o leitor de código de barras..."
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="mt-1 p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-neutral-dark shadow-sm"
            title="Usar Câmera"
          >
            <CameraIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-neutral-DEFAULT mt-1 ml-1">
          Pressione <strong>Enter</strong> após digitar se não usar leitor automático.
        </p>
      </div>

      <div>
        <label htmlFor="outputProduct" className={labelClasses}>Produto Selecionado <span className="text-red-500">*</span></label>
        <select
          id="outputProduct"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className={formFieldClasses}
          required
          disabled={isSubmitting}
        >
          <option value="">Selecione um produto...</option>
          {products.filter(p => p.quantity > 0).map(product => (
            <option key={product.id} value={product.id}>
              {product.name} (SKU: {product.sku}) - Qtd: {product.quantity}
            </option>
          ))}
        </select>
        {selectedProductId && (
          <p className="text-sm text-green-600 mt-1">✅ Produto selecionado.</p>
        )}
      </div>

      <div>
        <label htmlFor="outputPerson" className={labelClasses}>Pessoa <span className="text-red-500">*</span></label>
        <select
          id="outputPerson"
          value={selectedPersonId}
          onChange={(e) => setSelectedPersonId(e.target.value)}
          className={formFieldClasses}
          required
          disabled={isSubmitting}
        >
          <option value="">Selecione uma pessoa</option>
          {people.map(person => (
            <option key={person.id} value={person.id}>{person.name}</option>
          ))}
        </select>
        {people.length === 0 && <p className="text-sm text-amber-600 mt-1">Nenhuma pessoa cadastrada.</p>}
      </div>

      <div>
        <label htmlFor="outputQuantity" className={labelClasses}>Quantidade <span className="text-red-500">*</span></label>
        <input
          type="number"
          id="outputQuantity"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className={formFieldClasses}
          min="1"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-neutral-dark bg-neutral-light rounded-md hover:bg-gray-200 transition-colors"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-white text-neutral-dark rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm ring-1 ring-gray-300"
          disabled={!selectedProductId || !selectedPersonId || isSubmitting}
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Saída'}
        </button>
      </div>

      {/* Scanner Modal */}
      <BarcodeScanner
        isOpen={scannerOpen}
        onScan={handleScan}
        onClose={() => setScannerOpen(false)}
      />
    </form>
  );
};

export default OutputForm;
