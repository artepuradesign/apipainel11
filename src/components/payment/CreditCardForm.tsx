import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, CheckCircle2, X } from 'lucide-react';
import { toast } from "sonner";

interface CreditCardFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ amount, onSuccess, onCancel }) => {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }
    
    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateCard = () => {
    const { number, name, expiry, cvv } = cardData;
    
    if (!number || number.replace(/\s/g, '').length < 16) {
      toast.error("Número do cartão inválido");
      return false;
    }
    
    if (!name.trim()) {
      toast.error("Nome do portador é obrigatório");
      return false;
    }
    
    if (!expiry || expiry.length < 5) {
      toast.error("Data de validade inválida");
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      toast.error("CVV inválido");
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCard()) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const isApproved = Math.random() > 0.1;
      
      setIsProcessing(false);
      
      if (isApproved) {
        toast.success("Pagamento aprovado com sucesso!");
        onSuccess();
      } else {
        toast.error("Pagamento recusado. Tente novamente ou use outro cartão.");
      }
    }, 3000);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      {/* Modal centrado na tela */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 relative animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-purple/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-brand-purple" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pagamento
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                R$ {amount.toFixed(2)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Número do Cartão */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Número do Cartão
            </Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              maxLength={19}
              className="h-10"
              disabled={isProcessing}
            />
          </div>

          {/* Nome do Portador */}
          <div className="space-y-2">
            <Label htmlFor="cardName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome do Portador
            </Label>
            <Input
              id="cardName"
              type="text"
              placeholder="Nome como está no cartão"
              value={cardData.name}
              onChange={(e) => handleInputChange('name', e.target.value.toUpperCase())}
              className="h-10"
              disabled={isProcessing}
            />
          </div>

          {/* Validade e CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardExpiry" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Validade
              </Label>
              <Input
                id="cardExpiry"
                type="text"
                placeholder="MM/AA"
                value={cardData.expiry}
                onChange={(e) => handleInputChange('expiry', e.target.value)}
                maxLength={5}
                className="h-10"
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardCvv" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                CVV
              </Label>
              <Input
                id="cardCvv"
                type="text"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                maxLength={4}
                className="h-10"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Segurança */}
          <div className="flex items-center justify-center space-x-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <Lock className="h-3 w-3" />
            <span>Transação segura com criptografia SSL</span>
          </div>

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-brand-purple hover:bg-brand-darkPurple"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Pagar R$ {amount.toFixed(2)}
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditCardForm;
