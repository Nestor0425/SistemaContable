import React from 'react';

const CronPage: React.FC = () => {
    const apiUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}api/v1/cron/generate-recurring?token=YOUR_SECRET_TOKEN`;

    return (
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-black dark:text-white">Configuración de Tareas Cron</h1>
                <p className="text-body dark:text-bodydark mt-2">
                    Para automatizar la generación de facturas recurrentes, necesita configurar una tarea programada (Cron Job) que llame a un endpoint específico de esta aplicación.
                </p>
            </div>

            <section>
                <h2 className="text-xl font-semibold text-black dark:text-white mb-3">Endpoint de la API</h2>
                <p className="text-body dark:text-bodydark mb-2">
                    La URL que debe llamar su servicio de Cron es la siguiente. Asegúrese de reemplazar `YOUR_SECRET_TOKEN` por una clave segura que configure en su backend.
                </p>
                <pre className="bg-secondary p-4 rounded-md font-mono text-sm text-text-primary overflow-x-auto">
                    <code>{apiUrl}</code>
                </pre>
                 <p className="text-sm text-text-secondary mt-2">
                    <strong>Nota:</strong> En esta versión de demostración, este endpoint está simulado. En una aplicación real, este endpoint estaría protegido y se encargaría de buscar las facturas que necesitan ser recreadas y generar los nuevos borradores.
                </p>
            </section>
            
            <section>
                <h2 className="text-xl font-semibold text-black dark:text-white mb-3">Configuración con cron-jobs.org</h2>
                <p className="text-body dark:text-bodydark mb-4">
                    Recomendamos usar un servicio externo como <a href="https://cron-jobs.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cron-jobs.org</a> para gestionar estas tareas. Siga estos pasos:
                </p>
                <div className="space-y-4 p-4 border border-stroke dark:border-strokedark rounded-md">
                    <div>
                        <h3 className="font-semibold text-black dark:text-white">Paso 1: Crear una cuenta</h3>
                        <p className="text-sm text-body dark:text-bodydark">Regístrese en cron-jobs.org y acceda a su panel de control.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-black dark:text-white">Paso 2: Crear un Cronjob</h3>
                        <p className="text-sm text-body dark:text-bodydark">Haga clic en "Create Cronjob".</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-black dark:text-white">Paso 3: Configurar la URL</h3>
                        <p className="text-sm text-body dark:text-bodydark">En el campo "URL", pegue la dirección del endpoint proporcionada arriba. En el título, puede poner algo descriptivo como "Generador Facturas Recurrentes FactuPro™".</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-black dark:text-white">Paso 4: Configurar la Programación</h3>
                         <p className="text-sm text-body dark:text-bodydark">Para una revisión diaria, seleccione la pestaña "Every day" y elija una hora de baja actividad, por ejemplo, las 03:00 AM.</p>
                         <img src="https://i.imgur.com/nEx5m8E.png" alt="Ejemplo de configuración de cron-jobs.org" className="mt-2 rounded-md border border-stroke" />
                    </div>
                     <div>
                        <h3 className="font-semibold text-black dark:text-white">Paso 5: Guardar</h3>
                        <p className="text-sm text-body dark:text-bodydark">Guarde el cronjob. El servicio se encargará de llamar a la URL automáticamente según la programación establecida, y sus facturas recurrentes se generarán como borradores en la fecha correspondiente.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CronPage;