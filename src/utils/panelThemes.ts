
export interface PanelTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  description: string;
}

export const defaultPanelThemes: PanelTheme[] = [
  {
    id: 'purple',
    name: 'Roxo Corporativo',
    primary: 'purple-600',
    secondary: 'purple-100',
    accent: 'purple-800',
    background: 'white',
    description: 'Tema padrão elegante com tons de roxo'
  },
  {
    id: 'blue',
    name: 'Azul Profissional',
    primary: 'blue-600',
    secondary: 'blue-100',
    accent: 'blue-800',
    background: 'white',
    description: 'Tema profissional com tons de azul'
  },
  {
    id: 'green',
    name: 'Verde Sustentável',
    primary: 'green-600',
    secondary: 'green-100',
    accent: 'green-800',
    background: 'white',
    description: 'Tema eco-friendly com tons de verde'
  },
  {
    id: 'orange',
    name: 'Laranja Criativo',
    primary: 'orange-600',
    secondary: 'orange-100',
    accent: 'orange-800',
    background: 'white',
    description: 'Tema vibrante com tons de laranja'
  }
];

export const savePanelThemes = (themes: PanelTheme[]) => {
  localStorage.setItem('panel_themes', JSON.stringify(themes));
};

export const loadPanelThemes = (): PanelTheme[] => {
  const saved = localStorage.getItem('panel_themes');
  return saved ? JSON.parse(saved) : defaultPanelThemes;
};

export const getPanelTheme = (themeId: string): PanelTheme => {
  const themes = loadPanelThemes();
  return themes.find(theme => theme.id === themeId) || defaultPanelThemes[0];
};
