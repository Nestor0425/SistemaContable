

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../services/apiService';
import { Customer, Invoice, Settings } from '../types';
import { calculateInvoiceTotal } from '../utils/calculations';
import Card from '../components/ui/Card';
import { formatCurrency } from '../utils/currency';

const TotalRevenueIcon = () => (<span className="material-symbols-outlined">payments</span>);
const TotalInvoicesIcon = () => (<span className="material-symbols-outlined">receipt_long</span>);

const getStatusClass = (status: Invoice['status']) => {
    switch (status) {
        case 'paid': return 'bg-success/10 text-success';
        case 'issued': return 'bg-accent/10 text-accent';
        case 'draft': return 'bg-gray-500/10 text-gray-600';
        case 'void': return 'bg-danger/10 text-danger';
        default: return 'bg-gray-500/10 text-gray-600';
    }
};

const CustomerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState<number[]>([]);

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

                const customerInvoices = allInvoices.filter(inv => inv.customerId === id);
                const yearsWithInvoices = [...new Set(customerInvoices.map(inv => new Date(inv.date).getFullYear()))].sort((a,b) => b-a);

                setCustomer(customerData || null);
                setInvoices(customerInvoices);
                setSettings(settingsData);
                setAvailableYears(yearsWithInvoices.length > 0 ? yearsWithInvoices : [new Date().getFullYear()]);
                
                if (!yearsWithInvoices.includes(selectedYear) && yearsWithInvoices.length > 0) {
                    setSelectedYear(yearsWithInvoices[0]);
                }


            } catch (error) {
                console.error("Error fetching customer details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const currency = customer?.currency || settings?.currency;
    const placement = settings?.currencyPlacement;

    const totalRevenue = invoices
        .filter(inv => inv.status === 'paid' || inv.status === 'issued')
        .reduce((sum, inv) => sum + calculateInvoiceTotal(inv).total, 0);
    
    const yearlyInvoices = invoices.filter(inv => new Date(inv.date).getFullYear() === selectedYear);

    const yearlyTotalRevenue = yearlyInvoices
        .filter(inv => inv.status === 'paid' || inv.status === 'issued')
        .reduce((sum, inv) => sum + calculateInvoiceTotal(inv).total, 0);

    const yearlyTaxableBase = yearlyInvoices
        .filter(inv => inv.status === 'paid' || inv.status === 'issued')
        .reduce((sum, inv) => sum + calculateInvoiceTotal(inv).taxableBase, 0);


    const quarterlyRevenue = yearlyInvoices
        .filter(inv => inv.status === 'paid' || inv.status === 'issued')
        .reduce((acc, inv) => {
            const date = new Date(inv.date);
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            acc[quarter] = (acc[quarter] || 0) + calculateInvoiceTotal(inv).total;
            return acc;
        }, {} as Record<number, number>);


    if (isLoading) {
        return <p className="p-6 text-text-secondary">Cargando datos del cliente...</p>;
    }

    if (!customer) {
        return <p className="p-6 text-danger">Cliente no encontrado.</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">{customer.name}</h1>
                    <p className="text-text-secondary">{customer.nif} | {customer.email}</p>
                </div>
                 <Link to={`/portal/customer/${customer.id}`} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-md bg-accent/10 py-2 px-4 text-center font-medium text-accent hover:bg-accent/20 transition-colors">
                    <span className="material-symbols-outlined">link</span>
                    Portal Público
                </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Card title="Ingresos Totales (Histórico)" value={formatCurrency(totalRevenue, currency, placement)} icon={<TotalRevenueIcon />} />
                <Card title="Facturas Totales (Histórico)" value={`${invoices.length}`} icon={<TotalInvoicesIcon />} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-lg bg-white p-6 border border-border-color">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-text-primary">Resumen Anual</h2>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="rounded-md border border-border-color bg-surface py-1 px-2 text-sm font-medium text-text-primary outline-none transition focus:border-primary"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                     <div className="p-4 rounded-lg bg-secondary text-center mb-6">
                        <p className="text-sm font-medium text-text-secondary">Total {selectedYear}</p>
                        <p className="text-3xl font-bold text-text-primary mt-1">{formatCurrency(yearlyTotalRevenue, currency, placement)}</p>
                        <p className="text-sm text-text-secondary mt-1">Base Imponible: {formatCurrency(yearlyTaxableBase, currency, placement)}</p>
                    </div>
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Facturación Trimestral ({selectedYear})</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-secondary">
                            <p className="text-sm font-medium text-text-secondary">Trimestre 1</p>
                            <p className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(quarterlyRevenue[1] || 0, currency, placement)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary">
                            <p className="text-sm font-medium text-text-secondary">Trimestre 2</p>
                            <p className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(quarterlyRevenue[2] || 0, currency, placement)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary">
                            <p className="text-sm font-medium text-text-secondary">Trimestre 3</p>
                            <p className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(quarterlyRevenue[3] || 0, currency, placement)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary">
                            <p className="text-sm font-medium text-text-secondary">Trimestre 4</p>
                            <p className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(quarterlyRevenue[4] || 0, currency, placement)}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white border border-border-color">
                    <div className="p-6 border-b border-border-color">
                        <h2 className="text-lg font-semibold text-text-primary">Historial de Facturas ({selectedYear})</h2>
                    </div>
                    <div className="flex flex-col max-h-96 overflow-y-auto">
                       {yearlyInvoices.map(invoice => (
                            <Link to={`/invoices/${invoice.id}`} key={invoice.id} className="flex justify-between items-center p-4 border-b border-border-color last:border-b-0 hover:bg-secondary transition-colors">
                                <div>
                                    <p className="font-semibold text-text-primary">{invoice.series}-{invoice.number}</p>
                                    <p className="text-sm text-text-secondary">{new Date(invoice.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-text-primary">{formatCurrency(calculateInvoiceTotal(invoice).total, currency, placement)}</p>
                                    <p className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${getStatusClass(invoice.status)}`}>{invoice.status}</p>
                                </div>
                            </Link>
                       ))}
                       {yearlyInvoices.length === 0 && <p className="p-6 text-text-secondary">No hay facturas para este cliente en el año seleccionado.</p>}
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default CustomerDetailPage;