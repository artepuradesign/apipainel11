import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';

interface LockEffectProps {
  onComplete?: () => void;
}

const LockEffect: React.FC<LockEffectProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const locks = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: `${5 + Math.random() * 90}%`,
    delay: `${Math.random() * 0.8}s`,
    duration: `${0.6 + Math.random() * 0.8}s`,
    size: 18 + Math.random() * 18,
    rotation: -15 + Math.random() * 30,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <div className="absolute inset-0 animate-lock-flash" />
      
      {locks.map((lock) => (
        <div
          key={lock.id}
          className="absolute animate-lock-fall"
          style={{
            left: lock.left,
            top: '-60px',
            animationDelay: lock.delay,
            animationDuration: lock.duration,
            transform: `rotate(${lock.rotation}deg)`,
          }}
        >
          <Lock
            size={lock.size}
            className="text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]"
            strokeWidth={2.5}
          />
        </div>
      ))}

      <style>{`
        @keyframes lock-fall {
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
        
        @keyframes lock-flash {
          0% { background: rgba(239, 68, 68, 0.12); }
          10% { background: rgba(239, 68, 68, 0); }
          20% { background: rgba(239, 68, 68, 0.08); }
          30% { background: rgba(239, 68, 68, 0); }
          100% { background: transparent; }
        }
        
        .animate-lock-fall {
          animation: lock-fall 1s ease-in forwards;
        }
        
        .animate-lock-flash {
          animation: lock-flash 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LockEffect;
