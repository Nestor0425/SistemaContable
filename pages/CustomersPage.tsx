
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Customer } from '../types';
import * as api from '../services/apiService';
import CustomerForm from '../components/forms/CustomerForm';
import Modal from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';

const CustomersPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const showToast = useToast();

    const fetchCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleOpenFormModal = (customer: Customer | null = null) => {
        setSelectedCustomer(customer);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleOpenLinkModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsLinkModalOpen(true);
    };

    const handleCloseLinkModal = () => {
        setIsLinkModalOpen(false);
        setSelectedCustomer(null);
    };
    
    const getPublicLink = (customerId: string) => {
        const { protocol, host, pathname } = window.location;
        // Adjust for HashRouter's '#'
        const cleanPathname = pathname.includes('/#/') ? pathname.split('/#/')[0] : pathname;
        return `${protocol}//${host}${cleanPathname}#/portal/customer/${customerId}`;
    }

    const handleSubmit = async (customerData: Omit<Customer, 'id'> | Customer) => {
        setIsSubmitting(true);
        try {
            if ('id' in customerData) {
                await api.updateCustomer(customerData.id, customerData);
                showToast('Cliente actualizado con éxito.', 'success');
            } else {
                await api.addCustomer(customerData);
                showToast('Cliente añadido con éxito.', 'success');
            }
            await fetchCustomers();
            handleCloseFormModal();
        } catch (error) {
            console.error("Error saving customer:", error);
            showToast('No se pudo guardar el cliente.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
            try {
                await api.deleteCustomer(id);
                await fetchCustomers();
                showToast('Cliente eliminado.', 'success');
            } catch (error) {
                console.error("Error deleting customer:", error);
                showToast('No se pudo eliminar el cliente.', 'error');
            }
        }
    };

    return (
        <>
            <div className="rounded-lg shadow-lg bg-white px-5 pt-6 pb-2.5 dark:bg-boxdark sm:px-7.5 xl:pb-1">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-black dark:text-white">Clientes</h1>
                    <button onClick={() => handleOpenFormModal()} className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary py-3 px-8 text-center font-medium text-white hover:bg-opacity-90">
                        Nuevo Cliente
                    </button>
                </div>

                {isLoading ? (
                     <p className="text-center py-10 text-bodydark">Cargando clientes...</p>
                ) : (
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left">
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white">Nombre</th>
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white">NIF</th>
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white">Email</th>
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white">Contacto</th>
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-boxdark-2">
                                        <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                            <p className="font-medium text-black dark:text-white">{customer.name}</p>
                                        </td>
                                        <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                            <p className="text-black dark:text-white">{customer.nif}</p>
                                        </td>
                                        <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                            <p className="text-black dark:text-white">{customer.email}</p>
                                        </td>
                                         <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                            <p className="text-black dark:text-white">{customer.contactPerson?.name || '-'}</p>
                                        </td>
                                        <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                            <div className="flex items-center space-x-3.5">
                                                <Link to={`/customers/${customer.id}`} className="hover:text-primary">Ver Historial</Link>
                                                <button onClick={() => handleOpenFormModal(customer)} className="hover:text-primary">Editar</button>
                                                <button onClick={() => handleDelete(customer.id)} className="hover:text-danger">Eliminar</button>
                                                <button onClick={() => handleOpenLinkModal(customer)} className="hover:text-accent">Obtener Enlace</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={selectedCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}>
                <CustomerForm 
                    customer={selectedCustomer}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseFormModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
            
            <Modal isOpen={isLinkModalOpen} onClose={handleCloseLinkModal} title="Enlace Público del Cliente">
                {selectedCustomer && (
                    <div>
                        <p className="mb-4 text-text-secondary">Copie y comparta este enlace con su cliente para que pueda acceder a su historial de facturas.</p>
                        <input
                            type="text"
                            readOnly
                            value={getPublicLink(selectedCustomer.id)}
                            className="w-full rounded-md border border-border-color bg-secondary p-3 font-mono text-sm"
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(getPublicLink(selectedCustomer.id));
                                    showToast('Enlace copiado al portapapeles.', 'success');
                                }}
                                className="rounded-md bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90"
                            >
                                Copiar Enlace
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default CustomersPage;