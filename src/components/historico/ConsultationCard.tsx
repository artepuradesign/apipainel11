import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ConsultationCardProps {
  consultation: {
    id: string;
    type: 'consultation';
    module_type?: string;
    document?: string;
    cost?: number;
    amount?: number; // Para compatibilidade com transações
    original_price?: number;
    discount_percent?: number;
    saldo_usado?: 'plano' | 'carteira' | 'misto' | string;
    status?: string;
    created_at: string;
    description: string;
    result_data?: any;
  };
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
}

const ConsultationCard: React.FC<ConsultationCardProps> = ({
  consultation,
  formatBrazilianCurrency,
  formatDate
}) => {
  // Função para determinar o label correto do saldo usado
  const getSaldoUsedoLabel = (saldo: string) => {
    const saldoLower = saldo?.toLowerCase() || 'carteira';
    
    if (saldoLower === 'plano') {
      return 'Saldo do Plano';
    }
    if (saldoLower === 'misto') {
      return 'Plano + Carteira';
    }
    return 'Saldo da Carteira';
  };
  
  // Função para determinar a classe CSS baseada no saldo usado
  const getSaldoUsedoClass = (saldo: string) => {
    const saldoLower = saldo?.toLowerCase() || 'carteira';
    
    if (saldoLower === 'plano') {
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    }
    if (saldoLower === 'misto') {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  const usedLabel = getSaldoUsedoLabel(consultation.saldo_usado || 'carteira');
  const usedClass = getSaldoUsedoClass(consultation.saldo_usado || 'carteira');
  
  // Valor da consulta (pode estar em cost ou amount) - validar se é um valor válido
  const consultationValue = consultation.cost || consultation.amount || 0;
  
  // Se o valor for zero ou inválido, não renderizar o card
  if (!consultationValue || consultationValue <= 0) {
    console.warn('ConsultationCard: Valor inválido detectado, não renderizando:', consultationValue);
    return null;
  }

  // Função para formatar CPF
  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para obter ícone do status
  const getStatusIcon = () => {
    switch (consultation.status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  // Função para obter texto do status
  const getStatusText = () => {
    switch (consultation.status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'Concluída';
      case 'failed':
      case 'error':
        return 'Falhou';
      case 'processing':
        return 'Processando';
      default:
        return 'Concluída';
    }
  };

  // Verificar se houve desconto
  const showDiscount = consultation.original_price && consultation.original_price > consultationValue;
  const savings = showDiscount ? consultation.original_price! - consultationValue : 0;

  // Obter tipo da consulta
  const getModuleTypeLabel = () => {
    switch (consultation.module_type?.toLowerCase()) {
      case 'cpf':
        return 'CPF';
      case 'cnpj':
        return 'CNPJ';
      case 'veiculo':
        return 'Veículo';
      case 'telefone':
        return 'Telefone';
      default:
        return 'Consulta';
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">
                Consulta {getModuleTypeLabel()}
              </h5>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center">
                  {getStatusIcon()}
                  <span className="ml-1">{getStatusText()}</span>
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  ID: {consultation.id}
                </span>
              </div>
            </div>
          </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Consulta realizada {consultation.module_type?.toUpperCase() === 'CPF' ? 'para o CPF' : 'para o documento'} <span className="font-bold">{consultation.document && consultation.document !== 'CPF consultado' ? formatCPF(consultation.document) : ''}</span>
            </p>
          
          {/* Informações de desconto */}
          {showDiscount && (
            <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded mb-2">
              ✅ Economizou: {formatBrazilianCurrency(savings)} 
              {consultation.discount_percent ? ` (${consultation.discount_percent}%)` : ''}
            </div>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-500">
            📅 {formatDate(consultation.created_at)}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-xl font-bold text-red-600 dark:text-red-400 mb-1">
            -{formatBrazilianCurrency(consultationValue)}
          </div>
          
          {showDiscount && (
            <div className="text-xs text-gray-500 line-through mb-1">
              Valor original: {formatBrazilianCurrency(consultation.original_price!)}
            </div>
          )}
          
          <p className="text-xs text-gray-500">Valor cobrado</p>
          <div className="mt-2">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
            <span className="text-xs text-red-600 dark:text-red-400">Debitado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationCard;