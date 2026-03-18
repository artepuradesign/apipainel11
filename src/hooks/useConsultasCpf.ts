import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { consultasCpfService, ConsultaCpf as ServiceConsultaCpf } from '@/services/consultasCpfService';

export interface ConsultaCpf {
  id: number;
  user_id: number;
  cpf_consultado: string;
  resultado: any;
  valor_cobrado: number;
  desconto_aplicado: number;
  saldo_usado: 'plano' | 'carteira' | 'misto';
  created_at: string;
  valor_original?: number;
  valor_final?: number;
  tipo_saldo_usado?: string;
}

// Função para mapear dados do serviço para o formato do hook
const mapServiceToHookData = (serviceData: ServiceConsultaCpf): ConsultaCpf => {
  return {
    id: serviceData.id || 0,
    user_id: serviceData.user_id,
    cpf_consultado: serviceData.document,
    resultado: serviceData.result_data,
    valor_cobrado: serviceData.cost,
    desconto_aplicado: serviceData.metadata?.discount || 0,
    saldo_usado: serviceData.saldo_usado || 'carteira',
    created_at: serviceData.created_at || new Date().toISOString(),
    valor_original: serviceData.metadata?.original_price,
    valor_final: serviceData.metadata?.final_price,
    tipo_saldo_usado: serviceData.saldo_usado
  };
};

export const useConsultasCpf = () => {
  const { user } = useAuth();
  const [consultas, setConsultas] = useState<ConsultaCpf[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConsultas = async (page = 1, limit = 50) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [CONSULTAS_CPF] Buscando consultas para usuário:', user.id);
      console.log('🔗 [CONSULTAS_CPF] Usando pool de conexões via consultasCpfService');
      
      // Converter user.id string para number
      const userId = parseInt(user.id);
      
      // Usar o serviço que já usa o pool de conexões
      const response = await consultasCpfService.getByUserId(userId, page, limit);

      console.log('📡 [CONSULTAS_CPF] Resposta do serviço:', response);

      if (response.success) {
        const consultasData = Array.isArray(response.data) 
          ? response.data.map(mapServiceToHookData) 
          : [];
        console.log('✅ [CONSULTAS_CPF] Consultas carregadas:', consultasData.length);
        setConsultas(consultasData);
      } else {
        throw new Error(response.message || 'Erro ao carregar consultas');
      }
    } catch (err) {
      console.error('❌ [CONSULTAS_CPF] Erro ao buscar consultas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setConsultas([]); // Limpar consultas em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar consulta específica por ID
  const fetchConsultaById = async (id: number) => {
    if (!user?.id) return null;
    
    try {
      console.log('🔍 [CONSULTAS_CPF] Buscando consulta por ID:', id);
      console.log('🔗 [CONSULTAS_CPF] Usando pool de conexões via consultasCpfService');
      
      const response = await consultasCpfService.getById(id);

      if (response.success && response.data) {
        return mapServiceToHookData(response.data);
      }
      
      return null;
    } catch (err) {
      console.error('❌ [CONSULTAS_CPF] Erro ao buscar consulta por ID:', err);
      return null;
    }
  };

  // Função para formatar dados para o histórico de pagamentos
  const formatToPaymentHistory = (consultas: ConsultaCpf[]) => {
    return consultas.map(consulta => ({
      id: `CPF-${consulta.id}`,
      type: 'Consulta',
      method: consulta.saldo_usado === 'plano' ? 'Saldo do Plano' : 'Saldo Carteira',
      amount: -Math.abs(consulta.valor_cobrado), // Negativo pois é um débito
      status: 'success',
      date: new Date(consulta.created_at).toISOString().split('T')[0],
      description: `Consulta CPF ${consulta.cpf_consultado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}`,
      balance_type: consulta.saldo_usado === 'plano' ? 'plan' : 'wallet',
      cpf_consultado: consulta.cpf_consultado,
      desconto_aplicado: consulta.desconto_aplicado,
      valor_original: consulta.valor_original || (consulta.valor_cobrado + consulta.desconto_aplicado),
      created_at: consulta.created_at
    }));
  };

  useEffect(() => {
    if (user?.id) {
      fetchConsultas();
    }
  }, [user?.id]);

  return {
    consultas,
    loading,
    error,
    fetchConsultas,
    fetchConsultaById,
    formatToPaymentHistory
  };
};