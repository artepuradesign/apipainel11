import React from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useImageLoader } from '@/hooks/useImageLoader';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  aspectRatio?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className,
  fallbackText = 'Imagem não encontrada',
  aspectRatio = 'aspect-[3/4]'
}) => {
  const { src: loadedSrc, isLoading, error } = useImageLoader(src);

  if (!src) {
    return (
      <div className={cn("border rounded-lg p-8 text-center bg-muted/50", aspectRatio, className)}>
        <Camera className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground italic">{fallbackText}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("border rounded-lg flex items-center justify-center bg-muted/50", aspectRatio, className)}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Carregando imagem...</p>
        </div>
      </div>
    );
  }

  if (error || !loadedSrc) {
    return (
      <div className={cn("border rounded-lg p-8 text-center bg-muted/50", aspectRatio, className)}>
        <Camera className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground italic">{fallbackText}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Erro ao carregar: {src.split('/').pop()}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-muted", className)}>
      <img
        src={loadedSrc}
        alt={alt}
        className={cn("w-full object-cover", aspectRatio)}
        loading="lazy"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={(e) => {
          console.error('Erro no carregamento da imagem:', e);
        }}
      />
    </div>
  );
};

export default OptimizedImage;