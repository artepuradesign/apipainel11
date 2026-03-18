import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, QrCode } from 'lucide-react';
import { BaseReceita } from '@/services/baseReceitaService';
import QRCode from 'react-qr-code';

interface ReceitaFederalDisplayProps {
  data: BaseReceita | null;
  loading?: boolean;
}

const ReceitaFederalDisplay: React.FC<ReceitaFederalDisplayProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
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
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Building2 className="h-5 w-5" />
            Receita Federal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <Building2 className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm">
              Dados da Receita Federal não encontrados para este CPF
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatCpf = (cpf: string) => {
    if (!cpf) return 'Não informado';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
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

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
          <Building2 className="h-5 w-5" />
          Receita Federal
        </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.cpf && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">CPF</label>
                <p className="text-sm">{formatCpf(data.cpf)}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Situação Cadastral</label>
              <div>
                <Badge className={getSituacaoColor(data.situacao_cadastral)}>
                  {data.situacao_cadastral}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Data de Inscrição</label>
              <p className="text-sm">{formatDate(data.data_inscricao)}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Dígito Verificador</label>
              <p className="text-sm">{data.digito_verificador || '-'}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Data de Emissão</label>
              <p className="text-sm">{formatDateTime(data.data_emissao)}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Código de Controle</label>
              <p className="text-sm">{data.codigo_controle || '-'}</p>
            </div>

            {/* QR Code como um campo adicional na grade */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">QR Code Receita</label>
              <div className="flex items-center justify-start">
                {data.qr_link ? (
                  <div className="w-24 h-24 flex items-center justify-center border rounded">
                    <QRCode
                      value={data.qr_link}
                      size={80}
                      style={{ height: "80px", width: "80px" }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground w-24 h-24 justify-center border rounded">
                    <QrCode className="h-6 w-6" />
                    <span className="text-xs text-center">Não disponível</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        {(data.created_at || data.updated_at) && (
          <div className="border-t border-dashed border-gray-300 dark:border-gray-600 pt-4 mt-6">
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

export default ReceitaFederalDisplay;