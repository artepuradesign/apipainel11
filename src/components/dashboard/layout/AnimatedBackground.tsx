
import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 w-full h-full">
        {/* Gradiente de fundo principal */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 dark:from-purple-900 dark:via-pink-900 dark:to-indigo-900"></div>
        
        {/* Gradiente adicional para profundidade */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-purple-100/20 to-pink-100/10 dark:from-transparent dark:via-purple-900/20 dark:to-pink-900/10"></div>
        
        {/* Elementos animados flutuantes - cores mais vibrantes */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/70 via-pink-400/70 to-red-400/70 dark:from-purple-400/90 dark:via-pink-400/90 dark:to-red-400/90 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-80 dark:opacity-95 animate-pulse-gentle animation-delay-2000"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/70 via-cyan-400/70 to-teal-400/70 dark:from-blue-400/90 dark:via-cyan-400/90 dark:to-teal-400/90 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-80 dark:opacity-95 animate-pulse-gentle animation-delay-4000"></div>
        <div className="absolute top-40 left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/70 via-purple-400/70 to-pink-400/70 dark:from-indigo-400/90 dark:via-purple-400/90 dark:to-pink-400/90 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-80 dark:opacity-95 animate-pulse-gentle animation-delay-6000"></div>
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-gradient-to-br from-emerald-400/75 via-green-400/75 to-lime-400/75 dark:from-emerald-400/90 dark:via-green-400/90 dark:to-lime-400/90 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-85 dark:opacity-95 animate-pulse-gentle animation-delay-3000"></div>
        <div className="absolute bottom-1/3 left-1/2 w-88 h-88 bg-gradient-to-br from-yellow-400/75 via-orange-400/75 to-red-400/75 dark:from-yellow-400/90 dark:via-orange-400/90 dark:to-red-400/90 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-85 dark:opacity-95 animate-pulse-gentle animation-delay-5000"></div>
      </div>
    </div>
  );
};

export default AnimatedBackground;
