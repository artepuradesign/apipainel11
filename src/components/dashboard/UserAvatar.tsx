
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";

interface UserAvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
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

  if (!user) {
    return (
      <Avatar className={`${sizeClasses[size]} ring-2 ring-brand-purple/20 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ${className}`}>
        <AvatarFallback className={`bg-gradient-to-br from-brand-purple to-purple-600 text-white font-semibold ${textSizeClasses[size]}`}>
          U
        </AvatarFallback>
      </Avatar>
    );
  }

  const initials = getInitials(user.name || user.username || 'Usuário');

  return (
    <Avatar className={`${sizeClasses[size]} ring-2 ring-brand-purple/20 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ${className}`}>
      <AvatarFallback className={`bg-gradient-to-br from-brand-purple to-purple-600 text-white font-semibold ${textSizeClasses[size]}`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
