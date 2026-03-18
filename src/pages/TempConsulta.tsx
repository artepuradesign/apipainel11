import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MenuSuperior from '@/components/MenuSuperior';
import FuturisticFooter from '@/components/FuturisticFooter';
import PageLayout from '@/components/layout/PageLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Camera, CheckCircle, Clock3, Copy, DollarSign, FileSignature, FileText, Mail, MapPin, Phone, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { tempConsultationShareService } from '@/services/tempConsultationShareService';
import type { BaseAuxilioEmergencial } from '@/services/baseAuxilioEmergencialService';
import type { BaseRais } from '@/services/baseRaisService';
import ScoreGaugeCard from '@/components/dashboard/ScoreGaugeCard';
import PisSection from '@/components/dashboard/PisSection';
import { AuxilioEmergencialSection } from '@/components/dashboard/AuxilioEmergencialSection';
import { RaisSection } from '@/components/dashboard/RaisSection';
import ScrollToTop from '@/components/ui/scroll-to-top';
import { useIsMobile } from '@/hooks/use-mobile';
import placeholderImage from '@/assets/placeholder-photo.png';

type SharedRecord = Record<string, unknown>;

const extractShareKey = (search: string) => {
  const params = new URLSearchParams(search);
  const explicit = params.get('k') || params.get('key');
  if (explicit) return explicit;

  const raw = search.replace(/^\?/, '');
  if (raw.startsWith('=')) {
    return decodeURIComponent(raw.slice(1));
  }

  return '';
};

const hasValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase();
    return normalized !== '' && normalized !== '-' && normalized !== 'SEM RESULTADO' && normalized !== 'SEM DADOS';
  }
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const parseArrayData = <T = unknown,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];

  if (typeof value === 'string') {
    try {
      return parseArrayData<T>(JSON.parse(value));
    } catch {
      return [];
    }
  }

  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;

    if (Array.isArray(candidate.data)) return candidate.data as T[];

    if (candidate.data && typeof candidate.data === 'object') {
      const nestedData = candidate.data as Record<string, unknown>;
      if (Array.isArray(nestedData.data)) return nestedData.data as T[];
      if (Array.isArray(nestedData.items)) return nestedData.items as T[];
      if (Array.isArray(nestedData.results)) return nestedData.results as T[];
    }

    if (Array.isArray(candidate.items)) return candidate.items as T[];
    if (Array.isArray(candidate.results)) return candidate.results as T[];
  }

  return [];
};

const normalizeCollection = (value: unknown): SharedRecord[] =>
  parseArrayData<SharedRecord>(value).filter((item) => {
    if (!item || typeof item !== 'object') return false;
    return Object.values(item).some(hasValue);
  });

const formatRenda = (value: unknown) => {
  if (!hasValue(value)) return '';

  if (typeof value === 'string' && (value.includes('R$') || /[A-Za-z]/.test(value))) {
    return value;
  }

  const numericValue =
    typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, ''));

  if (!Number.isNaN(numericValue)) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue / 100);
  }

  return String(value);
};

const formatDateOnly = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
};

const formatCountdown = (ms: number) => {
  if (ms <= 0) return 'Expirado';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatFieldLabel = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const formatCpfValue = (value: unknown) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length !== 11) return String(value ?? '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatLocalPhone = (value: unknown) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 8) return digits.replace(/(\d{4})(\d{4})/, '$1-$2');
  if (digits.length === 9) return digits.replace(/(\d{5})(\d{4})/, '$1-$2');
  return String(value ?? '');
};

