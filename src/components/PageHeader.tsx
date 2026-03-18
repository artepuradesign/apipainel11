
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

const PageHeader = ({ title, subtitle, children }: PageHeaderProps) => {
  return (
    <section className="py-16 relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 dark:opacity-85 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-cyan-300 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 dark:opacity-85 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 dark:bg-pink-300 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 dark:opacity-85 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-pink-300 dark:bg-emerald-300 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-25 dark:opacity-75 animate-blob animation-delay-6000"></div>
        <div className="absolute bottom-1/3 left-1/2 w-70 h-70 bg-yellow-300 dark:bg-orange-300 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 dark:opacity-70 animate-blob animation-delay-3000"></div>
        {/* Colors from plan cards for thematic consistency */}
        <div className="absolute top-20 left-3/4 w-60 h-60 bg-brand-tone1/20 dark:bg-brand-tone1/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-40 dark:opacity-60 animate-blob animation-delay-7000"></div>
        <div className="absolute bottom-40 left-1/4 w-70 h-70 bg-brand-tone2/15 dark:bg-brand-tone2/35 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-35 dark:opacity-65 animate-blob animation-delay-8000"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="bg-gradient-to-r from-brand-purple to-indigo-700 text-white rounded-lg p-8 mb-6 shadow-lg backdrop-blur-sm bg-opacity-85 border border-white/20">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              className="text-lg text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          )}
          {children}
        </div>
      </div>
      
      {/* Gradient fade effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent"></div>
    </section>
  );
};

export default PageHeader;
