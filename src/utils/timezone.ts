// Fuso horário padrão da aplicação: Brasília (UTC-3)
export const APP_TIMEZONE = 'America/Sao_Paulo';

/**
 * Parseia uma string "YYYY-MM-DD" como data LOCAL (sem interpretação UTC)
 * Evita o problema de new Date("2026-04-08") ser interpretado como UTC meia-noite
 */
function parseDateLocal(dateStr: string): Date {
  // Se contém "T" ou "Z", é um datetime completo — usar construtor padrão
  if (dateStr.includes('T') || dateStr.includes('Z')) {
    return new Date(dateStr);
  }
  // Para "YYYY-MM-DD", parsear como local para evitar shift de timezone
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(dateStr);
}

/**
 * Retorna a data/hora atual no fuso de Brasília
 */
export function nowBrasilia(): Date {
  const now = new Date();
  const brasiliaString = now.toLocaleString('en-US', { timeZone: APP_TIMEZONE });
  return new Date(brasiliaString);
}

/**
 * Formata uma data para exibição no fuso de Brasília
 */
export function formatDateBR(
  dateInput: string | Date | undefined | null,
  options?: {
    showTime?: boolean;
    showSeconds?: boolean;
  }
): string {
  if (!dateInput) return '—';

  try {
    const date = typeof dateInput === 'string' ? parseDateLocal(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '—';

    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone: APP_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };

    if (options?.showTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
      if (options?.showSeconds) {
        formatOptions.second = '2-digit';
      }
    }

    return date.toLocaleDateString('pt-BR', formatOptions);
  } catch {
    return '—';
  }
}

/**
 * Retorna "hoje" no fuso de Brasília como YYYY-MM-DD
 */
export function todayBrasilia(): string {
  const now = nowBrasilia();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calcula dias restantes a partir de uma data final, usando o fuso de Brasília
 * Ambas as datas são normalizadas para meia-noite LOCAL para evitar problemas de timezone
 */
export function remainingDaysBR(endDate: string | Date | undefined | null): number {
  if (!endDate) return 0;
  
  // Parsear a data final como LOCAL (não UTC)
  const end = typeof endDate === 'string' ? parseDateLocal(endDate) : new Date(endDate);
  if (isNaN(end.getTime())) return 0;
  end.setHours(0, 0, 0, 0);

  // Hoje em Brasília, também normalizado para meia-noite
  const today = nowBrasilia();
  today.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - today.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}
