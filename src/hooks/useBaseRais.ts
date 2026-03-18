import { useState } from 'react';
import { baseRaisService, BaseRais } from '@/services/baseRaisService';
import { toast } from 'sonner';

export const useBaseRais = () => {
  const [rais, setRais] = useState<BaseRais[]>([]);
  const [loading, setLoading] = useState(false);

  const getRaisByCpfId = async (cpfId: number) => {
    setLoading(true);
    try {
      console.log('🔍 [USE_BASE_RAIS] Buscando RAIS para CPF ID:', cpfId);
      const data = await baseRaisService.getByCpfId(cpfId);
      console.log('✅ [USE_BASE_RAIS] RAIS carregados:', data.length);
      setRais(data);
      return data;
    } catch (error) {
      console.error('❌ [USE_BASE_RAIS] Erro ao buscar RAIS:', error);
      toast.error('Erro ao carregar histórico de empregos');
      setRais([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createRais = async (cpfId: number, data: Partial<BaseRais>) => {
    try {
      await baseRaisService.create({ ...data, cpf_id: cpfId } as any);
      toast.success('Registro RAIS criado com sucesso');
      await getRaisByCpfId(cpfId);
    } catch (error) {
      console.error('❌ [USE_BASE_RAIS] Erro ao criar RAIS:', error);
      toast.error('Erro ao criar registro RAIS');
      throw error;
    }
  };

  const updateRais = async (id: number, cpfId: number, data: Partial<BaseRais>) => {
    try {
      await baseRaisService.update(id, data as any);
      toast.success('Registro RAIS atualizado com sucesso');
      await getRaisByCpfId(cpfId);
    } catch (error) {
      console.error('❌ [USE_BASE_RAIS] Erro ao atualizar RAIS:', error);
      toast.error('Erro ao atualizar registro RAIS');
      throw error;
    }
  };

  const deleteRais = async (id: number, cpfId: number) => {
    try {
      await baseRaisService.delete(id);
      toast.success('Registro RAIS deletado com sucesso');
      await getRaisByCpfId(cpfId);
    } catch (error) {
      console.error('❌ [USE_BASE_RAIS] Erro ao deletar RAIS:', error);
      toast.error('Erro ao deletar registro RAIS');
      throw error;
    }
  };

  return {
    rais,
    loading,
    getRaisByCpfId,
    createRais,
    updateRais,
    deleteRais
  };
};
