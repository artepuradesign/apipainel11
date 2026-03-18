import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from 'lucide-react';
import { useBaseCnh } from '@/hooks/useBaseCnh';
import { BaseCnh } from '@/services/baseCnhService';
import { formatDateOnly } from '@/utils/formatters';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface CnhSectionProps {
  cpfId?: number;
}

const CnhSection: React.FC<CnhSectionProps> = ({ cpfId }) => {
  const { isLoading, getCnhsByCpfId } = useBaseCnh();
  const [cnhs, setCnhs] = useState<BaseCnh[]>([]);

  useEffect(() => {
    const loadCnhs = async () => {
      if (cpfId) {
        const result = await getCnhsByCpfId(cpfId);
        if (result) {
          setCnhs(result);
        }
      }
    };

    loadCnhs();
  }, [cpfId, getCnhsByCpfId]);

  const getSituacaoColor = (situacao: string) => {
    switch (situacao.toLowerCase()) {
      case 'ativa':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'vencida':
        return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'suspensa':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'cassada':
        return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria.toUpperCase()) {
      case 'A':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'B':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'C':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'D':
        return 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'E':
        return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <CreditCard className="h-5 w-5" />
            CNH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm">Carregando documentos CNH...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <CreditCard className="h-5 w-5" />
              CNH
            </CardTitle>
            {cnhs.length > 0 && (
              <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                {cnhs.length}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {cnhs.length > 0 ? (
          <div className="space-y-4">
            {cnhs.map((cnh) => {
              // Função para renderizar campo apenas se tiver valor
              const renderField = (label: string, value: any, isDate = false) => {
                if (!value) return null;
                return (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{label}</label>
                    <p className="text-sm">{isDate ? formatDateOnly(value) : value}</p>
                  </div>
                );
              };

              // Contar quantos campos têm dados
              const fieldsWithData = [
                cnh.n_espelho,
                cnh.nome,
                cnh.doc_identidade,
                cnh.orgao_expedidor,
                cnh.uf_emissao,
                cnh.data_nascimento,
                cnh.pai,
                cnh.mae,
                cnh.permissao,
                cnh.acc,
                cnh.cat_hab,
                cnh.n_registro,
                cnh.validade,
                cnh.primeira_habilitacao,
                cnh.local,
                cnh.data_emissao,
                cnh.diretor,
                cnh.n_seg1,
                cnh.n_renach,
                cnh.observacoes
              ].filter(Boolean).length;

              return (
                <div key={cnh.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">CNH: {cnh.n_espelho || 'Não informado'}</span>
                    {cnh.cat_hab && (
                      <Badge variant="outline" className={getCategoriaColor(cnh.cat_hab)}>
                        Categoria {cnh.cat_hab}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Foto da CNH se disponível */}
                  {cnh.foto_cnh && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-muted-foreground">Foto da CNH</label>
                      <div className="border rounded-lg overflow-hidden mt-2 max-w-sm">
                        <OptimizedImage
                          src={`https://api.apipainel.com.br/fotos/${cnh.foto_cnh}`}
                          alt={`Foto da CNH ${cnh.n_espelho}`}
                          fallbackText="Foto da CNH não encontrada"
                          aspectRatio="aspect-[3/2]"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {renderField('Nome', cnh.nome)}
                    {renderField('Documento Identidade', cnh.doc_identidade)}
                    {renderField('Órgão Expedidor', cnh.orgao_expedidor)}
                    {renderField('UF Emissão', cnh.uf_emissao)}
                    {renderField('Data Nascimento', cnh.data_nascimento, true)}
                    {renderField('Nome do Pai', cnh.pai)}
                    {renderField('Nome da Mãe', cnh.mae)}
                    {renderField('Permissão', cnh.permissao)}
                    {renderField('ACC', cnh.acc)}
                    {renderField('Nº Registro', cnh.n_registro)}
                    {renderField('Validade', cnh.validade, true)}
                    {renderField('Primeira Habilitação', cnh.primeira_habilitacao)}
                    {renderField('Local', cnh.local)}
                    {renderField('Data Emissão', cnh.data_emissao, true)}
                    {renderField('Diretor', cnh.diretor)}
                    {renderField('Nº Seg1', cnh.n_seg1)}
                    {renderField('Nº RENACH', cnh.n_renach)}
                    
                    {cnh.observacoes && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="text-sm font-medium text-muted-foreground">Observações</label>
                        <p className="text-sm">{cnh.observacoes}</p>
                      </div>
                    )}
                  </div>

                  {fieldsWithData < 3 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Alguns dados podem não estar disponíveis
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm">
              Nenhum documento CNH detalhado encontrado para este CPF
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CnhSection;
