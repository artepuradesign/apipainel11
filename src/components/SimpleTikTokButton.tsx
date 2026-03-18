import React from 'react';

const SimpleTikTokButton = () => {
  const tiktokUsername = "apipainel";
  
  const handleTikTokClick = () => {
    const tiktokUrl = `https://www.tiktok.com/@${tiktokUsername}`;
    window.open(tiktokUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleTikTokClick}
      className="fixed right-6 z-50 bg-black hover:bg-gray-900 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      style={{ bottom: '258px' }}
      aria-label="Siga no TikTok"
    >
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
      
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Siga no TikTok
      </span>
    </button>
  );
};

export default SimpleTikTokButton;
