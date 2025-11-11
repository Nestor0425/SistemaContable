import React from 'react';

const SifInfoPage: React.FC = () => {
    return (
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-6">Información de Cumplimiento SIF (RD 1007/2023)</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-black dark:text-white mb-3">Checklist de Conformidad</h2>
                    <ul className="list-disc list-inside space-y-2 text-body dark:text-bodydark">
                        <li>
                            <strong className="font-medium text-black dark:text-white">✔ Integridad e Inalterabilidad:</strong> Cada factura generada incluye una huella digital (hash SHA-256) que la encadena con la factura anterior, garantizando que los registros no puedan ser alterados.
                        </li>
                        <li>
                            <strong className="font-medium text-black dark:text-white">✔ Trazabilidad:</strong> Se mantiene un registro de auditoría (`Audit Log`) de todos los eventos de facturación y acciones críticas del sistema. Este registro es accesible para administradores.
                        </li>
                        <li>
                            <strong className="font-medium text-black dark:text-white">✔ Conservación:</strong> Todos los registros de facturación se conservan de forma segura (simulado mediante el `localStorage` del navegador para esta demo).
                        </li>
                        <li>
                            <strong className="font-medium text-black dark:text-white">✔ Legibilidad:</strong> Los datos de las facturas se almacenan en un formato legible (JSON) y se pueden exportar.
                        </li>
                        <li>
                            <strong className="font-medium text-black dark:text-white">✔ Código QR:</strong> Todas las facturas incluyen un código QR con la información esencial, como exige la normativa para facturas simplificadas y completas.
                        </li>
                        <li>
                            <strong className="font-medium text-black dark:text-white">✔ Modos de Operación:</strong> La aplicación soporta los modos `NO_VERIFACTU` (por defecto) y `VERIFACTU`, configurables por un administrador.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-black dark:text-white mb-3">Guía Rápida para Activar VERIFACTU</h2>
                     <p className="text-body dark:text-bodydark mb-4">
                        El modo VERIFACTU implica la remisión automática de los registros de facturación a la Agencia Tributaria (AEAT). En esta aplicación de demostración, este proceso está simulado.
                    </p>
                    <div className="space-y-4 p-4 border border-stroke dark:border-strokedark rounded-md">
                        <div>
                            <h3 className="font-semibold text-black dark:text-white">Paso 1: Acceder como Administrador</h3>
                            <p className="text-sm text-body dark:text-bodydark">Inicie sesión con un usuario con rol de 'admin' (ej: `admin`/`adminpass`). Solo los administradores pueden cambiar la configuración SIF.</p>
                        </div>
                         <div>
                            <h3 className="font-semibold text-black dark:text-white">Paso 2: Ir a Configuración</h3>
                            <p className="text-sm text-body dark:text-bodydark">Navegue a la sección "Configuración" desde el menú lateral.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-black dark:text-white">Paso 3: Cambiar el Modo de Operación</h3>
                            <p className="text-sm text-body dark:text-bodydark">En el desplegable "Modo de Operación SIF", seleccione `VERIFACTU`. Verá aparecer una nueva sección para la configuración del certificado digital.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-black dark:text-white">Paso 4: Subir Certificado Digital (Simulado)</h3>
                            <p className="text-sm text-body dark:text-bodydark">En un entorno real, aquí debería subir su certificado digital en formato .pfx o .p12, que se utilizaría para firmar las peticiones a la AEAT. En esta demo, este paso es solo visual.</p>
                        </div>
                         <div>
                            <h3 className="font-semibold text-black dark:text-white">Paso 5: Guardar y Operar</h3>
                            <p className="text-sm text-body dark:text-bodydark">Guarde los cambios. A partir de ahora, al visualizar una factura, el botón "Transmitir a AEAT" simulará el envío de los datos a la agencia tributaria mediante un servicio SOAP, generando un XML de ejemplo con la ayuda de IA.</p>
                        </div>
                    </div>
                </section>
                
                <section>
                     <h2 className="text-xl font-semibold text-black dark:text-white mb-3">Declaración de Responsabilidad</h2>
                     <p className="text-body dark:text-bodydark">
                        Esta aplicación, "FactuPro™", en su versión de demostración 1.0.0, ha sido desarrollada siguiendo los requisitos técnicos estipulados en el Real Decreto 1007/2023. El productor del software declara que el sistema cumple con los principios de integridad, conservación, accesibilidad, legibilidad, trazabilidad e inalterabilidad de los registros de facturación.
                    </p>
                </section>

            </div>
        </div>
    );
};

export default SifInfoPage;