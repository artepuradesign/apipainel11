
import React from 'react';
import BackgroundGradients from './background/BackgroundGradients';
import { createAnimatedBlobs } from './background/createAnimatedBlobs';
import { useSiteTheme } from '@/contexts/SiteThemeContext';
import MatrixRainBackground from '@/components/effects/MatrixRainBackground';

interface GlobalAnimatedBackgroundProps {
  variant?: 'default' | 'landing' | 'dashboard' | 'auth';
  opacity?: 'light' | 'medium' | 'strong';
}

const GlobalAnimatedBackground = ({ 
  variant = 'default', 
  opacity = 'medium' 
}: GlobalAnimatedBackgroundProps) => {
  const { currentVisualTheme } = useSiteTheme();

  // Matrix theme: show character rain instead of blobs
  if (currentVisualTheme === 'matrix') {
    return <MatrixRainBackground />;
  }

  const getOpacityValues = () => {
    switch (opacity) {
      case 'light':
        return { light: '0.3', lightSecondary: '0.2', dark: '0.5', darkSecondary: '0.4' };
      case 'medium':
        return { light: '0.7', lightSecondary: '0.6', dark: '0.9', darkSecondary: '0.8' };
      case 'strong':
        return { light: '0.9', lightSecondary: '0.8', dark: '0.95', darkSecondary: '0.9' };
      default:
        return { light: '0.7', lightSecondary: '0.6', dark: '0.9', darkSecondary: '0.8' };
    }
  };

  const opacityVals = getOpacityValues();

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <BackgroundGradients />
      {createAnimatedBlobs(opacityVals)}
    </div>
  );
};

export default GlobalAnimatedBackground;
