
import React from 'react';
import PageLayout from './PageLayout';
import LoadingSpinner from '@/components/ui/loading-spinner';
import TextLogo from '@/components/TextLogo';
import ThemeSwitcher from '@/components/ThemeSwitcher';

interface LoadingScreenProps {
  message?: string;
  variant?: 'auth' | 'dashboard' | 'default';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Carregando...', 
  variant = 'auth' 
}) => {
  return (
    <PageLayout variant={variant} backgroundOpacity="strong" showGradients={false}>
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm relative z-10" data-aos="fade-up">
          <div className="bg-card/95 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-border/30 relative">
            {/* Logo */}
            <div className="mb-8 text-center">
              <TextLogo />
            </div>

            {/* Loading Content */}
            <div className="flex flex-col items-center space-y-6">
              {/* Animated Loading Circle with Gradient Background */}
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-purple/20 to-pink-500/20 rounded-full flex items-center justify-center">
                  <LoadingSpinner size="lg" className="text-brand-purple" />
                </div>
                
                {/* Pulse Effect */}
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-brand-purple/10 to-pink-500/10 rounded-full animate-ping"></div>
              </div>

              {/* Loading Text */}
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {message}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aguarde um momento...
                </p>
              </div>

              {/* Loading Bar Animation */}
              <div className="w-full max-w-xs">
                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-purple to-pink-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default LoadingScreen;
