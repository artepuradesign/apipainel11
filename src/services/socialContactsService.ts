import { apiRequest } from '@/config/api';
import { cookieUtils } from '@/utils/cookieUtils';

export interface SocialContacts {
  whatsapp_number: string;
  whatsapp_message: string;
  telegram_username: string;
  instagram_username: string;
  tiktok_username: string;
  whatsapp_enabled: boolean;
  telegram_enabled: boolean;
  instagram_enabled: boolean;
  tiktok_enabled: boolean;
}

const DEFAULTS: SocialContacts = {
  whatsapp_number: '5598991993760',
  whatsapp_message: 'Olá, pode me ajudar? Estou no site apipainel.com.br',
  telegram_username: 'apipainel_bot',
  instagram_username: 'apipainel',
  tiktok_username: 'apipainel',
  whatsapp_enabled: true,
  telegram_enabled: true,
  instagram_enabled: true,
  tiktok_enabled: true,
};

let cachedContacts: SocialContacts | null = null;

const parseBool = (val: unknown, fallback: boolean) => {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    return normalized === 'true' || normalized === '1';
  }
  return fallback;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const socialContactsService = {
  async getContacts(): Promise<SocialContacts> {
    if (cachedContacts) return cachedContacts;

    try {
      // Tentar buscar por categoria (batch) com autenticação
      const response = await apiRequest<any>('/system-config/get?category=contacts', {
        headers: getAuthHeaders(),
      });

      if (response?.success && response?.data) {
        const configs = response.data;
        const configMap: Record<string, string> = {};

        // O endpoint pode retornar array ou objeto
        if (Array.isArray(configs)) {
          configs.forEach((item: any) => {
            if (item.config_key && item.config_value !== undefined) {
              configMap[item.config_key] = item.config_value;
            }
          });
        } else if (typeof configs === 'object') {
          // Pode retornar como objeto direto
          Object.entries(configs).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null && 'config_value' in (value as any)) {
              configMap[key] = (value as any).config_value;
            } else {
              configMap[key] = String(value);
            }
          });
        }

        if (Object.keys(configMap).length > 0) {
          cachedContacts = {
            whatsapp_number: configMap['contact_whatsapp_number'] || DEFAULTS.whatsapp_number,
            whatsapp_message: configMap['contact_whatsapp_message'] || DEFAULTS.whatsapp_message,
            telegram_username: configMap['contact_telegram_username'] || DEFAULTS.telegram_username,
            instagram_username: configMap['contact_instagram_username'] || DEFAULTS.instagram_username,
            tiktok_username: configMap['contact_tiktok_username'] || DEFAULTS.tiktok_username,
            whatsapp_enabled: parseBool(configMap['contact_whatsapp_enabled'], DEFAULTS.whatsapp_enabled),
            telegram_enabled: parseBool(configMap['contact_telegram_enabled'], DEFAULTS.telegram_enabled),
            instagram_enabled: parseBool(configMap['contact_instagram_enabled'], DEFAULTS.instagram_enabled),
            tiktok_enabled: parseBool(configMap['contact_tiktok_enabled'], DEFAULTS.tiktok_enabled),
          };
          console.log('✅ [SOCIAL] Contatos carregados da API (batch):', cachedContacts);
          return cachedContacts;
        }
      }

      // Fallback: buscar chaves individuais
      console.log('⚠️ [SOCIAL] Batch falhou, tentando chaves individuais...');
      return await this.fetchIndividualKeys();
    } catch (error) {
      console.warn('⚠️ [SOCIAL] Erro ao buscar contatos por batch, tentando individual:', error);
      
      try {
        return await this.fetchIndividualKeys();
      } catch {
        console.warn('⚠️ [SOCIAL] Usando defaults');
        cachedContacts = { ...DEFAULTS };
        return cachedContacts;
      }
    }
  },

  async fetchIndividualKeys(): Promise<SocialContacts> {
    const keys = [
      'contact_whatsapp_number',
      'contact_whatsapp_message',
      'contact_telegram_username',
      'contact_instagram_username',
      'contact_tiktok_username',
      'contact_whatsapp_enabled',
      'contact_telegram_enabled',
      'contact_instagram_enabled',
      'contact_tiktok_enabled',
    ];

    const results = await Promise.allSettled(
      keys.map(key => apiRequest<any>(`/system-config/get?key=${key}`, {
        headers: getAuthHeaders(),
      }))
    );

    const configMap: Record<string, unknown> = {};
    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value?.success && result.value?.data) {
        configMap[keys[i]] = result.value.data.config_value;
      }
    });

    cachedContacts = {
      whatsapp_number: String(configMap['contact_whatsapp_number'] ?? DEFAULTS.whatsapp_number),
      whatsapp_message: String(configMap['contact_whatsapp_message'] ?? DEFAULTS.whatsapp_message),
      telegram_username: String(configMap['contact_telegram_username'] ?? DEFAULTS.telegram_username),
      instagram_username: String(configMap['contact_instagram_username'] ?? DEFAULTS.instagram_username),
      tiktok_username: String(configMap['contact_tiktok_username'] ?? DEFAULTS.tiktok_username),
      whatsapp_enabled: parseBool(configMap['contact_whatsapp_enabled'], DEFAULTS.whatsapp_enabled),
      telegram_enabled: parseBool(configMap['contact_telegram_enabled'], DEFAULTS.telegram_enabled),
      instagram_enabled: parseBool(configMap['contact_instagram_enabled'], DEFAULTS.instagram_enabled),
      tiktok_enabled: parseBool(configMap['contact_tiktok_enabled'], DEFAULTS.tiktok_enabled),
    };

    const hasApiData = Object.keys(configMap).length > 0;
    console.log(`✅ [SOCIAL] Contatos carregados ${hasApiData ? 'da API (individual)' : '(defaults)'}:`, cachedContacts);
    return cachedContacts;
  },

  clearCache() {
    cachedContacts = null;
  }
};
