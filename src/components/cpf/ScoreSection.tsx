import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { TrendingUp, Heart } from 'lucide-react';
import ScoreCard from '@/components/cpf/ScoreCard';
import ScoreLevelIndicator from '@/components/cpf/ScoreLevelIndicator';
import { BaseCpf } from '@/services/baseCpfService';

interface ScoreSectionProps {
  score: number;
  setScore: (score: number) => void;
  dadosBasicos: Partial<BaseCpf>;
  onInputChange: (field: string, value: string | number) => void;
}

const ScoreSection = ({ score, setScore, dadosBasicos, onInputChange }: ScoreSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Score
          </CardTitle>
          <CardDescription>
            Pontuação e análise de qualidade dos dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna 1: Score Card e Slider */}
            <div className="space-y-4">
              <ScoreCard score={score} onScoreChange={setScore} />
              
              <div className="space-y-2">
                <Label>Ajustar Score: {score}</Label>
                <Slider
                  value={[score]}
                  onValueChange={(value) => setScore(value[0])}
                  max={1000}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Coluna 2: Indicadores de Níveis */}
            <div>
              <ScoreLevelIndicator currentScore={score} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Dados Adicionais
          </CardTitle>
          <CardDescription>
            Informações complementares sobre o cadastro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fonte_dados">Fonte dos Dados</Label>
              <select
                id="fonte_dados"
                value={dadosBasicos.fonte_dados || 'cadastro_manual'}
                onChange={(e) => onInputChange('fonte_dados', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="cadastro_manual">Cadastro Manual</option>
                <option value="importacao_csv">Importação CSV</option>
                <option value="api_externa">API Externa</option>
                <option value="receita_federal">Receita Federal</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualidade_dados">Qualidade dos Dados: {dadosBasicos.qualidade_dados}%</Label>
              <Slider
                value={[Number(dadosBasicos.qualidade_dados) || 50]}
                onValueChange={(value) => onInputChange('qualidade_dados', value[0])}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreSection;