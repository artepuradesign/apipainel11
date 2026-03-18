import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { CreateBaseParente } from '@/services/baseParenteService';

interface ParenteFormProps {
  parentes: Partial<CreateBaseParente>[];
  onChange: (parentes: Partial<CreateBaseParente>[]) => void;
}

const ParenteForm: React.FC<ParenteFormProps> = ({ parentes, onChange }) => {
  // Sempre garantir que haja pelo menos um formulário vazio
  React.useEffect(() => {
    if (parentes.length === 0) {
      onChange([{ nome_vinculo: '', vinculo: '', cpf_vinculo: '' }]);
    }
  }, []);

  const vinculoOptions = [
    { value: 'PAI', label: 'Pai' },
    { value: 'MAE', label: 'Mãe' },
    { value: 'FILHO', label: 'Filho(a)' },
    { value: 'IRMAO', label: 'Irmão(ã)' },
    { value: 'CONJUGE', label: 'Cônjuge' },
    { value: 'AVO', label: 'Avô/Avó' },
    { value: 'NETO', label: 'Neto(a)' },
    { value: 'TIO', label: 'Tio(a)' },
    { value: 'SOBRINHO', label: 'Sobrinho(a)' },
    { value: 'PRIMO', label: 'Primo(a)' },
    { value: 'OUTRO', label: 'Outro' }
  ];


  const updateParente = (index: number, field: string, value: string) => {
    const updated = [...parentes];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeParente = (index: number) => {
    if (parentes.length > 1) {
      onChange(parentes.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      {parentes.map((parente, index) => (
        <React.Fragment key={index}>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Parente {index + 1}</h4>
            {parentes.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeParente(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor={`nome_vinculo_${index}`}>Nome do Parente *</Label>
              <Input
                id={`nome_vinculo_${index}`}
                value={parente.nome_vinculo || ''}
                onChange={(e) => updateParente(index, 'nome_vinculo', e.target.value)}
                placeholder="Nome completo"
                className="placeholder:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`vinculo_${index}`}>Tipo de Vínculo *</Label>
              <Select
                value={parente.vinculo || ''}
                onValueChange={(value) => updateParente(index, 'vinculo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {vinculoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`cpf_vinculo_${index}`}>CPF do Parente</Label>
              <Input
                id={`cpf_vinculo_${index}`}
                value={parente.cpf_vinculo || ''}
                onChange={(e) => updateParente(index, 'cpf_vinculo', e.target.value)}
                placeholder="000.000.000-00"
                className="placeholder:text-sm"
              />
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ParenteForm;
