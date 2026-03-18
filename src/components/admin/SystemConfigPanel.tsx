import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { adminConfigService, GroupedConfigs, SystemConfig, ReferralConfigUpdate } from '@/services/adminConfigService';
import { Loader2, Settings, Shield, DollarSign, Users } from 'lucide-react';

export const SystemConfigPanel: React.FC = () => {
  const [configs, setConfigs] = useState<GroupedConfigs>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await adminConfigService.getAllConfigs();
      setConfigs(data);
    } catch (error) {
      toast.error('Erro ao carregar configurações');
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConfig = async (key: string) => {
    try {
      setUpdating(key);
      await adminConfigService.toggleConfig(key);
      await loadConfigs();
      toast.success('Configuração atualizada');
    } catch (error) {
      toast.error('Erro ao atualizar configuração');
      console.error('Erro ao alternar configuração:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateConfig = async (key: string, value: any, dataType: string) => {
    try {
      setUpdating(key);
      await adminConfigService.updateConfig({
        key,
        value,
        data_type: dataType
      });
      await loadConfigs();
      toast.success('Configuração atualizada');
    } catch (error) {
      toast.error('Erro ao atualizar configuração');
      console.error('Erro ao atualizar configuração:', error);
    } finally {
      setUpdating(null);
    }
  };

  const renderConfigItem = (config: SystemConfig) => {
    const isUpdating = updating === config.key;

    if (config.data_type === 'boolean') {
      return (
        <div key={config.key} className="flex items-center justify-between space-y-0 pb-2">
          <div className="space-y-0.5">
            <Label className="text-base">{config.key.replace(/_/g, ' ')}</Label>
            <div className="text-[0.8rem] text-muted-foreground">
              {config.description}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.value}
              onCheckedChange={() => handleToggleConfig(config.key)}
              disabled={isUpdating}
            />
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>
      );
    }

    if (config.data_type === 'decimal' || config.data_type === 'integer') {
      return (
        <div key={config.key} className="space-y-2">
          <Label className="text-base">{config.key.replace(/_/g, ' ')}</Label>
          <div className="text-[0.8rem] text-muted-foreground mb-2">
            {config.description}
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              step={config.data_type === 'decimal' ? '0.01' : '1'}
              value={config.value}
              onChange={(e) => {
                const value = config.data_type === 'decimal' 
                  ? parseFloat(e.target.value) 
                  : parseInt(e.target.value);
                handleUpdateConfig(config.key, value, config.data_type);
              }}
              disabled={isUpdating}
              className="max-w-xs"
            />
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>
      );
    }

    return (
      <div key={config.key} className="space-y-2">
        <Label className="text-base">{config.key.replace(/_/g, ' ')}</Label>
        <div className="text-[0.8rem] text-muted-foreground mb-2">
          {config.description}
        </div>
        <div className="flex items-center space-x-2">
          <Input
            value={config.value}
            onChange={(e) => handleUpdateConfig(config.key, e.target.value, config.data_type)}
            disabled={isUpdating}
            className="max-w-xs"
          />
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </div>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'referral':
        return <Users className="h-5 w-5" />;
      case 'system':
        return <Settings className="h-5 w-5" />;
      case 'payments':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'referral':
        return 'Sistema de Indicações';
      case 'system':
        return 'Sistema Geral';
      case 'payments':
        return 'Pagamentos';
      case 'notifications':
        return 'Notificações';
      default:
        return 'Configurações Gerais';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações globais da aplicação
          </p>
        </div>
        <Button onClick={loadConfigs} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Recarregar
        </Button>
      </div>

      <Tabs defaultValue={Object.keys(configs)[0]} className="space-y-4">
        <TabsList>
          {Object.keys(configs).map((category) => (
            <TabsTrigger key={category} value={category} className="flex items-center space-x-2">
              {getCategoryIcon(category)}
              <span>{getCategoryTitle(category)}</span>
              <Badge variant="secondary">{configs[category]?.length || 0}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(configs).map(([category, categoryConfigs]) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getCategoryIcon(category)}
                  <span>{getCategoryTitle(category)}</span>
                </CardTitle>
                <CardDescription>
                  Configure as opções relacionadas a {getCategoryTitle(category).toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {categoryConfigs.map((config, index) => (
                  <div key={config.key}>
                    {renderConfigItem(config)}
                    {index < categoryConfigs.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};