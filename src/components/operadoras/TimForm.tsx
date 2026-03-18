import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Plus, Trash2 } from 'lucide-react';

export interface CreateBaseTim {
  cpf_id: number;
  nome?: string;
  tipoLogradouro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  ddd?: string;
  tel?: string;
  operadora?: string;
}

interface TimFormProps {
  data: Partial<CreateBaseTim>[];
  onChange: (data: Partial<CreateBaseTim>[]) => void;
}

const TimForm: React.FC<TimFormProps> = ({ data, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
          <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
          Operadora Tim
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1">
          Informações de linhas da operadora Tim
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((tim, index) => (
          <React.Fragment key={index}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Linha {index + 1}</h4>
              {data.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updated = data.filter((_, i) => i !== index);
                    onChange(updated);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <Label>Nome</Label>
                <Input
                  value={tim.nome || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].nome = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="Nome do titular"
                  className="placeholder:text-sm"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>DDD</Label>
                <Input
                  value={tim.ddd || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].ddd = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="11"
                  maxLength={2}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={tim.tel || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].tel = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="99999-9999"
                />
              </div>
              <div>
                <Label>Operadora</Label>
                <Input
                  value={tim.operadora || 'TIM'}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].operadora = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="TIM"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>Tipo de Logradouro</Label>
                <Select 
                  value={tim.tipoLogradouro || ''} 
                  onValueChange={(value) => {
                    const updated = [...data];
                    updated[index].tipoLogradouro = value;
                    onChange(updated);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rua">Rua</SelectItem>
                    <SelectItem value="Avenida">Avenida</SelectItem>
                    <SelectItem value="Travessa">Travessa</SelectItem>
                    <SelectItem value="Alameda">Alameda</SelectItem>
                    <SelectItem value="Praça">Praça</SelectItem>
                    <SelectItem value="Rodovia">Rodovia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Logradouro</Label>
                <Input
                  value={tim.logradouro || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].logradouro = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="Nome da rua/avenida"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>Número</Label>
                <Input
                  value={tim.numero || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].numero = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="123"
                />
              </div>
              <div>
                <Label>Complemento</Label>
                <Input
                  value={tim.complemento || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].complemento = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="Apto, Sala"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input
                  value={tim.bairro || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].bairro = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="Nome do bairro"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input
                  value={tim.cidade || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].cidade = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="Nome da cidade"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>UF</Label>
                <Input
                  value={tim.uf || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].uf = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="SP"
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <Label>CEP</Label>
                <Input
                  value={tim.cep || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].cep = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </React.Fragment>
        ))}
        
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            onChange([...data, {
              cpf_id: 0,
              nome: '',
              tipoLogradouro: '',
              logradouro: '',
              numero: '',
              complemento: '',
              bairro: '',
              cidade: '',
              uf: '',
              cep: '',
              ddd: '',
              tel: '',
              operadora: 'TIM'
            }]);
          }}
          className="w-full sm:w-auto mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </CardContent>
    </Card>
  );
};

export default TimForm;
