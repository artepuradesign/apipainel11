import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';

interface VacinaFormProps {
  vacinaData: any;
  onInputChange: (field: string, value: any) => void;
}

const VacinaForm = ({ vacinaData, onInputChange }: VacinaFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Vacinas
        </CardTitle>
        <CardDescription>
          Dados de vacinação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="vacina_vaina">Vacina</Label>
            <Input
              id="vacina_vaina"
              value={vacinaData.vaina || ''}
              onChange={(e) => onInputChange('vaina', e.target.value)}
              placeholder="Nome da vacina"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_cor">Cor</Label>
            <Input
              id="vacina_cor"
              value={vacinaData.cor || ''}
              onChange={(e) => onInputChange('cor', e.target.value)}
              placeholder="SEM INFORMACAO"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_cns">CNS</Label>
            <Input
              id="vacina_cns"
              value={vacinaData.cns || ''}
              onChange={(e) => onInputChange('cns', e.target.value)}
              placeholder="708403261066268"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_mae">Mãe</Label>
            <Input
              id="vacina_mae"
              value={vacinaData.mae || ''}
              onChange={(e) => onInputChange('mae', e.target.value)}
              placeholder="ANA LUCIA LARANJEIRA ALMEIDA"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_nome_vacina">Nome da Vacina</Label>
            <Input
              id="vacina_nome_vacina"
              value={vacinaData.nome_vacina || ''}
              onChange={(e) => onInputChange('nome_vacina', e.target.value)}
              placeholder="COVID-19 ASTRAZENECA/FIOCRUZ - COVISHIELD"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_descricao_vacina">Descrição da Vacina</Label>
            <Input
              id="vacina_descricao_vacina"
              value={vacinaData.descricao_vacina || ''}
              onChange={(e) => onInputChange('descricao_vacina', e.target.value)}
              placeholder="Reforço"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_lote_vacina">Lote da Vacina</Label>
            <Input
              id="vacina_lote_vacina"
              value={vacinaData.lote_vacina || ''}
              onChange={(e) => onInputChange('lote_vacina', e.target.value)}
              placeholder="219VCD295W"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_grupo_atendimento">Grupo de Atendimento</Label>
            <Input
              id="vacina_grupo_atendimento"
              value={vacinaData.grupo_atendimento || ''}
              onChange={(e) => onInputChange('grupo_atendimento', e.target.value)}
              placeholder="Outros"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_data_aplicacao">Data de Aplicação</Label>
            <Input
              id="vacina_data_aplicacao"
              type="text"
              value={vacinaData.data_aplicacao || ''}
              onChange={(e) => onInputChange('data_aplicacao', e.target.value)}
              placeholder="DD/MM/AAAA"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_status">Status</Label>
            <Select 
              value={vacinaData.status || ''}
              onValueChange={(value) => onInputChange('status', value)}
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
            <Label htmlFor="vacina_nome_estabelecimento">Nome do Estabelecimento</Label>
            <Input
              id="vacina_nome_estabelecimento"
              value={vacinaData.nome_estabelecimento || ''}
              onChange={(e) => onInputChange('nome_estabelecimento', e.target.value)}
              placeholder="USF CLEMENTINO FRAGA"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_aplicador_vacina">Aplicador de Vacina</Label>
            <Input
              id="vacina_aplicador_vacina"
              value={vacinaData.aplicador_vacina || ''}
              onChange={(e) => onInputChange('aplicador_vacina', e.target.value)}
              placeholder="GEOVANIA ARTMYS DOS SANTOS SOUZA"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_uf">UF</Label>
            <Select 
              value={vacinaData.uf || ''}
              onValueChange={(value) => onInputChange('uf', value)}
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
            <Label htmlFor="vacina_municipio">Município</Label>
            <Input
              id="vacina_municipio"
              value={vacinaData.municipio || ''}
              onChange={(e) => onInputChange('municipio', e.target.value)}
              placeholder="SALVADOR"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_bairro">Bairro</Label>
            <Input
              id="vacina_bairro"
              value={vacinaData.bairro || ''}
              onChange={(e) => onInputChange('bairro', e.target.value)}
              placeholder="CHAMECHAME"
            />
          </div>
          
          <div>
            <Label htmlFor="vacina_cep">CEP</Label>
            <Input
              id="vacina_cep"
              value={vacinaData.cep || ''}
              onChange={(e) => onInputChange('cep', e.target.value)}
              placeholder="40157"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VacinaForm;