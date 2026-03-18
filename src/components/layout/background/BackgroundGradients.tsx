
import React from 'react';

const BackgroundGradients: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full theme-matrix-hide">
      {/* Gradiente de fundo principal */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 dark:from-purple-900 dark:via-pink-900 dark:to-indigo-900" />
      
      {/* Gradiente adicional para profundidade */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-purple-100/20 to-pink-100/10 dark:from-transparent dark:via-purple-900/20 dark:to-pink-900/10" />
    </div>
  );
};

export default BackgroundGradients;
