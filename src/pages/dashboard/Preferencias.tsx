import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Settings, Palette, Shield, Trash2, Eye, Save, Check } from 'lucide-react';
import { useSiteTheme, SiteThemeId } from '@/contexts/SiteThemeContext';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useLocale, type Locale } from '@/contexts/LocaleContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const textByLocale: Record<Locale, any> = {
  'pt-BR': {
    pageTitle: 'Preferências',
    previewInfo: 'Tema aplicado como pré-visualização. Clique em "Salvar" para manter.',
    previewCanceled: 'Pré-visualização cancelada.',
    themeSaved: 'Tema salvo com sucesso!',
    prefUpdated: 'Preferência atualizada!',
    deleted: 'Todas as consultas foram apagadas com sucesso!',
    previewing: 'Você está pré-visualizando o tema',
    cancel: 'Cancelar',
    saveTheme: 'Salvar Tema',
    themeSystem: 'Tema do Sistema',
    themeDescription: 'Selecione um tema visual para personalizar a aparência do sistema. Clique em "Aplicar" para pré-visualizar ou "Salvar" para aplicar definitivamente.',
    active: 'Ativo',
    applyPreview: 'Aplicar (Pré-visualizar)',
    accountPrefs: 'Preferências da Conta',
    accountPrefsDesc: 'Configure como o sistema gerencia seus dados e notificações.',
    saveHistory: 'Salvar histórico de consultas',
    saveHistoryDesc: 'Manter registro de todas as consultas realizadas',
    emailNotifications: 'Notificações por e-mail',
    emailNotificationsDesc: 'Receber alertas e atualizações por e-mail',
    pushNotifications: 'Notificações push',
    pushNotificationsDesc: 'Receber notificações no navegador',
    marketingEmails: 'E-mails de marketing',
    marketingEmailsDesc: 'Receber promoções e novidades por e-mail',
    dangerZone: 'Zona de Perigo',
    dangerZoneDesc: 'Ações irreversíveis que afetam seus dados.',
    deleteConsultations: 'Apagar todas as minhas consultas',
    deleteConsultationsDesc: 'Remove permanentemente todo o histórico de consultas da sua conta.',
    deleteAll: 'Apagar Tudo',
    sure: 'Tem certeza?',
    sureDesc: 'Esta ação é irreversível. Todo o histórico de consultas será permanentemente removido da sua conta.',
    yesDelete: 'Sim, apagar tudo',
    themeNames: { apipainel: 'APIPainel (Padrão)', matrix: 'Matrix' },
    themeDescriptions: {
      apipainel: 'Tema padrão do sistema com cores verdes e interface limpa.',
      matrix: 'Tema inspirado no filme Matrix com chuva de caracteres animada e tons de verde neon.',
    },
  },
  en: {
    pageTitle: 'Preferences',
    previewInfo: 'Theme applied in preview mode. Click "Save" to keep it.',
    previewCanceled: 'Preview canceled.',
    themeSaved: 'Theme saved successfully!',
    prefUpdated: 'Preference updated!',
    deleted: 'All consultations were deleted successfully!',
    previewing: 'You are previewing theme',
    cancel: 'Cancel',
    saveTheme: 'Save Theme',
    themeSystem: 'System Theme',
    themeDescription: 'Select a visual theme to customize the system appearance. Click "Apply" to preview or "Save" to apply permanently.',
    active: 'Active',
    applyPreview: 'Apply (Preview)',
    accountPrefs: 'Account Preferences',
    accountPrefsDesc: 'Configure how the system handles your data and notifications.',
    saveHistory: 'Save consultation history',
    saveHistoryDesc: 'Keep a record of all completed consultations',
    emailNotifications: 'Email notifications',
    emailNotificationsDesc: 'Receive alerts and updates by email',
    pushNotifications: 'Push notifications',
    pushNotificationsDesc: 'Receive browser notifications',
    marketingEmails: 'Marketing emails',
    marketingEmailsDesc: 'Receive promotions and updates by email',
    dangerZone: 'Danger Zone',
    dangerZoneDesc: 'Irreversible actions that affect your data.',
    deleteConsultations: 'Delete all my consultations',
    deleteConsultationsDesc: 'Permanently removes your full consultation history.',
    deleteAll: 'Delete All',
    sure: 'Are you sure?',
    sureDesc: 'This action is irreversible. Your entire consultation history will be permanently removed.',
    yesDelete: 'Yes, delete everything',
    themeNames: { apipainel: 'APIPainel (Default)', matrix: 'Matrix' },
    themeDescriptions: {
      apipainel: 'Default system theme with green accents and a clean interface.',
      matrix: 'Matrix-inspired theme with animated character rain and neon green tones.',
    },
  },
  es: {
    pageTitle: 'Preferencias',
    previewInfo: 'Tema aplicado en vista previa. Haz clic en "Guardar" para mantenerlo.',
    previewCanceled: 'Vista previa cancelada.',
    themeSaved: '¡Tema guardado con éxito!',
    prefUpdated: '¡Preferencia actualizada!',
    deleted: '¡Todas las consultas fueron eliminadas con éxito!',
    previewing: 'Estás previsualizando el tema',
    cancel: 'Cancelar',
    saveTheme: 'Guardar tema',
    themeSystem: 'Tema del sistema',
    themeDescription: 'Selecciona un tema visual para personalizar la apariencia del sistema. Haz clic en "Aplicar" para previsualizar o en "Guardar" para aplicar definitivamente.',
    active: 'Activo',
    applyPreview: 'Aplicar (Vista previa)',
    accountPrefs: 'Preferencias de la cuenta',
    accountPrefsDesc: 'Configura cómo el sistema gestiona tus datos y notificaciones.',
    saveHistory: 'Guardar historial de consultas',
    saveHistoryDesc: 'Mantener registro de todas las consultas realizadas',
    emailNotifications: 'Notificaciones por correo',
    emailNotificationsDesc: 'Recibir alertas y actualizaciones por correo',
    pushNotifications: 'Notificaciones push',
    pushNotificationsDesc: 'Recibir notificaciones en el navegador',
    marketingEmails: 'Correos de marketing',
    marketingEmailsDesc: 'Recibir promociones y novedades por correo',
    dangerZone: 'Zona de peligro',
    dangerZoneDesc: 'Acciones irreversibles que afectan tus datos.',
    deleteConsultations: 'Eliminar todas mis consultas',
    deleteConsultationsDesc: 'Elimina permanentemente todo el historial de consultas de tu cuenta.',
    deleteAll: 'Eliminar todo',
    sure: '¿Estás seguro?',
    sureDesc: 'Esta acción es irreversible. Todo tu historial de consultas será eliminado permanentemente.',
    yesDelete: 'Sí, eliminar todo',
    themeNames: { apipainel: 'APIPainel (Predeterminado)', matrix: 'Matrix' },
    themeDescriptions: {
      apipainel: 'Tema predeterminado del sistema con colores verdes e interfaz limpia.',
      matrix: 'Tema inspirado en Matrix con lluvia de caracteres animada y tonos verde neón.',
    },
  },
};

