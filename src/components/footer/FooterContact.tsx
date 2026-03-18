import React from 'react';
import { Mail, Clock, MessageCircle } from 'lucide-react';

const FooterContact: React.FC = () => {
  return (
    <div>
      <h3 className="font-medium text-lg mb-4 dark:text-white">Contato</h3>
      <ul className="space-y-4">
        <li className="group flex items-start hover:transform hover:translate-x-1 transition-all duration-300">
          <div className="flex items-center justify-center w-8 h-8 bg-brand-purple/10 rounded-lg mr-3 shrink-0 group-hover:bg-brand-purple/20 transition-colors duration-300">
            <Mail size={16} className="text-brand-purple dark:text-purple-400" />
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400 text-sm">Email</span>
            <p className="text-gray-800 dark:text-gray-200 font-medium">contato@apipainel.com.br</p>
          </div>
        </li>
        

        <li className="group flex items-start hover:transform hover:translate-x-1 transition-all duration-300">
          <div className="flex items-center justify-center w-8 h-8 bg-brand-purple/10 rounded-lg mr-3 shrink-0 group-hover:bg-brand-purple/20 transition-colors duration-300">
            <Clock size={16} className="text-brand-purple dark:text-purple-400" />
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400 text-sm">Suporte</span>
            <p className="text-gray-800 dark:text-gray-200 font-medium">24h/7 dias</p>
          </div>
        </li>
      </ul>
    </div>
  );
};
export default FooterContact;