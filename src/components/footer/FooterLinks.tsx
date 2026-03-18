import React from 'react';
import { Link } from 'react-router-dom';
interface FooterLinksProps {
  handleLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId?: string) => void;
}
const FooterLinks: React.FC<FooterLinksProps> = ({
  handleLinkClick
}) => {
  return <div>
      <h3 className="font-medium text-lg mb-4 dark:text-white">Links Rápidos</h3>
      <ul className="space-y-3">
        <li>
          <Link to="/docs" className="group flex items-center text-gray-600 hover:text-brand-purple transition-all duration-300 dark:text-gray-400 dark:hover:text-purple-400" onClick={e => handleLinkClick(e)}>
            <span className="w-1 h-1 bg-brand-purple rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            Documentação
          </Link>
        </li>
        <li>
          <Link to="/pricing" className="group flex items-center text-gray-600 hover:text-brand-purple transition-all duration-300 dark:text-gray-400 dark:hover:text-purple-400" onClick={e => handleLinkClick(e)}>
            <span className="w-1 h-1 bg-brand-purple rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            Planos
          </Link>
        </li>
        <li>
          <Link to="/api" className="group flex items-center text-gray-600 hover:text-brand-purple transition-all duration-300 dark:text-gray-400 dark:hover:text-purple-400" onClick={e => handleLinkClick(e)}>
            <span className="w-1 h-1 bg-brand-purple rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            API
          </Link>
        </li>
        <li>
          <Link to="/dashboard/suporte" className="group flex items-center text-gray-600 hover:text-brand-purple transition-all duration-300 dark:text-gray-400 dark:hover:text-purple-400" onClick={e => handleLinkClick(e)}>
            <span className="w-1 h-1 bg-brand-purple rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            Suporte
          </Link>
        </li>
      </ul>
    </div>;
};
export default FooterLinks;