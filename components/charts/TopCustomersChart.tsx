import React from 'react';
import { formatCurrency } from '../../utils/currency';

interface TopCustomersChartProps {
  data: { name: string; total: number }[];
  currency?: string;
  placement?: 'before' | 'after';
}

const TopCustomersChart: React.FC<TopCustomersChartProps> = ({ data, currency, placement }) => {
    if (!data || data.length === 0) {
        return <p className="text-text-secondary">No hay datos de clientes para mostrar.</p>;
    }

    const maxTotal = Math.max(...data.map(d => d.total), 0);

    return (
        <div>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Top 5 Clientes por Ingresos</h2>
            <div className="space-y-3">
                {data.map((customer) => (
                    <div key={customer.name}>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-text-primary">{customer.name}</span>
                            <span className="text-sm font-medium text-text-secondary">{formatCurrency(customer.total, currency, placement)}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                            <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{ width: `${(customer.total / maxTotal) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopCustomersChart;