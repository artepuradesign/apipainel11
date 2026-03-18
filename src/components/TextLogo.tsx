
import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

interface TextLogoProps {
  to?: string;
  className?: string;
  showFullOnMobile?: boolean;
}

const TextLogo = ({ to = "/", className = "", showFullOnMobile = false }: TextLogoProps) => {
  const logoContent = (
    <div className={`flex items-center ${className}`}>
      <Package className="text-brand-purple mr-2 dark:text-purple-400 animate-logo-3d matrix-logo-icon" size={28} />
      {/* Mostrar texto completo em desktop, e em mobile se showFullOnMobile for true */}
      <span className={`${showFullOnMobile ? 'block' : 'hidden md:block'} text-xl font-bold text-brand-purple dark:text-purple-400 matrix-logo-api`}>API</span>
      <span className={`${showFullOnMobile ? 'block' : 'hidden md:block'} text-xl font-bold text-gray-700 dark:text-white matrix-logo-painel`}>Painel</span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default TextLogo;
