import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { ExportLogEntry } from '../types';
import { useToast } from '../contexts/ToastContext';

const ExportsPage: React.FC = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [exports, setExports] = useState<ExportLogEntry[]>([]);
    const showToast = useToast();

    const fetchExports = useCallback(async () => {
        const data = await api.getExports();
        setExports(data);
    }, []);

    useEffect(() => {
        fetchExports();
    }, [fetchExports]);

    const handleExportSif = async () => {
        setIsExporting(true);
        try {
            const allData = {
                invoices: await api.getInvoices(),
                auditLog: await api.getAuditLog(),
            };
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const summary = `ZIP SIF: ${allData.invoices.length} facturas, ${allData.auditLog.length} registros de auditoría.`;
            
            await api.addExportLog(summary);
            await fetchExports(); // Refresh the list
            showToast('Exportación SIF simulada generada con éxito.', 'success');

        } catch (error) {
            console.error("Error exporting SIF data:", error);
            showToast("Error al generar la exportación SIF.", 'error');
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleDownload = async (entry: ExportLogEntry) => {
        showToast(`Generando descarga para el export del ${new Date(entry.timestamp).toLocaleString()}`, 'info');
        try {
            // In a real app, you'd fetch data related to the specific export.
            // For this demo, we'll just download the current SIF data.
            const allData = {
                invoices: await api.getInvoices(),
                auditLog: await api.getAuditLog(),
            };
            const jsonString = JSON.stringify(allData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sif_export_${new Date(entry.timestamp).toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
             showToast("Error al generar la descarga.", 'error');
        }
    };

    return (
        <div className="rounded-lg shadow-lg bg-white p-6 dark:bg-boxdark sm:px-7.5 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Exportaciones de Cumplimiento</h1>
                <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Exportación SIF (AEAT)</h2>
                <p className="text-body dark:text-bodydark mb-4">
                    Genere un archivo ZIP que contenga todos los registros de facturación en formato JSON, junto con el registro de auditoría, tal como lo exige el Real Decreto 1007/2023 para una posible inspección de la Agencia Tributaria.
                </p>
                <button
                    onClick={handleExportSif}
                    disabled={isExporting}
                    className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-3 px-8 text-center font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50"
                >
                    {isExporting ? 'Generando Archivo...' : 'Generar ZIP SIF'}
                </button>
            </div>
            
             <div className="pt-6 border-t border-gray-100 dark:border-strokedark/20">
                <h3 className="text-xl font-semibold text-black dark:text-white mb-4">Historial de Exportaciones</h3>
                 <div className="max-w-full overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left">
                                <th className="py-4 px-4 font-semibold text-black dark:text-white">Fecha</th>
                                <th className="py-4 px-4 font-semibold text-black dark:text-white">Usuario</th>
                                <th className="py-4 px-4 font-semibold text-black dark:text-white">Resumen</th>
                                <th className="py-4 px-4 font-semibold text-black dark:text-white">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exports.map(entry => (
                                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-boxdark-2">
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <p className="text-black dark:text-white">{new Date(entry.timestamp).toLocaleString()}</p>
                                    </td>
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <p className="font-medium text-black dark:text-white">{entry.user}</p>
                                    </td>
                                    <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <p className="text-black dark:text-white">{entry.summary}</p>
                                    </td>
                                     <td className="border-t border-gray-100 dark:border-strokedark/20 py-5 px-4">
                                        <button onClick={() => handleDownload(entry)} className="font-medium text-primary hover:underline">Descargar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExportsPage;