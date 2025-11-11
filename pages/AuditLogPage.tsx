import React, { useState, useEffect, useCallback } from 'react';
import { AuditLogEntry } from '../types';
import * as api from '../services/apiService';

const AuditLogPage: React.FC = () => {
    const [logEntries, setLogEntries] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLog = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getAuditLog();
            setLogEntries(data);
        } catch (error) {
            console.error("Error fetching audit log:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLog();
    }, [fetchLog]);

    return (
        <div className="rounded-lg shadow-lg bg-white px-5 pt-6 pb-2.5 dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold text-black dark:text-white">Registro de Auditoría SIF</h1>
            </div>
            
            {isLoading ? (
                <p className="text-center py-10 text-bodydark">Cargando registro...</p>
            ) : (
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left">
                                <th className="py-4 px-4 font-semibold text-black dark:text-white">Timestamp</th>
                                <th className="py-4 px-4 font-semibold text-black dark:text-white">Usuario</th>
                                <th className="py-4 px-4 font-semibold text-black dark:text-white">Acción</th>
                                <th className="py-4 px-4 font-semibold text-black dark:text-white">Entidad</th>
                                <th className="py-4 px-4 font-semibold text-black dark:text-white">ID Entidad / Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logEntries.map((entry, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-boxdark-2">
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <p className="text-black dark:text-white">{new Date(entry.timestamp).toLocaleString()}</p>
                                    </td>
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <p className="font-medium text-black dark:text-white">{entry.user}</p>
                                    </td>
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <p className="text-black dark:text-white">{entry.action}</p>
                                    </td>
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <p className="text-black dark:text-white">{entry.entity}</p>
                                    </td>
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <p className="text-black dark:text-white">{entry.entityId}</p>
                                        {entry.details && <p className="text-sm text-bodydark">{entry.details}</p>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuditLogPage;