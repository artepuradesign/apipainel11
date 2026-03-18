
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { loadCustomModules } from '@/utils/personalizationStorage';

interface ModuleSelectorProps {
  selectedModules: string[];
  onChange: (modules: string[]) => void;
}

const ModuleSelector = ({ selectedModules, onChange }: ModuleSelectorProps) => {
  const [availableModules, setAvailableModules] = useState<any[]>([]);

  useEffect(() => {
    // Carregar módulos salvos
    const savedModules = loadCustomModules();
    if (savedModules.length > 0) {
      setAvailableModules(savedModules);
    }
  }, []);

  const handleModuleToggle = (moduleName: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedModules, moduleName]);
    } else {
      onChange(selectedModules.filter(name => name !== moduleName));
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-white">Módulos Incluídos no Plano</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {availableModules.map((module, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`module-${index}`}
                checked={selectedModules.includes(module.title)}
                onCheckedChange={(checked) => handleModuleToggle(module.title, checked as boolean)}
              />
              <label
                htmlFor={`module-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-white"
              >
                {module.title}
              </label>
              <span className="text-xs text-gray-400 ml-auto">
                R$ {module.price}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-400">
          {selectedModules.length} módulos selecionados
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleSelector;
