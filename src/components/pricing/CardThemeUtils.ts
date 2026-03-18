
export interface CardThemeStyles {
  background: string;
  border: string;
  suitColor: string;
  textColor: string;
}

export const getCardThemeStyles = (color?: string): CardThemeStyles => {
  const colorMap = {
    'tone1': {
      background: 'linear-gradient(135deg, rgba(243, 240, 254, 0.85) 0%, rgba(232, 227, 253, 0.85) 50%, rgba(255, 255, 255, 0.85) 100%)',
      border: '2px solid rgba(155, 135, 245, 0.6)',
      suitColor: '#9b87f5',
      textColor: ''
    },
    'tone2': {
      background: 'linear-gradient(135deg, rgba(139, 119, 229, 0.85) 0%, rgba(124, 109, 219, 0.85) 50%, rgba(109, 99, 209, 0.85) 100%)',
      border: '2px solid rgba(109, 99, 209, 0.6)',
      suitColor: '#ffffff',
      textColor: 'text-white'
    },
    'tone3': {
      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.85) 50%, rgba(107, 33, 168, 0.85) 100%)',
      border: '2px solid rgba(147, 51, 234, 0.6)',
      suitColor: '#ffffff',
      textColor: 'text-white'
    },
    'tone4': {
      background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.85) 0%, rgba(17, 24, 39, 0.85) 50%, rgba(15, 23, 42, 0.85) 100%)',
      border: '2px solid rgba(15, 23, 42, 0.6)',
      suitColor: '#ffffff',
      textColor: 'text-white'
    }
  };

  return colorMap[color as keyof typeof colorMap] || colorMap.tone1;
};

export const getButtonColor = (color?: string): string => {
  const colorMap = {
    'tone1': 'bg-brand-tone1 hover:bg-brand-tone1/90 dark:bg-brand-tone1 dark:hover:bg-brand-tone1/90',
    'tone2': 'bg-brand-tone2 hover:bg-brand-tone2/90 dark:bg-brand-tone2 dark:hover:bg-brand-tone2/90',
    'tone3': 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700',
    'tone4': 'bg-brand-tone4 hover:bg-brand-tone4/90 dark:bg-brand-tone4 dark:hover:bg-brand-tone4/90'
  };

  return colorMap[color as keyof typeof colorMap] || colorMap.tone1;
};
