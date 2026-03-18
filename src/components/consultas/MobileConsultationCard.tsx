import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, XCircle, Clock, Calendar, CreditCard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileConsultationCardProps {
  consultation: {
    id: string;
    type: 'consultation';
    module_type?: string;
    document?: string;
    cost?: number;
    amount?: number;
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

const MobileConsultationCard: React.FC<MobileConsultationCardProps> = ({
  consultation,
  formatBrazilianCurrency,
  formatDate
}) => {
  const isMobile = useIsMobile();

  // Função para determinar o label correto do saldo usado
  const getSaldoUsedoLabel = (saldo: string) => {
    const saldoLower = saldo?.toLowerCase() || 'carteira';
    
    if (saldoLower === 'plano') {
      return 'Saldo do Plano';
    }
    if (saldoLower === 'misto') {
      return 'Plano + Carteira';
    }
    return 'Carteira';
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
    return null;
  }

  // Função para formatar CPF de forma compacta para mobile
  const formatCPF = (cpf: string) => {
    if (!cpf || cpf === 'CPF consultado') return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return isMobile ? `***.***.***-${cleaned.slice(-2)}` : cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  };

  // Função para obter ícone do status
  const getStatusIcon = () => {
    switch (consultation.status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />;
      case 'processing':
        return <Clock className="w-3 h-3 text-yellow-500 flex-shrink-0" />;
      default:
        return <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />;
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
    <div className="border border-border rounded-lg bg-card hover:shadow-md transition-shadow w-full overflow-hidden">
      {/* Layout Mobile */}
      {isMobile ? (
        <div className="p-2 space-y-1.5">
          {/* Header com ícone e tipo */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <Search className="w-2.5 h-2.5" />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="font-medium text-xs text-foreground truncate">
                  {getModuleTypeLabel()}
                </h5>
                <div className="flex items-center gap-1">
                  {getStatusIcon()}
                  <span className="text-xs text-muted-foreground truncate">{getStatusText()}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-bold text-red-600 dark:text-red-400">
                -{formatBrazilianCurrency(consultationValue)}
              </div>
            </div>
          </div>

          {/* Documento consultado */}
          <div className="text-xs text-muted-foreground">
            <span className="truncate block">
              {consultation.document && consultation.document !== 'CPF consultado' ? 
                `${formatCPF(consultation.document)}` : 
                `ID: ${consultation.id.replace('consultation-', '').slice(0, 6)}`}
            </span>
          </div>

          {/* Informações de desconto */}
          {showDiscount && (
            <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
              Eco: {formatBrazilianCurrency(savings)}
            </div>
          )}

          {/* Footer com data e método de pagamento */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">
                {new Date(consultation.created_at).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit' 
                })}
              </span>
            </div>
            <Badge variant="secondary" className={`text-xs px-1 py-0 ${usedClass} flex-shrink-0`}>
              {usedLabel === 'Carteira' ? 'Carteira' : usedLabel === 'Saldo do Plano' ? 'Plano' : usedLabel === 'Plano + Carteira' ? 'Misto' : 'Carteira'}
            </Badge>
          </div>
        </div>
      ) : (
        /* Layout Desktop */
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-semibold text-foreground">
                    Consulta {getModuleTypeLabel()}
                  </h5>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center">
                      {getStatusIcon()}
                      <span className="ml-1">{getStatusText()}</span>
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      ID: {consultation.id.replace('consultation-', '')}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                Consulta realizada {consultation.module_type?.toUpperCase() === 'CPF' ? 'para o CPF' : 'para o documento'}{' '}
                <span className="font-medium">{formatCPF(consultation.document || '')}</span>
              </p>
            
              {/* Informações de desconto */}
              {showDiscount && (
                <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded mb-2">
                  ✅ Economizou: {formatBrazilianCurrency(savings)} 
                  {consultation.discount_percent ? ` (${consultation.discount_percent}%)` : ''}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(consultation.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  <Badge variant="secondary" className={`text-xs ${usedClass}`}>
                    {usedLabel}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold text-red-600 dark:text-red-400 mb-1">
                -{formatBrazilianCurrency(consultationValue)}
              </div>
              
              {showDiscount && (
                <div className="text-xs text-muted-foreground line-through mb-1">
                  Valor original: {formatBrazilianCurrency(consultation.original_price!)}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">Valor cobrado</p>
              <div className="mt-2 flex items-center justify-end gap-1">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-xs text-red-600 dark:text-red-400">Debitado</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileConsultationCard;