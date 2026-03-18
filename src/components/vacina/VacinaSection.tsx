import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { CreateBaseVacina } from '@/services/baseVacinaService';

interface VacinaSectionProps {
  vacinas: Partial<CreateBaseVacina>[];
  onChange: (vacinas: Partial<CreateBaseVacina>[]) => void;
}

const VacinaSection: React.FC<VacinaSectionProps> = ({ vacinas, onChange }) => {
  // Sempre garantir que haja pelo menos um formulário vazio
  React.useEffect(() => {
    if (vacinas.length === 0) {
      onChange([{
        cpf_id: 0,
        vaina: '',
        cor: '',
        cns: '',
        mae: '',
        nome_vacina: '',
        descricao_vacina: '',
        lote_vacina: '',
        grupo_atendimento: '',
        data_aplicacao: '',
        status: '',
        nome_estabelecimento: '',
        aplicador_vacina: '',
        uf: '',
        municipio: '',
        bairro: '',
        cep: ''
      }]);
    }
  }, []);


  const updateVacina = (index: number, field: string, value: string) => {
    const updated = [...vacinas];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeVacina = (index: number) => {
    if (vacinas.length > 1) {
      const updated = vacinas.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  return (
    <div className="space-y-4">
      {vacinas.map((vacina, index) => (
        <React.Fragment key={index}>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Vacina {index + 1}</h4>
            {vacinas.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeVacina(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor={`vacina_vaina_${index}`}>Vacina</Label>
              <Input
                id={`vacina_vaina_${index}`}
                value={vacina.vaina || ''}
                onChange={(e) => updateVacina(index, 'vaina', e.target.value.toUpperCase())}
                placeholder="Nome da vacina"
                className="placeholder:text-sm"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_cor_${index}`}>Cor</Label>
              <Input
                id={`vacina_cor_${index}`}
                value={vacina.cor || ''}
                onChange={(e) => updateVacina(index, 'cor', e.target.value.toUpperCase())}
                placeholder="SEM INFORMACAO"
                className="placeholder:text-sm"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_cns_${index}`}>CNS</Label>
              <Input
                id={`vacina_cns_${index}`}
                value={vacina.cns || ''}
                onChange={(e) => updateVacina(index, 'cns', e.target.value)}
                placeholder="708403261066268"
                className="placeholder:text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_mae_${index}`}>Mãe</Label>
              <Input
                id={`vacina_mae_${index}`}
                value={vacina.mae || ''}
                onChange={(e) => updateVacina(index, 'mae', e.target.value.toUpperCase())}
                placeholder="ANA LUCIA LARANJEIRA ALMEIDA"
                className="placeholder:text-sm"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_nome_vacina_${index}`}>Nome da Vacina</Label>
              <Input
                id={`vacina_nome_vacina_${index}`}
                value={vacina.nome_vacina || ''}
                onChange={(e) => updateVacina(index, 'nome_vacina', e.target.value.toUpperCase())}
                placeholder="COVID-19 ASTRAZENECA/FIOCRUZ - COVISHIELD"
                className="placeholder:text-sm"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_descricao_vacina_${index}`}>Descrição da Vacina</Label>
              <Input
                id={`vacina_descricao_vacina_${index}`}
                value={vacina.descricao_vacina || ''}
                onChange={(e) => updateVacina(index, 'descricao_vacina', e.target.value.toUpperCase())}
                placeholder="Reforço"
                className="placeholder:text-sm"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_lote_vacina_${index}`}>Lote da Vacina</Label>
              <Input
                id={`vacina_lote_vacina_${index}`}
                value={vacina.lote_vacina || ''}
                onChange={(e) => updateVacina(index, 'lote_vacina', e.target.value.toUpperCase())}
                placeholder="219VCD295W"
                className="placeholder:text-sm"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_grupo_atendimento_${index}`}>Grupo de Atendimento</Label>
              <Input
                id={`vacina_grupo_atendimento_${index}`}
                value={vacina.grupo_atendimento || ''}
                onChange={(e) => updateVacina(index, 'grupo_atendimento', e.target.value.toUpperCase())}
                placeholder="Outros"
                className="placeholder:text-sm"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_data_aplicacao_${index}`}>Data de Aplicação</Label>
              <Input
                id={`vacina_data_aplicacao_${index}`}
                type="text"
                value={vacina.data_aplicacao || ''}
                onChange={(e) => updateVacina(index, 'data_aplicacao', e.target.value)}
                placeholder="DD/MM/AAAA"
                className="placeholder:text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_status_${index}`}>Status</Label>
              <Select 
                value={vacina.status || ''}
                onValueChange={(value) => updateVacina(index, 'status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor={`vacina_nome_estabelecimento_${index}`}>Nome do Estabelecimento</Label>
              <Input
                id={`vacina_nome_estabelecimento_${index}`}
                value={vacina.nome_estabelecimento || ''}
                onChange={(e) => updateVacina(index, 'nome_estabelecimento', e.target.value.toUpperCase())}
                placeholder="USF CLEMENTINO FRAGA"
                className="placeholder:text-sm"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_aplicador_vacina_${index}`}>Aplicador de Vacina</Label>
              <Input
                id={`vacina_aplicador_vacina_${index}`}
                value={vacina.aplicador_vacina || ''}
                onChange={(e) => updateVacina(index, 'aplicador_vacina', e.target.value.toUpperCase())}
                placeholder="GEOVANIA ARTMYS DOS SANTOS SOUZA"
                className="placeholder:text-sm"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_uf_${index}`}>UF</Label>
              <Select 
                value={vacina.uf || ''}
                onValueChange={(value) => updateVacina(index, 'uf', value)}
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
              <Label htmlFor={`vacina_municipio_${index}`}>Município</Label>
              <Input
                id={`vacina_municipio_${index}`}
                value={vacina.municipio || ''}
                onChange={(e) => updateVacina(index, 'municipio', e.target.value.toUpperCase())}
                placeholder="SALVADOR"
                className="placeholder:text-sm"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_bairro_${index}`}>Bairro</Label>
              <Input
                id={`vacina_bairro_${index}`}
                value={vacina.bairro || ''}
                onChange={(e) => updateVacina(index, 'bairro', e.target.value.toUpperCase())}
                placeholder="CHAMECHAME"
                className="placeholder:text-sm"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div>
              <Label htmlFor={`vacina_cep_${index}`}>CEP</Label>
              <Input
                id={`vacina_cep_${index}`}
                value={vacina.cep || ''}
                onChange={(e) => updateVacina(index, 'cep', e.target.value)}
                placeholder="40157"
                className="placeholder:text-sm"
              />
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default VacinaSection;