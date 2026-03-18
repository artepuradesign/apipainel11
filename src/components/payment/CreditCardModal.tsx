import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Shield } from 'lucide-react';

interface CardPaymentFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardName: string;
}

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentConfirm: (cardData?: CardPaymentFormData) => void | Promise<void>;
  isProcessing: boolean;
}

const CreditCardModal: React.FC<CreditCardModalProps> = ({
  isOpen,
  onClose,
  amount,
  onPaymentConfirm,
  isProcessing
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardName('');
    }
  }, [isOpen]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const isFormValid = () => {
    const [month, year] = expiryDate.split('/');
    const validMonth = Number(month) >= 1 && Number(month) <= 12;
    const validYear = Number(year) >= 0;

    return cardNumber.replace(/\s/g, '').length >= 13 &&
      expiryDate.length === 5 &&
      validMonth &&
      validYear &&
      cvv.length >= 3 &&
      cardName.trim().length > 2;
  };

  const handleConfirm = () => {
    if (!isFormValid()) {
      return;
    }

    const [month, year] = expiryDate.split('/');

    onPaymentConfirm({
      cardNumber,
      expiryMonth: month,
      expiryYear: `20${year}`,
      cvv,
      cardName: cardName.trim().toUpperCase()
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Cartão de Crédito
              </h2>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(amount)}
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Shield className="w-3 h-3 mr-1" />
              Seguro
            </Badge>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="flex justify-center">
                <div className="w-32 h-20 bg-primary rounded-lg shadow-sm border border-border flex items-center justify-center relative overflow-hidden">
                  <div className="text-center">
                    <CreditCard className="w-12 h-12 mx-auto text-primary-foreground" />
                  </div>
                  <div className="absolute bottom-1 right-2 text-xs text-primary-foreground/90 font-mono">
                    {cardNumber.slice(-4) || '****'}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Processamento Seguro
                  </span>
                </div>
                <p className="text-sm text-foreground font-medium">
                  SSL 256-bit
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dados protegidos
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber" className="text-sm font-medium">
                Número do Cartão
              </Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="expiryDate" className="text-sm font-medium">
                  Validade
                </Label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/AA"
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cvv" className="text-sm font-medium">
                  CVV
                </Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={handleCvvChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cardName" className="text-sm font-medium">
                Nome no Cartão
              </Label>
              <Input
                id="cardName"
                type="text"
                placeholder="NOME COMPLETO"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing || !isFormValid()}
              className="flex-1"
            >
              {isProcessing ? 'Processando...' : 'Pagar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditCardModal;
