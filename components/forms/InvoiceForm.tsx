

import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceLine, Customer, Product, Settings } from '../../types';
import { generateInvoiceLinesFromPrompt } from '../../services/geminiService';
import * as api from '../../services/apiService';
import NumberSpinner from '../ui/NumberSpinner';

interface InvoiceFormProps {
    initialInvoice?: Invoice | null;
    customers: Customer[];
    products: Product[];
    onSubmit: (invoice: Omit<Invoice, 'id' | 'sif'> | Invoice) => void;
    isSubmitting: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialInvoice, customers, products, onSubmit, isSubmitting }) => {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [invoiceData, setInvoiceData] = useState<Omit<Invoice, 'id' | 'sif' | 'number' | 'series'> | Invoice>();
    const [customerDefaultVat, setCustomerDefaultVat] = useState<number>(21);

    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const emptyLine = (): Omit<InvoiceLine, 'productId'> & { productId: string | null } => ({
        productId: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        vatRate: customerDefaultVat || settings?.defaultVatRate || 21,
        discount: { type: 'percentage', value: 0 },
    });

    useEffect(() => {
        api.getSettings().then(setSettings);
    }, []);

    useEffect(() => {
        if (!settings) return;

        const getDefaultInvoice = (): Omit<Invoice, 'id' | 'sif'| 'number' | 'series'> => ({
            customerId: '',
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + settings.defaultDueDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lines: [emptyLine()],
            globalDiscount: { type: 'percentage', value: settings.defaultGlobalDiscount },
            notes: '',
            internalNotes: '',
            status: 'draft',
            type: 'completa',
            taxName: '',
            taxRate: 0,
            recurrence: { frequency: 'none' },
        });

        if (initialInvoice) {
            setInvoiceData(initialInvoice);
        } else {
            setInvoiceData(getDefaultInvoice());
        }
    }, [initialInvoice, settings, customerDefaultVat]);

    useEffect(() => {
        const customer = customers.find(c => c.id === invoiceData?.customerId);
        setCustomerDefaultVat(customer?.defaultVatRate || settings?.defaultVatRate || 21);
    }, [invoiceData?.customerId, customers, settings]);

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInvoiceData(prev => prev ? ({ ...prev, [name]: value }) : prev);
    };
    
    const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const frequency = e.target.value as 'none' | 'monthly' | 'yearly';
        if (!invoiceData) return;
        
        const newRecurrence = { ...invoiceData.recurrence, frequency };
        setInvoiceData({ ...invoiceData, recurrence: newRecurrence });
    }

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (!invoiceData) return;
        const newDiscount = { ...('globalDiscount' in invoiceData ? invoiceData.globalDiscount : { type: 'percentage', value: 0 }), [name]: name === 'value' ? parseFloat(value) : value };
        setInvoiceData({ ...invoiceData, globalDiscount: newDiscount });
    }

    const handleLineChange = (index: number, field: keyof InvoiceLine, value: any) => {
        if (!invoiceData) return;
        const newLines = [...invoiceData.lines];
        const line = newLines[index];

        if (field === 'discount') {
            line.discount.value = parseFloat(value) || 0;
        } else if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                line.productId = product.id;
                line.description = product.name;
                line.unitPrice = product.price;
                line.vatRate = product.vatRate;
                line.productDetails = { iconName: product.iconName, imageUrl: product.imageUrl };
            }
        }
        else {
            (line as any)[field] = value;
        }
        setInvoiceData(prev => prev ? ({ ...prev, lines: newLines }) : prev);
    };

    const addLine = () => {
        setInvoiceData(prev => prev ? ({ ...prev, lines: [...prev.lines, emptyLine()] }) : prev);
    };

    const removeLine = (index: number) => {
        if (!invoiceData || invoiceData.lines.length <= 1) return;
        const newLines = invoiceData.lines.filter((_, i) => i !== index);
        setInvoiceData(prev => prev ? ({ ...prev, lines: newLines }) : prev);
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const generatedLines = await generateInvoiceLinesFromPrompt(aiPrompt);
            if (generatedLines.length > 0) {
                 const newLines = generatedLines.map(line => ({ ...emptyLine(), ...line }));
                 const existingNonEmptyLines = invoiceData?.lines.filter(l => l.description || l.quantity * l.unitPrice > 0) || [];
                 setInvoiceData(prev => prev ? ({...prev, lines: [...existingNonEmptyLines, ...newLines]}) : prev);
                 setAiPrompt('');
            }
        } catch (error) {
            console.error("Failed to generate lines:", error);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoiceData) return;
        if (!invoiceData.customerId || invoiceData.lines.length === 0) {
            alert('Por favor, seleccione un cliente y añada al menos una línea.');
            return;
        }
        onSubmit(invoiceData);
    };

    const inputClasses = "w-full rounded-md border border-border-color bg-surface py-3 px-5 font-medium text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
    const labelClasses = "mb-2.5 block font-medium text-text-primary";
    
    if (!invoiceData || !settings) {
        return <p>Cargando formulario...</p>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border border-border-color bg-white p-6 shadow-sm">
                <h4 className="text-xl font-semibold mb-6 text-text-primary border-b border-border-color pb-4">Datos Generales</h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                     <div className="lg:col-span-2">
                        <label className={labelClasses}>Cliente</label>
                        <select name="customerId" value={invoiceData.customerId} onChange={handleHeaderChange} required className={`${inputClasses} appearance-none`}>
                            <option value="">Seleccione un cliente</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className={labelClasses}>Prefijo</label>
                        <input type="text" value={'series' in invoiceData ? invoiceData.series : settings.invoicePrefix} disabled className={`${inputClasses} bg-secondary`} />
                    </div>
                    <div>
                        <label className={labelClasses}>Número</label>
                        <input type="text" value={'number' in invoiceData ? invoiceData.number : settings.nextInvoiceNumber} disabled className={`${inputClasses} bg-secondary`} />
                    </div>
                     <div>
                        <label className={labelClasses}>Fecha de Factura</label>
                        <input type="date" name="date" value={invoiceData.date} onChange={handleHeaderChange} required className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Fecha de Vencimiento</label>
                        <input type="date" name="dueDate" value={invoiceData.dueDate} onChange={handleHeaderChange} required className={inputClasses} />
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-border-color bg-white shadow-sm">
                <div className="p-6">
                    <h4 className="text-xl font-semibold mb-6 text-text-primary border-b border-border-color pb-4">Líneas de la Factura</h4>
                    <div className="rounded-md border border-border-color p-4 bg-secondary mb-6">
                        <label className="mb-2.5 block font-medium text-text-primary">Añadir líneas con IA (Gemini)</label>
                        <div className="flex gap-4">
                            <input 
                                type="text"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Ej: 2 horas de consultoría y 1 licencia de software a 50€"
                                className={inputClasses}
                            />
                            <button type="button" onClick={handleAiGenerate} disabled={isGenerating} className="rounded-md bg-white py-2 px-6 font-medium text-text-primary hover:bg-border-color disabled:bg-opacity-50 border border-border-color whitespace-nowrap">
                                {isGenerating ? 'Generando...' : 'Generar'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-text-secondary px-2">
                            <div className="col-span-4">Descripción</div>
                            <div className="col-span-2 text-center">Cant.</div>
                            <div className="col-span-2 text-right">Precio</div>
                            <div className="col-span-1 text-center">IVA %</div>
                            <div className="col-span-2 text-center">Dto.</div>
                        </div>
                        <div className="space-y-3">
                        {invoiceData.lines.map((line, index) => (
                            <div key={index} className="grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-12 md:col-span-4 flex items-center gap-2">
                                    <input type="text" placeholder="Descripción" value={line.description} onChange={e => handleLineChange(index, 'description', e.target.value)} className={inputClasses} />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <NumberSpinner
                                      value={line.quantity}
                                      onChange={newValue => handleLineChange(index, 'quantity', newValue)}
                                      min={1}
                                      className="h-[50px]"
                                    />
                                </div>
                                <input type="number" placeholder="Precio" value={line.unitPrice} onChange={e => handleLineChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} className={`col-span-4 md:col-span-2 ${inputClasses} text-right`} />
                                <input type="number" placeholder="IVA %" value={line.vatRate} onChange={e => handleLineChange(index, 'vatRate', parseFloat(e.target.value) || 0)} className={`col-span-4 md:col-span-1 ${inputClasses} text-center`} />
                                <div className="col-span-9 md:col-span-2 flex items-center">
                                    <input type="number" placeholder="Dto." value={line.discount.value} onChange={e => handleLineChange(index, 'discount', parseFloat(e.target.value) || 0 )} className="w-full text-right rounded-l-md border border-r-0 border-border-color bg-surface py-3 px-5 font-medium text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary" />
                                    <span className="bg-secondary py-3 px-3 rounded-r-md border border-l-0 border-border-color">%</span>
                                </div>
                                <button type="button" onClick={() => removeLine(index)} className="col-span-2 md:col-span-1 flex justify-center items-center text-danger text-3xl font-light hover:bg-danger-10 rounded-full h-8 w-8 transition-colors">&times;</button>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-border-color">
                    <button type="button" onClick={addLine} className="text-primary font-medium hover:underline">+ Añadir línea</button>
                </div>
            </div>
            
            <div className="rounded-lg border border-border-color bg-white p-6 shadow-sm">
                <h4 className="text-xl font-semibold mb-6 text-text-primary border-b border-border-color pb-4">Totales y Notas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className={labelClasses}>Descuento Global</label>
                            <div className="flex">
                                <input type="number" name="value" value={'globalDiscount' in invoiceData ? invoiceData.globalDiscount.value : 0} onChange={handleDiscountChange} className="w-full rounded-l-md border border-r-0 border-border-color bg-surface py-3 px-5 font-medium text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary" />
                                <select name="type" value={'globalDiscount' in invoiceData ? invoiceData.globalDiscount.type : 'percentage'} onChange={handleDiscountChange} className="appearance-none rounded-r-md border border-l-0 border-border-color bg-secondary py-3 px-4 font-medium text-text-primary outline-none">
                                    <option value="percentage">%</option>
                                    <option value="amount">{settings.currency}</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Impuesto/Retención Global</label>
                            <div className="flex gap-4">
                                <input type="text" name="taxName" placeholder="Nombre (ej. IRPF)" value={invoiceData.taxName} onChange={handleHeaderChange} className={`${inputClasses} w-1/2`} />
                                <input type="number" name="taxRate" placeholder="% (ej. -15)" value={invoiceData.taxRate} onChange={handleHeaderChange} className={`${inputClasses} w-1/2`} />
                            </div>
                        </div>
                         <div>
                             <label className={labelClasses}>Facturación Recurrente</label>
                             <select value={invoiceData.recurrence?.frequency || 'none'} onChange={handleRecurrenceChange} className={`${inputClasses} appearance-none`}>
                                 <option value="none">No recurrente</option>
                                 <option value="monthly">Mensual</option>
                                 <option value="yearly">Anual</option>
                             </select>
                        </div>
                    </div>
                     <div className="space-y-6">
                         <div>
                             <label className={labelClasses}>Notas para el cliente</label>
                             <textarea rows={3} name="notes" value={invoiceData.notes} onChange={handleHeaderChange} className={`${inputClasses} resize-y`}></textarea>
                         </div>
                          <div>
                             <label className={labelClasses}>Notas Internas (no visible para el cliente)</label>
                             <textarea rows={3} name="internalNotes" value={invoiceData.internalNotes} onChange={handleHeaderChange} className={`${inputClasses} resize-y`}></textarea>
                         </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                 <button type="button" onClick={() => window.history.back()} disabled={isSubmitting} className="flex justify-center rounded-lg border border-border-color bg-white py-2 px-6 font-medium text-text-primary hover:bg-secondary">
                    Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex justify-center rounded-lg bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50">
                    {isSubmitting ? 'Guardando...' : 'Guardar Factura'}
                </button>
            </div>
        </form>
    );
};

export default InvoiceForm;