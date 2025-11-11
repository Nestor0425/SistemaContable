

import { Invoice } from '../types';

export const mockInvoices: Invoice[] = [
    // Pre-2024 invoices for historical data
    {
        id: 'INV-2019-001', series: '2019', number: 1, customerId: 'CUST-003',
        date: '2019-09-30', dueDate: '2019-10-30',
        lines: [{ productId: 'PROD-02', description: 'Consultoría SEO', quantity: 20, unitPrice: 60, vatRate: 21, discount: { type: 'percentage', value: 0 } }],
        globalDiscount: { type: 'percentage', value: 0 }, notes: '', internalNotes: '', status: 'paid', type: 'completa',
        sif: { hash: 'chain_start_2019_hash_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', previousHash: '00000000000000000000000000000000000000000000000000000000', timestamp: '2019-09-30T10:00:00Z' },
        recurrence: { frequency: 'none' }, taxName: '', taxRate: 0,
    },
    {
        id: 'INV-2020-001', series: '2020', number: 1, customerId: 'CUST-002',
        date: '2020-02-15', dueDate: '2020-03-16',
        lines: [{ productId: 'PROD-03', description: 'Diseño UX/UI', quantity: 1, unitPrice: 1200, vatRate: 21, discount: { type: 'percentage', value: 0 } }],
        globalDiscount: { type: 'percentage', value: 0 }, notes: '', internalNotes: '', status: 'paid', type: 'completa',
        sif: { hash: 'chain_2020_hash_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', previousHash: 'chain_start_2019_hash_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', timestamp: '2020-02-15T10:00:00Z' },
        recurrence: { frequency: 'none' }, taxName: '', taxRate: 0,
    },
    {
        id: 'INV-2021-001', series: '2021', number: 1, customerId: 'CUST-001',
        date: '2021-11-01', dueDate: '2021-12-01',
        lines: [{ productId: 'PROD-01', description: 'Desarrollo Web', quantity: 50, unitPrice: 45, vatRate: 21, discount: { type: 'percentage', value: 0 } }],
        globalDiscount: { type: 'percentage', value: 0 }, notes: '', internalNotes: '', status: 'paid', type: 'completa',
        sif: { hash: 'chain_2021_hash_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', previousHash: 'chain_2020_hash_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', timestamp: '2021-11-01T10:00:00Z' },
        recurrence: { frequency: 'none' }, taxName: '', taxRate: 0,
    },
    {
        id: 'INV-2022-001', series: '2022', number: 1, customerId: 'CUST-003',
        date: '2022-08-20', dueDate: '2022-09-19',
        lines: [{ productId: 'PROD-02', description: 'Consultoría SEO', quantity: 15, unitPrice: 70, vatRate: 21, discount: { type: 'percentage', value: 0 } }],
        globalDiscount: { type: 'percentage', value: 0 }, notes: '', internalNotes: '', status: 'paid', type: 'completa',
        sif: { hash: 'chain_2022_hash_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', previousHash: 'chain_2021_hash_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', timestamp: '2022-08-20T10:00:00Z' },
        recurrence: { frequency: 'none' }, taxName: '', taxRate: 0,
    },
    {
        id: 'INV-2023-001', series: '2023', number: 1, customerId: 'CUST-002',
        date: '2023-05-10', dueDate: '2023-06-09',
        lines: [{ productId: 'PROD-03', description: 'Diseño UX/UI', quantity: 1, unitPrice: 1800, vatRate: 21, discount: { type: 'percentage', value: 0 } }],
        globalDiscount: { type: 'percentage', value: 0 }, notes: '', internalNotes: '', status: 'paid', type: 'completa',
        sif: { hash: 'chain_2023_hash_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', previousHash: 'chain_2022_hash_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', timestamp: '2023-05-10T10:00:00Z' },
        recurrence: { frequency: 'none' }, taxName: '', taxRate: 0,
    },
    // Original 2024 invoices, but re-chained
    {
        id: 'INV-2024-001', series: '2024', number: 1, customerId: 'CUST-001',
        date: '2024-07-15', dueDate: '2024-08-14',
        lines: [
            { productId: 'PROD-03', description: 'Diseño UX/UI - Prototipo App', quantity: 1, unitPrice: 1500, vatRate: 21, discount: { type: 'percentage', value: 10 } }
        ],
        globalDiscount: { type: 'percentage', value: 0 },
        notes: 'Pago a 30 días.', internalNotes: '', status: 'paid', type: 'completa',
        sif: { hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8', previousHash: 'chain_2023_hash_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', timestamp: '2024-07-15T10:00:00Z' },
        recurrence: { frequency: 'none' }, taxName: '', taxRate: 0,
    },
    {
        id: 'INV-2024-002', series: '2024', number: 2, customerId: 'CUST-002',
        date: '2024-07-20', dueDate: '2024-08-19',
        lines: [
            { productId: 'PROD-01', description: 'Desarrollo Web - Módulo A', quantity: 20, unitPrice: 50, vatRate: 21, discount: { type: 'percentage', value: 0 } },
            { productId: 'PROD-02', description: 'Consultoría SEO', quantity: 5, unitPrice: 75, vatRate: 21, discount: { type: 'amount', value: 25 } }
        ],
        globalDiscount: { type: 'percentage', value: 5 },
        notes: 'Gracias por su confianza.', internalNotes: 'Cliente contactó para ampliar el proyecto.',
        status: 'issued', type: 'completa',
        sif: { hash: 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2', previousHash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8', timestamp: '2024-07-20T11:30:00Z' },
        recurrence: { frequency: 'none' }, taxName: 'IRPF', taxRate: -15,
    },
    {
        id: 'INV-2024-003', series: '2024', number: 3, customerId: 'CUST-001',
        date: '2024-07-22', dueDate: '2024-08-21',
        lines: [
             { productId: 'PROD-02', description: 'Consultoría SEO', quantity: 10, unitPrice: 75, vatRate: 21, discount: { type: 'percentage', value: 0 } }
        ],
        globalDiscount: { type: 'percentage', value: 0 },
        notes: '', internalNotes: 'Pendiente de aprobación del cliente.', status: 'draft', type: 'completa',
        sif: { hash: 'i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6', previousHash: 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2', timestamp: '2024-07-22T09:00:00Z' },
        recurrence: { frequency: 'none' }, taxName: '', taxRate: 0,
    },
    // New invoice for CUST-001 to push over 3000€
    {
        id: 'INV-2024-004', series: '2024', number: 4, customerId: 'CUST-001',
        date: '2024-07-25', dueDate: '2024-08-24',
        lines: [
            { productId: 'PROD-01', description: 'Mantenimiento plataforma', quantity: 1, unitPrice: 2000, vatRate: 21, discount: { type: 'percentage', value: 0 } }
        ],
        globalDiscount: { type: 'percentage', value: 0 },
        notes: 'Mantenimiento anual.', internalNotes: '', status: 'paid', type: 'completa',
        sif: { hash: 'klmn89opqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz12345', previousHash: 'i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6', timestamp: '2024-07-25T10:00:00Z' },
        recurrence: { frequency: 'yearly', nextDate: '2025-07-25' }, taxName: '', taxRate: 0,
    },
    {
        id: 'INV-2024-005', series: '2024', number: 5, customerId: 'CUST-003',
        date: '2024-08-01', dueDate: '2024-08-31',
        lines: [
            { productId: 'PROD-01', description: 'Desarrollo Web - Módulo C', quantity: 15, unitPrice: 50, vatRate: 21, discount: { type: 'percentage', value: 0 } }
        ],
        globalDiscount: { type: 'percentage', value: 0 },
        notes: 'Factura de prueba staff.', internalNotes: 'Creada por staff', status: 'issued', type: 'completa',
        sif: { hash: 'another_new_hash_for_2024_005_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', previousHash: 'klmn89opqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz12345', timestamp: '2024-08-01T14:00:00Z' },
        recurrence: { frequency: 'none' }, taxName: '', taxRate: 0,
    },
    {
        id: 'INV-2025-001', series: '2025', number: 1, customerId: 'CUST-002',
        date: '2025-02-10', dueDate: '2025-03-12',
        lines: [
            { productId: 'PROD-03', description: 'Diseño UX/UI Prototipo 2025', quantity: 1, unitPrice: 3500, vatRate: 21, discount: { type: 'percentage', value: 0 } }
        ],
        globalDiscount: { type: 'percentage', value: 0 },
        notes: 'Proyecto especial 2025.', internalNotes: 'Creada por usuario staff.',
        status: 'issued', type: 'completa',
        sif: { hash: 'new2025hash_abc123def456ghi789jkl012mno345pqr678stu901vwx234', previousHash: 'another_new_hash_for_2024_005_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', timestamp: '2025-02-10T10:00:00Z' },
        recurrence: { frequency: 'none' }, taxName: '', taxRate: 0,
    }
];