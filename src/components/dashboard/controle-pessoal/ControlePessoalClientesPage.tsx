import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Loader2,
  Plus,
  Search,
  UserCircle,
  Users,
  Wallet,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  Smartphone,
  Camera,
  Database,
  Pencil,
  Trash2,
} from 'lucide-react';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useApiModules } from '@/hooks/useApiModules';
import { formatCpf, formatPhone } from '@/utils/formatters';
import { todayBrasilia } from '@/utils/timezone';
import { baseCpfService } from '@/services/baseCpfService';
import { consultasCpfService, ConsultaCpf } from '@/services/consultasCpfService';
import { apiRequest } from '@/config/api';
import { toast } from 'sonner';
import FotosSection from '@/components/dashboard/FotosSection';
import ScoreGaugeCard from '@/components/dashboard/ScoreGaugeCard';

type CpfLookupResult = Record<string, unknown>;
type ClientStatus = 'prioridade-alta' | 'prioridade-media' | 'prioridade-baixa' | 'em-andamento' | 'concluido';

interface ControlePessoalApiItem {
  id: number;
  titulo: string;
  descricao?: string | null;
  cliente_nome?: string | null;
  valor?: number | string | null;
  status?: string | null;
  data_referencia: string;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

interface SavedClient {
  id: string;
  title: string;
  createdAt: string;
  document?: string;
  moduleTitle?: string;
  consultationId?: number;
  manual?: boolean;
  phone?: string;
  email?: string;
  notes?: string;
  status?: ClientStatus;
}

const allowedModuleIds = [156, 155, 21, 83];

const moduleFallbackById: Record<number, { title: string; description: string; price: number }> = {
  156: { title: 'Módulo 156', description: 'Consulta CPF', price: 0 },
  155: { title: 'Módulo 155', description: 'Consulta CPF', price: 0 },
  21: { title: 'Módulo 21', description: 'Consulta CPF', price: 0 },
  83: { title: 'Módulo 83', description: 'Consulta CPF', price: 0 },
};

const clientStatusOptions: { label: string; value: ClientStatus; badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' }[] = [
  { label: 'Prioridade alta', value: 'prioridade-alta', badgeVariant: 'destructive' },
  { label: 'Prioridade média', value: 'prioridade-media', badgeVariant: 'default' },
  { label: 'Prioridade baixa', value: 'prioridade-baixa', badgeVariant: 'secondary' },
  { label: 'Em andamento', value: 'em-andamento', badgeVariant: 'outline' },
  { label: 'Concluído', value: 'concluido', badgeVariant: 'secondary' },
];

const getClientStatusMeta = (status?: string) =>
  clientStatusOptions.find((item) => item.value === status) || clientStatusOptions[1];

const resolvePhoto = (result: CpfLookupResult | null) => {
  if (!result) return '';
  const candidates = [
    result.foto,
    result.foto2,
    result.photo,
    result.photo2,
    result.photo3,
    result.photo4,
    result.foto_rosto_rg,
    result.foto_rosto_cnh,
  ];

  const first = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  return typeof first === 'string' ? first : '';
};

const normalizeCollection = (value: unknown): Array<Record<string, unknown>> => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== null && item !== undefined)
      .map((item) => (typeof item === 'object' ? (item as Record<string, unknown>) : { valor: item }));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeCollection(parsed);
      } catch {
        return [{ valor: trimmed }];
      }
    }

    return [{ valor: trimmed }];
  }

  if (typeof value === 'object') {
    return [value as Record<string, unknown>];
  }

  return [{ valor: String(value) }];
};

const labelFromKey = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) return value.length ? `${value.length} registro(s)` : '-';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  return String(value);
};

const formatDateTime = (date: string) =>
  new Date(date.includes('T') ? date : date.replace(' ', 'T')).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const normalizeModuleRoute = (rawValue?: string | null) => {
  if (!rawValue) return '';
  const cleaned = rawValue.trim();
  if (!cleaned) return '';
  if (cleaned.startsWith('/dashboard/')) return cleaned;
  if (cleaned.startsWith('dashboard/')) return `/${cleaned}`;
  if (cleaned.startsWith('/')) return `/dashboard${cleaned}`;
  return `/dashboard/${cleaned}`;
};

