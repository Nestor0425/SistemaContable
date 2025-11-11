import { Customer, Product, Invoice, Quote, User, Settings, AuditLogEntry, ExportLogEntry } from '../types';
import { mockCustomers } from '../data/customers';
import { mockProducts } from '../data/products';
import { mockInvoices } from '../data/invoices';
import { mockQuotes } from '../data/quotes';
import { mockInitialAudit } from '../data/audit';
import * as sifService from './sifService';

// --- DATABASE SIMULATION with LocalStorage ---

const DB_KEY = 'facturapro_react_db';

interface Database {
    customers: Customer[];
    products: Product[];
    invoices: Invoice[];
    quotes: Quote[];
    settings: Settings;
    auditLog: AuditLogEntry[];
    exports: ExportLogEntry[];
    users: User[];
}

const defaultTemplateHtml = `
<!-- v2.0 -->
<style>
  .invoice-template {
    --brand-color: {{settings.brandColor}};
    --heading-color: {{settings.templateStyles.headingColor}};
    --text-color: {{settings.templateStyles.textColor}};
    --font-family: {{settings.templateStyles.fontFamily}};
    --base-font-size: {{settings.templateStyles.baseFontSize}};
    --success-color: #10B981;
    font-family: var(--font-family);
    font-size: var(--base-font-size);
    color: var(--text-color);
  }
  .invoice-template h1, .invoice-template h2, .invoice-template h3, .invoice-template h4, .invoice-template th {
    color: var(--heading-color);
  }
  .invoice-template .brand-text { color: var(--brand-color); }
  .invoice-template .brand-bg { background-color: var(--brand-color); }
  .invoice-template .brand-bg-soft { background-color: {{settings.brandColor}}1A; }
  .invoice-template .brand-border { border-color: var(--brand-color); }
  .invoice-template address { font-style: normal; }
  .invoice-template .text-success { color: var(--success-color); }
  .sif-block {
    background-color: #f3f4f6; /* gray-100 */
    border-radius: 0.5rem; /* rounded-lg */
    padding: 1.5rem; /* p-6 */
    margin-top: -1px;
  }
</style>
<div class="invoice-template bg-gray-50 p-4 sm:p-8">
    <div class="max-w-4xl mx-auto bg-white rounded-t-lg shadow-lg p-8 sm:p-12">
        <!-- Header -->
        <header class="flex justify-between items-start flex-wrap gap-8 mb-12">
            <div>
                <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">{{#if is_invoice}}{{settings.templateLabels.billToLabel}}{{/if}}{{#if is_quote}}{{settings.templateLabels.quoteForLabel}}{{/if}}</h3>
                <p class="text-lg font-semibold" style="color: var(--heading-color);">{{customer.name}}</p>
                <address class="text-gray-600 leading-snug">
                    {{customer.address}}<br>
                    NIF: {{customer.nif}}<br>
                    {{#if customer.phone}}Tel: {{customer.phone}}{{/if}}
                </address>
                {{#if customer.contactPerson.name}}
                    <p class="text-sm text-gray-600 mt-2">{{settings.templateLabels.attentionLabel}} {{customer.contactPerson.name}}</p>
                {{/if}}
            </div>
            <div class="text-right">
                <h1 class="text-3xl font-extrabold uppercase brand-text">{{doc.title}}</h1>
                <div class="mt-2 space-y-1 text-gray-600">
                    <p><strong>{{doc.number_label}}:</strong> {{doc.number}}</p>
                    <p><strong>{{doc.date_label}}:</strong> {{doc.date_formatted}}</p>
                    <p><strong>{{doc.due_date_label}}:</strong> {{doc.due_date_formatted}}</p>
                </div>
            </div>
        </header>

        <!-- Line Items Table -->
        <section>
            <table class="w-full text-left">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-3 text-sm font-semibold uppercase tracking-wider">{{settings.templateLabels.descriptionLabel}}</th>
                        <th class="p-3 text-sm font-semibold uppercase tracking-wider text-right">{{settings.templateLabels.quantityLabel}}</th>
                        <th class="p-3 text-sm font-semibold uppercase tracking-wider text-right">{{settings.templateLabels.unitPriceLabel}}</th>
                        <th class="p-3 text-sm font-semibold uppercase tracking-wider text-right">{{settings.templateLabels.totalLabel}}</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each lines}}
                        <tr class="border-b {{#if this.discount_display}}border-dashed{{else}}border-gray-100{{/if}}">
                            <td class="p-3 align-top {{#if this.discount_display}}!pb-1{{/if}}">
                                <p class="font-medium text-gray-800">{{this.description}}</p>
                                <p class="text-xs text-gray-500">IVA: {{this.vatRate}}%</p>
                            </td>
                            <td class="p-3 text-right align-top {{#if this.discount_display}}!pb-1{{/if}}">{{this.quantity}}</td>
                            <td class="p-3 text-right align-top {{#if this.discount_display}}!pb-1{{/if}}">{{this.unitPrice_formatted}}</td>
                            <td class="p-3 text-right align-top font-semibold {{#if this.discount_display}}!pb-1{{/if}}">{{this.lineTotal_formatted}}</td>
                        </tr>
                        {{#if this.discount_display}}
                        <tr class="border-b border-gray-100">
                            <td class="pt-1 pb-1 px-3 text-xs text-gray-500" colspan="3">
                                Descuento: <span style="color: var(--success-color); font-weight: 700;">{{this.discount_display}}</span>
                            </td>
                            <td class="pt-1 pb-1 px-3 text-xs text-right font-bold text-success">
                                -{{this.lineDiscountAmount_formatted}}
                            </td>
                        </tr>
                        {{/if}}
                    {{/each}}
                </tbody>
            </table>
        </section>

        <!-- Totals Section -->
        <section class="mt-8 flex justify-end">
            <div class="w-full max-w-sm space-y-2">
                {{#if totals.grossTotal}}
                    <div class="flex justify-between text-gray-600"><p>Total artículos:</p><p>{{totals.grossTotal_formatted}}</p></div>
                {{/if}}
                {{#if totals.totalLineDiscount}}
                    <div class="flex justify-between text-gray-600"><p>Descuentos en artículos:</p><p class="font-bold text-success">-{{totals.totalLineDiscount_formatted}}</p></div>
                {{/if}}
                <div class="flex justify-between text-gray-600"><p>Subtotal:</p><p>{{totals.subtotal_formatted}}</p></div>
                {{#if totals.globalDiscountAmount}}
                    <div class="flex justify-between text-gray-600"><p>Descuento Global (<span style="color: var(--success-color); font-weight: 700;">{{discount_details}}</span>):</p><p class="font-bold text-success">-{{totals.globalDiscountAmount_formatted}}</p></div>
                {{/if}}
                <div class="flex justify-between font-semibold text-gray-800"><p>Base Imponible:</p><p>{{totals.taxableBase_formatted}}</p></div>
                
                <div class="border-b border-gray-200 !my-3"></div>
                
                {{#each totals.vatBreakdown}}
                    <div class="flex justify-between text-gray-600">
                        <p>IVA ({{this.rate}}%):</p>
                        <p>{{this.vatAmount_formatted}}</p>
                    </div>
                {{/each}}
                
                {{#if totals.globalTaxAmount}}
                    <div class="flex justify-between text-gray-600">
                        <p>{{tax_name}} ({{tax_rate}}%):</p>
                        <p>{{totals.globalTaxAmount_formatted}}</p>
                    </div>
                {{/if}}

                <div class="!mt-6 p-3 rounded-lg brand-bg-soft">
                    <div class="flex justify-between text-xl font-bold brand-text"><p>TOTAL:</p><p>{{totals.total_formatted}}</p></div>
                </div>
            </div>
        </section>
        
        <!-- Corporate Info and Payment Methods -->
        <section class="mt-12 pt-8 border-t border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                    <h4 class="font-bold uppercase tracking-wider text-gray-500 mb-2">INFORMACIÓN CORPORATIVA</h4>
                    <div class="text-gray-600 leading-snug">{{{settings.templateFooter.corporateInfo}}}</div>
                </div>
                <div>
                    {{#if settings.templateFooter.paymentMethodsTitle}}
                        <h4 class="font-bold uppercase tracking-wider text-gray-500 mb-2">{{settings.templateFooter.paymentMethodsTitle}}</h4>
                        <div class="text-gray-600 leading-snug">{{{settings.templateFooter.paymentMethods}}}</div>
                    {{/if}}
                </div>
            </div>
        </section>

        <!-- Terms -->
        <section>
            {{#if settings.templateFooter.terms}}
            <div class="mt-8">
                <h4 class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">{{settings.templateFooter.termsTitle}}</h4>
                <div class="text-gray-600 text-xs leading-relaxed">{{{settings.templateFooter.terms}}}</div>
            </div>
            {{/if}}
        </section>
        
        <!-- Final Footer Note -->
        <div class="mt-8 pt-4 border-t border-gray-200 text-left text-sm text-gray-500">
            {{#if settings.templateFooter.finalNote}}
            <div class="mb-1 leading-snug">{{{settings.templateFooter.finalNote}}}</div>
            {{/if}}
            {{#if settings.templateFooter.signatureLine}}
            <div class="text-xs leading-snug">{{{settings.templateFooter.signatureLine}}}</div>
            {{/if}}
        </div>
    </div>
    
    <!-- SIF Info & QR Code -->
    {{#if is_invoice}}
        <div class="sif-block max-w-4xl mx-auto rounded-b-lg shadow-lg">
             <footer class="flex flex-wrap gap-8 items-start justify-between">
                <div class="flex-1">
                    <h4 class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Información SIF</h4>
                    <div class="text-xs font-mono break-all text-gray-500">
                        <p><strong>Hash:</strong> {{doc.sif.hash}}</p>
                        <p><strong>Prev:</strong> {{doc.sif.previousHash}}</p>
                    </div>
                    <p class="text-gray-500 mt-4" style="font-family: var(--font-family); font-size: 0.65rem; line-height: 1.4;">
                        Este registro de facturación cumple con los requisitos del Real Decreto 1007/2023, garantizando la integridad, conservación, accesibilidad, legibilidad, trazabilidad e inalterabilidad de los datos (Sistema <strong>Veri*Factu</strong>).
                    </p>
                </div>
                <div class="flex-shrink-0" id="qrcode-placeholder">
                    <!-- QR Code will be injected here -->
                </div>
            </footer>
        </div>
    {{/if}}
</div>
`;


