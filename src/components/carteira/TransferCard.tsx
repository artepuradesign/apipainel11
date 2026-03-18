
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from 'lucide-react';
import { toast } from "sonner";

interface TransferCardProps {
  userBalance: number;
  onTransferRequest: (recipientId: string, amount: number) => void;
  isProcessing: boolean;
}

const TransferCard: React.FC<TransferCardProps> = ({
  userBalance,
  onTransferRequest,
  isProcessing
}) => {
  const [recipientId, setRecipientId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const handleTransferClick = () => {
    if (!recipientId || !transferAmount) {
      toast.error("Por favor, preencha o ID do destinatário e o valor");
      return;
    }
    
    const amount = parseFloat(transferAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Por favor, insira um valor válido");
      return;
    }
    
    if (amount > userBalance) {
      toast.error("Saldo insuficiente para realizar a transferência");
      return;
    }
    
    onTransferRequest(recipientId, amount);
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-base sm:text-lg">
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          Transferir Saldo
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
          Envie saldo para outro usuário
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="recipient-id" className="text-gray-700 dark:text-gray-300 text-sm">ID do Destinatário</Label>
          <Input
            id="recipient-id"
            placeholder="Digite o ID"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="transfer-amount" className="text-gray-700 dark:text-gray-300 text-sm">Valor</Label>
          <Input
            id="transfer-amount"
            placeholder="R$ 0,00"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
          />
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-6 pt-0">
        <Button 
          className="w-full bg-brand-purple hover:bg-brand-darkPurple text-sm sm:text-base" 
          onClick={handleTransferClick}
          disabled={isProcessing}
        >
          <Send className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processando...' : 'Transferir'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TransferCard;
