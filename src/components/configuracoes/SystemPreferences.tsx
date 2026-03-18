
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Bell, Eye, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  darkMode: boolean;
  compactView: boolean;
  showBalance: boolean;
  autoLogout: boolean;
  twoFactorAuth: boolean;
}

const SystemPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
    darkMode: false,
    compactView: false,
    showBalance: true,
    autoLogout: true,
    twoFactorAuth: false
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = () => {
    if (user?.id) {
      const savedPrefs = localStorage.getItem(`user_preferences_${user.id}`);
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch (error) {
          console.error('Erro ao carregar preferências:', error);
        }
      }
    }
  };

  const handlePreferenceChange = async (key: keyof UserPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    if (user?.id) {
      try {
        localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(newPreferences));
        toast.success('Preferência atualizada!');
      } catch (error) {
        console.error('Erro ao salvar preferência:', error);
        toast.error('Erro ao salvar preferência');
      }
    }
  };

  const saveAllPreferences = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(preferences));
        toast.success('Todas as preferências foram salvas!');
      }
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast.error('Erro ao salvar preferências');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Preferências do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notificações */}
        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Not​ificações por E-mail</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receber notificações importantes por e-mail</p>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Notificações Push</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receber notificações no navegador</p>
              </div>
              <Switch
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Notificações SMS</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receber SMS para transações importantes</p>
              </div>
              <Switch
                checked={preferences.smsNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('smsNotifications', checked)}
              />
            </div>
          </div>
        </div>

        {/* Marketing */}
        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Marketing
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">E-mails de Marketing</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receber ofertas e novidades</p>
              </div>
              <Switch
                checked={preferences.marketingEmails}
                onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
              />
            </div>
          </div>
        </div>

        {/* Interface */}
        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Interface
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Visualização Compacta</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Usar interface mais compacta</p>
              </div>
              <Switch
                checked={preferences.compactView}
                onCheckedChange={(checked) => handlePreferenceChange('compactView', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Mostrar Saldo</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Exibir saldo na interface</p>
              </div>
              <Switch
                checked={preferences.showBalance}
                onCheckedChange={(checked) => handlePreferenceChange('showBalance', checked)}
              />
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Alertas de Segurança</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notificar sobre atividades suspeitas</p>
              </div>
              <Switch
                checked={preferences.securityAlerts}
                onCheckedChange={(checked) => handlePreferenceChange('securityAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Logout Automático</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Desconectar após inatividade</p>
              </div>
              <Switch
                checked={preferences.autoLogout}
                onCheckedChange={(checked) => handlePreferenceChange('autoLogout', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemPreferences;