const getDefaultDb = (): Database => ({
    customers: [...mockCustomers],
    products: [...mockProducts],
    invoices: [...mockInvoices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    quotes: [...mockQuotes],
    users: [
        { id: 'user-1', username: 'admin', role: 'admin', password: 'adminpass' },
        { id: 'user-2', username: 'staff', role: 'staff', password: 'staffpass' },
    ],
    settings: {
        companyName: 'Heartize™ Agency',
        companyLegalName: 'Raúl Vega Domingo',
        companyNif: '71449535N',
        companyAddress: 'C/ Arquitecto Ramón Cañas del Río 7, 24007, León, España',
        companyPhone: '901001809',
        companyEmail: 'hello@heartize.com',
        defaultVatRate: 21,
        currency: 'EUR',
        invoicePrefix: 'FAC-',
        nextInvoiceNumber: 7,
        quotePrefix: 'PRE-',
        nextQuoteNumber: 4,
        currencyPlacement: 'after',
        mode: 'NO_VERIFACTU',
        verifactu: {
            wsdlUrl: 'https://www2.agenciatributaria.gob.es/static_files/common/internet/wsdl/VeriFactu.wsdl'
        },
        companyLogo: '',
        brandColor: '#ff0143',
        interfaceColor: '#000000',
        defaultDueDays: 30,
        defaultGlobalDiscount: 0,
        templateLabels: {
            invoiceTitle: 'FACTURA',
            quoteTitle: 'Pro-Forma',
            invoiceNumberLabel: 'Factura #',
            invoiceDateLabel: 'Fecha',
            invoiceDueDateLabel: 'Vencimiento',
            quoteNumberLabel: 'Presupuesto #',
            quoteDateLabel: 'Fecha',
            quoteExpiryDateLabel: 'Válido hasta',
            billToLabel: 'FACTURAR A:',
            quoteForLabel: 'PROPUESTA PARA:',
            descriptionLabel: 'Descripción',
            quantityLabel: 'Cant.',
            unitPriceLabel: 'P. Unidad',
            totalLabel: 'Total',
            attentionLabel: 'Att:',
        },
        templateStyles: {
            fontFamily: "'Inter', sans-serif",
            baseFontSize: '14px',
            headingColor: '#1f2937',
            textColor: '#374151',
        },
        templateHtml: defaultTemplateHtml,
        templateFooter: {
            corporateInfo: `<b>{{settings.companyName}}</b><br>{{#if settings.companyLegalName}}<em>{{settings.companyLegalName}} «ES<b>{{settings.companyNif}}</b>»</em><br>{{else}}<em>NIF: {{settings.companyNif}}</em><br>{{/if}}{{settings.companyAddress}}<br><a href="tel:{{settings.companyPhone}}" style="color: {{settings.brandColor}}; text-decoration:underline;">{{settings.companyPhone}}</a>`,
            paymentMethodsTitle: 'MÉTODOS DE PAGO',
            paymentMethods: '<b>Entidad Bancaria:</b> BBVA<br><b>CCC:</b> ES7601825903470201573494<br><b>Concepto:</b> Número Factura<br><b>PayPal:</b> <a href="https://paypal.me/hello@heartize.com" style="color: {{settings.brandColor}}; text-decoration:underline;">hello@heartize.com</a>',
            termsTitle: 'TÉRMINOS DE CONTRATACIÓN',
            terms: '» La validez de este documento es de 30 días. El documento ha de devolverse firmado en el plazo de validez y/o mediante la aceptación del mismo documento vía E-Mail, junto con el justificante del abono correspondiente en nuestras cuentas. De no recibir respuesta durante el plazo de validez, este documento carece de valor.<br>» El cliente al contratar nuestros servicios entiende, acepta y es consciente de la responsabilidad contractual de los Términos &amp; Condiciones expuestos en: <b>https://heartize.com/terminos-y-condiciones</b>',
            finalNote: 'Que tengas un buen día.',
            signatureLine: 'Hecho con mucho <span style="color: #ff0143; vertical-align: middle;">❤</span> en León, España.'
        },
    },
    auditLog: [...mockInitialAudit],
    exports: [],
});

let db: Database = loadDb();

function loadDb(): Database {
    try {
        const storedDb = localStorage.getItem(DB_KEY);
        if (storedDb) {
            let parsed = JSON.parse(storedDb);
            const defaultSettings = getDefaultDb().settings;
            // Migrations
            if (!parsed.settings.templateLabels) parsed.settings.templateLabels = defaultSettings.templateLabels;
            if (!parsed.settings.templateLabels.attentionLabel) parsed.settings.templateLabels.attentionLabel = defaultSettings.templateLabels.attentionLabel;
            if (parsed.settings.defaultDueDays === undefined) parsed.settings.defaultDueDays = defaultSettings.defaultDueDays;
            if (parsed.settings.defaultGlobalDiscount === undefined) parsed.settings.defaultGlobalDiscount = defaultSettings.defaultGlobalDiscount;
            if (parsed.settings.interfaceColor === undefined) parsed.settings.interfaceColor = defaultSettings.interfaceColor;
            if (parsed.settings.currency === undefined) parsed.settings.currency = defaultSettings.currency;
            if(!parsed.exports) parsed.exports = [];
            if(!parsed.users) parsed.users = getDefaultDb().users;
            if (parsed.settings.companyLegalName === undefined) {
                parsed.settings.companyLegalName = defaultSettings.companyLegalName;
            }
            
            // New settings migration
            if (parsed.settings.invoiceSeries) {
                parsed.settings.invoicePrefix = parsed.settings.invoiceSeries;
                delete parsed.settings.invoiceSeries;
            }
            if (parsed.settings.invoicePrefix === undefined) parsed.settings.invoicePrefix = defaultSettings.invoicePrefix;
            if (parsed.settings.nextInvoiceNumber === undefined) parsed.settings.nextInvoiceNumber = defaultSettings.nextInvoiceNumber;
            if (parsed.settings.quotePrefix === undefined) parsed.settings.quotePrefix = defaultSettings.quotePrefix;
            if (parsed.settings.nextQuoteNumber === undefined) parsed.settings.nextQuoteNumber = defaultSettings.nextQuoteNumber;
            if (parsed.settings.currencyPlacement === undefined) parsed.settings.currencyPlacement = defaultSettings.currencyPlacement;
            if (parsed.sequences) delete parsed.sequences;
            if (!parsed.settings.templateHtml || !parsed.settings.templateHtml.includes('<!-- v2.0 -->')) {
                parsed.settings.templateHtml = defaultSettings.templateHtml;
                 if (parsed.settings.templateLabels.quoteTitle !== 'Pro-Forma') {
                    parsed.settings.templateLabels.quoteTitle = defaultSettings.templateLabels.quoteTitle;
                }
            }
            if (!parsed.settings.templateStyles) parsed.settings.templateStyles = defaultSettings.templateStyles;
            if (!parsed.settings.templateFooter) {
                parsed.settings.templateFooter = defaultSettings.templateFooter;
            }
             // Migration for corporateInfo field and terms
            if (parsed.settings.templateFooter) {
                if ((parsed.settings.templateFooter as any).corporateInfoTitle && !parsed.settings.templateFooter.corporateInfo) {
                    parsed.settings.templateFooter.corporateInfo = defaultSettings.templateFooter.corporateInfo;
                    delete (parsed.settings.templateFooter as any).corporateInfoTitle;
                }
                 if (!parsed.settings.templateFooter.terms.includes("heartize.com")) {
                    parsed.settings.templateFooter.terms = defaultSettings.templateFooter.terms;
                }
                 if (!parsed.settings.templateFooter.paymentMethods.includes("PayPal")) {
                    parsed.settings.templateFooter.paymentMethods = defaultSettings.templateFooter.paymentMethods;
                }
            }
            
            return parsed;
        }
    } catch (error) {
        console.error("Failed to load database from localStorage:", error);
    }
    const defaultDb = getDefaultDb();
    saveDb(defaultDb);
    return defaultDb;
}

function saveDb(newDbState?: Database) {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(newDbState || db));
    } catch (error) {
        console.error("Failed to save database to localStorage:", error);
    }
}

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Audit Log API ---
const logAuditEvent = (action: string, entity: string, entityId: string, details?: string) => {
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const entry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        user: currentUser.username || 'system',
        action,
        entity,
        entityId,
        details,
        ip: '127.0.0.1', // Mock IP
    };
    db.auditLog.push(entry);
    saveDb();
};

