

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Invoice, Customer, Settings } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../services/apiService';
import { calculateInvoiceTotal } from '../utils/calculations';
import Pagination from '../components/ui/Pagination';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';

const getStatusClass = (status: Invoice['status']) => {
    switch (status) {
        case 'paid': return 'bg-success-10 text-success';
        case 'issued': return 'bg-accent-10 text-accent';
        case 'draft': return 'bg-text-secondary-10 text-gray-600';
        case 'void': return 'bg-danger-10 text-danger';
        case 'rectified': return 'bg-warning-10 text-warning';
        default: return 'bg-text-secondary-10 text-gray-600';
    }
};

const ITEMS_PER_PAGE = 10;
const statusOptions: Invoice['status'][] = ['draft', 'issued', 'paid', 'void', 'rectified'];

const InvoicesPage: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [customers, setCustomers] = useState<Map<string, Customer>>(new Map());
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const showToast = useToast();

    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        customerId: '',
        status: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: ''
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [invoiceData, customerData, settingsData] = await Promise.all([
                api.getInvoices(),
                api.getCustomers(),
                api.getSettings(),
            ]);
            setInvoices(invoiceData);
            const customerMap = new Map(customerData.map(c => [c.id, c]));
            setCustomers(customerMap);
            setSettings(settingsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        if (user) {
            localStorage.setItem(`lastVisit_invoices_${user.id}`, new Date().toISOString());
        }
    }, [fetchData, user]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };
    
    const handleClearFilters = () => {
        setFilters({
            customerId: '',
            status: '',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: ''
        });
    }
    
    const getPublicLink = (invoiceId: string) => {
        const { protocol, host, pathname } = window.location;
        const cleanPathname = pathname.includes('/#/') ? pathname.split('/#/')[0] : pathname;
        return `${protocol}//${host}${cleanPathname}#/public/invoice/${invoiceId}`;
    }

    const handleOpenLinkModal = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsLinkModalOpen(true);
    };

    const handleCloseLinkModal = () => {
        setIsLinkModalOpen(false);
        setSelectedInvoice(null);
    };

    const handleVoidInvoice = async (invoiceId: string) => {
        if (window.confirm('¿Está seguro de que desea anular esta factura? Esta acción no se puede deshacer.')) {
            try {
                await api.updateInvoiceStatus(invoiceId, 'void');
                await fetchData();
            } catch (error) {
                console.error("Error voiding invoice:", error);
                alert("No se pudo anular la factura.");
            }
        }
    };

    const handleEditInvoice = (invoice: Invoice) => {
        if (invoice.status === 'paid' || invoice.status === 'issued') {
            const message = invoice.status === 'paid'
                ? 'ADVERTENCIA: Esta factura ya ha sido pagada. Editarla puede tener implicaciones fiscales. Se recomienda crear una factura rectificativa en su lugar. ¿Desea continuar con la edición de todos modos?'
                : 'ADVERTENCIA: Esta factura ya ha sido emitida a un cliente. Editarla puede causar discrepancias. Se recomienda anular esta y crear una nueva si es necesario. ¿Desea continuar con la edición de todos modos?';
            
            if (window.confirm(message)) {
                navigate(`/invoices/edit/${invoice.id}`);
            }
        } else {
            navigate(`/invoices/edit/${invoice.id}`);
        }
    };

    const processedInvoices = useMemo(() => {
        let filtered = [...invoices];

        if (filters.customerId) {
            filtered = filtered.filter(inv => inv.customerId === filters.customerId);
        }
        if (filters.status) {
            filtered = filtered.filter(inv => inv.status === filters.status);
        }
        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            startDate.setUTCHours(0, 0, 0, 0);
            filtered = filtered.filter(inv => new Date(inv.date) >= startDate);
        }
        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setUTCHours(23, 59, 59, 999);
            filtered = filtered.filter(inv => new Date(inv.date) <= endDate);
        }
        const min = parseFloat(filters.minAmount);
        if (!isNaN(min)) {
            filtered = filtered.filter(inv => calculateInvoiceTotal(inv).total >= min);
        }
        const max = parseFloat(filters.maxAmount);
        if (!isNaN(max)) {
            filtered = filtered.filter(inv => calculateInvoiceTotal(inv).total <= max);
        }

        return filtered.sort((a, b) => {
            const dateComp = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateComp !== 0) return dateComp;
            return b.number - a.number;
        });
    }, [invoices, filters]);

    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
        return processedInvoices.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, processedInvoices]);

    const inputClasses = "w-full rounded-md border border-border-color bg-surface py-2 px-3 font-medium text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
    const labelClasses = "mb-1.5 block font-medium text-text-primary text-sm";


    return (
        <>
            <div className="rounded-lg shadow-lg bg-white px-5 pt-6 pb-2.5 dark:bg-boxdark sm:px-7.5 xl:pb-1">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h1 className="text-2xl font-bold text-black dark:text-white">Facturas</h1>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center justify-center gap-2 rounded-md border border-border-color bg-white py-2 px-4 text-center font-medium text-text-primary hover:bg-secondary">
                            <span className="material-symbols-outlined text-xl">filter_list</span>
                            Filtros
                        </button>
                        <Link to="/invoices/new" className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90">
                            Nueva Factura
                        </Link>
                    </div>
                </div>

                {showFilters && (
                    <div className="mb-6 p-4 rounded-lg bg-secondary border border-border-color transition-all animate-fade-in-down">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <div>
                                <label className={labelClasses}>Cliente</label>
                                <select name="customerId" value={filters.customerId} onChange={handleFilterChange} className={`${inputClasses} appearance-none`}>
                                    <option value="">Todos los clientes</option>
                                    {[...customers.values()].map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Estado</label>
                                <select name="status" value={filters.status} onChange={handleFilterChange} className={`${inputClasses} appearance-none`}>
                                    <option value="">Todos los estados</option>
                                    {statusOptions.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Fecha Desde</label>
                                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={inputClasses}/>
                            </div>
                            <div>
                                <label className={labelClasses}>Fecha Hasta</label>
                                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={inputClasses}/>
                            </div>
                            <div className="lg:col-span-2 xl:col-span-1">
                                <label className={labelClasses}>Importe</label>
                                <div className="flex items-center gap-2">
                                     <input type="number" name="minAmount" placeholder="Mín" value={filters.minAmount} onChange={handleFilterChange} className={`${inputClasses} text-right`}/>
                                     <span>-</span>
                                     <input type="number" name="maxAmount" placeholder="Máx" value={filters.maxAmount} onChange={handleFilterChange} className={`${inputClasses} text-right`}/>
                                </div>
                            </div>
                        </div>
                         <div className="mt-4 flex justify-end">
                            <button onClick={handleClearFilters} className="text-sm font-medium text-text-secondary hover:text-primary hover:underline">
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                )}


                 {isLoading ? (
                    <p className="text-center py-10 text-text-secondary">Cargando facturas...</p>
                ) : (
                    <>
                        <div className="max-w-full overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left">
                                        <th className="py-4 px-4 font-semibold text-black dark:text-white">Número</th>
                                        <th className="py-4 px-4 font-semibold text-black dark:text-white">Cliente</th>
                                        <th className="py-4 px-4 font-semibold text-black dark:text-white">Fecha</th>
                                        <th className="py-4 px-4 font-semibold text-black dark:text-white text-right">Total</th>
                                        <th className="py-4 px-4 font-semibold text-black dark:text-white">Estado</th>
                                        <th className="py-4 px-4 font-semibold text-black dark:text-white">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTableData.map((invoice) => {
                                        const { total } = calculateInvoiceTotal(invoice);
                                        const customer = customers.get(invoice.customerId);
                                        const currency = customer?.currency || settings?.currency;
                                        return (
                                            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-boxdark-2">
                                                <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                                    <p className="text-black dark:text-white font-medium">{invoice.series}{invoice.number}</p>
                                                </td>
                                                <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                                    <p className="text-black dark:text-white">{customer?.name || invoice.customerId}</p>
                                                </td>
                                                <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                                    <p className="text-black dark:text-white">{new Date(invoice.date).toLocaleDateString()}</p>
                                                </td>
                                                <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4 text-right">
                                                    <p className="text-black dark:text-white font-medium">{formatCurrency(total, currency, settings?.currencyPlacement)}</p>
                                                </td>
                                                <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                                    <p className={`inline-flex rounded-full py-1 px-3 text-xs font-semibold ${getStatusClass(invoice.status)}`}>
                                                        {invoice.status}
                                                    </p>
                                                </td>
                                                <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                                    <div className="flex items-center space-x-3.5">
                                                        <Link to={`/invoices/${invoice.id}`} className="hover:text-primary">Ver</Link>
                                                        {(invoice.status === 'draft' || invoice.status === 'paid' || invoice.status === 'issued') && (
                                                          <button onClick={() => handleEditInvoice(invoice)} className="hover:text-primary">Editar</button>
                                                        )}
                                                        {(invoice.status === 'issued' || invoice.status === 'paid') && (
                                                          <button onClick={() => handleVoidInvoice(invoice.id)} className="hover:text-danger">Anular</button>
                                                        )}
                                                        <button onClick={() => handleOpenLinkModal(invoice)} className="hover:text-accent">Enlace</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {processedInvoices.length === 0 && (
                                <p className="text-center py-10 text-text-secondary">No se encontraron facturas con los filtros seleccionados.</p>
                            )}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalCount={processedInvoices.length}
                            pageSize={ITEMS_PER_PAGE}
                            onPageChange={page => setCurrentPage(page)}
                        />
                    </>
                )}
            </div>
            <Modal isOpen={isLinkModalOpen} onClose={handleCloseLinkModal} title="Enlace Público de la Factura">
                {selectedInvoice && (
                    <div>
                        <p className="mb-4 text-text-secondary">Copie y comparta este enlace para que la factura sea visible públicamente.</p>
                        <input
                            type="text"
                            readOnly
                            value={getPublicLink(selectedInvoice.id)}
                            className="w-full rounded-md border border-border-color bg-secondary p-3 font-mono text-sm"
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(getPublicLink(selectedInvoice.id));
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

export default InvoicesPage;