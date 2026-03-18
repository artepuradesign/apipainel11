 import React from 'react';
 import { Card } from '@/components/ui/card';
 import { TrendingUp, BarChart3 } from 'lucide-react';
 
 interface ScoreGaugeCardProps {
   title: string;
   score: number | string | null;
   faixa: string | null;
   maxScore?: number;
   icon?: 'chart' | 'trending';
  compact?: boolean;
  embedded?: boolean;
  headerRight?: React.ReactNode;
 }
 
 const ScoreGaugeCard: React.FC<ScoreGaugeCardProps> = ({ 
   title, 
   score, 
   faixa, 
   maxScore = 1000,
  icon = 'chart',
  compact = false,
  embedded = false,
  headerRight,
 }) => {
   // Converter score para número
   const numericScore = typeof score === 'string' ? parseFloat(score) : (score || 0);
   const percentage = Math.min((numericScore / maxScore) * 100, 100);
   
  // Determinar cor baseada no score (somente para ícone/texto; cores do gauge são fixas)
   const getColor = () => {
    if (percentage <= 33) return { text: 'text-destructive' };
    if (percentage <= 66) return { text: 'text-primary' };
    return { text: 'text-success' };
   };
   
   const colors = getColor();
   
   // Ângulo para o ponteiro (de -90 a 90 graus)
   const needleAngle = -90 + (percentage * 1.8);

  const needleStrokeWidth = compact ? 2 : 3;
  const needleY2 = compact ? 48 : 40;
  const needleCenterRadius = compact ? 4 : 5;
   
   const IconComponent = icon === 'trending' ? TrendingUp : BarChart3;

  const pad = compact ? 'p-2' : 'p-6';
  const gaugePad = compact ? 'p-2' : 'p-6';
  const headerGap = compact ? 'mb-2' : 'mb-4';
  const iconSize = compact ? 'h-3.5 w-3.5' : 'h-5 w-5';
  const scoreSize = compact ? 'text-xl' : 'text-3xl';
  const scoreInfoSize = compact ? 'text-[11px]' : 'text-sm';

  const Root: React.ElementType = embedded ? 'div' : Card;
  const rootClassName = embedded
    ? 'bg-transparent border-0 shadow-none'
    : 'bg-card text-card-foreground border-border overflow-hidden';
   
   return (
    <Root className={rootClassName}>
      <div className={pad}>
         {/* Header */}
         <div className={`flex items-center justify-between gap-3 ${headerGap}`}>
           <div className="flex items-center gap-2 min-w-0">
             <IconComponent className={`${iconSize} ${colors.text}`} />
             <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground truncate">
               {title}
             </h3>
           </div>

           {headerRight ? (
             <div className="shrink-0">{headerRight}</div>
           ) : null}
         </div>
         
         {/* Gauge Chart */}
        <div
          className={`bg-background border border-border rounded-lg ${gaugePad} mb-2 relative`}
          style={compact ? { aspectRatio: '16/10' } : { aspectRatio: '1/1' }}
        >
           <svg viewBox="0 0 200 120" className="w-full h-auto">
             {/* Background arcs */}
             <path
               d="M 30 100 A 70 70 0 0 1 170 100"
               fill="none"
              stroke="hsl(var(--muted))"
               strokeWidth="20"
               strokeLinecap="round"
             />
             
             {/* Red section */}
             <path
               d="M 30 100 A 70 70 0 0 1 76.5 35"
               fill="none"
              stroke="hsl(var(--destructive))"
               strokeWidth="20"
               strokeLinecap="round"
             />
             
             {/* Yellow section */}
             <path
               d="M 76.5 35 A 70 70 0 0 1 123.5 35"
               fill="none"
              stroke="hsl(var(--chart-4))"
               strokeWidth="20"
               strokeLinecap="round"
             />
             
             {/* Green section */}
             <path
               d="M 123.5 35 A 70 70 0 0 1 170 100"
               fill="none"
              stroke="hsl(var(--success))"
               strokeWidth="20"
               strokeLinecap="round"
             />
             
             {/* Needle */}
             <g transform={`rotate(${needleAngle} 100 100)`}>
               <line
                 x1="100"
                 y1="100"
                 x2="100"
                  y2={needleY2}
                stroke="hsl(var(--muted-foreground))"
                  strokeWidth={needleStrokeWidth}
                 strokeLinecap="round"
               />
               <circle cx="100" cy="100" r={needleCenterRadius} fill="hsl(var(--muted-foreground))" />
             </g>
           </svg>
           
           {/* Score Display */}
            <div className={`absolute inset-0 flex flex-col items-center justify-end ${compact ? 'pb-2' : 'pb-4'}`}>
            <div className={`${scoreSize} font-bold text-foreground`}>
               {Math.round(numericScore)}
             </div>
            <div className="text-xs text-muted-foreground font-medium">
               /{maxScore}
             </div>
           </div>
         </div>
         
         {/* Score Info */}
         <div className="space-y-1">
           <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs uppercase">Pontuação:</span>
            <span className={`font-bold ${scoreInfoSize} ${colors.text}`}>
               {Math.round(numericScore)}
             </span>
           </div>
           <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs uppercase">Faixa:</span>
            <span className={`font-semibold ${scoreInfoSize} ${colors.text} uppercase`}>
               {faixa || 'N/A'}
             </span>
           </div>
         </div>
       </div>
    </Root>
   );
 };
 
 export default ScoreGaugeCard;