
import React from 'react';

interface CardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon }) => {
    return (
        <div className="rounded-lg bg-surface p-5 border border-border-color">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-text-secondary">{title}</p>
                    <h4 className="text-2xl font-bold text-text-primary mt-1">
                        {value}
                    </h4>
                </div>
                <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-text-secondary">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;