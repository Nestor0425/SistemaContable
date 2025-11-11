
import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';

interface CustomerFormProps {
    customer?: Customer | null;
    onSubmit: (customer: Omit<Customer, 'id'> | Customer) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        nif: '',
        name: '',
        address: '',
        email: '',
        phone: '',
        currency: 'EUR' as 'EUR' | 'USD' | 'GBP',
        notes: '',
        contactPerson: { name: '', email: '' },
        defaultVatRate: 21
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                nif: customer.nif,
                name: customer.name,
                address: customer.address,
                email: customer.email,
                phone: customer.phone,
                currency: customer.currency || 'EUR',
                notes: customer.notes || '',
                contactPerson: customer.contactPerson || { name: '', email: '' },
                defaultVatRate: customer.defaultVatRate || 21,
            });
        } else {
             setFormData({ 
                 nif: '', name: '', address: '', email: '', phone: '', currency: 'EUR', notes: '',
                 contactPerson: { name: '', email: '' }, defaultVatRate: 21 
             });
        }
    }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            contactPerson: {
                ...prev.contactPerson,
                [name]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customer) {
            onSubmit({ ...customer, ...formData });
        } else {
            onSubmit(formData);
        }
    };
    
    const inputClasses = "w-full rounded-md border border-border-color bg-white py-3 px-5 font-medium text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent";
    const labelClasses = "mb-2.5 block font-medium text-text-primary";

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-lg mb-4 text-text-primary border-b border-border-color pb-3">Información General</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Nombre o Razón Social</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>NIF</label>
                            <input type="text" name="nif" value={formData.nif} onChange={handleChange} required className={inputClasses} />
                        </div>
                         <div>
                            <label className={labelClasses}>Moneda del Cliente</label>
                            <select name="currency" value={formData.currency} onChange={handleChange} className={`${inputClasses} appearance-none`}>
                                <option value="EUR">EUR (€)</option>
                                <option value="USD">USD ($)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                         <div className="md:col-span-2">
                            <label className={labelClasses}>Dirección</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} required className={inputClasses} />
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-lg mb-4 text-text-primary border-b border-border-color pb-3">Contacto Principal</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                         <div>
                            <label className={labelClasses}>Nombre del Contacto</label>
                            <input type="text" name="name" value={formData.contactPerson.name} onChange={handleContactChange} className={inputClasses} />
                        </div>
                         <div>
                            <label className={labelClasses}>Email del Contacto</label>
                            <input type="email" name="email" value={formData.contactPerson.email} onChange={handleContactChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Email General</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Teléfono General</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>
                </div>
                 
                 <div>
                    <label className={labelClasses}>Notas Internas</label>
                    <textarea rows={3} name="notes" value={formData.notes} onChange={handleChange} className={`${inputClasses} resize-none`}></textarea>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4 pt-4 border-t border-border-color">
                 <button type="button" onClick={onCancel} disabled={isSubmitting} className="flex justify-center rounded-md border border-border-color bg-white py-2 px-6 font-medium text-text-primary hover:bg-secondary">
                    Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex justify-center rounded-md bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50">
                    {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;