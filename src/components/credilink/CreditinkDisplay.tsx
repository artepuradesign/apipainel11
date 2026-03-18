import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, Copy } from 'lucide-react';
import { BaseCredilink } from '@/services/baseCreditinkService';
import { useBaseCredilink } from '@/hooks/useBaseCredilink';
import { toast } from "sonner";

interface CreditinkDisplayProps {
  cpfId: number;
}

const CreditinkDisplay = ({ cpfId }: CreditinkDisplayProps) => {
  const [credilinks, setCredilinks] = useState<BaseCredilink[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCreditinksByCpfId } = useBaseCredilink();

  useEffect(() => {
    const loadCredilinks = async () => {
      if (!cpfId) return;
      
      setLoading(true);
      try {
        const data = await getCreditinksByCpfId(cpfId);
        setCredilinks(data);
      } catch (error) {
        console.error('Erro ao carregar dados Credilink:', error);
        setCredilinks([]);
      } finally {
        setLoading(false);
      }
    };

    loadCredilinks();
  }, [cpfId, getCreditinksByCpfId]);

  const copyCreditinkData = () => {
    if (credilinks.length === 0) return;
    
    const dados = credilinks.map((credilink, idx) => 
      `Credilink ${idx + 1}:\n` +
      `Nome: ${credilink.nome || '-'}\n` +
      `Nome da Mãe: ${credilink.nome_mae || '-'}\n` +
      `Email: ${credilink.email || '-'}\n` +
      `Telefones: ${credilink.telefones || '-'}\n` +
      `Status Receita Federal: ${credilink.status_receita_federal || '-'}\n` +
      `CBO: ${credilink.cbo || '-'}\n` +
      `Renda Presumida: ${credilink.renda_presumida ? `R$ ${credilink.renda_presumida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}\n` +
      `UF: ${credilink.uf || '-'}\n` +
      `Cidade: ${credilink.cidade || '-'}\n` +
      `Logradouro: ${credilink.logradouro || '-'}\n` +
      `Número: ${credilink.numero || '-'}\n` +
      `Bairro: ${credilink.bairro || '-'}\n` +
      `CEP: ${credilink.cep || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados Credilink copiados!');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Database className="h-5 w-5" />
            Credilink
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!credilinks || credilinks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Database className="h-5 w-5" />
            Credilink
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Database className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm">
              Nenhum dado Credilink encontrado
            </p>
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
              <Database className="h-5 w-5" />
              Credilink
            </CardTitle>
            {credilinks.length > 0 && (
              <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                {credilinks.length}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyCreditinkData}
            className="h-8 w-8"
            title="Copiar dados da seção"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {credilinks.map((credilink, index) => (
          <div key={credilink.id} className="space-y-4">
            {index > 0 && <div className="border-t pt-4 mb-4" />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`nome_${credilink.id}`}>Nome</Label>
                <Input
                  id={`nome_${credilink.id}`}
                  value={credilink.nome || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`nome_mae_${credilink.id}`}>Nome da Mãe</Label>
                <Input
                  id={`nome_mae_${credilink.id}`}
                  value={credilink.nome_mae || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`email_${credilink.id}`}>E-mail</Label>
                <Input
                  id={`email_${credilink.id}`}
                  value={credilink.email || ''}
                  disabled
                  className="bg-muted lowercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`data_obito_${credilink.id}`}>Data do Óbito</Label>
                <Input
                  id={`data_obito_${credilink.id}`}
                  value={credilink.data_obito || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`status_${credilink.id}`}>Status da Receita Federal</Label>
                <Input
                  id={`status_${credilink.id}`}
                  value={credilink.status_receita_federal || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`participacao_${credilink.id}`}>Percentual de Participação</Label>
                <Input
                  id={`participacao_${credilink.id}`}
                  value={credilink.percentual_participacao || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`cbo_${credilink.id}`}>CBO</Label>
                <Input
                  id={`cbo_${credilink.id}`}
                  value={credilink.cbo || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`renda_${credilink.id}`}>Renda Presumida</Label>
                <Input
                  id={`renda_${credilink.id}`}
                  value={credilink.renda_presumida ? `R$ ${credilink.renda_presumida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`telefones_${credilink.id}`}>Telefones</Label>
                <Input
                  id={`telefones_${credilink.id}`}
                  value={credilink.telefones || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`uf_${credilink.id}`}>UF</Label>
                <Input
                  id={`uf_${credilink.id}`}
                  value={credilink.uf || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`estado_${credilink.id}`}>Estado</Label>
                <Input
                  id={`estado_${credilink.id}`}
                  value={credilink.estado || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`cidade_${credilink.id}`}>Cidade</Label>
                <Input
                  id={`cidade_${credilink.id}`}
                  value={credilink.cidade || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`tipo_endereco_${credilink.id}`}>Tipo Endereço</Label>
                <Input
                  id={`tipo_endereco_${credilink.id}`}
                  value={credilink.tipo_endereco || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`logradouro_${credilink.id}`}>Logradouro</Label>
                <Input
                  id={`logradouro_${credilink.id}`}
                  value={credilink.logradouro || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`numero_${credilink.id}`}>Número</Label>
                <Input
                  id={`numero_${credilink.id}`}
                  value={credilink.numero || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`complemento_${credilink.id}`}>Complemento</Label>
                <Input
                  id={`complemento_${credilink.id}`}
                  value={credilink.complemento || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`bairro_${credilink.id}`}>Bairro</Label>
                <Input
                  id={`bairro_${credilink.id}`}
                  value={credilink.bairro || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
              
              <div>
                <Label htmlFor={`cep_${credilink.id}`}>CEP</Label>
                <Input
                  id={`cep_${credilink.id}`}
                  value={credilink.cep || ''}
                  disabled
                  className="bg-muted uppercase"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CreditinkDisplay;