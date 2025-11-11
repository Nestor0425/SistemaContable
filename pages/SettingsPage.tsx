


import React, { useState, useEffect, useCallback } from 'react';
import { Settings } from '../types';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/apiService';
import { useToast } from '../contexts/ToastContext';

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const showToast = useToast();
    
    const isAdmin = user?.role === 'admin';

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getSettings();
            setSettings(data);
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setIsLoading(false);
        }
    },[]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseFloat(value) : value;
        setSettings(prev => prev ? ({...prev, [name]: parsedValue}) : null);
    };
    
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => (prev ? { ...prev, [name]: value } : null));
        
        const hexToRgba = (hex: string, opacity: number): string => {
            if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                return `rgba(0,0,0,${opacity})`;
            }
            let c: any = hex.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${opacity})`;
        };

        if (name === 'interfaceColor') {
             document.documentElement.style.setProperty('--color-primary', value);
             document.documentElement.style.setProperty('--color-primary-10', hexToRgba(value, 0.1));
        }
    };

    const handleModeChange = (mode: 'NO_VERIFACTU' | 'VERIFACTU') => {
        setSettings(prev => prev ? ({...prev, mode}) : null);
    };
    
    const handleSave = async () => {
        if (!isAdmin || !settings) {
            showToast("No tiene permisos para realizar esta acción.", "error");
            return;
        }
        try {
            await api.updateSettings(settings);
            showToast("Configuración guardada correctamente.", "success");
        } catch (error) {
            console.error("Error saving settings:", error);
            showToast("No se pudo guardar la configuración.", "error");
        }
    };

    if (isLoading || !settings) {
        return <div className="text-center p-10">Cargando configuración...</div>;
    }

    const inputClasses = "w-full rounded-md border border-border-color bg-white py-3 px-5 font-medium text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-secondary";
    const labelClasses = "mb-2.5 block font-medium text-text-primary";

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Configuración</h1>
                <button onClick={handleSave} disabled={!isAdmin} className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-opacity-50">
                    Guardar Cambios
                </button>
            </div>

            {/* Company Details */}
            <div className="rounded-lg border border-border-color bg-white p-6">
                <h4 className="text-xl font-semibold mb-6 text-text-primary border-b border-border-color pb-4">Datos de la Empresa</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClasses}>Nombre de la Empresa</label>
                        <input type="text" name="companyName" value={settings.companyName} onChange={handleChange} disabled={!isAdmin} className={inputClasses} />
                    </div>
                     <div>
                        <label className={labelClasses}>Nombre Legal / Autónomo (Opcional)</label>
                        <input type="text" name="companyLegalName" value={settings.companyLegalName || ''} onChange={handleChange} placeholder="Ej: Nombre Apellido" disabled={!isAdmin} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>NIF de la Empresa</label>
                        <input type="text" name="companyNif" value={settings.companyNif} onChange={handleChange} disabled={!isAdmin} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Dirección</label>
                        <input type="text" name="companyAddress" value={settings.companyAddress} onChange={handleChange} disabled={!isAdmin} className={inputClasses} />
                    </div>
                     <div>
                        <label className={labelClasses}>Teléfono</label>
                        <input type="text" name="companyPhone" value={settings.companyPhone || ''} onChange={handleChange} disabled={!isAdmin} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Email</label>
                        <input type="email" name="companyEmail" value={settings.companyEmail || ''} onChange={handleChange} disabled={!isAdmin} className={inputClasses} />
                    </div>
                </div>
            </div>

             {/* Numbering & Formats */}
            <div className="rounded-lg border border-border-color bg-white p-6">
                <h4 className="text-xl font-semibold mb-6 text-text-primary border-b border-border-color pb-4">Numeración y Formatos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClasses}>Prefijo de Facturas</label>
                        <input type="text" name="invoicePrefix" value={settings.invoicePrefix} onChange={handleChange} disabled={!isAdmin} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Siguiente Número de Factura</label>
                        <input type="number" name="nextInvoiceNumber" value={settings.nextInvoiceNumber} onChange={handleChange} disabled={!isAdmin} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Prefijo de Presupuestos</label>
                        <input type="text" name="quotePrefix" value={settings.quotePrefix} onChange={handleChange} disabled={!isAdmin} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Siguiente Número de Presupuesto</label>
                        <input type="number" name="nextQuoteNumber" value={settings.nextQuoteNumber} onChange={handleChange} disabled={!isAdmin} className={inputClasses} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Posición del Símbolo de Moneda</label>
                        <select name="currencyPlacement" value={settings.currencyPlacement} onChange={handleChange} disabled={!isAdmin} className={`${inputClasses} appearance-none`}>
                            <option value="after">Después del importe (1.234,56 €)</option>
                            <option value="before">Antes del importe (€1.234,56)</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Appearance */}
            <div className="rounded-lg border border-border-color bg-white p-6">
                <h4 className="text-xl font-semibold mb-6 text-text-primary border-b border-border-color pb-4">Apariencia de la Interfaz</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={labelClasses}>Color Primario de la Interfaz</label>
                        <div className="flex items-center gap-4">
                            <input type="color" name="interfaceColor" value={settings.interfaceColor} onChange={handleColorChange} disabled={!isAdmin} className="h-12 w-16 rounded-md p-1 border border-border-color" />
                            <input type="text" name="interfaceColor" value={settings.interfaceColor} onChange={handleColorChange} disabled={!isAdmin} className={inputClasses} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Invoice & Quote Defaults */}
            <div className="rounded-lg border border-border-color bg-white p-6">
                <h4 className="text-xl font-semibold mb-6 text-text-primary border-b border-border-color pb-4">Valores por Defecto</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div>
                        <label className={labelClasses}>Moneda por defecto</label>
                        <select name="currency" value={settings.currency} onChange={handleChange} disabled={!isAdmin} className={`${inputClasses} appearance-none`}>
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                     <div>
                        <label className={labelClasses}>Días de vencimiento por defecto</label>
                        <input type="number" name="defaultDueDays" value={settings.defaultDueDays} onChange={handleChange} disabled={!isAdmin} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Descuento global por defecto (%)</label>
                        <input type="number" name="defaultGlobalDiscount" value={settings.defaultGlobalDiscount} onChange={handleChange} disabled={!isAdmin} className={inputClasses} />
                    </div>
                </div>
            </div>

            {/* SIF Settings */}
            <div className="rounded-lg border border-border-color bg-white p-6">
                <h4 className="text-xl font-semibold mb-6 text-text-primary border-b border-border-color pb-4">Configuración SIF</h4>
                <label className={labelClasses}>
                    Modo de Operación SIF
                </label>
                 <div className="relative z-20 bg-transparent">
                    <select
                        value={settings.mode}
                        onChange={(e) => handleModeChange(e.target.value as any)}
                        disabled={!isAdmin}
                        className={`${inputClasses} appearance-none`}
                    >
                        <option value="NO_VERIFACTU">NO_VERIFACTU (Conservación segura sin remisión)</option>
                        <option value="VERIFACTU">VERIFACTU (Remisión automática a la AEAT)</option>
                    </select>
                 </div>
                 <p className="text-sm mt-2 text-text-secondary">
                    {settings.mode === 'NO_VERIFACTU' 
                        ? 'Las facturas se firman digitalmente y se encadenan, pero no se envían a la AEAT automáticamente.' 
                        : 'Las facturas emitidas se enviarán automáticamente a la AEAT a través del servicio web VeriFactu.'}
                 </p>
                 {settings.mode === 'VERIFACTU' && (
                     <div className="mt-6 p-4 bg-accent/5 border-l-4 border-accent rounded-r-md">
                        <h4 className="font-bold text-accent mb-2">Configuración VeriFactu</h4>
                        <label className={`${labelClasses} text-sm`}>URL del WSDL</label>
                        <input type="text" name="verifactu.wsdlUrl" value={settings.verifactu.wsdlUrl} onChange={handleChange} disabled={!isAdmin} className={`${inputClasses} mb-4`} />
                        <label className={`${labelClasses} text-sm`}>Certificado Digital (.pfx/.p12)</label>
                        <input type="file" disabled={!isAdmin} className={`${inputClasses} text-sm`} />
                        <p className="text-sm mt-2 text-text-secondary">El certificado se almacenará de forma segura. Se requiere para firmar las peticiones a la AEAT.</p>
                     </div>
                )}
            </div>
            {!isAdmin && <p className="text-danger text-center mt-4">Solo los administradores pueden modificar la configuración.</p>}
        </div>
    );
};

export default SettingsPage;