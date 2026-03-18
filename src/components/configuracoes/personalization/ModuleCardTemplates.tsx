import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowRight, Zap, Clock } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface ModuleCardTemplatesProps {
  module: {
    title: string;
    description: string;
    price: string;
    status?: 'ativo' | 'inativo';
    operationalStatus?: 'on' | 'off' | 'manutencao';
    iconSize?: 'small' | 'medium' | 'large';
    showDescription?: boolean;
    icon?: string;
    color?: string;
    discountPrice?: string;
    originalPrice?: string;
    hasActivePlan?: boolean;
    discountPercentage?: number;
  };
  template: 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix';
  theme?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  isDarkMode?: boolean;
}

const ModuleCardTemplates = ({ module, template, theme, isDarkMode: isDarkModeProp }: ModuleCardTemplatesProps) => {
  const { theme: currentTheme } = useTheme();
  const isDarkMode = typeof isDarkModeProp === 'boolean' ? isDarkModeProp : currentTheme === 'dark';
  
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return Package;
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent || Package;
  };

  const ModuleIcon = getIconComponent(module.icon);

  // Templates agora usam renderização inline de preços para total compatibilidade com TemplatePreview

  const getTemplateStyles = () => {
    const baseStyles = {
      container: isDarkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-200',
      text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
      textMuted: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      icon: isDarkMode ? 'text-purple-300' : 'text-purple-600',
      iconBg: isDarkMode ? 'bg-purple-800/60 border-purple-600/30' : 'bg-purple-100 border-purple-200',
      button: isDarkMode ? 'bg-purple-500 hover:bg-purple-700 text-white hover:text-white' : 'bg-purple-600 hover:bg-purple-800 text-white hover:text-white'
    };

    switch (template) {
      case 'corporate':
        return {
          ...baseStyles,
          card: isDarkMode 
            ? 'bg-gray-800 border-gray-600 shadow-lg' 
            : 'bg-white border-gray-300 shadow-md',
          layout: 'structured',
          spacing: 'compact',
          iconBg: isDarkMode ? 'bg-blue-900/60 border-blue-600/40' : 'bg-blue-50 border-blue-200',
          icon: isDarkMode ? 'text-blue-300' : 'text-blue-600',
          button: isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      
      case 'creative':
        return {
          ...baseStyles,
          card: isDarkMode 
            ? 'bg-gradient-to-br from-purple-800 via-purple-900 to-indigo-900 text-white border border-purple-600/30 shadow-2xl' 
            : 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white border-0 shadow-xl',
          layout: 'dynamic',
          spacing: 'comfortable',
          text: 'text-white',
          textMuted: isDarkMode ? 'text-purple-100' : 'text-white/90',
          icon: 'text-white',
          iconBg: isDarkMode ? 'bg-purple-700/40 backdrop-blur-sm border border-purple-400/40' : 'bg-white/20 backdrop-blur-sm border border-white/30',
          button: isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
        };
      
      case 'minimal':
        return {
          ...baseStyles,
          card: isDarkMode 
            ? 'bg-gray-850 border-gray-700 shadow-sm' 
            : 'bg-gray-50 border-gray-200 shadow-sm',
          layout: 'clean',
          spacing: 'minimal',
          iconBg: isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300',
          icon: isDarkMode ? 'text-gray-400' : 'text-gray-500',
          button: isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white border-gray-500' : 'bg-gray-600 hover:bg-gray-700 text-white border-gray-300'
        };
      
      case 'elegant':
        return {
          ...baseStyles,
          card: isDarkMode 
            ? 'bg-gradient-to-br from-amber-950/80 via-yellow-900/60 to-amber-900/70 border border-amber-600/30 shadow-xl' 
            : 'bg-gradient-to-br from-amber-50 via-yellow-50/80 to-amber-100/60 border border-amber-200/60 shadow-lg',
          layout: 'luxurious',
          spacing: 'spacious',
          iconBg: isDarkMode ? 'bg-amber-800/40 border border-amber-500/40 backdrop-blur-sm' : 'bg-amber-100/90 border border-amber-300/60',
          icon: isDarkMode ? 'text-amber-300' : 'text-amber-700',
          text: isDarkMode ? 'text-amber-100' : 'text-amber-900',
          textMuted: isDarkMode ? 'text-amber-200/80' : 'text-amber-800/80',
          button: isDarkMode ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      
      case 'cosmic':
        return {
          ...baseStyles,
          card: isDarkMode 
            ? 'bg-gradient-to-br from-indigo-950/90 via-purple-950/80 to-blue-950/90 border border-indigo-600/40 shadow-2xl' 
            : 'bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 border border-indigo-300/60 shadow-xl',
          layout: 'futuristic',
          spacing: 'dynamic',
          iconBg: isDarkMode ? 'bg-indigo-800/50 border border-indigo-400/50 backdrop-blur-sm' : 'bg-indigo-200/80 border border-indigo-400/60',
          icon: isDarkMode ? 'text-indigo-300' : 'text-indigo-700',
          text: isDarkMode ? 'text-indigo-100' : 'text-indigo-900',
          textMuted: isDarkMode ? 'text-indigo-200/90' : 'text-indigo-800/90',
          button: isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        };

      case 'neon':
        return {
          ...baseStyles,
          card: isDarkMode 
            ? 'bg-gradient-to-br from-cyan-950/90 via-teal-950/80 to-emerald-950/90 border border-cyan-500/40 shadow-2xl' 
            : 'bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 border border-cyan-300/60 shadow-xl',
          layout: 'electric',
          spacing: 'vibrant',
          iconBg: isDarkMode ? 'bg-cyan-800/50 border border-cyan-400/50 backdrop-blur-sm' : 'bg-cyan-200/80 border border-cyan-400/60',
          icon: isDarkMode ? 'text-cyan-300' : 'text-cyan-700',
          text: isDarkMode ? 'text-cyan-100' : 'text-cyan-900',
          textMuted: isDarkMode ? 'text-cyan-200/90' : 'text-cyan-800/90',
          button: isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white'
        };

      case 'matrix':
        return {
          ...baseStyles,
          card: 'bg-black border border-green-400/40 shadow-2xl shadow-green-500/20',
          layout: 'digital',
          spacing: 'matrix',
          iconBg: 'bg-black border border-green-400/60 shadow-inner shadow-green-400/20',
          icon: 'text-green-400',
          text: 'text-green-400',
          textMuted: 'text-green-300/80',
          button: 'bg-black hover:bg-green-900/30 text-green-400 border border-green-400/60 shadow-lg shadow-green-400/20'
        };
      
      case 'forest':
        return {
          ...baseStyles,
          card: isDarkMode 
            ? 'bg-gradient-to-br from-green-950/80 via-emerald-900/60 to-green-900/70 border border-green-600/30 shadow-xl' 
            : 'bg-gradient-to-br from-green-50 via-emerald-50/80 to-green-100/60 border border-green-200/60 shadow-lg',
          layout: 'natural',
          spacing: 'organic',
          iconBg: isDarkMode ? 'bg-green-800/40 border border-green-500/40 backdrop-blur-sm' : 'bg-green-100/90 border border-green-300/60',
          icon: isDarkMode ? 'text-green-300' : 'text-green-700',
          text: isDarkMode ? 'text-green-100' : 'text-green-900',
          textMuted: isDarkMode ? 'text-green-200/80' : 'text-green-800/80',
          button: isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
        };
      
      case 'rose':
        return {
          ...baseStyles,
          card: isDarkMode 
            ? 'bg-gradient-to-br from-pink-950/80 via-fuchsia-900/60 to-pink-900/70 border border-pink-600/30 shadow-xl' 
            : 'bg-gradient-to-br from-pink-50 via-fuchsia-50/80 to-pink-100/60 border border-pink-200/60 shadow-lg',
          layout: 'romantic',
          spacing: 'delicate',
          iconBg: isDarkMode ? 'bg-pink-800/40 border border-pink-500/40 backdrop-blur-sm' : 'bg-pink-100/90 border border-pink-300/60',
          icon: isDarkMode ? 'text-pink-300' : 'text-pink-700',
          text: isDarkMode ? 'text-pink-100' : 'text-pink-900',
          textMuted: isDarkMode ? 'text-pink-200/80' : 'text-pink-800/80',
          button: isDarkMode ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'bg-pink-600 hover:bg-pink-700 text-white'
         };

      case 'sunset':
        return {
          ...baseStyles,
          card: isDarkMode 
            ? 'bg-gradient-to-br from-orange-950/90 via-red-950/80 to-pink-950/90 border border-orange-600/40 shadow-2xl' 
            : 'bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 border border-orange-300/60 shadow-xl',
          layout: 'warm',
          spacing: 'cozy',
          iconBg: isDarkMode ? 'bg-orange-800/50 border border-orange-400/50 backdrop-blur-sm' : 'bg-orange-200/80 border border-orange-400/60',
          icon: isDarkMode ? 'text-orange-300' : 'text-orange-700',
          text: isDarkMode ? 'text-orange-100' : 'text-orange-900',
          textMuted: isDarkMode ? 'text-orange-200/90' : 'text-orange-800/90',
          button: isDarkMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'
        };

      case 'arctic':
        return {
          ...baseStyles,
          card: isDarkMode 
            ? 'bg-gradient-to-br from-slate-950/90 via-blue-950/80 to-gray-950/90 border border-slate-600/40 shadow-2xl' 
            : 'bg-gradient-to-br from-slate-50 via-blue-50 to-gray-50 border border-slate-300/60 shadow-xl',
          layout: 'cool',
          spacing: 'crisp',
          iconBg: isDarkMode ? 'bg-slate-800/50 border border-slate-400/50 backdrop-blur-sm' : 'bg-slate-200/80 border border-slate-400/60',
          icon: isDarkMode ? 'text-slate-300' : 'text-slate-700',
          text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
          textMuted: isDarkMode ? 'text-slate-200/90' : 'text-slate-800/90',
          button: isDarkMode ? 'bg-slate-600 hover:bg-slate-700 text-white' : 'bg-slate-600 hover:bg-slate-700 text-white'
        };

      case 'volcano':
        return {
          ...baseStyles,
          card: isDarkMode 
            ? 'bg-gradient-to-br from-red-950/90 via-amber-950/80 to-yellow-950/90 border border-red-600/40 shadow-2xl' 
            : 'bg-gradient-to-br from-red-100 via-amber-50 to-yellow-100 border border-red-300/60 shadow-xl',
          layout: 'intense',
          spacing: 'bold',
          iconBg: isDarkMode ? 'bg-red-800/50 border border-red-400/50 backdrop-blur-sm' : 'bg-red-200/80 border border-red-400/60',
          icon: isDarkMode ? 'text-red-300' : 'text-red-700',
          text: isDarkMode ? 'text-red-100' : 'text-red-900',
          textMuted: isDarkMode ? 'text-red-200/90' : 'text-red-800/90',
          button: isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
        };
      
      default: // modern
        return {
          ...baseStyles,
          card: isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 border-gray-600 shadow-lg' 
            : 'bg-gradient-to-br from-white via-purple-50/30 to-blue-50 border-purple-200 shadow-md',
          layout: 'balanced',
          spacing: 'comfortable',
          iconBg: isDarkMode ? 'bg-purple-800/50 border-purple-600/40' : 'bg-purple-100 border-purple-200',
          icon: isDarkMode ? 'text-purple-300' : 'text-purple-600',
          button: isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500' : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-300'
        };
    }
  };

  const styles = getTemplateStyles();

  // Ajustes de legibilidade (mesmo tamanho no mobile e no desktop)
  const cardSizeClass = "w-[150px] h-[195px]";
  const contentPaddingClass = "p-3";
  const titleClass = "text-sm leading-5 line-clamp-1 min-h-[1.25rem] !whitespace-normal !text-clip";
  const descriptionClass = "text-xs";
  const priceClass = "text-sm";
  const originalPriceClass = "text-xs";
  const badgeClass = "text-[10px]";
  const buttonClass = "text-xs h-8";
  // Ícone maior para melhor leitura nos cards compactos
  const iconClass = "h-12 w-12";

  // CORPORATE TEMPLATE - 85% scale
  if (template === 'corporate') {
    return (
      <Card className={`${cardSizeClass} ${styles.card} relative overflow-hidden`}>
        <CardContent className={`${contentPaddingClass} h-full flex flex-col`}>
          {/* Price in top right corner */}
          <div className="absolute top-2 right-2 text-right z-10">
            {module.originalPrice && module.discountPercentage ? (
                <div className={`flex flex-col space-y-0.5`}>
                  <div className={`font-bold ${priceClass} text-green-600 dark:text-green-400`}>
                    {module.price}
                  </div>
                  <div className={`${originalPriceClass} text-gray-500 dark:text-gray-400 line-through`}>
                    {module.originalPrice}
                  </div>
                  <div className={`${badgeClass} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 py-0.5 rounded-full text-center`}>
                    -{module.discountPercentage}%
                  </div>
                </div>
            ) : (
              <div className={`font-bold ${priceClass} ${styles.icon}`}>
                {module.price}
              </div>
            )}
          </div>
          {/* Icon in top left corner */}
          <div className="absolute top-2 left-2 z-10">
            <div className={`p-1 ${styles.iconBg} rounded-lg border`}>
              <ModuleIcon className={`${iconClass} ${styles.icon}`} />
            </div>
          </div>
          <div className="flex-1 flex flex-col pt-14">
           <h3 className={`font-semibold ${titleClass} ${styles.text} mb-2 mt-1 truncate`}>{module.title}</h3>
           <p className={`${descriptionClass} ${styles.textMuted} line-clamp-2 mb-3 min-h-[2rem]`}>
              {module.description}
            </p>
           <Button className={`w-full ${buttonClass} ${styles.button} mt-auto mb-1`}>
              Acessar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // CREATIVE TEMPLATE - 85% scale
  if (template === 'creative') {
    return (
      <Card className={`${cardSizeClass} ${styles.card} relative overflow-hidden`}>
        <CardContent className={`${contentPaddingClass} h-full flex flex-col relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          {/* Price in top right corner */}
          <div className="absolute top-2 right-2 text-right z-20">
            {module.originalPrice && module.discountPercentage ? (
                <div className={`flex flex-col space-y-0.5`}>
                  <div className={`${priceClass} font-bold text-white`}>
                    {module.price}
                  </div>
                  <div className={`${originalPriceClass} text-white/70 line-through`}>
                    {module.originalPrice}
                  </div>
                  <div className={`${badgeClass} bg-white/20 text-white px-1 py-0.5 rounded-full text-center`}>
                    -{module.discountPercentage}%
                  </div>
                </div>
            ) : (
              <div className={`${priceClass} font-bold text-white`}>
                {module.price}
              </div>
            )}
          </div>
          {/* Icon in top left corner */}
          <div className="absolute top-2 left-2 z-20">
            <div className={`p-1 ${styles.iconBg} rounded-lg`}>
              <ModuleIcon className={iconClass} style={{ color: 'white' }} />
            </div>
          </div>
          <div className="relative z-10 h-full flex flex-col pt-14">
           <h3 className={`${titleClass} font-bold mb-2 mt-1 truncate`}>{module.title}</h3>
           <p className={`${descriptionClass} text-white/90 mb-3 line-clamp-2 min-h-[2rem]`}>
              {module.description}
            </p>
           <Button className={`w-full ${buttonClass} ${styles.button} group mt-auto mb-1`}>
              <span>Acessar</span>
              <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // MINIMAL TEMPLATE - 85% scale
  if (template === 'minimal') {
    return (
      <Card className={`${cardSizeClass} ${styles.card} relative overflow-hidden`}>
        <CardContent className={`${contentPaddingClass} h-full flex flex-col relative`}>
          {/* Price in top right corner */}
          <div className="absolute top-2 right-2 text-right z-10">
            {module.originalPrice && module.discountPercentage ? (
                <div className={`flex flex-col space-y-0.5`}>
                  <div className={`font-bold ${priceClass} text-green-600 dark:text-green-400`}>
                    {module.price}
                  </div>
                  <div className={`${originalPriceClass} text-gray-500 dark:text-gray-400 line-through`}>
                    {module.originalPrice}
                  </div>
                  <div className={`${badgeClass} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 py-0.5 rounded-full text-center`}>
                    -{module.discountPercentage}%
                  </div>
                </div>
            ) : (
              <div className={`font-bold ${priceClass} ${styles.icon}`}>
                {module.price}
              </div>
            )}
          </div>
          {/* Icon in top left corner */}
          <div className="absolute top-2 left-2 z-10">
            <div className={`p-1 ${styles.iconBg} rounded-lg border`}>
              <ModuleIcon className={`${iconClass} ${styles.icon}`} />
            </div>
          </div>
          <div className="flex-1 flex flex-col pt-14">
           <h3 className={`font-semibold ${titleClass} ${styles.text} mb-2 mt-1 truncate`}>{module.title}</h3>
           <p className={`${descriptionClass} ${styles.textMuted} line-clamp-2 mb-3 min-h-[2rem]`}>
              {module.description}
            </p>
            <Button 
              size="sm" 
              variant="outline" 
             className={`w-full ${buttonClass} ${styles.button} mt-auto mb-1`}
            >
              Acessar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ELEGANT TEMPLATE - 85% scale
  if (template === 'elegant') {
    return (
      <Card className={`${cardSizeClass} ${styles.card} relative overflow-hidden`}>
        <CardContent className={`${contentPaddingClass} h-full flex flex-col relative`}>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          {/* Price in top right corner */}
          <div className="absolute top-2 right-2 text-right z-20">
            {module.originalPrice && module.discountPercentage ? (
                <div className="flex flex-col space-y-0.5">
                  <div className={`font-bold ${priceClass} text-green-600 dark:text-green-400`}>
                    {module.price}
                  </div>
                  <div className={`${originalPriceClass} text-gray-500 dark:text-gray-400 line-through`}>
                    {module.originalPrice}
                  </div>
                  <div className={`${badgeClass} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 py-0.5 rounded-full text-center`}>
                    -{module.discountPercentage}%
                  </div>
                </div>
            ) : (
              <div className={`font-bold ${priceClass} ${styles.icon}`}>
                {module.price}
              </div>
            )}
          </div>
          {/* Icon in top left corner */}
          <div className="absolute top-2 left-2 z-20">
            <div className={`p-1 ${styles.iconBg} rounded-xl`}>
              <ModuleIcon className={`${iconClass} ${styles.icon}`} />
            </div>
          </div>
          <div className="relative z-10 h-full flex flex-col pt-14">
           <h3 className={`font-semibold ${titleClass} ${styles.text} mb-2 mt-1 truncate`}>
              {module.title}
            </h3>
           <p className={`${descriptionClass} ${styles.textMuted} line-clamp-2 mb-3 min-h-[2rem]`}>
              {module.description}
            </p>
           <Button className={`w-full ${buttonClass} ${styles.button} mt-auto mb-1`}>
              Acessar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // MATRIX TEMPLATE - 85% scale
  if (template === 'matrix') {
    return (
      <Card className={`${cardSizeClass} ${styles.card} relative overflow-hidden`}>
        <CardContent className={`${contentPaddingClass} h-full flex flex-col relative font-mono bg-black`}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent"></div>
          {/* Price in top right corner */}
          <div className="absolute top-2 right-2 text-right z-20">
            {module.originalPrice && module.discountPercentage ? (
                <div className="flex flex-col space-y-0.5">
                  <div className={`${priceClass} font-bold text-green-400 font-mono`}>
                    {module.price}
                  </div>
                  <div className={`${originalPriceClass} text-green-300/70 line-through font-mono`}>
                    {module.originalPrice}
                  </div>
                  <div className={`${badgeClass} bg-green-400/20 text-green-400 px-1 py-0.5 rounded text-center font-mono`}>
                    -{module.discountPercentage}%
                  </div>
                </div>
            ) : (
              <div className={`${priceClass} font-bold text-green-400 font-mono`}>
                {module.price}
              </div>
            )}
          </div>
          {/* Icon in top left corner */}
          <div className="absolute top-2 left-2 z-20">
            <div className={`p-1 ${styles.iconBg} rounded border font-mono`}>
              <ModuleIcon className={`${iconClass} ${styles.icon}`} />
            </div>
          </div>
          <div className="relative z-10 h-full flex flex-col pt-14">
           <h3 className={`font-semibold ${titleClass} ${styles.text} mb-2 mt-1 truncate font-mono`}>
              {module.title.toUpperCase().replace(/\s+/g, '_')}.EXE
            </h3>
           <p className={`${descriptionClass} ${styles.textMuted} line-clamp-2 mb-3 font-mono min-h-[2rem]`}>
              // {module.description}
            </p>
           <Button className={`w-full ${buttonClass} ${styles.button} font-mono mt-auto mb-1`}>
              {'>'} ACESSAR
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // COLORFUL TEMPLATES (forest, rose, cosmic, neon, sunset, arctic, volcano) - 85% scale
  if (['forest', 'rose', 'cosmic', 'neon', 'sunset', 'arctic', 'volcano'].includes(template)) {
    return (
      <Card className={`${cardSizeClass} ${styles.card} relative overflow-hidden`}>
        <CardContent className={`${contentPaddingClass} h-full flex flex-col relative`}>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          {/* Price in top right corner */}
          <div className="absolute top-2 right-2 text-right z-20">
            {module.originalPrice && module.discountPercentage ? (
                <div className="flex flex-col space-y-0.5">
                  <div className={`font-bold ${priceClass} ${styles.icon}`}>
                    {module.price}
                  </div>
                  <div className={`${originalPriceClass} text-gray-500 dark:text-gray-400 line-through`}>
                    {module.originalPrice}
                  </div>
                  <div className={`${badgeClass} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 py-0.5 rounded-full text-center`}>
                    -{module.discountPercentage}%
                  </div>
                </div>
            ) : (
              <div className={`font-bold ${priceClass} ${styles.icon}`}>
                {module.price}
              </div>
            )}
          </div>
          {/* Icon in top left corner */}
          <div className="absolute top-2 left-2 z-20">
            <div className={`p-1 ${styles.iconBg} rounded-xl`}>
              <ModuleIcon className={`${iconClass} ${styles.icon}`} />
            </div>
          </div>
          <div className="relative z-10 h-full flex flex-col pt-14">
           <h3 className={`font-semibold ${titleClass} ${styles.text} mb-2 mt-1 truncate`}>
              {module.title}
            </h3>
           <p className={`${descriptionClass} ${styles.textMuted} line-clamp-2 mb-3 min-h-[2rem]`}>
              {module.description}
            </p>
           <Button className={`w-full ${buttonClass} ${styles.button} mt-auto mb-1`}>
              Acessar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // MODERN TEMPLATE (default) - 85% scale
  return (
    <Card className={`${cardSizeClass} ${styles.card} relative group overflow-hidden`}>
      <CardContent className={`${contentPaddingClass} h-full flex flex-col relative`}>
        {/* Price in top right corner */}
        <div className="absolute top-2 right-2 text-right z-10">
          {module.originalPrice && module.discountPercentage ? (
              <div className="flex flex-col space-y-0.5">
                <div className={`font-bold ${priceClass} text-green-600 dark:text-green-400`}>
                  {module.price}
                </div>
                <div className={`${originalPriceClass} text-gray-500 dark:text-gray-400 line-through`}>
                  {module.originalPrice}
                </div>
                <div className={`${badgeClass} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 py-0.5 rounded-full text-center`}>
                  -{module.discountPercentage}%
                </div>
              </div>
          ) : (
              <div className={`font-bold ${priceClass} ${styles.icon}`}>
                {module.price}
              </div>
          )}
        </div>
        {/* Icon in top left corner */}
        <div className="absolute top-2 left-2 z-10">
          <div className={`p-1 ${styles.iconBg} rounded-lg border group-hover:bg-purple-600 group-hover:text-white transition-colors`}>
            <ModuleIcon className={`${iconClass} ${styles.icon} group-hover:text-white transition-colors`} />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col pt-14">
         <h3 className={`font-semibold ${styles.text} group-hover:text-purple-600 transition-colors mb-2 mt-1 ${titleClass} truncate`}>
            {module.title}
          </h3>
          
         <p className={`${descriptionClass} ${styles.textMuted} group-hover:text-gray-700 dark:group-hover:text-gray-300 mb-3 transition-colors line-clamp-2 min-h-[2rem]`}>
            {module.description}
          </p>
          
          <Button 
            size="sm" 
            variant="outline" 
           className={`w-full ${buttonClass} ${styles.button} group-hover:bg-purple-800 group-hover:text-white transition-colors mt-auto mb-1`}
          >
            Acessar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleCardTemplates;