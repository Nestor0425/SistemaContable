import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = await login(username, password);
        if (user) {
            navigate('/');
        } else {
            setError('Credenciales incorrectas. Inténtelo de nuevo.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-boxdark-2">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-default dark:bg-boxdark">
                <div>
                    <h2 className="text-3xl font-bold text-center text-black dark:text-white">
                        Iniciar Sesión en FactuPro™
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <p className="text-center text-danger">{error}</p>}
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2.5 block text-black dark:text-white">Usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                            />
                        </div>
                        <div>
                           <label className="mb-2.5 block text-black dark:text-white">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                            />
                        </div>
                    </div>
                     <p className="text-sm text-bodydark text-center">
                        Use <code className="bg-gray-2 dark:bg-graydark p-1 rounded">admin</code> / <code className="bg-gray-2 dark:bg-graydark p-1 rounded">adminpass</code> o <code className="bg-gray-2 dark:bg-graydark p-1 rounded">staff</code> / <code className="bg-gray-2 dark:bg-graydark p-1 rounded">staffpass</code>
                    </p>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white disabled:bg-opacity-50"
                        >
                            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;