const Preferencias = () => {
  const { activeTheme, previewTheme, applyTheme, saveTheme, cancelPreview, currentVisualTheme } = useSiteTheme();
  const { locale } = useLocale();
  const t = textByLocale[locale];

  const themes = [
    {
      id: 'apipainel' as SiteThemeId,
      name: t.themeNames.apipainel,
      description: t.themeDescriptions.apipainel,
      preview: 'bg-gradient-to-br from-green-50 via-white to-emerald-50 border-green-300',
    },
    {
      id: 'matrix' as SiteThemeId,
      name: t.themeNames.matrix,
      description: t.themeDescriptions.matrix,
      preview: 'bg-gradient-to-br from-black via-green-950 to-black border-green-500',
    },
  ];

  const [selectedTheme, setSelectedTheme] = useState<SiteThemeId>(activeTheme);

  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('user_preferences');
    return saved ? JSON.parse(saved) : {
      salvar_historico: true,
      notificacoes_email: true,
      notificacoes_push: true,
      marketing_emails: false,
    };
  });

  const handleApplyPreview = () => {
    applyTheme(selectedTheme);
    toast.info(t.previewInfo);
  };

  const handleSaveTheme = () => {
    saveTheme(selectedTheme);
    toast.success(t.themeSaved);
  };

  const handleCancelPreview = () => {
    cancelPreview();
    setSelectedTheme(activeTheme);
    toast.info(t.previewCanceled);
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('user_preferences', JSON.stringify(updated));
    toast.success(t.prefUpdated);
  };

  const handleDeleteAllConsultas = () => {
    toast.success(t.deleted);
  };

  const isPreviewActive = previewTheme !== null;

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      <DashboardTitleCard
        title={t.pageTitle}
        icon={<Settings className="h-4 w-4 sm:h-5 sm:w-5" />}
      />

      {isPreviewActive && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t.previewing} <strong>{themes.find((theme) => theme.id === previewTheme)?.name}</strong>
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCancelPreview}>{t.cancel}</Button>
              <Button size="sm" onClick={handleSaveTheme}>
                <Save className="h-3 w-3 mr-1" />
                {t.saveTheme}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t.themeSystem}
          </CardTitle>
          <CardDescription>{t.themeDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  selectedTheme === theme.id
                    ? 'border-primary ring-2 ring-primary/30 shadow-md'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {activeTheme === theme.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {t.active}
                  </div>
                )}

                <div className={`h-24 rounded-lg mb-3 ${theme.preview} border relative overflow-hidden`} />
                <h3 className="font-semibold text-sm">{theme.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={handleApplyPreview} disabled={selectedTheme === currentVisualTheme}>
              <Eye className="h-4 w-4 mr-2" />
              {t.applyPreview}
            </Button>
            <Button onClick={handleSaveTheme} disabled={selectedTheme === activeTheme && !isPreviewActive}>
              <Save className="h-4 w-4 mr-2" />
              {t.saveTheme}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t.accountPrefs}
          </CardTitle>
          <CardDescription>{t.accountPrefsDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t.saveHistory}</Label>
              <p className="text-xs text-muted-foreground">{t.saveHistoryDesc}</p>
            </div>
            <Switch checked={preferences.salvar_historico} onCheckedChange={(v) => handlePreferenceChange('salvar_historico', v)} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t.emailNotifications}</Label>
              <p className="text-xs text-muted-foreground">{t.emailNotificationsDesc}</p>
            </div>
            <Switch checked={preferences.notificacoes_email} onCheckedChange={(v) => handlePreferenceChange('notificacoes_email', v)} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t.pushNotifications}</Label>
              <p className="text-xs text-muted-foreground">{t.pushNotificationsDesc}</p>
            </div>
            <Switch checked={preferences.notificacoes_push} onCheckedChange={(v) => handlePreferenceChange('notificacoes_push', v)} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t.marketingEmails}</Label>
              <p className="text-xs text-muted-foreground">{t.marketingEmailsDesc}</p>
            </div>
            <Switch checked={preferences.marketing_emails} onCheckedChange={(v) => handlePreferenceChange('marketing_emails', v)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t.dangerZone}
          </CardTitle>
          <CardDescription>{t.dangerZoneDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{t.deleteConsultations}</p>
              <p className="text-xs text-muted-foreground">{t.deleteConsultationsDesc}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t.deleteAll}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.sure}</AlertDialogTitle>
                  <AlertDialogDescription>{t.sureDesc}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllConsultas} className="bg-destructive hover:bg-destructive/90">
                    {t.yesDelete}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Preferencias;
