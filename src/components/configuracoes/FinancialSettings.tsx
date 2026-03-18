
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Gift, Users } from 'lucide-react';
import { toast } from "sonner";

interface FinancialConfig {
  welcomeBonus: number;
  referralBonus: number;
  minimumWithdraw: number;
}

const FinancialSettings = () => {
  const [config, setConfig] = useState<FinancialConfig>({
    welcomeBonus: 0,
    referralBonus: 0,
    minimumWithdraw: 10
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFinancialConfig();
  }, []);

  const loadFinancialConfig = () => {
    try {
      const savedConfig = localStorage.getItem('financial_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações financeiras:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('financial_config', JSON.stringify(config));
      toast.success('Configurações financeiras salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações financeiras');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FinancialConfig, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setConfig(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Configurações Financeiras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="welcomeBonus" className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-green-600" />
              Bônus de Boas-vindas (R$)
            </Label>
            <Input
              id="welcomeBonus"
              type="number"
              min="0"
              step="0.01"
              value={config.welcomeBonus}
              onChange={(e) => handleInputChange('welcomeBonus', e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              Valor do bônus concedido na ativação da conta (0 = desabilitado)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralBonus" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Bônus de Indicação (R$)
            </Label>
            <Input
              id="referralBonus"
              type="number"
              min="0"
              step="0.01"
              value={config.referralBonus}
              onChange={(e) => handleInputChange('referralBonus', e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              Valor do bônus concedido para indicação de novos usuários
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="minimumWithdraw" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-purple-600" />
            Valor Mínimo para Saque (R$)
          </Label>
          <Input
            id="minimumWithdraw"
            type="number"
            min="0"
            step="0.01"
            value={config.minimumWithdraw}
            onChange={(e) => handleInputChange('minimumWithdraw', e.target.value)}
            placeholder="10.00"
          />
          <p className="text-xs text-muted-foreground">
            Valor mínimo necessário para realizar saques
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSettings;
