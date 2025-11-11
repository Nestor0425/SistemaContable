


export interface User {
    id: string;
    username: string;
    role: 'admin' | 'staff';
    password?: string;
}

/**
 * @schema
 * Representa un cliente en el sistema.
 */
export interface Customer {
    id: string;
    nif: string;
    name: string;
    address: string;
    email: string;
    phone: string;
    currency?: 'EUR' | 'USD' | 'GBP';
    notes?: string;
    contactPerson?: {
        name: string;
        email: string;
    };
    defaultVatRate?: number;
}

/**
 * @schema
 * Representa un producto o servicio facturable.
 */
export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string;
    price: number;
    vatRate: number; // e.g., 21 for 21%
    imageUrl?: string;
    iconName?: string;
}

export interface InvoiceLine {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    discount: {
        type: 'percentage' | 'amount';
        value: number;
    };
    productDetails?: { // To show icon/image without fetching product again
        imageUrl?: string;
        iconName?: string;
    };
}

/**
 * @schema
 * Representa una factura, el documento principal del sistema.
 */
export interface Invoice {
    id: string;
    series: string;
    number: number;
    customerId: string;
    date: string; // ISO 8601 format
    dueDate: string; // ISO 8601 format
    lines: InvoiceLine[];
    globalDiscount: {
        type: 'percentage' | 'amount';
        value: number;
    };
    taxName?: string;
    taxRate?: number;
    notes: string;
    internalNotes: string;
    status: 'draft' | 'issued' | 'paid' | 'void' | 'rectified';
    type: 'completa' | 'simplificada' | 'rectificativa';
    rectifies?: string; // ID of the invoice it rectifies
    sif: {
        hash: string;
        previousHash: string;
        timestamp: string;
    };
    verifactu?: {
        sent: boolean;
        timestamp?: string;
        responseXml?: string;
    };
    recurrence?: {
        frequency: 'none' | 'monthly' | 'yearly';
        nextDate?: string;
    };
}

/**
 * @schema
 * Representa un presupuesto que puede convertirse en factura.
 */
export interface Quote {
    id: string;
    number: string;
    customerId: string;
    date: string;
    expiryDate: string;
    lines: InvoiceLine[];
    globalDiscount: {
        type: 'percentage' | 'amount';
        value: number;
    };
    taxName?: string;
    taxRate?: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
    notes: string;
}

export interface TemplateLabels {
    invoiceTitle: string;
    quoteTitle: string;
    invoiceNumberLabel: string;
    invoiceDateLabel: string;
    invoiceDueDateLabel: string;
    quoteNumberLabel: string;
    quoteDateLabel: string;
    quoteExpiryDateLabel: string;
    billToLabel: string;
    quoteForLabel: string;
    descriptionLabel: string;
    quantityLabel: string;
    unitPriceLabel: string;
    totalLabel: string;
    attentionLabel: string;
}

export interface TemplateStyles {
    fontFamily: string;
    baseFontSize: string;
    headingColor: string;
    textColor: string;
}

export interface TemplateFooter {
    corporateInfo: string;
    paymentMethodsTitle: string;
    paymentMethods: string;
    termsTitle: string;
    terms: string;
    finalNote: string;
    signatureLine: string;
}

/**
 * @schema
 * Representa la configuración global de la aplicación.
 */
export interface Settings {
    companyName: string;
    companyLegalName?: string;
    companyNif: string;
    companyAddress: string;
    companyPhone?: string;
    companyEmail?: string;
    defaultVatRate: number;
    currency: 'EUR' | 'USD' | 'GBP';
    invoicePrefix: string;
    nextInvoiceNumber: number;
    quotePrefix: string;
    nextQuoteNumber: number;
    currencyPlacement: 'before' | 'after';
    mode: 'NO_VERIFACTU' | 'VERIFACTU';
    verifactu: {
        wsdlUrl: string;
        certificatePath?: string;
    };
    companyLogo?: string; // Base64 data URL
    brandColor?: string; // Hex color code
    interfaceColor?: string; // Hex color code
    defaultDueDays: number;
    defaultGlobalDiscount: number;
    templateLabels: TemplateLabels;
    templateStyles: TemplateStyles;
    templateHtml: string;
    templateFooter: TemplateFooter;
}

/**
 * @schema
 * Representa una entrada en el registro de auditoría SIF.
 */
export interface AuditLogEntry {
    timestamp: string;
    user: string;
    action: string;
    entity: string;
    entityId: string;
    details?: string;
    hash?: string;
    previousHash?: string;
    ip: string;
}

export interface ExportLogEntry {
    id: string;
    timestamp: string;
    user: string;
    summary: string;
}

export interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
}