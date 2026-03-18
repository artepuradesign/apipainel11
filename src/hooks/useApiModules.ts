
import { useState, useEffect } from 'react';
import { moduleService, type Module } from '@/utils/apiService';

export const useApiModules = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadModules = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 [HOOK_API_MODULES] Carregando módulos da API...');
      const response = await moduleService.getAll();
      
      if (response.success && response.data) {
        console.log('✅ [HOOK_API_MODULES] Módulos carregados:', response.data.length, 'módulos');
        setModules(response.data);
      } else {
        console.error('❌ [HOOK_API_MODULES] Erro na resposta:', response.error);
        setModules([]);
      }
    } catch (error) {
      console.error('❌ [HOOK_API_MODULES] Erro ao carregar módulos:', error);
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 [HOOK_API_MODULES] Hook inicializado, carregando módulos...');
    loadModules();
  }, []);

  const createModule = async (moduleData: any) => {
    try {
      setIsLoading(true);
      console.log('🔄 [HOOK_API_MODULES] Criando módulo:', moduleData);
      
      const payload = {
        panel_id: moduleData.panel_id,
        name: moduleData.name,
        title: moduleData.title,
        slug: moduleData.slug,
        description: moduleData.description,
        icon: moduleData.icon,
        color: moduleData.color,
        price: parseFloat(moduleData.price) || 0,
        cost_price: parseFloat(moduleData.cost_price) || 0,
        path: moduleData.path,
        category: moduleData.category,
        operational_status: moduleData.operational_status,
        is_active: moduleData.is_active === true || moduleData.is_active === 1,
        is_premium: moduleData.is_premium === true || moduleData.is_premium === 1,
        api_endpoint: moduleData.api_endpoint,
        api_method: moduleData.api_method,
        sort_order: parseInt(moduleData.sort_order) || 0,
        settings: moduleData.settings
      };

      console.log('🔄 [HOOK_API_MODULES] Payload para criação:', payload);
      
      const response = await moduleService.create(payload);
      
      if (response.success && response.data) {
        console.log('✅ [HOOK_API_MODULES] Módulo criado:', response.data);
        await loadModules();
        return response.data;
      } else {
        console.error('❌ [HOOK_API_MODULES] Erro na criação:', response.error);
        throw new Error(response.error || 'Erro ao criar módulo');
      }
    } catch (error) {
      console.error('❌ [HOOK_API_MODULES] Erro ao criar módulo:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateModule = async (moduleId: number, moduleData: any) => {
    try {
      setIsLoading(true);
      console.log('🔄 [HOOK_API_MODULES] Atualizando módulo:', { moduleId, moduleData });
      
      const payload = {
        panel_id: moduleData.panel_id,
        name: moduleData.name,
        title: moduleData.title,
        slug: moduleData.slug,
        description: moduleData.description,
        icon: moduleData.icon,
        color: moduleData.color,
        price: parseFloat(moduleData.price) || 0,
        cost_price: parseFloat(moduleData.cost_price) || 0,
        path: moduleData.path,
        category: moduleData.category,
        operational_status: moduleData.operational_status,
        is_active: moduleData.is_active === true || moduleData.is_active === 1,
        is_premium: moduleData.is_premium === true || moduleData.is_premium === 1,
        api_endpoint: moduleData.api_endpoint,
        api_method: moduleData.api_method,
        sort_order: parseInt(moduleData.sort_order) || 0,
        settings: moduleData.settings
      };

      console.log('🔄 [HOOK_API_MODULES] Payload para atualização:', payload);
      
      const response = await moduleService.update(moduleId, payload);
      
      if (response.success && response.data) {
        console.log('✅ [HOOK_API_MODULES] Módulo atualizado:', response.data);
        await loadModules();
        return response.data;
      } else {
        console.error('❌ [HOOK_API_MODULES] Erro na atualização:', response.error);
        throw new Error(response.error || 'Erro ao atualizar módulo');
      }
    } catch (error) {
      console.error('❌ [HOOK_API_MODULES] Erro ao atualizar módulo:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteModule = async (moduleId: number) => {
    try {
      setIsLoading(true);
      console.log(`🔄 [HOOK_API_MODULES] Excluindo módulo ID ${moduleId}`);
      
      const response = await moduleService.delete(moduleId);
      
      if (response.success) {
        console.log('✅ [HOOK_API_MODULES] Módulo excluído com sucesso');
        setModules(prevModules => prevModules.filter(module => module.id !== moduleId));
      } else {
        console.error('❌ [HOOK_API_MODULES] Erro na exclusão:', response.error);
        throw new Error(response.error || 'Erro ao excluir módulo');
      }
    } catch (error) {
      console.error('❌ [HOOK_API_MODULES] Erro ao excluir módulo:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModuleStatus = async (moduleId: number) => {
    try {
      setIsLoading(true);
      console.log(`🔄 [HOOK_API_MODULES] Alternando status do módulo ID ${moduleId}`);
      
      const response = await moduleService.toggleStatus(moduleId);
      
      if (response.success) {
        console.log('✅ [HOOK_API_MODULES] Status do módulo alternado com sucesso');
        setModules(prevModules =>
          prevModules.map(module =>
            module.id === moduleId ? { ...module, operational_status: module.operational_status === 'on' ? 'off' : 'on' } : module
          )
        );
      } else {
        console.error('❌ [HOOK_API_MODULES] Erro ao alternar status:', response.error);
        throw new Error(response.error || 'Erro ao alternar status do módulo');
      }
    } catch (error) {
      console.error('❌ [HOOK_API_MODULES] Erro ao alternar status do módulo:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    modules,
    isLoading,
    loadModules,
    createModule,
    updateModule,
    deleteModule,
    toggleModuleStatus
  };
};
