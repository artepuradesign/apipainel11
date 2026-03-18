import React, { useState } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackText?: string;
}

const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  fallbackText = 'Imagem não encontrada'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  console.log('🖼️ AuthenticatedImage: Carregando imagem:', src);

  const handleLoad = () => {
    console.log('✅ Imagem carregada com sucesso:', src);
    setLoading(false);
    setError(false);
    onLoad?.();
  };

  const handleError = () => {
    console.log('❌ Erro ao carregar imagem:', src);
    setLoading(false);
    setError(true);
    onError?.();
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageOff className="h-8 w-8" />
          <span className="text-sm text-center">{fallbackText}</span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={src}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default AuthenticatedImage;