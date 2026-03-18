import { getApiUrl } from '@/config/api';

export interface SystemConfigItem {
  config_key: string;
  config_value: any;
  config_type: string;
  category: string;
  description: string;
  is_public: boolean;
}

const LEGACY_SYSTEM_CONFIG_KEYS = [
  'site_name',
  'site_description',
  'maintenance_mode',
  'registration_enabled',
  'default_user_balance',
  'referral_bonus_amount',
  'max_login_attempts',
  'session_timeout',
  'referral_system_enabled',
  'referral_bonus_enabled',
  'referral_commission_enabled',
  'referral_commission_percentage',
];

const getToken = (): string | null => {
  try {
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(c => c.trim().startsWith('session_token='));
    const apiSessionCookie = cookies.find(c => c.trim().startsWith('api_session_token='));
    if (sessionCookie) return sessionCookie.split('=')[1];
    if (apiSessionCookie) return apiSessionCookie.split('=')[1];
  } catch {}
  return null;
};

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const isNotFoundEndpointError = (response: Response, data: any) => {
  const message = String(data?.error || data?.message || '').toLowerCase();
  return response.status === 404 || message.includes('endpoint não encontrado') || message.includes('endpoint nao encontrado');
};

const getTypeByKey = (configKey: string): string => {
  if (['maintenance_mode', 'registration_enabled', 'referral_system_enabled', 'referral_bonus_enabled', 'referral_commission_enabled'].includes(configKey)) {
    return 'boolean';
  }
  if (['default_user_balance', 'referral_bonus_amount', 'max_login_attempts', 'session_timeout', 'referral_commission_percentage'].includes(configKey)) {
    return 'number';
  }
  return 'string';
};

const getLegacyConfigs = async (): Promise<SystemConfigItem[]> => {
  const baseUrl = getApiUrl('');

  const requests = LEGACY_SYSTEM_CONFIG_KEYS.map(async (configKey) => {
    const url = `${baseUrl}/system-config-get.php?key=${encodeURIComponent(configKey)}`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders() });
    const data = await response.json();

    if (!response.ok || !data?.success || !data?.data) {
      return null;
    }

    return {
      config_key: data.data.config_key,
      config_value: data.data.config_value,
      config_type: data.data.config_type || getTypeByKey(data.data.config_key),
      category: 'general',
      description: '',
      is_public: false,
    } as SystemConfigItem;
  });

  const results = await Promise.allSettled(requests);
  return results
    .filter((result): result is PromiseFulfilledResult<SystemConfigItem | null> => result.status === 'fulfilled')
    .map((result) => result.value)
    .filter((item): item is SystemConfigItem => Boolean(item));
};

export const systemConfigAdminService = {
  async getAllConfigs(category?: string): Promise<SystemConfigItem[]> {
    const url = getApiUrl(`/system-config/get${category ? `?category=${category}` : ''}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await response.json();

    if (response.ok && data?.success) {
      return data.data;
    }

    if (isNotFoundEndpointError(response, data)) {
      const legacyData = await getLegacyConfigs();
      if (legacyData.length > 0) return legacyData;
    }

    throw new Error(data?.error || data?.message || 'Erro ao buscar configurações');
  },

  async updateConfig(config_key: string, config_value: string, config_type?: string): Promise<void> {
    const body: any = { config_key, config_value };
    if (config_type) body.config_type = config_type;

    const primaryUrl = getApiUrl('/system-config/update');
    const primaryResponse = await fetch(primaryUrl, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const primaryData = await primaryResponse.json();

    if (primaryResponse.ok && primaryData?.success) {
      return;
    }

    if (isNotFoundEndpointError(primaryResponse, primaryData)) {
      const fallbackUrl = getApiUrl('/system-config-update.php');
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      const fallbackData = await fallbackResponse.json();

      if (fallbackResponse.ok && fallbackData?.success) {
        return;
      }

      throw new Error(fallbackData?.error || fallbackData?.message || 'Erro ao atualizar configuração');
    }

    throw new Error(primaryData?.error || primaryData?.message || 'Erro ao atualizar configuração');
  },
};
