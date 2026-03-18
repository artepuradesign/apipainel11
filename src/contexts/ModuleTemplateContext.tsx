
import React, { createContext, useContext, useState, useEffect } from 'react';

type TemplateType = 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix';

interface ModuleTemplateContextType {
  selectedTemplate: TemplateType;
  setSelectedTemplate: (template: TemplateType) => void;
}

const ModuleTemplateContext = createContext<ModuleTemplateContextType | undefined>(undefined);

export const ModuleTemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');

  // Load template from localStorage on mount
  useEffect(() => {
    const savedTemplate = localStorage.getItem('module_template') as TemplateType;
    if (savedTemplate && ['corporate', 'creative', 'minimal', 'modern', 'elegant', 'forest', 'rose', 'cosmic', 'neon', 'sunset', 'arctic', 'volcano', 'matrix'].includes(savedTemplate)) {
      setSelectedTemplate(savedTemplate);
    }
  }, []);

  // Save template to localStorage when it changes
  const handleSetSelectedTemplate = (template: TemplateType) => {
    setSelectedTemplate(template);
    localStorage.setItem('module_template', template);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('templateChanged', { detail: template }));
  };

  return (
    <ModuleTemplateContext.Provider 
      value={{ 
        selectedTemplate, 
        setSelectedTemplate: handleSetSelectedTemplate 
      }}
    >
      {children}
    </ModuleTemplateContext.Provider>
  );
};

export const useModuleTemplate = () => {
  const context = useContext(ModuleTemplateContext);
  if (context === undefined) {
    throw new Error('useModuleTemplate must be used within a ModuleTemplateProvider');
  }
  return context;
};
