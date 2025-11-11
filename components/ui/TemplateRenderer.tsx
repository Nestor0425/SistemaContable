import React, { useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Invoice, Quote, Customer, Settings } from '../../types';
import { calculateInvoiceTotal } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import QRCode from './QRCode';

interface TemplateRendererProps {
    templateHtml: string;
    invoice?: Invoice;
    quote?: Quote;
    customer: Customer;
    settings: Settings;
}

// Simple function to get a nested property from an object using a string path
const getValue = (path: string, obj: any): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const escapeHtml = (str: string): string => {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, (match) => {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return match;
        }
    });
};


const TemplateRenderer: React.FC<TemplateRendererProps> = ({ templateHtml, invoice, quote, customer, settings }) => {
    
    const dataContext = useMemo(() => {
        const genericDoc = invoice || quote;
        if (!genericDoc) return null;

        const currency = customer.currency || settings.currency;
        const placement = settings.currencyPlacement;
        const totals = calculateInvoiceTotal(genericDoc);
        
        return {
            doc: {
                title: invoice ? settings.templateLabels.invoiceTitle : settings.templateLabels.quoteTitle,
                number_label: invoice ? settings.templateLabels.invoiceNumberLabel : settings.templateLabels.quoteNumberLabel,
                number: invoice ? `${invoice.series}${invoice.number}` : quote!.number,
                date_label: invoice ? settings.templateLabels.invoiceDateLabel : settings.templateLabels.quoteDateLabel,
                date_formatted: new Date(genericDoc.date).toLocaleDateString(),
                due_date_label: invoice ? settings.templateLabels.invoiceDueDateLabel : settings.templateLabels.quoteExpiryDateLabel,
                due_date_formatted: invoice ? new Date(invoice.dueDate).toLocaleDateString() : new Date(quote!.expiryDate).toLocaleDateString(),
                sif: invoice ? invoice.sif : null,
            },
            is_invoice: !!invoice,
            is_quote: !!quote,
            customer,
            settings,
            totals: {
                ...totals,
                subtotal_formatted: formatCurrency(totals.subtotal, currency, placement),
                globalDiscountAmount_formatted: formatCurrency(totals.globalDiscountAmount, currency, placement),
                taxableBase_formatted: formatCurrency(totals.taxableBase, currency, placement),
                totalVat_formatted: formatCurrency(totals.totalVat, currency, placement),
                globalTaxAmount_formatted: formatCurrency(totals.globalTaxAmount, currency, placement),
                total_formatted: formatCurrency(totals.total, currency, placement),
                grossTotal_formatted: formatCurrency(totals.grossTotal, currency, placement),
                totalLineDiscount_formatted: formatCurrency(totals.totalLineDiscount, currency, placement),
                vatBreakdown: Object.entries(totals.vatBreakdown).map(([rate, amounts]) => ({
                    rate,
                    base_formatted: formatCurrency(amounts.base, currency, placement),
                    vatAmount_formatted: formatCurrency(amounts.vatAmount, currency, placement),
                }))
            },
            lines: genericDoc.lines.map(line => {
                const lineSubtotal = line.quantity * line.unitPrice;
                let discount_display = '';
                let discountAmount = 0;
                
                if (line.discount && line.discount.value > 0) {
                    if (line.discount.type === 'percentage') {
                        discount_display = `${line.discount.value}%`;
                        discountAmount = lineSubtotal * (line.discount.value / 100);
                    } else {
                        discount_display = formatCurrency(line.discount.value, currency, placement);
                        discountAmount = line.discount.value;
                    }
                }
                
                return {
                    ...line,
                    unitPrice_formatted: formatCurrency(line.unitPrice, currency, placement),
                    lineTotal_formatted: formatCurrency(lineSubtotal, currency, placement),
                    discount_display: discount_display,
                    lineDiscountAmount_formatted: formatCurrency(discountAmount, currency, placement),
                };
            }),
            discount_details: `${genericDoc.globalDiscount.value}${genericDoc.globalDiscount.type === 'percentage' ? '%' : ` ${currency}`}`,
            tax_name: genericDoc.taxName,
            tax_rate: genericDoc.taxRate,
            notes: genericDoc.notes,
        };
    }, [invoice, quote, customer, settings]);

    const processedHtml = useMemo(() => {
        if (!templateHtml || !dataContext) return '';

        let template = templateHtml;

        const processBlock = (block: string, context: any) => {
            let processed = block;
            
            // Process if blocks
            processed = processed.replace(/{{#if (.*?)}}([\s\S]*?)(?:{{else}}([\s\S]*?))?{{\/if}}/g, (match, condition, ifContent, elseContent) => {
                const path = condition.trim();
                const source = path.startsWith('this.') ? context : dataContext;
                const finalPath = path.startsWith('this.') ? path.substring(5) : path;

                const value = getValue(finalPath, source);
                const isTruthy = Array.isArray(value) ? value.length > 0 : (typeof value === 'string' ? value.trim() !== '' : !!value);
                
                return isTruthy ? (ifContent || '') : (elseContent || '');
            });
            
            // Process raw HTML placeholders
            processed = processed.replace(/{{{([\w._]+)}}}/g, (match, path) => {
                const currentPath = path.trim();
                const source = currentPath.startsWith('this.') ? context : dataContext;
                const finalPath = currentPath.startsWith('this.') ? currentPath.substring(5) : currentPath;
                const value = getValue(finalPath, source);
                return (value !== null && value !== undefined) ? String(value) : '';
            });

            // Process escaped text placeholders
            processed = processed.replace(/{{([\w._]+)}}/g, (match, path) => {
                const currentPath = path.trim();
                const source = currentPath.startsWith('this.') ? context : dataContext;
                const finalPath = currentPath.startsWith('this.') ? currentPath.substring(5) : currentPath;
                const value = getValue(finalPath, source);
                const stringValue = (value !== null && value !== undefined) ? String(value) : '';
                return escapeHtml(stringValue);
            });

            return processed;
        };

        // Process each blocks first
        template = template.replace(/{{#each (.*?)}}([\s\S]*?){{\/each}}/g, (match, arrayPath, content) => {
            const array = getValue(arrayPath.trim(), dataContext);
            if (!Array.isArray(array)) return '';

            return array.map(item => processBlock(content, item)).join('');
        });
        
        // Process remaining top-level content
        template = processBlock(template, dataContext);

        return template;

    }, [templateHtml, dataContext]);


    const qrCodeText = useMemo(() => {
        if (!invoice) return '';
        const total = calculateInvoiceTotal(invoice).total;
        return `NIF:${settings.companyNif}\nFactura:${invoice.series}-${invoice.number}\nFecha:${invoice.date}\nTotal:${total.toFixed(2)}${settings.currency === 'EUR' ? '€' : '$'}\nHash:${invoice.sif.hash.slice(0, 8)}...`;
    }, [invoice, settings]);

    useEffect(() => {
        const placeholder = document.getElementById('qrcode-placeholder');
        if (placeholder && qrCodeText) {
            placeholder.innerHTML = '';
            const root = createRoot(placeholder);
            root.render(<QRCode text={qrCodeText} size={80} />);
        }
    }, [processedHtml, qrCodeText]);

    return (
        <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
    );
};

export default TemplateRenderer;
