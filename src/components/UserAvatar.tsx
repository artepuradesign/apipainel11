
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string;
  instagramHandle?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  name, 
  instagramHandle, 
  size = 'md',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Gerar iniciais do nome
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

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
  
  // Limpar e validar o handle do Instagram
  const cleanHandle = instagramHandle?.toString().replace('@', '').trim();
  const hasValidHandle = cleanHandle && cleanHandle.length > 0;
  
  // URLs alternativas para tentar buscar a imagem
  const getImageUrls = (handle: string) => [
    `https://unavatar.io/instagram/${handle}`,
    `https://www.instagram.com/${handle}/channel/?__a=1`,
    `https://instagram.com/${handle}/channel/?__a=1`
  ];

  const handleImageError = () => {
    console.log(`Erro ao carregar imagem do Instagram para @${cleanHandle}`);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log(`Imagem do Instagram carregada com sucesso para @${cleanHandle}`);
    setImageLoaded(true);
  };

  // Determinar se deve tentar carregar a imagem
  const shouldTryImage = hasValidHandle && !imageError;

  return (
    <Avatar className={`${sizeClasses[size]} ring-2 ring-brand-purple/20 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ${className}`}>
      {shouldTryImage && (
        <AvatarImage 
          src={getImageUrls(cleanHandle!)[0]}
          alt={`Foto de perfil de ${name} do Instagram`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      <AvatarFallback className={`bg-gradient-to-br from-brand-purple to-purple-600 text-white font-semibold ${textSizeClasses[size]}`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
