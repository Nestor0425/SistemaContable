
/**
 * Servicio para el cumplimiento del Sistema de Información de Facturas (SIF).
 * Implementa la lógica de canonicalización y encadenamiento de hashes.
 */

/**
 * Canonicaliza un objeto JavaScript para asegurar una representación JSON consistente.
 * Ordena las claves alfabéticamente de forma recursiva.
 * @param obj El objeto a canonicalizar.
 * @returns Una cadena JSON compacta y con claves ordenadas.
 */
function canonicalize(obj: any): string {
    if (obj === null || typeof obj !== 'object') {
        return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
        return '[' + obj.map(item => canonicalize(item)).join(',') + ']';
    }

    const sortedKeys = Object.keys(obj).sort();
    const parts = sortedKeys.map(key => {
        return `"${key}":${canonicalize(obj[key])}`;
    });

    return '{' + parts.join(',') + '}';
}

/**
 * Convierte una cadena de texto a un ArrayBuffer codificado en UTF-8.
 * @param str La cadena a codificar.
 * @returns El ArrayBuffer resultante.
 */
function str2ab(str: string): ArrayBuffer {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

/**
 * Convierte un ArrayBuffer a una cadena hexadecimal.
 * @param buffer El ArrayBuffer a convertir.
 * @returns La cadena hexadecimal.
 */
function ab2hex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}


/**
 * Calcula el hash SIF para un registro de factura.
 * El hash se calcula como SHA256(canonicalJson(factura) + hashAnterior).
 * @param invoiceData El objeto de la factura (sin el bloque SIF).
 * @param previousHash El hash de la factura anterior en la cadena.
 * @returns El nuevo hash SHA-256 en formato hexadecimal.
 */
export async function calculateHash(invoiceData: object, previousHash: string): Promise<string> {
    try {
        // 1. Canonicalizar el objeto de la factura.
        const canonicalJson = canonicalize(invoiceData);

        // 2. Concatenar con el hash anterior.
        const stringToHash = canonicalJson + previousHash;
        
        // 3. Convertir la cadena a un ArrayBuffer.
        const dataBuffer = str2ab(stringToHash);

        // 4. Calcular el hash SHA-256 usando la API de criptografía del navegador.
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

        // 5. Convertir el hash a formato hexadecimal.
        const hashHex = ab2hex(hashBuffer);

        return hashHex;
    } catch (error) {
        console.error("Error calculating SIF hash:", error);
        throw new Error("Could not calculate SIF hash.");
    }
}
