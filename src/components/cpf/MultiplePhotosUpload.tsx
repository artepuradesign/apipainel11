import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Camera, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = 'https://api.artepuradesign.com.br';
const MAX_PHOTOS = 4;

interface PhotoData {
  file: File | null;
  preview: string | null;
  uploaded: string | null;
}

export interface MultiplePhotosUploadRef {
  uploadAllPhotos: () => Promise<string[]>;
  getUploadedPhotos: () => string[];
}

interface MultiplePhotosUploadProps {
  cpf: string;
  initialPhotos?: string[];
}

const MultiplePhotosUpload = forwardRef<MultiplePhotosUploadRef, MultiplePhotosUploadProps>(
  ({ cpf, initialPhotos = [] }, ref) => {
    const [photos, setPhotos] = useState<PhotoData[]>(() => {
      // Sempre iniciar com 2 espaços vazios para fotos
      const initial: PhotoData[] = initialPhotos.slice(0, MAX_PHOTOS).map(photo => ({
        file: null,
        preview: `${API_BASE_URL}/uploads/${photo}`,
        uploaded: photo
      }));
      
      // Garantir que sempre tenha pelo menos 2 slots
      while (initial.length < 2) {
        initial.push({ file: null, preview: null, uploaded: null });
      }
      
      return initial;
    });

    const handleFileSelect = (index: number, file: File) => {
      if (!file) return;

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande. Tamanho máximo: 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotos = [...photos];
        newPhotos[index] = {
          file,
          preview: reader.result as string,
          uploaded: null
        };
        setPhotos(newPhotos);
      };
      reader.readAsDataURL(file);
    };

    const handleRemovePhoto = (index: number) => {
      const newPhotos = [...photos];
      newPhotos.splice(index, 1);
      setPhotos(newPhotos);
    };

    const handleAddPhotoSlot = () => {
      if (photos.length < MAX_PHOTOS) {
        setPhotos([...photos, { file: null, preview: null, uploaded: null }]);
      }
    };

    const uploadPhoto = async (photoData: PhotoData): Promise<string | null> => {
      if (!photoData.file) {
        return photoData.uploaded; // Retorna foto já enviada
      }

      const formData = new FormData();
      formData.append('foto', photoData.file);
      formData.append('cpf', cpf.replace(/\D/g, ''));

      try {
        const response = await fetch(`${API_BASE_URL}/upload-foto`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Erro no upload');
        }

        const data = await response.json();
        if (data.success && data.filename) {
          return data.filename;
        }
        return null;
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        return null;
      }
    };

    const uploadAllPhotos = async (): Promise<string[]> => {
      const uploadedFiles: string[] = [];
      
      for (let i = 0; i < photos.length; i++) {
        const photoData = photos[i];
        if (photoData.file || photoData.uploaded) {
          const filename = await uploadPhoto(photoData);
          if (filename) {
            uploadedFiles.push(filename);
          }
        }
      }

      return uploadedFiles;
    };

    const getUploadedPhotos = (): string[] => {
      return photos
        .map(p => p.uploaded)
        .filter((u): u is string => u !== null);
    };

    useImperativeHandle(ref, () => ({
      uploadAllPhotos,
      getUploadedPhotos
    }));

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {photos.map((photoData, index) => (
            <div key={index} className="space-y-2">
              <Label>Foto {index + 1}</Label>
              <div className="relative">
                <input
                  type="file"
                  id={`photo-input-${index}`}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(index, file);
                  }}
                  className="hidden"
                />
                
                {photoData.preview ? (
                  <Card className="relative aspect-square overflow-hidden group">
                    <img
                      src={photoData.preview}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => document.getElementById(`photo-input-${index}`)?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card 
                    className="aspect-square border-2 border-dashed cursor-pointer hover:border-primary transition-colors flex items-center justify-center"
                    onClick={() => document.getElementById(`photo-input-${index}`)?.click()}
                  >
                    <div className="text-center p-4">
                      <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Clique para adicionar</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          ))}
        </div>

        {photos.length < MAX_PHOTOS && photos.length >= 2 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddPhotoSlot}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Mais Fotos (máximo {MAX_PHOTOS})
          </Button>
        )}
      </div>
    );
  }
);

MultiplePhotosUpload.displayName = 'MultiplePhotosUpload';

export default MultiplePhotosUpload;
