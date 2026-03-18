
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { ReferralConfig } from '@/services/systemConfigService';

interface ReferralLinkCardProps {
  referralCode: string;
  referralLink: string;
  config: ReferralConfig;
}

const ReferralLinkCard: React.FC<ReferralLinkCardProps> = ({ 
  referralCode, 
  referralLink, 
  config 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success(`${type} copiado com sucesso!`);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Erro ao copiar');
    });
  };

  const shareOnWhatsApp = () => {
    const message = `🚀 Descubra a APIPanel - A melhor plataforma de consultas do Brasil!

💡 Consulte CPF, CNPJ, Veículos e muito mais com dados atualizados
💰 Preços acessíveis e planos com desconto
🔒 Segurança e confiabilidade garantidas
🎁 Ganhe R$ ${config.referral_bonus_amount.toFixed(2)} de bônus ao se cadastrar com meu código!

Use meu código de indicação: ${referralCode}

Cadastre-se agora: ${referralLink}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnTelegram = () => {
    const message = `🚀 Descubra a APIPanel - A melhor plataforma de consultas do Brasil!

💡 Consulte CPF, CNPJ, Veículos e muito mais
💰 Preços acessíveis e planos com desconto  
🎁 Ganhe R$ ${config.referral_bonus_amount.toFixed(2)} de bônus!

Código: ${referralCode}
Link: ${referralLink}`;

    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareOnInstagram = () => {
    copyToClipboard(referralLink, 'Link para Instagram');
    toast.info('Link copiado! Cole no Instagram Stories ou posts');
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-800 dark:text-gray-100">
          <Share2 className="mr-2 h-5 w-5" />
          Seu Link de Indicação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Código de Indicação</label>
          <div className="flex space-x-2">
            <Input
              value={referralCode}
              readOnly
              className="font-mono bg-gray-50 dark:bg-gray-700"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(referralCode, 'Código')}
              className="px-3"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Link Completo</label>
          <div className="flex space-x-2">
            <Input
              value={referralLink}
              readOnly
              className="text-xs bg-gray-50 dark:bg-gray-700"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(referralLink, 'Link')}
              className="px-3"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button
          onClick={shareOnWhatsApp}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Compartilhar no WhatsApp
        </Button>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            Compartilhar em outras redes sociais
          </p>
          <div className="grid grid-cols-4 gap-3">
            {/* Facebook */}
            <Button
              variant="outline"
              size="sm"
              onClick={shareOnFacebook}
              className="p-3 h-auto flex flex-col items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            >
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-xs">Facebook</span>
            </Button>

            {/* Instagram */}
            <Button
              variant="outline"
              size="sm"
              onClick={shareOnInstagram}
              className="p-3 h-auto flex flex-col items-center gap-1 hover:bg-pink-50 dark:hover:bg-pink-900/20 border-pink-200 dark:border-pink-800"
            >
              <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.059 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-xs">Instagram</span>
            </Button>

            {/* Telegram */}
            <Button
              variant="outline"
              size="sm"
              onClick={shareOnTelegram}
              className="p-3 h-auto flex flex-col items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            >
              <Send className="w-5 h-5 text-blue-500" />
              <span className="text-xs">Telegram</span>
            </Button>

            {/* WhatsApp */}
            <Button
              variant="outline"
              size="sm"
              onClick={shareOnWhatsApp}
              className="p-3 h-auto flex flex-col items-center gap-1 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800"
            >
              <MessageCircle className="w-5 h-5 text-green-500" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralLinkCard;
