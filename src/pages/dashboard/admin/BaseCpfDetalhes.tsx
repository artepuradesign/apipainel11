import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Calendar, User, Phone, Mail, MapPin, Building, Car, Shield, DollarSign, Briefcase } from 'lucide-react';
import { toast } from "sonner";
import { baseCpfService, BaseCpf } from '@/services/baseCpfService';
import { getErrorMessage } from '@/utils/errorMessages';

const BaseCpfDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cpf, setCpf] = useState<BaseCpf | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCpfData();
    }
  }, [id]);

  const loadCpfData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      console.log('📊 [CPF_DETALHES] Loading CPF data for ID:', id);
      const response = await baseCpfService.getById(Number(id));
      console.log('📊 [CPF_DETALHES] Response:', response);
      
      if (response.success && response.data) {
        setCpf(response.data);
        console.log('✅ [CPF_DETALHES] CPF data loaded:', response.data);
      } else {
        console.error('❌ [CPF_DETALHES] Failed to load CPF data:', response.error);
        toast.error(response.error || 'Erro ao carregar dados do CPF');
        navigate('/dashboard/admin/base-cpf');
      }
    } catch (error) {
      console.error('❌ [CPF_DETALHES] Load error:', error);
      toast.error(getErrorMessage(error));
      navigate('/dashboard/admin/base-cpf');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!cpf || !cpf.id) return;

    if (window.confirm(`Tem certeza que deseja deletar o CPF ${cpf.cpf} - ${cpf.nome}?`)) {
      try {
        console.log('🗑️ [CPF_DETALHES] Deleting CPF:', cpf.id);
        
        const response = await baseCpfService.delete(cpf.id);
        console.log('✅ [CPF_DETALHES] Delete response:', response);
        
        if (response.success) {
          toast.success('CPF deletado com sucesso');
          navigate('/dashboard/admin/base-cpf');
        } else {
          throw new Error(response.error || 'Erro ao deletar CPF');
        }
      } catch (error) {
        console.error('❌ [CPF_DETALHES] Delete error:', error);
        toast.error(getErrorMessage(error));
      }
    }
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4 text-muted-foreground">Carregando dados do CPF...</p>
      </div>
    );
  }

  if (!cpf) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">CPF não encontrado</p>
        <Button onClick={() => navigate('/dashboard/admin/base-cpf')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar à Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/dashboard/admin/base-cpf')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detalhes do CPF</h1>
            <p className="text-muted-foreground">
              {formatCpf(cpf.cpf)} - {cpf.nome}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">CPF</label>
              <p className="font-mono text-lg">{formatCpf(cpf.cpf)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="text-lg">{cpf.nome}</p>
            </div>
            {cpf.data_nascimento && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                <p className="text-lg">{formatDate(cpf.data_nascimento)}</p>
              </div>
            )}
            {cpf.sexo && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sexo</label>
                <p className="text-lg">{cpf.sexo}</p>
              </div>
            )}
            {cpf.mae && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome da Mãe</label>
                <p className="text-lg">{cpf.mae}</p>
              </div>
            )}
            {cpf.pai && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome do Pai</label>
                <p className="text-lg">{cpf.pai}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      {(cpf.telefones || cpf.emails) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contatos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cpf.telefones && Array.isArray(cpf.telefones) && cpf.telefones.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefones</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {cpf.telefones.map((telefone: any, index: number) => (
                    <Badge key={index} variant="outline">
                      {telefone.numero || telefone}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {cpf.emails && Array.isArray(cpf.emails) && cpf.emails.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">E-mails</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {cpf.emails.map((email: any, index: number) => (
                    <Badge key={index} variant="outline">
                      {email.email || email}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Addresses */}
      {cpf.enderecos && Array.isArray(cpf.enderecos) && cpf.enderecos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cpf.enderecos.map((endereco: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {endereco.logradouro && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Logradouro: </span>
                        <span>{endereco.logradouro}</span>
                      </div>
                    )}
                    {endereco.numero && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Número: </span>
                        <span>{endereco.numero}</span>
                      </div>
                    )}
                    {endereco.bairro && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Bairro: </span>
                        <span>{endereco.bairro}</span>
                      </div>
                    )}
                    {endereco.cidade && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Cidade: </span>
                        <span>{endereco.cidade}</span>
                      </div>
                    )}
                    {endereco.uf && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">UF: </span>
                        <span>{endereco.uf}</span>
                      </div>
                    )}
                    {endereco.cep && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">CEP: </span>
                        <span>{endereco.cep}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatives */}
      {cpf.parentes && Array.isArray(cpf.parentes) && cpf.parentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Parentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cpf.parentes.map((parente: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {parente.nome && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Nome: </span>
                        <span>{parente.nome}</span>
                      </div>
                    )}
                    {parente.parentesco && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Parentesco: </span>
                        <span>{parente.parentesco}</span>
                      </div>
                    )}
                    {parente.cpf && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">CPF: </span>
                        <span className="font-mono">{formatCpf(parente.cpf)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Companies */}
      {cpf.empresas_socio && Array.isArray(cpf.empresas_socio) && cpf.empresas_socio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
               Empresas Associadas (SÓCIO)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cpf.empresas_socio.map((empresa: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {empresa.razao_social && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Razão Social: </span>
                        <span>{empresa.razao_social}</span>
                      </div>
                    )}
                    {empresa.cnpj && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">CNPJ: </span>
                        <span className="font-mono">{empresa.cnpj}</span>
                      </div>
                    )}
                    {empresa.situacao && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Situação: </span>
                        <Badge variant={empresa.situacao === "ATIVA" ? "default" : "secondary"}>
                          {empresa.situacao}
                        </Badge>
                      </div>
                    )}
                    {empresa.participacao && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Participação: </span>
                        <span>{empresa.participacao}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicles */}
      {cpf.historico_veiculos && Array.isArray(cpf.historico_veiculos) && cpf.historico_veiculos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Histórico de Veículos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cpf.historico_veiculos.map((veiculo: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {veiculo.placa && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Placa: </span>
                        <span className="font-mono">{veiculo.placa}</span>
                      </div>
                    )}
                    {veiculo.marca && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Marca: </span>
                        <span>{veiculo.marca}</span>
                      </div>
                    )}
                    {veiculo.modelo && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Modelo: </span>
                        <span>{veiculo.modelo}</span>
                      </div>
                    )}
                    {veiculo.ano && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Ano: </span>
                        <span>{veiculo.ano}</span>
                      </div>
                    )}
                    {veiculo.cor && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Cor: </span>
                        <span>{veiculo.cor}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      {cpf.created_at && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
                <p>{formatDateTime(cpf.created_at)}</p>
              </div>
              {cpf.updated_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
                  <p>{formatDateTime(cpf.updated_at)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BaseCpfDetalhes;