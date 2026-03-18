import React from 'react';
import { Send } from 'lucide-react';

const SimpleTelegramButton = () => {
  const telegramUsername = "apipainel_bot";
  
  const handleTelegramClick = () => {
    const telegramUrl = `https://t.me/${telegramUsername}?start=site`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleTelegramClick}
      className="fixed bottom-[90px] right-6 z-50 w-[60px] h-[60px] bg-[#0088cc] rounded-full shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center"
      aria-label="Falar no Telegram"
    >
      <Send className="w-7 h-7 text-white" />
    </button>
  );
};

export default SimpleTelegramButton;
