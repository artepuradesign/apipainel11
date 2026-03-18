import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database } from 'lucide-react';

interface CreditinkFormProps {
  creditinkData: any;
  onInputChange: (field: string, value: any) => void;
}

const CreditinkForm = ({ creditinkData, onInputChange }: CreditinkFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
          <Database className="h-5 w-5 sm:h-6 sm:w-6" />
          Credilink
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Dados do sistema Credilink
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="credilink_nome">Nome</Label>
            <Input
              id="credilink_nome"
              value={creditinkData.nome || ''}
              onChange={(e) => onInputChange('nome', e.target.value.toUpperCase())}
              placeholder="Nome completo"
              className="placeholder:text-sm"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_nome_mae">Nome da Mãe</Label>
            <Input
              id="credilink_nome_mae"
              value={creditinkData.nome_mae || ''}
              onChange={(e) => onInputChange('nome_mae', e.target.value.toUpperCase())}
              placeholder="Nome da mãe"
              className="placeholder:text-sm"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_email">E-mail</Label>
            <Input
              id="credilink_email"
              type="email"
              value={creditinkData.email || ''}
              onChange={(e) => onInputChange('email', e.target.value.toUpperCase())}
              placeholder="exemplo@email.com"
              className="placeholder:text-sm"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_data_obito">Data do Óbito</Label>
            <Input
              id="credilink_data_obito"
              value={creditinkData.data_obito || ''}
              onChange={(e) => onInputChange('data_obito', e.target.value.toUpperCase())}
              placeholder="SEM RESULTADO ou data"
              className="placeholder:text-sm"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_status_receita">Status da Receita Federal</Label>
            <Input
              id="credilink_status_receita"
              value={creditinkData.status_receita_federal || ''}
              onChange={(e) => onInputChange('status_receita_federal', e.target.value.toUpperCase())}
              placeholder="REGULAR, IRREGULAR, etc."
              className="placeholder:text-sm"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_percentual">Percentual de Participação Societária</Label>
            <Input
              id="credilink_percentual"
              value={creditinkData.percentual_participacao || ''}
              onChange={(e) => onInputChange('percentual_participacao', e.target.value)}
              placeholder="100"
              className="placeholder:text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_cbo">CBO</Label>
            <Input
              id="credilink_cbo"
              value={creditinkData.cbo || ''}
              onChange={(e) => onInputChange('cbo', e.target.value)}
              placeholder="141510"
              className="placeholder:text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_renda">Renda Presumida</Label>
            <Input
              id="credilink_renda"
              type="number"
              step="0.01"
              value={creditinkData.renda_presumida || ''}
              onChange={(e) => onInputChange('renda_presumida', parseFloat(e.target.value) || 0)}
              placeholder="2000.00"
              className="placeholder:text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_telefones">Telefones</Label>
            <Input
              id="credilink_telefones"
              value={creditinkData.telefones || ''}
              onChange={(e) => onInputChange('telefones', e.target.value)}
              placeholder="11999999999, 11888888888"
              className="placeholder:text-sm"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="credilink_uf">UF</Label>
            <Input
              id="credilink_uf"
              value={creditinkData.uf || ''}
              onChange={(e) => onInputChange('uf', e.target.value.toUpperCase())}
              placeholder="SP"
              className="placeholder:text-sm"
              maxLength={2}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_estado">Estado</Label>
            <Input
              id="credilink_estado"
              value={creditinkData.estado || ''}
              onChange={(e) => onInputChange('estado', e.target.value.toUpperCase())}
              placeholder="SAO PAULO"
              className="placeholder:text-sm"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_cidade">Cidade</Label>
            <Input
              id="credilink_cidade"
              value={creditinkData.cidade || ''}
              onChange={(e) => onInputChange('cidade', e.target.value.toUpperCase())}
              placeholder="COTIA"
              className="placeholder:text-sm"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_tipo_endereco">Tipo de Endereço</Label>
            <Input
              id="credilink_tipo_endereco"
              value={creditinkData.tipo_endereco || ''}
              onChange={(e) => onInputChange('tipo_endereco', e.target.value.toUpperCase())}
              placeholder="RUA"
              className="placeholder:text-sm"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_logradouro">Logradouro</Label>
            <Input
              id="credilink_logradouro"
              value={creditinkData.logradouro || ''}
              onChange={(e) => onInputChange('logradouro', e.target.value.toUpperCase())}
              placeholder="FILADELFIA"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_numero">Número</Label>
            <Input
              id="credilink_numero"
              value={creditinkData.numero || ''}
              onChange={(e) => onInputChange('numero', e.target.value)}
              placeholder="0"
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_complemento">Complemento</Label>
            <Input
              id="credilink_complemento"
              value={creditinkData.complemento || ''}
              onChange={(e) => onInputChange('complemento', e.target.value.toUpperCase())}
              placeholder="SEM RESULTADO"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_bairro">Bairro</Label>
            <Input
              id="credilink_bairro"
              value={creditinkData.bairro || ''}
              onChange={(e) => onInputChange('bairro', e.target.value.toUpperCase())}
              placeholder="SAN FERNANDO PARK"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div>
            <Label htmlFor="credilink_cep">CEP (Opcional)</Label>
            <Input
              id="credilink_cep"
              value={creditinkData.cep || ''}
              onChange={(e) => onInputChange('cep', e.target.value)}
              placeholder="06704425 (opcional)"
              maxLength={8}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditinkForm;