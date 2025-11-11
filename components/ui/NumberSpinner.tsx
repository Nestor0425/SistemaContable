import React from 'react';

interface NumberSpinnerProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
}

const NumberSpinner: React.FC<NumberSpinnerProps> = ({ value, onChange, min = 1, max = 9999, step = 1, className = '' }) => {
    
    const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const newValue = Math.min(value + step, max);
        onChange(newValue);
    };

    const handleDecrement = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const newValue = Math.max(value - step, min);
        onChange(newValue);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = parseFloat(e.target.value);
        if (isNaN(newValue)) {
            onChange(min);
        } else {
            newValue = Math.max(min, Math.min(newValue, max));
            onChange(newValue);
        }
    }
    
    const buttonClasses = "px-1 text-text-secondary transition-colors hover:text-primary focus:outline-none flex items-center justify-center h-1/2 cursor-pointer";

    return (
        <div className={`relative ${className}`}>
            <input
                type="number"
                value={value}
                onChange={handleChange}
                min={min}
                max={max}
                step={step}
                className="w-full h-full text-center bg-surface font-medium text-text-primary outline-none rounded-md border border-border-color transition-all focus:border-primary focus:ring-1 focus:ring-primary pr-8"
            />
            <div className="absolute right-0.5 top-0 bottom-0 flex flex-col items-center justify-center w-8">
                <button type="button" onClick={handleIncrement} className={buttonClasses}>
                    <span className="material-symbols-outlined text-xl leading-none">expand_less</span>
                </button>
                <button type="button" onClick={handleDecrement} className={buttonClasses}>
                    <span className="material-symbols-outlined text-xl leading-none">expand_more</span>
                </button>
            </div>
        </div>
    );
};

export default NumberSpinner;