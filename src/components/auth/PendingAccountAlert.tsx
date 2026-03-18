import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Clock, Info } from 'lucide-react';

interface PendingAccountAlertProps {
  isOpen: boolean;
  onClose: () => void;
}

const PendingAccountAlert: React.FC<PendingAccountAlertProps> = ({ isOpen, onClose }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            Conta Pendente
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                  <Info className="h-5 w-5" />
                  <span className="font-semibold text-sm">Aguardando Aprovação</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300 leading-relaxed">
                  Sua conta está <strong>pendente de aprovação</strong>. 
                  Aguarde a liberação pelo administrador do sistema.
                </p>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Você será notificado assim que sua conta for aprovada.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            Entendi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PendingAccountAlert;
