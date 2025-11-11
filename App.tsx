


import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import InvoicesPage from './pages/InvoicesPage';
import QuotesPage from './pages/QuotesPage';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import SettingsPage from './pages/SettingsPage';
import InvoiceDetail from './pages/InvoiceDetail';
import InvoiceEditorPage from './pages/InvoiceEditorPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import QuoteEditorPage from './pages/QuoteEditorPage';
import AuditLogPage from './pages/AuditLogPage';
import ExportsPage from './pages/ExportsPage';
import QuotePublicView from './pages/QuotePublicView';
import TestsPage from './pages/TestsPage';
import SifInfoPage from './pages/SifInfoPage';
import { ToastContainer } from './contexts/ToastContext';
import CustomerDetailPage from './pages/CustomerDetailPage';
import * as api from './services/apiService';
import CustomerPublicPage from './pages/CustomerPublicPage';
import InvoicePublicView from './pages/InvoicePublicView';
import TeamPage from './pages/TeamPage';
import CronPage from './pages/CronPage';
import TemplateEditorPage from './pages/TemplateEditorPage';


const AppLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    React.useEffect(() => {
        const hexToRgba = (hex: string, opacity: number): string => {
            if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                return `rgba(0,0,0,${opacity})`; // Fallback for invalid hex
            }
            let c: any = hex.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${opacity})`;
        };
        // Apply theme color on initial load
        api.getSettings().then(settings => {
            const primaryColor = settings.interfaceColor || '#000000';
            document.documentElement.style.setProperty('--color-primary', primaryColor);
            document.documentElement.style.setProperty('--color-primary-10', hexToRgba(primaryColor, 0.1));
            document.documentElement.style.setProperty('--color-primary-20', hexToRgba(primaryColor, 0.2));
        });
    }, []);

    return (
        <div className="bg-secondary">
             <ToastContainer />
            <div className="flex h-screen overflow-hidden">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <main>
                        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                            <Routes>
                                <Route path="/" element={<DashboardPage />} />
                                <Route path="/invoices" element={<InvoicesPage />} />
                                <Route path="/invoices/new" element={<InvoiceEditorPage />} />
                                <Route path="/invoices/edit/:id" element={<InvoiceEditorPage />} />
                                <Route path="/invoices/:id" element={<InvoiceDetail />} />
                                <Route path="/quotes" element={<QuotesPage />} />
                                <Route path="/quotes/new" element={<QuoteEditorPage />} />
                                <Route path="/quotes/edit/:id" element={<QuoteEditorPage />} />
                                <Route path="/quotes/view/:id" element={<QuotePublicView />} />
                                <Route path="/customers" element={<CustomersPage />} />
                                <Route path="/customers/:id" element={<CustomerDetailPage />} />
                                <Route path="/products" element={<ProductsPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="/templates" element={<TemplateEditorPage />} />
                                <Route path="/audit" element={<AuditLogPage />} />
                                <Route path="/exports" element={<ExportsPage />} />
                                <Route path="/team" element={<TeamPage />} />
                                <Route path="/cron" element={<CronPage />} />
                                <Route path="/tests" element={<TestsPage />} />
                                <Route path="/sif-info" element={<SifInfoPage />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const { user } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/portal/customer/:id" element={<CustomerPublicPage />} />
            <Route path="/public/invoice/:id" element={<InvoicePublicView />} />
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default App;