
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
import { Gift } from 'lucide-react';
import { toast } from "sonner";

interface GiftCardProps {
  userBalance: number;
  onGiftRequest: (recipientId: string, amount: number) => void;
  isProcessing: boolean;
  formatBrazilianCurrency: (value: number) => string;
}

const GiftCard: React.FC<GiftCardProps> = ({
  userBalance,
  onGiftRequest,
  isProcessing,
  formatBrazilianCurrency
}) => {
  const [giftRecipientId, setGiftRecipientId] = useState('');

  const handleGiftClick = (amount: number) => {
    if (!giftRecipientId) {
      toast.error("Por favor, preencha o ID do destinatário");
      return;
    }
    
    if (amount > userBalance) {
      toast.error("Saldo insuficiente para enviar o Gift Card");
      return;
    }
    
    onGiftRequest(giftRecipientId, amount);
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-base sm:text-lg">
          <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
          Enviar Gift Card
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
          Envie gift cards para outros usuários
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="gift-recipient-id" className="text-gray-700 dark:text-gray-300 text-sm">ID do Destinatário</Label>
          <Input
            id="gift-recipient-id"
            placeholder="Digite o ID"
            value={giftRecipientId}
            onChange={(e) => setGiftRecipientId(e.target.value)}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline"
            onClick={() => handleGiftClick(50)}
            disabled={isProcessing}
            className="h-10 sm:h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm sm:text-base"
          >
            <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> {formatBrazilianCurrency(50)}
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleGiftClick(100)}
            disabled={isProcessing}
            className="h-10 sm:h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm sm:text-base"
          >
            <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> {formatBrazilianCurrency(100)}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-6 pt-0">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-full text-center">
          Selecione um valor de Gift Card
        </p>
      </CardFooter>
    </Card>
  );
};

export default GiftCard;
