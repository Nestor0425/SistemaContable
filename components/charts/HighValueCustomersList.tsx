

import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';

interface HighValueCustomer {
    id: string;
    name: string;
    total: number;
}

interface HighValueCustomersListProps {
    customers: HighValueCustomer[];
    selectedYear: number;
    onYearChange: (year: number) => void;
    availableYears: number[];
    currency?: string;
    placement?: 'before' | 'after';
}

const HighValueCustomersList: React.FC<HighValueCustomersListProps> = ({ customers, selectedYear, onYearChange, availableYears, currency, placement }) => {
    return (
        <div>
            <div className="p-6 border-b border-border-color flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-lg font-semibold text-text-primary">Clientes Modelo 347 (+3.000€)</h2>
                <select 
                    value={selectedYear} 
                    onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
                    className="rounded-md border border-border-color bg-surface py-1 px-2 text-sm font-medium text-text-primary outline-none transition focus:border-primary"
                >
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            {customers.length === 0 ? (
                <p className="p-6 text-text-secondary text-sm">No hay clientes que superen los 3.000€ en {selectedYear}.</p>
            ) : (
                <div className="flex flex-col">
                    {customers.map(customer => (
                        <Link to={`/customers/${customer.id}`} key={customer.id} className="flex justify-between items-center p-4 border-b border-border-color last:border-b-0 hover:bg-secondary transition-colors">
                            <div>
                                <p className="font-semibold text-text-primary text-sm">{customer.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-accent text-sm">{formatCurrency(customer.total, currency, placement)}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HighValueCustomersList;