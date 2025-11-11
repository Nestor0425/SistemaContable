
import { AuditLogEntry } from '../types';

export const mockInitialAudit: AuditLogEntry[] = [
    {
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        user: 'system',
        action: 'SYSTEM_START',
        entity: 'APPLICATION',
        entityId: 'v1.0.0',
        details: 'Application database initialized.',
        ip: '127.0.0.1'
    },
    {
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        user: 'staff',
        action: 'CREATE_QUOTE',
        entity: 'QUOTE',
        entityId: 'QUO-2024-001',
        details: 'Presupuesto para nuevo website',
        ip: '192.168.1.10'
    },
    {
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        user: 'staff',
        action: 'CREATE_INVOICE',
        entity: 'INVOICE',
        entityId: 'INV-2025-001',
        details: 'Factura para proyecto de consultoría 2025',
        ip: '192.168.1.15'
    },
     {
        timestamp: new Date().toISOString(),
        user: 'staff',
        action: 'CREATE_INVOICE',
        entity: 'INVOICE',
        entityId: 'INV-2024-005',
        details: 'Factura de prueba para "NEW" tag.',
        ip: '192.168.1.15'
    }
];
