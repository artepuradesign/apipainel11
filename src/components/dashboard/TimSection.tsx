import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Copy } from 'lucide-react';
import { useBaseTim } from '@/hooks/useBaseTim';
import { toast } from "sonner";

interface TimSectionProps {
  cpfId: number;
}

const TimSection: React.FC<TimSectionProps> = ({ cpfId }) => {
  const { getTimsByCpfId, tims, isLoading } = useBaseTim();
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (cpfId && !dataLoaded) {
      getTimsByCpfId(cpfId).then(() => {
        setDataLoaded(true);
      });
    }
  }, [cpfId, getTimsByCpfId, dataLoaded]);

  const copyTimData = () => {
    if (!tims || tims.length === 0) return;
    
    const dados = tims.map((tim, idx) => 
      `Tim ${idx + 1}:\n` +
      `Nome: ${tim.nome || '-'}\n` +
      `DDD: ${tim.ddd || '-'}\n` +
      `Telefone: ${tim.tel || '-'}\n` +
      `Operadora: ${tim.operadora || '-'}\n` +
      `Endereço: ${tim.logradouro || '-'}, ${tim.numero || '-'}\n` +
      `Bairro: ${tim.bairro || '-'}\n` +
      `Cidade: ${tim.cidade || '-'}\n` +
      `UF: ${tim.uf || '-'}\n` +
      `CEP: ${tim.cep || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados da Tim copiados!');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Phone className="h-5 w-5" />
            Operadora Tim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tims || tims.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Phone className="h-5 w-5" />
            Operadora Tim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Phone className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum registro encontrado</p>
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
              <Phone className="h-5 w-5" />
              Operadora Tim
            </CardTitle>
            <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
              {tims.length}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyTimData}
            className="h-8 w-8"
            title="Copiar dados da seção"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tims.map((tim, index) => (
          <div key={tim.id || index}>
            {index > 0 && <div className="border-t pt-3"></div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`nome_${tim.id}`}>Nome</Label>
                <Input
                  id={`nome_${tim.id}`}
                  value={tim.nome?.toUpperCase() || '-'}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`ddd_${tim.id}`}>DDD</Label>
                <Input
                  id={`ddd_${tim.id}`}
                  value={tim.ddd || '-'}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`tel_${tim.id}`}>Telefone</Label>
                <Input
                  id={`tel_${tim.id}`}
                  value={tim.tel || '-'}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`operadora_${tim.id}`}>Operadora</Label>
                <Input
                  id={`operadora_${tim.id}`}
                  value={tim.operadora?.toUpperCase() || '-'}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`tipo_logradouro_${tim.id}`}>Tipo Logradouro</Label>
                <Input
                  id={`tipo_logradouro_${tim.id}`}
                  value={tim.tipoLogradouro?.toUpperCase() || '-'}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`logradouro_${tim.id}`}>Logradouro</Label>
                <Input
                  id={`logradouro_${tim.id}`}
                  value={tim.logradouro?.toUpperCase() || '-'}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`numero_${tim.id}`}>Número</Label>
                <Input
                  id={`numero_${tim.id}`}
                  value={tim.numero || '-'}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`complemento_${tim.id}`}>Complemento</Label>
                <Input
                  id={`complemento_${tim.id}`}
                  value={tim.complemento?.toUpperCase() || '-'}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`bairro_${tim.id}`}>Bairro</Label>
                <Input
                  id={`bairro_${tim.id}`}
                  value={tim.bairro?.toUpperCase() || '-'}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`cidade_${tim.id}`}>Cidade</Label>
                <Input
                  id={`cidade_${tim.id}`}
                  value={tim.cidade?.toUpperCase() || '-'}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`uf_${tim.id}`}>UF</Label>
                <Input
                  id={`uf_${tim.id}`}
                  value={tim.uf?.toUpperCase() || '-'}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor={`cep_${tim.id}`}>CEP</Label>
                <Input
                  id={`cep_${tim.id}`}
                  value={tim.cep || '-'}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TimSection;