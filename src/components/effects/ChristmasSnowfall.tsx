import React from 'react';

const ChristmasSnowfall = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      <div className="snowflake">❅</div>
      <div className="snowflake">❆</div>
      
      <style>{`
        .snowflake {
          position: absolute;
          top: -10%;
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.5rem;
          animation: fall linear infinite;
        }
        
        .snowflake:nth-child(1) { left: 10%; animation-duration: 8s; animation-delay: 0s; }
        .snowflake:nth-child(2) { left: 20%; animation-duration: 10s; animation-delay: 1s; }
        .snowflake:nth-child(3) { left: 30%; animation-duration: 9s; animation-delay: 2s; }
        .snowflake:nth-child(4) { left: 40%; animation-duration: 11s; animation-delay: 0.5s; }
        .snowflake:nth-child(5) { left: 50%; animation-duration: 8.5s; animation-delay: 1.5s; }
        .snowflake:nth-child(6) { left: 60%; animation-duration: 10.5s; animation-delay: 0.8s; }
        .snowflake:nth-child(7) { left: 70%; animation-duration: 9.5s; animation-delay: 2.5s; }
        .snowflake:nth-child(8) { left: 80%; animation-duration: 11.5s; animation-delay: 1.2s; }
        .snowflake:nth-child(9) { left: 90%; animation-duration: 8.8s; animation-delay: 0.3s; }
        .snowflake:nth-child(10) { left: 95%; animation-duration: 10.2s; animation-delay: 2.2s; }
        
        @keyframes fall {
          0% {
            top: -10%;
            opacity: 1;
          }
          100% {
            top: 110%;
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

export default ChristmasSnowfall;
