import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Camera, FileImage, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import OptimizedImage from '@/components/ui/OptimizedImage';

interface PhotoUpload2Props {
  cpf: string;
  onPhotoUploaded?: (photoUrl: string) => void;
  currentPhoto?: string;
  onFileSelected?: (file: File | null) => void;
  onPhotoDeleted?: (wasExisting: boolean) => void;
}

interface PhotoUpload2Ref {
  uploadPhoto: () => Promise<string | null>;
  getSelectedFile: () => File | null;
  clearSelection: () => void;
  removeExistingPhoto: () => void;
}

const PhotoUpload2 = forwardRef<PhotoUpload2Ref, PhotoUpload2Props>(({
  cpf,
  onPhotoUploaded,
  currentPhoto,
  onFileSelected,
  onPhotoDeleted
}, ref) => {
  const getPhotoUrl = (photo: string) => {
    if (!photo) return '';
    if (photo.startsWith('http')) return photo;
    return `https://api.apipainel.com.br/fotos/${photo}`;
  };

  const [previewUrl, setPreviewUrl] = useState<string>(currentPhoto ? getPhotoUrl(currentPhoto) : '');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(!!currentPhoto);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    uploadPhoto: async () => {
      if (selectedFile && cpf) {
        return await uploadPhoto(selectedFile);
      }
      return null;
    },
    getSelectedFile: () => selectedFile,
    clearSelection: () => {
      setSelectedFile(null);
      setPreviewUrl(currentPhoto ? getPhotoUrl(currentPhoto) : '');
      setIsUploaded(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onFileSelected?.(null);
    },
    removeExistingPhoto: () => {
      if (confirm('Tem certeza que deseja remover esta segunda foto?')) {
        setPreviewUrl('');
        setIsUploaded(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onFileSelected?.(null);
        onPhotoDeleted?.(!!currentPhoto);
        onPhotoUploaded?.('');
        toast.success('Segunda foto removida!');
      }
    }
  }));

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo permitido: 5MB.');
        return;
      }

      // Gerar preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
        setIsUploaded(false);
        setSelectedFile(file);
        onFileSelected?.(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!cpf) {
      toast.error('Informe o CPF primeiro');
      return null;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('cpf', cpf.replace(/\D/g, ''));
      formData.append('type', 'foto2');

      const response = await fetch('https://api.apipainel.com.br/upload-photo.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Upload result foto2:', result);

      if (response.ok && result.success) {
        const fileName = result.data.filename;
        // Use a URL completa retornada pela API se disponível
        const photoUrl = result.data.photo_url || getPhotoUrl(fileName);
        
        console.log('Upload result foto2:', result);
        console.log('Setting preview URL foto2:', photoUrl);
        console.log('Photo URL from API foto2:', result.data.photo_url);
        
        setPreviewUrl(photoUrl);
        setIsUploaded(true);
        setSelectedFile(null); // Limpar arquivo selecionado após upload
        onPhotoUploaded?.(fileName);
        toast.success('Segunda foto enviada com sucesso!');
        return fileName;
      } else {
        throw new Error(result.error || 'Erro no upload');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar segunda foto. Tente novamente.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async () => {
    if (confirm('Tem certeza que deseja remover esta segunda foto?')) {
      setPreviewUrl('');
      setIsUploaded(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onFileSelected?.(null);
      if (!currentPhoto) {
        onPhotoUploaded?.('');
      }
      toast.success('Segunda foto removida!');
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      // Chamar diretamente a validação e processamento
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo permitido: 5MB.');
        return;
      }

      // Gerar preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
        setIsUploaded(false);
        setSelectedFile(file);
        onFileSelected?.(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-3">
      <Label>Segunda Foto</Label>
      
      <Card className="w-full max-w-lg">
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Segunda foto atual quando existe e nenhuma nova foi selecionada */}
            {!selectedFile && currentPhoto && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Segunda Foto Atual</h4>
                <div className="relative">
                  <OptimizedImage
                    src={getPhotoUrl(currentPhoto)}
                    alt="Segunda foto atual do titular"
                    fallbackText="Segunda foto atual não encontrada"
                    aspectRatio="aspect-[3/4]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm"
                    onClick={deletePhoto}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Preview da segunda foto selecionada */}
            {selectedFile && previewUrl && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Segunda Foto Selecionada</h4>
                <div className="relative">
                  <OptimizedImage
                    src={previewUrl}
                    alt="Preview da segunda foto selecionada"
                    fallbackText="Preview não disponível"
                    aspectRatio="aspect-[3/4]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm"
                    onClick={deletePhoto}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Esta segunda foto será enviada quando você salvar o cadastro
                </p>
              </div>
            )}

            {/* Área de upload quando não há foto selecionada */}
            {!selectedFile && (
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Enviando segunda foto...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar ou arraste a segunda foto aqui
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Formatos: JPG e PNG (máx. 5MB)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
});

PhotoUpload2.displayName = 'PhotoUpload2';

export default PhotoUpload2;
export type { PhotoUpload2Ref };