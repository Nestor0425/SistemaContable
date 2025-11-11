
import { GoogleGenAI, Type } from "@google/genai";
import { Invoice, InvoiceLine } from '../types';

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const lineItemSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      description: {
        type: Type.STRING,
        description: 'Descripción detallada del producto o servicio.',
      },
      quantity: {
        type: Type.NUMBER,
        description: 'Cantidad del producto o servicio.',
      },
      unitPrice: {
        type: Type.NUMBER,
        description: 'Precio por unidad del producto o servicio.',
      },
      vatRate: {
        type: Type.NUMBER,
        description: 'Porcentaje de IVA aplicable (ej. 21, 10, 4).',
      },
    },
    required: ['description', 'quantity', 'unitPrice', 'vatRate'],
  },
};

export const generateInvoiceLinesFromPrompt = async (prompt: string): Promise<Partial<InvoiceLine>[]> => {
    if (!API_KEY) return [];
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analiza el siguiente texto y extráelo como una lista de líneas de factura en formato JSON. Asume precios razonables si no se especifican. El IVA por defecto es 21%. Texto: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: lineItemSchema,
            },
        });
        const jsonString = response.text;
        const parsed = JSON.parse(jsonString);

        return parsed.map((item: any) => ({
            ...item,
            productId: 'ai-generated',
            discount: { type: 'percentage', value: 0 }
        }));

    } catch (error) {
        console.error("Error generating invoice lines with Gemini:", error);
        return [];
    }
};

export const generateVeriFactuXML = async (invoice: Invoice): Promise<string> => {
    if (!API_KEY) return '<!-- API Key not configured -->';
    const prompt = `
        Genera un XML de alta de factura para el sistema VeriFactu de la AEAT española basado en los siguientes datos de la factura.
        Usa placeholders como '{{CERTIFICADO}}' para datos que no están presentes.
        - Emisor NIF: ${invoice.sif.previousHash.slice(0, 9)} <!-- Simulado -->
        - Factura Serie/Número: ${invoice.series}/${invoice.number}
        - Fecha Expedición: ${invoice.date}
        - Tipo Factura: F1 (Ordinaria)
        - Cliente NIF: ${invoice.customerId.slice(0,9)} <!-- Simulado -->
        - Importe Total: ${invoice.lines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0)}
        - Huella (Hash): ${invoice.sif.hash}

        El XML debe ser completo y válido para un endpoint SOAP.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        // Basic cleanup
        return response.text.replace(/```xml/g, '').replace(/```/g, '').trim();
    } catch (error) {
        console.error("Error generating VeriFactu XML with Gemini:", error);
        return `<!-- Error al generar XML: ${error} -->`;
    }
};
   