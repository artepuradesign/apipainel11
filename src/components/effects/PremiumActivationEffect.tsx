import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface PremiumActivationEffectProps {
  onComplete?: () => void;
}

const PremiumActivationEffect: React.FC<PremiumActivationEffectProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const bolts = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${3 + Math.random() * 94}%`,
    delay: `${Math.random() * 1}s`,
    duration: `${0.8 + Math.random() * 1}s`,
    size: 32 + Math.random() * 36,
    rotation: -20 + Math.random() * 40,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <div className="absolute inset-0 animate-premium-flash" />
      
      {bolts.map((bolt) => (
        <div
          key={bolt.id}
          className="absolute animate-premium-bolt"
          style={{
            left: bolt.left,
            top: '-80px',
            animationDelay: bolt.delay,
            animationDuration: bolt.duration,
            transform: `rotate(${bolt.rotation}deg)`,
          }}
        >
          <Zap
            size={bolt.size}
            className="text-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,0.9)]"
            fill="rgba(250,204,21,0.8)"
            strokeWidth={2}
          />
        </div>
      ))}

      <style>{`
        @keyframes premium-bolt {
          0% {
            top: -80px;
            opacity: 1;
            transform: translateY(0) scale(1.4);
          }
          40% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            top: 110vh;
            opacity: 0;
            transform: translateY(0) scale(0.5);
          }
        }
        
        @keyframes premium-flash {
          0% { background: rgba(250, 204, 21, 0.2); }
          8% { background: rgba(250, 204, 21, 0); }
          15% { background: rgba(250, 204, 21, 0.15); }
          22% { background: rgba(250, 204, 21, 0); }
          30% { background: rgba(250, 204, 21, 0.08); }
          100% { background: transparent; }
        }
        
        .animate-premium-bolt {
          animation: premium-bolt 1.2s ease-in forwards;
        }
        
        .animate-premium-flash {
          animation: premium-flash 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PremiumActivationEffect;
