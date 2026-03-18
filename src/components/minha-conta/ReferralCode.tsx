
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, MessageCircle, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { useBonusConfig } from '@/services/bonusConfigService';

interface ReferralCodeProps {
  codigoIndicacao?: string;
}

const ReferralCode: React.FC<ReferralCodeProps> = ({ 
  codigoIndicacao
}) => {
  const [copied, setCopied] = useState(false);
  const { bonusAmount, isLoading } = useBonusConfig();

  if (!codigoIndicacao) return null;

  const currentDomain = window.location.origin;
  const referralLink = `${currentDomain}/registration?ref=${codigoIndicacao}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Código copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar código');
    }
  };

  const shareViaWhatsApp = () => {
    const message = `🎁 Use meu código de indicação *${codigoIndicacao}* e ganhe R$ ${bonusAmount.toFixed(2)} de bônus!\n\nCadastre-se aqui: ${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaTelegram = () => {
    const message = `🎁 Use meu código de indicação ${codigoIndicacao} e ganhe R$ ${bonusAmount.toFixed(2)} de bônus!\n\nCadastre-se aqui: ${referralLink}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-brand-purple/10 to-purple-100 dark:from-brand-purple/20 dark:to-purple-900/20 rounded-lg">
        <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">Seu Código de Indicação</p>
          <p className="font-bold text-xl text-brand-purple">{codigoIndicacao}</p>
          <p className="text-xs text-gray-500">
            {isLoading ? 'Carregando valor...' : `Compartilhe e ganhem R$ ${bonusAmount.toFixed(2)} cada um!`}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Link de Indicação:</p>
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-600 dark:text-gray-400 break-all">
          {referralLink}
        </div>
      </div>

      <div className="space-y-2">
        <Button
          variant="default"
          onClick={() => copyToClipboard(referralLink)}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Copy className="h-4 w-4 mr-2" />
          {copied ? 'Link Copiado!' : 'Copiar Link de Indicação'}
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={shareViaWhatsApp}
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            onClick={shareViaTelegram}
            className="bg-[#0088cc] hover:bg-[#006699] text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Telegram
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReferralCode;
