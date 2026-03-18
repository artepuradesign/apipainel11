import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Crown, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest, fetchApiConfig } from '@/config/api';
import { cookieUtils } from '@/utils/cookieUtils';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumPanelsSectionProps {
  onToggle?: (enabled: boolean) => void;
}

const PremiumPanelsSection: React.FC<PremiumPanelsSectionProps> = ({ onToggle }) => {
  const { refreshUser, user } = useAuth();
  const [premiumEnabled, setPremiumEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = () => {
    const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token') || localStorage.getItem('session_token') || localStorage.getItem('api_session_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  useEffect(() => {
    // Inicializar com o valor do user do contexto se disponível
    if (user && typeof (user as any).premium_enabled !== 'undefined') {
      setPremiumEnabled(!!(user as any).premium_enabled);
      setLoading(false);
      return;
    }
    const loadPremiumStatus = async () => {
      try {
        await fetchApiConfig();
        const data = await apiRequest<any>('/user/premium-status', {
          headers: getAuthHeaders(),
        });
        if (data.success && data.data) {
          setPremiumEnabled(data.data.premium_enabled || false);
        }
      } catch (error) {
        console.error('Erro ao carregar status premium:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPremiumStatus();
  }, [user]);

  const handleToggle = async (checked: boolean) => {
    setSaving(true);
    try {
      await fetchApiConfig();
      const data = await apiRequest<any>('/user/premium-status', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ premium_enabled: checked }),
      });

      if (data.success) {
        setPremiumEnabled(checked);
        onToggle?.(checked);
        toast.success(checked ? 'Painéis Premium desbloqueados!' : 'Painéis Premium bloqueados');
        // Atualizar o cookie auth_user para refletir o novo status premium
        const savedUser = cookieUtils.get('auth_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          parsedUser.premium_enabled = checked ? 1 : 0;
          cookieUtils.set('auth_user', JSON.stringify(parsedUser), 0.0208);
        }
        // Atualizar o contexto de autenticação
        await refreshUser();
      } else {
        throw new Error(data.message || 'Erro ao atualizar');
      }
    } catch (error) {
      console.error('Erro ao atualizar status premium:', error);
      toast.error('Erro ao atualizar configuração premium');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Desbloquear Painéis Premium
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {premiumEnabled ? (
              <Unlock className="h-5 w-5 text-primary" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <Label className="text-sm font-medium">
                {premiumEnabled ? 'Painéis Premium Ativados' : 'Painéis Premium Desativados'}
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {premiumEnabled
                  ? 'Você tem acesso aos painéis premium disponíveis'
                  : 'Ative para desbloquear o acesso aos painéis premium'}
              </p>
            </div>
          </div>
          <Switch
            checked={premiumEnabled}
            onCheckedChange={handleToggle}
            disabled={loading || saving}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumPanelsSection;
