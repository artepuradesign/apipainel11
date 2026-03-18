import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface LightningEffectProps {
  onComplete?: () => void;
}

const LightningEffect: React.FC<LightningEffectProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const bolts = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: `${5 + Math.random() * 90}%`,
    delay: `${Math.random() * 0.8}s`,
    duration: `${0.6 + Math.random() * 0.8}s`,
    size: 20 + Math.random() * 20,
    rotation: -15 + Math.random() * 30,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Flash overlay */}
      <div className="absolute inset-0 animate-flash-overlay" />
      
      {bolts.map((bolt) => (
        <div
          key={bolt.id}
          className="absolute animate-lightning-fall"
          style={{
            left: bolt.left,
            top: '-60px',
            animationDelay: bolt.delay,
            animationDuration: bolt.duration,
            transform: `rotate(${bolt.rotation}deg)`,
          }}
        >
          <Zap
            size={bolt.size}
            className="text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]"
            fill="rgba(250,204,21,0.7)"
            strokeWidth={2.5}
          />
        </div>
      ))}

      <style>{`
        @keyframes lightning-fall {
          0% {
            top: -60px;
            opacity: 1;
            transform: translateY(0) scale(1.2);
          }
          60% {
            opacity: 1;
          }
          100% {
            top: 110vh;
            opacity: 0;
            transform: translateY(0) scale(0.6);
          }
        }
        
        @keyframes flash-overlay {
          0% { background: rgba(250, 204, 21, 0.15); }
          10% { background: rgba(250, 204, 21, 0); }
          20% { background: rgba(250, 204, 21, 0.1); }
          30% { background: rgba(250, 204, 21, 0); }
          100% { background: transparent; }
        }
        
        .animate-lightning-fall {
          animation: lightning-fall 1s ease-in forwards;
        }
        
        .animate-flash-overlay {
          animation: flash-overlay 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LightningEffect;
