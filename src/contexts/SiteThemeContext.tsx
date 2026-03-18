import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type SiteThemeId = 'apipainel' | 'matrix';

interface SiteThemeContextType {
  activeTheme: SiteThemeId;
  previewTheme: SiteThemeId | null;
  applyTheme: (themeId: SiteThemeId) => void;
  saveTheme: (themeId: SiteThemeId) => void;
  cancelPreview: () => void;
  currentVisualTheme: SiteThemeId;
}

const SiteThemeContext = createContext<SiteThemeContextType | undefined>(undefined);

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<SiteThemeId>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('site_theme') as SiteThemeId) || 'apipainel';
    }
    return 'apipainel';
  });
  const [previewTheme, setPreviewTheme] = useState<SiteThemeId | null>(null);

  const currentVisualTheme = previewTheme || activeTheme;

  // Apply/remove theme class on root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-matrix');
    if (currentVisualTheme === 'matrix') {
      root.classList.add('theme-matrix');
    }
  }, [currentVisualTheme]);

  const applyTheme = useCallback((themeId: SiteThemeId) => {
    setPreviewTheme(themeId);
  }, []);

  const saveTheme = useCallback((themeId: SiteThemeId) => {
    setActiveTheme(themeId);
    setPreviewTheme(null);
    localStorage.setItem('site_theme', themeId);
  }, []);

  const cancelPreview = useCallback(() => {
    setPreviewTheme(null);
  }, []);

  return (
    <SiteThemeContext.Provider value={{ activeTheme, previewTheme, applyTheme, saveTheme, cancelPreview, currentVisualTheme }}>
      {children}
    </SiteThemeContext.Provider>
  );
}

export const useSiteTheme = () => {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) throw new Error('useSiteTheme must be used within SiteThemeProvider');
  return ctx;
};
