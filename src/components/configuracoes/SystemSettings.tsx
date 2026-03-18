import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, Settings, RefreshCw, AlertTriangle } from 'lucide-react';
import { systemConfigAdminService, SystemConfigItem } from '@/services/systemConfigAdminService';

type ConfigType = 'string' | 'number' | 'boolean' | 'json';

type SystemField = {
  key: string;
  label: string;
  description: string;
  type: ConfigType;
};

const SYSTEM_FIELDS: SystemField[] = [
  { key: 'site_name', label: 'Nome do Site', description: 'Nome exibido no cabeçalho e páginas públicas.', type: 'string' },
  { key: 'site_description', label: 'Descrição do Site', description: 'Descrição institucional do APIPainel.', type: 'string' },
  { key: 'maintenance_mode', label: 'Modo de Manutenção', description: 'Bloqueia acesso para usuários comuns.', type: 'boolean' },
  { key: 'registration_enabled', label: 'Cadastro de Novos Usuários', description: 'Permitir ou bloquear novos registros.', type: 'boolean' },
  { key: 'default_user_balance', label: 'Saldo Inicial Padrão', description: 'Saldo inicial para contas novas.', type: 'number' },
  { key: 'referral_bonus_amount', label: 'Bônus de Indicação', description: 'Valor pago por indicação válida.', type: 'number' },
  { key: 'max_login_attempts', label: 'Tentativas de Login', description: 'Número máximo de tentativas antes de bloqueio.', type: 'number' },
  { key: 'session_timeout', label: 'Timeout de Sessão (segundos)', description: 'Tempo máximo da sessão autenticada.', type: 'number' },
  { key: 'referral_system_enabled', label: 'Sistema de Indicação Ativo', description: 'Liga/desliga todo o sistema de indicação.', type: 'boolean' },
  { key: 'referral_bonus_enabled', label: 'Bônus de Indicação Ativo', description: 'Controla somente o bônus de indicação.', type: 'boolean' },
  { key: 'referral_commission_enabled', label: 'Comissão de Rede Ativa', description: 'Controla a comissão sobre recargas.', type: 'boolean' },
  { key: 'referral_commission_percentage', label: 'Comissão de Rede (%)', description: 'Percentual da comissão da rede.', type: 'number' },
];

const parseBoolean = (value: unknown) => {
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
};

const toInputValue = (item: SystemConfigItem | undefined, type: ConfigType): string | boolean => {
  if (!item) {
    return type === 'boolean' ? false : '';
  }

  if (type === 'boolean') {
    return parseBoolean(item.config_value);
  }

  return String(item.config_value ?? '');
};

const SystemSettings = () => {
  const [allConfigs, setAllConfigs] = useState<SystemConfigItem[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      const data = await systemConfigAdminService.getAllConfigs();
      setAllConfigs(data);

      const map = new Map(data.map((item) => [item.config_key, item]));
      const nextValues: Record<string, string | boolean> = {};

      SYSTEM_FIELDS.forEach((field) => {
        nextValues[field.key] = toInputValue(map.get(field.key), field.type);
      });

      setFormValues(nextValues);
    } catch (error) {
      console.error('Erro ao carregar system_config:', error);
      toast.error('Não foi possível carregar as configurações do sistema.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadConfigs();
  }, []);

  const missingKeys = useMemo(() => {
    const existing = new Set(allConfigs.map((item) => item.config_key));
    return SYSTEM_FIELDS.filter((field) => !existing.has(field.key));
  }, [allConfigs]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await Promise.all(
        SYSTEM_FIELDS.map((field) =>
          systemConfigAdminService.updateConfig(
            field.key,
            String(formValues[field.key] ?? ''),
            field.type
          )
        )
      );

      toast.success('Configurações da aba Sistema salvas com sucesso.');
      await loadConfigs();
    } catch (error) {
      console.error('Erro ao salvar system_config:', error);
      toast.error('Erro ao salvar configurações do sistema.');
    } finally {
      setIsSaving(false);
    }
  };

  const setText = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const setToggle = (key: string, value: boolean) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Carregando configurações do sistema...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Aba Sistema (dados da tabela system_config)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta aba está conectada ao backend usando a conexão já aberta via <strong>conexao.php</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Tabela: system_config</Badge>
            <Badge variant="outline">Campos monitorados: {SYSTEM_FIELDS.length}</Badge>
          </div>

          {missingKeys.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                Chaves ausentes na tabela
              </div>
              <p className="text-sm text-muted-foreground">
                Para funcionar completamente, adicione estas chaves em <code>system_config</code>:
              </p>
              <p className="text-sm font-mono break-words">
                {missingKeys.map((item) => item.key).join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações editáveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {SYSTEM_FIELDS.map((field) => {
            const currentValue = formValues[field.key];
            const isBoolean = field.type === 'boolean';

            return (
              <div key={field.key} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  </div>

                  {isBoolean ? (
                    <Switch
                      id={field.key}
                      checked={Boolean(currentValue)}
                      onCheckedChange={(checked) => setToggle(field.key, checked)}
                    />
                  ) : (
                    <Input
                      id={field.key}
                      type={field.type === 'number' ? 'number' : 'text'}
                      step={field.type === 'number' ? '0.01' : undefined}
                      value={String(currentValue ?? '')}
                      onChange={(e) => setText(field.key, e.target.value)}
                      className="max-w-md"
                    />
                  )}
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
