import React from 'react';
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ColorSelectorProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
}

const PRESET_COLORS = [
  // Roxos e Violetas
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  
  // Azuis
  '#3b82f6', // Blue
  '#0ea5e9', // Sky
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  
  // Verdes
  '#22c55e', // Green
  '#84cc16', // Lime
  '#10b981', // Emerald
  
  // Amarelos e Laranjas
  '#eab308', // Yellow
  '#f59e0b', // Amber
  '#f97316', // Orange
  
  // Vermelhos e Rosas
  '#ef4444', // Red
  '#f43f5e', // Rose
  '#ec4899', // Pink
  
  // Neutros
  '#64748b', // Slate
  '#78716c', // Stone
];

const ColorSelector = ({ value, onChange, label = "Cor", disabled = false }: ColorSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-10 gap-1.5">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            disabled={disabled}
            onClick={() => onChange(color)}
            className={cn(
              "w-7 h-7 rounded-md border-2 transition-all duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
              value === color 
                ? "border-foreground ring-2 ring-offset-2 ring-primary scale-110" 
                : "border-transparent hover:border-muted-foreground/50",
              disabled && "opacity-50 cursor-not-allowed hover:scale-100"
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      
      {/* Input de cor personalizada */}
      <div className="flex items-center gap-2 mt-2">
        <div 
          className="w-7 h-7 rounded-md border border-border"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-8 h-8 cursor-pointer rounded border-0 p-0"
          title="Cor personalizada"
        />
        <span className="text-xs text-muted-foreground uppercase">{value}</span>
      </div>
    </div>
  );
};

export default ColorSelector;
