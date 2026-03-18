
export interface CardTheme {
  id: string;
  name: string;
  colors: {
    background: string;
    border: string;
    text: string;
    suit: string;
    highlight: string;
  };
}

export const cardThemes: CardTheme[] = [
  {
    id: 'tone1',
    name: 'Claro',
    colors: {
      background: '#ffffff',
      border: '#e5e7eb',
      text: '#374151',
      suit: '#9b87f5',
      highlight: '#10b981'
    }
  },
  {
    id: 'lilas',
    name: 'Lilás',
    colors: {
      background: 'linear-gradient(135deg, rgba(196, 181, 253, 0.9) 0%, rgba(167, 139, 250, 0.85) 50%, rgba(139, 92, 246, 0.8) 100%)',
      border: '#a78bfa',
      text: '#ffffff',
      suit: '#ffffff',
      highlight: '#ffffff'
    }
  },
  {
    id: 'roxo',
    name: 'Roxo',
    colors: {
      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(126, 34, 206, 0.85) 50%, rgba(107, 33, 168, 0.8) 100%)',
      border: '#9333ea',
      text: '#ffffff',
      suit: '#ffffff',
      highlight: '#ffffff'
    }
  },
  {
    id: 'preto',
    name: 'Preto',
    colors: {
      background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.95) 0%, rgba(31, 41, 55, 0.9) 50%, rgba(17, 24, 39, 0.85) 100%)',
      border: '#374151',
      text: '#ffffff',
      suit: '#ffffff',
      highlight: '#10b981'
    }
  }
];

export const getDefaultTheme = (): CardTheme => cardThemes[0];

export const getThemeById = (id: string): CardTheme => {
  return cardThemes.find(theme => theme.id === id) || getDefaultTheme();
};
