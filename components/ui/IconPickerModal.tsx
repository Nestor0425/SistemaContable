
import React, { useState } from 'react';
import Modal from './Modal';

interface IconPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (iconName: string) => void;
}

const icons = [
    'shopping_cart', 'payments', 'receipt_long', 'inventory', 'store', 'build', 'home_repair_service', 
    'design_services', 'code', 'monitoring', 'camera', 'photo_camera', 'brush', 'palette', 'edit',
    'support_agent', 'translate', 'article', 'description', 'book', 'computer', 'smartphone', 'dns',
    'database', 'storage', 'cloud', 'security', 'public', 'language', 'paid', 'work', 'rocket_launch'
];

const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar Icono">
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-4 max-h-96 overflow-y-auto p-2">
                {icons.map(iconName => (
                    <div 
                        key={iconName} 
                        onClick={() => onSelect(iconName)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer hover:bg-light dark:hover:bg-boxdark-2"
                    >
                        <span className="material-symbols-outlined text-4xl">{iconName}</span>
                        <p className="text-xs text-center break-all">{iconName}</p>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default IconPickerModal;
