
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Quote, Customer, Product } from '../types';
import QuoteForm from '../components/forms/QuoteForm';
import * as api from '../services/apiService';

const QuoteEditorPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    
    const [quote, setQuote] = useState<Quote | null>(null);
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
                    const quoteData = await api.getQuoteById(id!);
                    if (quoteData) {
                        setQuote(quoteData);
                    } else {
                        throw new Error("Presupuesto no encontrado");
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

    const handleSubmit = async (quoteData: Omit<Quote, 'id' | 'number'> | Quote) => {
        setIsSubmitting(true);
        setError(null);
        try {
            if (isEditing && 'id' in quoteData) {
                await api.updateQuote(quoteData.id, quoteData);
            } else {
                await api.addQuote(quoteData as Omit<Quote, 'id' | 'number'>);
            }
            navigate('/quotes');
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo guardar el presupuesto");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Cargando editor de presupuestos...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-danger">Error: {error}</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">
                {isEditing ? `Editando Presupuesto ${quote?.number}` : 'Crear Nuevo Presupuesto'}
            </h1>
            <QuoteForm
                initialQuote={quote}
                customers={customers}
                products={products}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
            {error && <p className="text-danger text-center mt-4">{error}</p>}
        </div>
    );
};

export default QuoteEditorPage;
