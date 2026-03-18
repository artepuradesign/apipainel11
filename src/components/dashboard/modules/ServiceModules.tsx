
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import ModuleCardTemplates from '@/components/configuracoes/personalization/ModuleCardTemplates';
import ModuleGridWrapper from '@/components/configuracoes/personalization/ModuleGridWrapper';

export type ServiceModule = {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  price?: string;
  roles?: string[];
  iconName?: string;
  color?: string;
};

interface ServiceModulesProps {
  serviceModules: ServiceModule[];
  columnsDesktop?: number;
  columnsMobile?: number;
  template?: 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix';
}

const ServiceModules = ({ 
  serviceModules,
  columnsDesktop = 3,
  columnsMobile = 1,
  template = 'modern'
}: ServiceModulesProps) => {
  
  const getIconName = (IconComponent: React.ElementType): string => {
    try {
      return (IconComponent as any).displayName || (IconComponent as any).name || 'Package';
    } catch {
      return 'Package';
    }
  };
  
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 w-full">
      <CardContent className="p-3 sm:p-6 pb-1 sm:pb-6 w-full">
        <div className="w-full">
          <ModuleGridWrapper>
            {serviceModules.map((module, index) => (
              <Link key={index} to={module.path} className="text-left">
                <ModuleCardTemplates
                  module={{
                    title: module.title,
                    description: module.description,
                    price: module.price || '0,00',
                    status: 'ativo',
                    operationalStatus: 'on',
                    iconSize: 'medium',
                    showDescription: true,
                    icon: module.iconName || getIconName(module.icon),
                    color: module.color
                  }}
                  template={template}
                />
              </Link>
            ))}
          </ModuleGridWrapper>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceModules;
