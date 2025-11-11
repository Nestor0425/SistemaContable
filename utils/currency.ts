

export const formatCurrency = (amount: number, currencyCode: string = 'EUR', placement?: 'before' | 'after'): string => {
    const options: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    };

    // Use a locale that fits the currency for better formatting, or a neutral one.
    let locale = 'es-ES'; // Default for EUR
    if (currencyCode === 'USD') locale = 'en-US';
    if (currencyCode === 'GBP') locale = 'en-GB';

    try {
        if (!placement) {
             return new Intl.NumberFormat(locale, options).format(amount);
        }

        const parts = new Intl.NumberFormat(locale, options).formatToParts(amount);
        let numberStr = '';
        let symbolStr = '';
        parts.forEach(part => {
            if (part.type === 'currency') {
                symbolStr = part.value;
            } else {
                numberStr += part.value;
            }
        });
        numberStr = numberStr.trim();
        
        return placement === 'before'
            ? `${symbolStr}${numberStr.startsWith(' ') ? '' : ' '}${numberStr}`
            : `${numberStr}${symbolStr.startsWith(' ') ? '' : ' '}${symbolStr}`;

    } catch (e) {
        // Fallback for invalid currency codes
        const fallbackOptions = { ...options, currency: 'EUR' };
        if (!placement) {
             return new Intl.NumberFormat('es-ES', fallbackOptions).format(amount);
        }
        
        const parts = new Intl.NumberFormat('es-ES', fallbackOptions).formatToParts(amount);
        let numberStr = '';
        let symbolStr = '';
        parts.forEach(part => {
            if (part.type === 'currency') {
                symbolStr = part.value;
            } else {
                numberStr += part.value;
            }
        });
        numberStr = numberStr.trim();
        
        return placement === 'before'
            ? `${symbolStr}${numberStr.startsWith(' ') ? '' : ' '}${numberStr}`
            : `${numberStr}${symbolStr.startsWith(' ') ? '' : ' '}${symbolStr}`;
    }
};