
import { useState, useEffect } from 'react';

export const useSidebarVisibility = (collapsed: boolean) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    if (collapsed) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (collapsed) {
      setIsHovered(false);
    }
  };

  return {
    isHovered,
    handleMouseEnter,
    handleMouseLeave
  };
};
