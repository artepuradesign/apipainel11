import React from 'react';
import ModuleCardTemplates from '@/components/configuracoes/personalization/ModuleCardTemplates';
import { Label } from '@/components/ui/label';

type TemplateKey =
  | 'modern'
  | 'corporate'
  | 'creative'
  | 'minimal'
  | 'elegant'
  | 'forest'
  | 'rose'
  | 'cosmic'
  | 'neon'
  | 'matrix';

interface TemplatePreviewProps {
  template: TemplateKey;
  theme?: 'light' | 'dark';
  isSelected?: boolean;
  onClick?: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  theme = 'light',
  isSelected = false,
  onClick,
}) => {
  const isDarkMode = theme === 'dark';

  return (
    <div className="w-[150px] mx-auto">
      <div className="space-y-3">
        <div
          className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClick?.();
          }}
        >
          <ModuleCardTemplates
            template={template}
            isDarkMode={isDarkMode}
            module={{
              title: 'Módulo Exemplo',
              description: 'Descrição detalhada do módulo com mais...',
              price: isDarkMode && template === 'matrix' ? '2.00' : '2,00',
              originalPrice: isDarkMode && template === 'matrix' ? 'R$ 3.00' : 'R$ 3,00',
              discountPercentage: 33,
              icon: 'Package',
            }}
          />
        </div>

        {/* Seletor (mantém a mesma lógica do preview antigo, mas com UI simples) */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={onClick}>
            <div
              className={[
                'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                isSelected ? 'border-brand-purple bg-brand-purple' : 'border-gray-300 hover:border-brand-purple',
              ].join(' ')}
            >
              {isSelected ? <div className="w-2 h-2 rounded-full bg-white" /> : null}
            </div>
            <Label
              className={[
                'text-sm font-medium cursor-pointer',
                isSelected ? 'text-brand-purple' : 'text-gray-700 dark:text-gray-300',
              ].join(' ')}
            >
              {template.charAt(0).toUpperCase() + template.slice(1)}
            </Label>
          </div>
          <p className="text-xs text-gray-500 text-center">{isDarkMode ? 'Tema Escuro' : 'Tema Claro'}</p>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
