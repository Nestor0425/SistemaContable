import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../services/apiService';
import { Customer, Invoice, Settings } from '../types';
import { calculateInvoiceTotal } from '../utils/calculations';
import { formatCurrency } from '../utils/currency';

const getStatusClass = (status: Invoice['status']) => {
    switch (status) {
        case 'paid': return 'bg-success/10 text-success';
        case 'issued': return 'bg-accent/10 text-accent';
        case 'draft': return 'bg-gray-500/10 text-gray-600';
        case 'void': return 'bg-danger/10 text-danger';
        default: return 'bg-gray-500/10 text-gray-600';
    }
};

const CustomerPublicPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const [customerData, allInvoices, settingsData] = await Promise.all([
                    api.getCustomerById(id),
                    api.getInvoices(),
                    api.getSettings()
                ]);

                setCustomer(customerData || null);
                setInvoices(allInvoices.filter(inv => inv.customerId === id && inv.status !== 'draft'));
                setSettings(settingsData);

            } catch (error) {
                console.error("Error fetching customer details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (isLoading) {
        return <div className="min-h-screen bg-secondary flex items-center justify-center"><p>Cargando portal del cliente...</p></div>;
    }

    if (!customer || !settings) {
        return <div className="min-h-screen bg-secondary flex items-center justify-center text-danger"><p>Portal no encontrado.</p></div>;
    }
    
    const brandColor = settings.brandColor || '#3C50E0';
    const currency = customer.currency || settings.currency;
    const placement = settings.currencyPlacement;

    return (
        <div className="min-h-screen bg-secondary p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    {settings.companyLogo ? (
                        <img src={settings.companyLogo} alt={settings.companyName} className="max-h-16 mx-auto mb-4" />
                    ) : (
                        <h1 className="text-3xl font-bold" style={{ color: brandColor }}>{settings.companyName}</h1>
                    )}
                    <h2 className="text-2xl font-semibold text-text-primary mt-4">Portal de Cliente: {customer.name}</h2>
                    <p className="text-text-secondary">Aquí puede ver y descargar su historial de facturas.</p>
                </header>

                <main className="bg-surface rounded-lg border border-border-color shadow-md">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left">
                                <tr>
                                    <th className="py-4 px-6 font-semibold text-text-secondary uppercase">Número</th>
                                    <th className="py-4 px-6 font-semibold text-text-secondary uppercase">Fecha</th>
                                    <th className="py-4 px-6 font-semibold text-text-secondary uppercase text-right">Total</th>
                                    <th className="py-4 px-6 font-semibold text-text-secondary uppercase">Estado</th>
                                    <th className="py-4 px-6 font-semibold text-text-secondary uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => {
                                    const { total } = calculateInvoiceTotal(invoice);
                                    return (
                                        <tr key={invoice.id} className="hover:bg-secondary">
                                            <td className="border-t border-border-color py-5 px-6">
                                                <p className="text-text-primary font-medium">{invoice.series}-{invoice.number}</p>
                                            </td>
                                            <td className="border-t border-border-color py-5 px-6">
                                                <p className="text-text-primary">{new Date(invoice.date).toLocaleDateString()}</p>
                                            </td>
                                            <td className="border-t border-border-color py-5 px-6 text-right">
                                                <p className="text-text-primary font-medium">{formatCurrency(total, currency, placement)}</p>
                                            </td>
                                            <td className="border-t border-border-color py-5 px-6">
                                                <p className={`inline-flex rounded-full py-1 px-3 text-xs font-semibold ${getStatusClass(invoice.status)}`}>
                                                    {invoice.status}
                                                </p>
                                            </td>
                                            <td className="border-t border-border-color py-5 px-6">
                                                <Link to={`/public/invoice/${invoice.id}`} target="_blank" className="font-semibold text-primary hover:underline">
                                                    Ver / Descargar
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {invoices.length === 0 && <p className="p-6 text-center text-text-secondary">No hay facturas disponibles.</p>}
                    </div>
                </main>
                 <footer className="text-center mt-8 text-sm text-text-secondary">
                    <p>Powered by FactuPro™</p>
                </footer>
            </div>
        </div>
    );
};

export default CustomerPublicPage;