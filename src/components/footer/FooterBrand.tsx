
import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface FooterBrandProps {
  handleLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId?: string) => void;
}

const FooterBrand: React.FC<FooterBrandProps> = ({ handleLinkClick }) => {
  return (
    <div>
      <div className="mb-4">
        <Link to="/" className="flex items-center" onClick={(e) => handleLinkClick(e)}>
          <Package className="text-brand-purple mr-2 text-2xl dark:text-purple-400" size={28} />
          <span className="text-xl font-bold text-brand-purple dark:text-purple-400">API</span>
          <span className="text-xl font-bold text-gray-700 dark:text-white">Painel</span>
        </Link>
      </div>
      <p className="text-gray-600 mb-6 dark:text-gray-400 leading-relaxed">
        Plataforma completa para consulta de CPF e CNPJ com APIs integradas para empresas de todos os portes. Tecnologia de ponta e segurança máxima.
      </p>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">+50.000 consultas realizadas hoje</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">99.9% de uptime garantido</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <a href="#" className="group flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-brand-purple hover:shadow-lg hover:shadow-brand-purple/25 transition-all duration-300 cursor-pointer">
          <Facebook size={18} className="text-gray-500 group-hover:text-white transition-colors duration-300" />
        </a>
        <a href="#" className="group flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-brand-purple hover:shadow-lg hover:shadow-brand-purple/25 transition-all duration-300 cursor-pointer">
          <Twitter size={18} className="text-gray-500 group-hover:text-white transition-colors duration-300" />
        </a>
        <a href="#" className="group flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-brand-purple hover:shadow-lg hover:shadow-brand-purple/25 transition-all duration-300 cursor-pointer">
          <Instagram size={18} className="text-gray-500 group-hover:text-white transition-colors duration-300" />
        </a>
        <a href="#" className="group flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-brand-purple hover:shadow-lg hover:shadow-brand-purple/25 transition-all duration-300 cursor-pointer">
          <Linkedin size={18} className="text-gray-500 group-hover:text-white transition-colors duration-300" />
        </a>
      </div>
    </div>
  );
};

export default FooterBrand;
