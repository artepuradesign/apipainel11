import React, { useRef, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';

const MatrixRainBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = theme === 'dark';

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1).map(() => Math.random() * -100);

    // Dark = bright green on black; Light = dark gray on white
    const bgFade = isDark ? 'rgba(0, 3, 0, 0.03)' : 'rgba(245, 245, 245, 0.04)';
    const mainColorFn = isDark
      ? () => `rgba(0, 255, 65, ${0.7 + Math.random() * 0.3})`
      : () => `rgba(20, 20, 20, ${0.4 + Math.random() * 0.5})`;
    const headColor = isDark ? '#aaffaa' : '#000000';

    const draw = () => {
      ctx.fillStyle = bgFade;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (Math.random() > 0.95) {
          ctx.fillStyle = headColor;
        } else {
          ctx.fillStyle = mainColorFn();
        }

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
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <div className="matrix-bg-container">
      <canvas ref={canvasRef} className="matrix-rain-canvas" />
    </div>
  );
};

export default MatrixRainBackground;