export const getAuditLog = async (): Promise<AuditLogEntry[]> => {
    await simulateDelay(200);
    return [...db.auditLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};


// --- Auth & User API ---
export const login = async (username: string, password: string): Promise<User | null> => {
    await simulateDelay(500);
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) {
        const { password, ...userToReturn } = user;
        logAuditEvent('LOGIN_SUCCESS', 'USER', user.id);
        return userToReturn;
    }
    logAuditEvent('LOGIN_FAIL', 'USER', username, `Attempted login for user: ${username}`);
    return null;
};

export const getUsers = async (): Promise<User[]> => {
    await simulateDelay(200);
    return db.users.map(({ password, ...user }) => user);
};

export const addUser = async (userData: User): Promise<User> => {
    await simulateDelay(300);
    if (db.users.some(u => u.username === userData.username)) {
        throw new Error("Username already exists.");
    }
    const newUser: User = {
        ...userData,
        id: `USER-${crypto.randomUUID().slice(0, 8)}`,
    };
    db.users.push(newUser);
    logAuditEvent('CREATE_USER', 'USER', newUser.id, newUser.username);
    saveDb();
    const { password, ...userToReturn } = newUser;
    return userToReturn;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
    await simulateDelay(300);
    let userToUpdate = db.users.find(u => u.id === id);
    if (!userToUpdate) throw new Error('User not found');

    if (userData.username && db.users.some(u => u.username === userData.username && u.id !== id)) {
         throw new Error("Username already exists.");
    }

    // Don't update password if it's an empty string
    if (userData.password === '') {
        delete userData.password;
    }
    
    userToUpdate = { ...userToUpdate, ...userData };
    db.users = db.users.map(u => u.id === id ? userToUpdate! : u);
    logAuditEvent('UPDATE_USER', 'USER', id, userToUpdate.username);
    saveDb();
    const { password, ...userToReturn } = userToUpdate;
    return userToReturn;
};

