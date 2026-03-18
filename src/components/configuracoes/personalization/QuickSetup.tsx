
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, CheckCircle, Layers } from 'lucide-react';
import { loadCustomPlans, loadSystemPanels } from '@/utils/personalizationStorage';

const QuickSetup = () => {
  const existingPlans = loadCustomPlans();
  const existingPanels = loadSystemPanels();
  
  console.log('QuickSetup - Planos carregados:', existingPlans.length);
  console.log('QuickSetup - Painéis carregados:', existingPanels.length);
  
  const hasPlans = existingPlans.length > 0;
  const hasPanels = existingPanels.length > 0;

  return (
    <div className="space-y-4">
      {/* Status dos Planos */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Crown className="h-5 w-5" />
            Status dos Planos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPlans ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Planos já configurados ({existingPlans.length})</span>
            </div>
          ) : (
            <div className="text-gray-700 dark:text-gray-300">
              <p>Nenhum plano configurado ainda.</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Use o botão "Novo Plano" para criar seus planos personalizados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status dos Painéis */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Layers className="h-5 w-5" />
            Status dos Painéis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPanels ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Painéis já configurados ({existingPanels.length})</span>
            </div>
          ) : (
            <div className="text-gray-700 dark:text-gray-300">
              <p>Nenhum painel configurado ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickSetup;
