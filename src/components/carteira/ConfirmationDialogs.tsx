
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import UserVerification from './UserVerification';
import { checkUserExists } from '@/utils/historicoUtils';

interface ConfirmationDialogsProps {
  showTransferConfirm: boolean;
  setShowTransferConfirm: (show: boolean) => void;
  showGiftConfirm: boolean;
  setShowGiftConfirm: (show: boolean) => void;
  transferAmount: string;
  recipientId: string;
  pendingGiftAmount: number;
  giftRecipientId: string;
  confirmTransfer: () => void;
  confirmGift: () => void;
  formatBrazilianCurrency: (value: number) => string;
}

const ConfirmationDialogs: React.FC<ConfirmationDialogsProps> = ({
  showTransferConfirm,
  setShowTransferConfirm,
  showGiftConfirm,
  setShowGiftConfirm,
  transferAmount,
  recipientId,
  pendingGiftAmount,
  giftRecipientId,
  confirmTransfer,
  confirmGift,
  formatBrazilianCurrency
}) => {
  const [transferUserInfo, setTransferUserInfo] = useState<any>(null);
  const [giftUserInfo, setGiftUserInfo] = useState<any>(null);

  useEffect(() => {
    if (showTransferConfirm && recipientId) {
      const userInfo = checkUserExists(recipientId);
      setTransferUserInfo(userInfo);
    }
  }, [showTransferConfirm, recipientId]);

  useEffect(() => {
    if (showGiftConfirm && giftRecipientId) {
      const userInfo = checkUserExists(giftRecipientId);
      setGiftUserInfo(userInfo);
    }
  }, [showGiftConfirm, giftRecipientId]);

  return (
    <>
      <AlertDialog open={showTransferConfirm} onOpenChange={setShowTransferConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Transferência</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Você está prestes a transferir <strong>{formatBrazilianCurrency(parseFloat(transferAmount || '0'))}</strong> para:
                </p>
                
                {transferUserInfo && <UserVerification userInfo={transferUserInfo} />}
                
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  ⚠️ Esta ação não pode ser desfeita após a confirmação!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmTransfer} 
              className="bg-brand-purple hover:bg-brand-darkPurple"
              disabled={!transferUserInfo?.exists}
            >
              Confirmar Transferência
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showGiftConfirm} onOpenChange={setShowGiftConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Envio de Gift Card</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Você está prestes a enviar um Gift Card de <strong>{formatBrazilianCurrency(pendingGiftAmount)}</strong> para:
                </p>
                
                {giftUserInfo && <UserVerification userInfo={giftUserInfo} />}
                
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  ⚠️ Esta ação não pode ser desfeita após a confirmação!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmGift} 
              className="bg-brand-purple hover:bg-brand-darkPurple"
              disabled={!giftUserInfo?.exists}
            >
              Confirmar Envio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConfirmationDialogs;