export const deleteUser = async (id: string): Promise<void> => {
    await simulateDelay(500);
    const username = db.users.find(u => u.id === id)?.username || 'N/A';
    db.users = db.users.filter(u => u.id !== id);
    logAuditEvent('DELETE_USER', 'USER', id, username);
    saveDb();
};

// --- Customer API ---
export const getCustomers = async (): Promise<Customer[]> => {
    await simulateDelay(200);
    return [...db.customers];
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
    await simulateDelay(100);
    return db.customers.find(c => c.id === id);
}

export const addCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    await simulateDelay(300);
    const newCustomer: Customer = {
        id: `CUST-${crypto.randomUUID().slice(0, 8)}`,
        ...customerData,
    };
    db.customers.push(newCustomer);
    logAuditEvent('CREATE_CUSTOMER', 'CUSTOMER', newCustomer.id, newCustomer.name);
    saveDb();
    return newCustomer;
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
    await simulateDelay(300);
    let customerToUpdate = db.customers.find(c => c.id === id);
    if (!customerToUpdate) throw new Error('Customer not found');
    
    customerToUpdate = { ...customerToUpdate, ...customerData };
    db.customers = db.customers.map(c => c.id === id ? customerToUpdate! : c);
    logAuditEvent('UPDATE_CUSTOMER', 'CUSTOMER', id, customerToUpdate.name);
    saveDb();
    return customerToUpdate;
};

