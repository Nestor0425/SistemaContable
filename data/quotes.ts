import { Quote } from '../types';

export const mockQuotes: Quote[] = [
    {
        id: 'QUO-2024-001',
        number: '2024-001',
        customerId: 'CUST-003',
        date: '2024-07-18',
        expiryDate: '2024-08-18',
        lines: [
            { productId: 'PROD-01', description: 'Desarrollo Web (Módulo de ejemplo)', quantity: 25, unitPrice: 50, vatRate: 21, discount: { type: 'percentage', value: 0 } },
        ],
        status: 'sent',
        notes: 'Propuesta para nuevo website.',
        globalDiscount: { type: 'percentage', value: 0 },
        taxName: '',
        taxRate: 0,
    },
     {
        id: 'QUO-2024-002',
        number: '2024-002',
        customerId: 'CUST-001',
        date: '2024-07-21',
        expiryDate: '2024-08-21',
        lines: [
             { productId: 'PROD-01', description: 'Desarrollo Web - Módulo A', quantity: 10, unitPrice: 50, vatRate: 21, discount: { type: 'percentage', value: 5 } },
            { productId: 'PROD-02', description: 'Consultoría SEO', quantity: 8, unitPrice: 75, vatRate: 21, discount: { type: 'amount', value: 50 } }
        ],
        status: 'accepted',
        notes: 'Mantenimiento anual.',
        globalDiscount: { type: 'percentage', value: 5 },
        taxName: 'IRPF',
        taxRate: -15,
    },
    {
        id: 'QUO-2025-001',
        number: '2025-001',
        customerId: 'CUST-003',
        date: '2025-01-20',
        expiryDate: '2025-02-20',
        lines: [
             { productId: 'PROD-03', description: 'Diseño UX/UI para campaña', quantity: 1, unitPrice: 1250, vatRate: 21, discount: { type: 'percentage', value: 0 } }
        ],
        status: 'draft',
        notes: 'Propuesta para campaña de marketing Q1 2025.',
        globalDiscount: { type: 'percentage', value: 0 },
        taxName: '',
        taxRate: 0,
    }
];