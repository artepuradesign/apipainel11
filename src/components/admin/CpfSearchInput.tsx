import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface CpfSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CpfSearchInput: React.FC<CpfSearchInputProps> = ({
  value,
  onChange,
  onKeyPress,
  placeholder = "Digite...",
  disabled = false
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove todos os caracteres que não são dígitos
    const numericValue = e.target.value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (CPF)
    const limitedValue = numericValue.slice(0, 11);
    
    // Aplica formatação visual do CPF durante a digitação
    let formattedValue = limitedValue;
    if (limitedValue.length > 3) {
      formattedValue = limitedValue.slice(0, 3) + '.' + limitedValue.slice(3);
    }
    if (limitedValue.length > 6) {
      formattedValue = formattedValue.slice(0, 7) + '.' + formattedValue.slice(7);
    }
    if (limitedValue.length > 9) {
      formattedValue = formattedValue.slice(0, 11) + '-' + formattedValue.slice(11);
    }
    
    // Chama onChange com o valor numérico puro para a busca
    onChange(limitedValue);
  };

  // Formata o valor para exibição
  const getDisplayValue = () => {
    if (!value) return '';
    
    let formatted = value;
    if (value.length > 3) {
      formatted = value.slice(0, 3) + '.' + value.slice(3);
    }
    if (value.length > 6) {
      formatted = formatted.slice(0, 7) + '.' + formatted.slice(7);
    }
    if (value.length > 9) {
      formatted = formatted.slice(0, 11) + '-' + formatted.slice(11);
    }
    
    return formatted;
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={getDisplayValue()}
        onChange={handleInputChange}
        onKeyPress={onKeyPress}
        disabled={disabled}
        className="pl-10"
        maxLength={14} // XXX.XXX.XXX-XX
      />
      {value && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <span className="text-xs text-muted-foreground">
            {value.length}/11
          </span>
        </div>
      )}
    </div>
  );
};

export default CpfSearchInput;