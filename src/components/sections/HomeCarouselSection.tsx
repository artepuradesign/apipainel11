import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search, ArrowRight, Zap, ShieldCheck, FileSearch, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteTheme } from "@/contexts/SiteThemeContext";
import { Locale, useLocale } from "@/contexts/LocaleContext";

import slide01 from "@/assets/home-carousel-01.jpg";
import slide02 from "@/assets/home-carousel-02.jpg";
import slide03 from "@/assets/home-carousel-03.jpg";
import slide04 from "@/assets/home-carousel-04.jpg";

type Slide = {
  title: string;
  subtitle: string;
  description: string;
  image: string;
};

type HomeCarouselContent = {
  platformBadge: string;
  searchPlaceholder: string;
  verifyShort: string;
  verifyFull: string;
  goToSlide: string;
  slides: Slide[];
  stats: Array<{ value: string; label: string }>;
  featureCards: Array<{ title: string; desc: string }>;
};

const homeCarouselContent: Record<Locale, HomeCarouselContent> = {
  'pt-BR': {
    platformBadge: 'Plataforma Online',
    searchPlaceholder: 'Digite...',
    verifyShort: 'Verificar',
    verifyFull: 'Verificar Informações',
    goToSlide: 'Ir para slide',
    slides: [
      {
        title: 'Dados Cadastrais em Tempo Real',
        subtitle: 'Validação inteligente',
        description: 'Acesse informações cadastrais precisas e atualizadas direto no seu sistema.',
        image: slide02,
      },
      {
        title: 'Teste nossa API em nosso painel',
        subtitle: 'Integre por API ou consuma direto no painel',
        description: 'Venda e opere nos dois modelos: integração técnica e uso imediato pela interface.',
        image: slide01,
      },
      {
        title: 'Integração Segura em Tempo Real',
        subtitle: 'Conecte bots, apps e processos internos com facilidade',
        description: 'Conecte bots, apps e fluxos internos com estabilidade e privacidade total.',
        image: slide03,
      },
      {
        title: 'Conformidade Segura e Real',
        subtitle: 'Criptografia ponta a ponta com infraestrutura confiável',
        description: 'Escale com performance contínua, conformidade LGPD e proteção completa.',
        image: slide04,
      },
    ],
    stats: [
      { value: '99,9%', label: 'Disponibilidade' },
      { value: '100%', label: 'Criptografia' },
      { value: 'LGPD', label: 'Conformidade' },
      { value: '24h', label: 'Suporte Telegram' },
    ],
    featureCards: [
      { title: 'Validação de dados cadastrais', desc: 'Qualidade e consistência para cadastro' },
      { title: 'Checagem de status em tempo real', desc: 'Atualização contínua para cada consulta' },
      { title: 'Consulta de registros oficiais', desc: 'Dados confiáveis para fluxos críticos' },
      { title: 'Integração com bots e aplicativos', desc: 'Conexão estável com seus sistemas' },
      { title: 'Relatórios rápidos e criptografados', desc: 'Informação acionável com privacidade' },
    ],
  },
  en: {
    platformBadge: 'Online Platform',
    searchPlaceholder: 'Type...',
    verifyShort: 'Check',
    verifyFull: 'Check Information',
    goToSlide: 'Go to slide',
    slides: [
      {
        title: 'Real-Time Registration Data',
        subtitle: 'Smart validation',
        description: 'Access accurate and updated registration data directly in your system.',
        image: slide02,
      },
      {
        title: 'Test our API in our panel',
        subtitle: 'Integrate via API or use directly in the panel',
        description: 'Sell and operate in both models: technical integration and immediate interface usage.',
        image: slide01,
      },
      {
        title: 'Secure Real-Time Integration',
        subtitle: 'Connect bots, apps, and internal processes with ease',
        description: 'Connect bots, apps, and internal flows with stability and full privacy.',
        image: slide03,
      },
      {
        title: 'Reliable Security Compliance',
        subtitle: 'End-to-end encryption with trusted infrastructure',
        description: 'Scale with continuous performance, compliance, and full protection.',
        image: slide04,
      },
    ],
    stats: [
      { value: '99.9%', label: 'Availability' },
      { value: '100%', label: 'Encryption' },
      { value: 'Compliance', label: 'Standards' },
      { value: '24h', label: 'Telegram Support' },
    ],
    featureCards: [
      { title: 'Registration data validation', desc: 'Quality and consistency for onboarding' },
      { title: 'Real-time status checks', desc: 'Continuous updates for each query' },
      { title: 'Official records lookup', desc: 'Reliable data for critical flows' },
      { title: 'Bot and app integration', desc: 'Stable connection with your systems' },
      { title: 'Fast encrypted reports', desc: 'Actionable information with privacy' },
    ],
  },
  es: {
    platformBadge: 'Plataforma en línea',
    searchPlaceholder: 'Escribe...',
    verifyShort: 'Verificar',
    verifyFull: 'Verificar información',
    goToSlide: 'Ir al slide',
    slides: [
      {
        title: 'Datos Registrales en Tiempo Real',
        subtitle: 'Validación inteligente',
        description: 'Accede a datos registrales precisos y actualizados directamente en tu sistema.',
        image: slide02,
      },
      {
        title: 'Prueba nuestra API en nuestro panel',
        subtitle: 'Integra por API o úsala directo en el panel',
        description: 'Vende y opera en ambos modelos: integración técnica y uso inmediato de la interfaz.',
        image: slide01,
      },
      {
        title: 'Integración Segura en Tiempo Real',
        subtitle: 'Conecta bots, apps y procesos internos con facilidad',
        description: 'Conecta bots, apps y flujos internos con estabilidad y privacidad total.',
        image: slide03,
      },
      {
        title: 'Cumplimiento Seguro y Real',
        subtitle: 'Cifrado de extremo a extremo con infraestructura confiable',
        description: 'Escala con rendimiento continuo, cumplimiento y protección completa.',
        image: slide04,
      },
    ],
    stats: [
      { value: '99,9%', label: 'Disponibilidad' },
      { value: '100%', label: 'Cifrado' },
      { value: 'Cumplimiento', label: 'Normativas' },
      { value: '24h', label: 'Soporte Telegram' },
    ],
    featureCards: [
      { title: 'Validación de datos registrales', desc: 'Calidad y consistencia para el registro' },
      { title: 'Verificación en tiempo real', desc: 'Actualización continua para cada consulta' },
      { title: 'Consulta de registros oficiales', desc: 'Datos confiables para flujos críticos' },
      { title: 'Integración con bots y apps', desc: 'Conexión estable con tus sistemas' },
      { title: 'Reportes rápidos cifrados', desc: 'Información accionable con privacidad' },
    ],
  },
};

