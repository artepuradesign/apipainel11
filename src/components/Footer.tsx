
import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/dashboard/AnimatedBackground';
import FooterBrand from './footer/FooterBrand';
import FooterContact from './footer/FooterContact';
import FooterPaymentMethods from './footer/FooterPaymentMethods';
import NewsletterForm from './newsletter/NewsletterForm';


const Footer = () => {
  // Function to scroll to top when clicking links
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId?: string) => {
    if (!targetId) {
      // If no targetId, just scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Check if we're already on the page with the target element
    const element = document.getElementById(targetId);
    if (element) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(() => {
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-700 dark:text-gray-300 overflow-hidden">
      {/* Fundo animado colorido igual ao da tela de login */}
      <AnimatedBackground />
      
      {/* Gradiente decorativo superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent"></div>
      
      {/* Efeitos decorativos */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-brand-purple/5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16 sm:py-20">
        {/* Header do rodapé */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Conecte-se com a <span className="text-brand-purple">APIPainel</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Junte-se a milhares de empresas que confiam em nossa plataforma para consultas seguras e eficientes
          </p>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 mb-12">
          <div className="lg:col-span-1">
            <FooterBrand handleLinkClick={handleLinkClick} />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-300">
            <FooterContact />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-300">
            <FooterPaymentMethods />
          </div>
        </div>

        
        {/* Footer bottom */}
        <div className="text-center pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="text-gray-500 text-sm dark:text-gray-400">
            © 2026 APIPainel. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
