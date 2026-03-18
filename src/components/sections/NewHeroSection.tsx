import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import dashboardMockup from '@/assets/hero-dashboard-mockup.png';

const benefits = [
  { icon: Zap, label: 'Rápido', desc: 'Respostas instantâneas' },
  { icon: ShieldCheck, label: 'Seguro', desc: 'LGPD + criptografia' },
  { icon: BarChart3, label: 'Completo', desc: 'Consultas + módulos empresariais' },
];

const NewHeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] overflow-hidden bg-gradient-to-br from-[hsl(230,40%,12%)] via-[hsl(260,45%,18%)] to-[hsl(280,50%,22%)]">
      {/* Decorative blurs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-16 sm:py-20 lg:py-24">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-bold text-white leading-tight tracking-tight mb-5">
              API Painel — Consultas + Ferramentas para Seu Negócio
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              De CPF em segundos a painéis completos: administração, estoque, vendas e mais. Tudo em um lugar.
            </p>

            {/* Benefits */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-10 justify-center lg:justify-start">
              {benefits.map((b) => (
                <div key={b.label} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 ring-1 ring-white/20 flex items-center justify-center flex-shrink-0">
                    <b.icon className="h-5 w-5 text-purple-300" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white leading-none">{b.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-base px-8"
                onClick={() => navigate('/registration')}
              >
               Cadastre-se!
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8"
                onClick={() => navigate('/planos-publicos')}
              >
                Planos Disponíveis
              </Button>
            </div>
          </motion.div>

          {/* Right: Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(260,45%,18%)] via-transparent to-transparent z-10 rounded-2xl" />
              <img
                src={dashboardMockup}
                alt="Dashboard API Painel com gráficos e consultas CPF/CNPJ"
                className="w-full rounded-2xl shadow-2xl shadow-purple-900/40 border border-white/10"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NewHeroSection;
