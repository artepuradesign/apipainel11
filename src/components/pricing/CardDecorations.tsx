
import React from 'react';
import { CardThemeStyles } from './CardThemeUtils';

interface CardDecorationsProps {
  cardSuit?: string;
  cardType?: string;
  styles: CardThemeStyles;
}

const CardDecorations = ({ cardSuit, cardType, styles }: CardDecorationsProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Card suit decorations */}
      <div 
        className="absolute top-3 left-3 text-lg font-bold opacity-15"
        style={{ color: styles.suitColor }}
      >
        {cardSuit}
      </div>
      <div 
        className="absolute top-3 right-3 text-sm font-bold opacity-15"
        style={{ color: styles.suitColor }}
      >
        {cardType?.[0]}
      </div>
      <div 
        className="absolute bottom-3 right-3 text-lg font-bold opacity-15 transform rotate-180"
        style={{ color: styles.suitColor }}
      >
        {cardSuit}
      </div>
      <div 
        className="absolute bottom-3 left-3 text-sm font-bold opacity-15 transform rotate-180"
        style={{ color: styles.suitColor }}
      >
        {cardType?.[0]}
      </div>
      
      {/* Central card decoration */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl opacity-5"
        style={{ color: styles.suitColor }}
      >
        {cardSuit}
      </div>
    </div>
  );
};

export default CardDecorations;
