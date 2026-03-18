import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Settings, Save, Loader2, Globe, MessageCircle, Shield, DollarSign, Users, RefreshCw, Instagram, Send, Music, Phone } from 'lucide-react';
import { systemConfigAdminService, SystemConfigItem } from '@/services/systemConfigAdminService';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  general: { label: 'Geral', icon: <Globe className="h-4 w-4" /> },
  contacts: { label: 'Contatos', icon: <MessageCircle className="h-4 w-4" /> },
  social: { label: 'Redes Sociais', icon: <MessageCircle className="h-4 w-4" /> },
  system: { label: 'Sistema', icon: <Settings className="h-4 w-4" /> },
  security: { label: 'Segurança', icon: <Shield className="h-4 w-4" /> },
  financial: { label: 'Financeiro', icon: <DollarSign className="h-4 w-4" /> },
  referral: { label: 'Indicações', icon: <Users className="h-4 w-4" /> },
};

// Icons for specific config keys
const getFieldIcon = (key: string): React.ReactNode | null => {
  if (key.includes('instagram')) return <Instagram className="h-4 w-4 text-pink-500" />;
  if (key.includes('telegram')) return <Send className="h-4 w-4 text-blue-500" />;
  if (key.includes('tiktok')) return <Music className="h-4 w-4 text-foreground" />;
  if (key.includes('whatsapp')) return <Phone className="h-4 w-4 text-green-500" />;
  return null;
};

// Check if field should use textarea
const isMultilineField = (key: string): boolean => {
  return key.includes('whatsapp_message') || key.includes('default_message');
};

const textByLocale: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    title: 'Predefinições do Sistema',
    errorSubtitle: 'Erro ao carregar dados',
    subtitle: 'Gerencie as configurações globais da plataforma',
    reload: 'Recarregar',
    loading: 'Carregando...',
    tryAgain: 'Tentar novamente',
    saveAll: 'Salvar Todas as Alterações',
  },
  en: {
    title: 'System Presets',
    errorSubtitle: 'Error loading data',
    subtitle: 'Manage global platform settings',
    reload: 'Reload',
    loading: 'Loading...',
    tryAgain: 'Try again',
    saveAll: 'Save All Changes',
  },
  es: {
    title: 'Predefiniciones del Sistema',
    errorSubtitle: 'Error al cargar datos',
    subtitle: 'Administra las configuraciones globales de la plataforma',
    reload: 'Recargar',
    loading: 'Cargando...',
    tryAgain: 'Intentar nuevamente',
    saveAll: 'Guardar Todos los Cambios',
  },
};

