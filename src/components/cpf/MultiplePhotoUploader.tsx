import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import placeholderImage from "@/assets/placeholder-photo.png";

interface MultiplePhotoUploaderProps {
  photos: {
    photo: string;
    photo2: string;
    photo3: string;
    photo4: string;
  };
  onChange: (photoKey: 'photo' | 'photo2' | 'photo3' | 'photo4', base64: string) => void;
}

const MultiplePhotoUploader: React.FC<MultiplePhotoUploaderProps> = ({ photos, onChange }) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    photoKey: 'photo' | 'photo2' | 'photo3' | 'photo4'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setLoading(prev => ({ ...prev, [photoKey]: true }));

    try {
      // Converter para base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onChange(photoKey, base64);
        toast.success('Foto carregada com sucesso!');
        setLoading(prev => ({ ...prev, [photoKey]: false }));
      };
      reader.onerror = () => {
        toast.error('Erro ao carregar imagem');
        setLoading(prev => ({ ...prev, [photoKey]: false }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Erro ao processar imagem');
      setLoading(prev => ({ ...prev, [photoKey]: false }));
    }
  };

  const handleRemovePhoto = (photoKey: 'photo' | 'photo2' | 'photo3' | 'photo4') => {
    onChange(photoKey, '');
    toast.success('Foto removida');
  };

  const renderPhotoCard = (photoKey: 'photo' | 'photo2' | 'photo3' | 'photo4', index: number) => {
    const photoValue = photos[photoKey];
    const hasPhoto = photoValue && photoValue.length > 0;

    return (
      <div key={photoKey} className="relative group">
        <input
          type="file"
          id={`file-${photoKey}`}
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, photoKey)}
        />
        
        <label
          htmlFor={`file-${photoKey}`}
          className="block cursor-pointer"
        >
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50">
            {/* Foto com aspect ratio 3:4 */}
            <div className="relative bg-muted aspect-[3/4] flex items-center justify-center overflow-hidden">
              <img
                src={hasPhoto ? photoValue : placeholderImage}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay ao hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-8 w-8 text-white" />
              </div>

              {/* Loading overlay */}
              {loading[photoKey] && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}

              {/* Botão remover foto */}
              {hasPhoto && !loading[photoKey] && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemovePhoto(photoKey);
                  }}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Label da foto */}
            <div className="p-2 bg-primary text-primary-foreground text-center text-sm font-medium">
              Foto {index + 1}
            </div>
          </Card>
        </label>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Fotos do CPF</Label>
      <div className="text-sm text-muted-foreground mb-4">
        Clique nos cards para adicionar até 4 fotos. As imagens serão convertidas em base64.
      </div>

      {/* Grid responsivo: 4 em desktop, 2 em mobile/tablet */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {renderPhotoCard('photo', 0)}
        {renderPhotoCard('photo2', 1)}
        {renderPhotoCard('photo3', 2)}
        {renderPhotoCard('photo4', 3)}
      </div>
    </div>
  );
};

export default MultiplePhotoUploader;
