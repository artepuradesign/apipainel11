
import React from 'react';

interface AnimatedBlobProps {
  gradient: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  position: {
    top: string;
    left?: string;
    right?: string;
  };
  animationDuration: string;
  opacity: {
    light: string;
    dark: string;
  };
}

const AnimatedBlob: React.FC<AnimatedBlobProps> = ({
  gradient,
  size,
  position,
  animationDuration,
  opacity
}) => {
  const sizeClasses = {
    sm: 'w-60 h-60',
    md: 'w-72 h-72',
    lg: 'w-80 h-80',
    xl: 'w-96 h-96'
  };

  return (
    <div 
      className={`absolute ${sizeClasses[size]} rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse`}
      style={{
        background: gradient,
        top: position.top,
        left: position.left,
        right: position.right,
        animationDuration
      }}
    />
  );
};

export default AnimatedBlob;
