
import React, { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  className = "", 
  duration = 300 
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isIncreasing, setIsIncreasing] = useState(true);

  useEffect(() => {
    if (value !== displayValue) {
      setIsIncreasing(value > displayValue);
      setIsAnimating(true);
      
      // Atualizar o valor imediatamente para começar a animação do valor atual
      setDisplayValue(value);
      
      // Finalizar animação
      setTimeout(() => {
        setIsAnimating(false);
      }, duration);
    }
  }, [value, displayValue, duration]);

  return (
    <div className={`relative overflow-hidden h-8 flex items-center ${className}`}>
      <div 
        className={`w-full text-left transition-transform ease-in-out ${
          isAnimating 
            ? isIncreasing 
              ? 'animate-slide-in-from-bottom' 
              : 'animate-slide-in-from-top'
            : ''
        }`}
        style={{ transitionDuration: `${duration}ms` }}
      >
        {displayValue}
      </div>
    </div>
  );
};