const Predefinicoes = () => {
  const { locale } = useLocale();
  const t = textByLocale[locale];
  const [configs, setConfigs] = useState<SystemConfigItem[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await systemConfigAdminService.getAllConfigs();
      setConfigs(data);
      const initial: Record<string, string> = {};
      data.forEach((c) => {
        initial[c.config_key] = String(c.config_value);
      });
      setEditedValues(initial);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar configurações');
      toast.error(err.message || 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSave = async (key: string, type: string) => {
    setSaving(key);
    try {
      await systemConfigAdminService.updateConfig(key, editedValues[key], type);
      toast.success(`"${key}" salva!`);
      setConfigs((prev) =>
        prev.map((c) =>
          c.config_key === key ? { ...c, config_value: editedValues[key] } : c
        )
      );
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(null);
    }
  };

  const handleToggle = async (key: string, checked: boolean, type: string) => {
    const newVal = checked ? 'true' : 'false';
    setEditedValues((prev) => ({ ...prev, [key]: newVal }));
    setSaving(key);
    try {
      await systemConfigAdminService.updateConfig(key, newVal, type);
      toast.success(`"${key}" ${checked ? 'ativado' : 'desativado'}!`);
      setConfigs((prev) =>
        prev.map((c) => c.config_key === key ? { ...c, config_value: newVal } : c)
      );
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveAll = async () => {
    const changed = configs.filter(
      (c) => String(c.config_value) !== editedValues[c.config_key]
    );
    if (changed.length === 0) {
      toast.info('Nenhuma alteração para salvar');
      return;
    }
    setSaving('all');
    try {
      for (const c of changed) {
        await systemConfigAdminService.updateConfig(c.config_key, editedValues[c.config_key], c.config_type);
      }
      toast.success(`${changed.length} configuração(ões) salva(s)!`);
      fetchConfigs();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(null);
    }
  };

  const isChanged = (key: string) => {
    const original = configs.find((c) => c.config_key === key);
    return original && String(original.config_value) !== editedValues[key];
  };

  const groupedConfigs = configs.reduce<Record<string, SystemConfigItem[]>>((acc, config) => {
    const cat = config.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(config);
    return acc;
  }, {});

  const findEnabledToggle = (key: string, categoryConfigs: SystemConfigItem[]): SystemConfigItem | undefined => {
    return categoryConfigs.find(c => c.config_key === `${key}_enabled` && c.config_type === 'boolean');
  };

  const isLinkedEnabled = (key: string, categoryConfigs: SystemConfigItem[]): boolean => {
    if (!key.endsWith('_enabled')) return false;
    const parentKey = key.replace(/_enabled$/, '');
    return categoryConfigs.some(c => c.config_key === parentKey && c.config_type !== 'boolean');
  };

  const renderConfigField = (config: SystemConfigItem, categoryConfigs: SystemConfigItem[]) => {
    const value = editedValues[config.config_key] ?? '';
    const changed = isChanged(config.config_key);

    if (isLinkedEnabled(config.config_key, categoryConfigs)) {
      return null;
    }

    const fieldIcon = getFieldIcon(config.config_key);

    // Standalone boolean
    if (config.config_type === 'boolean') {
      return (
        <div
          key={config.config_key}
          className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0"
        >
          <div className="min-w-0 flex-1 flex items-center gap-2">
            {fieldIcon}
            <p className="text-sm font-medium truncate">{config.description || config.config_key}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {saving === config.config_key && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            <Switch
              checked={value === 'true' || value === '1'}
              onCheckedChange={(checked) => handleToggle(config.config_key, checked, config.config_type)}
              disabled={saving === config.config_key}
            />
          </div>
        </div>
      );
    }

    // Text/number field
    const enabledToggle = findEnabledToggle(config.config_key, categoryConfigs);
    const toggleValue = enabledToggle ? (editedValues[enabledToggle.config_key] ?? '') : null;
    const isEnabled = toggleValue === 'true' || toggleValue === '1';
    const multiline = isMultilineField(config.config_key);

    return (
      <div key={config.config_key} className="py-3 border-b border-border last:border-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{config.description || config.config_key}</p>
          {changed && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-primary shrink-0"
              onClick={() => handleSave(config.config_key, config.config_type)}
              disabled={saving === config.config_key}
            >
              {saving === config.config_key ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <><Save className="h-3 w-3 mr-1" /> Salvar</>
              )}
            </Button>
          )}
        </div>
        <div className="flex items-start gap-2">
          {multiline ? (
            <Textarea
              value={value}
              onChange={(e) =>
                setEditedValues((prev) => ({ ...prev, [config.config_key]: e.target.value }))
              }
              rows={2}
              className={`flex-1 text-sm resize-none ${changed ? 'border-primary ring-1 ring-primary/20' : ''}`}
            />
          ) : (
            <Input
              value={value}
              onChange={(e) =>
                setEditedValues((prev) => ({ ...prev, [config.config_key]: e.target.value }))
              }
              type={config.config_type === 'number' ? 'number' : 'text'}
              className={`flex-1 h-9 text-sm ${changed ? 'border-primary ring-1 ring-primary/20' : ''}`}
            />
          )}
          {enabledToggle && (
            <div className="flex items-center gap-1.5 shrink-0 pt-1.5">
              {saving === enabledToggle.config_key && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => handleToggle(enabledToggle.config_key, checked, enabledToggle.config_type)}
                disabled={saving === enabledToggle.config_key}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const categories = Object.keys(groupedConfigs);

  return (
    <div className="space-y-4 relative z-10">
      <DashboardTitleCard
        title={t.title}
        subtitle={error ? t.errorSubtitle : t.subtitle}
        icon={<Settings className="h-4 w-4 sm:h-5 sm:w-5" />}
        right={
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchConfigs}
            disabled={loading}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            title={t.reload}
          >
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        }
      />

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">{t.loading}</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <Card>
          <CardContent className="text-center py-12 space-y-3">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchConfigs}>
              <RefreshCw className="h-4 w-4 mr-2" /> {t.tryAgain}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content - all categories as cards */}
      {!loading && !error && categories.length > 0 && (
        <>
          {categories.map((cat) => {
            const info = CATEGORY_LABELS[cat] || { label: cat, icon: <Settings className="h-4 w-4" /> };
            const catConfigs = groupedConfigs[cat];
            return (
              <Card key={cat}>
                <CardHeader className="px-4 py-3 border-b border-border">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {info.icon}
                    {info.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-1">
                  {catConfigs.map((c) => renderConfigField(c, catConfigs))}
                </CardContent>
              </Card>
            );
          })}

          {/* Save All button at the bottom */}
          <Card>
            <CardContent className="p-4">
              <Button
                className="w-full"
                onClick={handleSaveAll}
                disabled={saving === 'all' || loading}
              >
                {saving === 'all' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t.saveAll}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Predefinicoes;
