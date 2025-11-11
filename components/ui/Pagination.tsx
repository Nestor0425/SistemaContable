
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalCount, pageSize, onPageChange }) => {
    const totalPages = Math.ceil(totalCount / pageSize);

    if (totalPages <= 1) {
        return null;
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };
    
    const buttonClasses = "px-4 py-2 bg-white border border-border-color rounded-md text-sm font-medium text-text-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="py-4 flex justify-center items-center gap-4">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={buttonClasses}
            >
                Anterior
            </button>
            <span className="text-text-secondary text-sm">
                Página {currentPage} de {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={buttonClasses}
            >
                Siguiente
            </button>
        </div>
    );
};

export default Pagination;