export const deleteCustomer = async (id: string): Promise<void> => {
    await simulateDelay(500);
    const customerName = db.customers.find(c => c.id === id)?.name || 'N/A';
    db.customers = db.customers.filter(c => c.id !== id);
    logAuditEvent('DELETE_CUSTOMER', 'CUSTOMER', id, customerName);
    saveDb();
};

// --- Product API ---
export const getProducts = async (): Promise<Product[]> => {
    await simulateDelay(200);
    return [...db.products];
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    await simulateDelay(300);
    const newProduct: Product = {
        id: `PROD-${crypto.randomUUID().slice(0, 8)}`,
        ...productData,
    };
    db.products.push(newProduct);
    logAuditEvent('CREATE_PRODUCT', 'PRODUCT', newProduct.id, newProduct.name);
    saveDb();
    return newProduct;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
    await simulateDelay(300);
    let productToUpdate = db.products.find(p => p.id === id);
    if (!productToUpdate) throw new Error('Product not found');
    
    productToUpdate = { ...productToUpdate, ...productData };
    db.products = db.products.map(p => (p.id === id ? productToUpdate : p));
    logAuditEvent('UPDATE_PRODUCT', 'PRODUCT', id, productToUpdate.name);
    saveDb();
    return productToUpdate;
};

export const deleteProduct = async (id: string): Promise<void> => {
    await simulateDelay(500);
    const productName = db.products.find(p => p.id === id)?.name || 'N/A';
    db.products = db.products.filter(p => p.id !== id);
    logAuditEvent('DELETE_PRODUCT', 'PRODUCT', id, productName);
    saveDb();
};

