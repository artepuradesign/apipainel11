
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PremiumPlanPromo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Crown className="w-5 h-5 mr-2 text-purple-600" />
          Assinar Plano Premium
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-3">
          <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border">
            <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">
              Economize até 60%
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Com nossos planos, você tem consultas ilimitadas e descontos exclusivos
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                <div className="font-semibold text-green-700 dark:text-green-300">Rei de Espadas</div>
                <div className="text-green-600 dark:text-green-400">60% de desconto</div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                <div className="font-semibold text-blue-700 dark:text-blue-300">Rei de Copas</div>
                <div className="text-blue-600 dark:text-blue-400">40% de desconto</div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/planos-publicos')}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
          >
            Ver Planos Disponíveis
          </Button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ✨ Acesso ilimitado • Suporte prioritário • API dedicada
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumPlanPromo;
