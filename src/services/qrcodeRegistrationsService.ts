export interface QrRegistration {
  id: number;
  token: string;
  full_name: string;
  birth_date: string;
  document_number: string;
  parent1: string;
  parent2: string;
  photo_path: string;
  validation: 'pending' | 'verified';
  expiry_date: string;
  is_expired: boolean;
  qr_code_path: string;
  id_user: string | null;
  created_at: string;
  module_source?: string;
  inferred_plan: '1m' | '3m' | '6m';
}

const PHP_API_BASE = 'https://qr.apipainel.com.br/qrcode';

const normalizeDigits = (value: string) => value.replace(/\D/g, '');

const inferPlanFromDates = (createdAt: string, expiryDate: string): '1m' | '3m' | '6m' => {
  const created = new Date(createdAt).getTime();
  const expiry = new Date(expiryDate).getTime();

  if (!Number.isFinite(created) || !Number.isFinite(expiry) || expiry <= created) {
    return '1m';
  }

  const diffDays = (expiry - created) / (1000 * 60 * 60 * 24);
  if (diffDays <= 45) return '1m';
  if (diffDays <= 135) return '3m';
  return '6m';
};

export const qrcodeRegistrationsService = {
  normalizeDigits,

  async list(params: { idUser?: string; limit?: number; offset?: number } = {}): Promise<QrRegistration[]> {
    const search = new URLSearchParams();
    search.set('limit', String(params.limit ?? 100));
    search.set('offset', String(params.offset ?? 0));
    if (params.idUser) search.set('id_user', params.idUser);

    const response = await fetch(`${PHP_API_BASE}/list_users.php?${search.toString()}`);
    const data = await response.json();

    if (!data?.success || !Array.isArray(data.data)) return [];

    return data.data.map((item: any) => ({
      ...item,
      inferred_plan: inferPlanFromDates(item.created_at, item.expiry_date),
    }));
  },
};
