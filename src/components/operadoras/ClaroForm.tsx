import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Plus, Trash2 } from 'lucide-react';

export interface CreateBaseClaro {
  cpf_id: number;
  nome?: string;
  pessoa?: string;
  ddd?: string;
  fone?: string;
  inst?: string;
}

interface ClaroFormProps {
  data: Partial<CreateBaseClaro>[];
  onChange: (data: Partial<CreateBaseClaro>[]) => void;
}

const ClaroForm: React.FC<ClaroFormProps> = ({ data, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
          <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
          Operadora Claro
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1">
          Informações de linhas da operadora Claro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((claro, index) => (
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
                  value={claro.nome || ''}
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
                <Label>Tipo de Pessoa</Label>
                <Select 
                  value={claro.pessoa || ''} 
                  onValueChange={(value) => {
                    const updated = [...data];
                    updated[index].pessoa = value;
                    onChange(updated);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Física">Pessoa Física</SelectItem>
                    <SelectItem value="Jurídica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>DDD</Label>
                <Input
                  value={claro.ddd || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].ddd = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="11"
                  maxLength={3}
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={claro.fone || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].fone = e.target.value;
                    onChange(updated);
                  }}
                  placeholder="99999-9999"
                />
              </div>
              <div>
                <Label>Instalação</Label>
                <Input
                  value={claro.inst || ''}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[index].inst = e.target.value.toUpperCase();
                    onChange(updated);
                  }}
                  placeholder="Data ou descrição"
                  style={{ textTransform: 'uppercase' }}
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
              pessoa: '',
              ddd: '',
              fone: '',
              inst: ''
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

export default ClaroForm;
