import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { pdfRgService, PdfRgPedido, PdfRgStatus } from '@/services/pdfRgService';
import { editarPdfService, EditarPdfPedido } from '@/services/pdfPersonalizadoService';
import { qrcodeRegistrationsService, type QrRegistration } from '@/services/qrcodeRegistrationsService';
import { Search, Eye, Trash2, RefreshCw, Download, Loader2, Upload, Package, DollarSign, Hammer, CheckCircle, X, FileEdit, Ban } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import QrCadastroCard from '@/components/qrcode/QrCadastroCard';
import { getFullApiUrl } from '@/utils/apiHelper';
import { cookieUtils } from '@/utils/cookieUtils';
import { moduleService, type Module as ApiModule } from '@/utils/apiService';
import { sistemasDominioComService, type SistemaDominioComRegistro } from '@/services/sistemasDominioComService';
import { sistemasDominioComBrService, type SistemaDominioComBrRegistro } from '@/services/sistemasDominioComBrService';
import { sistemasHospedagemVps1MesService, type SistemaHospedagemVps1MesRegistro } from '@/services/sistemasHospedagemVps1MesService';
import { sistemasHospedagemVps6Service, type SistemaHospedagemVps6Registro } from '@/services/sistemasHospedagemVps6Service';
import { sistemasHospedagemVps1AnoService, type SistemaHospedagemVps1AnoRegistro } from '@/services/sistemasHospedagemVps1AnoService';

type ActivePedidoStatus = Exclude<PdfRgStatus, 'cancelado'>;

const STATUS_ORDER: ActivePedidoStatus[] = ['realizado', 'pagamento_confirmado', 'em_confeccao', 'entregue'];

const statusLabels: Record<PdfRgStatus, string> = {
  realizado: 'Pedido Realizado',
  pagamento_confirmado: 'Pagamento Confirmado',
  em_confeccao: 'Em Confecção',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

const statusIcons: Record<PdfRgStatus, React.ReactNode> = {
  realizado: <Package className="h-5 w-5" />,
  pagamento_confirmado: <DollarSign className="h-5 w-5" />,
  em_confeccao: <Hammer className="h-5 w-5" />,
  entregue: <CheckCircle className="h-5 w-5" />,
  cancelado: <Ban className="h-5 w-5" />,
};

const statusColors: Record<PdfRgStatus, string> = {
  realizado: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  pagamento_confirmado: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  em_confeccao: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  entregue: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  cancelado: 'bg-destructive/10 text-destructive border-destructive/30',
};

type ModuleWorkflowStatus = 'registrado' | 'em_configuracao' | 'em_propagacao' | 'finalizado' | 'cancelado';

const getStepLabelByType = (pedidoType: UnifiedPedido['type'], step: ActivePedidoStatus) => {
  if (step === 'em_confeccao') {
    if (pedidoType === 'vps-6') return 'Em Configuração';
    if (pedidoType === 'dominio-com' || pedidoType === 'dominio-com-br') return 'Propagar Domínio';
    return statusLabels[step];
  }

  if (step === 'entregue') {
    if (pedidoType === 'vps-6') return 'Finalizado';
    if (pedidoType === 'dominio-com' || pedidoType === 'dominio-com-br') return 'Domínio Propagado';
  }

  return statusLabels[step];
};

const getStatusLabelByType = (pedidoType: UnifiedPedido['type'], status: PdfRgStatus): string => {
  if (pedidoType === 'dominio-com' || pedidoType === 'dominio-com-br') {
    if (status === 'em_confeccao') return 'Propagar Domínio';
    if (status === 'entregue') return 'Domínio Propagado';
  }

  return statusLabels[status] || status;
};

const mapModuleStatusToUnified = (pedidoType: UnifiedPedido['type'], status: ModuleWorkflowStatus): PdfRgStatus => {
  if (status === 'cancelado') return 'cancelado';
  if (status === 'finalizado') return 'entregue';

  if (pedidoType === 'vps-6' && status === 'em_configuracao') return 'em_confeccao';
  if (pedidoType === 'dominio-com' && status === 'em_propagacao') return 'em_confeccao';

  return 'pagamento_confirmado';
};

const mapUnifiedToModuleStatus = (pedidoType: UnifiedPedido['type'], status: PdfRgStatus): ModuleWorkflowStatus | null => {
  if (status === 'cancelado') return 'cancelado';
  if (status === 'entregue') return 'finalizado';
  if (status === 'em_confeccao') {
    if (pedidoType === 'vps-6') return 'em_configuracao';
    if (pedidoType === 'dominio-com') return 'em_propagacao';
  }
  if (status === 'pagamento_confirmado' || status === 'realizado') return 'registrado';

  return null;
};

const getModuleFilterStatus = (pedidoType: UnifiedPedido['type'], unifiedStatusFilter: string): ModuleWorkflowStatus | undefined => {
  if (unifiedStatusFilter === 'all') return undefined;
  if (unifiedStatusFilter === 'cancelado') return 'cancelado';
  if (unifiedStatusFilter === 'entregue') return 'finalizado';
  if (unifiedStatusFilter === 'em_confeccao') {
    if (pedidoType === 'vps-6') return 'em_configuracao';
    if (pedidoType === 'dominio-com') return 'em_propagacao';
    return undefined;
  }
  if (unifiedStatusFilter === 'pagamento_confirmado' || unifiedStatusFilter === 'realizado') return 'registrado';

  return undefined;
};

const resolveVpsServiceByDuration = (months?: number) => {
  if ((months || 0) <= 1) return sistemasHospedagemVps1MesService;
  if ((months || 0) >= 12) return sistemasHospedagemVps1AnoService;
  return sistemasHospedagemVps6Service;
};

const formatDateBR = (dateStr: string | null) => {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
};

const formatTime = (dateString: string | null) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const formatDateTime = (dateString?: string | null) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR');
};

const getStatusIndex = (status: PdfRgStatus) => status === 'cancelado' ? -1 : STATUS_ORDER.indexOf(status);

type VpsWorkflowRegistro = SistemaHospedagemVps1MesRegistro | SistemaHospedagemVps6Registro | SistemaHospedagemVps1AnoRegistro;

type UnifiedPedido = {
  type: 'pdf-rg' | 'pdf-personalizado' | 'dominio-com' | 'dominio-com-br' | 'vps-6';
  id: number;
  status: PdfRgStatus;
  label: string;
  sublabel: string;
  created_at: string;
  preco_pago: number;
  realizado_at: string | null;
  pagamento_confirmado_at: string | null;
  em_confeccao_at: string | null;
  entregue_at: string | null;
  plan_start_at?: string | null;
  plan_end_at?: string | null;
  pdf_entrega_nome?: string | null;
  raw_rg?: PdfRgPedido;
  raw_personalizado?: EditarPdfPedido;
  raw_dominio?: SistemaDominioComRegistro;
  raw_dominio_br?: SistemaDominioComBrRegistro;
  raw_vps?: VpsWorkflowRegistro;
};

