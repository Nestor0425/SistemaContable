import { Invoice, Quote } from '../types';

type Calculable = Invoice | Quote;

interface VatBreakdown {
    [rate: string]: {
        base: number;
        vatAmount: number;
    };
}

interface CalculationResult {
    subtotal: number;
    globalDiscountAmount: number;
    taxableBase: number;
    totalVat: number;
    vatBreakdown: VatBreakdown;
    globalTaxAmount: number;
    total: number;
    grossTotal: number;
    totalLineDiscount: number;
}


export const calculateInvoiceTotal = (doc: Calculable | null): CalculationResult => {
    const emptyResult = { subtotal: 0, globalDiscountAmount: 0, taxableBase: 0, totalVat: 0, vatBreakdown: {}, globalTaxAmount: 0, total: 0, grossTotal: 0, totalLineDiscount: 0 };
    if (!doc) {
        return emptyResult;
    }
    
    let grossTotal = 0;
    let totalLineDiscount = 0;

    doc.lines.forEach(line => {
        const lineTotal = line.quantity * line.unitPrice;
        grossTotal += lineTotal;
        const discountAmount = line.discount.type === 'percentage' 
            ? lineTotal * (line.discount.value / 100) 
            : line.discount.value;
        totalLineDiscount += discountAmount;
    });

    const subtotal = grossTotal - totalLineDiscount;

    const globalDiscountValue = doc.globalDiscount?.value || 0;
    const globalDiscountType = doc.globalDiscount?.type || 'percentage';

    const globalDiscountAmount = globalDiscountType === 'percentage' 
        ? subtotal * (globalDiscountValue / 100) 
        : globalDiscountValue;

    const taxableBase = subtotal - globalDiscountAmount;

    const vatBreakdown: VatBreakdown = {};
    let totalVat = 0;

    doc.lines.forEach(line => {
        const lineSubtotal = line.quantity * line.unitPrice;
        const lineDiscountAmount = line.discount.type === 'percentage' 
            ? lineSubtotal * (line.discount.value / 100) 
            : line.discount.value;
        const lineTaxableBase = lineSubtotal - lineDiscountAmount;
        
        const lineProportionalGlobalDiscount = subtotal > 0 ? (lineTaxableBase / subtotal) * globalDiscountAmount : 0;
        const finalLineTaxableBase = lineTaxableBase - lineProportionalGlobalDiscount;

        const rateStr = line.vatRate.toString();
        if (!vatBreakdown[rateStr]) {
            vatBreakdown[rateStr] = { base: 0, vatAmount: 0 };
        }
        vatBreakdown[rateStr].base += finalLineTaxableBase;
    });
    
    for (const rate in vatBreakdown) {
        const vatAmount = vatBreakdown[rate].base * (parseFloat(rate) / 100);
        vatBreakdown[rate].vatAmount = vatAmount;
        totalVat += vatAmount;
    }

    const globalTaxRate = doc.taxRate || 0;
    const globalTaxAmount = taxableBase * (globalTaxRate / 100);

    const total = taxableBase + totalVat + globalTaxAmount;

    return { subtotal, globalDiscountAmount, taxableBase, totalVat, vatBreakdown, globalTaxAmount, total, grossTotal, totalLineDiscount };
};