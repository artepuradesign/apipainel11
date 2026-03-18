import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Plus, Trash2 } from 'lucide-react';

export interface CreateBaseSenhaCpf {
  cpf_id: number;
  cpf?: string;
  senha?: string;
}

interface SenhaCpfFormProps {
  data: Partial<CreateBaseSenhaCpf>[];
  onChange: (data: Partial<CreateBaseSenhaCpf>[]) => void;
}

const SenhaCpfForm: React.FC<SenhaCpfFormProps> = ({ data, onChange }) => {
  const handleAdd = () => {
    onChange([...data, { cpf: '', senha: '' }]);
  };

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
          <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
          Senhas de CPF
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1">
          Senhas associadas ao CPF comprometidas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor={`senha-cpf-cpf-${index}`}>CPF</Label>
              <Input
                id={`senha-cpf-cpf-${index}`}
                type="text"
                placeholder="000.000.000-00"
                className="placeholder:text-sm"
                value={item.cpf || ''}
                onChange={(e) => handleChange(index, 'cpf', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`senha-cpf-senha-${index}`}>Senha</Label>
              <div className="flex gap-2">
                <Input
                  id={`senha-cpf-senha-${index}`}
                  type="text"
                  placeholder="Senha vazada"
                  className="placeholder:text-sm"
                  value={item.senha || ''}
                  onChange={(e) => handleChange(index, 'senha', e.target.value)}
                />
                {data.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAdd}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </CardContent>
    </Card>
  );
};

export default SenhaCpfForm;