type PedidoModuleConfig = {
  icon?: string;
  color?: string;
};

const getStepTimestamp = (pedido: UnifiedPedido, step: ActivePedidoStatus): string | null => {
  const map: Record<PdfRgStatus, string | null> = {
    realizado: pedido.realizado_at,
    pagamento_confirmado: pedido.pagamento_confirmado_at,
    em_confeccao: pedido.em_confeccao_at,
    entregue: pedido.entregue_at,
    cancelado: null,
  };
  return map[step];
};

const StatusProgressCircles = ({
  pedido,
  onClickStep,
  disabled,
}: {
  pedido: UnifiedPedido;
  onClickStep?: (step: PdfRgStatus) => void;
  disabled?: boolean;
}) => {
  if (pedido.status === 'cancelado') {
    return (
      <div className="w-full py-4">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-foreground flex items-center gap-2">
          <Ban className="h-4 w-4 text-destructive" />
          Pedido cancelado.
        </div>
      </div>
    );
  }

  const currentIdx = getStatusIndex(pedido.status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-[12%] right-[12%] h-1 bg-muted rounded-full" />
        <div
          className="absolute top-5 left-[12%] h-1 rounded-full transition-all duration-500 bg-emerald-500"
          style={{ width: `${Math.max(0, (currentIdx / 3) * 76)}%` }}
        />

        {STATUS_ORDER.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isActive = idx <= currentIdx;
          const isEmConfeccao = step === 'em_confeccao' && isCurrent;
          const canClick = onClickStep && step !== pedido.status && !disabled;
          const timestamp = getStepTimestamp(pedido, step);

          return (
            <div key={step} className="flex flex-col items-center z-10 flex-1">
              <button
                type="button"
                onClick={() => canClick && onClickStep?.(step)}
                disabled={!canClick}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted || (isCurrent && step === 'entregue')
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : isEmConfeccao
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 animate-pulse'
                    : isCurrent
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''} ${
                  canClick ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                }`}
              >
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : statusIcons[step]}
              </button>
              <span className={`text-[10px] mt-2 text-center leading-tight max-w-[80px] ${
                isActive
                  ? (isEmConfeccao ? 'text-blue-600 font-semibold' : 'text-emerald-600 font-semibold')
                  : 'text-muted-foreground'
              }`}>
                {getStepLabelByType(pedido.type, step)}
              </span>
              {timestamp && isActive && (
                <span className="text-[9px] text-muted-foreground mt-0.5">
                  {formatTime(timestamp)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState<UnifiedPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const urlParams = new URLSearchParams(window.location.search);
  const initialStatus = urlParams.get('status') || 'all';
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [selectedPedido, setSelectedPedido] = useState<UnifiedPedido | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingPdf, setDeletingPdf] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const [savingWorkflowIp, setSavingWorkflowIp] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [cancelingPedido, setCancelingPedido] = useState(false);
  const [qrCadastroSelecionado, setQrCadastroSelecionado] = useState<QrRegistration | null>(null);
  const [qrCadastroLoading, setQrCadastroLoading] = useState(false);
  const [workflowIp, setWorkflowIp] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [moduleConfigsByType, setModuleConfigsByType] = useState<Partial<Record<UnifiedPedido['type'], PedidoModuleConfig>>>({});

  const normalizeModuleRoute = useCallback((value?: string | null) => {
    const raw = (value || '').trim();
    if (!raw) return '';
    if (raw.startsWith('/')) return raw;
    if (raw.startsWith('dashboard/')) return `/${raw}`;
    return `/dashboard/${raw}`;
  }, []);

  const resolvePedidoModuleConfig = useCallback((modules: ApiModule[], pedidoType: UnifiedPedido['type']): PedidoModuleConfig => {
    const byType = {
      'pdf-rg': ['pdf-rg', 'pdf rg', 'rg pdf'],
      'pdf-personalizado': ['pdf-personalizado', 'pdf personalizado'],
      'dominio-com': ['sistemas-dominio-com', 'dominio-com', 'domínio .com'],
      'dominio-com-br': ['sistemas-dominio-com-br', 'dominio-com-br', 'domínio .com.br'],
      'vps-6': ['sistemas-hospedagem-vps-1', 'sistemas-hospedagem-vps-6', 'sistemas-hospedagem-vps-1a', 'hospedagem-vps-1', 'hospedagem-vps-6', 'hospedagem-vps-1a', 'vps 1 mês', 'vps 6 meses', 'vps 1 ano'],
    } as const;

    const candidates = byType[pedidoType] || [];

    const found = modules.find((module) => {
      const route = normalizeModuleRoute(module.api_endpoint || module.path || '');
      const haystack = [module.slug, module.name, module.title, route]
        .map((item) => (item || '').toLowerCase());

      return candidates.some((candidate) => haystack.some((value) => value.includes(candidate)));
    });

    return {
      icon: found?.icon,
      color: found?.color,
    };
  }, [normalizeModuleRoute]);

  useEffect(() => {
    let isMounted = true;

    const loadModulesConfig = async () => {
      const response = await moduleService.getAll();
      if (!isMounted || !response.success || !response.data) return;

      const nextConfigs: Partial<Record<UnifiedPedido['type'], PedidoModuleConfig>> = {
        'pdf-rg': resolvePedidoModuleConfig(response.data, 'pdf-rg'),
        'pdf-personalizado': resolvePedidoModuleConfig(response.data, 'pdf-personalizado'),
        'dominio-com': resolvePedidoModuleConfig(response.data, 'dominio-com'),
        'dominio-com-br': resolvePedidoModuleConfig(response.data, 'dominio-com-br'),
        'vps-6': resolvePedidoModuleConfig(response.data, 'vps-6'),
      };

      setModuleConfigsByType(nextConfigs);
    };

    loadModulesConfig();

    return () => {
      isMounted = false;
    };
  }, [resolvePedidoModuleConfig]);

  const loadQrCadastroByPedido = useCallback(async (pedido: PdfRgPedido) => {
    setQrCadastroLoading(true);
    setQrCadastroSelecionado(null);

    try {
      const pedidoCpf = qrcodeRegistrationsService.normalizeDigits(pedido.cpf || '');
      const pedidoPlano = (pedido.qr_plan || '1m') as '1m' | '3m' | '6m';

      const selecionarMatch = (registros: QrRegistration[]) => {
        const porCpf = registros.filter(
          (registro) => qrcodeRegistrationsService.normalizeDigits(registro.document_number || '') === pedidoCpf,
        );
        return porCpf.find((registro) => registro.inferred_plan === pedidoPlano) || porCpf[0] || null;
      };

      const registrosPorUsuario = await qrcodeRegistrationsService.list({
        limit: 100,
        ...(pedido.user_id ? { idUser: String(pedido.user_id) } : {}),
      });

      let match = selecionarMatch(registrosPorUsuario);

      if (!match && pedido.user_id) {
        const registrosGlobais = await qrcodeRegistrationsService.list({ limit: 100 });
        match = selecionarMatch(registrosGlobais);
      }

      setQrCadastroSelecionado(match);
    } catch {
      setQrCadastroSelecionado(null);
    } finally {
      setQrCadastroLoading(false);
    }
  }, []);

  const loadPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const results: UnifiedPedido[] = [];
      let totalCount = 0;

      // Fetch pdf-rg orders
      if (typeFilter === 'all' || typeFilter === 'pdf-rg') {
        const res = await pdfRgService.listar(params);
        if (res.success && res.data) {
          res.data.data.forEach((p: PdfRgPedido) => {
            results.push({
              type: 'pdf-rg',
              id: p.id,
              status: p.status,
              label: p.cpf,
              sublabel: p.nome || '',
              created_at: p.created_at,
              preco_pago: p.preco_pago,
              realizado_at: p.realizado_at,
              pagamento_confirmado_at: p.pagamento_confirmado_at,
              em_confeccao_at: p.em_confeccao_at,
              entregue_at: p.entregue_at,
              raw_rg: p,
            });
          });
          totalCount += res.data.pagination.total;
        }
      }

      // Fetch pdf-personalizado orders
      if (typeFilter === 'all' || typeFilter === 'pdf-personalizado') {
        const res2 = await editarPdfService.listar(params);
        if (res2.success && res2.data) {
          res2.data.data.forEach((p: EditarPdfPedido) => {
            results.push({
              type: 'pdf-personalizado',
              id: p.id,
              status: p.status,
              label: p.nome_solicitante,
              sublabel: p.descricao_alteracoes?.substring(0, 60) || '',
              created_at: p.created_at,
              preco_pago: p.preco_pago,
              realizado_at: p.realizado_at,
              pagamento_confirmado_at: p.pagamento_confirmado_at,
              em_confeccao_at: p.em_confeccao_at,
              entregue_at: p.entregue_at,
              raw_personalizado: p,
            });
          });
          totalCount += res2.data.pagination.total;
        }
      }

      // Fetch domínio/vps orders
      if (typeFilter === 'all' || typeFilter === 'dominio-com') {
        const domainStatusFilter = getModuleFilterStatus('dominio-com', statusFilter);
        const res3 = await sistemasDominioComService.listAdmin({
          limit: 50,
          offset: 0,
          ...(search ? { search } : {}),
          ...(domainStatusFilter
            ? { status: domainStatusFilter as 'registrado' | 'em_propagacao' | 'finalizado' | 'cancelado' }
            : {}),
        });

        if (res3.success && res3.data) {
          res3.data.data.forEach((d: SistemaDominioComRegistro) => {
            const mappedStatus = mapModuleStatusToUnified('dominio-com', d.status as ModuleWorkflowStatus);
            const statusTimestamp = d.updated_at || d.created_at;

            results.push({
              type: 'dominio-com',
              id: d.id,
              status: mappedStatus,
              label: d.dominio_completo,
              sublabel: `Solicitante: ${d.nome_solicitante}`,
              created_at: d.created_at,
              preco_pago: Number(d.valor_cobrado || 0),
              realizado_at: d.created_at,
              pagamento_confirmado_at: d.status === 'cancelado' ? null : d.created_at,
              em_confeccao_at: mappedStatus === 'em_confeccao' || mappedStatus === 'entregue' ? statusTimestamp : null,
              entregue_at: mappedStatus === 'entregue' ? statusTimestamp : null,
              raw_dominio: d,
            });
          });
          totalCount += res3.data.pagination.total;
        }
      }

      if (typeFilter === 'all' || typeFilter === 'dominio-com-br') {
        const res4 = await sistemasDominioComBrService.listAdmin({
          limit: 50,
          offset: 0,
          ...(search ? { search } : {}),
          ...(statusFilter === 'cancelado' ? { status: 'cancelado' } : {}),
        });

        if (res4.success && res4.data) {
          res4.data.data.forEach((d: SistemaDominioComBrRegistro) => {
            const mappedStatus: PdfRgStatus = d.status === 'cancelado' ? 'cancelado' : 'pagamento_confirmado';
            results.push({
              type: 'dominio-com-br',
              id: d.id,
              status: mappedStatus,
              label: d.dominio_completo,
              sublabel: `Solicitante: ${d.nome_solicitante}`,
              created_at: d.created_at,
              preco_pago: Number(d.valor_cobrado || 0),
              realizado_at: d.created_at,
              pagamento_confirmado_at: d.status === 'cancelado' ? null : d.created_at,
              em_confeccao_at: null,
              entregue_at: null,
              raw_dominio_br: d,
            });
          });
          totalCount += res4.data.pagination.total;
        }
      }

      if (typeFilter === 'all' || typeFilter === 'vps-6') {
        const vpsStatusFilter = getModuleFilterStatus('vps-6', statusFilter);
        const vpsParams = {
          limit: 50,
          offset: 0,
          ...(search ? { search } : {}),
          ...(vpsStatusFilter
            ? { status: vpsStatusFilter as 'registrado' | 'em_configuracao' | 'finalizado' | 'cancelado' }
            : {}),
        };

        const [resVps1Mes, resVps6, resVps1Ano] = await Promise.all([
          sistemasHospedagemVps1MesService.listAdmin(vpsParams),
          sistemasHospedagemVps6Service.listAdmin(vpsParams),
          sistemasHospedagemVps1AnoService.listAdmin(vpsParams),
        ]);

        const appendVpsResult = (vps: VpsWorkflowRegistro) => {
          const mappedStatus = mapModuleStatusToUnified('vps-6', vps.status as ModuleWorkflowStatus);
          const statusTimestamp = vps.updated_at || vps.created_at;

          results.push({
            type: 'vps-6',
            id: vps.id,
            status: mappedStatus,
            label: vps.nome_instancia,
            sublabel: `IP: ${vps.ip_vps?.trim() ? vps.ip_vps : 'pendente'}`,
            created_at: vps.created_at,
            preco_pago: Number(vps.valor_cobrado || 0),
            realizado_at: vps.created_at,
            pagamento_confirmado_at: vps.status === 'cancelado' ? null : vps.created_at,
            em_confeccao_at: mappedStatus === 'em_confeccao' || mappedStatus === 'entregue' ? statusTimestamp : null,
            entregue_at: mappedStatus === 'entregue' ? statusTimestamp : null,
            plan_start_at: vps.plan_start_at,
            plan_end_at: vps.plan_end_at,
            raw_vps: vps,
          });
        };

        if (resVps1Mes.success && resVps1Mes.data) {
          resVps1Mes.data.data.forEach(appendVpsResult);
          totalCount += resVps1Mes.data.pagination.total;
        }

        if (resVps6.success && resVps6.data) {
          resVps6.data.data.forEach(appendVpsResult);
          totalCount += resVps6.data.pagination.total;
        }

        if (resVps1Ano.success && resVps1Ano.data) {
          resVps1Ano.data.data.forEach(appendVpsResult);
          totalCount += resVps1Ano.data.pagination.total;
        }
      }

      // Sort by created_at desc
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPedidos(results);
      setTotal(totalCount);
    } catch (e) {
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  const handleViewDetail = async (pedido: UnifiedPedido) => {
    setDetailLoading(true);
    setPdfFile(null);
    try {
      if (pedido.type === 'pdf-rg') {
        const res = await pdfRgService.obter(pedido.id);
        if (res.success && res.data) {
          setSelectedPedido({
            ...pedido,
            pdf_entrega_nome: res.data.pdf_entrega_nome || null,
            raw_rg: res.data,
          });
          await loadQrCadastroByPedido(res.data);
        } else {
          toast.error('Erro ao carregar detalhes');
          setQrCadastroSelecionado(null);
        }
      } else if (pedido.type === 'pdf-personalizado') {
        const res = await editarPdfService.obter(pedido.id);
        if (res.success && res.data) {
          setSelectedPedido({
            ...pedido,
            pdf_entrega_nome: res.data.pdf_entrega_nome || null,
            raw_personalizado: res.data,
          });
        } else {
          toast.error('Erro ao carregar detalhes');
        }
        setQrCadastroSelecionado(null);
      } else if (pedido.type === 'vps-6') {
        const vpsService = resolveVpsServiceByDuration(pedido.raw_vps?.duracao_meses);
        const res = await vpsService.getById(pedido.id);

        if (res.success && res.data) {
          setSelectedPedido({
            ...pedido,
            raw_vps: res.data,
            plan_start_at: res.data.plan_start_at,
            plan_end_at: res.data.plan_end_at,
          });
          setWorkflowIp(res.data.ip_vps || '');
        } else {
          setSelectedPedido(pedido);
          setWorkflowIp(pedido.raw_vps?.ip_vps || '');
        }

        setQrCadastroSelecionado(null);
      } else {
        setSelectedPedido(pedido);
        setWorkflowIp('');
        setQrCadastroSelecionado(null);
      }
    } catch (e) {
      toast.error('Erro ao carregar detalhes');
    } finally {
      setDetailLoading(false);
    }
  };

  const sendNotification = async (userId: number | null, pedidoId: number, newStatus: PdfRgStatus, pedidoType: string) => {
    if (!userId) return;
    try {
      const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
      const typeLabel = pedidoType === 'pdf-personalizado' ? 'PDF Personalizado' : 'PDF RG';
      await fetch(getFullApiUrl('/notifications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          user_id: userId,
          type: 'pedido_status',
          title: `${typeLabel} #${pedidoId} - ${getStatusLabelByType(pedidoType as UnifiedPedido['type'], newStatus)}`,
          message: `Seu pedido ${typeLabel} #${pedidoId} teve o status atualizado para: ${getStatusLabelByType(pedidoType as UnifiedPedido['type'], newStatus)}.${newStatus === 'entregue' ? ' O arquivo PDF está disponível para download.' : ''}`, 
          priority: newStatus === 'entregue' ? 'high' : 'medium',
        }),
      });
    } catch (e) {
      console.error('Erro ao enviar notificação:', e);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsDataURL(file);
    });

  const handleUpdateStatus = async (newStatus: PdfRgStatus) => {
    if (!selectedPedido) return;

    const isPdfPedido = selectedPedido.type === 'pdf-rg' || selectedPedido.type === 'pdf-personalizado';
    const isWorkflowPedido = selectedPedido.type === 'dominio-com' || selectedPedido.type === 'vps-6';

    if (!isPdfPedido && !isWorkflowPedido) {
      toast.info('Para este tipo de pedido, apenas o cancelamento está disponível neste painel.');
      return;
    }

    if (isPdfPedido && newStatus === 'entregue' && !pdfFile && !getExistingPdfNome()) {
      toast.error('É obrigatório enviar o arquivo PDF para marcar como Entregue.');
      return;
    }

    if (selectedPedido.type === 'vps-6' && newStatus === 'entregue' && !workflowIp.trim()) {
      toast.error('Informe o IP da VPS antes de finalizar o pedido.');
      return;
    }

    setUpdatingStatus(true);
    try {
      const extraData: any = {};

      if (isPdfPedido && pdfFile) {
        const base64 = await fileToBase64(pdfFile);
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        const fileName = `${selectedPedido.id}_${dateStr}.pdf`;
        extraData.pdf_entrega_base64 = base64;
        extraData.pdf_entrega_nome = fileName;
      }

      let res: any;

      if (selectedPedido.type === 'pdf-rg') {
        res = await pdfRgService.atualizarStatus(selectedPedido.id, newStatus, Object.keys(extraData).length > 0 ? extraData : undefined);
      } else if (selectedPedido.type === 'pdf-personalizado') {
        res = await editarPdfService.atualizarStatus(selectedPedido.id, newStatus, Object.keys(extraData).length > 0 ? extraData : undefined);
      } else if (selectedPedido.type === 'vps-6') {
        const targetStatus = mapUnifiedToModuleStatus(selectedPedido.type, newStatus);
        if (!targetStatus || targetStatus === 'cancelado' || targetStatus === 'em_propagacao') {
          toast.error('Status inválido para VPS');
          return;
        }

        const vpsService = resolveVpsServiceByDuration(selectedPedido.raw_vps?.duracao_meses);
        res = await vpsService.updateStatusByAdmin(selectedPedido.id, {
          status: targetStatus,
          ...(workflowIp.trim() ? { ip_vps: workflowIp.trim() } : {}),
        });
      } else if (selectedPedido.type === 'dominio-com') {
        const targetStatus = mapUnifiedToModuleStatus(selectedPedido.type, newStatus);
        if (!targetStatus || targetStatus === 'cancelado' || targetStatus === 'em_configuracao') {
          toast.error('Status inválido para Domínio .COM');
          return;
        }

        res = await sistemasDominioComService.updateStatusByAdmin(selectedPedido.id, {
          status: targetStatus,
        });
      }

      if (res?.success) {
        toast.success(`Status atualizado para: ${getStepLabelByType(selectedPedido.type, newStatus as ActivePedidoStatus)}`);

        if (selectedPedido.type === 'pdf-rg' || selectedPedido.type === 'pdf-personalizado') {
          const userId = selectedPedido.type === 'pdf-rg'
            ? selectedPedido.raw_rg?.user_id
            : selectedPedido.raw_personalizado?.user_id;
          await sendNotification(userId || null, selectedPedido.id, newStatus, selectedPedido.type);
          setPdfFile(null);
        }

        await loadPedidos();

        if (selectedPedido.type === 'pdf-rg') {
          const detail = await pdfRgService.obter(selectedPedido.id);
          if (detail.success && detail.data) {
            setSelectedPedido(prev => prev ? {
              ...prev,
              status: detail.data.status,
              realizado_at: detail.data.realizado_at,
              pagamento_confirmado_at: detail.data.pagamento_confirmado_at,
              em_confeccao_at: detail.data.em_confeccao_at,
              entregue_at: detail.data.entregue_at,
              raw_rg: detail.data,
            } : null);
          }
        } else if (selectedPedido.type === 'pdf-personalizado') {
          const detail = await editarPdfService.obter(selectedPedido.id);
          if (detail.success && detail.data) {
            setSelectedPedido(prev => prev ? {
              ...prev,
              status: detail.data.status,
              realizado_at: detail.data.realizado_at,
              pagamento_confirmado_at: detail.data.pagamento_confirmado_at,
              em_confeccao_at: detail.data.em_confeccao_at,
              entregue_at: detail.data.entregue_at,
              raw_personalizado: detail.data,
            } : null);
          }
        } else if (selectedPedido.type === 'vps-6' && res.data) {
          const vps = res.data as SistemaHospedagemVps6Registro;
          const mappedStatus = mapModuleStatusToUnified('vps-6', vps.status as ModuleWorkflowStatus);
          const statusTimestamp = vps.updated_at || vps.created_at;
          setWorkflowIp(vps.ip_vps || '');
          setSelectedPedido(prev => prev ? {
            ...prev,
            status: mappedStatus,
            sublabel: `IP: ${vps.ip_vps?.trim() ? vps.ip_vps : 'pendente'}`,
            pagamento_confirmado_at: vps.status === 'cancelado' ? null : vps.created_at,
            em_confeccao_at: mappedStatus === 'em_confeccao' || mappedStatus === 'entregue' ? statusTimestamp : null,
            entregue_at: mappedStatus === 'entregue' ? statusTimestamp : null,
            plan_start_at: vps.plan_start_at,
            plan_end_at: vps.plan_end_at,
            raw_vps: vps,
          } : null);
        } else if (selectedPedido.type === 'dominio-com' && res.data) {
          const domain = res.data as SistemaDominioComRegistro;
          const mappedStatus = mapModuleStatusToUnified('dominio-com', domain.status as ModuleWorkflowStatus);
          const statusTimestamp = domain.updated_at || domain.created_at;
          setSelectedPedido(prev => prev ? {
            ...prev,
            status: mappedStatus,
            pagamento_confirmado_at: domain.status === 'cancelado' ? null : domain.created_at,
            em_confeccao_at: mappedStatus === 'em_confeccao' || mappedStatus === 'entregue' ? statusTimestamp : null,
            entregue_at: mappedStatus === 'entregue' ? statusTimestamp : null,
            raw_dominio: domain,
          } : null);
        }
      } else {
        toast.error(res?.error || 'Erro ao atualizar status');
      }
    } catch {
      toast.error('Erro ao atualizar status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveWorkflowIp = async () => {
    if (!selectedPedido || selectedPedido.type !== 'vps-6') return;
    const targetStatus = mapUnifiedToModuleStatus(selectedPedido.type, selectedPedido.status);
    if (!targetStatus || targetStatus === 'cancelado' || targetStatus === 'em_propagacao') return;

    setSavingWorkflowIp(true);
    try {
      const vpsService = resolveVpsServiceByDuration(selectedPedido.raw_vps?.duracao_meses);
      const res = await vpsService.updateStatusByAdmin(selectedPedido.id, {
        status: targetStatus,
        ip_vps: workflowIp.trim(),
      });

      if (!res.success || !res.data) {
        toast.error(res.error || 'Erro ao salvar IP da VPS');
        return;
      }

      const vps = res.data;
      const mappedStatus = mapModuleStatusToUnified('vps-6', vps.status as ModuleWorkflowStatus);
      const statusTimestamp = vps.updated_at || vps.created_at;

      setWorkflowIp(vps.ip_vps || '');
      setSelectedPedido((prev) => prev ? {
        ...prev,
        status: mappedStatus,
        sublabel: `IP: ${vps.ip_vps?.trim() ? vps.ip_vps : 'pendente'}`,
        pagamento_confirmado_at: vps.status === 'cancelado' ? null : vps.created_at,
        em_confeccao_at: mappedStatus === 'em_confeccao' || mappedStatus === 'entregue' ? statusTimestamp : null,
        entregue_at: mappedStatus === 'entregue' ? statusTimestamp : null,
        plan_start_at: vps.plan_start_at,
        plan_end_at: vps.plan_end_at,
        raw_vps: vps,
      } : null);

      setPedidos((prev) => prev.map((item) => (
        item.type === 'vps-6' && item.id === selectedPedido.id
          ? {
              ...item,
              sublabel: `IP: ${vps.ip_vps?.trim() ? vps.ip_vps : 'pendente'}`,
              plan_start_at: vps.plan_start_at,
              plan_end_at: vps.plan_end_at,
              raw_vps: vps,
            }
          : item
      )));

      toast.success('IP da VPS salvo com sucesso');
    } catch {
      toast.error('Erro ao salvar IP da VPS');
    } finally {
      setSavingWorkflowIp(false);
    }
  };

  const getExistingPdfNome = () => {
    if (!selectedPedido) return null;
    // Check unified field first (updated after save), then raw data
    if (selectedPedido.pdf_entrega_nome) return selectedPedido.pdf_entrega_nome;
    if (selectedPedido.type === 'pdf-rg') return selectedPedido.raw_rg?.pdf_entrega_nome;
    return selectedPedido.raw_personalizado?.pdf_entrega_nome;
  };

  const getExistingPdfBase64 = () => {
    if (!selectedPedido) return null;
    if (selectedPedido.type === 'pdf-rg') return selectedPedido.raw_rg?.pdf_entrega_base64;
    return selectedPedido.raw_personalizado?.pdf_entrega_base64;
  };

  const handleDeletePdf = async () => {
    if (!selectedPedido) return;
    if (!confirm('Tem certeza que deseja excluir o PDF? O pedido voltará para Em Confecção (produção).')) return;

    setDeletingPdf(true);
    try {
      const targetStatus: PdfRgStatus = 'em_confeccao';
      const extraData = { remove_pdf: true };

      const res = selectedPedido.type === 'pdf-rg'
        ? await pdfRgService.atualizarStatus(selectedPedido.id, targetStatus, extraData)
        : await editarPdfService.atualizarStatus(selectedPedido.id, targetStatus, extraData);

      if (res.success) {
        toast.success('PDF excluído e pedido retornado para Em Confecção.');

        if (selectedPedido.type === 'pdf-rg') {
          const detail = await pdfRgService.obter(selectedPedido.id);
          if (detail.success && detail.data) {
            setSelectedPedido(prev => prev ? {
              ...prev,
              status: detail.data.status,
              pdf_entrega_nome: detail.data.pdf_entrega_nome || null,
              realizado_at: detail.data.realizado_at,
              pagamento_confirmado_at: detail.data.pagamento_confirmado_at,
              em_confeccao_at: detail.data.em_confeccao_at,
              entregue_at: detail.data.entregue_at,
              raw_rg: detail.data,
            } : null);
          }
        } else {
          const detail = await editarPdfService.obter(selectedPedido.id);
          if (detail.success && detail.data) {
            setSelectedPedido(prev => prev ? {
              ...prev,
              status: detail.data.status,
              pdf_entrega_nome: detail.data.pdf_entrega_nome || null,
              realizado_at: detail.data.realizado_at,
              pagamento_confirmado_at: detail.data.pagamento_confirmado_at,
              em_confeccao_at: detail.data.em_confeccao_at,
              entregue_at: detail.data.entregue_at,
              raw_personalizado: detail.data,
            } : null);
          }
        }

        setPdfFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadPedidos();
      } else {
        toast.error(res.error || 'Erro ao excluir PDF');
      }
    } catch {
      toast.error('Erro ao excluir PDF');
    } finally {
      setDeletingPdf(false);
    }
  };

  const handleSavePdf = async () => {
    if (!selectedPedido || !pdfFile) return;
    setSavingPdf(true);
    try {
      const base64 = await fileToBase64(pdfFile);
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const fileName = `${selectedPedido.id}_${dateStr}.pdf`;
      const extraData = { pdf_entrega_base64: base64, pdf_entrega_nome: fileName };

      let res;
      if (selectedPedido.type === 'pdf-rg') {
        res = await pdfRgService.atualizarStatus(selectedPedido.id, selectedPedido.status, extraData);
      } else {
        res = await editarPdfService.atualizarStatus(selectedPedido.id, selectedPedido.status, extraData);
      }

      if (res.success) {
        toast.success('PDF de entrega salvo com sucesso!');
        // Re-fetch detail and update selectedPedido with new pdf name
        if (selectedPedido.type === 'pdf-rg') {
          const detail = await pdfRgService.obter(selectedPedido.id);
          if (detail.success && detail.data) {
            setSelectedPedido(prev => prev ? { ...prev, pdf_entrega_nome: detail.data!.pdf_entrega_nome || fileName, raw_rg: detail.data! } : null);
          } else {
            setSelectedPedido(prev => prev ? { ...prev, pdf_entrega_nome: fileName } : null);
          }
        } else {
          const detail = await editarPdfService.obter(selectedPedido.id);
          if (detail.success && detail.data) {
            setSelectedPedido(prev => prev ? { ...prev, pdf_entrega_nome: detail.data!.pdf_entrega_nome || fileName, raw_personalizado: detail.data! } : null);
          } else {
            setSelectedPedido(prev => prev ? { ...prev, pdf_entrega_nome: fileName } : null);
          }
        }
        setPdfFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadPedidos();
      } else {
        toast.error(res.error || 'Erro ao salvar PDF');
      }
    } catch {
      toast.error('Erro ao salvar PDF');
    } finally {
      setSavingPdf(false);
    }
  };

  const deletePedidoPermanente = async (pedido: UnifiedPedido) => {
    if (!confirm('Tem certeza que deseja excluir este pedido permanentemente?')) return false;

    let res;
    if (pedido.type === 'pdf-rg') {
      res = await pdfRgService.deletar(pedido.id);
    } else if (pedido.type === 'pdf-personalizado') {
      res = await editarPdfService.deletar(pedido.id);
    } else if (pedido.type === 'dominio-com') {
      res = await sistemasDominioComService.deleteByAdmin(pedido.id);
    } else if (pedido.type === 'dominio-com-br') {
      res = await sistemasDominioComBrService.deleteByAdmin(pedido.id);
    } else {
      const vpsService = resolveVpsServiceByDuration(pedido.raw_vps?.duracao_meses);
      res = await vpsService.deleteByAdmin(pedido.id);
    }

    if (!res?.success) {
      toast.error(res?.error || 'Erro ao excluir pedido');
      return false;
    }

    toast.success('Pedido excluído permanentemente com sucesso');
    if (selectedPedido?.id === pedido.id && selectedPedido?.type === pedido.type) {
      setSelectedPedido(null);
    }
    await loadPedidos();
    return true;
  };

  const handleDelete = async (pedido: UnifiedPedido) => {
    try {
      await deletePedidoPermanente(pedido);
    } catch {
      toast.error('Erro ao excluir pedido');
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx 20MB)');
      return;
    }
    setPdfFile(file);
  };

  const getVpsLabel = (pedido: Pick<UnifiedPedido, 'type' | 'raw_vps'>) => {
    if (pedido.type !== 'vps-6') return '';
    const months = Number(pedido.raw_vps?.duracao_meses || 6);
    if (months >= 12) return 'VPS 1 ANO';
    if (months <= 1) return 'VPS 1 MÊS';
    return 'VPS 6 MESES';
  };

  const typeLabel = (pedido: Pick<UnifiedPedido, 'type' | 'raw_vps'>) => {
    if (pedido.type === 'pdf-rg') return 'PDF RG';
    if (pedido.type === 'pdf-personalizado') return 'PDF Personalizado';
    if (pedido.type === 'dominio-com') return 'DOMÍNIO .COM';
    if (pedido.type === 'dominio-com-br') return 'DOMÍNIO .COM.BR';
    return getVpsLabel(pedido);
  };

  const getPedidoTypeBadgeClass = (pedidoType: UnifiedPedido['type']) => {
    if (pedidoType === 'pdf-personalizado') return 'bg-violet-500/10 text-violet-600 border-violet-500/30';
    if (pedidoType === 'dominio-com' || pedidoType === 'dominio-com-br') return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    if (pedidoType === 'vps-6') return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30';
    return 'bg-sky-500/10 text-sky-600 border-sky-500/30';
  };

  const getPedidoModuleIcon = (pedido: Pick<UnifiedPedido, 'type'>): React.ElementType | null => {
    const iconName = moduleConfigsByType[pedido.type]?.icon;
    if (!iconName) return null;

    const iconsMap = LucideIcons as unknown as Record<string, React.ElementType>;
    return iconsMap[iconName] || null;
  };

  const getPedidoModuleColor = (pedidoType: UnifiedPedido['type']) => {
    return moduleConfigsByType[pedidoType]?.color;
  };

  const canCancelPedido = (status: PdfRgStatus) => !['entregue', 'cancelado'].includes(status);

  const handleCancelPedido = async (pedido: UnifiedPedido | null) => {
    if (!pedido || !canCancelPedido(pedido.status)) return;

    setCancelingPedido(true);
    try {
      await deletePedidoPermanente(pedido);
    } catch {
      toast.error('Erro ao excluir pedido');
    } finally {
      setCancelingPedido(false);
    }
  };

  const renderDetailContent = () => {
    if (!selectedPedido) return null;

    if (selectedPedido.type === 'pdf-rg' && selectedPedido.raw_rg) {
      const p = selectedPedido.raw_rg;
      return (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">CPF:</span> {p.cpf}</div>
          <div><span className="text-muted-foreground">Nome:</span> {p.nome || '—'}</div>
          <div><span className="text-muted-foreground">Nascimento:</span> {formatDateBR(p.dt_nascimento)}</div>
          <div><span className="text-muted-foreground">Naturalidade:</span> {p.naturalidade || '—'}</div>
          <div><span className="text-muted-foreground">Mãe:</span> {p.filiacao_mae || '—'}</div>
          <div><span className="text-muted-foreground">Pai:</span> {p.filiacao_pai || '—'}</div>
          <div><span className="text-muted-foreground">Preço:</span> R$ {Number(p.preco_pago || 0).toFixed(2)}</div>
          <div>
            <span className="text-muted-foreground">Status:</span>{' '}
            <Badge variant="outline" className={statusColors[p.status] || ''}>
              {statusLabels[p.status] || p.status}
            </Badge>
          </div>
        </div>
      );
    }

    if (selectedPedido.type === 'pdf-personalizado' && selectedPedido.raw_personalizado) {
      const p = selectedPedido.raw_personalizado;
      return (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Solicitante:</span> {p.nome_solicitante}</div>
          <div><span className="text-muted-foreground">Preço:</span> R$ {Number(p.preco_pago || 0).toFixed(2)}</div>
          <div className="col-span-2"><span className="text-muted-foreground">Descrição:</span> {p.descricao_alteracoes}</div>
          <div>
            <span className="text-muted-foreground">Status:</span>{' '}
            <Badge variant="outline" className={statusColors[p.status] || ''}>
              {statusLabels[p.status] || p.status}
            </Badge>
          </div>
        </div>
      );
    }

    if (selectedPedido.type === 'dominio-com' && selectedPedido.raw_dominio) {
      const p = selectedPedido.raw_dominio;
      return (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Domínio:</span> {p.dominio_completo}</div>
          <div><span className="text-muted-foreground">Solicitante:</span> {p.nome_solicitante}</div>
          <div><span className="text-muted-foreground">Valor:</span> R$ {Number(p.valor_cobrado || 0).toFixed(2)}</div>
          <div><span className="text-muted-foreground">Desconto:</span> R$ {Number(p.desconto_aplicado || 0).toFixed(2)}</div>
          <div><span className="text-muted-foreground">Saldo usado:</span> {p.saldo_usado}</div>
          <div><span className="text-muted-foreground">Status:</span> {p.status}</div>
        </div>
      );
    }

    if (selectedPedido.type === 'dominio-com-br' && selectedPedido.raw_dominio_br) {
      const p = selectedPedido.raw_dominio_br;
      return (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Domínio:</span> {p.dominio_completo}</div>
          <div><span className="text-muted-foreground">Solicitante:</span> {p.nome_solicitante}</div>
          <div><span className="text-muted-foreground">Valor:</span> R$ {Number(p.valor_cobrado || 0).toFixed(2)}</div>
          <div><span className="text-muted-foreground">Desconto:</span> R$ {Number(p.desconto_aplicado || 0).toFixed(2)}</div>
          <div><span className="text-muted-foreground">Saldo usado:</span> {p.saldo_usado}</div>
          <div><span className="text-muted-foreground">Status:</span> {p.status}</div>
        </div>
      );
    }

    if (selectedPedido.type === 'vps-6' && selectedPedido.raw_vps) {
      const p = selectedPedido.raw_vps;
      return (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Instância:</span> {p.nome_instancia}</div>
          <div><span className="text-muted-foreground">Solicitante:</span> {p.nome_solicitante}</div>
          <div><span className="text-muted-foreground">IP:</span> {p.ip_vps || '—'}</div>
          <div><span className="text-muted-foreground">Linux:</span> {p.configuracao_linux}</div>
          <div><span className="text-muted-foreground">Duração:</span> {p.duracao_meses} meses</div>
          <div><span className="text-muted-foreground">Início do plano:</span> {formatDateTime(p.plan_start_at)}</div>
          <div><span className="text-muted-foreground">Término do plano:</span> {formatDateTime(p.plan_end_at)}</div>
          <div><span className="text-muted-foreground">Valor:</span> R$ {Number(p.valor_cobrado || 0).toFixed(2)}</div>
          <div><span className="text-muted-foreground">Desconto:</span> R$ {Number(p.desconto_aplicado || 0).toFixed(2)}</div>
          <div><span className="text-muted-foreground">Status:</span> {p.status}</div>
        </div>
      );
    }

    return null;
  };

  const renderAnexos = () => {
    if (!selectedPedido) return null;
    if (selectedPedido.type === 'dominio-com' || selectedPedido.type === 'dominio-com-br' || selectedPedido.type === 'vps-6') return null;

    const raw = selectedPedido.type === 'pdf-rg' ? selectedPedido.raw_rg : selectedPedido.raw_personalizado;
    if (!raw) return null;

    return (
      <div>
        <p className="text-sm font-medium mb-2">Anexos:</p>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3].map(i => {
            const nome = (raw as any)[`anexo${i}_nome`];
            if (!nome) return null;
            // Construir URL de download do servidor
            const downloadUrl = getFullApiUrl(`/upload/serve?file=${encodeURIComponent(nome)}`);
            return (
              <Badge key={i} variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80">
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <Download className="h-3 w-3" /> Anexo {i}
                </a>
              </Badge>
            );
          })}
        </div>
      </div>
    );
  };

  const existingPdfNome = getExistingPdfNome();

  return (
    <div className="space-y-6">
      <DashboardTitleCard
        title="Gerenciar Pedidos"
        icon={<Package className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/admin"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por CPF, nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="pdf-rg">PDF RG</SelectItem>
            <SelectItem value="pdf-personalizado">PDF Personalizado</SelectItem>
            <SelectItem value="dominio-com">DOMÍNIO .COM</SelectItem>
            <SelectItem value="dominio-com-br">DOMÍNIO .COM.BR</SelectItem>
            <SelectItem value="vps-6">VPS (1 MÊS, 6 MESES, 1 ANO)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="realizado">Pedido Realizado</SelectItem>
            <SelectItem value="pagamento_confirmado">Pagamento Confirmado</SelectItem>
            <SelectItem value="em_confeccao">Em Confecção</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={loadPedidos}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : pedidos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum pedido encontrado.</p>
          ) : (
            <div className="space-y-3">
              {pedidos.map((p) => {
                const ModuleIcon = getPedidoModuleIcon(p);
                const moduleColor = getPedidoModuleColor(p.type);

                return (
                  <div
                    key={`${p.type}-${p.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-11 w-11 shrink-0 rounded-md border bg-muted flex items-center justify-center">
                        {ModuleIcon ? <ModuleIcon className="h-6 w-6" style={{ color: moduleColor }} /> : null}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={getPedidoTypeBadgeClass(p.type)}>
                            {typeLabel(p)}
                          </Badge>
                          <span className="font-medium text-sm">#{p.id}</span>
                          <span className="text-sm">{p.label}</span>
                          {p.sublabel && <span className="text-sm text-muted-foreground truncate max-w-[200px]">— {p.sublabel}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={statusColors[p.status] || ''}>
                            {getStatusLabelByType(p.type, p.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetail(p)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog
        open={!!selectedPedido}
        onOpenChange={() => {
          setSelectedPedido(null);
          setPdfFile(null);
          setQrCadastroSelecionado(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2 pr-8">
              <DialogTitle className="flex items-center gap-2">
                {selectedPedido && (() => {
                  const ModuleIcon = getPedidoModuleIcon(selectedPedido);
                  const moduleColor = getPedidoModuleColor(selectedPedido.type);

                  if (!ModuleIcon) return null;

                  return (
                    <div className="h-9 w-9 shrink-0 rounded-md border bg-muted flex items-center justify-center">
                      <ModuleIcon className="h-5 w-5" style={{ color: moduleColor }} />
                    </div>
                  );
                })()}
                <Badge variant="outline" className={selectedPedido ? getPedidoTypeBadgeClass(selectedPedido.type) : ''}>
                  {selectedPedido ? typeLabel(selectedPedido) : ''}
                </Badge>
                Pedido #{selectedPedido?.id}
              </DialogTitle>
              {existingPdfNome && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/10 flex-shrink-0"
                  onClick={() => {
                    const url = getFullApiUrl(`/upload/delivery?file=${encodeURIComponent(existingPdfNome)}`);
                    window.open(url, '_blank');
                  }}
                  title={`Baixar: ${existingPdfNome}`}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs">Baixar PDF</span>
                </Button>
              )}
            </div>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : selectedPedido && (
            <div className="space-y-5">
              {(() => {
                const isPdfPedido = selectedPedido.type === 'pdf-rg' || selectedPedido.type === 'pdf-personalizado';

                return (
                  <>
                    {renderDetailContent()}
                    {renderAnexos()}

                    {selectedPedido.type === 'pdf-rg' && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Cadastro QR vinculado:</p>
                        {qrCadastroLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> Carregando QR Code...
                          </div>
                        ) : qrCadastroSelecionado ? (
                          <QrCadastroCard registration={qrCadastroSelecionado} />
                        ) : (
                          <p className="text-xs text-muted-foreground">Nenhum cadastro QR encontrado para este pedido.</p>
                        )}
                      </div>
                    )}

                    {isPdfPedido && (
                      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Gerenciar PDF de Entrega
                          {selectedPedido.status !== 'entregue' && <span className="text-xs text-destructive">(obrigatório para Entregue)</span>}
                        </Label>

                        {existingPdfNome && !pdfFile && (
                          <div className="flex items-center justify-between bg-background rounded-md p-2 border gap-2">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                              PDF atual: <strong>{existingPdfNome}</strong>
                            </p>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7"
                              onClick={handleDeletePdf}
                              disabled={deletingPdf}
                              title="Excluir PDF e voltar para produção"
                            >
                              {deletingPdf ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                              {deletingPdf ? 'Excluindo...' : 'Excluir (voltar produção)'}
                            </Button>
                          </div>
                        )}

                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf"
                          onChange={handlePdfChange}
                          className="cursor-pointer"
                        />
                        {pdfFile && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> {pdfFile.name}
                            </p>
                            <Button
                              size="sm"
                              onClick={handleSavePdf}
                              disabled={savingPdf}
                              className="gap-1"
                            >
                              {savingPdf ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                              {savingPdf ? 'Atualizando...' : 'Atualizar PDF'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">Controle do Pedido:</p>
                          <p className="text-xs text-muted-foreground">
                            {isPdfPedido
                              ? 'Clique em uma etapa para atualizar o status do pedido.'
                              : (selectedPedido.type === 'dominio-com' || selectedPedido.type === 'vps-6')
                              ? 'Admin/suporte pode atualizar o fluxo até a finalização.'
                              : 'Para este tipo de pedido, o controle disponível é o cancelamento.'}
                          </p>
                        </div>
                        {canCancelPedido(selectedPedido.status) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelPedido(selectedPedido)}
                            disabled={updatingStatus || cancelingPedido}
                            className="gap-1"
                          >
                            {cancelingPedido ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                            {cancelingPedido ? 'Excluindo...' : 'Excluir pedido'}
                          </Button>
                        )}
                      </div>

                      {selectedPedido.type === 'vps-6' && (
                        <div className="space-y-2">
                          <Label htmlFor="workflow-ip" className="text-xs text-muted-foreground">IP para entrega da VPS</Label>
                          <div className="flex gap-2">
                            <Input
                              id="workflow-ip"
                              placeholder="Ex.: 172.20.10.15"
                              value={workflowIp}
                              onChange={(e) => setWorkflowIp(e.target.value)}
                              disabled={updatingStatus || cancelingPedido || savingWorkflowIp}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleSaveWorkflowIp}
                              disabled={updatingStatus || cancelingPedido || savingWorkflowIp || !workflowIp.trim() || workflowIp.trim() === (selectedPedido.raw_vps?.ip_vps || '').trim()}
                              className="shrink-0"
                            >
                              {savingWorkflowIp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar IP'}
                            </Button>
                          </div>
                        </div>
                      )}

                      <StatusProgressCircles
                        pedido={selectedPedido}
                        onClickStep={isPdfPedido || selectedPedido.type === 'dominio-com' || selectedPedido.type === 'vps-6' ? handleUpdateStatus : undefined}
                        disabled={updatingStatus || cancelingPedido}
                      />

                      {(updatingStatus || cancelingPedido) && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" /> {cancelingPedido ? 'Cancelando...' : 'Atualizando...'}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPedidos;