const HomeCarouselSection: React.FC = () => {
  const navigate = useNavigate();
  const { currentVisualTheme } = useSiteTheme();
  const { locale } = useLocale();
  const content = homeCarouselContent[locale];
  const isMatrix = currentVisualTheme === "matrix";
  const [active, setActive] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const slides = useMemo<Slide[]>(() => content.slides, [content.slides]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      navigate(`/registration`);
    },
    [navigate]
  );

  const stats = content.stats;

  const featureCards = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: content.featureCards[0].title,
      desc: content.featureCards[0].desc,
      delay: 0.3,
      initial: { opacity: 0, x: 80, rotate: 5 },
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: content.featureCards[1].title,
      desc: content.featureCards[1].desc,
      delay: 0.45,
      initial: { opacity: 0, x: 100, y: 20, scale: 0.85 },
    },
    {
      icon: <FileSearch className="h-5 w-5" />,
      title: content.featureCards[2].title,
      desc: content.featureCards[2].desc,
      delay: 0.6,
      initial: { opacity: 0, x: 60, y: 40, rotate: -3 },
    },
    {
      icon: <Code2 className="h-5 w-5" />,
      title: content.featureCards[3].title,
      desc: content.featureCards[3].desc,
      delay: 0.75,
      initial: { opacity: 0, x: 90, y: 15, rotate: 2 },
    },
    {
      icon: <ArrowRight className="h-5 w-5" />,
      title: content.featureCards[4].title,
      desc: content.featureCards[4].desc,
      delay: 0.9,
      initial: { opacity: 0, x: 70, y: 20, rotate: -2 },
    },
  ];

  const cardsPerSlide = 3;
  const startCardIndex = active % featureCards.length;
  const visibleFeatureCards = Array.from({ length: Math.min(cardsPerSlide, featureCards.length) }, (_, idx) =>
    featureCards[(startCardIndex + idx) % featureCards.length]
  );

  return (
    <section aria-label="Hero" className="relative w-full overflow-hidden">
      {/* Background images with crossfade */}
      <div className="absolute inset-0">
        {slides.map((slide, idx) => (
          <motion.div
            key={idx}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: idx === active ? 1 : 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            {!isMatrix && (
              <img
                src={slide.image}
                alt=""
                loading={idx === 0 ? "eager" : "lazy"}
                className="w-full h-full object-cover scale-105"
              />
            )}
          </motion.div>
        ))}

        {/* Overlay gradients */}
        {!isMatrix ? (
          <>
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </>
        ) : (
          <div className="absolute inset-0 z-[1] bg-black/90" />
        )}

        {/* Surreal glow accents */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30",
              isMatrix ? "bg-green-500" : "bg-[hsl(262,83%,58%)]"
            )}
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20",
              isMatrix ? "bg-green-400" : "bg-secondary"
            )}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-[3] min-h-[520px] sm:min-h-[560px] lg:min-h-[600px] flex items-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl w-full py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Text + Search */}
            <div className="space-y-6 text-left flex flex-col items-start">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase",
                    isMatrix
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-white/10 text-white/90 border border-white/15 backdrop-blur-sm"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  {content.platformBadge}
                </span>
              </motion.div>

              {/* Title */}
              <AnimatePresence mode="wait">
                <motion.h1
                  key={`title-${active}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.1]"
                >
                  {slides[active].title}
                </motion.h1>
              </AnimatePresence>

              {/* Subtitle with glass */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`sub-${active}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={cn(
                    "inline-block rounded-xl px-4 py-3",
                    isMatrix
                      ? "bg-black/40 border border-green-500/15"
                      : "bg-white/10 border border-white/15"
                  )}
                  style={{
                    backdropFilter: "blur(20px) saturate(1.4)",
                    WebkitBackdropFilter: "blur(20px) saturate(1.4)",
                  }}
                >
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-[44ch] font-semibold sm:whitespace-nowrap">
                    {slides[active].subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-[50ch] mt-2">
                    {slides[active].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Search bar */}
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-2 max-w-xl w-full"
              >
                  <div
                    className={cn(
                      "flex items-center w-[220px] sm:w-[280px] rounded-2xl overflow-hidden",
                      isMatrix
                      ? "bg-black/50 border border-green-500/20"
                      : "bg-white/10 border border-white/20"
                  )}
                  style={{
                    backdropFilter: "blur(24px) saturate(1.5)",
                    WebkitBackdropFilter: "blur(24px) saturate(1.5)",
                  }}
                >
                  <div className="flex items-center flex-1 px-4 gap-3">
                    <Search className="h-4 w-4 text-white/50 shrink-0" />
                    <input
                      type="text"
                      placeholder={content.searchPlaceholder}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/40 py-3.5"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className={cn(
                    "flex items-center justify-center text-sm font-semibold transition-colors shrink-0 h-12 px-4 rounded-xl gap-2",
                    isMatrix
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-primary hover:bg-primary/80 text-primary-foreground dark:bg-primary dark:hover:bg-primary/80 dark:text-primary-foreground"
                  )}
                >
                  <span className="sm:hidden">{content.verifyShort}</span>
                  <span className="hidden sm:inline">{content.verifyFull}</span>
                  <Code2 className="h-4 w-4" />
                </button>
              </motion.form>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-6 pt-2"
              >
                {stats.map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span
                      className={cn(
                        "text-lg sm:text-xl font-bold",
                        isMatrix ? "text-green-400" : "text-white"
                      )}
                    >
                      {stat.value}
                    </span>
                    <span className="text-[11px] sm:text-xs text-white/50 uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Floating glass cards */}
            <div className="hidden lg:flex flex-col items-end justify-center gap-5 relative min-h-[320px]">
              {/* Central orb glow */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[60px] pointer-events-none",
                  isMatrix ? "bg-green-500/30" : "bg-[hsl(262,83%,58%)]/25"
                )}
              />

              {/* Feature cards - aligned right with unique entrance animations */}
              {visibleFeatureCards.map((card, i) => (
                <motion.div
                  key={`${active}-${card.title}`}
                  initial={card.initial}
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, scale: 1.04, transition: { duration: 0.25 } }}
                  className={cn(
                    "relative z-10 w-[260px] rounded-2xl p-4 cursor-default self-end",
                    isMatrix
                      ? "bg-black/50 border border-green-500/20"
                      : "bg-white/10 border border-white/15"
                  )}
                  style={{
                    backdropFilter: "blur(24px) saturate(1.5)",
                    WebkitBackdropFilter: "blur(24px) saturate(1.5)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        isMatrix
                          ? "bg-green-500/15 text-green-400"
                          : "bg-secondary/20 text-secondary"
                      )}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{card.title}</p>
                      <p className="text-xs text-white/50">{card.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Slide indicators */}
          <div className="flex items-center gap-2 mt-10">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${content.goToSlide} ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === active
                    ? cn("w-8", isMatrix ? "bg-green-400" : "bg-white")
                    : "w-2 bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCarouselSection;
