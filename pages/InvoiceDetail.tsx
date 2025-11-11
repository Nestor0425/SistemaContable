

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Invoice, Customer, Settings } from '../types';
import { generateVeriFactuXML } from '../services/geminiService';
import * as api from '../services/apiService';
import { calculateInvoiceTotal } from '../utils/calculations';
import { useToast } from '../contexts/ToastContext';
import Modal from '../components/ui/Modal';
import TemplateRenderer from '../components/ui/TemplateRenderer';

const InvoiceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTransmitting, setIsTransmitting] = useState(false);
    const [transmissionResult, setTransmissionResult] = useState<string | null>(null);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);
    const showToast = useToast();
    
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

    const getPublicLink = (invoiceId: string) => {
        const { protocol, host, pathname } = window.location;
        const cleanPathname = pathname.includes('/#/') ? pathname.split('/#/')[0] : pathname;
        return `${protocol}//${host}${cleanPathname}#/public/invoice/${invoiceId}`;
    }

    const handleTransmitVeriFactu = useCallback(async () => {
        if (!invoice) return;
        setIsTransmitting(true);
        setTransmissionResult(null);
        const xml = await generateVeriFactuXML(invoice);
        setTimeout(() => {
            setIsTransmitting(false);
            setTransmissionResult(xml);
            showToast('Transmisión a AEAT simulada con éxito.', 'info');
        }, 2000);
    }, [invoice, showToast]);
    
    const handleUpdateStatus = async (status: Invoice['status']) => {
        if (!invoice) return;
        const confirmationText = status === 'void' 
            ? '¿Está seguro de que desea anular esta factura?'
            : `¿Desea cambiar el estado a ${status}?`;
            
        if (window.confirm(confirmationText)) {
            try {
                await api.updateInvoiceStatus(invoice.id, status);
                await fetchData(); // Refresh data
                showToast(`Factura marcada como ${status}.`, 'success');
            } catch (error) {
                showToast('No se pudo actualizar el estado de la factura.', 'error');
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };
    
    if (isLoading) {
        return <div className="text-center p-10">Cargando factura...</div>;
    }
    
    if (!invoice || !settings || !customer) {
        return <div className="text-center p-10 text-danger">Error: Factura no encontrada.</div>;
    }
    
    const buttonBaseStyles = "px-4 py-2 rounded-lg font-semibold transition-colors";
    
    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-8 flex-wrap gap-4 no-print">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">{settings.templateLabels.invoiceTitle} {invoice.series}{invoice.number}</h1>
                        <p className="text-text-secondary">{settings.templateLabels.invoiceDateLabel}: {new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setIsLinkModalOpen(true)} className={`${buttonBaseStyles} bg-accent-10 text-accent hover:bg-accent-20`}>Obtener Enlace</button>
                        <button onClick={handlePrint} className={`${buttonBaseStyles} bg-primary-10 text-primary hover:bg-primary-20`}>Imprimir</button>
                         {(invoice.status === 'draft' || invoice.status === 'paid') && (
                            <Link to={`/invoices/edit/${invoice.id}`} className={`${buttonBaseStyles} bg-accent-10 text-accent hover:bg-accent-20`}>Editar</Link>
                         )}
                        {invoice.status === 'draft' && (
                            <button onClick={() => handleUpdateStatus('issued')} className={`${buttonBaseStyles} bg-success-10 text-success hover:bg-success-20`}>
                                Emitir Factura
                            </button>
                        )}
                         {invoice.status === 'issued' && (
                            <button onClick={() => handleUpdateStatus('paid')} className={`${buttonBaseStyles} bg-success-10 text-success hover:bg-success-20`}>
                                Marcar como Pagada
                            </button>
                        )}
                        {(invoice.status === 'issued' || invoice.status === 'paid') && (
                             <button onClick={() => handleUpdateStatus('void')} className={`${buttonBaseStyles} bg-danger-10 text-danger hover:bg-danger-20`}>
                                Anular Factura
                            </button>
                        )}
                        <button onClick={handleTransmitVeriFactu} disabled={isTransmitting} className={`${buttonBaseStyles} bg-info-10 text-info hover:bg-info-20 disabled:bg-gray-200 disabled:text-gray-500`}>
                            {isTransmitting ? 'Transmitiendo...' : 'Transmitir a AEAT'}
                        </button>
                    </div>
                </div>
                
                <div ref={printableRef} className="printable-area">
                    <TemplateRenderer 
                        templateHtml={settings.templateHtml}
                        invoice={invoice}
                        customer={customer}
                        settings={settings}
                    />
                </div>

                {transmissionResult && (
                     <div className="mt-8 rounded-lg p-4 bg-gray-50 dark:bg-boxdark-2 no-print">
                        <h3 className="font-bold text-black dark:text-white mb-2">Resultado Simulado Transmisión VeriFactu (Generado por AI)</h3>
                        <pre className="bg-white dark:bg-boxdark p-4 rounded text-sm overflow-x-auto">
                            <code>{transmissionResult}</code>
                        </pre>
                     </div>
                )}
            </div>
            <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} title="Enlace Público de la Factura">
                {invoice && (
                    <div>
                        <p className="mb-4 text-text-secondary">Copie y comparta este enlace para que la factura sea visible públicamente.</p>
                        <input
                            type="text"
                            readOnly
                            value={getPublicLink(invoice.id)}
                            className="w-full rounded-md border border-border-color bg-secondary p-3 font-mono text-sm"
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(getPublicLink(invoice.id));
                                    showToast('Enlace copiado al portapapeles.', 'success');
                                }}
                                className="rounded-md bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90"
                            >
                                Copiar Enlace
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default InvoiceDetail;