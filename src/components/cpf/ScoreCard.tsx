import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { TrendingUp, Award, Shield, Target, AlertTriangle, Calculator, History, RefreshCw } from 'lucide-react';
import { useExternalScore } from '@/hooks/useExternalScore';
import { toast } from 'sonner';

interface ScoreCardProps {
  score: number;
  onScoreChange: (score: number) => void;
  cpf?: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, onScoreChange, cpf }) => {
  const {
    isLoading,
    error,
    getScore,
    updateScore,
    calculateScore,
    getScoreHistory,
    clearError,
    isValidScore,
    getScoreLabel,
    getScoreColor
  } = useExternalScore();

  const [isAutoCalculating, setIsAutoCalculating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [scoreHistory, setScoreHistory] = useState<Array<{ score: number; date: string; reason?: string }>>([]);

  // Carregar score da API externa quando CPF estiver disponível
  useEffect(() => {
    if (cpf && cpf.length >= 11) {
      loadExternalScore();
    }
  }, [cpf]);

  const loadExternalScore = async () => {
    if (!cpf) return;

    try {
      const scoreData = await getScore(cpf);
      if (scoreData) {
        onScoreChange(scoreData.score);
        setLastUpdated(scoreData.updated_at);
        toast.success('Score carregado da API externa');
      }
    } catch (error) {
      console.warn('Score não encontrado na API externa, usando valor atual');
    }
  };

  // Salvar score na API externa
  const saveScoreToApi = async () => {
    if (!cpf || !isValidScore(score)) {
      toast.error('CPF inválido ou score fora do intervalo válido');
      return;
    }

    const success = await updateScore(cpf, score);
    if (success) {
      setLastUpdated(new Date().toISOString());
    }
  };

  // Calcular score automaticamente
  const handleAutoCalculate = async () => {
    if (!cpf) {
      toast.error('CPF é necessário para calcular score automaticamente');
      return;
    }

    setIsAutoCalculating(true);
    try {
      const calculatedData = await calculateScore(cpf);
      if (calculatedData) {
        onScoreChange(calculatedData.score);
        setLastUpdated(new Date().toISOString());
        
        // Mostrar fatores considerados
        if (calculatedData.factors && calculatedData.factors.length > 0) {
          toast.success(`Score calculado! Fatores: ${calculatedData.factors.join(', ')}`);
        }
      }
    } finally {
      setIsAutoCalculating(false);
    }
  };

  // Carregar histórico de scores
  const loadScoreHistory = async () => {
    if (!cpf) return;

    const history = await getScoreHistory(cpf);
    setScoreHistory(history);
    setShowHistory(true);
  };

  const getScoreStatus = (score: number) => {
    const color = getScoreColor(score);
    
    return {
      label: getScoreLabel(score),
      color: `text-${color}-600 dark:text-${color}-400`,
      bgColor: `bg-${color}-50 dark:bg-${color}-900/20`,
      borderColor: `border-${color}-200 dark:border-${color}-800`,
      icon: score >= 800 ? Award : score >= 600 ? Shield : score >= 400 ? Target : AlertTriangle,
      description: score >= 800 ? 'Score muito alto, excelente para crédito' :
                  score >= 600 ? 'Score bom, boas chances de aprovação' :
                  score >= 400 ? 'Score regular, pode melhorar' : 'Score baixo, precisa de atenção'
    };
  };

  const scoreStatus = getScoreStatus(score);
  const StatusIcon = scoreStatus.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Card Principal do Score */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Score
              {cpf && (
                <span className="text-sm font-normal text-muted-foreground">
                  - Integrado com API Externa
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Pontuação de análise de crédito e risco financeiro
              {lastUpdated && (
                <span className="block text-xs mt-1">
                  Última atualização: {new Date(lastUpdated).toLocaleString('pt-BR')}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visualização do Score - Arco - Sempre visível */}
            <div className="bg-gradient-to-br from-background via-background to-accent/5 border rounded-xl p-4 sm:p-6 lg:p-8 transition-all duration-300">
              <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-between gap-4">
                {/* Score Arc */}
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-20 sm:w-40 sm:h-24 lg:w-48 lg:h-28">
                    <svg
                      viewBox="0 0 200 120"
                      className="w-full h-full"
                    >
                      {/* Background Arc */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      
                      {/* Progress Arc */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke={`url(#scoreGradient-${score || 0})`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * Math.min((score || 0) / 1000, 1))}
                        className="transition-all duration-1000 ease-out"
                      />
                      
                      {/* Gradient Definitions */}
                      <defs>
                        <linearGradient id={`scoreGradient-${score || 0}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={score < 400 ? "#ef4444" : "#ef4444"} />
                          <stop offset="25%" stopColor={score < 400 ? "#ef4444" : "#eab308"} />
                          <stop offset="60%" stopColor={score < 600 ? "#eab308" : "#22c55e"} />
                          <stop offset="100%" stopColor={score < 800 ? "#22c55e" : "#10b981"} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  {/* Score Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                    <div className="text-center">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 leading-none">
                        {score || 0}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        de 1000
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Score Label */}
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${scoreStatus.bgColor}`}>
                    <StatusIcon className={`h-4 w-4 ${scoreStatus.color}`} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${scoreStatus.bgColor} ${scoreStatus.color}`}>
                    {scoreStatus.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Controles de Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="score">Score (0-1000)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="1000"
                  value={score || ''}
                  onChange={(e) => onScoreChange(Number(e.target.value) || 0)}
                  placeholder="Digite o score"
                  className="text-center font-mono text-lg"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Ajuste com Slider ({score} pontos)</Label>
                <div className="pt-2">
                  <Slider
                    value={[score]}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={(val) => onScoreChange(val[0])}
                    className="w-full"
                    disabled={isLoading}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>500</span>
                    <span>1000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações da API Externa */}
            {cpf && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={saveScoreToApi}
                  disabled={isLoading || !isValidScore(score)}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Salvar na API
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoCalculate}
                  disabled={isAutoCalculating}
                >
                  {isAutoCalculating ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Calculator className="h-4 w-4 mr-2" />
                  )}
                  Calcular Auto
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadScoreHistory}
                  disabled={isLoading}
                >
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadExternalScore}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar
                </Button>
              </div>
            )}

            {/* Histórico de Scores */}
            {showHistory && scoreHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Histórico de Scores</h4>
                <div className="bg-muted/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {scoreHistory.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                      <div>
                        <span className="font-medium">{entry.score} pts</span>
                        {entry.reason && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({entry.reason})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                >
                  Ocultar histórico
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card Informativo dos Níveis - Compacto */}
      <div className="lg:col-span-1">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Níveis de Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 4 Cards em linha - Desktop, 2x2 - Mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
              {/* Excelente */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <Award className="h-4 w-4 text-green-600 dark:text-green-400 mb-1" />
                <span className="text-xs font-medium text-green-800 dark:text-green-200">Excelente</span>
                <span className="text-xs font-mono text-green-700 dark:text-green-300">800-1000</span>
              </div>

              {/* Bom */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">Bom</span>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300">600-799</span>
              </div>

              {/* Regular */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mb-1" />
                <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Regular</span>
                <span className="text-xs font-mono text-yellow-700 dark:text-yellow-300">400-599</span>
              </div>

              {/* Baixo */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mb-1" />
                <span className="text-xs font-medium text-red-800 dark:text-red-200">Baixo</span>
                <span className="text-xs font-mono text-red-700 dark:text-red-300">0-399</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScoreCard;