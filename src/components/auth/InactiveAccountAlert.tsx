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
import { UserX, AlertTriangle } from 'lucide-react';

interface InactiveAccountAlertProps {
  isOpen: boolean;
  onClose: () => void;
}

const InactiveAccountAlert: React.FC<InactiveAccountAlertProps> = ({ isOpen, onClose }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <UserX className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
            Conta Inativa
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-center">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-orange-700 dark:text-orange-300">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold text-sm">Conta Desativada</span>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-300 leading-relaxed">
                  Sua conta está <strong>inativa</strong>. 
                  Entre em contato com o suporte para solicitar a reativação.
                </p>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Se você acredita que isso é um erro, entre em contato com o suporte.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction 
            onClick={onClose}
            className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
          >
            Entendi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InactiveAccountAlert;
