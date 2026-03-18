import React, { useRef, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';

/**
 * Matrix rain effect contained within its parent (uses position: absolute, NOT fixed).
 * Safe to use inside cards/panels without covering the entire screen.
 */
const ContainedMatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = theme === 'dark';

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize) || 1;
    let drops: number[] = Array(columns).fill(1).map(() => Math.random() * -50);

    const bgFade = isDark ? 'rgba(0, 3, 0, 0.04)' : 'rgba(245, 245, 245, 0.05)';
    const mainColorFn = isDark
      ? () => `rgba(0, 255, 65, ${0.7 + Math.random() * 0.3})`
      : () => `rgba(20, 20, 20, ${0.4 + Math.random() * 0.5})`;
    const headColor = isDark ? '#aaffaa' : '#000000';

    const draw = () => {
      const newCols = Math.floor(canvas.width / fontSize) || 1;
      if (newCols !== columns) {
        columns = newCols;
        drops = Array(columns).fill(1).map(() => Math.random() * -50);
      }

      ctx.fillStyle = bgFade;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = Math.random() > 0.95 ? headColor : mainColorFn();
        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 45);

    return () => {
      clearInterval(interval);
      ro.disconnect();
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
};

export default ContainedMatrixRain;
