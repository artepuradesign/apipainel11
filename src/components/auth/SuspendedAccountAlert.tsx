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
import { ShieldX, AlertTriangle } from 'lucide-react';

interface SuspendedAccountAlertProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuspendedAccountAlert: React.FC<SuspendedAccountAlertProps> = ({ isOpen, onClose }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
            Conta Suspensa
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-center">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-300">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold text-sm">Acesso Bloqueado</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300 leading-relaxed">
                  Sua conta foi <strong>suspensa por tempo indeterminado</strong>. 
                  O acesso ao sistema está temporariamente bloqueado.
                </p>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Se você acredita que isso é um erro ou deseja mais informações, 
                  entre em contato com o suporte.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Não é possível realizar login enquanto a conta estiver suspensa.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
          >
            Entendi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SuspendedAccountAlert;
