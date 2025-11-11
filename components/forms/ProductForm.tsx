import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import IconPickerModal from '../ui/IconPickerModal';

interface ProductFormProps {
    product?: Product | null;
    onSubmit: (product: Omit<Product, 'id'> | Product) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        price: 0,
        vatRate: 21,
        imageUrl: '',
        iconName: ''
    });
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                sku: product.sku,
                name: product.name,
                description: product.description,
                price: product.price,
                vatRate: product.vatRate,
                imageUrl: product.imageUrl || '',
                iconName: product.iconName || ''
            });
        } else {
             setFormData({ sku: '', name: '', description: '', price: 0, vatRate: 21, imageUrl: '', iconName: '' });
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseFloat(value) : value 
        }));
    };
    
    const handleIconSelect = (iconName: string) => {
        setFormData(prev => ({...prev, iconName, imageUrl: ''}));
        setIsIconPickerOpen(false);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (product) {
            onSubmit({ ...product, ...formData });
        } else {
            onSubmit(formData);
        }
    };
    
    const inputClasses = "w-full rounded-md border border-border-color bg-white py-3 px-5 font-medium text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent";
    const labelClasses = "mb-2.5 block font-medium text-text-primary";

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className={labelClasses}>Nombre del Producto/Servicio</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>SKU / Referencia</label>
                        <input type="text" name="sku" value={formData.sku} onChange={handleChange} required className={inputClasses} />
                    </div>
                     <div className="md:col-span-2">
                        <label className={labelClasses}>Descripción</label>
                        <textarea rows={3} name="description" value={formData.description} onChange={handleChange} className={`${inputClasses} resize-none`}></textarea>
                    </div>
                    <div>
                        <label className={labelClasses}>Precio (€)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className={inputClasses} />
                    </div>
                     <div>
                        <label className={labelClasses}>Tipo de IVA (%)</label>
                        <input type="number" name="vatRate" value={formData.vatRate} onChange={handleChange} required min="0" step="1" className={inputClasses} />
                    </div>
                     <div className="md:col-span-2">
                        <label className={labelClasses}>Imagen (URL)</label>
                        <input type="text" name="imageUrl" placeholder="https://example.com/image.png" value={formData.imageUrl} onChange={handleChange} className={inputClasses} />
                         <p className="text-sm text-text-secondary mt-2">O seleccione un icono:</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <button type="button" onClick={() => setIsIconPickerOpen(true)} className="rounded-md border border-border-color bg-white py-2 px-6 font-medium text-text-primary hover:bg-secondary">
                            Seleccionar Icono
                        </button>
                        {formData.iconName && (
                            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary">
                                <span className="material-symbols-outlined text-3xl">{formData.iconName}</span>
                                <span className="text-sm">{formData.iconName}</span>
                            </div>
                        )}
                     </div>

                </div>
                <div className="mt-6 flex justify-end gap-4 pt-4 border-t border-border-color">
                     <button type="button" onClick={onCancel} disabled={isSubmitting} className="flex justify-center rounded-md border border-border-color bg-white py-2 px-6 font-medium text-text-primary hover:bg-secondary">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex justify-center rounded-md bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50">
                        {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                    </button>
                </div>
            </form>
            <IconPickerModal 
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                onSelect={handleIconSelect}
            />
        </>
    );
};

export default ProductForm;