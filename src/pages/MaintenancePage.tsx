import React, { useEffect, useState } from 'react';
import { Package, Wrench, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const MaintenancePage = () => {
  const [dots, setDots] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 600);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <PageLayout variant="auth" backgroundOpacity="strong" showGradients={false}>
      {/* Theme Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeSwitcher />
      </div>

      <div className="flex items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 dark:bg-gray-800/95 dark:border-gray-700/50 overflow-hidden">
            
            {/* Top gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-brand-purple via-pink-500 to-brand-purple" />

            <div className="p-8 sm:p-10">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center mb-8"
              >
                <div className="flex items-center justify-center">
                  <Package className="text-brand-purple dark:text-purple-400 animate-logo-3d" size={32} />
                  <span className="text-2xl font-bold text-brand-purple dark:text-purple-400 ml-2">API</span>
                  <span className="text-2xl font-bold text-gray-700 dark:text-white">Painel</span>
                </div>
              </motion.div>

              {/* Maintenance Icon with animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.6, type: 'spring', stiffness: 120 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
                    <Wrench className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                  </div>
                  {/* Pulse ring */}
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-amber-400/40 dark:border-amber-500/30 animate-ping" />
                  {/* Rotating gear effect */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-brand-purple to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Clock className="h-3.5 w-3.5 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="text-center mb-4"
              >
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Sistema em Manutenção
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Estamos realizando melhorias para oferecer uma experiência ainda melhor para você.
                </p>
              </motion.div>

              {/* Status info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="space-y-3 mb-6"
              >
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Manutenção em andamento{dots}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Horário atual</span>
                    <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                      {currentTime.toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Status</span>
                    <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      Em manutenção
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Loading bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
                className="mb-6"
              >
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-purple via-pink-500 to-brand-purple rounded-full"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: '50%' }}
                  />
                </div>
              </motion.div>

              {/* Retry button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="text-center"
              >
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-purple to-pink-500 hover:from-brand-purple/90 hover:to-pink-500/90 text-white font-medium text-sm rounded-xl shadow-lg shadow-brand-purple/25 transition-all duration-200 hover:shadow-xl hover:shadow-brand-purple/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </button>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3">
                  A página será verificada automaticamente
                </p>
              </motion.div>
            </div>

            {/* Bottom gradient bar */}
            <div className="h-1 bg-gradient-to-r from-brand-purple/30 via-pink-500/30 to-brand-purple/30" />
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default MaintenancePage;