// --- Quote API ---
export const getQuotes = async (): Promise<Quote[]> => {
    await simulateDelay(200);
    return [...db.quotes].sort((a,b) => b.number.localeCompare(a.number));
};

export const getQuoteById = async (id: string): Promise<Quote | undefined> => {
    await simulateDelay(100);
    return db.quotes.find(q => q.id === id);
};

export const addQuote = async (quoteData: Omit<Quote, 'id' | 'number'>): Promise<Quote> => {
    await simulateDelay(400);

    const { quotePrefix, nextQuoteNumber } = db.settings;
    const newQuoteNumber = `${quotePrefix}${nextQuoteNumber}`;

    const newQuote: Quote = {
        id: `QUO-${crypto.randomUUID().slice(0, 8)}`,
        number: newQuoteNumber,
        ...quoteData,
        taxName: quoteData.taxName || '',
        taxRate: quoteData.taxRate || 0,
    };
    db.quotes.push(newQuote);
    db.settings.nextQuoteNumber++;
    logAuditEvent('CREATE_QUOTE', 'QUOTE', newQuote.id, newQuote.number);
    saveDb();
    return newQuote;
};

export const updateQuote = async (id: string, quoteData: Partial<Quote>): Promise<Quote> => {
    await simulateDelay(400);
    let quoteToUpdate = db.quotes.find(q => q.id === id);
    if (!quoteToUpdate) throw new Error('Quote not found');

    quoteToUpdate = { ...quoteToUpdate, ...quoteData };
    db.quotes = db.quotes.map(q => (q.id === id ? quoteToUpdate : q));
    logAuditEvent('UPDATE_QUOTE', 'QUOTE', id, quoteToUpdate.number);
    saveDb();
    return quoteToUpdate;
};

