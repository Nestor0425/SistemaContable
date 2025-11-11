import React, { useState, useEffect, useCallback } from 'react';
import { Settings, TemplateLabels, TemplateStyles, TemplateFooter, Quote } from '../types';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/apiService';
import { useToast } from '../contexts/ToastContext';
import TemplateRenderer from '../components/ui/TemplateRenderer';
import { mockInvoices } from '../data/invoices';
import { mockCustomers } from '../data/customers';
import { mockQuotes } from '../data/quotes';

const TemplateEditorPage: React.FC = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'appearance' | 'html'>('appearance');
    const [previewType, setPreviewType] = useState<'invoice' | 'quote'>('invoice');
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => (prev ? { ...prev, [name]: value } : null));
    };
    
    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => prev ? ({
            ...prev,
            templateLabels: {
                ...prev.templateLabels,
                [name]: value,
            }
        }) : null);
    }
    
    const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => {
            if (!prev) return null;
            return {
                ...prev,
                templateStyles: {
                    ...prev.templateStyles,
                    [name]: value,
                },
            };
        });
    };
    
    const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => prev ? ({
            ...prev,
            templateFooter: {
                ...prev.templateFooter,
                [name]: value,
            }
        }) : null);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => prev ? ({ ...prev, companyLogo: reader.result as string }) : null);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = async () => {
        if (!isAdmin || !settings) {
            showToast("No tiene permisos para realizar esta acción.", "error");
            return;
        }
        try {
            await api.updateSettings(settings);
            showToast("Plantilla guardada correctamente.", "success");
        } catch (error) {
            console.error("Error saving settings:", error);
            showToast("No se pudo guardar la plantilla.", "error");
        }
    };

    if (isLoading || !settings) {
        return <div className="text-center p-10">Cargando editor de plantillas...</div>;
    }

    const inputClasses = "w-full rounded-md border border-border-color bg-white py-3 px-5 font-medium text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-secondary";
    const labelClasses = "mb-2 block font-medium text-text-primary text-sm";
    const tabBaseClasses = "py-3 px-1 border-b-2 font-semibold transition-colors";
    const activeTabClasses = "border-primary text-primary";
    const inactiveTabClasses = "border-transparent text-text-secondary hover:text-primary";
    
    const sampleInvoice = mockInvoices[1];
    const sampleQuote = mockQuotes[1];
    const sampleCustomer = mockCustomers.find(c => c.id === (previewType === 'invoice' ? sampleInvoice.customerId : sampleQuote.customerId)) || mockCustomers[0];

    const defaultTemplateStyles: TemplateStyles = { fontFamily: '', baseFontSize: '', headingColor: '', textColor: '' };
    const currentTemplateStyles = settings.templateStyles || defaultTemplateStyles;
    const defaultTemplateFooter: TemplateFooter = { corporateInfo: '', paymentMethodsTitle: '', paymentMethods: '', termsTitle: '', terms: '', finalNote: '', signatureLine: '' };
    const currentTemplateFooter = settings.templateFooter || defaultTemplateFooter;


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Editor de Plantillas</h1>
                <button onClick={handleSave} disabled={!isAdmin} className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-opacity-50">
                    Guardar Plantilla
                </button>
            </div>
            
            <div className="rounded-lg border border-border-color bg-white p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-semibold text-text-primary">Vista Previa en Vivo</h4>
                    <div className="flex items-center rounded-md bg-secondary p-1">
                        <button onClick={() => setPreviewType('invoice')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${previewType === 'invoice' ? 'bg-white shadow-sm' : 'text-text-secondary hover:text-gray-700'}`}>Factura</button>
                        <button onClick={() => setPreviewType('quote')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${previewType === 'quote' ? 'bg-white shadow-sm' : 'text-text-secondary hover:text-gray-700'}`}>Presupuesto</button>
                    </div>
                </div>
                <div className="bg-secondary p-2 rounded-md">
                    <TemplateRenderer
                        templateHtml={settings.templateHtml}
                        invoice={previewType === 'invoice' ? sampleInvoice : undefined}
                        quote={previewType === 'quote' ? sampleQuote : undefined}
                        customer={sampleCustomer}
                        settings={settings}
                    />
                </div>
            </div>

            <div className="rounded-lg border border-border-color bg-white">
                <div className="border-b border-border-color px-6">
                    <div className="flex gap-6">
                        <button 
                            onClick={() => setActiveTab('appearance')} 
                            className={`${tabBaseClasses} ${activeTab === 'appearance' ? activeTabClasses : inactiveTabClasses}`}
                        >
                            Contenido y Apariencia (Editor Visual)
                        </button>
                        <button 
                            onClick={() => setActiveTab('html')}
                            className={`${tabBaseClasses} ${activeTab === 'html' ? activeTabClasses : inactiveTabClasses}`}
                        >
                            Editor HTML
                        </button>
                    </div>
                </div>
                
                <div className="p-6">
                    {activeTab === 'appearance' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             <div className="space-y-6">
                                <div className="rounded-md border border-border-color p-4">
                                     <h5 className="font-semibold mb-4 text-text-primary">Estilos Generales y Colores</h5>
                                     <div className="space-y-4">
                                         <div>
                                            <label className={labelClasses}>Tipografía</label>
                                            <select name="fontFamily" value={currentTemplateStyles.fontFamily} onChange={handleStyleChange} disabled={!isAdmin} className={`${inputClasses} appearance-none`}>
                                                <option value="'Inter', sans-serif">Sans-Serif (Inter)</option>
                                                <option value="'Times New Roman', serif">Serif (Times New Roman)</option>
                                                <option value="'Courier New', monospace">Monospace (Courier New)</option>
                                            </select>
                                        </div>
                                         <div>
                                            <label className={labelClasses}>Tamaño de Fuente Base</label>
                                            <input type="text" name="baseFontSize" value={currentTemplateStyles.baseFontSize} onChange={handleStyleChange} disabled={!isAdmin} className={inputClasses} placeholder="ej. 14px"/>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Color de Marca (Facturas)</label>
                                            <div className="flex items-center gap-4">
                                                <input type="color" name="brandColor" value={settings.brandColor} onChange={handleChange} disabled={!isAdmin} className="h-12 w-16 rounded-md p-1 border border-border-color" />
                                                <input type="text" name="brandColor" value={settings.brandColor} onChange={handleChange} disabled={!isAdmin} className={inputClasses} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Color de Encabezados</label>
                                            <div className="flex items-center gap-4">
                                                <input type="color" name="headingColor" value={currentTemplateStyles.headingColor} onChange={handleStyleChange} disabled={!isAdmin} className="h-12 w-16 rounded-md p-1 border border-border-color" />
                                                <input type="text" name="headingColor" value={currentTemplateStyles.headingColor} onChange={handleStyleChange} disabled={!isAdmin} className={inputClasses} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Color del Texto</label>
                                            <div className="flex items-center gap-4">
                                                <input type="color" name="textColor" value={currentTemplateStyles.textColor} onChange={handleStyleChange} disabled={!isAdmin} className="h-12 w-16 rounded-md p-1 border border-border-color" />
                                                <input type="text" name="textColor" value={currentTemplateStyles.textColor} onChange={handleStyleChange} disabled={!isAdmin} className={inputClasses} />
                                            </div>
                                        </div>
                                     </div>
                                </div>
                                 <div className="rounded-md border border-border-color p-4">
                                    <h5 className="font-semibold mb-4 text-text-primary">Logo y Marca</h5>
                                    <div>
                                        <label className={labelClasses}>Logo de la Empresa</label>
                                        <div className="flex items-center gap-4">
                                            {settings.companyLogo && <img src={settings.companyLogo} alt="Logo" className="h-16 w-auto rounded-md object-contain border border-border-color p-1 bg-secondary" />}
                                            <input type="file" accept="image/*" onChange={handleLogoChange} disabled={!isAdmin} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-text-primary hover:file:bg-border-color"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="rounded-md border border-border-color p-4">
                                    <h5 className="font-semibold mb-4 text-text-primary">Textos de la Plantilla</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.keys(settings.templateLabels).map((key) => (
                                            <div key={key}>
                                                <label className="text-sm font-medium text-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                                <input 
                                                    type="text"
                                                    name={key}
                                                    value={settings.templateLabels[key as keyof TemplateLabels]}
                                                    onChange={handleLabelChange}
                                                    disabled={!isAdmin}
                                                    className={`${inputClasses} mt-1 text-sm py-2`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="rounded-md border border-border-color p-4">
                                    <h5 className="font-semibold mb-4 text-text-primary">Pie de Página Personalizado</h5>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={labelClasses}>Información Corporativa <span className="text-xs text-text-secondary">(Se permite HTML)</span></label>
                                            <textarea name="corporateInfo" value={currentTemplateFooter.corporateInfo} onChange={handleFooterChange} disabled={!isAdmin} rows={5} className={`${inputClasses} mt-1 text-sm py-2`}></textarea>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Título Métodos de Pago</label>
                                            <input type="text" name="paymentMethodsTitle" value={currentTemplateFooter.paymentMethodsTitle} onChange={handleFooterChange} disabled={!isAdmin} className={`${inputClasses} mt-1 text-sm py-2`} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Contenido Métodos de Pago <span className="text-xs text-text-secondary">(Se permite HTML)</span></label>
                                            <textarea name="paymentMethods" value={currentTemplateFooter.paymentMethods} onChange={handleFooterChange} disabled={!isAdmin} rows={4} className={`${inputClasses} mt-1 text-sm py-2`}></textarea>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Título Términos</label>
                                            <input type="text" name="termsTitle" value={currentTemplateFooter.termsTitle} onChange={handleFooterChange} disabled={!isAdmin} className={`${inputClasses} mt-1 text-sm py-2`} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Contenido Términos <span className="text-xs text-text-secondary">(Se permite HTML)</span></label>
                                            <textarea name="terms" value={currentTemplateFooter.terms} onChange={handleFooterChange} disabled={!isAdmin} rows={4} className={`${inputClasses} mt-1 text-sm py-2`}></textarea>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Nota Final <span className="text-xs text-text-secondary">(Se permite HTML)</span></label>
                                            <textarea name="finalNote" value={currentTemplateFooter.finalNote} onChange={handleFooterChange} disabled={!isAdmin} rows={2} className={`${inputClasses} mt-1 text-sm py-2`} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Línea de Firma <span className="text-xs text-text-secondary">(Se permite HTML)</span></label>
                                            <textarea name="signatureLine" value={currentTemplateFooter.signatureLine} onChange={handleFooterChange} disabled={!isAdmin} rows={2} className={`${inputClasses} mt-1 text-sm py-2`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'html' && (
                        <div>
                            <textarea
                                name="templateHtml"
                                value={settings.templateHtml}
                                onChange={handleChange}
                                disabled={!isAdmin}
                                className={`${inputClasses} font-mono text-sm h-96 min-h-[400px]`}
                            />
                            <p className="text-sm text-text-secondary mt-2">
                                Usa <code className="bg-secondary p-1 rounded-sm">{'{{...}}'}</code> para texto simple (escapado), <code className="bg-secondary p-1 rounded-sm">{'{{{...}}}'}</code> para HTML, <code className="bg-secondary p-1 rounded-sm">{'{{#if ...}}'}</code> para condicionales, y <code className="bg-secondary p-1 rounded-sm">{'{{#each ...}}'}</code> para bucles.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end mt-6">
                <button onClick={handleSave} disabled={!isAdmin} className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-opacity-50">
                    Guardar Plantilla
                </button>
            </div>

            {!isAdmin && <p className="text-danger text-center mt-4">Solo los administradores pueden modificar la plantilla.</p>}
        </div>
    );
};

export default TemplateEditorPage;