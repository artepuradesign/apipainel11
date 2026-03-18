import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Check } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadConverterProps {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
  accept?: string;
}

const ImageUploadConverter: React.FC<ImageUploadConverterProps> = ({
  label,
  value = '',
  onChange,
  accept = "image/*"
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [isConverted, setIsConverted] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setSelectedFile(file);
    setIsConverted(false);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConvert = () => {
    if (!selectedFile) return;

    setIsConverting(true);
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onChange(base64);
      setIsConverted(true);
      setIsConverting(false);
      toast.success('Imagem convertida com sucesso!');
    };
    reader.onerror = () => {
      setIsConverting(false);
      toast.error('Erro ao converter imagem');
    };
    reader.readAsDataURL(selectedFile);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setIsConverted(false);
    onChange('');
  };

  const truncateBase64 = (base64: string, maxLength: number = 50) => {
    if (base64.length <= maxLength) return base64;
    return base64.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="flex-1"
          />
          {selectedFile && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {previewUrl && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded border"
                />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium">{selectedFile?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {((selectedFile?.size || 0) / 1024).toFixed(1)} KB
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleConvert}
                    disabled={isConverting || isConverted}
                    className="w-full"
                  >
                    {isConverting ? (
                      'Convertendo...'
                    ) : isConverted ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Convertido
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" />
                        CONVERTER
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {value && (
          <div className="p-3 bg-muted/30 rounded border">
            <Label className="text-xs font-medium text-muted-foreground">
              Base64 Gerado:
            </Label>
            <p className="text-xs font-mono mt-1 break-all">
              {truncateBase64(value, 100)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadConverter;