import React, { createContext, useContext, useState, useCallback } from 'react';

export interface LiquidGlassConfig {
  enabled: boolean;      // toggle on/off
  strength: number;      // px (0-50)
  softness: number;      // px (0-50)
  extraBlur: number;     // px (0-20)
  tinting: number;       // % (0-100)
  tintSaturation: number; // % (0-400)
  tintHue: number;       // degrees (0-360)
  contrast: number;      // % (0-200)
  brightness: number;    // % (0-200)
  invert: number;        // % (0-100)
  edgeSpecularity: number; // % (0-100)
  cornerRadius: number;  // px (0-100)
  opacity: number;       // % (0-100)
  backgroundAlpha: number; // % (0-100) - transparência do fundo do botão
}

export const defaultLiquidGlassConfig: LiquidGlassConfig = {
  enabled: true,
  strength: 0,
  softness: 0,
  extraBlur: 1,
  tinting: 0,
  tintSaturation: 60,
  tintHue: 0,
  contrast: 100,
  brightness: 115,
  invert: 0,
  edgeSpecularity: 100,
  cornerRadius: 10,
  opacity: 100,
  backgroundAlpha: 0,
};

interface LiquidGlassContextType {
  config: LiquidGlassConfig;
  setConfig: (config: LiquidGlassConfig) => void;
  updateParam: <K extends keyof LiquidGlassConfig>(key: K, value: LiquidGlassConfig[K]) => void;
  resetToDefaults: () => void;
}

const LiquidGlassContext = createContext<LiquidGlassContextType | undefined>(undefined);

const STORAGE_KEY = 'liquid-glass-config';

function loadConfig(): LiquidGlassConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultLiquidGlassConfig, ...JSON.parse(stored) };
  } catch {}
  return defaultLiquidGlassConfig;
}

export const LiquidGlassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<LiquidGlassConfig>(loadConfig);

  const setConfig = useCallback((cfg: LiquidGlassConfig) => {
    setConfigState(cfg);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  }, []);

  const updateParam = useCallback(<K extends keyof LiquidGlassConfig>(key: K, value: LiquidGlassConfig[K]) => {
    setConfigState(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfig(defaultLiquidGlassConfig);
  }, [setConfig]);

  return (
    <LiquidGlassContext.Provider value={{ config, setConfig, updateParam, resetToDefaults }}>
      {children}
    </LiquidGlassContext.Provider>
  );
};

export const useLiquidGlass = (): LiquidGlassContextType => {
  const ctx = useContext(LiquidGlassContext);
  if (!ctx) {
    // Return safe defaults when used outside provider
    return {
      config: defaultLiquidGlassConfig,
      setConfig: () => {},
      updateParam: () => {},
      resetToDefaults: () => {},
    };
  }
  return ctx;
};
