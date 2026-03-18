import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus } from 'lucide-react';
import { CreateBaseDividasAtivas } from '@/services/baseDividasAtivasService';
import DividasAtivasForm from './DividasAtivasForm';

interface DividasAtivasSectionProps {
  dividasAtivas: Partial<CreateBaseDividasAtivas>[];
  onChange: (dividasAtivas: Partial<CreateBaseDividasAtivas>[]) => void;
}

const DividasAtivasSection: React.FC<DividasAtivasSectionProps> = ({ dividasAtivas, onChange }) => {
  // Garantir que sempre haja pelo menos uma dívida ativa para cadastrar
  React.useEffect(() => {
    if (dividasAtivas.length === 0) {
      addDividaAtiva();
    }
  }, []);

  const addDividaAtiva = () => {
    const newDivida: Partial<CreateBaseDividasAtivas> = {
      cpf_id: '', // Será preenchido após criação do CPF
      tipo_devedor: '',
      nome_devedor: '',
      uf_devedor: '',
      numero_inscricao: '',
      tipo_situacao_inscricao: '',
      situacao_inscricao: '',
      receita_principal: '',
      data_inscricao: '',
      indicador_ajuizado: '',
      valor_consolidado: 0
    };
    onChange([...dividasAtivas, newDivida]);
  };

  const updateDividaAtiva = (index: number, field: string, value: string) => {
    const updated = [...dividasAtivas];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeDividaAtiva = (index: number) => {
    if (dividasAtivas.length > 1) {
      const updated = dividasAtivas.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
          <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
          Dívidas Ativas (SIDA)
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1">
          Informações sobre dívidas ativas do contribuinte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">        
        {dividasAtivas.map((divida, index) => (
          <div key={index} className="space-y-4">
        {index > 0 && (
              <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/10">
                <h4 className="font-medium">Dívida Ativa {index + 1}</h4>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeDividaAtiva(index)}
                >
                  Remover
                </Button>
              </div>
            )}
            
            <DividasAtivasForm
              data={divida}
              onChange={(field, value) => updateDividaAtiva(index, field, value)}
            />
          </div>
        ))}
        
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addDividaAtiva}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </CardContent>
    </Card>
  );
};

export default DividasAtivasSection;