
import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface UserFormProps {
    user?: User | null;
    onSubmit: (user: User) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'staff' as 'admin' | 'staff'
    });
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');

    const isEditing = !!user;

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                password: '',
                role: user.role,
            });
        } else {
             setFormData({ username: '', password: '', role: 'staff' });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!isEditing && !formData.password) {
            setError('La contraseña es obligatoria para nuevos usuarios.');
            return;
        }
        if (formData.password && formData.password !== passwordConfirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        onSubmit({ ...user, ...formData });
    };
    
    const inputClasses = "w-full rounded-md border border-border-color bg-white py-3 px-5 font-medium text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent";
    const labelClasses = "mb-2.5 block font-medium text-text-primary";

    return (
        <form onSubmit={handleSubmit}>
            {error && <p className="text-danger mb-4 text-center">{error}</p>}
            <div className="space-y-4">
                <div>
                    <label className={labelClasses}>Nombre de Usuario</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required className={inputClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Contraseña</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? 'Dejar en blanco para no cambiar' : ''} className={inputClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Confirmar Contraseña</label>
                    <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} className={inputClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Rol</label>
                    <select name="role" value={formData.role} onChange={handleChange} className={`${inputClasses} appearance-none`}>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4 pt-4 border-t border-border-color">
                 <button type="button" onClick={onCancel} disabled={isSubmitting} className="flex justify-center rounded-md border border-border-color bg-white py-2 px-6 font-medium text-text-primary hover:bg-secondary">
                    Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex justify-center rounded-md bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50">
                    {isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
                </button>
            </div>
        </form>
    );
};

export default UserForm;