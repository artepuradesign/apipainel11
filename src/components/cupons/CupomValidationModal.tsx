import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Ticket } from 'lucide-react';
import CupomValidationCard from './CupomValidationCard';

interface CupomValidationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledCupomCode?: string;
  onCupomUsed?: (valorAdicionado: number) => void;
}

const CupomValidationModal: React.FC<CupomValidationModalProps> = ({
  isOpen,
  onOpenChange,
  prefilledCupomCode,
  onCupomUsed,
}) => {
  const handleCupomUsed = (valorAdicionado: number) => {
    onCupomUsed?.(valorAdicionado);
    onOpenChange(false); // Close modal after successful use
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-xl p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent text-base sm:text-lg">
                Aplicar Cupom
              </span>
              {prefilledCupomCode && (
                <p className="text-xs sm:text-sm text-muted-foreground font-normal mt-0.5 truncate">
                  Código: {prefilledCupomCode}
                </p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="pt-2">
          <CupomValidationCard 
            onCupomUsed={handleCupomUsed}
            prefilledCupomCode={prefilledCupomCode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CupomValidationModal;