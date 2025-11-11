
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/apiService';

// Hook para detectar nueva actividad
const useNewActivity = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [hasNewInvoices, setHasNewInvoices] = useState(false);
    const [hasNewQuotes, setHasNewQuotes] = useState(false);

    useEffect(() => {
        if (!user) return;

        const checkActivity = async () => {
            try {
                // Comprobar Facturas
                const lastVisitInvoices = localStorage.getItem(`lastVisit_invoices_${user.id}`);
                const invoicesResult = await api.getInvoices();
                if (invoicesResult.length > 0) {
                    const latestInvoiceDate = invoicesResult[0].date;
                    if (!lastVisitInvoices || new Date(latestInvoiceDate) > new Date(lastVisitInvoices)) {
                        setHasNewInvoices(true);
                    } else {
                        setHasNewInvoices(false);
                    }
                }

                // Comprobar Presupuestos
                const lastVisitQuotes = localStorage.getItem(`lastVisit_quotes_${user.id}`);
                const quotesResult = await api.getQuotes();
                if (quotesResult.length > 0) {
                     const latestQuoteDate = quotesResult[0].date;
                     if (!lastVisitQuotes || new Date(latestQuoteDate) > new Date(lastVisitQuotes)) {
                        setHasNewQuotes(true);
                    } else {
                        setHasNewQuotes(false);
                    }
                }
            } catch (error) {
                console.error("Error checking new activity:", error);
            }
        };

        checkActivity();
    }, [location.pathname, user]);

    return { hasNewInvoices, hasNewQuotes };
};


interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const NavItem: React.FC<{ to: string; text: string; icon: string; partialMatch?: boolean; tag?: string }> = ({ to, text, icon, partialMatch = true, tag }) => {
    const location = useLocation();
    const isActive = partialMatch ? location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/') : location.pathname === to;

    return (
        <li>
            <NavLink
                to={to}
                className={`flex items-center gap-3 py-2 px-4 rounded-md transition-colors text-base
                    ${isActive
                        ? 'bg-primary text-white font-semibold'
                        : 'text-text-secondary hover:bg-primary-10 hover:text-primary'
                    }`
                }
            >
                <span className="material-symbols-outlined">{icon}</span>
                <span className="flex-1">{text}</span>
                 {tag && (
                    <span className="bg-success-20 text-success text-xs font-bold px-2 py-0.5 rounded-full animate-soft-pulse">{tag}</span>
                )}
            </NavLink>
        </li>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const { user } = useAuth();
    const { hasNewInvoices, hasNewQuotes } = useNewActivity();

    return (
        <aside
            className={`absolute left-0 top-0 z-20 flex h-screen w-64 flex-col overflow-y-hidden bg-surface duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-border-color ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className="flex items-center justify-between gap-2 px-6 py-5">
                <NavLink to="/">
                    <h1 className="relative text-xl font-bold text-text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-5xl">wysiwyg</span>
                        <p className="-mt-3">FactuPro™</p>
                        <p className="absolute text-xs text-text-secondary mt-5 ml-14">by Heartize™</p>
                    </h1>
                </NavLink>
            </div>
            <div className="thin-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
                <nav className="flex-1 px-4 py-4">
                    <div>
                        <ul className="flex flex-col gap-2">
                            <NavItem to="/" text="Dashboard" icon="dashboard" partialMatch={false} />
                            <NavItem to="/invoices" text="Facturas" icon="receipt_long" tag={hasNewInvoices ? "NEW" : undefined}/>
                            <NavItem to="/quotes" text="Presupuestos" icon="request_quote" tag={hasNewQuotes ? "NEW" : undefined} />
                            <NavItem to="/customers" text="Clientes" icon="group" />
                            <NavItem to="/products" text="Productos" icon="inventory_2" />
                            <NavItem to="/exports" text="Exportaciones" icon="archive" />
                        </ul>
                    </div>
                    <div className="pt-6 mt-6 border-t border-border-color">
                        <h3 className="mb-4 ml-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">ADMINISTRACIÓN</h3>
                        <ul className="flex flex-col gap-2">
                            {user?.role === 'admin' && (
                                <>
                                    <NavItem to="/team" text="Equipo" icon="manage_accounts" />
                                    <NavItem to="/audit" text="Auditoría" icon="policy" />
                                    <NavItem to="/templates" text="Plantillas" icon="palette" />
                                    <NavItem to="/settings" text="Configuración" icon="settings" />
                                    <NavItem to="/cron" text="Configuración Cron" icon="schedule" />
                                </>
                            )}
                            <NavItem to="/tests" text="Pruebas del Sistema" icon="science" />
                            <NavItem to="/sif-info" text="Información SIF" icon="info" />
                        </ul>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
