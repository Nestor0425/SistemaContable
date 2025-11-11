

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Invoice, Customer, Settings } from '../types';
import * as api from '../services/apiService';
import TemplateRenderer from '../components/ui/TemplateRenderer';

const InvoicePublicView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const printableRef = useRef<HTMLDivElement>(null);
    
    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const [invoiceData, settingsData] = await Promise.all([
                api.getInvoiceById(id),
                api.getSettings()
            ]);
            
            if (invoiceData) {
                setInvoice(invoiceData);
                setSettings(settingsData);
                const customerData = await api.getCustomerById(invoiceData.customerId);
                setCustomer(customerData || null);
            } else {
                console.error("Invoice not found");
            }
        } catch (error) {
            console.error("Error fetching invoice details:", error);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [id, fetchData]);

    const handlePrint = () => {
        window.print();
    };
    
    if (isLoading) {
        return <div className="min-h-screen bg-secondary flex items-center justify-center"><p>Cargando factura...</p></div>;
    }
    
    if (!invoice || !settings || !customer) {
        return <div className="min-h-screen bg-secondary flex items-center justify-center text-danger"><p>Factura no encontrada.</p></div>;
    }

    if (invoice.status === 'draft') {
        return <div className="min-h-screen bg-secondary flex items-center justify-center text-warning"><p>Esta factura es un borrador y no es visible públicamente.</p></div>;
    }
    
    return (
        <div className="bg-secondary min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                 <div className="mb-6 flex justify-end gap-2 no-print">
                     <button onClick={handlePrint} className="px-4 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-opacity-90">Imprimir / Guardar PDF</button>
                </div>
                <div ref={printableRef} className="printable-area">
                    <TemplateRenderer
                         templateHtml={settings.templateHtml}
                         invoice={invoice}
                         customer={customer}
                         settings={settings}
                    />
                </div>
            </div>
        </div>
    );
};

export default InvoicePublicView;