const normalizePhotoUrl = (value: string) => {
  const raw = value.trim();
  if (!raw) return '';

  const first = raw.split(',')[0]?.trim() || '';
  const normalized = first.replace(/^\/+/, '');

  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (/^api\.apipainel\.com\.br\//i.test(normalized)) return `https://${normalized}`;
  if (/^(fotos|base-foto)\//i.test(normalized)) return `https://api.apipainel.com.br/${normalized}`;

  return `https://api.apipainel.com.br/fotos/${normalized}`;
};

interface SharedFieldConfig {
  label: string;
  keys: string[];
  formatter?: (value: unknown) => string;
}

const getFirstRecordValue = (item: SharedRecord, keys: string[]) => {
  for (const key of keys) {
    const value = item[key];
    if (hasValue(value)) return value;
  }
  return '';
};

const formatInputValue = (value: unknown, formatter?: (value: unknown) => string) => {
  if (!hasValue(value)) return '';
  if (formatter) return formatter(value);
  return String(value);
};

interface SharedInputRecordsSectionProps {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SharedRecord[];
  fields?: SharedFieldConfig[];
}

const SharedInputRecordsSection: React.FC<SharedInputRecordsSectionProps> = ({ id, title, icon: Icon, items, fields }) => {
  if (items.length === 0) return null;

  return (
    <Card id={id} className="border-success-border bg-success-subtle">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{title}</span>
          </CardTitle>
          <div className="relative inline-flex">
            <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
            <span className="absolute -top-2 -right-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background">
              {items.length}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:p-6">
        {items.map((item, index) => {
          const configuredFields =
            fields?.map((field) => ({
              key: field.keys.join('-'),
              label: field.label,
              value: formatInputValue(getFirstRecordValue(item, field.keys), field.formatter),
            })).filter((field) => hasValue(field.value)) ?? [];

          const configuredKeys = new Set((fields ?? []).flatMap((field) => field.keys));

          const dynamicFields = Object.entries(item)
            .filter(([key, value]) => !configuredKeys.has(key) && hasValue(value))
            .map(([key, value]) => ({
              key,
              label: formatFieldLabel(key),
              value: formatInputValue(value),
            }));

          const resolvedFields = [...configuredFields, ...dynamicFields];

          if (resolvedFields.length === 0) return null;

          return (
            <div key={`${id}-${index}`} className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
              <Badge variant="outline">Registro {index + 1}</Badge>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resolvedFields.map((field, fieldIndex) => (
                  <div key={`${id}-${index}-${field.key}-${fieldIndex}`}>
                    <Label className="text-xs sm:text-sm" htmlFor={`${id}-${index}-${field.key}-${fieldIndex}`}>
                      {field.label}
                    </Label>
                    <Input
                      id={`${id}-${index}-${field.key}-${fieldIndex}`}
                      value={field.value}
                      disabled
                      className="bg-muted text-[14px] md:text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

const TempConsulta = () => {
  const { search } = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<any>(null);
  const [countdown, setCountdown] = useState('');

  const key = useMemo(() => extractShareKey(search), [search]);
  const sharedPayload = shareData?.payload;
  const sharedResult = sharedPayload?.result_data || null;
  const sharedBadgeCounts = (sharedPayload?.badge_counts || {}) as Record<string, number>;

  const hasCpfValue = hasValue(sharedResult?.cpf);

  const telefonesData = useMemo(() => normalizeCollection(sharedResult?.telefones), [sharedResult?.telefones]);
  const emailsData = useMemo(() => normalizeCollection(sharedResult?.emails), [sharedResult?.emails]);
  const enderecosData = useMemo(() => normalizeCollection(sharedResult?.enderecos), [sharedResult?.enderecos]);
  const parentesData = useMemo(() => normalizeCollection(sharedResult?.parentes), [sharedResult?.parentes]);
  const certidaoData = useMemo(() => normalizeCollection(sharedResult?.certidao_nascimento || sharedResult?.certidoes), [sharedResult?.certidao_nascimento, sharedResult?.certidoes]);
  const documentoData = useMemo(() => normalizeCollection(sharedResult?.documentos), [sharedResult?.documentos]);
  const cnsData = useMemo(() => normalizeCollection(sharedResult?.cns_dados), [sharedResult?.cns_dados]);
  const vacinasData = useMemo(() => normalizeCollection(sharedResult?.vacinas_covid), [sharedResult?.vacinas_covid]);
  const empresasSocioData = useMemo(() => normalizeCollection(sharedResult?.empresas_socio), [sharedResult?.empresas_socio]);
  const dividasAtivasData = useMemo(() => normalizeCollection(sharedResult?.dividas_ativas), [sharedResult?.dividas_ativas]);
  const inssData = useMemo(() => normalizeCollection(sharedResult?.inss_dados), [sharedResult?.inss_dados]);
  const claroData = useMemo(() => normalizeCollection(sharedResult?.operadora_claro), [sharedResult?.operadora_claro]);
  const vivoData = useMemo(() => normalizeCollection(sharedResult?.operadora_vivo), [sharedResult?.operadora_vivo]);
  const timData = useMemo(() => normalizeCollection(sharedResult?.operadora_tim), [sharedResult?.operadora_tim]);
  const oiData = useMemo(() => normalizeCollection(sharedResult?.operadora_oi), [sharedResult?.operadora_oi]);
  const senhasEmailData = useMemo(() => normalizeCollection(sharedResult?.senhas_vazadas_email), [sharedResult?.senhas_vazadas_email]);
  const senhasCpfData = useMemo(() => normalizeCollection(sharedResult?.senhas_vazadas_cpf), [sharedResult?.senhas_vazadas_cpf]);
  const gestaoData = useMemo(() => normalizeCollection(sharedResult?.gestao_cadastral), [sharedResult?.gestao_cadastral]);

  const auxiliosEmergenciais = useMemo(
    () => parseArrayData<BaseAuxilioEmergencial>(sharedResult?.auxilio_emergencial),
    [sharedResult?.auxilio_emergencial]
  );

  const raisData = useMemo(() => parseArrayData<BaseRais>(sharedResult?.rais_historico), [sharedResult?.rais_historico]);

  const scoreData = useMemo(() => {
    const score = Number(sharedResult?.score || 0);
    if (score >= 800) return { label: 'Excelente' };
    if (score >= 600) return { label: 'Bom' };
    if (score >= 400) return { label: 'Regular' };
    return { label: 'Baixo' };
  }, [sharedResult?.score]);

  const hasDadosFinanceiros = useMemo(
    () => [sharedResult?.renda, sharedResult?.fx_poder_aquisitivo, sharedResult?.poder_aquisitivo].some(hasValue),
    [sharedResult]
  );

  const hasDadosBasicos = useMemo(
    () => [
      sharedResult?.cpf,
      sharedResult?.nome,
      sharedResult?.data_nascimento,
      sharedResult?.sexo,
      sharedResult?.mae || sharedResult?.nome_mae,
      sharedResult?.pai || sharedResult?.nome_pai,
      sharedResult?.estado_civil,
      sharedResult?.rg,
      sharedResult?.cbo,
      sharedResult?.orgao_emissor,
      sharedResult?.uf_emissao,
      sharedResult?.data_obito,
      sharedResult?.titulo_eleitor,
    ].some(hasValue),
    [sharedResult]
  );

  const hasTituloEleitor = useMemo(
    () => [sharedResult?.titulo_eleitor, sharedResult?.zona, sharedResult?.secao].some(hasValue),
    [sharedResult]
  );

  const documentoFields = useMemo(
    () => [
      { label: 'RG', value: sharedResult?.rg },
      { label: 'Órgão Emissor', value: sharedResult?.orgao_emissor },
      { label: 'UF Emissão', value: sharedResult?.uf_emissao },
      { label: 'CTPS', value: sharedResult?.ctps },
      { label: 'NIT', value: sharedResult?.nit },
      { label: 'Passaporte', value: sharedResult?.passaporte },
    ].filter((field) => hasValue(field.value)),
    [sharedResult]
  );

  const cnsFields = useMemo(
    () => [
      { label: 'CNS', value: sharedResult?.cns },
      { label: 'NSU', value: sharedResult?.nsu },
    ].filter((field) => hasValue(field.value)),
    [sharedResult]
  );

  const cnpjMeiValue = sharedResult?.cnpj_mei;
  const isMobile = useIsMobile();

  const photoUrls = useMemo(() => {
    const fromSingles = [sharedResult?.foto, sharedResult?.foto2].filter((value): value is string => typeof value === 'string' && value.trim() !== '');
    const fromArray = normalizeCollection(sharedResult?.fotos || sharedResult?.base_foto)
      .map((item) => (typeof item.photo === 'string' ? item.photo : ''))
      .filter((value): value is string => value.trim() !== '');

    return [...new Set([...fromSingles, ...fromArray].map(normalizePhotoUrl).filter(Boolean))];
  }, [sharedResult?.foto, sharedResult?.foto2, sharedResult?.fotos, sharedResult?.base_foto]);

  const photoSlotsToRender = useMemo(() => {
    const desktopSlots = 4;
    const mobileSlots = photoUrls.length > 2 ? 4 : 2;
    return isMobile ? mobileSlots : desktopSlots;
  }, [isMobile, photoUrls.length]);

  const badgeCounts = useMemo(() => {
    const fallback = (href: string, current: number) => {
      const fromShared = Number(sharedBadgeCounts[href]);
      return Number.isFinite(fromShared) && fromShared > 0 ? fromShared : current;
    };

    const scoreCount = hasValue(sharedResult?.score) ? 1 : 0;
    const csb8Count = hasValue(sharedResult?.csb8) || hasValue(sharedResult?.csb8_faixa) ? 1 : 0;
    const csbaCount = hasValue(sharedResult?.csba) || hasValue(sharedResult?.csba_faixa) ? 1 : 0;

    return {
      '#fotos-section': fallback('#fotos-section', photoUrls.length),
      '#score-section': fallback('#score-section', scoreCount),
      '#csb8-section': fallback('#csb8-section', csb8Count),
      '#csba-section': fallback('#csba-section', csbaCount),
      '#dados-financeiros-section': fallback('#dados-financeiros-section', hasDadosFinanceiros ? 1 : 0),
      '#dados-basicos-section': fallback('#dados-basicos-section', hasDadosBasicos ? 1 : 0),
      '#telefones-section': fallback('#telefones-section', telefonesData.length),
      '#emails-section': fallback('#emails-section', emailsData.length),
      '#enderecos-section': fallback('#enderecos-section', enderecosData.length),
      '#titulo-eleitor-section': fallback('#titulo-eleitor-section', hasTituloEleitor ? 1 : 0),
      '#parentes-section': fallback('#parentes-section', parentesData.length),
      '#certidao-nascimento-section': fallback('#certidao-nascimento-section', certidaoData.length),
      '#documento-section': fallback('#documento-section', documentoData.length || (documentoFields.length > 0 ? 1 : 0)),
      '#cns-section': fallback('#cns-section', cnsData.length || (cnsFields.length > 0 ? 1 : 0)),
      '#pis-section': fallback('#pis-section', hasValue(sharedResult?.pis) ? 1 : 0),
      '#vacinas-section': fallback('#vacinas-section', vacinasData.length),
      '#empresas-socio-section': fallback('#empresas-socio-section', empresasSocioData.length),
      '#cnpj-mei-section': fallback('#cnpj-mei-section', hasValue(cnpjMeiValue) ? 1 : 0),
      '#dividas-ativas-section': fallback('#dividas-ativas-section', dividasAtivasData.length),
      '#auxilio-emergencial-section': fallback('#auxilio-emergencial-section', auxiliosEmergenciais.length),
      '#rais-section': fallback('#rais-section', raisData.length),
      '#inss-section': fallback('#inss-section', inssData.length),
      '#claro-section': fallback('#claro-section', claroData.length),
      '#vivo-section': fallback('#vivo-section', vivoData.length),
      '#tim-section': fallback('#tim-section', timData.length),
      '#oi-section': fallback('#oi-section', oiData.length),
      '#senhas-email-section': fallback('#senhas-email-section', senhasEmailData.length),
      '#senhas-cpf-section': fallback('#senhas-cpf-section', senhasCpfData.length),
      '#gestao-cadastral-section': fallback('#gestao-cadastral-section', gestaoData.length),
    } as Record<string, number>;
  }, [
    sharedBadgeCounts,
    sharedResult,
    hasDadosFinanceiros,
    hasDadosBasicos,
    hasTituloEleitor,
    photoUrls.length,
    telefonesData.length,
    emailsData.length,
    enderecosData.length,
    parentesData.length,
    certidaoData.length,
    documentoData.length,
    documentoFields.length,
    cnsData.length,
    cnsFields.length,
    vacinasData.length,
    empresasSocioData.length,
    cnpjMeiValue,
    dividasAtivasData.length,
    auxiliosEmergenciais.length,
    raisData.length,
    inssData.length,
    claroData.length,
    vivoData.length,
    timData.length,
    oiData.length,
    senhasEmailData.length,
    senhasCpfData.length,
    gestaoData.length,
  ]);

  const onlineBadges = useMemo(
    () => [
      { href: '#fotos-section', label: 'Fotos' },
      { href: '#score-section', label: 'Score' },
      { href: '#csb8-section', label: 'CSB8' },
      { href: '#csba-section', label: 'CSBA' },
      { href: '#dados-financeiros-section', label: 'Dados Financeiros' },
      { href: '#dados-basicos-section', label: 'Dados Básicos' },
      { href: '#telefones-section', label: 'Telefones' },
      { href: '#emails-section', label: 'Emails' },
      { href: '#enderecos-section', label: 'Endereços' },
      { href: '#titulo-eleitor-section', label: 'Título de Eleitor' },
      { href: '#parentes-section', label: 'Parentes' },
      { href: '#certidao-nascimento-section', label: 'Certidão de Nascimento' },
      { href: '#documento-section', label: 'Documento' },
      { href: '#cns-section', label: 'CNS' },
      { href: '#pis-section', label: 'PIS' },
      { href: '#vacinas-section', label: 'Vacinas' },
      { href: '#empresas-socio-section', label: 'Empresas Associadas (SÓCIO)' },
      { href: '#cnpj-mei-section', label: 'CNPJ MEI' },
      { href: '#dividas-ativas-section', label: 'Dívidas Ativas (SIDA)' },
      { href: '#auxilio-emergencial-section', label: 'Auxílio Emergencial' },
      { href: '#rais-section', label: 'Rais - Histórico de Emprego' },
      { href: '#inss-section', label: 'INSS' },
      { href: '#claro-section', label: 'Operadora Claro' },
      { href: '#vivo-section', label: 'Operadora Vivo' },
      { href: '#tim-section', label: 'Operadora TIM' },
      { href: '#oi-section', label: 'Operadora OI' },
      { href: '#senhas-email-section', label: 'Senhas de Email' },
      { href: '#senhas-cpf-section', label: 'Senhas de CPF' },
      { href: '#gestao-cadastral-section', label: 'Gestão Cadastral' },
    ],
    []
  );

  useEffect(() => {
    const load = async () => {
      if (!key) {
        setError('Chave de compartilhamento inválida.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await tempConsultationShareService.getPublicShareByKey(key);
        setShareData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível carregar a consulta.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [key]);

  useEffect(() => {
    if (!shareData?.expires_at) {
      setCountdown('');
      return;
    }

    const expiresAt = new Date(shareData.expires_at).getTime();

    const updateCountdown = () => {
      const remainingMs = expiresAt - Date.now();
      setCountdown(formatCountdown(remainingMs));
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [shareData?.expires_at]);

  return (
    <PageLayout variant="auth" backgroundOpacity="strong" showGradients={false} className="flex flex-col min-h-screen">
      <MenuSuperior />

      <main className="flex-1 w-full">
        <section className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-6">
          {loading && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Carregando dados da consulta...</p>
              </CardContent>
            </Card>
          )}

          {!loading && error && (
            <Card>
              <CardContent className="p-4">
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && sharedPayload && (
            <div className="space-y-6">
              <Card className="border-success-border w-full overflow-hidden">
                <CardHeader className="bg-success-subtle p-4 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="flex items-center text-success-subtle-foreground min-w-0">
                      <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                      <span className="truncate text-base sm:text-lg">Sucesso</span>
                    </CardTitle>
                    <span className="inline-flex items-center gap-1 text-xs md:text-sm text-success-subtle-foreground">
                      <Clock3 className="h-4 w-4" />
                      Expira em: {new Date(shareData.expires_at).toLocaleString('pt-BR')}
                      {countdown ? <span className="inline-block min-w-[92px] text-right font-bold tabular-nums">({countdown})</span> : null}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 md:p-6 pt-3">
                  <div className="flex flex-wrap gap-2">
                    {onlineBadges
                      .filter((badge) => badge.href === '#score-section' || (badgeCounts[badge.href] ?? 0) > 0)
                      .map((badge) => {
                        const count = badgeCounts[badge.href] ?? 0;
                        return (
                          <a key={badge.href} href={badge.href} className="no-underline">
                            <span className="relative inline-flex">
                              <Badge variant="secondary" className="bg-success text-success-foreground hover:bg-success/80 text-xs">
                                {badge.label}
                              </Badge>
                              {count > 0 ? (
                                <span
                                  className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background"
                                  aria-label={`Quantidade de registros: ${count}`}
                                >
                                  {count}
                                </span>
                              ) : null}
                            </span>
                          </a>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              {hasCpfValue ? (
                <>
                  {(photoUrls.length > 0 || (badgeCounts['#fotos-section'] ?? 0) > 0) && (
                    <Card id="fotos-section" className="border-success-border bg-success-subtle">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
                            <Camera className="h-5 w-5 flex-shrink-0" />
                            <span className="truncate">Fotos</span>
                          </CardTitle>
                          <div className="relative inline-flex">
                            <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
                            <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background">
                              {photoUrls.length}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 md:p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {photoUrls.slice(0, photoSlotsToRender).map((url, index) => (
                            <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden border-2 rounded-md bg-card">
                              <img
                                src={url}
                                alt={`Foto ${index + 1}`}
                                className="w-full h-full object-cover aspect-[3/4]"
                                loading="lazy"
                                onError={(event) => {
                                  (event.currentTarget as HTMLImageElement).src = placeholderImage;
                                }}
                              />
                              <div className="p-2 text-sm font-medium text-center bg-primary text-primary-foreground">
                                Foto {index + 1}
                              </div>
                            </a>
                          ))}

                          {Array.from({ length: Math.max(0, photoSlotsToRender - photoUrls.length) }).map((_, index) => (
                            <div key={`placeholder-${index}`} className="overflow-hidden border-2 rounded-md bg-card">
                              <img
                                src={placeholderImage}
                                alt={`Foto ${photoUrls.length + index + 1} (simulação)`}
                                className="w-full h-full object-cover aspect-[3/4]"
                                loading="lazy"
                              />
                              <div className="p-2 text-sm font-medium text-center bg-primary text-primary-foreground">
                                Foto {photoUrls.length + index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <section className="mx-auto w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    <Card id="score-section" className="border-success-border bg-success-subtle">
                      <CardContent className="p-2 space-y-1">
                        <ScoreGaugeCard
                          title="SCORE"
                          score={hasValue(sharedResult?.score) ? sharedResult.score : 0}
                          faixa={scoreData.label}
                          icon="chart"
                          compact
                          embedded
                        />
                      </CardContent>
                    </Card>
                    {hasValue(sharedResult?.csb8) && (
                      <Card id="csb8-section" className="border-success-border bg-success-subtle">
                        <CardContent className="p-2">
                          <ScoreGaugeCard title="CSB8 [SCORE]" score={sharedResult.csb8} faixa={sharedResult.csb8_faixa} icon="chart" compact embedded />
                        </CardContent>
                      </Card>
                    )}
                    {hasValue(sharedResult?.csba) && (
                      <Card id="csba-section" className="border-success-border bg-success-subtle">
                        <CardContent className="p-2">
                          <ScoreGaugeCard title="CSBA [SCORE]" score={sharedResult.csba} faixa={sharedResult.csba_faixa} icon="trending" compact embedded />
                        </CardContent>
                      </Card>
                    )}
                  </section>

                  {hasDadosFinanceiros && (
                    <Card id="dados-financeiros-section" className="border-success-border bg-success-subtle">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                            <DollarSign className="h-5 w-5" />
                            Dados Financeiros
                          </CardTitle>
                          <div className="relative inline-flex">
                            <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
                            <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background">1</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border">
                          <div>
                            <Label htmlFor="poder_aquisitivo">Poder Aquisitivo</Label>
                            <Input id="poder_aquisitivo" value={sharedResult.poder_aquisitivo || ''} disabled className="uppercase text-[14px] md:text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="renda">Renda</Label>
                            <Input id="renda" value={formatRenda(sharedResult.renda)} disabled className="text-[14px] md:text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="fx_poder_aquisitivo">Faixa Poder Aquisitivo</Label>
                            <Input id="fx_poder_aquisitivo" value={sharedResult.fx_poder_aquisitivo || ''} disabled className="uppercase text-[14px] md:text-sm" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {hasDadosBasicos && (
                    <Card id="dados-basicos-section" className="border-success-border bg-success-subtle w-full">
                      <CardHeader className="p-4 md:p-6">
                        <div className="flex items-center justify-between gap-3">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
                            <User className="h-5 w-5 flex-shrink-0" />
                            <span className="truncate">Dados Básicos</span>
                          </CardTitle>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const dados = [
                                  `CPF: ${sharedResult.cpf ? String(sharedResult.cpf).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-'}`,
                                  `Nome: ${sharedResult.nome || '-'}`,
                                  `Data de Nascimento: ${sharedResult.data_nascimento ? formatDateOnly(sharedResult.data_nascimento) : '-'}`,
                                  `Sexo: ${sharedResult.sexo ? (String(sharedResult.sexo).toLowerCase() === 'm' ? 'Masculino' : String(sharedResult.sexo).toLowerCase() === 'f' ? 'Feminino' : sharedResult.sexo) : '-'}`,
                                  `Nome da Mãe: ${(sharedResult.mae || sharedResult.nome_mae) || '-'}`,
                                  `Nome do Pai: ${(sharedResult.pai || sharedResult.nome_pai) || '-'}`,
                                  `Estado Civil: ${sharedResult.estado_civil || '-'}`,
                                  `RG: ${sharedResult.rg || '-'}`,
                                  `CBO: ${sharedResult.cbo || '-'}`,
                                  `Órgão Emissor: ${sharedResult.orgao_emissor || '-'}`,
                                  `UF Emissor: ${sharedResult.uf_emissao || '-'}`,
                                  `Data de Óbito: ${sharedResult.data_obito ? new Date(sharedResult.data_obito).toLocaleDateString('pt-BR') : '-'}`,
                                  `Renda: ${formatRenda(sharedResult.renda) || '-'}`,
                                  `Título de Eleitor: ${sharedResult.titulo_eleitor || '-'}`,
                                ].join('\n');
                                navigator.clipboard.writeText(dados);
                                toast.success('Dados básicos copiados!');
                              }}
                              className="h-8 w-8"
                              title="Copiar dados da seção"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            <div className="relative inline-flex">
                              <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
                              {Number(badgeCounts['#dados-basicos-section'] || 0) > 0 ? (
                                <span
                                  className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background"
                                  aria-label={`Quantidade de registros Dados Básicos: ${Number(badgeCounts['#dados-basicos-section'] || 0)}`}
                                >
                                  {Number(badgeCounts['#dados-basicos-section'] || 0)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 p-4 md:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                          <div>
                            <Label className="text-xs sm:text-sm" htmlFor="cpf">CPF</Label>
                            <Input
                              id="cpf"
                              value={sharedResult.cpf ? String(sharedResult.cpf).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : ''}
                              disabled
                              className="bg-muted uppercase text-[14px] md:text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs sm:text-sm" htmlFor="nome">Nome Completo</Label>
                            <Input
                              id="nome"
                              value={sharedResult.nome || ''}
                              disabled
                              className="bg-muted uppercase text-[14px] md:text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs sm:text-sm" htmlFor="data_nascimento">Data de Nascimento</Label>
                            <Input
                              id="data_nascimento"
                              value={sharedResult.data_nascimento ? formatDateOnly(sharedResult.data_nascimento) : ''}
                              disabled
                              className="bg-muted text-[14px] md:text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs sm:text-sm" htmlFor="sexo">Sexo</Label>
                            <Input
                              id="sexo"
                              value={(sharedResult.sexo
                                ? (String(sharedResult.sexo).toLowerCase() === 'm'
                                  ? 'Masculino'
                                  : String(sharedResult.sexo).toLowerCase() === 'f'
                                    ? 'Feminino'
                                    : String(sharedResult.sexo).toLowerCase() === 'i'
                                      ? 'Indefinido'
                                      : String(sharedResult.sexo))
                                : '').toUpperCase()}
                              disabled
                              className="bg-muted text-[14px] md:text-sm"
                            />
                          </div>

                          {sharedResult.mae || sharedResult.nome_mae ? (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="mae">Nome da Mãe</Label>
                              <Input
                                id="mae"
                                value={(sharedResult.mae || sharedResult.nome_mae) || ''}
                                disabled
                                className="bg-muted uppercase text-[14px] md:text-sm"
                              />
                            </div>
                          ) : null}

                          {sharedResult.pai || sharedResult.nome_pai ? (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="pai">Nome do Pai</Label>
                              <Input
                                id="pai"
                                value={(sharedResult.pai || sharedResult.nome_pai) || ''}
                                disabled
                                className="bg-muted uppercase text-[14px] md:text-sm"
                              />
                            </div>
                          ) : null}

                          {sharedResult.estado_civil ? (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="estado_civil">Estado Civil</Label>
                              <Input
                                id="estado_civil"
                                value={sharedResult.estado_civil || ''}
                                disabled
                                className="bg-muted uppercase text-[14px] md:text-sm"
                              />
                            </div>
                          ) : null}

                          {sharedResult.rg ? (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="rg">RG</Label>
                              <Input
                                id="rg"
                                value={sharedResult.rg || ''}
                                disabled
                                className="bg-muted uppercase text-[14px] md:text-sm"
                              />
                            </div>
                          ) : null}

                          {sharedResult.cbo ? (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="cbo">CBO</Label>
                              <Input
                                id="cbo"
                                value={sharedResult.cbo || ''}
                                disabled
                                className="bg-muted uppercase text-[14px] md:text-sm"
                              />
                            </div>
                          ) : null}

                          {sharedResult.orgao_emissor ? (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="orgao_emissor">Órgão Emissor</Label>
                              <Input
                                id="orgao_emissor"
                                value={sharedResult.orgao_emissor || ''}
                                disabled
                                className="bg-muted uppercase text-[14px] md:text-sm"
                              />
                            </div>
                          ) : null}

                          {sharedResult.uf_emissao ? (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="uf_emissao">UF Emissor</Label>
                              <Input
                                id="uf_emissao"
                                value={sharedResult.uf_emissao || ''}
                                disabled
                                className="bg-muted uppercase text-[14px] md:text-sm"
                              />
                            </div>
                          ) : null}

                          {sharedResult.data_obito ? (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="data_obito">Data Óbito</Label>
                              <Input
                                id="data_obito"
                                value={sharedResult.data_obito ? new Date(sharedResult.data_obito).toLocaleDateString('pt-BR') : ''}
                                disabled
                                className="bg-muted text-[14px] md:text-sm"
                              />
                            </div>
                          ) : null}

                          {sharedResult.renda ? (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="renda_basicos">Renda</Label>
                              <Input
                                id="renda_basicos"
                                value={formatRenda(sharedResult.renda)}
                                disabled
                                className="bg-muted text-[14px] md:text-sm"
                              />
                            </div>
                          ) : null}

                          {sharedResult.titulo_eleitor ? (
                            <div>
                              <Label className="text-xs sm:text-sm" htmlFor="titulo_eleitor_basicos">Título de Eleitor</Label>
                              <Input
                                id="titulo_eleitor_basicos"
                                value={sharedResult.titulo_eleitor || ''}
                                disabled
                                className="bg-muted uppercase text-[14px] md:text-sm"
                              />
                            </div>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <SharedInputRecordsSection
                    id="telefones-section"
                    title="Telefones"
                    icon={Phone}
                    items={telefonesData}
                    fields={[
                      { label: 'DDD', keys: ['ddd'] },
                      { label: 'Telefone', keys: ['telefone', 'numero'], formatter: formatLocalPhone },
                      { label: 'Tipo', keys: ['tipo_texto', 'tipo'] },
                      { label: 'Classificação', keys: ['classificacao'] },
                      { label: 'Sigilo', keys: ['sigilo'] },
                      { label: 'Data Inclusão', keys: ['data_inclusao'], formatter: (value) => formatDateOnly(String(value)) },
                    ]}
                  />
                  <SharedInputRecordsSection
                    id="emails-section"
                    title="Emails"
                    icon={Mail}
                    items={emailsData}
                    fields={[
                      { label: 'Email', keys: ['email'] },
                      { label: 'Score', keys: ['score_email'] },
                      { label: 'Pessoal', keys: ['email_pessoal'] },
                      { label: 'Prioridade', keys: ['prioridade'] },
                      { label: 'Duplicado', keys: ['email_duplicado'] },
                      { label: 'Blacklist', keys: ['blacklist'] },
                      { label: 'Estrutura', keys: ['estrutura'] },
                      { label: 'Status VT', keys: ['status_vt'] },
                      { label: 'Domínio', keys: ['dominio'] },
                      { label: 'Mapas', keys: ['mapas'] },
                      { label: 'Peso', keys: ['peso'] },
                      { label: 'Data inclusão', keys: ['data_inclusao'], formatter: (value) => formatDateOnly(String(value)) },
                    ]}
                  />
                  <SharedInputRecordsSection
                    id="enderecos-section"
                    title="Endereços"
                    icon={MapPin}
                    items={enderecosData}
                    fields={[
                      { label: 'CEP', keys: ['cep'] },
                      { label: 'Logradouro', keys: ['logradouro'] },
                      { label: 'Número', keys: ['numero'] },
                      { label: 'Complemento', keys: ['complemento'] },
                      { label: 'Bairro', keys: ['bairro'] },
                      { label: 'Cidade', keys: ['cidade'] },
                      { label: 'UF', keys: ['uf'] },
                    ]}
                  />

                  {hasTituloEleitor && (
                    <Card id="titulo-eleitor-section" className="border-success-border bg-success-subtle">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
                            <FileText className="h-5 w-5 flex-shrink-0" />
                            <span className="truncate">Título de Eleitor</span>
                          </CardTitle>
                          <div className="relative inline-flex">
                            <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
                            <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background">1</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="titulo_eleitor">Título de Eleitor</Label>
                            <Input id="titulo_eleitor" value={sharedResult.titulo_eleitor || ''} disabled className="bg-muted text-[14px] md:text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="zona">Zona</Label>
                            <Input id="zona" value={sharedResult.zona || ''} disabled className="bg-muted text-[14px] md:text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="secao">Seção</Label>
                            <Input id="secao" value={sharedResult.secao || ''} disabled className="bg-muted text-[14px] md:text-sm" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <SharedInputRecordsSection
                    id="parentes-section"
                    title="Parentes"
                    icon={Users}
                    items={parentesData}
                    fields={[
                      { label: 'Nome', keys: ['nome_vinculo', 'nome'] },
                      { label: 'Vínculo', keys: ['vinculo'] },
                      { label: 'CPF', keys: ['cpf_vinculo', 'cpf'], formatter: formatCpfValue },
                    ]}
                  />
                  <SharedInputRecordsSection
                    id="certidao-nascimento-section"
                    title="Certidão de Nascimento"
                    icon={FileSignature}
                    items={certidaoData}
                    fields={[
                      { label: 'Tipo Certidão', keys: ['tipo_certidao'] },
                      { label: 'Número Certidão', keys: ['numero_certidao'] },
                      { label: 'Serviço Registro Civil', keys: ['servico_registro_civil'] },
                      { label: 'Acervo', keys: ['acervo'] },
                      { label: 'Ano', keys: ['ano'] },
                      { label: 'Tipo Livro', keys: ['tipo_livro'] },
                      { label: 'Livro', keys: ['livro'] },
                      { label: 'Folha', keys: ['folha'] },
                      { label: 'Termo', keys: ['termo'] },
                      { label: 'Dígito Verificador', keys: ['digito_verificador'] },
                      { label: 'Data Emissão', keys: ['data_emissao'], formatter: (value) => formatDateOnly(String(value)) },
                    ]}
                  />
                  <SharedInputRecordsSection
                    id="documento-section"
                    title="Documento"
                    icon={FileText}
                    items={documentoData}
                    fields={[
                      { label: 'Número Identificador', keys: ['numero_identificador', 'rg'] },
                      { label: 'Data Expedição', keys: ['data_expedicao'] },
                      { label: 'Órgão Emissor', keys: ['orgao_emissor'] },
                      { label: 'UF', keys: ['sigla_uf', 'uf_emissao'] },
                    ]}
                  />

                  {!documentoData.length && documentoFields.length > 0 && (
                    <Card id="documento-section" className="border-success-border bg-success-subtle">
                      <CardHeader>
                        <CardTitle className="text-base sm:text-lg lg:text-xl">Documento</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {documentoFields.map((field) => (
                          <div key={field.label}>
                            <Label>{field.label}</Label>
                            <Input value={String(field.value)} disabled className="bg-muted" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  <SharedInputRecordsSection
                    id="cns-section"
                    title="CNS"
                    icon={FileText}
                    items={cnsData}
                    fields={[
                      { label: 'Número CNS', keys: ['numero_cns', 'cns'] },
                      { label: 'Tipo', keys: ['tipo_cartao'] },
                      { label: 'NSU', keys: ['nsu'] },
                    ]}
                  />

                  {!cnsData.length && cnsFields.length > 0 && (
                    <Card id="cns-section" className="border-success-border bg-success-subtle">
                      <CardHeader>
                        <CardTitle className="text-base sm:text-lg lg:text-xl">CNS</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {cnsFields.map((field) => (
                          <div key={field.label}>
                            <Label>{field.label}</Label>
                            <Input value={String(field.value)} disabled className="bg-muted" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {hasValue(sharedResult?.pis) && (
                    <div id="pis-section">
                      <PisSection pis={sharedResult.pis} enableCopy={false} />
                    </div>
                  )}

                  <SharedInputRecordsSection id="vacinas-section" title="Vacinas" icon={FileText} items={vacinasData} />
                  <SharedInputRecordsSection id="empresas-socio-section" title="Empresas Associadas (SÓCIO)" icon={FileText} items={empresasSocioData} />

                  {hasValue(cnpjMeiValue) && (
                    <Card id="cnpj-mei-section" className="border-success-border bg-success-subtle">
                      <CardHeader>
                        <CardTitle className="text-base sm:text-lg lg:text-xl">CNPJ MEI</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Input value={String(cnpjMeiValue)} disabled className="bg-muted" />
                      </CardContent>
                    </Card>
                  )}

                  <SharedInputRecordsSection id="dividas-ativas-section" title="Dívidas Ativas (SIDA)" icon={FileText} items={dividasAtivasData} />

                  {auxiliosEmergenciais.length > 0 && (
                    <div id="auxilio-emergencial-section">
                      <AuxilioEmergencialSection auxilios={auxiliosEmergenciais} />
                    </div>
                  )}

                  {raisData.length > 0 && (
                    <div id="rais-section">
                      <RaisSection data={raisData} isLoading={false} />
                    </div>
                  )}

                  <SharedInputRecordsSection id="inss-section" title="INSS" icon={FileText} items={inssData} />
                  <SharedInputRecordsSection id="claro-section" title="Operadora Claro" icon={FileText} items={claroData} />
                  <SharedInputRecordsSection id="vivo-section" title="Operadora Vivo" icon={FileText} items={vivoData} />
                  <SharedInputRecordsSection id="tim-section" title="Operadora TIM" icon={FileText} items={timData} />
                  <SharedInputRecordsSection id="oi-section" title="Operadora OI" icon={FileText} items={oiData} />
                  <SharedInputRecordsSection id="senhas-email-section" title="Senhas de Email" icon={FileText} items={senhasEmailData} />
                  <SharedInputRecordsSection id="senhas-cpf-section" title="Senhas de CPF" icon={FileText} items={senhasCpfData} />
                  <SharedInputRecordsSection id="gestao-cadastral-section" title="Gestão Cadastral" icon={FileText} items={gestaoData} />
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <FileText className="h-5 w-5" />
                      Consulta compartilhada (temporária)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap break-words rounded-md border bg-card p-4 text-xs md:text-sm leading-relaxed">
                      {sharedPayload?.report_text || 'Sem dados para exibir.'}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </section>
      </main>

      <ScrollToTop />
      <FuturisticFooter />
    </PageLayout>
  );
};

export default TempConsulta;
