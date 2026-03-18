import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CreateBaseInss } from '@/services/baseInssService';
import { Plus, Trash2, FileText } from 'lucide-react';

interface InssFormProps {
  data: Partial<CreateBaseInss>;
  onChange: (field: string, value: string) => void;
}

const InssForm: React.FC<InssFormProps> = ({ data, onChange }) => {
  const [inssItems, setInssItems] = useState<Partial<CreateBaseInss>[]>([data]);

  const handleInputChange = (index: number, field: string, value: string) => {
    const updated = [...inssItems];
    if (field === 'nb' || field === 'especie') {
      updated[index] = { ...updated[index], [field]: value };
    } else {
      updated[index] = { ...updated[index], [field]: value.toUpperCase() };
    }
    setInssItems(updated);
    
    // Update first item to parent
    if (index === 0) {
      onChange(field, field === 'nb' || field === 'especie' ? value : value.toUpperCase());
    }
  };

  const addInssItem = () => {
    setInssItems([...inssItems, {}]);
  };

  const removeInssItem = (index: number) => {
    if (inssItems.length > 1) {
      setInssItems(inssItems.filter((_, i) => i !== index));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
          INSS
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1">
          Informações sobre benefícios do INSS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {inssItems.map((item, index) => (
          <React.Fragment key={index}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">INSS {index + 1}</h4>
              {inssItems.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeInssItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor={`nb-${index}`}>NB</Label>
                <Input
                  id={`nb-${index}`}
                  value={item.nb || ''}
                  onChange={(e) => handleInputChange(index, 'nb', e.target.value)}
                  placeholder="Ex: 5333245157"
                  className="placeholder:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`entidade-${index}`}>Entidade</Label>
                <Input
                  id={`entidade-${index}`}
                  value={item.entidade || ''}
                  onChange={(e) => handleInputChange(index, 'entidade', e.target.value)}
                  placeholder="Ex: INSS"
                  className="placeholder:text-sm"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`especie-${index}`}>Espécie</Label>
                <Input
                  id={`especie-${index}`}
                  value={item.especie || ''}
                  onChange={(e) => handleInputChange(index, 'especie', e.target.value)}
                  placeholder="Ex: 31"
                  className="placeholder:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`valor-${index}`}>Valor</Label>
                <Input
                  id={`valor-${index}`}
                  value={item.valor || ''}
                  onChange={(e) => handleInputChange(index, 'valor', e.target.value)}
                  placeholder="Ex: N"
                  className="placeholder:text-sm"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`especie_descricao-${index}`}>Espécie Descrição</Label>
                <Input
                  id={`especie_descricao-${index}`}
                  value={item.especie_descricao || ''}
                  onChange={(e) => handleInputChange(index, 'especie_descricao', e.target.value)}
                  placeholder="Ex: AUXÍLIO DOENÇA PREVIDENCIÁRIO"
                  className="placeholder:text-sm"
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
          onClick={addInssItem}
          className="w-full sm:w-auto mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </CardContent>
    </Card>
  );
};

export default InssForm;