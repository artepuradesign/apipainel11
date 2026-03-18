import React from 'react';
import whatsappIcon from '@/assets/whatsapp-icon.svg';

const SimpleWhatsAppButton = () => {
  const phoneNumber = "5598981074836";
  
  const handleWhatsAppClick = () => {
    const defaultMessage = "Olá, pode me ajudar? Estou no site apipainel.com.br";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 w-[60px] h-[60px] rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
      aria-label="Falar no WhatsApp"
    >
      <img 
        src={whatsappIcon} 
        alt="WhatsApp" 
        className="w-full h-full"
      />
    </button>
  );
};

export default SimpleWhatsAppButton;