"use client";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function PaginationControls({
    currentPage,
    totalPages,
    onPageChange
}: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-4 mt-8">
            <Button
                variant="outline"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-6"
            >
                Précédent
            </Button>
            <span className="text-muted-foreground font-medium">
                Page {currentPage} sur {totalPages}
            </span>
            <Button
                variant="outline"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-6"
            >
                Suivant
            </Button>
        </div>
    );
}
