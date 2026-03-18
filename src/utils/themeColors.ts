
export interface DarkThemeColors {
  background: {
    primary: string;
    secondary: string;
    card: string;
    form: string;
    hover: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
  };
  border: {
    primary: string;
    secondary: string;
    hover: string;
  };
  button: {
    primary: string;
    secondary: string;
    ghost: string;
    hover: string;
  };
}

export const darkThemeColors: DarkThemeColors = {
  background: {
    primary: 'bg-gray-900',           // Fundo principal
    secondary: 'bg-gray-800',         // Fundo secundário
    card: 'bg-gray-800',              // Cards
    form: 'bg-gray-700',              // Formulários
    hover: 'bg-gray-700/50',          // Hover states
  },
  text: {
    primary: 'text-gray-100',         // Texto principal
    secondary: 'text-gray-200',       // Texto secundário
    muted: 'text-gray-400',           // Texto esmaecido
    accent: 'text-brand-purple',      // Texto de destaque
  },
  border: {
    primary: 'border-gray-700',       // Bordas principais
    secondary: 'border-gray-600',     // Bordas secundárias
    hover: 'border-brand-purple/50',  // Bordas hover
  },
  button: {
    primary: 'bg-brand-purple hover:bg-brand-darkPurple',
    secondary: 'bg-gray-700 hover:bg-gray-600',
    ghost: 'hover:bg-gray-700/50',
    hover: 'hover:bg-gray-700/30',
  }
};

export const getDarkThemeClasses = () => ({
  // Layout
  pageBackground: 'dark:bg-gray-900',
  cardBackground: 'dark:bg-gray-800',
  formBackground: 'dark:bg-gray-700',
  
  // Text
  primaryText: 'dark:text-gray-100',
  secondaryText: 'dark:text-gray-200',
  mutedText: 'dark:text-gray-400',
  
  // Borders
  primaryBorder: 'dark:border-gray-700',
  secondaryBorder: 'dark:border-gray-600',
  
  // Buttons
  ghostButton: 'dark:hover:bg-gray-700/50',
  secondaryButton: 'dark:bg-gray-700 dark:hover:bg-gray-600',
  
  // Form elements
  input: 'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400',
  select: 'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100',
  
  // States
  hover: 'dark:hover:bg-gray-700/30',
  focus: 'dark:focus:ring-brand-purple/50 dark:focus:border-brand-purple',
});
