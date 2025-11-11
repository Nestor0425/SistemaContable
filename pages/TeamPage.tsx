

import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import * as api from '../services/apiService';
import Modal from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import UserForm from '../components/forms/UserForm';

const PERMISSIONS_LIST = [
    { id: 'dashboard', label: 'Ver Dashboard' },
    { id: 'invoices', label: 'Gestionar Facturas y Presupuestos' },
    { id: 'customers', label: 'Gestionar Clientes' },
    { id: 'products', label: 'Gestionar Productos' },
    { id: 'exports', label: 'Realizar Exportaciones' },
    { id: 'team', label: 'Gestionar Equipo' },
    { id: 'audit', label: 'Ver Auditoría SIF' },
    { id: 'settings', label: 'Editar Configuración' },
];

const TeamPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const showToast = useToast();

    // Mocked state for permissions
    const [staffPermissions, setStaffPermissions] = useState({
        dashboard: true, invoices: true, customers: true, products: true,
        exports: false, team: false, audit: false, settings: false
    });

    const handlePermissionChange = (permId: string) => {
        setStaffPermissions(prev => ({ ...prev, [permId]: !prev[permId] }));
    };

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            showToast('No se pudieron cargar los usuarios.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (user: User | null = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSubmit = async (userData: User) => {
        setIsSubmitting(true);
        try {
            if (userData.id) {
                await api.updateUser(userData.id, userData);
                showToast('Usuario actualizado con éxito.', 'success');
            } else {
                await api.addUser(userData);
                showToast('Usuario añadido con éxito.', 'success');
            }
            await fetchUsers();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving user:", error);
            showToast(error instanceof Error ? error.message : 'No se pudo guardar el usuario.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (users.length <= 1) {
            showToast('No se puede eliminar el último usuario.', 'warning');
            return;
        }
        if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
            try {
                await api.deleteUser(id);
                await fetchUsers();
                showToast('Usuario eliminado.', 'success');
            } catch (error) {
                console.error("Error deleting user:", error);
                showToast('No se pudo eliminar el usuario.', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg shadow-lg bg-white px-5 pt-6 pb-2.5 dark:bg-boxdark sm:px-7.5 xl:pb-1">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-black dark:text-white">Gestión de Equipo</h1>
                    <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary py-3 px-8 text-center font-medium text-white hover:bg-opacity-90">
                        Nuevo Usuario
                    </button>
                </div>

                {isLoading ? (
                     <p className="text-center py-10 text-bodydark">Cargando usuarios...</p>
                ) : (
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left">
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white">Usuario</th>
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white">Rol</th>
                                    <th className="py-4 px-4 font-semibold text-black dark:text-white">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-boxdark-2">
                                        <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                            <p className="font-medium text-black dark:text-white">{user.username}</p>
                                        </td>
                                        <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                            <p className={`inline-flex rounded-full py-1 px-3 text-xs font-semibold ${user.role === 'admin' ? 'bg-primary-10 text-primary' : 'bg-secondary text-text-secondary'}`}>{user.role}</p>
                                        </td>
                                        <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                            <div className="flex items-center space-x-3.5">
                                                <button onClick={() => handleOpenModal(user)} className="hover:text-primary">Editar</button>
                                                <button onClick={() => handleDelete(user.id)} className="hover:text-danger">Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <div className="rounded-lg border border-border-color bg-white p-6">
                <h4 className="text-xl font-semibold mb-6 text-text-primary border-b border-border-color pb-4">Gestión de Permisos por Rol</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                        <h5 className="font-semibold mb-4 text-text-primary">Admin</h5>
                        <div className="space-y-3">
                            {PERMISSIONS_LIST.map(perm => (
                                <label key={perm.id} className="flex items-center gap-3">
                                    <input type="checkbox" checked readOnly disabled className="h-5 w-5 rounded border-border-color text-primary focus:ring-primary disabled:opacity-50" />
                                    <span className="text-text-secondary">{perm.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h5 className="font-semibold mb-4 text-text-primary">Staff</h5>
                        <div className="space-y-3">
                           {PERMISSIONS_LIST.map(perm => (
                                <label key={perm.id} className="flex items-center gap-3">
                                    <input type="checkbox" checked={staffPermissions[perm.id as keyof typeof staffPermissions]} onChange={() => handlePermissionChange(perm.id)} className="h-5 w-5 rounded border-border-color text-primary focus:ring-primary" />
                                    <span>{perm.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end pt-4 border-t border-border-color">
                    <button onClick={() => showToast('Permisos guardados (simulado).', 'success')} className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-5 text-center font-medium text-white hover:bg-opacity-90">
                        Guardar Permisos
                    </button>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}>
                <UserForm 
                    user={editingUser}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </div>
    );
};

export default TeamPage;