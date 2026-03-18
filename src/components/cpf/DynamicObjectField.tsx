import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit3 } from "lucide-react";

interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string; }[];
}

interface DynamicObjectFieldProps {
  label: string;
  value: any[];
  onChange: (value: any[]) => void;
  fields: FieldConfig[];
  emptyMessage?: string;
  itemTitle?: string;
  defaultValues?: any;
}

const DynamicObjectField: React.FC<DynamicObjectFieldProps> = ({
  label,
  value = [],
  onChange,
  fields,
  emptyMessage = "Nenhum item adicionado",
  itemTitle = "Item",
  defaultValues = {}
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  const initializeForm = (data: any = {}) => {
    const initialData: any = {};
    fields.forEach(field => {
      initialData[field.key] = data[field.key] || defaultValues[field.key] || '';
    });
    setFormData(initialData);
  };

  const startAdding = () => {
    initializeForm();
    setIsAdding(true);
  };

  const startEditing = (index: number) => {
    initializeForm(value[index]);
    setEditingIndex(index);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setFormData({});
  };

  const saveItem = () => {
    // Validate required fields
    const hasEmptyRequired = fields.some(field => 
      field.required && !formData[field.key]?.trim()
    );
    
    if (hasEmptyRequired) {
      return;
    }

    let newValue = [...value];
    
    if (editingIndex !== null) {
      newValue[editingIndex] = { ...formData };
    } else {
      newValue.push({ ...formData });
    }

    onChange(newValue);
    cancelForm();
  };

  const removeItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const updateFormField = (key: string, fieldValue: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: fieldValue
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        <Button
          type="button"
          onClick={startAdding}
          disabled={isAdding || editingIndex !== null}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {/* Form for adding/editing */}
      {(isAdding || editingIndex !== null) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {editingIndex !== null ? `Editar ${itemTitle}` : `Novo ${itemTitle}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map(field => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>
                    {field.label} {field.required && '*'}
                  </Label>
                  {field.type === 'select' ? (
                    <Select
                      value={formData[field.key] || ''}
                      onValueChange={(value) => updateFormField(field.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder || `Selecione ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={field.key}
                      type={field.type || 'text'}
                      value={formData[field.key] || ''}
                      onChange={(e) => updateFormField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="placeholder:text-sm"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={cancelForm}
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={saveItem}
                size="sm"
              >
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Display existing items */}
      {value.length > 0 ? (
        <div className="space-y-3">
          {value.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
                    {fields.map(field => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">
                          {field.label}
                        </Label>
                        <p className="text-sm">{item[field.key] || '-'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 ml-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(index)}
                      disabled={isAdding || editingIndex !== null}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={isAdding || editingIndex !== null}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
      )}
    </div>
  );
};

export default DynamicObjectField;