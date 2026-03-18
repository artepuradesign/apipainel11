
import React from 'react';
import PixQRCodeModal from '@/components/payment/PixQRCodeModal';
import CreditCardModal from '@/components/payment/CreditCardModal';
import BankTransferModal from '@/components/payment/BankTransferModal';
import PayPalModal from '@/components/payment/PayPalModal';
import CryptoModal from '@/components/payment/CryptoModal';

interface PaymentModalsProps {
  showPixModal: boolean;
  showCreditModal: boolean;
  showBankTransferModal: boolean;
  showPayPalModal: boolean;
  showCryptoModal: boolean;
  finalAmountWithDiscount: number;
  isProcessing: boolean;
  onClosePixModal: () => void;
  onCloseCreditModal: () => void;
  onCloseBankTransferModal: () => void;
  onClosePayPalModal: () => void;
  onCloseCryptoModal: () => void;
  onPaymentConfirm: () => void;
}

const PaymentModals: React.FC<PaymentModalsProps> = ({
  showPixModal,
  showCreditModal,
  showBankTransferModal,
  showPayPalModal,
  showCryptoModal,
  finalAmountWithDiscount,
  isProcessing,
  onClosePixModal,
  onCloseCreditModal,
  onCloseBankTransferModal,
  onClosePayPalModal,
  onCloseCryptoModal,
  onPaymentConfirm
}) => {
  return (
    <>
      <PixQRCodeModal
        isOpen={showPixModal}
        onClose={onClosePixModal}
        amount={finalAmountWithDiscount}
        onPaymentConfirm={onPaymentConfirm}
        isProcessing={isProcessing}
      />

      <CreditCardModal
        isOpen={showCreditModal}
        onClose={onCloseCreditModal}
        amount={finalAmountWithDiscount}
        onPaymentConfirm={onPaymentConfirm}
        isProcessing={isProcessing}
      />

      <BankTransferModal
        isOpen={showBankTransferModal}
        onClose={onCloseBankTransferModal}
        amount={finalAmountWithDiscount}
        onPaymentConfirm={onPaymentConfirm}
        isProcessing={isProcessing}
      />

      <PayPalModal
        isOpen={showPayPalModal}
        onClose={onClosePayPalModal}
        amount={finalAmountWithDiscount}
        onPaymentConfirm={onPaymentConfirm}
        isProcessing={isProcessing}
      />

      <CryptoModal
        isOpen={showCryptoModal}
        onClose={onCloseCryptoModal}
        amount={finalAmountWithDiscount}
        onPaymentConfirm={onPaymentConfirm}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default PaymentModals;