export const updateQuoteStatus = async (id: string, status: Quote['status']): Promise<Quote> => {
    const quote = await getQuoteById(id);
    if (!quote) throw new Error("Quote not found");
    quote.status = status;
    const action = `STATUS_CHANGE_TO_${status.toUpperCase()}`;
    logAuditEvent(action, 'QUOTE', id, `Status changed for ${quote.number}`);
    saveDb();
    return quote;
};

export const deleteQuote = async (id: string): Promise<void> => {
    await simulateDelay(500);
    const quoteNumber = db.quotes.find(q => q.id === id)?.number || 'N/A';
    db.quotes = db.quotes.filter(q => q.id !== id);
    logAuditEvent('DELETE_QUOTE', 'QUOTE', id, quoteNumber);
    saveDb();
};

// --- Invoice API ---
export const getInvoices = async (): Promise<Invoice[]> => {
    await simulateDelay(200);
    return [...db.invoices].sort((a,b) => {
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        return b.number - a.number;
    });
};

export const getInvoiceById = async (id: string): Promise<Invoice | undefined> => {
    await simulateDelay(100);
    return db.invoices.find(i => i.id === id);
};

export const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'sif' | 'number' | 'series'>): Promise<Invoice> => {
    await simulateDelay(500);
    
    const { invoicePrefix, nextInvoiceNumber } = db.settings;
    
    const invoiceWithNumber = { 
        ...invoiceData,
        series: invoicePrefix,
        number: nextInvoiceNumber,
        recurrence: invoiceData.recurrence || { frequency: 'none' },
        taxName: invoiceData.taxName || '',
        taxRate: invoiceData.taxRate || 0,
    };
    
    const sortedInvoices = [...db.invoices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.number - b.number);
    const lastInvoice = sortedInvoices.length > 0 ? sortedInvoices[sortedInvoices.length - 1] : null;
    const previousHash = lastInvoice ? lastInvoice.sif.hash : '0'.repeat(64);

    const invoiceToHash = { ...invoiceWithNumber };
    const hash = await sifService.calculateHash(invoiceToHash, previousHash);

    const newInvoice: Invoice = {
        ...invoiceWithNumber,
        id: `INV-${invoiceWithNumber.series}-${String(invoiceWithNumber.number).padStart(3, '0')}`,
        sif: {
            hash,
            previousHash,
            timestamp: new Date().toISOString(),
        }
    };
    db.invoices.push(newInvoice);
    db.settings.nextInvoiceNumber++;
    logAuditEvent('CREATE_INVOICE', 'INVOICE', newInvoice.id, `${newInvoice.series}-${newInvoice.number}`);
    saveDb();
    return newInvoice;
}

