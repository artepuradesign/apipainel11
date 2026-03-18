import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useApiModules } from '@/hooks/useApiModules';
import { useApiPanels } from '@/hooks/useApiPanels';
import ModuleCardTemplates from '@/components/configuracoes/personalization/ModuleCardTemplates';
import { motion } from 'framer-motion';

const GerenciarModulos = () => {
  const { isSupport } = useAuth();
  const { modules, isLoading } = useApiModules();
  const { panels } = useApiPanels();

  // Redirect non-support users
  if (!isSupport) {
    return <Navigate to="/dashboard" replace />;
  }

  const getPanelTemplate = (panelId: number): 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix' => {
    const panel = panels.find(p => p.id === panelId);
    return (panel?.template as 'corporate' | 'creative' | 'minimal' | 'modern' | 'elegant' | 'forest' | 'rose' | 'cosmic' | 'neon' | 'sunset' | 'arctic' | 'volcano' | 'matrix') || 'modern';
  };

  const formatPrice = (price: number | string) => {
    if (!price && price !== 0) return '0,00';
    
    if (typeof price === 'string') {
      const cleanPrice = price.replace(/[^\d,\.]/g, '');
      if (!cleanPrice) return '0,00';
      
      if (cleanPrice.includes(',')) {
        const parts = cleanPrice.split(',');
        if (parts.length === 2 && parts[1].length <= 2) {
          return cleanPrice;
        }
      }
      
      const numericValue = parseFloat(cleanPrice.replace(',', '.'));
      if (isNaN(numericValue)) return '0,00';
      
      return numericValue.toFixed(2).replace('.', ',');
    }
    
    const numericValue = typeof price === 'number' ? price : 0;
    return numericValue.toFixed(2).replace('.', ',');
  };

  return (
    <div className="space-y-6">
      <PageHeaderCard 
        title="Módulos do Sistema" 
        subtitle="Visualização dos módulos cadastrados no sistema"
      />

      {/* Modules Grid */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Módulos Cadastrados via API
            </CardTitle>
            <Badge variant="outline" className="text-brand-purple border-brand-purple">
              {modules.length} módulos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando módulos...</span>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
                <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Nenhum módulo cadastrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Os módulos serão exibidos aqui quando forem cadastrados no painel administrativo
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {modules.map((module, index) => {
                const template = getPanelTemplate(module.panel_id);
                
                return (
                  <motion.div
                    key={index}
                    className="flex-shrink-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ModuleCardTemplates
                      module={{
                        title: module.title,
                        description: module.description,
                        price: formatPrice(module.price || 0),
                        status: module.is_active ? 'ativo' : 'inativo',
                        operationalStatus: module.operational_status === 'maintenance' ? 'manutencao' : module.operational_status,
                        iconSize: 'medium',
                        showDescription: true,
                        icon: module.icon,
                        color: module.color
                      }}
                      template={template}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="bg-gradient-to-r from-brand-purple/10 to-indigo-500/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Gestão de Módulos
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Os módulos são gerenciados através da API e exibidos com os templates personalizados de cada painel. 
              Para gerenciar os módulos, utilize a seção de Personalização no painel administrativo.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-brand-purple text-brand-purple">
                API Integrada
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-500">
                Templates Dinâmicos
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-500">
                Responsivo
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GerenciarModulos;
