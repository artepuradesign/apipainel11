import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch, LayoutDashboard, Code2, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const cards = [
  {
    icon: FileSearch,
    title: 'Consultas CPF/CNPJ',
    desc: 'Rápidas e completas',
    link: '/planos-publicos',
    gradient: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/25',
    iconColor: 'text-violet-500',
    ringColor: 'ring-violet-500/30',
    glowBg: 'bg-violet-500/20',
  },
  {
    icon: LayoutDashboard,
    title: 'Módulos empresariais',
    desc: 'Administre estoque, vendas, clientes',
    link: '/planos-publicos',
    gradient: 'from-blue-500 to-cyan-500',
    shadowColor: 'shadow-blue-500/25',
    iconColor: 'text-blue-500',
    ringColor: 'ring-blue-500/30',
    glowBg: 'bg-blue-500/20',
  },
  {
    icon: Code2,
    title: 'API própria',
    desc: 'Integre no seu app',
    link: '/api',
    gradient: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/25',
    iconColor: 'text-emerald-500',
    ringColor: 'ring-emerald-500/30',
    glowBg: 'bg-emerald-500/20',
  },
  {
    icon: Car,
    title: 'Veículos & Marketplace',
    desc: 'Em breve: placa, RENAVAM + anúncios',
    link: null,
    badge: 'Em breve',
    gradient: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/25',
    iconColor: 'text-amber-500',
    ringColor: 'ring-amber-500/30',
    glowBg: 'bg-amber-500/20',
  },
];

const WhatYouGetSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-background via-card/30 to-background border-y border-border/30">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Recursos
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            O que você ganha
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Tudo o que sua empresa precisa em uma só plataforma
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className={`group relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 cursor-pointer overflow-hidden
                border border-border/50 hover:border-transparent
                shadow-sm hover:shadow-xl hover:${card.shadowColor}
                ring-1 ring-transparent hover:${card.ringColor}
                transition-all duration-300`}
              onClick={() => card.link && navigate(card.link)}
            >
              {/* Gradient border overlay on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />
              
              {/* Background glow */}
              <div className={`absolute -top-16 -right-16 w-40 h-40 ${card.glowBg} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />

              {card.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30">
                  {card.badge}
                </span>
              )}

              {/* Icon with gradient background */}
              <div className={`relative h-14 w-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                <card.icon className="h-7 w-7 text-white relative z-10" />
              </div>

              <h3 className="font-bold text-foreground text-lg mb-1.5 relative z-10">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 relative z-10">{card.desc}</p>

              {card.link && (
                <span className={`inline-flex items-center text-xs font-semibold ${card.iconColor} group-hover:gap-2 gap-1 transition-all relative z-10`}>
                  Saiba mais
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatYouGetSection;
