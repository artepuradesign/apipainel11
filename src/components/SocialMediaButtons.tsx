import React, { useState, useRef, useEffect } from 'react';
import whatsappIcon from '@/assets/whatsapp-icon.svg';
import { Send } from 'lucide-react';
import { socialContactsService, SocialContacts } from '@/services/socialContactsService';

const SocialMediaButtons = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contacts, setContacts] = useState<SocialContacts | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Buscar contatos da API
  useEffect(() => {
    socialContactsService.getContacts().then(setContacts);
  }, []);

  // Detectar cliques fora do componente para recolher
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleWhatsAppClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    } else if (contacts) {
      const whatsappUrl = `https://wa.me/${contacts.whatsapp_number}?text=${encodeURIComponent(contacts.whatsapp_message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTelegramClick = () => {
    if (contacts) {
      window.open(`https://t.me/${contacts.telegram_username}?start=site`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleInstagramClick = () => {
    if (contacts) {
      window.open(`https://www.instagram.com/${contacts.instagram_username}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTikTokClick = () => {
    if (contacts) {
      window.open(`https://www.tiktok.com/@${contacts.tiktok_username}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Não renderizar até carregar os contatos
  if (!contacts) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3"
    >
      {/* TikTok Button */}
      {contacts.tiktok_enabled && (
        <button
          onClick={handleTikTokClick}
          className={`w-10 h-10 sm:w-12 sm:h-12 bg-black hover:bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center group transition-all duration-500 ease-out ${
            isExpanded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
          }`}
          aria-label="Siga no TikTok"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
          <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black text-white px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Siga no TikTok
          </span>
        </button>
      )}

      {/* Instagram Button */}
      {contacts.instagram_enabled && (
        <button
          onClick={handleInstagramClick}
          className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center group transition-all duration-500 ease-out ${
            isExpanded ? 'opacity-100 translate-y-0 scale-100 delay-75' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
          }`}
          aria-label="Siga no Instagram"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.059 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Siga no Instagram
          </span>
        </button>
      )}

      {/* Telegram Button */}
      {contacts.telegram_enabled && (
        <button
          onClick={handleTelegramClick}
          className={`w-10 h-10 sm:w-12 sm:h-12 bg-[#0088cc] hover:bg-[#007ab8] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center group transition-all duration-500 ease-out ${
            isExpanded ? 'opacity-100 translate-y-0 scale-100 delay-150' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
          }`}
          aria-label="Suporte Via Telegram"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-[#0088cc] text-white px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Suporte Via Telegram
          </span>
        </button>
      )}

      {/* WhatsApp Button - Always Visible */}
      {contacts.whatsapp_enabled && (
        <button
          onClick={handleWhatsAppClick}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.06] group relative"
          aria-label="Suporte Humanizado"
        >
          <img src={whatsappIcon} alt="WhatsApp" className="w-full h-full" />
          <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-[#25D366] text-white px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {isExpanded ? 'Abrir WhatsApp' : 'Clique para expandir'}
          </span>
        </button>
      )}
    </div>
  );
};

export default SocialMediaButtons;
