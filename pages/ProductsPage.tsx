import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import * as api from '../services/apiService';
import ProductForm from '../components/forms/ProductForm';
import Modal from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import IconPickerModal from '../components/ui/IconPickerModal';

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const showToast = useToast();

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);
    
    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (productData: Omit<Product, 'id'> | Product) => {
        setIsSubmitting(true);
        try {
            if ('id' in productData) {
                await api.updateProduct(productData.id, productData);
                showToast('Producto actualizado con éxito.', 'success');
            } else {
                await api.addProduct(productData);
                showToast('Producto añadido con éxito.', 'success');
            }
            await fetchProducts();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving product:", error);
            showToast('No se pudo guardar el producto.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
            try {
                await api.deleteProduct(id);
                await fetchProducts();
                showToast('Producto eliminado.', 'success');
            } catch (error) {
                console.error("Error deleting product:", error);
                showToast('No se pudo eliminar el producto.', 'error');
            }
        }
    };


    return (
        <>
            <div className="rounded-lg shadow-lg bg-white px-5 pt-6 pb-2.5 dark:bg-boxdark sm:px-7.5 xl:pb-1">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-black dark:text-white">Productos y Servicios</h1>
                    <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90">
                        Nuevo Producto
                    </button>
                </div>
                 {isLoading ? (
                    <p className="text-center py-10 text-bodydark">Cargando productos...</p>
                ) : (
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left">
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white">Icono</th>
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white">SKU</th>
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white">Nombre</th>
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white text-right">Precio</th>
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-boxdark-2">
                                        <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4 w-16">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="h-12 w-12 object-cover rounded-md" />
                                            ) : product.iconName ? (
                                                <span className="material-symbols-outlined text-4xl text-text-secondary">{product.iconName}</span>
                                            ) : (
                                                <div className="h-12 w-12 bg-secondary rounded-md"></div>
                                            )}
                                        </td>
                                        <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                            <p className="text-black dark:text-white">{product.sku}</p>
                                        </td>
                                        <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                            <p className="font-medium text-black dark:text-white">{product.name}</p>
                                        </td>
                                        <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4 text-right">
                                            <p className="font-medium text-black dark:text-white">€{product.price.toFixed(2)}</p>
                                        </td>
                                        <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                            <div className="flex items-center space-x-3.5">
                                                <button onClick={() => handleOpenModal(product)} className="hover:text-primary">Editar</button>
                                                <button onClick={() => handleDelete(product.id)} className="hover:text-danger">Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}>
                <ProductForm
                    product={editingProduct}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </>
    );
};

export default ProductsPage;