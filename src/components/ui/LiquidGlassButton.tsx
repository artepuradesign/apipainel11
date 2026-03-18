
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLiquidGlass } from '@/contexts/LiquidGlassContext';

interface LiquidGlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
  className?: string;
  ariaLabel?: string;
}

const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className,
  ariaLabel,
}) => {
  const [ripplePos, setRipplePos] = useState({ x: 50, y: 50 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const { config } = useLiquidGlass();

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setRipplePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const isPrimary = variant === 'primary';

  return (
    <motion.button
      ref={btnRef}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerDown={() => {}}
      onPointerUp={() => {}}
      onPointerLeave={() => {}}
      aria-label={ariaLabel}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'liquid-glass-btn',
        isPrimary ? 'liquid-glass-primary' : 'liquid-glass-outline',
        className
      )}
      style={{
        '--ripple-x': `${ripplePos.x}%`,
        '--ripple-y': `${ripplePos.y}%`,
        borderRadius: `${config.cornerRadius}px`,
        ...(config.enabled ? {
          backdropFilter: `blur(${config.strength + config.extraBlur}px) saturate(${config.tintSaturation}%) contrast(${config.contrast}%) brightness(${config.brightness}%) invert(${config.invert}%) hue-rotate(${config.tintHue}deg)`,
          WebkitBackdropFilter: `blur(${config.strength + config.extraBlur}px) saturate(${config.tintSaturation}%) contrast(${config.contrast}%) brightness(${config.brightness}%) invert(${config.invert}%) hue-rotate(${config.tintHue}deg)`,
          boxShadow: `0 0 ${config.softness}px rgba(255,255,255,${config.edgeSpecularity / 200}), inset 0 1px 0 rgba(255,255,255,${config.edgeSpecularity / 300})`,
          opacity: config.opacity / 100,
        } : {}),
      } as React.CSSProperties}
    >
      <span className="liquid-glass-glow" aria-hidden="true" />
      <span className="liquid-glass-specular" aria-hidden="true" />
      <span className="liquid-glass-label">{children}</span>
    </motion.button>
  );
};

export default LiquidGlassButton;
