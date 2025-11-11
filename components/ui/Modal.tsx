

import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center transition-opacity p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-boxdark rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 transform transition-all animate-fade-in-down max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100 dark:border-strokedark/20">
                    <h3 className="text-xl font-semibold text-black dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-2xl font-light text-bodydark hover:text-danger">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;