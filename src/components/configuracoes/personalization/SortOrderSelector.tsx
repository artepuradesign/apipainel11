
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, Hash } from 'lucide-react';

interface SortOrderSelectorProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
}

const SortOrderSelector: React.FC<SortOrderSelectorProps> = ({ 
  value, 
  onChange, 
  label = "Ordem de Exibição",
  min = 0,
  max = 100
}) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Hash className="h-4 w-4" />
        {label}
      </Label>
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={value <= min}
          className="h-10 w-10 p-0"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        
        <div className="flex-1">
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="text-center font-semibold"
          />
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={value >= max}
          className="h-10 w-10 p-0"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Menor número = prioridade maior na exibição
      </div>
    </div>
  );
};

export default SortOrderSelector;
