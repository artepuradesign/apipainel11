import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from 'lucide-react';
import PhotoUpload, { PhotoUploadRef } from '@/components/cpf/PhotoUpload';
import PhotoUpload2, { PhotoUpload2Ref } from '@/components/cpf/PhotoUpload2';

interface PhotosSectionProps {
  photoUploadRef: React.RefObject<PhotoUploadRef>;
  photoUpload2Ref: React.RefObject<PhotoUpload2Ref>;
  cpf: string;
}

const PhotosSection = ({ photoUploadRef, photoUpload2Ref, cpf }: PhotosSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Fotos
        </CardTitle>
        <CardDescription>
          Upload de fotos do cadastro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Foto Principal</label>
            <PhotoUpload ref={photoUploadRef} cpf={cpf} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Foto Secundária</label>
            <PhotoUpload2 ref={photoUpload2Ref} cpf={cpf} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotosSection;