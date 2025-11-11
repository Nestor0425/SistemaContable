

import React, { useState } from 'react';
import { TestResult, Invoice, Quote } from '../types';
import * as api from '../services/apiService';
import * as sif from '../services/sifService';

const TestsPage: React.FC = () => {
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const runTests = async () => {
        setIsRunning(true);
        setTestResults([]);
        const results: TestResult[] = [];

        // --- Test 1: SIF Hash Chain Integrity ---
        try {
            const invoices = (await api.getInvoices()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            let chainIsValid = true;
            for (let i = 0; i < invoices.length; i++) {
                const current = invoices[i];
                const previousHash = i === 0 ? '0'.repeat(64) : invoices[i - 1].sif.hash;
                if (current.sif.previousHash !== previousHash) {
                    chainIsValid = false;
                    break;
                }
            }
            results.push({
                name: 'SIF Hash Chain Integrity',
                status: chainIsValid ? 'pass' : 'fail',
                message: chainIsValid ? 'All invoices are correctly chained.' : 'Detected a break in the hash chain.'
            });
        } catch (e) {
            results.push({ name: 'SIF Hash Chain Integrity', status: 'fail', message: `Error: ${e}` });
        }
        setTestResults([...results]);


        // --- Test 2: Quote to Invoice Conversion ---
        try {
            const tempQuote: Omit<Quote, 'id' | 'number'> = {
                customerId: 'CUST-001',
                date: '2025-01-01',
                expiryDate: '2025-02-01',
                lines: [{ productId: 'PROD-01', description: 'Test', quantity: 1, unitPrice: 100, vatRate: 21, discount: { type: 'percentage', value: 0 } }],
                status: 'accepted',
                notes: 'Test conversion',
                // FIX: Added missing globalDiscount property as required by the Quote type.
                globalDiscount: { type: 'percentage', value: 0 },
            };
            const addedQuote = await api.addQuote(tempQuote);
            const newInvoice = await api.convertQuoteToInvoice(addedQuote.id);
            if (newInvoice && newInvoice.customerId === tempQuote.customerId && newInvoice.lines[0].description === 'Test') {
                 results.push({ name: 'Quote to Invoice Conversion', status: 'pass', message: 'Successfully converted a test quote to an invoice.' });
            } else {
                 results.push({ name: 'Quote to Invoice Conversion', status: 'fail', message: 'Conversion failed or invoice data does not match.' });
            }
            // Cleanup
            await api.deleteQuote(addedQuote.id);
            // In a real scenario, you'd also delete the created invoice. For this simulation, we leave it.

        } catch (e) {
             results.push({ name: 'Quote to Invoice Conversion', status: 'fail', message: `Error: ${e}` });
        }
        setTestResults([...results]);
        
        // --- Test 3: Data Schema Validation ---
        try {
            const customers = await api.getCustomers();
            const products = await api.getProducts();
            if(customers.every(c => c.id && c.name && c.nif) && products.every(p => p.id && p.name && p.price >= 0)) {
                 results.push({ name: 'Data Schema Validation', status: 'pass', message: 'Basic schema for customers and products seems correct.' });
            } else {
                results.push({ name: 'Data Schema Validation', status: 'fail', message: 'Some records are missing required fields.' });
            }
        } catch(e) {
            results.push({ name: 'Data Schema Validation', status: 'fail', message: `Error: ${e}` });
        }
        setTestResults([...results]);


        setIsRunning(false);
    };

    return (
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-6">Pruebas del Sistema</h1>
            <p className="text-body dark:text-bodydark mb-4">
                Ejecute esta suite de pruebas para verificar la integridad y el funcionamiento correcto de las lógicas de negocio clave de la aplicación.
            </p>
            <button
                onClick={runTests}
                disabled={isRunning}
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-3 px-8 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 disabled:bg-opacity-50"
            >
                {isRunning ? 'Ejecutando Pruebas...' : 'Iniciar Pruebas'}
            </button>
            
            <div className="mt-8 space-y-4">
                {testResults.map((result, index) => (
                    <div key={index} className={`p-4 rounded-md border-l-4 ${result.status === 'pass' ? 'bg-success/10 border-success' : 'bg-danger/10 border-danger'}`}>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                           {result.status === 'pass' ? 
                                <span className="text-success">✔ PASS</span> : 
                                <span className="text-danger">✖ FAIL</span>
                           }
                           <span className="text-black dark:text-white">{result.name}</span>
                        </h3>
                        <p className="mt-2 text-body dark:text-bodydark">{result.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestsPage;