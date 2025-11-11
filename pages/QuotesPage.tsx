

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Quote, Customer, Settings } from '../types';
import * as api from '../services/apiService';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { calculateInvoiceTotal } from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/ui/Pagination';

const getStatusClass = (status: Quote['status']) => {
    switch (status) {
        case 'accepted': return 'bg-success-10 text-success';
        case 'sent': return 'bg-primary-10 text-primary';
        case 'draft': return 'bg-text-secondary-10 text-gray-600';
        case 'rejected':
        case 'expired':
            return 'bg-danger-10 text-danger';
        default: return 'bg-gray-200 text-bodydark';
    }
};

const ITEMS_PER_PAGE = 10;
const statusOptions: Quote['status'][] = ['draft', 'sent', 'accepted', 'rejected', 'expired'];

const QuotesPage: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [customers, setCustomers] = useState<Map<string, Customer>>(new Map());
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConverting, setIsConverting] = useState<string | null>(null);
    const navigate = useNavigate();
    const showToast = useToast();
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        expiryStartDate: '',
        expiryEndDate: '',
    });


     const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [quoteData, customerData, settingsData] = await Promise.all([
                api.getQuotes(),
                api.getCustomers(),
                api.getSettings()
            ]);
            setQuotes(quoteData);
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
            localStorage.setItem(`lastVisit_quotes_${user.id}`, new Date().toISOString());
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
            status: '',
            expiryStartDate: '',
            expiryEndDate: '',
        });
    }

    const handleConvertToInvoice = async (quoteId: string) => {
        setIsConverting(quoteId);
        try {
            const newInvoice = await api.convertQuoteToInvoice(quoteId);
            if (newInvoice) {
                showToast('Presupuesto convertido a factura con éxito.', 'success');
                navigate(`/invoices/${newInvoice.id}`);
            }
        } catch (error) {
            console.error('Error converting quote to invoice:', error);
            showToast('No se pudo convertir el presupuesto.', 'error');
        } finally {
            setIsConverting(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este presupuesto?')) {
            try {
                await api.deleteQuote(id);
                await fetchData();
                showToast('Presupuesto eliminado.', 'success');
            } catch (error) {
                console.error("Error deleting quote:", error);
                showToast('No se pudo eliminar el presupuesto.', 'error');
            }
        }
    };
    
    const handleSendQuote = async (id: string) => {
        if (window.confirm('¿Marcar este presupuesto como enviado al cliente?')) {
            try {
                await api.updateQuoteStatus(id, 'sent');
                await fetchData();
                showToast('Presupuesto marcado como enviado.', 'info');
            } catch (error) {
                console.error("Error sending quote:", error);
                showToast('No se pudo actualizar el estado.', 'error');
            }
        }
    };
    
     const processedQuotes = useMemo(() => {
        let filtered = [...quotes];

        if (filters.status) {
            filtered = filtered.filter(q => q.status === filters.status);
        }
        if (filters.expiryStartDate) {
            const startDate = new Date(filters.expiryStartDate);
            startDate.setUTCHours(0, 0, 0, 0);
            filtered = filtered.filter(q => new Date(q.expiryDate) >= startDate);
        }
        if (filters.expiryEndDate) {
            const endDate = new Date(filters.expiryEndDate);
            endDate.setUTCHours(23, 59, 59, 999);
            filtered = filtered.filter(q => new Date(q.expiryDate) <= endDate);
        }

        return filtered.sort((a,b) => b.number.localeCompare(a.number));
    }, [quotes, filters]);
    
    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
        return processedQuotes.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, processedQuotes]);
    
    const inputClasses = "w-full rounded-md border border-border-color bg-surface py-2 px-3 font-medium text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";
    const labelClasses = "mb-1.5 block font-medium text-text-primary text-sm";


    return (
        <div className="rounded-lg shadow-lg bg-white px-5 pt-6 pb-2.5 dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-black dark:text-white">Presupuestos</h1>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center justify-center gap-2 rounded-md border border-border-color bg-white py-2 px-4 text-center font-medium text-text-primary hover:bg-secondary">
                        <span className="material-symbols-outlined text-xl">filter_list</span>
                        Filtros
                    </button>
                    <button onClick={() => navigate('/quotes/new')} className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90">
                        Nuevo Presupuesto
                    </button>
                </div>
            </div>

             {showFilters && (
                <div className="mb-6 p-4 rounded-lg bg-secondary border border-border-color transition-all animate-fade-in-down">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClasses}>Estado</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange} className={`${inputClasses} appearance-none`}>
                                <option value="">Todos los estados</option>
                                {statusOptions.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Vencimiento Desde</label>
                            <input type="date" name="expiryStartDate" value={filters.expiryStartDate} onChange={handleFilterChange} className={inputClasses}/>
                        </div>
                        <div>
                            <label className={labelClasses}>Vencimiento Hasta</label>
                            <input type="date" name="expiryEndDate" value={filters.expiryEndDate} onChange={handleFilterChange} className={inputClasses}/>
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
                <p className="text-center py-10 text-bodydark">Cargando presupuestos...</p>
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
                            {currentTableData.map((quote) => {
                                 const { total } = calculateInvoiceTotal({ ...quote, globalDiscount: { type: 'percentage', value: 0 } });
                                 const customer = customers.get(quote.customerId);
                                 const currency = customer?.currency || settings?.currency;
                                 return (
                                <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-boxdark-2">
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <p className="text-black dark:text-white font-medium">{quote.number}</p>
                                    </td>
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <p className="text-black dark:text-white">{customer?.name || quote.customerId}</p>
                                    </td>
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <p className="text-black dark:text-white">{new Date(quote.date).toLocaleDateString()}</p>
                                    </td>
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4 text-right">
                                        <p className="text-black dark:text-white font-medium">{formatCurrency(total, currency, settings?.currencyPlacement)}</p>
                                    </td>
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <p className={`inline-flex rounded-full py-1 px-3 text-xs font-semibold ${getStatusClass(quote.status)}`}>
                                            {quote.status}
                                        </p>
                                    </td>
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <div className="flex items-center space-x-3.5">
                                            <Link to={`/quotes/view/${quote.id}`} className="hover:text-primary">Ver</Link>
                                            <button onClick={() => navigate(`/quotes/edit/${quote.id}`)} className="hover:text-primary">Editar</button>
                                            <button onClick={() => handleDelete(quote.id)} className="hover:text-danger">Eliminar</button>
                                            {quote.status === 'draft' && (
                                                <button onClick={() => handleSendQuote(quote.id)} className="hover:text-info">Enviar</button>
                                            )}
                                            {quote.status === 'accepted' && (
                                                <button 
                                                    onClick={() => handleConvertToInvoice(quote.id)}
                                                    disabled={isConverting === quote.id}
                                                    className="hover:text-success disabled:text-gray-400"
                                                >
                                                    {isConverting === quote.id ? 'Convirtiendo...' : 'Facturar'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                 );
                            })}
                        </tbody>
                    </table>
                     {processedQuotes.length === 0 && (
                        <p className="text-center py-10 text-text-secondary">No se encontraron presupuestos con los filtros seleccionados.</p>
                    )}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalCount={processedQuotes.length}
                    pageSize={ITEMS_PER_PAGE}
                    onPageChange={page => setCurrentPage(page)}
                />
                </>
            )}
        </div>
    );
};

export default QuotesPage;