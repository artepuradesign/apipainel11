import React, { useState, useEffect, useRef } from 'react';

interface SimpleCounterProps {
  value: number;
  className?: string;
  duration?: number;
  formatAsCurrency?: boolean;
}

export const SimpleCounter: React.FC<SimpleCounterProps> = ({ 
  value, 
  className = "", 
  duration = 5000,
  formatAsCurrency = false
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [forceAnimate, setForceAnimate] = useState(0);
  const displayRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Mantém uma referência do valor exibido em tempo real para iniciar a animação do número atual na tela
  useEffect(() => {
    displayRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    // Se o valor não mudou e não é uma animação forçada, não anima
    if (value === displayRef.current && forceAnimate === 0) return;

    setIsAnimating(true);
    let startTime: number | null = null;
    const startValue = displayRef.current;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const interpolated = startValue + (value - startValue) * easeOutExpo;

      setDisplayValue(formatAsCurrency ? interpolated : Math.floor(interpolated));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value); // termina exatamente no valor final
        setIsAnimating(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration, formatAsCurrency, forceAnimate]);

  // Listen for balance update events
  useEffect(() => {
    const handleBalanceUpdate = (event: CustomEvent) => {
      if (event.detail?.timestamp) {
        setForceAnimate(event.detail.timestamp);
      }
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    
    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    };
  }, []);

  const formatValue = (val: number) => {
    if (formatAsCurrency) {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(val);
    }
    return val.toString();
  };

  return (
    <div className={`${className} min-w-[80px] text-left tabular-nums flex items-center gap-1`}>
      {formatAsCurrency && <span>R$</span>}
      <span>{formatValue(displayValue)}</span>
    </div>
  );
};