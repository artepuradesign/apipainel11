import React, { useState, useEffect } from 'react';

interface CurrencyCounterProps {
  value: number;
  className?: string;
  duration?: number;
}

interface DigitProps {
  value: number;
  duration: number;
  delay: number;
}

const Digit: React.FC<DigitProps> = ({ value, duration, delay }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const stepDuration = duration / (value + 1);
      
      const interval = setInterval(() => {
        current++;
        setCurrentValue(current);
        
        if (current >= value) {
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, duration, delay]);

  return (
    <div className="relative h-8 w-4 overflow-hidden flex items-center justify-center">
      <div 
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(-${currentValue * 100}%)`,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <div key={digit} className="h-8 flex items-center justify-center">
            {digit}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CurrencyCounter: React.FC<CurrencyCounterProps> = ({ 
  value, 
  className = "", 
  duration = 8000
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  // Converter o valor para string e separar dígitos
  const formattedValue = Math.floor(value).toString();
  const digits = formattedValue.split('').map(Number);

  return (
    <div className={`flex items-center ${className}`}>
      <span className="mr-1">R$</span>
      <div className="flex">
        {digits.map((digit, index) => (
          <Digit 
            key={index}
            value={digit}
            duration={duration}
            delay={index * 200} // Delay escalonado para efeito em cascata
          />
        ))}
      </div>
      <span className="ml-1">,00</span>
    </div>
  );
};