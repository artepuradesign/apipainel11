
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  title: string;
}

const ColorPicker = ({ isOpen, onClose, currentColor, onColorChange, title }: ColorPickerProps) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);

  const predefinedColors = [
    '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827',
    '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
    '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
    '#fefce8', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f',
    '#f7fee7', '#ecfccb', '#d9f99d', '#bef264', '#a3e635', '#84cc16', '#65a30d', '#4d7c0f', '#365314', '#1a2e05',
    '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
    '#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63',
    '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
    '#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
    '#fdf4ff', '#fae8ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8'
  ];

  const handleSave = () => {
    onColorChange(selectedColor);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Color Display */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-300"
              style={{ backgroundColor: selectedColor }}
            />
            <div>
              <Label>Cor Atual</Label>
              <div className="text-sm text-gray-600">{selectedColor}</div>
            </div>
          </div>

          {/* Hex Input */}
          <div className="space-y-2">
            <Label htmlFor="color-hex">Código Hexadecimal</Label>
            <Input
              id="color-hex"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              placeholder="#ffffff"
            />
          </div>

          {/* HTML Color Input */}
          <div className="space-y-2">
            <Label htmlFor="color-picker">Seletor de Cor</Label>
            <input
              id="color-picker"
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 cursor-pointer"
            />
          </div>

          {/* Predefined Colors */}
          <div className="space-y-2">
            <Label>Cores Predefinidas</Label>
            <div className="grid grid-cols-10 gap-1">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                    selectedColor === color ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-brand-purple hover:bg-brand-darkPurple">
              Aplicar Cor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColorPicker;
