
import React from 'react';
import AnimatedBlob from './AnimatedBlob';

interface OpacityValues {
  light: string;
  lightSecondary: string;
  dark: string;
  darkSecondary: string;
}

export const createAnimatedBlobs = (opacityVals: OpacityValues) => {
  const blobsConfig = [
    {
      gradient: `linear-gradient(to bottom right, rgba(155, 135, 245, ${opacityVals.light}), rgba(219, 112, 147, ${opacityVals.light}), rgba(220, 38, 127, ${opacityVals.light}))`,
      size: 'xl' as const,
      position: { top: '5%', right: '5%' },
      animationDuration: '4s'
    },
    {
      gradient: `linear-gradient(to bottom right, rgba(59, 130, 246, ${opacityVals.light}), rgba(34, 197, 94, ${opacityVals.light}), rgba(20, 184, 166, ${opacityVals.light}))`,
      size: 'xl' as const,
      position: { top: '15%', left: '5%' },
      animationDuration: '6s'
    }
  ];

  return blobsConfig.map((config, index) => (
    <AnimatedBlob
      key={index}
      gradient={config.gradient}
      size={config.size}
      position={config.position}
      animationDuration={config.animationDuration}
      opacity={opacityVals}
    />
  ));
};
