import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, Clock, Shield, Award, Facebook, Twitter, Instagram, Lock } from 'lucide-react';
import footerBg from '@/assets/footer-bg.png';
import { Locale, useLocale } from '@/contexts/LocaleContext';

const footerContent: Record<Locale, {
  description: string;
  quickLinks: string;
  contact: string;
  resources: string;
  plansDesc: string;
  supportDesc: string;
  support: string;
  emailLabel: string;
  supportLabel: string;
  supportHours: string;
  secure: string;
  certified: string;
  compliance: string;
  rights: string;
  privacy: string;
  terms: string;
}> = {
  'pt-BR': {
    description: 'Dados obtidos de fontes oficiais e atualizadas, sempre com privacidade em primeiro lugar.',
    quickLinks: 'Links Rápidos',
    contact: 'Contato',
    resources: 'Recursos',
    plansDesc: 'Escolha o ideal',
    supportDesc: 'Ajuda especializada',
    support: 'Suporte',
    emailLabel: 'Email',
    supportLabel: 'Suporte',
    supportHours: '24h/7 dias',
    secure: '100% Seguro',
    certified: 'Certificado',
    compliance: 'Conformidade LGPD',
    rights: 'Todos os direitos reservados.',
    privacy: 'Privacidade',
    terms: 'Termos',
  },
  en: {
    description: 'Data from official and updated sources, always with privacy first.',
    quickLinks: 'Quick Links',
    contact: 'Contact',
    resources: 'Resources',
    plansDesc: 'Choose the right one',
    supportDesc: 'Specialized help',
    support: 'Support',
    emailLabel: 'Email',
    supportLabel: 'Support',
    supportHours: '24h/7 days',
    secure: '100% Secure',
    certified: 'Certified',
    compliance: 'Data compliance',
    rights: 'All rights reserved.',
    privacy: 'Privacy',
    terms: 'Terms',
  },
  es: {
    description: 'Datos obtenidos de fuentes oficiales y actualizadas, siempre con la privacidad en primer lugar.',
    quickLinks: 'Enlaces rápidos',
    contact: 'Contacto',
    resources: 'Recursos',
    plansDesc: 'Elige el ideal',
    supportDesc: 'Ayuda especializada',
    support: 'Soporte',
    emailLabel: 'Email',
    supportLabel: 'Soporte',
    supportHours: '24h/7 días',
    secure: '100% Seguro',
    certified: 'Certificado',
    compliance: 'Cumplimiento normativo',
    rights: 'Todos los derechos reservados.',
    privacy: 'Privacidad',
    terms: 'Términos',
  },
};

const FuturisticFooter = () => {
  const { locale } = useLocale();
  const content = footerContent[locale];

  return (
    <footer className="relative w-full overflow-hidden">
      <div className="absolute inset-0">
        <img src={footerBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent shadow-[0_0_20px_rgba(217,70,239,0.6)]" />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center mb-3 group">
                <Package className="text-fuchsia-400 mr-2 group-hover:text-cyan-400 transition-colors duration-500" size={28} />
                <span className="text-xl font-bold text-fuchsia-400 group-hover:text-cyan-400 transition-colors duration-500">API</span>
                <span className="text-xl font-bold text-white">Painel</span>
              </Link>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                {content.description}
              </p>
              <div className="flex gap-2">
                {[Facebook, Twitter, Instagram].map((Icon, i) => (
                  <a key={i} href="#" className="group/icon flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/50 transition-all duration-300">
                    <Icon size={16} className="text-gray-400 group-hover/icon:text-fuchsia-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                {content.quickLinks}
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Award, label: 'Planos', desc: content.plansDesc, to: '/pricing', color: 'fuchsia' },
                  { icon: Shield, label: content.support, desc: content.supportDesc, to: '/dashboard/suporte', color: 'cyan' },
                ].map((item, i) => (
                  <Link key={i} to={item.to} className="group flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.06] dark:hover:border-white/10 transition-all duration-300">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-md bg-${item.color}-500/10`}>
                      <item.icon size={14} className={`text-${item.color}-400`} />
                    </div>
                    <div>
                      <span className="text-gray-800 dark:text-white text-sm font-medium">{item.label}</span>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.6)]" />
                {content.contact}
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Mail, label: content.emailLabel, desc: 'contato@apipainel.com.br', color: 'fuchsia' },
                  { icon: Clock, label: content.supportLabel, desc: content.supportHours, color: 'cyan' },
                ].map((item, i) => (
                  <div key={i} className="group flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.06] dark:hover:border-white/10 transition-all duration-300">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-md bg-${item.color}-500/10`}>
                      <item.icon size={14} className={`text-${item.color}-400`} />
                    </div>
                    <div>
                      <span className="text-gray-800 dark:text-white text-sm font-medium">{item.label}</span>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                {content.resources}
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Shield, label: content.secure, desc: 'SSL', color: 'emerald' },
                  { icon: Award, label: content.certified, desc: content.compliance, color: 'fuchsia' },
                ].map((item, i) => (
                  <div key={i} className="group flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.06] dark:hover:border-white/10 transition-all duration-300">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-md bg-${item.color}-500/10`}>
                      <item.icon size={14} className={`text-${item.color}-400`} />
                    </div>
                    <div>
                      <span className="text-gray-800 dark:text-white text-sm font-medium">{item.label}</span>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} APIPainel. {content.rights}
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">{content.privacy}</Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">{content.terms}</Link>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Lock size={10} />
                SSL Secured
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FuturisticFooter;
