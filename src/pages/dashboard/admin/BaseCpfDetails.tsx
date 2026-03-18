import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Calendar, MapPin, Phone, Mail, Building, Car, Shield, CreditCard, Briefcase, FileText, AlertTriangle } from 'lucide-react';
import { baseCpfService, BaseCpf } from '@/services/baseCpfService';
import { toast } from "sonner";
import { formatDateOnly } from '@/utils/formatters';

const BaseCpfDetails = () => {
  const { cpfId } = useParams<{ cpfId: string }>();
  const navigate = useNavigate();
  const [cpfData, setCpfData] = useState<BaseCpf | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cpfId) {
      loadCpfData();
    }
  }, [cpfId]);

  const loadCpfData = async () => {
    if (!cpfId) return;
    
    setLoading(true);
    try {
      const response = await baseCpfService.getById(parseInt(cpfId));
      if (response.success && response.data) {
        setCpfData(response.data);
      } else {
        toast.error('CPF não encontrado');
        navigate('/dashboard/admin/base-cpf');
      }
    } catch (error) {
      console.error('Erro ao carregar CPF:', error);
      toast.error('Erro ao carregar dados do CPF');
      navigate('/dashboard/admin/base-cpf');
    } finally {
      setLoading(false);
    }
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    return formatDateOnly(dateString);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDataSection = (title: string, icon: React.ElementType, data: any, fields: { key: string, label: string, format?: (value: any) => string }[]) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return null;

    const Icon = icon;
    const dataArray = Array.isArray(data) ? data : [data];

    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dataArray.map((item, index) => (
            <div key={index} className="space-y-2">
              {index > 0 && <Separator />}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.map((field) => {
                  const value = item[field.key];
                  if (!value && value !== 0) return null;
                  
                  return (
                    <div key={field.key} className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{field.label}:</p>
                      <p className="text-sm">
                        {field.format ? field.format(value) : value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/admin/base-cpf')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-32 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!cpfData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/admin/base-cpf')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">CPF não encontrado</h3>
            <p className="text-muted-foreground">O CPF solicitado não foi encontrado na base de dados.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/admin/base-cpf')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalhes do CPF</h1>
            <p className="text-muted-foreground">{formatCpf(cpfData.cpf)} - {cpfData.nome}</p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit">
          Cadastrado em {formatDate(cpfData.created_at)}
        </Badge>
      </div>

      {/* Dados Básicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">CPF:</p>
              <p className="font-mono text-lg">{formatCpf(cpfData.cpf)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Nome Completo:</p>
              <p className="text-lg">{cpfData.nome}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Data de Nascimento:</p>
              <p>{formatDate(cpfData.data_nascimento)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status:</p>
              <p>Ativo</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Cadastrado em:</p>
              <p>{formatDateTime(cpfData.created_at)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Última atualização:</p>
              <p>{formatDateTime(cpfData.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parentes */}
      {renderDataSection(
        'Parentes',
        User,
        cpfData.parentes,
        [
          { key: 'nome', label: 'Nome' },
          { key: 'relacao', label: 'Relação' },
          { key: 'cpf', label: 'CPF', format: (value) => value ? formatCpf(value) : '-' }
        ]
      )}

      {/* Endereços */}
      {renderDataSection(
        'Endereços',
        MapPin,
        cpfData.enderecos,
        [
          { key: 'logradouro', label: 'Logradouro' },
          { key: 'numero', label: 'Número' },
          { key: 'bairro', label: 'Bairro' },
          { key: 'cidade', label: 'Cidade' },
          { key: 'uf', label: 'UF' },
          { key: 'cep', label: 'CEP' }
        ]
      )}

      {/* Telefones */}
      {renderDataSection(
        'Telefones',
        Phone,
        cpfData.telefones,
        [
          { key: 'numero', label: 'Número' },
          { key: 'tipo', label: 'Tipo' },
          { key: 'operadora', label: 'Operadora' }
        ]
      )}

      {/* Emails */}
      {renderDataSection(
        'E-mails',
        Mail,
        cpfData.emails,
        [
          { key: 'email', label: 'E-mail' },
          { key: 'tipo', label: 'Tipo' }
        ]
      )}

      {/* Empresas */}
      {renderDataSection(
        'Empresas Associadas (SÓCIO)',
        Building,
        cpfData.empresas_socio,
        [
          { key: 'razao_social', label: 'Razão Social' },
          { key: 'cnpj', label: 'CNPJ' },
          { key: 'participacao', label: 'Participação' },
          { key: 'data_entrada', label: 'Data de Entrada', format: formatDate }
        ]
      )}

      {/* CNPJ MEI */}
      {renderDataSection(
        'CNPJ MEI',
        Briefcase,
        cpfData.cnpj_mei,
        [
          { key: 'cnpj', label: 'CNPJ' },
          { key: 'razao_social', label: 'Razão Social' },
          { key: 'situacao', label: 'Situação' },
          { key: 'data_abertura', label: 'Data de Abertura', format: formatDate }
        ]
      )}

      {/* Veículos */}
      {renderDataSection(
        'Histórico de Veículos',
        Car,
        cpfData.historico_veiculos,
        [
          { key: 'placa', label: 'Placa' },
          { key: 'marca', label: 'Marca' },
          { key: 'modelo', label: 'Modelo' },
          { key: 'ano', label: 'Ano' },
          { key: 'cor', label: 'Cor' }
        ]
      )}

      {/* Dados INSS */}
      {renderDataSection(
        'Dados INSS',
        CreditCard,
        cpfData.inss_dados,
        [
          { key: 'beneficio', label: 'Benefício' },
          { key: 'valor', label: 'Valor' },
          { key: 'data_inicio', label: 'Data de Início', format: formatDate },
          { key: 'status', label: 'Status' }
        ]
      )}

      {/* Dívidas Ativas */}
      {renderDataSection(
        'Dívidas Ativas',
        AlertTriangle,
        cpfData.dividas_ativas,
        [
          { key: 'origem', label: 'Origem' },
          { key: 'valor', label: 'Valor' },
          { key: 'data_inscricao', label: 'Data de Inscrição', format: formatDate },
          { key: 'situacao', label: 'Situação' }
        ]
      )}

      {/* Auxílio Emergencial */}
      {renderDataSection(
        'Auxílio Emergencial',
        Shield,
        cpfData.auxilio_emergencial,
        [
          { key: 'parcela', label: 'Parcela' },
          { key: 'valor', label: 'Valor' },
          { key: 'data_pagamento', label: 'Data de Pagamento', format: formatDate },
          { key: 'banco', label: 'Banco' }
        ]
      )}

      {/* RAIS Histórico */}
      {renderDataSection(
        'Histórico RAIS',
        FileText,
        cpfData.rais_historico,
        [
          { key: 'empresa', label: 'Empresa' },
          { key: 'cargo', label: 'Cargo' },
          { key: 'salario', label: 'Salário' },
          { key: 'ano', label: 'Ano' }
        ]
      )}

      {/* Operadoras */}
      {cpfData.operadora_vivo && renderDataSection(
        'Operadora Vivo',
        Phone,
        cpfData.operadora_vivo,
        [
          { key: 'numero', label: 'Número' },
          { key: 'plano', label: 'Plano' },
          { key: 'status', label: 'Status' }
        ]
      )}

      {cpfData.operadora_claro && renderDataSection(
        'Operadora Claro',
        Phone,
        cpfData.operadora_claro,
        [
          { key: 'numero', label: 'Número' },
          { key: 'plano', label: 'Plano' },
          { key: 'status', label: 'Status' }
        ]
      )}

      {cpfData.operadora_tim && renderDataSection(
        'Operadora TIM',
        Phone,
        cpfData.operadora_tim,
        [
          { key: 'numero', label: 'Número' },
          { key: 'plano', label: 'Plano' },
          { key: 'status', label: 'Status' }
        ]
      )}

      {/* Vacinas COVID */}
      {renderDataSection(
        'Vacinas COVID-19',
        Shield,
        cpfData.vacinas_covid,
        [
          { key: 'dose', label: 'Dose' },
          { key: 'vacina', label: 'Vacina' },
          { key: 'data_aplicacao', label: 'Data de Aplicação', format: formatDate },
          { key: 'local', label: 'Local' }
        ]
      )}

      {/* Senhas Vazadas */}
      {(cpfData.senhas_vazadas_email || cpfData.senhas_vazadas_cpf) && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Senhas Vazadas
            </CardTitle>
            <CardDescription>
              Informações sobre vazamentos de dados encontrados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cpfData.senhas_vazadas_email && (
              <div>
                <h4 className="font-medium mb-2">Por E-mail:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(Array.isArray(cpfData.senhas_vazadas_email) ? cpfData.senhas_vazadas_email : [cpfData.senhas_vazadas_email]).map((item: any, index: number) => (
                    <div key={index} className="space-y-1">
                      <p className="text-sm"><strong>Site:</strong> {item.site || '-'}</p>
                      <p className="text-sm"><strong>E-mail:</strong> {item.email || '-'}</p>
                      <p className="text-sm"><strong>Data:</strong> {formatDate(item.data) || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {cpfData.senhas_vazadas_cpf && (
              <div>
                <h4 className="font-medium mb-2">Por CPF:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(Array.isArray(cpfData.senhas_vazadas_cpf) ? cpfData.senhas_vazadas_cpf : [cpfData.senhas_vazadas_cpf]).map((item: any, index: number) => (
                    <div key={index} className="space-y-1">
                      <p className="text-sm"><strong>Site:</strong> {item.site || '-'}</p>
                      <p className="text-sm"><strong>CPF:</strong> {item.cpf ? formatCpf(item.cpf) : '-'}</p>
                      <p className="text-sm"><strong>Data:</strong> {formatDate(item.data) || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cloud Data */}
      {(cpfData.cloud_cpf || cpfData.cloud_email) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Dados na Nuvem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cpfData.cloud_cpf && (
              <div>
                <h4 className="font-medium mb-2">Cloud CPF:</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {JSON.stringify(cpfData.cloud_cpf, null, 2)}
                </pre>
              </div>
            )}
            
            {cpfData.cloud_email && (
              <div>
                <h4 className="font-medium mb-2">Cloud E-mail:</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {JSON.stringify(cpfData.cloud_email, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BaseCpfDetails;