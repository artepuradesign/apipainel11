
import React from 'react';

const TestimonialBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradiente de fundo principal com transparência para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-gray-50/90 to-white/95 dark:from-gray-900/95 dark:via-gray-950/90 dark:to-gray-900/95"></div>
      
      {/* Elementos animados sutis */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-brand-purple/10 to-purple-500/8 rounded-full blur-3xl animate-pulse-gentle animation-delay-2000"></div>
      <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/8 to-brand-purple/10 rounded-full blur-3xl animate-pulse-gentle animation-delay-4000"></div>
      <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-gradient-to-r from-purple-400/6 to-pink-400/8 rounded-full blur-2xl animate-pulse-gentle animation-delay-6000"></div>
      
      {/* Degradês temáticos nas bordas */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-purple/15 via-purple-500/8 to-transparent dark:from-purple-900/25 dark:via-purple-800/15 dark:to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-500/12 via-brand-purple/6 to-transparent dark:from-blue-900/20 dark:via-purple-900/12 dark:to-transparent"></div>
    </div>
  );
};

export default TestimonialBackground;