export const updateInvoice = async (id: string, invoiceData: Partial<Invoice>): Promise<Invoice> => {
    await simulateDelay(500);
    let invoiceToUpdate = db.invoices.find(i => i.id === id);
    if (!invoiceToUpdate) throw new Error('Invoice not found');
    if (invoiceToUpdate.status === 'void' || invoiceToUpdate.status === 'rectified') {
        throw new Error(`No se pueden editar facturas en estado '${invoiceToUpdate.status}'.`);
    }
    
    // Ensure series and number are not accidentally changed to something invalid
    const updatedInvoice = { 
        ...invoiceToUpdate,
        ...invoiceData,
        series: invoiceData.series || invoiceToUpdate.series,
        number: invoiceData.number || invoiceToUpdate.number,
    };
    db.invoices = db.invoices.map(i => i.id === id ? updatedInvoice : i);
    logAuditEvent('UPDATE_INVOICE', 'INVOICE', id, `${updatedInvoice.series}-${updatedInvoice.number}`);
    saveDb();
    return updatedInvoice;
}

export const updateInvoiceStatus = async (id: string, status: Invoice['status']): Promise<Invoice> => {
    await simulateDelay(300);
    let invoiceToUpdate = db.invoices.find(i => i.id === id);
    if (!invoiceToUpdate) throw new Error('Invoice not found');
    
    invoiceToUpdate.status = status;
    db.invoices = db.invoices.map(i => (i.id === id ? invoiceToUpdate! : i));
    const action = status === 'void' ? 'CANCEL_INVOICE' : `STATUS_CHANGE_TO_${status.toUpperCase()}`;
    logAuditEvent(action, 'INVOICE', id, `Status changed for ${invoiceToUpdate.series}-${invoiceToUpdate.number}`);
    saveDb();
    return invoiceToUpdate;
};

export const convertQuoteToInvoice = async (quoteId: string): Promise<Invoice | null> => {
    const quote = await getQuoteById(quoteId);
    if (!quote || quote.status !== 'accepted') {
        throw new Error("Quote not found or not accepted.");
    }
    
    const invoiceData: Omit<Invoice, 'id' | 'sif' | 'number' | 'series'> = {
        customerId: quote.customerId,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + db.settings.defaultDueDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lines: quote.lines,
        globalDiscount: quote.globalDiscount,
        taxName: quote.taxName,
        taxRate: quote.taxRate,
        notes: quote.notes,
        internalNotes: `Convertido desde el presupuesto ${quote.number}`,
        status: 'draft',
        type: 'completa',
    };
    
    const newInvoice = await addInvoice(invoiceData);
    logAuditEvent('QUOTE_TO_INVOICE', 'INVOICE', newInvoice.id, `Converted from Quote ${quote.number}`);
    saveDb();
    return newInvoice;
};

// --- Settings API ---
export const getSettings = async (): Promise<Settings> => {
    await simulateDelay(100);
    return db.settings;
};

export const updateSettings = async (newSettings: Settings): Promise<Settings> => {
    await simulateDelay(400);
    db.settings = newSettings;
    logAuditEvent('SETTINGS_CHANGE', 'SETTINGS', 'global', `Mode set to ${newSettings.mode}`);
    saveDb();
    return db.settings;
}

// --- Exports API ---
export const getExports = async (): Promise<ExportLogEntry[]> => {
    await simulateDelay(100);
    return [...db.exports].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const addExportLog = async (summary: string): Promise<ExportLogEntry> => {
    await simulateDelay(100);
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const newExport: ExportLogEntry = {
        id: `EXP-${crypto.randomUUID().slice(0,8)}`,
        timestamp: new Date().toISOString(),
        user: currentUser.username || 'system',
        summary,
    };
    db.exports.push(newExport);
    logAuditEvent('EXPORT_SIF', 'EXPORT', newExport.id, summary);
    saveDb();
    return newExport;
}