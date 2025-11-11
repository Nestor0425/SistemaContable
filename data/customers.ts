
import { Customer } from '../types';

export const mockCustomers: Customer[] = [
  {
    id: 'CUST-001',
    nif: 'B12345678',
    name: 'Cliente Corp',
    address: 'Avenida Principal 456, 08080 Barcelona',
    email: 'contacto@clientecorp.com',
    phone: '931234567',
    currency: 'EUR',
    notes: 'Cliente importante. Contacto principal: Ana Pérez.'
  },
  {
    id: 'CUST-002',
    nif: 'A87654321',
    name: 'Servicios Digitales S.A.',
    address: 'Plaza de la Innovación 1, 46024 Valencia',
    email: 'info@serviciosdigitales.es',
    phone: '963216549',
    currency: 'USD',
    notes: ''
  },
   {
    id: 'CUST-003',
    nif: 'G11223344',
    name: 'Startup Creativa',
    address: 'Calle del Futuro 8, 29006 Málaga',
    email: 'hola@startupcreativa.dev',
    phone: '952987654',
    notes: 'Buen potencial de crecimiento.'
  }
];