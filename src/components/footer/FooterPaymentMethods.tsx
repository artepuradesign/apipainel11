import React from 'react';
import { CreditCard, Shield, Lock, Award, Zap } from 'lucide-react';

const FooterPaymentMethods: React.FC = () => {
  return (
    <div>
      <h3 className="font-medium text-lg mb-4 dark:text-white">Recursos</h3>
      
      <div className="space-y-3">
        <div className="group p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-semibold text-green-800 dark:text-green-300">100% Seguro</span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
            Criptografia SSL de ponta a ponta
          </p>
        </div>


        <div className="group p-3 bg-gradient-to-r from-purple-50/80 to-violet-50/80 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">Certificado</span>
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed">
            Conformidade LGPD
          </p>
        </div>
      </div>
    </div>
  );
};

export default FooterPaymentMethods;