const extractDocument = (result: CpfLookupResult | null, fallback: string) => {
  const raw = typeof result?.cpf === 'string' ? result.cpf : fallback;
  return raw.replace(/\D/g, '').slice(0, 11);
};

const extractName = (result: CpfLookupResult | null) => {
  if (!result) return '';
  return typeof result.nome === 'string' ? result.nome.trim() : '';
};

const extractResultContact = (result: CpfLookupResult | null) => {
  if (!result) {
    return { phone: '', email: '' };
  }

  const phones = normalizeCollection(result.telefones);
  const emails = normalizeCollection(result.emails);

  const rawPhone =
    (typeof result.telefone === 'string' ? result.telefone : '') ||
    (typeof phones[0]?.telefone === 'string' ? phones[0].telefone : '') ||
    (typeof phones[0]?.numero === 'string' ? phones[0].numero : '');

  const rawEmail =
    (typeof result.email === 'string' ? result.email : '') ||
    (typeof result.email_pessoal === 'string' ? result.email_pessoal : '') ||
    (typeof emails[0]?.email === 'string' ? emails[0].email : '');

  return {
    phone: rawPhone ? formatPhone(rawPhone) : '',
    email: rawEmail,
  };
};

const SectionGrid = ({ title, icon, data }: { title: string; icon: React.ReactNode; data: Array<Record<string, unknown>> }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem dados retornados para esta seção.</p>
      ) : (
        <div className="space-y-3">
          {data.map((row, rowIndex) => (
            <div key={`${title}-${rowIndex}`} className="rounded-md border border-border p-3">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {Object.entries(row).map(([key, value]) => (
                  <div key={`${title}-${rowIndex}-${key}`}>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{labelFromKey(key)}</p>
                    <p className="text-sm break-words">{formatValue(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const ControlePessoalClientesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modules } = useApiModules();
  const modulesSectionRef = useRef<HTMLDivElement | null>(null);

  const [savedClients, setSavedClients] = useState<SavedClient[]>([]);
  const [consultations, setConsultations] = useState<ConsultaCpf[]>([]);
  const [selectedLookupModuleId, setSelectedLookupModuleId] = useState<number>(allowedModuleIds[0]);
  const [lookupDocument, setLookupDocument] = useState('');
  const [lookupResult, setLookupResult] = useState<CpfLookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [latestConsultationId, setLatestConsultationId] = useState<number | null>(null);
  const [isLookupSubmitting, setIsLookupSubmitting] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isLoadingSavedClients, setIsLoadingSavedClients] = useState(false);
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(false);
  const [selectedSavedClientId, setSelectedSavedClientId] = useState<string | null>(null);
  const [editingSavedClientId, setEditingSavedClientId] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    notes: '',
    status: 'prioridade-media' as ClientStatus,
  });

  const selectedModuleCards = useMemo(() => {
    return allowedModuleIds.map((moduleId) => {
      const module = modules.find((item) => Number(item.id) === moduleId);
      const fallback = moduleFallbackById[moduleId];

      return {
        id: moduleId,
        title: module?.title || fallback.title,
        description: module?.description || fallback.description,
        price: Number(module?.price ?? fallback.price),
      };
    });
  }, [modules]);

  const selectedLookupModule = useMemo(
    () => selectedModuleCards.find((module) => module.id === selectedLookupModuleId) || selectedModuleCards[0],
    [selectedLookupModuleId, selectedModuleCards]
  );

  const selectedLookupPrice = useMemo(() => {
    const rawPrice = Number(selectedLookupModule?.price ?? 0);
    return Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;
  }, [selectedLookupModule?.price]);

  const selectedLookupTitle = selectedLookupModule?.title || 'Consulta CPF';

  const resultDocument = useMemo(() => extractDocument(lookupResult, lookupDocument), [lookupResult, lookupDocument]);
  const resultName = useMemo(() => extractName(lookupResult), [lookupResult]);
  const resultPhoto = useMemo(() => resolvePhoto(lookupResult), [lookupResult]);

  const topScores = useMemo(() => {
    if (!lookupResult) {
      return {
        csb8: '-',
        csba: '-',
      };
    }

    return {
      csb8: formatValue(lookupResult.csb8),
      csba: formatValue(lookupResult.csba),
    };
  }, [lookupResult]);

  const structuredSections = useMemo(() => {
    if (!lookupResult) {
      return {
        dadosFinanceiros: [],
        dadosBasicos: [],
        telefones: [],
        emails: [],
        enderecos: [],
        parentes: [],
        dividasAtivas: [],
        operadoraClaro: [],
        operadoraVivo: [],
        operadoraTim: [],
        operadoraOi: [],
      };
    }

    const dadosFinanceiros = [
      {
        poder_aquisitivo: lookupResult.poder_aquisitivo,
        renda: lookupResult.renda,
        fx_poder_aquisitivo: lookupResult.fx_poder_aquisitivo,
        csb8: lookupResult.csb8,
        csba: lookupResult.csba,
        csb8_faixa: lookupResult.csb8_faixa,
        csba_faixa: lookupResult.csba_faixa,
      },
    ].filter((row) => Object.values(row).some((value) => value !== null && value !== undefined && value !== ''));

    const dadosBasicos = [
      {
        nome: lookupResult.nome,
        cpf: formatCpf(resultDocument),
        data_nascimento: lookupResult.data_nascimento,
        sexo: lookupResult.sexo,
        situacao_cpf: lookupResult.situacao_cpf,
        mae: lookupResult.mae,
        pai: lookupResult.pai,
        estado_civil: lookupResult.estado_civil,
        escolaridade: lookupResult.escolaridade,
      },
    ].filter((row) => Object.values(row).some((value) => value !== null && value !== undefined && value !== ''));

    return {
      dadosFinanceiros,
      dadosBasicos,
      telefones: normalizeCollection(lookupResult.telefones ?? lookupResult.telefone),
      emails: normalizeCollection(lookupResult.emails ?? lookupResult.email),
      enderecos: normalizeCollection(lookupResult.enderecos ?? lookupResult.endereco),
      parentes: normalizeCollection(lookupResult.parentes),
      dividasAtivas: normalizeCollection(lookupResult.dividas_ativas),
      operadoraClaro: normalizeCollection(lookupResult.operadora_claro),
      operadoraVivo: normalizeCollection(lookupResult.operadora_vivo),
      operadoraTim: normalizeCollection(lookupResult.operadora_tim),
      operadoraOi: normalizeCollection((lookupResult as Record<string, unknown>).operadora_oi),
    };
  }, [lookupResult, resultDocument]);

  const loadSavedClients = useCallback(async () => {
    if (!user?.id) {
      setSavedClients([]);
      return;
    }

    setIsLoadingSavedClients(true);
    try {
      const response = await apiRequest<any>('/controlepessoal-novocliente?limit=200&offset=0', { method: 'GET' });
      const items = Array.isArray(response?.data?.items) ? (response.data.items as ControlePessoalApiItem[]) : [];

      const mapped = items.map((item) => {
        const metadata = (item.metadata || {}) as Record<string, unknown>;
        return {
          id: String(item.id),
          title: item.titulo || item.cliente_nome || 'Cliente sem nome',
          createdAt: item.created_at,
          document: typeof metadata.document === 'string' ? metadata.document : undefined,
          moduleTitle: typeof metadata.module_title === 'string' ? metadata.module_title : undefined,
          consultationId: typeof metadata.consultation_id === 'number' ? metadata.consultation_id : undefined,
          manual: metadata.manual === true,
          phone: typeof metadata.phone === 'string' ? metadata.phone : undefined,
          email: typeof metadata.email === 'string' ? metadata.email : undefined,
          notes: item.descricao || undefined,
          status: ((item.status as ClientStatus) || 'prioridade-media'),
        } satisfies SavedClient;
      });

      setSavedClients(mapped);
    } catch (error) {
      console.error('Erro ao carregar clientes salvos:', error);
      toast.error('Não foi possível carregar a lista de clientes salvos.');
    } finally {
      setIsLoadingSavedClients(false);
    }
  }, [user?.id]);

  const loadConsultations = useCallback(async () => {
    if (!user?.id) {
      setConsultations([]);
      return;
    }

    setIsLoadingConsultations(true);
    try {
      const response = await consultasCpfService.getByUserId(Number(user.id), 1, 300);
      const history = Array.isArray(response?.data) ? (response.data as ConsultaCpf[]) : [];
      setConsultations(history);
    } catch (error) {
      console.error('Erro ao carregar histórico de consultas:', error);
      setConsultations([]);
    } finally {
      setIsLoadingConsultations(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void Promise.all([loadSavedClients(), loadConsultations()]);
  }, [loadSavedClients, loadConsultations]);

  const handleRunLookup = useCallback(async () => {
    const documentDigits = lookupDocument.replace(/\D/g, '').slice(0, 11);

    if (documentDigits.length !== 11) {
      toast.error('Informe um CPF válido com 11 dígitos.');
      return;
    }

    setIsLookupSubmitting(true);
    setLookupError(null);
    setShowManualForm(false);
    setLookupResult(null);
    setSelectedSavedClientId(null);

    try {
      const lookupResponse = await baseCpfService.getByCpf(documentDigits);

      if (!lookupResponse?.success || !lookupResponse?.data) {
        throw new Error(lookupResponse?.error || 'Nenhum dado encontrado para este CPF.');
      }

      setLookupResult(lookupResponse.data as unknown as CpfLookupResult);

      if (user?.id) {
        try {
          const consumptionResponse = await consultasCpfService.create({
            user_id: Number(user.id),
            module_type: selectedLookupTitle.toUpperCase(),
            document: documentDigits,
            cost: selectedLookupPrice,
            status: 'completed',
            result_data: lookupResponse.data,
            metadata: {
              source: 'controlepessoal-clientes',
              page_route: '/dashboard/controlepessoal-novocliente',
              module_title: selectedLookupTitle,
            },
          });

          const createdId = Number((consumptionResponse as any)?.data?.id);
          setLatestConsultationId(Number.isFinite(createdId) ? createdId : null);
          await loadConsultations();
        } catch (registerError) {
          console.error('Erro ao registrar consumo da consulta CPF:', registerError);
          toast.warning('Consulta realizada, mas não foi possível registrar o consumo automaticamente.');
        }
      }

      toast.success('Consulta finalizada com sucesso.');
    } catch (error) {
      console.error('Erro ao consultar CPF em Clientes:', error);
      const message = error instanceof Error ? error.message : 'Não foi possível consultar este CPF.';
      setLookupError(message);
      setShowManualForm(true);
      setManualForm((prev) => ({
        ...prev,
        document: formatCpf(documentDigits),
      }));
      toast.error(message);
    } finally {
      setIsLookupSubmitting(false);
    }
  }, [lookupDocument, loadConsultations, selectedLookupPrice, selectedLookupTitle, user?.id]);

  const handleSaveLookupClient = useCallback(async () => {
    if (!lookupResult) return;

    const name = extractName(lookupResult);
    const document = extractDocument(lookupResult, lookupDocument);

    if (!name) {
      toast.error('A consulta não retornou um nome válido para salvar.');
      return;
    }

    setIsSavingClient(true);

    try {
      const payload = {
        titulo: name,
        data_referencia: todayBrasilia(),
        descricao: `Cliente salvo via ${selectedLookupTitle}`,
        cliente_nome: name,
        valor: selectedLookupPrice,
        status: 'prioridade-media',
        metadata: {
          document: document ? formatCpf(document) : undefined,
          module_title: selectedLookupTitle,
          consultation_id: latestConsultationId,
          manual: false,
          source: 'consulta-cpf',
          saved_at: new Date().toISOString(),
          status: 'prioridade-media',
        },
      };

      const response = await apiRequest<any>('/controlepessoal-novocliente', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response?.success) {
        throw new Error(response?.error || 'Não foi possível salvar o cliente na lista.');
      }

      await loadSavedClients();
      toast.success('Cliente salvo na lista de clientes consultados.');
    } catch (error) {
      console.error('Erro ao salvar cliente da consulta:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar este cliente.');
    } finally {
      setIsSavingClient(false);
    }
  }, [latestConsultationId, loadSavedClients, lookupDocument, lookupResult, selectedLookupPrice, selectedLookupTitle]);

  const handleSaveManualClient = useCallback(async () => {
    const name = manualForm.name.trim();
    const documentDigits = manualForm.document.replace(/\D/g, '').slice(0, 11);

    if (!name) {
      toast.error('Informe ao menos o nome para cadastro manual.');
      return;
    }

    setIsSavingClient(true);

    try {
      const payload = {
        titulo: name,
        data_referencia: todayBrasilia(),
        descricao: manualForm.notes || 'Cadastro manual após consulta sem retorno.',
        cliente_nome: name,
        valor: 0,
        status: manualForm.status,
        metadata: {
          document: documentDigits ? formatCpf(documentDigits) : undefined,
          phone: manualForm.phone ? formatPhone(manualForm.phone) : undefined,
          email: manualForm.email || undefined,
          module_title: 'Cadastro Manual',
          manual: true,
          source: 'cadastro-manual',
          saved_at: new Date().toISOString(),
          status: manualForm.status,
        },
      };

      const response = await apiRequest<any>(editingSavedClientId ? `/controlepessoal-novocliente/${editingSavedClientId}` : '/controlepessoal-novocliente', {
        method: editingSavedClientId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      if (!response?.success) {
        throw new Error(response?.error || 'Não foi possível salvar o cadastro manual.');
      }

      await loadSavedClients();
      toast.success(editingSavedClientId ? 'Cliente atualizado com sucesso.' : 'Cliente salvo manualmente.');
      setManualForm({ name: '', document: '', phone: '', email: '', notes: '', status: 'prioridade-media' });
      setEditingSavedClientId(null);
      setShowManualForm(false);
    } catch (error) {
      console.error('Erro ao salvar cadastro manual:', error);
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar cadastro manual.');
    } finally {
      setIsSavingClient(false);
    }
  }, [editingSavedClientId, loadSavedClients, manualForm]);

  const handleDeleteSavedClient = useCallback(async (client: SavedClient) => {
    if (!window.confirm(`Excluir o cliente "${client.title}"?`)) return;

    try {
      const response = await apiRequest<any>(`/controlepessoal-novocliente/${client.id}`, { method: 'DELETE' });
      if (!response?.success) throw new Error(response?.error || 'Falha ao excluir cliente.');
      await loadSavedClients();
      if (selectedSavedClientId === client.id) {
        setSelectedSavedClientId(null);
      }
      toast.success('Cliente excluído com sucesso.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível excluir este cliente.');
    }
  }, [loadSavedClients, selectedSavedClientId]);

  const handleEditSavedClient = useCallback((client: SavedClient) => {
    setEditingSavedClientId(client.id);
    setSelectedSavedClientId(client.id);
    setShowManualForm(true);
    setLookupResult(null);
    setLookupDocument(client.document || '');
    setManualForm({
      name: client.title,
      document: client.document || '',
      phone: client.phone || '',
      email: client.email || '',
      notes: client.notes || '',
      status: client.status || 'prioridade-media',
    });
  }, []);

  const handleOpenSavedClient = useCallback(
    (client: SavedClient) => {
      setSelectedSavedClientId(client.id);
      setLookupError(null);

      if (client.manual) {
        setLookupResult(null);
        setLookupDocument(client.document || '');
        setShowManualForm(true);
        setManualForm((prev) => ({
          ...prev,
          name: client.title,
          document: client.document || '',
          phone: client.phone || '',
          email: client.email || '',
          notes: client.notes || '',
          status: client.status || 'prioridade-media',
        }));
        return;
      }

      const consultation = consultations.find((item) => {
        if (client.consultationId && Number(item.id) === client.consultationId) return true;

        const itemDocument = String(item.document || '').replace(/\D/g, '');
        const clientDocument = String(client.document || '').replace(/\D/g, '');
        return Boolean(itemDocument && clientDocument && itemDocument === clientDocument);
      });

      const resultData = consultation?.result_data;

      if (resultData && typeof resultData === 'object') {
        setLookupResult(resultData as CpfLookupResult);
        setLookupDocument(client.document || String(consultation?.document || ''));
        setShowManualForm(false);
      } else {
        setLookupResult(null);
        setLookupDocument(client.document || '');
        setShowManualForm(true);
        toast.warning('Não encontramos os dados completos da consulta para este cliente.');
      }
    },
    [consultations]
  );


  const resultHasSections = useMemo(
    () =>
      Boolean(
        lookupResult &&
          (structuredSections.dadosFinanceiros.length ||
            structuredSections.dadosBasicos.length ||
            structuredSections.telefones.length ||
            structuredSections.emails.length ||
            structuredSections.enderecos.length ||
            structuredSections.parentes.length ||
            structuredSections.dividasAtivas.length ||
            structuredSections.operadoraClaro.length ||
            structuredSections.operadoraVivo.length ||
            structuredSections.operadoraTim.length ||
            structuredSections.operadoraOi.length)
      ),
    [lookupResult, structuredSections]
  );

  return (
    <div className="space-y-6">
      <SimpleTitleBar
        title="Controle Pessoal • Clientes"
        subtitle="Consulte CPF, salve clientes pagos e use cadastro manual somente quando não houver retorno"
        icon={<Users className="h-5 w-5" />}
        right={(
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9"
            aria-label="Nova consulta de cliente"
            title="Nova consulta de cliente"
            onClick={() => modulesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
        onBack={() => navigate('/dashboard')}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <Card ref={modulesSectionRef}>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Escolha o módulo de consulta</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Primeiro consulte por CPF (simples ou puxa tudo), depois decida se deseja salvar na sua lista de clientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {selectedModuleCards.map((moduleCard) => {
                  const selected = selectedLookupModuleId === moduleCard.id;

                  return (
                    <button
                      key={moduleCard.id}
                      type="button"
                      onClick={() => setSelectedLookupModuleId(moduleCard.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${selected ? 'border-primary bg-accent/30' : 'border-border hover:bg-accent/20'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border bg-background px-2 text-xs font-semibold text-muted-foreground">
                            ID {moduleCard.id}
                          </span>
                          <div>
                            <p className="text-sm font-semibold md:text-base">{moduleCard.title}</p>
                            <p className="text-xs text-muted-foreground md:text-sm">{moduleCard.description}</p>
                          </div>
                        </div>
                        <Badge variant={selected ? 'default' : 'secondary'}>{formatCurrency(moduleCard.price || 0)}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="space-y-2">
                  <Label htmlFor="clients-lookup-cpf">CPF para consulta</Label>
                  <Input
                    id="clients-lookup-cpf"
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    maxLength={14}
                    value={lookupDocument}
                    onChange={(event) => setLookupDocument(formatCpf(event.target.value))}
                  />
                </div>
                <Button type="button" className="sm:self-end" onClick={() => void handleRunLookup()} disabled={isLookupSubmitting}>
                  {isLookupSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Consultar
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-md border border-border bg-muted/20 p-3 text-sm md:text-base">
                <p>
                  <span className="font-semibold">Módulo selecionado:</span> {selectedLookupTitle}
                </p>
                <p>
                  <span className="font-semibold">Valor da consulta:</span> {formatCurrency(selectedLookupPrice)}
                </p>
              </div>

              {lookupError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    Consulta sem retorno
                  </div>
                  <p className="mt-1">{lookupError}</p>
                  <p className="mt-1">Você pode cadastrar manualmente logo abaixo.</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {lookupResult ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Cliente encontrado</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Revise os dados retornados e escolha salvar ou fazer uma nova busca.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
                    <div className="flex items-center justify-center">
                      {resultPhoto ? (
                        <img
                          src={resultPhoto}
                          alt={`Foto de ${resultName || 'cliente consultado'}`}
                          className="h-20 w-20 rounded-full border border-border object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-border bg-muted/40">
                          <UserCircle className="h-10 w-10 text-muted-foreground" />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Nome</p>
                      <p className="text-sm font-semibold sm:text-base">{resultName || 'Não informado'}</p>
                      <p className="text-xs text-muted-foreground sm:text-sm">CPF: {resultDocument ? formatCpf(resultDocument) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">CSB8</p>
                      <p className="text-base font-semibold sm:text-lg">{topScores.csb8}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">CSBA</p>
                      <p className="text-base font-semibold sm:text-lg">{topScores.csba}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" onClick={() => void handleSaveLookupClient()} disabled={isSavingClient} className="w-full sm:w-auto">
                    {isSavingClient ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Salvar cliente
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setLookupResult(null);
                      setLookupError(null);
                      setShowManualForm(false);
                    }}
                    disabled={isSavingClient}
                  >
                    Nova busca
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {resultHasSections ? (
            <div className="space-y-4">
              <SectionGrid title="Dados Financeiros" icon={<Wallet className="h-4 w-4" />} data={structuredSections.dadosFinanceiros} />
              <SectionGrid title="Dados Básicos" icon={<Database className="h-4 w-4" />} data={structuredSections.dadosBasicos} />
              <SectionGrid title="Telefones" icon={<Phone className="h-4 w-4" />} data={structuredSections.telefones} />
              <SectionGrid title="Emails" icon={<Mail className="h-4 w-4" />} data={structuredSections.emails} />
              <SectionGrid title="Endereços" icon={<MapPin className="h-4 w-4" />} data={structuredSections.enderecos} />
              <SectionGrid title="Parentes" icon={<Heart className="h-4 w-4" />} data={structuredSections.parentes} />
              <SectionGrid title="Dívidas Ativas (SIDA)" icon={<AlertTriangle className="h-4 w-4" />} data={structuredSections.dividasAtivas} />
              <SectionGrid title="Operadora Claro" icon={<Smartphone className="h-4 w-4" />} data={structuredSections.operadoraClaro} />
              <SectionGrid title="Operadora Vivo" icon={<Smartphone className="h-4 w-4" />} data={structuredSections.operadoraVivo} />
              <SectionGrid title="Operadora TIM" icon={<Smartphone className="h-4 w-4" />} data={structuredSections.operadoraTim} />
              <SectionGrid title="Operadora OI" icon={<Smartphone className="h-4 w-4" />} data={structuredSections.operadoraOi} />
            </div>
          ) : null}

          {showManualForm ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Cadastro manual (fallback)</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Use apenas quando a consulta não retornar dados para o CPF pesquisado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="manual-name">Nome do cliente</Label>
                    <Input
                      id="manual-name"
                      placeholder="Ex.: Maria da Silva"
                      value={manualForm.name}
                      onChange={(event) => setManualForm((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-cpf">CPF</Label>
                    <Input
                      id="manual-cpf"
                      placeholder="000.000.000-00"
                      value={manualForm.document}
                      onChange={(event) => setManualForm((prev) => ({ ...prev, document: formatCpf(event.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-phone">Telefone</Label>
                    <Input
                      id="manual-phone"
                      placeholder="(11) 99999-9999"
                      value={manualForm.phone}
                      onChange={(event) => setManualForm((prev) => ({ ...prev, phone: formatPhone(event.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="manual-email">Email</Label>
                    <Input
                      id="manual-email"
                      type="email"
                      placeholder="cliente@email.com"
                      value={manualForm.email}
                      onChange={(event) => setManualForm((prev) => ({ ...prev, email: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-notes">Observações</Label>
                  <Textarea
                    id="manual-notes"
                    placeholder="Ex.: Não encontrado na base, cadastro feito manualmente para follow-up"
                    value={manualForm.notes}
                    onChange={(event) => setManualForm((prev) => ({ ...prev, notes: event.target.value }))}
                  />
                </div>
                <Button type="button" className="w-full sm:w-auto" onClick={() => void handleSaveManualClient()} disabled={isSavingClient}>
                  {isSavingClient ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar cadastro manual'
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Clientes salvos</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Lista dos clientes que você consultou e decidiu manter no painel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingSavedClients || isLoadingConsultations ? (
              <p className="text-sm text-muted-foreground">Carregando clientes...</p>
            ) : savedClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum cliente salvo até o momento.</p>
            ) : (
              savedClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleOpenSavedClient(client)}
                  className={`w-full rounded-md border p-3 text-left transition-colors ${selectedSavedClientId === client.id ? 'border-primary bg-accent/30' : 'border-border hover:bg-accent/20'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold sm:text-base">{client.title}</p>
                      <p className="text-xs text-muted-foreground sm:text-sm">{client.document || 'CPF não informado'}</p>
                      <p className="text-xs text-muted-foreground sm:text-sm">{client.moduleTitle || (client.manual ? 'Cadastro Manual' : 'Consulta CPF')}</p>
                    </div>
                    <Badge variant="secondary">{formatDateTime(client.createdAt)}</Badge>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ControlePessoalClientesPage;
