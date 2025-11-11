
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Invoice, Customer, Product } from '../types';
import InvoiceForm from '../components/forms/InvoiceForm';
import * as api from '../services/apiService';

const InvoiceEditorPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [customersData, productsData] = await Promise.all([
                    api.getCustomers(),
                    api.getProducts(),
                ]);
                setCustomers(customersData);
                setProducts(productsData);

                if (isEditing) {
                    const invoiceData = await api.getInvoiceById(id!);
                    if (invoiceData) {
                        setInvoice(invoiceData);
                    } else {
                        throw new Error("Factura no encontrada");
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Ocurrió un error desconocido");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, isEditing]);

    const handleSubmit = async (invoiceData: Omit<Invoice, 'id' | 'sif'> | Invoice) => {
        setIsSubmitting(true);
        setError(null);
        try {
            if (isEditing && 'id' in invoiceData) {
                const updatedInvoice = await api.updateInvoice(invoiceData.id, invoiceData);
                navigate(`/invoices/${updatedInvoice.id}`);
            } else if (!isEditing) {
                const newInvoice = await api.addInvoice(invoiceData as Omit<Invoice, 'id'|'sif'|'number'>);
                navigate(`/invoices/${newInvoice.id}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo guardar la factura");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Cargando editor...</div>;
    }

    if (error && !isEditing) {
         return <div className="text-center p-10 text-danger">Error: {error}</div>;
    }
     if (error && isEditing && !invoice) {
        return <div className="text-center p-10 text-danger">Error: {error}</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">
                {isEditing ? `Editando Factura ${invoice?.series}-${invoice?.number}` : 'Crear Nueva Factura'}
            </h1>
            <InvoiceForm
                initialInvoice={invoice}
                customers={customers}
                products={products}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
            {error && <p className="text-danger text-center mt-4">{error}</p>}
        </div>
    );
};

export default InvoiceEditorPage;
