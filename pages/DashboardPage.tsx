


import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import * as api from '../services/apiService';
import { calculateInvoiceTotal } from '../utils/calculations';
import { Invoice, Customer, Settings } from '../types';
import { Link } from 'react-router-dom';
import EvolutionChart from '../components/charts/EvolutionChart';
import TopCustomersChart from '../components/charts/TopCustomersChart';
import HighValueCustomersList from '../components/charts/HighValueCustomersList';
import { formatCurrency } from '../utils/currency';

const EyeIcon = () => (<span className="material-symbols-outlined">payments</span>);
const DocumentIcon = () => (<span className="material-symbols-outlined">receipt_long</span>);
const QuoteIcon = () => (<span className="material-symbols-outlined">request_quote</span>);
const UsersIcon = () => (<span className="material-symbols-outlined">group</span>);
const PaidIcon = () => (<span className="material-symbols-outlined">task_alt</span>);
const PendingIcon = () => (<span className="material-symbols-outlined">pending</span>);
const OverdueIcon = () => (<span className="material-symbols-outlined">report</span>);
const VoidIcon = () => (<span className="material-symbols-outlined">do_not_disturb_on</span>);


interface DashboardStats {
    totalRevenue: number;
    invoiceCount: number;
    pendingQuotesCount: number;
    activeCustomersCount: number;
    paidLastYear: number;
    pendingLastYear: number;
    overdueTotal: number;
    voidedLastYear: number;
}

const getStatusClass = (status: Invoice['status']) => {
    switch (status) {
        case 'paid': return 'bg-success-10 text-success';
        case 'issued': return 'bg-accent-10 text-accent';
        case 'draft': return 'bg-text-secondary-10 text-gray-600';
        case 'void': return 'bg-danger-10 text-danger';
        default: return 'bg-text-secondary-10 text-gray-600';
    }
};

const colors = ['#0d6efd', '#80CAEE', '#10B981', '#FBBF24', '#F87171'];

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [customersMap, setCustomersMap] = useState<Map<string, Customer>>(new Map());
    const [settings, setSettings] = useState<Settings | null>(null);
    const [topCustomers, setTopCustomers] = useState<{ name: string; total: number }[]>([]);
    const [highValueCustomers, setHighValueCustomers] = useState<{ id: string; name: string; total: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [yearlyTotals, setYearlyTotals] = useState<{ year: number; total: number; taxableBase: number }[]>([]);

    const [highValueYear, setHighValueYear] = useState<number>(new Date().getFullYear());
    const [availableYearsForHighValue, setAvailableYearsForHighValue] = useState<number[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const [invoices, quotes, customers, appSettings] = await Promise.all([
                    api.getInvoices(),
                    api.getQuotes(),
                    api.getCustomers(),
                    api.getSettings(),
                ]);
                
                setSettings(appSettings);
                const customerMap = new Map(customers.map(c => [c.id, c]));
                setCustomersMap(customerMap);

                const filteredInvoicesByDate = invoices.filter(inv => {
                    if (!dateRange.from && !dateRange.to) return true;
                    const invDate = new Date(inv.date);
                    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
                    if(fromDate) fromDate.setUTCHours(0,0,0,0);
                    const toDate = dateRange.to ? new Date(dateRange.to) : null;
                     if(toDate) toDate.setUTCHours(23,59,59,999);

                    if (fromDate && invDate < fromDate) return false;
                    if (toDate && invDate > toDate) return false;
                    return true;
                });
                
                // Last year stats calculation
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                const today = new Date();

                const invoicesLastYear = invoices.filter(inv => new Date(inv.date) >= oneYearAgo);

                const paidLastYear = invoicesLastYear
                    .filter(inv => inv.status === 'paid')
                    .reduce((sum, inv) => sum + calculateInvoiceTotal(inv).total, 0);

                const pendingLastYear = invoicesLastYear
                    .filter(inv => inv.status === 'issued' && new Date(inv.dueDate) >= today)
                    .reduce((sum, inv) => sum + calculateInvoiceTotal(inv).total, 0);

                const overdueTotal = invoices
                    .filter(inv => inv.status === 'issued' && new Date(inv.dueDate) < today)
                    .reduce((sum, inv) => sum + calculateInvoiceTotal(inv).total, 0);
                
                const voidedLastYear = invoicesLastYear
                    .filter(inv => inv.status === 'void')
                    .reduce((sum, inv) => sum + calculateInvoiceTotal(inv).total, 0);


                setRecentInvoices(filteredInvoicesByDate.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5));

                const customerRevenue: { [id: string]: number } = {};
                const customerRevenueByYear: { [year: number]: { [id: string]: number } } = {};
                const yearlyStats: { [year: number]: { total: number; taxableBase: number } } = {};

                invoices.filter(inv => inv.status === 'paid' || inv.status === 'issued').forEach(inv => {
                    const totals = calculateInvoiceTotal(inv);
                    const year = new Date(inv.date).getFullYear();
                    
                    customerRevenue[inv.customerId] = (customerRevenue[inv.customerId] || 0) + totals.total;

                    if (!customerRevenueByYear[year]) {
                        customerRevenueByYear[year] = {};
                    }
                    customerRevenueByYear[year][inv.customerId] = (customerRevenueByYear[year][inv.customerId] || 0) + totals.total;
                    
                    if (!yearlyStats[year]) {
                        yearlyStats[year] = { total: 0, taxableBase: 0 };
                    }
                    yearlyStats[year].total += totals.total;
                    yearlyStats[year].taxableBase += totals.taxableBase;
                });
                
                const yearsWithData = Object.keys(customerRevenueByYear).map(Number).sort((a, b) => b - a);
                setAvailableYearsForHighValue(yearsWithData.length > 0 ? yearsWithData : [new Date().getFullYear()]);

                const sortedTopCustomers = Object.entries(customerRevenue)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([id, total]) => ({ name: customerMap.get(id)?.name || 'Desconocido', total }));
                setTopCustomers(sortedTopCustomers);
                
                const highValue = Object.entries(customerRevenueByYear[highValueYear] || {})
                    .filter(([, total]) => total > 3000)
                    .map(([id, total]) => ({ id, name: customerMap.get(id)?.name || 'Desconocido', total }));
                setHighValueCustomers(highValue);

                const yearlyRevenue: { [year: number]: number[] } = {};
                const validInvoices = filteredInvoicesByDate.filter(inv => inv.status === 'paid' || inv.status === 'issued');
                validInvoices.forEach(inv => {
                    const date = new Date(inv.date);
                    const year = date.getFullYear();
                    const month = date.getMonth();
                    if (!yearlyRevenue[year]) {
                        yearlyRevenue[year] = Array(12).fill(0);
                    }
                    yearlyRevenue[year][month] += calculateInvoiceTotal(inv).total;
                });
                
                const currentYear = new Date().getFullYear();
                const chartDataResult = [];
                for(let i=0; i < 5; i++){
                    const year = currentYear - i;
                    if(yearlyRevenue[year] || new Date().getFullYear() === year){
                        chartDataResult.push({
                            name: year.toString(),
                            data: yearlyRevenue[year] || Array(12).fill(0),
                        })
                    }
                }
                chartDataResult.reverse();
                setChartData(chartDataResult);
                
                const yearlyTotalsData = Object.keys(yearlyStats)
                    .map(yearStr => ({
                        year: parseInt(yearStr),
                        total: yearlyStats[parseInt(yearStr)].total,
                        taxableBase: yearlyStats[parseInt(yearStr)].taxableBase,
                    }))
                    .sort((a, b) => b.year - a.year)
                    .slice(0, 5);
                setYearlyTotals(yearlyTotalsData);

                setStats({
                    totalRevenue: invoices.filter(inv => inv.status === 'paid' || inv.status === 'issued').reduce((sum, inv) => sum + calculateInvoiceTotal(inv).total, 0),
                    invoiceCount: invoices.length,
                    pendingQuotesCount: quotes.filter(q => q.status === 'sent').length,
                    activeCustomersCount: customers.length,
                    paidLastYear,
                    pendingLastYear,
                    overdueTotal,
                    voidedLastYear,
                });

            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [dateRange, highValueYear]);

    const inputClasses = "w-full rounded-md border border-border-color bg-surface py-2 pl-10 pr-3 text-sm font-medium text-text-primary outline-none transition focus:border-primary";

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
            
            {/* Main Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                         <div key={index} className="rounded-lg bg-surface p-6 border border-border-color animate-pulse">
                            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                            <div className="mt-4">
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                            </div>
                         </div>
                    ))
                ) : (
                    <>
                        <Card title="Ingresos Totales Históricos" value={formatCurrency(stats?.totalRevenue || 0, settings?.currency, settings?.currencyPlacement)} icon={<EyeIcon />} />
                        <Card title="Facturas Totales" value={`${stats?.invoiceCount}`} icon={<DocumentIcon />} />
                        <Card title="Presupuestos Pendientes" value={`${stats?.pendingQuotesCount}`} icon={<QuoteIcon />} />
                        <Card title="Clientes Activos" value={`${stats?.activeCustomersCount}`} icon={<UsersIcon />} />
                    </>
                )}
            </div>
            
            {/* Secondary Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                 {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                         <div key={index} className="rounded-lg bg-surface p-6 border border-border-color animate-pulse">
                            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                            <div className="mt-4">
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                            </div>
                         </div>
                    ))
                ) : (
                    <>
                        <Card title="Pagado (Último Año)" value={formatCurrency(stats?.paidLastYear || 0, settings?.currency, settings?.currencyPlacement)} icon={<PaidIcon />} />
                        <Card title="Pendiente (Último Año)" value={formatCurrency(stats?.pendingLastYear || 0, settings?.currency, settings?.currencyPlacement)} icon={<PendingIcon />} />
                        <Card title="Vencido (Total)" value={formatCurrency(stats?.overdueTotal || 0, settings?.currency, settings?.currencyPlacement)} icon={<OverdueIcon />} />
                        <Card title="Anulado (Último Año)" value={formatCurrency(stats?.voidedLastYear || 0, settings?.currency, settings?.currencyPlacement)} icon={<VoidIcon />} />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 bg-surface rounded-lg border border-border-color p-6">
                     <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                        <div>
                            <h3 className="font-semibold text-text-primary">Evolución de Ingresos</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">calendar_month</span>
                                <input type="date" name="from" value={dateRange.from} onChange={(e) => setDateRange(prev => ({...prev, from: e.target.value}))} className={inputClasses}/>
                            </div>
                            <span className="text-text-secondary">-</span>
                            <div className="relative">
                                 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">calendar_month</span>
                                <input type="date" name="to" value={dateRange.to} onChange={(e) => setDateRange(prev => ({...prev, to: e.target.value}))} className={inputClasses}/>
                            </div>
                        </div>
                    </div>
                    <EvolutionChart series={chartData} />
                </div>
                <div className="bg-surface rounded-lg border border-border-color">
                    <div className="p-6 border-b border-border-color">
                        <h2 className="text-lg font-semibold text-text-primary">Facturas Recientes</h2>
                    </div>
                     {isLoading ? <p className="p-6 text-text-secondary">Cargando...</p> : (
                        <div className="flex flex-col">
                           {recentInvoices.map(invoice => {
                                const customer = customersMap.get(invoice.customerId);
                                const currency = customer?.currency || settings?.currency;
                               return (
                                <Link to={`/invoices/${invoice.id}`} key={invoice.id} className="flex justify-between items-center p-4 border-b border-border-color last:border-b-0 hover:bg-secondary transition-colors">
                                    <div>
                                        <p className="font-semibold text-text-primary">{invoice.series}-{invoice.number}</p>
                                        <p className="text-sm text-text-secondary">{customer?.name || 'Cliente desconocido'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-text-primary">{formatCurrency(calculateInvoiceTotal(invoice).total, currency, settings?.currencyPlacement)}</p>
                                        <p className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${getStatusClass(invoice.status)}`}>{invoice.status}</p>
                                    </div>
                                </Link>
                           );
                           })}
                           {recentInvoices.length === 0 && <p className="p-6 text-text-secondary">No hay facturas en el rango seleccionado.</p>}
                        </div>
                     )}
                </div>
            </div>

             <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                 <div className="lg:col-span-2 bg-surface rounded-lg border border-border-color p-6">
                     <TopCustomersChart data={topCustomers} currency={settings?.currency} placement={settings?.currencyPlacement} />
                 </div>
                 <div className="bg-surface rounded-lg border border-border-color">
                     <HighValueCustomersList 
                        customers={highValueCustomers} 
                        selectedYear={highValueYear}
                        onYearChange={setHighValueYear}
                        availableYears={availableYearsForHighValue}
                        currency={settings?.currency}
                        placement={settings?.currencyPlacement}
                     />
                 </div>
            </div>
            
            <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Resumen Anual de Ingresos</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {yearlyTotals.map((data, index) => {
                         const seriesIndex = chartData.findIndex(series => series.name === data.year.toString());
                         const color = seriesIndex !== -1 ? colors[seriesIndex % colors.length] : '#6b7280';
                        
                        return (
                            <div 
                                key={data.year} 
                                className="rounded-lg p-4 text-center bg-surface border-t-2 border-black"
                            >
                                <p className="text-sm font-medium text-text-secondary">{data.year}</p>
                                <h4 className="text-2xl font-bold mt-1" style={{ color: color }}>
                                    {formatCurrency(data.total, settings?.currency, settings?.currencyPlacement)}
                                </h4>
                                <p className="text-xs text-text-secondary mt-1">
                                    Base: {formatCurrency(data.taxableBase, settings?.currency, settings?.currencyPlacement)}
                                </p>
                            </div>
                        );
                    })}
                     {yearlyTotals.length === 0 && !isLoading && <p className="p-6 text-text-secondary text-sm col-span-full text-center">No hay datos de ingresos para mostrar.</p>}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;