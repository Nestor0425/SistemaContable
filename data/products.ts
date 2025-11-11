import { Product } from '../types';

export const mockProducts: Product[] = [
    {
        id: 'PROD-01',
        sku: 'WEB-DEV-MOD-A',
        name: 'Desarrollo Web - Módulo A',
        description: 'Desarrollo frontend y backend para el módulo A de la plataforma.',
        price: 50,
        vatRate: 21,
    },
    {
        id: 'PROD-02',
        sku: 'CONSULT-SEO',
        name: 'Consultoría SEO',
        description: 'Análisis y estrategia SEO (tarifa por hora).',
        price: 75,
        vatRate: 21,
    },
    {
        id: 'PROD-03',
        sku: 'DESIGN-UXUI',
        name: 'Diseño UX/UI - Prototipo',
        description: 'Diseño de interfaz y experiencia de usuario para la nueva app móvil.',
        price: 1500,
        vatRate: 21,
    }
];
