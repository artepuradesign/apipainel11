import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Store, TrendingUp, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { revendaService } from '@/services/revendaService';
import { toast } from 'sonner';

export const RevendaToggle = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRevendaStatus();
  }, [user?.id]);

  const loadRevendaStatus = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const status = await revendaService.getRevendaStatus(user.id);
      setIsActive(status?.is_active || false);
    } catch (error) {
      console.error('Error loading revenda status:', error);
      toast.error('Erro ao carregar status de revenda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      await revendaService.toggleRevendaStatus(user.id, checked);
      setIsActive(checked);
      
      if (checked) {
        toast.success('🎉 Programa de Revenda ativado! Você ganhará 10% de comissão adicional quando seus indicados ativarem planos.');
      } else {
        toast.info('Programa de Revenda desativado. Você continuará recebendo apenas o bônus de cadastro.');
      }
    } catch (error) {
      console.error('Error toggling revenda:', error);
      toast.error('Erro ao atualizar status de revenda');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Store className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Programa de Revenda
                {isActive && (
                  <Badge className="bg-green-500 text-white">
                    Ativo
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                Ganhe 10% de comissão adicional quando seus indicados ativarem planos
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <Label htmlFor="revenda-toggle" className="cursor-pointer">
              <div className="font-semibold text-base">Participar do Programa</div>
              <div className="text-sm text-muted-foreground">
                Ative para ganhar comissões vitalícias
              </div>
            </Label>
          </div>
          <Switch
            id="revenda-toggle"
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>

        {isActive ? (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Programa Ativo!</strong> Você receberá <strong>bônus de cadastro</strong> quando alguém se registrar com seu link + <strong>10% de comissão</strong> quando ativarem um plano.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Programa Inativo.</strong> Você está recebendo apenas o bônus de cadastro. Ative o programa de revenda para ganhar <strong>10% de comissão adicional</strong> quando seus indicados ativarem planos.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">💰</div>
            <div className="text-xs text-muted-foreground mt-1">Bônus Cadastro</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">10%</div>
            <div className="text-xs text-muted-foreground mt-1">Comissão Plano</div>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">♾️</div>
            <div className="text-xs text-muted-foreground mt-1">Recorrente</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
