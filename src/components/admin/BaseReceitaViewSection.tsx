import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, QrCode } from 'lucide-react';
import { BaseReceita } from '@/services/baseReceitaService';
import QRCode from 'react-qr-code';

interface BaseReceitaViewSectionProps {
  data: BaseReceita | null;
  loading?: boolean;
}

const BaseReceitaViewSection: React.FC<BaseReceitaViewSectionProps> = ({ data, loading }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getSituacaoColor = (situacao: string) => {
    const situacaoLower = situacao.toLowerCase();
    if (situacaoLower.includes('regular') || situacaoLower.includes('ativa')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (situacaoLower.includes('suspen') || situacaoLower.includes('cancelad')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    if (situacaoLower.includes('pendente') || situacaoLower.includes('analise')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const renderField = (label: string, value: any, type: 'text' | 'date' | 'datetime' = 'text') => {
    let displayValue = 'Não informado';
    
    if (value !== null && value !== undefined && value !== '') {
      switch (type) {
        case 'date':
          displayValue = formatDate(value);
          break;
        case 'datetime':
          displayValue = formatDateTime(value);
          break;
        default:
          displayValue = String(value);
      }
    }

    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <p className="text-sm">{displayValue}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Receita Federal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Receita Federal
          </CardTitle>
          <CardDescription>
            Dados oficiais da Receita Federal do Brasil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm">
              Dados da Receita Federal não encontrados para este CPF
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Receita Federal
        </CardTitle>
        <CardDescription>
          Dados oficiais da Receita Federal do Brasil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Dados principais */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Situação Cadastral
                </label>
                <div className="mt-1">
                  <Badge className={getSituacaoColor(data.situacao_cadastral)}>
                    {data.situacao_cadastral}
                  </Badge>
                </div>
              </div>

              {renderField('Data de Inscrição', data.data_inscricao, 'date')}
              {renderField('Dígito Verificador', data.digito_verificador)}
              {renderField('Data de Emissão', data.data_emissao, 'datetime')}
              {renderField('Código de Controle', data.codigo_controle)}
            </div>
          </div>
          
          {/* QR Code */}
          <div className="flex-shrink-0">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">QR Code Receita</label>
              <div className="flex items-center justify-center p-4 border rounded-lg bg-background/50">
                {data.qr_link ? (
                  <div className="w-32 h-32 flex items-center justify-center">
                    <QRCode
                      value={data.qr_link}
                      size={120}
                      style={{ height: "120px", width: "120px" }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground w-32 h-32 justify-center">
                    <QrCode className="h-10 w-10" />
                    <span className="text-xs text-center">QR Code não disponível</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {(data.created_at || data.updated_at) && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.created_at && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Data de Criação do Registro
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDateTime(data.created_at)}
                  </p>
                </div>
              )}
              {data.updated_at && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Última Atualização
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDateTime(data.updated_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BaseReceitaViewSection;