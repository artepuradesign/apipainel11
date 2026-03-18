
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface InstagramAvatarProps {
  name: string;
  instagramHandle?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const InstagramAvatar: React.FC<InstagramAvatarProps> = ({ 
  name, 
  instagramHandle, 
  size = 'md',
  className = '' 
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Gerar iniciais do nome
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Tentar obter a imagem do Instagram
  useEffect(() => {
    if (!instagramHandle || !instagramHandle.trim()) return;

    const fetchInstagramImage = async () => {
      setIsLoading(true);
      const cleanHandle = instagramHandle.replace('@', '').trim();
      
      try {
        // Simular busca de imagem do Instagram
        // Em produção, você pode usar uma API ou serviço específico
        console.log(`Tentando buscar imagem para @${cleanHandle}`);
        
        // URLs alternativas para tentar
        const possibleUrls = [
          `https://www.instagram.com/${cleanHandle}/profile_picture`,
          `https://instagram.com/${cleanHandle}/profile_picture`,
          `https://scontent.cdninstagram.com/v/t51.2885-19/${cleanHandle}`,
        ];

        // Por enquanto, vamos usar uma abordagem de fallback
        // Em produção real, você integraria com uma API do Instagram
        setImageUrl(null);
        
      } catch (error) {
        console.error('Erro ao buscar imagem do Instagram:', error);
        setImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstagramImage();
  }, [instagramHandle]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  };

  const initials = getInitials(name);

  return (
    <Avatar className={`${sizeClasses[size]} ring-2 ring-brand-purple/20 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ${className}`}>
      {imageUrl && (
        <AvatarImage 
          src={imageUrl} 
          alt={`${name} - Instagram`}
          onError={() => setImageUrl(null)}
        />
      )}
      <AvatarFallback className={`bg-gradient-to-br from-brand-purple to-purple-600 text-white font-semibold ${textSizeClasses[size]} ${isLoading ? 'animate-pulse' : ''}`}>
        {isLoading ? '...' : initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default InstagramAvatar;
