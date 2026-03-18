
import React from 'react';
import GlobalAnimatedBackground from './GlobalAnimatedBackground';

interface PageLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'landing' | 'dashboard' | 'auth';
  backgroundOpacity?: 'light' | 'medium' | 'strong';
  showGradients?: boolean;
  className?: string;
}

const PageLayout = ({ 
  children, 
  variant = 'default',
  backgroundOpacity = 'medium',
  showGradients = true,
  className = ''
}: PageLayoutProps) => {
  const isDashboard = variant === 'dashboard';
  
  return (
    <div className={`min-h-screen relative ${isDashboard ? 'dashboard-page' : ''} ${className}`}>
      {/* Overlay de gradiente suave (mesmo estilo do /login) */}
      {variant === 'auth' && (
        <div className="fixed inset-0 auth-gradient-light dark:auth-gradient-dark pointer-events-none z-0" aria-hidden="true" />
      )}

      {/* Fundo animado global */}
      <GlobalAnimatedBackground variant={variant} opacity={backgroundOpacity} />

      {/* Degradês opcionais */}
      {showGradients && !isDashboard && (
        <>
          {/* Degradê superior - escuro para transparente */}
          <div className="fixed top-0 left-0 w-full h-96 z-10 site-gradient-top dark:site-gradient-top-dark pointer-events-none"></div>

          {/* Degradê inferior - transparente para escuro */}
          <div className="fixed bottom-0 left-0 w-full h-96 z-10 site-gradient-bottom dark:site-gradient-bottom-dark pointer-events-none"></div>
        </>
      )}

      {/* Conteúdo principal */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
