
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

type ToastContextType = (message: string, type: ToastType) => void;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastContainer: React.FC = () => {
    const { toasts } = useToastState();
    return (
        <div className="fixed top-5 right-5 z-[10000] space-y-3">
            {toasts.map(toast => (
                <div key={toast.id} className={`p-4 rounded-xl shadow-2xl text-white text-sm font-medium
                    ${toast.type === 'success' ? 'bg-success' : ''}
                    ${toast.type === 'error' ? 'bg-danger' : ''}
                    ${toast.type === 'info' ? 'bg-info' : ''}
                    animate-fade-in-down`}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
};


const ToastStateContext = createContext<{ toasts: Toast[], removeToast: (id: number) => void } | undefined>(undefined);

const useToastState = () => {
  const context = useContext(ToastStateContext);
  if (!context) {
    throw new Error('useToastState must be used within a ToastProvider');
  }
  return context;
};


export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, []);
    
    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(currentToasts => [...currentToasts, { id, message, type }]);
        setTimeout(() => removeToast(id), 5000);
    }, [removeToast]);
    

    return (
        <ToastContext.Provider value={showToast}>
            <ToastStateContext.Provider value={{ toasts, removeToast }}>
                 {children}
            </ToastStateContext.Provider>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};