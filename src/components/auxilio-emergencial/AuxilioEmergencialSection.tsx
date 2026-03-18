import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { CreateBaseAuxilioEmergencial } from '@/services/baseAuxilioEmergencialService';

interface AuxilioEmergencialSectionProps {
  auxiliosEmergenciais: Partial<CreateBaseAuxilioEmergencial>[];
  onChange: (auxiliosEmergenciais: Partial<CreateBaseAuxilioEmergencial>[]) => void;
  onAdd: () => void;
}

const AuxilioEmergencialSection: React.FC<AuxilioEmergencialSectionProps> = ({ auxiliosEmergenciais, onChange, onAdd }) => {
  // Sempre garantir que haja pelo menos um formulário vazio
  React.useEffect(() => {
    if (auxiliosEmergenciais.length === 0) {
      onChange([{
        cpf_id: 0,
        uf: '',
        mes_disponibilizacao: '',
        enquadramento: '',
        parcela: '',
        observacao: '',
        valor_beneficio: 0
      }]);
    }
  }, []);

  const updateAuxilioEmergencial = (index: number, field: string, value: string) => {
    const updated = [...auxiliosEmergenciais];
    // Para campos de texto, converter para maiúsculas
    if (field === 'enquadramento' || field === 'observacao' || field === 'parcela') {
      updated[index] = { ...updated[index], [field]: value.toUpperCase() };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onChange(updated);
  };

  const removeAuxilioEmergencial = (index: number) => {
    if (auxiliosEmergenciais.length > 1) {
      const updated = auxiliosEmergenciais.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  return (
    <div className="space-y-4">
      {auxiliosEmergenciais.map((auxilio, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b last:border-b-0">
          <div className="md:col-span-2 flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm">Auxílio {index + 1}</h4>
            {auxiliosEmergenciais.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAuxilioEmergencial(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div>
            <Label htmlFor={`auxilio_uf_${index}`}>UF</Label>
            <Select 
              value={auxilio.uf || ''} 
              onValueChange={(value) => updateAuxilioEmergencial(index, 'uf', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AC">AC - Acre</SelectItem>
                <SelectItem value="AL">AL - Alagoas</SelectItem>
                <SelectItem value="AP">AP - Amapá</SelectItem>
                <SelectItem value="AM">AM - Amazonas</SelectItem>
                <SelectItem value="BA">BA - Bahia</SelectItem>
                <SelectItem value="CE">CE - Ceará</SelectItem>
                <SelectItem value="DF">DF - Distrito Federal</SelectItem>
                <SelectItem value="ES">ES - Espírito Santo</SelectItem>
                <SelectItem value="GO">GO - Goiás</SelectItem>
                <SelectItem value="MA">MA - Maranhão</SelectItem>
                <SelectItem value="MT">MT - Mato Grosso</SelectItem>
                <SelectItem value="MS">MS - Mato Grosso do Sul</SelectItem>
                <SelectItem value="MG">MG - Minas Gerais</SelectItem>
                <SelectItem value="PA">PA - Pará</SelectItem>
                <SelectItem value="PB">PB - Paraíba</SelectItem>
                <SelectItem value="PR">PR - Paraná</SelectItem>
                <SelectItem value="PE">PE - Pernambuco</SelectItem>
                <SelectItem value="PI">PI - Piauí</SelectItem>
                <SelectItem value="RJ">RJ - Rio de Janeiro</SelectItem>
                <SelectItem value="RN">RN - Rio Grande do Norte</SelectItem>
                <SelectItem value="RS">RS - Rio Grande do Sul</SelectItem>
                <SelectItem value="RO">RO - Rondônia</SelectItem>
                <SelectItem value="RR">RR - Roraima</SelectItem>
                <SelectItem value="SC">SC - Santa Catarina</SelectItem>
                <SelectItem value="SP">SP - São Paulo</SelectItem>
                <SelectItem value="SE">SE - Sergipe</SelectItem>
                <SelectItem value="TO">TO - Tocantins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`auxilio_mes_disponibilizacao_${index}`}>Mês Disponibilização</Label>
            <Input
              id={`auxilio_mes_disponibilizacao_${index}`}
              value={auxilio.mes_disponibilizacao || ''}
              onChange={(e) => updateAuxilioEmergencial(index, 'mes_disponibilizacao', e.target.value)}
              placeholder="Ex: 05/2020"
              className="placeholder:text-sm"
            />
          </div>

          <div>
            <Label htmlFor={`auxilio_enquadramento_${index}`}>Enquadramento</Label>
            <Input
              id={`auxilio_enquadramento_${index}`}
              value={auxilio.enquadramento || ''}
              onChange={(e) => updateAuxilioEmergencial(index, 'enquadramento', e.target.value)}
              placeholder="Ex: EXTRACAD"
              className="placeholder:text-sm"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div>
            <Label htmlFor={`auxilio_parcela_${index}`}>Parcela</Label>
            <Input
              id={`auxilio_parcela_${index}`}
              value={auxilio.parcela || ''}
              onChange={(e) => updateAuxilioEmergencial(index, 'parcela', e.target.value)}
              placeholder="Ex: 2ª"
              className="placeholder:text-sm"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor={`auxilio_observacao_${index}`}>Observação</Label>
            <Input
              id={`auxilio_observacao_${index}`}
              value={auxilio.observacao || ''}
              onChange={(e) => updateAuxilioEmergencial(index, 'observacao', e.target.value)}
              placeholder="Ex: Pagamento bloqueado ou cancelado"
              className="placeholder:text-sm"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor={`auxilio_valor_beneficio_${index}`}>Valor Benefício</Label>
            <Input
              id={`auxilio_valor_beneficio_${index}`}
              type="number"
              step="0.01"
              value={auxilio.valor_beneficio || ''}
              onChange={(e) => updateAuxilioEmergencial(index, 'valor_beneficio', e.target.value)}
              placeholder="Ex: 600.00"
              className="placeholder:text-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuxilioEmergencialSection;