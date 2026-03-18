import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Gift, TrendingUp, AlertTriangle, Settings, BarChart3, X, RotateCcw, Percent } from 'lucide-react';
import { getSystemReferralStats, resetReferralSystem } from '@/utils/referralSystem';
import { useReferralConfig } from '@/hooks/useReferralConfig';

const ReferralSystemManagement = () => {
  const { config } = useReferralConfig();
  const [stats, setStats] = useState(getSystemReferralStats());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getSystemReferralStats());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleResetSystem = () => {
    if (confirm('Tem certeza que deseja resetar todo o sistema de indicações? Esta ação não pode ser desfeita.')) {
      resetReferralSystem();
      setStats(getSystemReferralStats());
      toast.success("Sistema de indicações resetado com sucesso!");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="bg-white/75 dark:bg-gray-800/75 border-gray-200/75 dark:border-gray-700/75 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Sistema de Indicações - Configuração Simplificada
          </CardTitle>
          <Button 
            onClick={handleResetSystem}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar Sistema
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Indicações</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReferrals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Gift className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Indicações Válidas</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedReferrals}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {stats.conversionRate}% conversão
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingReferrals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bônus Total Pago</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalBonusPaid)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Sistema Atual (Controlado pela API)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Bônus de Cadastro</span>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(config.referral_bonus_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Vai para</span>
                      <Badge variant="outline">Saldo do Plano Pré-pago</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Comissão de Recarga</span>
                      <span className="text-lg font-bold text-blue-600">{config.referral_commission_percentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Comissão vai para</span>
                      <Badge variant="outline">Carteira Digital</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Informações Importantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                      <h5 className="font-semibold text-green-800 dark:text-green-200">Bônus de Cadastro:</h5>
                      <p className="text-green-700 dark:text-green-300">
                        R$ {config.referral_bonus_amount.toFixed(2)} para cada usuário (indicador + indicado) direto no saldo do plano.
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200">Comissão de Recarga:</h5>
                      <p className="text-blue-700 dark:text-blue-300">
                        {config.referral_commission_percentage}% de cada recarga do indicado vai para a carteira digital do indicador.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Configurações do Sistema (Somente Leitura)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Sistema de Indicações Ativo</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Controlado pela API externa
                    </p>
                  </div>
                  <Switch
                    checked={config.referral_system_enabled}
                    onCheckedChange={() => {}}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valor do Bônus de Cadastro (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={config.referral_bonus_amount}
                    onChange={() => {}}
                    disabled
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Valor controlado pela API externa. Para alterar, use o painel administrativo.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Percentual de Comissão sobre Recargas (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={config.referral_commission_percentage}
                    onChange={() => {}}
                    disabled
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Percentual controlado pela API externa. Para alterar, use o painel administrativo.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Exigir Ativação com CPF</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sempre habilitado por motivos de segurança
                    </p>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                    disabled
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Prevenir Dispositivos Duplicados</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Desabilitado para facilitar cadastros
                    </p>
                  </div>
                  <Switch
                    checked={false}
                    onCheckedChange={() => {}}
                    disabled
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Como funciona o sistema simplificado:</h5>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Valores controlados pela API externa através do painel administrativo.
                  </p>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 mt-2">
                    <li>• <strong>Cadastro:</strong> Ambos ganham R$ {config.referral_bonus_amount.toFixed(2)} no saldo do plano pré-pago</li>
                    <li>• <strong>Recargas:</strong> {config.referral_commission_percentage}% de cada recarga vai para carteira digital do indicador</li>
                    <li>• <strong>Proteção:</strong> Anti-fraude por dispositivo ativo</li>
                    <li>• <strong>Saque:</strong> Bônus de cadastro não pode ser sacado (fica no plano)</li>
                    <li>• <strong>Comissões:</strong> Podem ser sacadas da carteira digital</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReferralSystemManagement;