
import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { CameraIcon } from './icons';
import BarcodeScanner from './BarcodeScanner';

interface ProductFormProps {
  onSubmit: (product: Product) => void;
  onClose: () => void;
  initialData?: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onClose, initialData }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [macAddress, setMacAddress] = useState<string>('');
  const [assetTag, setAssetTag] = useState<string>('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeScanField, setActiveScanField] = useState<'sku' | 'serial' | 'asset'>('sku');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSku(initialData.sku);
      setQuantity(initialData.quantity);
      setPrice(initialData.price);
      setDescription(initialData.description);
      setImageUrl(initialData.imageUrl);
      setSerialNumber(initialData.serialNumber || '');
      setMacAddress(initialData.macAddress || '');
      setAssetTag(initialData.assetTag || '');
    } else {
      setName('');
      setSku('');
      setQuantity(0);
      setPrice(0);
      setDescription('');
      setImageUrl(undefined);
      setSerialNumber('');
      setMacAddress('');
      setAssetTag('');
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !sku.trim()) {
      setError('Nome do Produto e SKU são obrigatórios.');
      return;
    }
    if (quantity < 0) {
      setError('A quantidade não pode ser negativa.');
      return;
    }
    if (price < 0) {
      setError('O preço não pode ser negativo.');
      return;
    }

    onSubmit({
      id: initialData?.id || Date.now().toString(),
      name,
      sku,
      quantity,
      price,
      description,
      imageUrl,
      serialNumber: serialNumber || undefined,
      macAddress: macAddress || undefined,
      assetTag: assetTag || undefined,
    });
  };

  const openScanner = (field: 'sku' | 'serial' | 'asset') => {
    setActiveScanField(field);
    setIsScannerOpen(true);
  };

  const handleScan = (code: string) => {
    if (activeScanField === 'sku') setSku(code);
    if (activeScanField === 'serial') setSerialNumber(code);
    if (activeScanField === 'asset') setAssetTag(code);
    setIsScannerOpen(false);
  };

  const formFieldClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm";
  const labelClasses = "block text-sm font-medium text-neutral-DEFAULT";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded-md">{error}</p>}
      
      {/* Nome */}
      <div>
        <label htmlFor="productName" className={labelClasses}>Nome do Produto <span className="text-red-500">*</span></label>
        <input type="text" id="productName" value={name} onChange={(e) => setName(e.target.value)} className={formFieldClasses} required />
      </div>

      {/* SKU com Scanner */}
      <div>
        <label htmlFor="productSku" className={labelClasses}>SKU <span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          <input type="text" id="productSku" value={sku} onChange={(e) => setSku(e.target.value)} className={formFieldClasses} required />
          <button
            type="button"
            onClick={() => openScanner('sku')}
            className="mt-1 p-2 bg-neutral-light border border-gray-300 rounded-md hover:bg-gray-200 text-neutral-dark"
            title="Escanear SKU"
          >
            <CameraIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="productQuantity" className={labelClasses}>Quantidade</label>
          <input type="number" id="productQuantity" value={quantity} onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))} className={formFieldClasses} min="0" />
        </div>
        <div>
          <label htmlFor="productPrice" className={labelClasses}>Preço (R$)</label>
          <input type="number" id="productPrice" value={price} onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))} step="0.01" className={formFieldClasses} min="0" />
        </div>
      </div>

      <div>
        <label htmlFor="productDescription" className={labelClasses}>Descrição</label>
        <textarea id="productDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={formFieldClasses}></textarea>
      </div>

      <div>
        <label htmlFor="productImage" className={labelClasses}>Imagem do Produto (Opcional)</label>
        <input
          type="file"
          id="productImage"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className={`${formFieldClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-blue-200`}
        />
        {imageUrl && (
          <div className="mt-2">
            <img src={imageUrl} alt="Pré-visualização" className="h-24 w-24 object-cover rounded-md border border-gray-300" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="mt-1 text-xs text-red-500 hover:text-red-700"
            >
              Remover Imagem
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-sm font-medium text-neutral-DEFAULT mb-3">📷 Informações de Câmera (Opcional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tombo/Patrimônio com Scanner */}
          <div>
            <label htmlFor="assetTag" className={labelClasses}>Tombo/Patrimônio</label>
            <div className="flex gap-2">
                <input
                type="text"
                id="assetTag"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className={formFieldClasses}
                placeholder="243-366"
                />
                <button
                type="button"
                onClick={() => openScanner('asset')}
                className="mt-1 p-2 bg-neutral-light border border-gray-300 rounded-md hover:bg-gray-200 text-neutral-dark"
                title="Escanear Patrimônio"
                >
                <CameraIcon className="w-5 h-5" />
                </button>
            </div>
          </div>

          <div>
            <label htmlFor="macAddress" className={labelClasses}>Endereço MAC</label>
            <input
              type="text"
              id="macAddress"
              value={macAddress}
              onChange={(e) => setMacAddress(e.target.value)}
              className={formFieldClasses}
              placeholder="546CAC0FFEB8"
            />
          </div>

          {/* Número de Série com Scanner */}
          <div>
            <label htmlFor="serialNumber" className={labelClasses}>Número de Série</label>
            <div className="flex gap-2">
                <input
                type="text"
                id="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className={formFieldClasses}
                placeholder="LF9M4300824J7"
                />
                <button
                type="button"
                onClick={() => openScanner('serial')}
                className="mt-1 p-2 bg-neutral-light border border-gray-300 rounded-md hover:bg-gray-200 text-neutral-dark"
                title="Escanear Série"
                >
                <CameraIcon className="w-5 h-5" />
                </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-dark bg-neutral-light rounded-md hover:bg-gray-200 transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium bg-white text-neutral-dark rounded-md hover:bg-gray-50 transition-colors shadow-sm ring-1 ring-gray-300">
          {initialData ? 'Salvar Alterações' : 'Adicionar Produto'}
        </button>
      </div>

        {/* Componente de Scanner */}
        <BarcodeScanner
            isOpen={isScannerOpen}
            onScan={handleScan}
            onClose={() => setIsScannerOpen(false)}
        />
    </form>
  );
};

export default ProductForm;
