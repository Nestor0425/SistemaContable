

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Quote, Customer, Settings } from '../types';
import * as api from '../services/apiService';
import { useToast } from '../contexts/ToastContext';
import TemplateRenderer from '../components/ui/TemplateRenderer';

const QuotePublicView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const showToast = useToast();

    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const [quoteData, settingsData] = await Promise.all([
                api.getQuoteById(id),
                api.getSettings(),
            ]);

            if (quoteData) {
                setQuote(quoteData);
                setSettings(settingsData);
                const customerData = await api.getCustomerById(quoteData.customerId);
                setCustomer(customerData || null);
            } else {
                console.error("Quote not found");
            }
        } catch (error) {
            console.error("Error fetching quote details:", error);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [id, fetchData]);
    
    const handleStatusChange = async (status: 'accepted' | 'rejected') => {
        if (!quote) return;
        setIsActionLoading(true);
        try {
            await api.updateQuoteStatus(quote.id, status);
            await fetchData();
            showToast(`Presupuesto ${status === 'accepted' ? 'aceptado' : 'rechazado'}.`, 'success');
        } catch (error) {
            console.error(`Error setting status to ${status}`, error);
            showToast("Ocurrió un error al actualizar el presupuesto.", 'error');
        } finally {
            setIsActionLoading(false);
        }
    };
    
    if (isLoading) {
        return <div className="bg-secondary min-h-screen text-center p-10">Cargando presupuesto...</div>;
    }

    if (!quote || !settings || !customer) {
        return <div className="bg-secondary min-h-screen text-center p-10 text-danger">Error: Presupuesto no encontrado.</div>;
    }
    
    return (
        <div className="bg-secondary min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <TemplateRenderer
                    templateHtml={settings.templateHtml}
                    quote={quote}
                    customer={customer}
                    settings={settings}
                />
                
                <div className="mt-8">
                    {quote.status === 'sent' && (
                        <div className="flex justify-center gap-4 flex-wrap bg-white p-6 rounded-lg shadow-md">
                            <button onClick={() => handleStatusChange('accepted')} disabled={isActionLoading} className="px-8 py-3 bg-success text-white rounded-lg hover:bg-opacity-90 text-lg font-medium">
                                {isActionLoading ? 'Procesando...' : 'Aceptar Presupuesto'}
                            </button>
                             <button onClick={() => handleStatusChange('rejected')} disabled={isActionLoading} className="px-8 py-3 bg-danger text-white rounded-lg hover:bg-opacity-90 text-lg font-medium">
                                {isActionLoading ? 'Procesando...' : 'Rechazar'}
                            </button>
                        </div>
                    )}
                    {quote.status === 'accepted' && (
                        <div className="text-center p-4 bg-success-10 border border-success-20 rounded-lg">
                            <h3 className="text-xl font-bold text-success">¡Gracias! Este presupuesto ha sido aceptado.</h3>
                            <p className="mt-2 text-bodydark">Nos pondremos en contacto con usted en breve.</p>
                        </div>
                    )}
                    {quote.status === 'rejected' && (
                        <div className="text-center p-4 bg-danger-10 border border-danger-20 rounded-lg">
                            <h3 className="text-xl font-bold text-danger">El presupuesto ha sido marcado como rechazado.</h3>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default QuotePublicView;