import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DayContentProps } from 'react-day-picker';
import { LucideIcon, Plus, PlusCircle, Search, CalendarDays, Wallet, Users, FileText, ShoppingCart, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { addMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';
import AgendaTimeRangePicker, { hasRangeConflict, timeToMinutes } from '@/components/dashboard/controle-pessoal/AgendaTimeRangePicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { todayBrasilia } from '@/utils/timezone';
import { formatCpf, formatPhone } from '@/utils/formatters';
import { apiRequest } from '@/config/api';
import { toast } from 'sonner';

export type ControlePessoalModuleType = 'agenda' | 'financeiro' | 'novocliente' | 'relatorios' | 'vendasimples';

type TransactionType = 'entrada' | 'saida';
type LeadStage = 'novo' | 'contato' | 'proposta' | 'negociacao' | 'fechado-ganho' | 'fechado-perdido';
type ReportType = 'faturamento' | 'despesas' | 'clientes' | 'vendas' | 'operacional';
type SaleStatus = 'pendente' | 'pago' | 'cancelado';

interface ControlePessoalRecord {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  amount?: number;
  client?: string;
  notes?: string;
  createdAt: string;
  transactionType?: TransactionType;
  category?: string;
  paymentMethod?: string;
  dueDate?: string;
  isPaid?: boolean;
  phone?: string;
  email?: string;
  document?: string;
  source?: string;
  stage?: LeadStage;
  nextContact?: string;
  potentialValue?: number;
  reportType?: ReportType;
  reportPeriod?: string;
  saleStatus?: SaleStatus;
  quantity?: number;
  unitPrice?: number;
}

interface ControlePessoalApiItem {
  id: number;
  titulo: string;
  descricao?: string | null;
  cliente_nome?: string | null;
  valor?: number | string | null;
  data_referencia: string;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

interface ControlePessoalModulePageProps {
  moduleType: ControlePessoalModuleType;
  title: string;
  subtitle: string;
  formTitle: string;
}

const moduleIconMap: Record<ControlePessoalModuleType, LucideIcon> = {
  agenda: CalendarDays,
  financeiro: Wallet,
  novocliente: Users,
  relatorios: FileText,
  vendasimples: ShoppingCart,
};

const moduleEndpointMap: Record<ControlePessoalModuleType, string> = {
  agenda: '/controlepessoal-agenda',
  financeiro: '/controlepessoal-financeiro',
  novocliente: '/controlepessoal-novocliente',
  relatorios: '/controlepessoal-relatorios',
  vendasimples: '/controlepessoal-vendasimples',
};

const financialCategories = ['Vendas', 'Serviços', 'Fornecedores', 'Transporte', 'Marketing', 'Impostos', 'Outros'];
const financialPaymentMethods = ['PIX', 'Dinheiro', 'Cartão', 'Boleto', 'Transferência', 'Outro'];
const clientSources = ['Instagram', 'WhatsApp', 'Indicação', 'Site', 'Google', 'Outro'];
const leadStages: { label: string; value: LeadStage }[] = [
  { label: 'Novo lead', value: 'novo' },
  { label: 'Primeiro contato', value: 'contato' },
  { label: 'Proposta enviada', value: 'proposta' },
  { label: 'Em negociação', value: 'negociacao' },
  { label: 'Fechado - ganho', value: 'fechado-ganho' },
  { label: 'Fechado - perdido', value: 'fechado-perdido' },
];
const reportTypes: { label: string; value: ReportType }[] = [
  { label: 'Faturamento', value: 'faturamento' },
  { label: 'Despesas', value: 'despesas' },
  { label: 'Clientes', value: 'clientes' },
  { label: 'Vendas', value: 'vendas' },
  { label: 'Operacional', value: 'operacional' },
];
const saleStatuses: { label: string; value: SaleStatus }[] = [
  { label: 'Pendente', value: 'pendente' },
  { label: 'Pago', value: 'pago' },
  { label: 'Cancelado', value: 'cancelado' },
];

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromISODate = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const toIsoDateTime = (value?: string) => {
  if (!value) return new Date().toISOString();
  return value.includes('T') ? value : value.replace(' ', 'T');
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const formatDateTime = (date: string) =>
  new Date(toIsoDateTime(date)).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDateBR = (isoDate: string) =>
  fromISODate(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const getDayDiff = (fromDate: string, toDate: string) => {
  const from = fromISODate(fromDate);
  const to = fromISODate(toDate);
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

const isClosedLead = (stage?: LeadStage) => stage === 'fechado-ganho' || stage === 'fechado-perdido';

const ControlePessoalModulePage = ({ moduleType, title, subtitle, formTitle }: ControlePessoalModulePageProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const Icon = moduleIconMap[moduleType];
  const isAgenda = moduleType === 'agenda';
  const isFinancial = moduleType === 'financeiro';
  const isNewClient = moduleType === 'novocliente';
  const isReports = moduleType === 'relatorios';
  const isSimpleSales = moduleType === 'vendasimples';
  const todayIso = useMemo(() => todayBrasilia(), []);
  const endpoint = moduleEndpointMap[moduleType];

  const [records, setRecords] = useState<ControlePessoalRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: todayIso,
    time: '09:00',
    endTime: '10:00',
    amount: '',
    client: '',
    notes: '',
    transactionType: 'entrada' as TransactionType,
    category: financialCategories[0],
    paymentMethod: financialPaymentMethods[0],
    dueDate: todayIso,
    isPaid: false,
    phone: '',
    email: '',
    document: '',
    source: clientSources[0],
    stage: 'novo' as LeadStage,
    nextContact: todayIso,
    potentialValue: '',
    reportType: 'faturamento' as ReportType,
    reportPeriod: todayIso.slice(0, 7),
    saleStatus: 'pendente' as SaleStatus,
    quantity: '1',
    unitPrice: '',
  });

  const mapApiItemToRecord = useCallback((item: ControlePessoalApiItem): ControlePessoalRecord => {
    const metadata = (item.metadata || {}) as Record<string, unknown>;
    const isPaidValue = metadata.isPaid;

    return {
      id: String(item.id),
      title: item.titulo,
      date: item.data_referencia,
      time: typeof metadata.time === 'string' ? metadata.time : undefined,
      endTime: typeof metadata.endTime === 'string' ? metadata.endTime : undefined,
      amount: item.valor !== null && item.valor !== undefined ? Number(item.valor) : undefined,
      client: item.cliente_nome || undefined,
      notes: item.descricao || undefined,
      createdAt: toIsoDateTime(item.created_at),
      transactionType: typeof metadata.transactionType === 'string' ? (metadata.transactionType as TransactionType) : undefined,
      category: typeof metadata.category === 'string' ? metadata.category : undefined,
      paymentMethod: typeof metadata.paymentMethod === 'string' ? metadata.paymentMethod : undefined,
      dueDate: typeof metadata.dueDate === 'string' ? metadata.dueDate : undefined,
      isPaid: typeof isPaidValue === 'boolean' ? isPaidValue : isPaidValue === 'true' || isPaidValue === 1,
      phone: typeof metadata.phone === 'string' ? metadata.phone : undefined,
      email: typeof metadata.email === 'string' ? metadata.email : undefined,
      document: typeof metadata.document === 'string' ? metadata.document : undefined,
      source: typeof metadata.source === 'string' ? metadata.source : undefined,
      stage: typeof metadata.stage === 'string' ? (metadata.stage as LeadStage) : undefined,
      nextContact: typeof metadata.nextContact === 'string' ? metadata.nextContact : undefined,
      potentialValue:
        typeof metadata.potentialValue === 'number'
          ? metadata.potentialValue
          : typeof metadata.potentialValue === 'string'
            ? Number(metadata.potentialValue)
            : undefined,
      reportType: typeof metadata.reportType === 'string' ? (metadata.reportType as ReportType) : undefined,
      reportPeriod: typeof metadata.reportPeriod === 'string' ? metadata.reportPeriod : undefined,
      saleStatus: typeof metadata.saleStatus === 'string' ? (metadata.saleStatus as SaleStatus) : undefined,
      quantity:
        typeof metadata.quantity === 'number'
          ? metadata.quantity
          : typeof metadata.quantity === 'string'
            ? Number(metadata.quantity)
            : undefined,
      unitPrice:
        typeof metadata.unitPrice === 'number'
          ? metadata.unitPrice
          : typeof metadata.unitPrice === 'string'
            ? Number(metadata.unitPrice)
            : undefined,
    };
  }, []);

  const loadRecords = useCallback(async () => {
    if (!user?.id) {
      setRecords([]);
      return;
    }

    try {
      const response = await apiRequest<any>(`${endpoint}?limit=100&offset=0`, { method: 'GET' });
      const items = Array.isArray(response?.data?.items) ? (response.data.items as ControlePessoalApiItem[]) : [];
      setRecords(items.map(mapApiItemToRecord));
    } catch (error) {
      setRecords([]);
      toast.error('Não foi possível carregar os registros da agenda.');
      console.error('Erro ao carregar controle pessoal:', error);
    }
  }, [endpoint, mapApiItemToRecord, user?.id]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, date: prev.date || selectedDate }));
  }, [selectedDate]);

  const appointmentCountByDate = useMemo(() => {
    return records.reduce<Record<string, number>>((acc, record) => {
      acc[record.date] = (acc[record.date] || 0) + 1;
      return acc;
    }, {});
  }, [records]);

  const datesWithAppointments = useMemo(() => {
    return Object.keys(appointmentCountByDate).map(fromISODate);
  }, [appointmentCountByDate]);

  const recordsForSelectedDate = useMemo(() => {
    return records
      .filter((record) => record.date === selectedDate)
      .sort((a, b) => {
        const timeDiff = timeToMinutes(a.time) - timeToMinutes(b.time);
        if (timeDiff !== 0) return timeDiff;
        return toIsoDateTime(a.createdAt).localeCompare(toIsoDateTime(b.createdAt));
      });
  }, [records, selectedDate]);

  const agendaOccupiedRangesForFormDate = useMemo(() => {
    if (!isAgenda || !form.date) return [];

    return records
      .filter((record) => record.date === form.date && record.id !== editingRecordId)
      .map((record) => ({
        id: record.id,
        title: record.title,
        startMinutes: timeToMinutes(record.time),
        endMinutes: timeToMinutes(record.endTime),
      }))
      .filter((record) => record.endMinutes > record.startMinutes);
  }, [editingRecordId, form.date, isAgenda, records]);

  const agendaTimelineItems = useMemo(() => {
    if (!isAgenda) {
      return [] as Array<{
        id: string;
        title: string;
        detail: string;
        startTime: string;
        endTime: string;
        startMinutes: number;
        endMinutes: number;
      }>;
    }

    return recordsForSelectedDate.map((record) => {
      const parsedDate = new Date(toIsoDateTime(record.createdAt));
      const fallbackTime = '09:00';
      const createdAtTime = Number.isNaN(parsedDate.getTime())
        ? fallbackTime
        : parsedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      const startTime = record.time || createdAtTime;
      const endTime = record.endTime || '10:00';
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = Math.max(startMinutes + 15, timeToMinutes(endTime));

      return {
        id: record.id,
        title: record.title,
        detail: `${record.client || 'Sem cliente'} • ${record.amount ? formatCurrency(record.amount) : 'Sem valor'}`,
        startTime,
        endTime,
        startMinutes,
        endMinutes,
      };
    });
  }, [isAgenda, recordsForSelectedDate]);

  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const timelineDragStateRef = useRef({ isDragging: false, startY: 0, startScrollTop: 0 });

  const timelineHourHeight = 52;
  const timelineTotalMinutes = 24 * 60;

  const timelineHours = useMemo(() => Array.from({ length: 25 }, (_, hour) => hour), []);

  const scrollTimelineBy = useCallback((offset: number) => {
    const container = timelineScrollRef.current;
    if (!container) return;

    container.scrollBy({ top: offset, behavior: 'smooth' });
  }, []);

  const handleTimelineDragStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;

    const container = timelineScrollRef.current;
    if (!container) return;

    timelineDragStateRef.current = {
      isDragging: true,
      startY: event.clientY,
      startScrollTop: container.scrollTop,
    };
  }, []);

  const handleTimelineDragMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const dragState = timelineDragStateRef.current;
    if (!dragState.isDragging) return;

    const container = timelineScrollRef.current;
    if (!container) return;

    const deltaY = event.clientY - dragState.startY;
    container.scrollTop = dragState.startScrollTop - deltaY;
  }, []);

  const stopTimelineDrag = useCallback(() => {
    timelineDragStateRef.current.isDragging = false;
  }, []);

  useEffect(() => {
    if (!isAgenda) return;

    const container = timelineScrollRef.current;
    if (!container) return;

    container.scrollTop = 6 * timelineHourHeight;
  }, [isAgenda, selectedDate, timelineHourHeight]);

  const monthlyFinancial = useMemo(() => {
    if (!isFinancial) return { entradas: 0, saidas: 0, saldo: 0 };

    const month = todayBrasilia().slice(0, 7);

    const entradas = records
      .filter((item) => item.date.startsWith(month) && item.transactionType === 'entrada')
      .reduce((acc, item) => acc + (item.amount || 0), 0);

    const saidas = records
      .filter((item) => item.date.startsWith(month) && item.transactionType === 'saida')
      .reduce((acc, item) => acc + (item.amount || 0), 0);

    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
    };
  }, [isFinancial, records]);

  const dailyFinancial = useMemo(() => {
    if (!isFinancial) return { entradas: 0, saidas: 0, saldo: 0 };

    const entries = records.filter((item) => item.date === selectedDate);
    const entradas = entries
      .filter((item) => item.transactionType === 'entrada')
      .reduce((acc, item) => acc + (item.amount || 0), 0);
    const saidas = entries
      .filter((item) => item.transactionType === 'saida')
      .reduce((acc, item) => acc + (item.amount || 0), 0);

    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
    };
  }, [isFinancial, records, selectedDate]);

  const dueAlerts = useMemo(() => {
    if (!isFinancial) return [];

    const today = todayBrasilia();

    return records
      .filter((record) => record.transactionType === 'saida' && !!record.dueDate && !record.isPaid)
      .map((record) => ({
        ...record,
        daysToDue: getDayDiff(today, record.dueDate as string),
      }))
      .filter((record) => record.daysToDue <= 3)
      .sort((a, b) => a.daysToDue - b.daysToDue);
  }, [isFinancial, records]);

  const newClientInsights = useMemo(() => {
    if (!isNewClient) {
      return {
        monthlyNewClients: 0,
        followupsToday: 0,
        overdueFollowups: 0,
        activePipelineValue: 0,
      };
    }

    const today = todayBrasilia();
    const month = today.slice(0, 7);

    const monthlyNewClients = records.filter((item) => item.date.startsWith(month)).length;
    const followupsToday = records.filter((item) => item.nextContact === today && !isClosedLead(item.stage)).length;
    const overdueFollowups = records.filter(
      (item) => !!item.nextContact && item.nextContact < today && !isClosedLead(item.stage)
    ).length;
    const activePipelineValue = records
      .filter((item) => !isClosedLead(item.stage))
      .reduce((acc, item) => acc + (item.potentialValue || 0), 0);

    return {
      monthlyNewClients,
      followupsToday,
      overdueFollowups,
      activePipelineValue,
    };
  }, [isNewClient, records]);

  const reportsInsights = useMemo(() => {
    if (!isReports) {
      return {
        monthlyCount: 0,
        averageValue: 0,
        monthlyResult: 0,
        totalsByType: [] as { label: string; value: ReportType; total: number }[],
      };
    }

    const month = todayBrasilia().slice(0, 7);
    const monthlyRecords = records.filter((item) => (item.reportPeriod || item.date.slice(0, 7)) === month);

    const monthlyCount = monthlyRecords.length;
    const averageValue =
      monthlyCount > 0
        ? monthlyRecords.reduce((acc, item) => acc + (item.amount || 0), 0) / monthlyCount
        : 0;

    const receitas = monthlyRecords
      .filter((item) => item.reportType === 'faturamento' || item.reportType === 'vendas')
      .reduce((acc, item) => acc + (item.amount || 0), 0);

    const despesas = monthlyRecords
      .filter((item) => item.reportType === 'despesas')
      .reduce((acc, item) => acc + (item.amount || 0), 0);

    const totalsByType = reportTypes
      .map((type) => ({
        ...type,
        total: monthlyRecords
          .filter((item) => item.reportType === type.value)
          .reduce((acc, item) => acc + (item.amount || 0), 0),
      }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);

    return {
      monthlyCount,
      averageValue,
      monthlyResult: receitas - despesas,
      totalsByType,
    };
  }, [isReports, records]);

  const simpleSalesInsights = useMemo(() => {
    if (!isSimpleSales) {
      return {
        monthlySalesCount: 0,
        monthlyRevenue: 0,
        averageTicket: 0,
        pendingSales: 0,
      };
    }

    const month = todayBrasilia().slice(0, 7);
    const monthlySales = records.filter((item) => item.date.startsWith(month) && item.saleStatus !== 'cancelado');
    const monthlyRevenue = monthlySales.reduce((acc, item) => acc + (item.amount || 0), 0);

    return {
      monthlySalesCount: monthlySales.length,
      monthlyRevenue,
      averageTicket: monthlySales.length ? monthlyRevenue / monthlySales.length : 0,
      pendingSales: records.filter((item) => item.saleStatus === 'pendente').length,
    };
  }, [isSimpleSales, records]);

  const stats = useMemo(() => {
    const today = todayBrasilia();
    const month = today.slice(0, 7);

    const todayCount = records.filter((item) => item.date === today).length;
    const monthlyTotal = records
      .filter((item) => item.date.startsWith(month))
      .reduce((acc, item) => acc + (item.amount || 0), 0);

    return {
      todayCount,
      total: records.length,
      monthlyTotal,
    };
  }, [records]);

  const handleDaySelect = (date?: Date) => {
    if (!date) return;

    const isoDate = toISODate(date);
    setSelectedDate(isoDate);
    setForm((prev) => ({ ...prev, date: isoDate }));
  };

  const selectedDateObject = useMemo(() => fromISODate(selectedDate), [selectedDate]);
  const agendaBaseMonth = useMemo(() => startOfMonth(fromISODate(todayIso)), [todayIso]);

  const agendaCalendarPanels = useMemo(
    () => [
      { id: 'current', month: agendaBaseMonth, title: 'Mês atual', visibilityClass: '' },
      { id: 'next', month: addMonths(agendaBaseMonth, 1), title: 'Próximo mês', visibilityClass: 'hidden xl:block' },
    ],
    [agendaBaseMonth]
  );

  const agendaCalendarClassNames = {
    months: 'w-full',
    month: 'w-full space-y-3',
    caption: 'flex justify-center pt-1 relative items-center',
    caption_label: 'text-sm font-semibold text-foreground',
    nav_button: 'h-8 w-8 rounded-md border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground',
    table: 'w-full border-collapse',
    head_row: 'grid grid-cols-7 gap-0.5',
    row: 'mt-1 grid grid-cols-7 gap-0.5',
    head_cell: 'text-muted-foreground rounded-md text-center text-[0.72rem] font-medium uppercase tracking-wider',
    cell: 'h-11 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
    day: 'mx-auto flex h-10 w-10 items-center justify-center rounded-full p-0 text-sm font-medium text-foreground transition-colors hover:bg-accent/70',
    day_selected: 'rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary focus:bg-primary',
    day_today: 'rounded-full bg-success text-success-foreground shadow-sm hover:bg-success focus:bg-success',
    day_outside: 'text-muted-foreground/60 opacity-80',
  };

  const AgendaDayContent = useCallback(
    ({ date, displayMonth }: DayContentProps) => {
      const isoDate = toISODate(date);
      const appointmentsInDate = appointmentCountByDate[isoDate] || 0;
      const isOutsideMonth = date.getMonth() !== displayMonth.getMonth();

      return (
        <div className="relative flex h-10 w-10 items-center justify-center">
          <span className="font-semibold tabular-nums">{date.getDate()}</span>
          {appointmentsInDate > 0 && !isOutsideMonth ? (
            <span className="absolute -bottom-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-border bg-foreground px-1 text-[10px] font-bold leading-none text-background shadow-sm">
              {appointmentsInDate}
            </span>
          ) : null}
        </div>
      );
    },
    [appointmentCountByDate]
  );

  const resetForm = useCallback((baseDate: string) => {
    setEditingRecordId(null);
    setForm((prev) => ({
      ...prev,
      title: '',
      date: baseDate,
      time: '09:00',
      endTime: '10:00',
      amount: '',
      client: '',
      notes: '',
      transactionType: 'entrada',
      category: financialCategories[0],
      paymentMethod: financialPaymentMethods[0],
      dueDate: baseDate,
      isPaid: false,
      phone: '',
      email: '',
      document: '',
      source: clientSources[0],
      stage: 'novo',
      nextContact: baseDate,
      potentialValue: '',
      reportType: 'faturamento',
      reportPeriod: todayBrasilia().slice(0, 7),
      saleStatus: 'pendente',
      quantity: '1',
      unitPrice: '',
    }));
  }, []);

  const handleOpenAgendaModal = useCallback(() => {
    resetForm(selectedDate);
    setIsAgendaModalOpen(true);
  }, [resetForm, selectedDate]);

  const handleCloseAgendaModal = useCallback(() => {
    setIsAgendaModalOpen(false);
    resetForm(selectedDate);
  }, [resetForm, selectedDate]);

  const handleEditAgendaRecord = useCallback((recordId: string) => {
    const target = records.find((item) => item.id === recordId);
    if (!target) {
      toast.error('Compromisso não encontrado para edição.');
      return;
    }

    setEditingRecordId(target.id);
    setSelectedDate(target.date);
    setForm((prev) => ({
      ...prev,
      title: target.title,
      date: target.date,
      time: target.time || '09:00',
      endTime: target.endTime || '10:00',
      amount: target.amount ? String(target.amount) : '',
      client: target.client || '',
      notes: target.notes || '',
    }));
    setIsAgendaModalOpen(true);
  }, [records]);

  const handleDeleteAgendaRecord = useCallback(async (recordId: string) => {
    const target = records.find((item) => item.id === recordId);
    if (!target) return;

    if (!window.confirm(`Excluir o compromisso "${target.title}"?`)) return;

    try {
      const response = await apiRequest<any>(`${endpoint}/${recordId}`, { method: 'DELETE' });
      if (!response?.success) {
        throw new Error(response?.error || 'Falha ao excluir compromisso.');
      }

      await loadRecords();
      if (editingRecordId === recordId) {
        resetForm(selectedDate);
      }
      toast.success('Compromisso excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir compromisso:', error);
      toast.error('Não foi possível excluir o compromisso.');
    }
  }, [editingRecordId, endpoint, loadRecords, records, resetForm, selectedDate]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) {
      toast.error('Preencha o título e a data para salvar.');
      return;
    }

    if (isAgenda && (!form.time || !form.endTime)) {
      toast.error('Informe hora de início e término do compromisso.');
      return;
    }

    if (isAgenda && form.time && form.endTime) {
      const startMinutes = timeToMinutes(form.time);
      const endMinutes = timeToMinutes(form.endTime);

      if (endMinutes <= startMinutes) {
        toast.error('A hora de término deve ser maior que a hora de início.');
        return;
      }

      if (hasRangeConflict(startMinutes, endMinutes, agendaOccupiedRangesForFormDate)) {
        toast.error('Este horário já está reservado. Escolha outro intervalo.');
        return;
      }
    }

    if (isFinancial && (!form.amount || Number(form.amount) <= 0)) {
      toast.error('Informe um valor válido para o lançamento financeiro.');
      return;
    }

    if (isReports && (!form.amount || Number(form.amount) <= 0)) {
      toast.error('Informe um valor válido para o indicador do relatório.');
      return;
    }

    if (isSimpleSales) {
      const computedByItems = (Number(form.quantity || '0') || 0) * (Number(form.unitPrice || '0') || 0);
      const informedAmount = Number(form.amount || '0');
      if (computedByItems <= 0 && informedAmount <= 0) {
        toast.error('Informe valor da venda ou quantidade e preço unitário.');
        return;
      }
    }

    if (isNewClient && !form.phone.trim() && !form.email.trim()) {
      toast.error('Informe ao menos telefone ou e-mail para contato do cliente.');
      return;
    }

    const computedSaleAmount = (Number(form.quantity || '0') || 0) * (Number(form.unitPrice || '0') || 0);
    const finalAmount = isSimpleSales
      ? Number(form.amount || '0') > 0
        ? Number(form.amount)
        : computedSaleAmount
      : form.amount
        ? Number(form.amount)
        : 0;

    const metadata = {
      time: form.time,
      endTime: form.endTime,
      transactionType: isFinancial ? form.transactionType : undefined,
      category: isFinancial ? form.category : undefined,
      paymentMethod: isFinancial || isSimpleSales ? form.paymentMethod : undefined,
      dueDate: isFinancial || isSimpleSales ? form.dueDate : undefined,
      isPaid: isFinancial ? form.isPaid : undefined,
      phone: isNewClient ? form.phone.trim() : undefined,
      email: isNewClient ? form.email.trim() : undefined,
      document: isNewClient ? form.document.trim() : undefined,
      source: isNewClient ? form.source : undefined,
      stage: isNewClient ? form.stage : undefined,
      nextContact: isNewClient ? form.nextContact : undefined,
      potentialValue: isNewClient && form.potentialValue ? Number(form.potentialValue) : undefined,
      reportType: isReports ? form.reportType : undefined,
      reportPeriod: isReports ? form.reportPeriod : undefined,
      saleStatus: isSimpleSales ? form.saleStatus : undefined,
      quantity: isSimpleSales ? Number(form.quantity || '0') || undefined : undefined,
      unitPrice: isSimpleSales ? Number(form.unitPrice || '0') || undefined : undefined,
    };

    const payload = {
      titulo: form.title.trim(),
      data_referencia: form.date,
      descricao: form.notes.trim() || null,
      cliente_nome: form.client.trim() || null,
      valor: finalAmount,
      status: 'pendente',
      metadata,
    };

    setIsSubmitting(true);

    try {
      const isEditing = Boolean(editingRecordId);
      const response = await apiRequest<any>(isEditing ? `${endpoint}/${editingRecordId}` : endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      if (!response?.success) {
        throw new Error(response?.error || 'Falha ao salvar registro.');
      }

      await loadRecords();
      setSelectedDate(form.date);
      resetForm(form.date);
      if (isAgenda) {
        setIsAgendaModalOpen(false);
      }
      toast.success(isEditing ? 'Compromisso atualizado com sucesso.' : 'Registro salvo com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar controle pessoal:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar no banco de dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {isAgenda ? (
        <SimpleTitleBar
          title={title}
          subtitle={subtitle}
          icon={<Icon className="h-5 w-5" />}
          right={(
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleOpenAgendaModal}
              className="rounded-full h-9 w-9"
              aria-label="Novo compromisso"
              title="Novo compromisso"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          onBack={() => navigate('/dashboard')}
        />
      ) : (
        <PageHeaderCard title={title} subtitle={subtitle} />
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        {!isAgenda ? (
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                {isAgenda ? (editingRecordId ? 'Editar compromisso' : 'Novo compromisso') : formTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">
                {isNewClient ? 'Nome do cliente' : isReports ? 'Indicador / métrica' : isSimpleSales ? 'Produto / serviço' : 'Título'}
              </Label>
              <Input
                id="titulo"
                placeholder={
                  isNewClient
                    ? 'Ex.: Maria da Silva'
                    : isReports
                      ? 'Ex.: Receita mensal, churn, novos leads'
                      : isSimpleSales
                        ? 'Ex.: Corte social, instalação, pacote mensal'
                        : 'Ex.: Cliente retorno / Pagamento / Compromisso'
                }
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {isFinancial ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo-lancamento">Tipo</Label>
                  <select
                    id="tipo-lancamento"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={form.transactionType}
                    onChange={(e) => setForm((prev) => ({ ...prev, transactionType: e.target.value as TransactionType }))}
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <select
                    id="categoria"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  >
                    {financialCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            {isReports ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipo-relatorio">Tipo de indicador</Label>
                    <select
                      id="tipo-relatorio"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={form.reportType}
                      onChange={(e) => setForm((prev) => ({ ...prev, reportType: e.target.value as ReportType }))}
                    >
                      {reportTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="periodo-relatorio">Período de referência</Label>
                    <Input
                      id="periodo-relatorio"
                      type="month"
                      value={form.reportPeriod}
                      onChange={(e) => setForm((prev) => ({ ...prev, reportPeriod: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data do lançamento</Label>
                    <Input
                      id="data"
                      type="date"
                      value={form.date}
                      onChange={(e) => {
                        const nextDate = e.target.value;
                        setForm((prev) => ({ ...prev, date: nextDate }));
                        if (nextDate) setSelectedDate(nextDate);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor do indicador</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={form.amount}
                      onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cliente">Área / fonte (opcional)</Label>
                  <Input
                    id="cliente"
                    placeholder="Ex.: Comercial, Tráfego, Operação"
                    value={form.client}
                    onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))}
                  />
                </div>
              </>
            ) : isSimpleSales ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data da venda</Label>
                    <Input
                      id="data"
                      type="date"
                      value={form.date}
                      onChange={(e) => {
                        const nextDate = e.target.value;
                        setForm((prev) => ({ ...prev, date: nextDate }));
                        if (nextDate) setSelectedDate(nextDate);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cliente">Cliente</Label>
                    <Input
                      id="cliente"
                      placeholder="Nome do cliente"
                      value={form.client}
                      onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade-venda">Quantidade</Label>
                    <Input
                      id="quantidade-venda"
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor-unitario">Valor unitário</Label>
                    <Input
                      id="valor-unitario"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={form.unitPrice}
                      onChange={(e) => setForm((prev) => ({ ...prev, unitPrice: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor total (opcional)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Automático por item"
                      value={form.amount}
                      onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="forma-pagamento">Forma de pagamento</Label>
                    <select
                      id="forma-pagamento"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={form.paymentMethod}
                      onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    >
                      {financialPaymentMethods.map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status-venda">Status da venda</Label>
                    <select
                      id="status-venda"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={form.saleStatus}
                      onChange={(e) => setForm((prev) => ({ ...prev, saleStatus: e.target.value as SaleStatus }))}
                    >
                      {saleStatuses.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recebimento">Recebimento até</Label>
                    <Input
                      id="recebimento"
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            ) : isNewClient ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="telefone-cliente">Telefone / WhatsApp</Label>
                    <Input
                      id="telefone-cliente"
                      placeholder="(11) 99999-9999"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: formatPhone(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-cliente">E-mail</Label>
                    <Input
                      id="email-cliente"
                      type="email"
                      placeholder="cliente@email.com"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="documento-cliente">CPF (opcional)</Label>
                    <Input
                      id="documento-cliente"
                      placeholder="000.000.000-00"
                      value={form.document}
                      onChange={(e) => setForm((prev) => ({ ...prev, document: formatCpf(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="origem-cliente">Origem do lead</Label>
                    <select
                      id="origem-cliente"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={form.source}
                      onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
                    >
                      {clientSources.map((source) => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="data">Data de entrada</Label>
                    <Input
                      id="data"
                      type="date"
                      value={form.date}
                      onChange={(e) => {
                        const nextDate = e.target.value;
                        setForm((prev) => ({ ...prev, date: nextDate }));
                        if (nextDate) setSelectedDate(nextDate);
                      }}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="proximo-contato">Próximo contato</Label>
                    <Input
                      id="proximo-contato"
                      type="date"
                      value={form.nextContact}
                      onChange={(e) => setForm((prev) => ({ ...prev, nextContact: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="valor-potencial">Valor potencial</Label>
                    <Input
                      id="valor-potencial"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={form.potentialValue}
                      onChange={(e) => setForm((prev) => ({ ...prev, potentialValue: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="etapa-funil">Etapa do funil</Label>
                    <select
                      id="etapa-funil"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={form.stage}
                      onChange={(e) => setForm((prev) => ({ ...prev, stage: e.target.value as LeadStage }))}
                    >
                      {leadStages.map((stage) => (
                        <option key={stage.value} value={stage.value}>{stage.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cliente">Responsável / cliente vinculado (opcional)</Label>
                    <Input
                      id="cliente"
                      placeholder="Ex.: Loja Centro"
                      value={form.client}
                      onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={form.date}
                      onChange={(e) => {
                        const nextDate = e.target.value;
                        setForm((prev) => ({ ...prev, date: nextDate }));
                        if (nextDate) {
                          setSelectedDate(nextDate);
                        }
                      }}
                    />
                  </div>

                  {isAgenda ? (
                    <div className="space-y-2">
                      <Label htmlFor="hora">Hora</Label>
                      <Input
                        id="hora"
                        type="time"
                        value={form.time}
                        onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (opcional)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={form.amount}
                      onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>

                {isFinancial ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="forma-pagamento">Forma de pagamento</Label>
                      <select
                        id="forma-pagamento"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={form.paymentMethod}
                        onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                      >
                        {financialPaymentMethods.map((method) => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vencimento">Vencimento</Label>
                      <Input
                        id="vencimento"
                        type="date"
                        value={form.dueDate}
                        onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : null}

                {isFinancial ? (
                  <div className="flex items-center gap-2 rounded-md border border-border p-3">
                    <input
                      id="pago"
                      type="checkbox"
                      checked={form.isPaid}
                      onChange={(e) => setForm((prev) => ({ ...prev, isPaid: e.target.checked }))}
                    />
                    <Label htmlFor="pago">Lançamento já foi pago/recebido</Label>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente (opcional)</Label>
                  <Input
                    id="cliente"
                    placeholder="Nome do cliente"
                    value={form.client}
                    onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder={
                  isNewClient
                    ? 'Necessidade do cliente, objeções, canal preferido e próximos passos'
                    : isReports
                      ? 'Descreva contexto, origem dos dados e conclusões do indicador'
                      : isSimpleSales
                        ? 'Anote itens vendidos, condições e observações da venda'
                        : 'Anote detalhes importantes para não esquecer'
                }
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleSave} className="w-full" disabled={isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {editingRecordId ? 'Atualizar compromisso' : 'Salvar registro'}
              </Button>
              {isAgenda && editingRecordId ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => resetForm(selectedDate)}
                  disabled={isSubmitting}
                >
                  Cancelar edição
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
        ) : null}

        <Card className={isAgenda ? 'order-1 lg:order-1 xl:col-span-2 border-0 bg-transparent shadow-none' : undefined}>
          {isAgenda ? null : (
            <CardHeader>
              <CardTitle>
                {isFinancial
                  ? 'Caixa diário e alertas'
                  : isNewClient
                    ? 'Follow-up comercial'
                    : isReports
                      ? 'Painel analítico'
                      : isSimpleSales
                        ? 'Painel de vendas'
                        : 'Resumo rápido'}
              </CardTitle>
            </CardHeader>
          )}
          <CardContent className={isAgenda ? 'p-0' : undefined}>
            {isAgenda ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)] xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)_minmax(280px,1fr)] xl:items-start">
                  <div className="order-2 min-w-0 rounded-xl border border-border bg-card p-3 shadow-sm md:order-1">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Linha do tempo diária</p>
                        <p className="text-xs text-muted-foreground">Base padrão 06:00–18:00. Arraste ou use os botões para ver toda a grade.</p>
                      </div>
                      <Badge variant={agendaTimelineItems.length ? 'default' : 'secondary'}>
                        {agendaTimelineItems.length} compromisso(s)
                      </Badge>
                    </div>

                    <div className="rounded-lg border border-border bg-background p-2">
                      <div className="relative">
                        <div
                          ref={timelineScrollRef}
                          className="relative h-[500px] overflow-y-auto rounded-md border border-border/70 bg-background pr-1 cursor-grab active:cursor-grabbing select-none"
                          onMouseDown={handleTimelineDragStart}
                          onMouseMove={handleTimelineDragMove}
                          onMouseUp={stopTimelineDrag}
                          onMouseLeave={stopTimelineDrag}
                        >
                          <div className="relative min-h-full" style={{ height: `${(timelineTotalMinutes / 60) * timelineHourHeight}px` }}>
                            {timelineHours.map((hour) => (
                              <div
                                key={hour}
                                className="absolute inset-x-0"
                                style={{ top: `${hour * timelineHourHeight}px` }}
                              >
                                <span className="absolute left-2 sm:left-3 -translate-y-1/2 text-[12px] font-semibold text-muted-foreground">
                                  {`${String(hour).padStart(2, '0')}:00`}
                                </span>
                                <div className="ml-14 sm:ml-16 border-t border-border/60" />
                              </div>
                            ))}

                            <div className="absolute inset-y-0 left-[3.8rem] sm:left-[4.5rem] right-1 sm:right-2">
                              {agendaTimelineItems.map((item) => {
                                const top = (item.startMinutes / 60) * timelineHourHeight;
                                const height = Math.max(((item.endMinutes - item.startMinutes) / 60) * timelineHourHeight, 52);

                                return (
                                  <div
                                    key={item.id}
                                    className="absolute left-0 right-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                                    style={{ top: `${top}px`, height: `${height}px` }}
                                  >
                                    <div className="h-full border-l-4 border-primary px-2.5 py-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                          <p className="text-xs font-semibold text-primary">{item.startTime} - {item.endTime}</p>
                                          <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => handleEditAgendaRecord(item.id)}
                                          >
                                            <Pencil className="h-3.5 w-3.5" />
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => handleDeleteAgendaRecord(item.id)}
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                      <p className="mt-1 truncate text-xs text-muted-foreground">{item.detail}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {agendaTimelineItems.length === 0 ? (
                              <div className="pointer-events-none absolute inset-x-[3.8rem] sm:inset-x-[4.5rem] top-6 rounded-md border border-dashed border-border bg-card/80 p-2.5 text-xs text-muted-foreground backdrop-blur-sm">
                                Nenhum compromisso cadastrado para {formatDateBR(selectedDate)}.
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="default"
                          size="icon"
                          className="absolute left-1/2 top-2 z-10 h-7 w-7 -translate-x-1/2 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary"
                          onClick={() => scrollTimelineBy(-timelineHourHeight * 3)}
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          type="button"
                          variant="default"
                          size="icon"
                          className="absolute bottom-2 left-1/2 z-10 h-7 w-7 -translate-x-1/2 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary"
                          onClick={() => scrollTimelineBy(timelineHourHeight * 3)}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {agendaCalendarPanels.map((panel) => (
                    <div key={panel.id} className={`${panel.visibilityClass} order-1 min-w-0 rounded-xl border border-border bg-card p-3 shadow-sm md:order-2`}>
                      <div className="mb-3 flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                        <p className="text-sm font-semibold text-foreground">{panel.title}</p>
                        <Badge variant="secondary">{datesWithAppointments.length} dias ativos</Badge>
                      </div>

                      <div className="rounded-lg border border-border bg-background p-2 w-full overflow-hidden">
                        <Calendar
                          locale={ptBR}
                          mode="single"
                          month={panel.month}
                          disableNavigation
                          selected={selectedDateObject}
                          onSelect={handleDaySelect}
                          className="w-full pointer-events-auto"
                          classNames={agendaCalendarClassNames}
                          modifiers={{ hasAppointments: datesWithAppointments }}
                          modifiersClassNames={{ hasAppointments: 'font-semibold text-primary' }}
                          components={{ DayContent: AgendaDayContent }}
                        />
                      </div>

                      <div className="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Data selecionada:</span> {formatDateBR(selectedDate)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">Histórico do dia</p>
                    <Badge variant="secondary">{recordsForSelectedDate.length}</Badge>
                  </div>

                  <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                    {recordsForSelectedDate.length === 0 ? (
                      <p className="rounded-md border border-dashed border-border bg-background p-3 text-xs text-muted-foreground">
                        Nenhum registro em {formatDateBR(selectedDate)}.
                      </p>
                    ) : (
                      recordsForSelectedDate.map((record) => (
                        <div key={record.id} className="rounded-md border border-border bg-background p-2.5">
                          <p className="truncate text-sm font-semibold text-foreground">{record.title}</p>
                          <p className="mt-1 text-xs font-medium text-primary">
                            {record.time || '--:--'}{record.endTime ? ` - ${record.endTime}` : ''}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{record.client || 'Sem cliente'} • {record.amount ? formatCurrency(record.amount) : 'Sem valor'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : isFinancial ? (
              <div className="space-y-4">
                <div className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Caixa diário</p>
                    <Input
                      type="date"
                      value={selectedDate}
                      className="h-8 w-auto"
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm">
                    <p className="flex items-center justify-between"><span className="text-muted-foreground">Entradas</span><span>{formatCurrency(dailyFinancial.entradas)}</span></p>
                    <p className="flex items-center justify-between"><span className="text-muted-foreground">Saídas</span><span>{formatCurrency(dailyFinancial.saidas)}</span></p>
                    <p className="flex items-center justify-between font-medium"><span>Saldo do dia</span><span>{formatCurrency(dailyFinancial.saldo)}</span></p>
                  </div>
                </div>

                <div className="rounded-md border border-border p-3">
                  <p className="text-sm font-medium">Caixa mensal</p>
                  <div className="mt-3 grid gap-2 text-sm">
                    <p className="flex items-center justify-between"><span className="text-muted-foreground">Entradas</span><span>{formatCurrency(monthlyFinancial.entradas)}</span></p>
                    <p className="flex items-center justify-between"><span className="text-muted-foreground">Saídas</span><span>{formatCurrency(monthlyFinancial.saidas)}</span></p>
                    <p className="flex items-center justify-between font-medium"><span>Saldo do mês</span><span>{formatCurrency(monthlyFinancial.saldo)}</span></p>
                  </div>
                </div>

                <div className="rounded-md border border-border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">Alertas próximos</p>
                    <Badge variant={dueAlerts.length ? 'destructive' : 'secondary'}>{dueAlerts.length}</Badge>
                  </div>
                  {dueAlerts.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sem vencimentos críticos nos próximos dias.</p>
                  ) : (
                    <div className="space-y-2">
                      {dueAlerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="rounded-md border border-border p-2">
                          <p className="text-sm font-medium truncate">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.daysToDue < 0 ? 'Vencido' : alert.daysToDue === 0 ? 'Vence hoje' : `Vence em ${alert.daysToDue} dia(s)`}
                            {' • '}
                            {alert.amount ? formatCurrency(alert.amount) : 'Sem valor'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : isNewClient ? (
              <div className="space-y-4">
                <div className="rounded-md border border-border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">Follow-ups atrasados</p>
                    <Badge variant={newClientInsights.overdueFollowups ? 'destructive' : 'secondary'}>
                      {newClientInsights.overdueFollowups}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Priorize contatos pendentes para não perder oportunidades.</p>
                </div>

                <div className="rounded-md border border-border p-3">
                  <p className="mb-2 text-sm font-medium">Próximos contatos</p>
                  {records
                    .filter((record) => !!record.nextContact && !isClosedLead(record.stage))
                    .sort((a, b) => (a.nextContact || '').localeCompare(b.nextContact || ''))
                    .slice(0, 5)
                    .map((record) => (
                      <div key={record.id} className="mb-2 rounded-md border border-border p-2 last:mb-0">
                        <p className="truncate text-sm font-medium">{record.title}</p>
                        <p className="text-xs text-muted-foreground">{record.nextContact ? formatDateBR(record.nextContact) : 'Sem data'} • {record.phone || record.email || 'Sem contato'}</p>
                      </div>
                    ))}
                  {records.filter((record) => !!record.nextContact && !isClosedLead(record.stage)).length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum follow-up agendado no momento.</p>
                  ) : null}
                </div>
              </div>
            ) : isReports ? (
              <div className="space-y-4">
                <div className="rounded-md border border-border p-3">
                  <p className="mb-2 text-sm font-medium">Distribuição por tipo</p>
                  {reportsInsights.totalsByType.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sem dados no período atual.</p>
                  ) : (
                    <div className="space-y-2">
                      {reportsInsights.totalsByType.map((type) => (
                        <div key={type.value} className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
                          <span className="text-sm">{type.label}</span>
                          <Badge variant="secondary">{formatCurrency(type.total)}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-md border border-border p-3">
                  <p className="mb-2 text-sm font-medium">Últimos indicadores</p>
                  {records.slice(0, 5).map((record) => (
                    <div key={record.id} className="mb-2 rounded-md border border-border p-2 last:mb-0">
                      <p className="truncate text-sm font-medium">{record.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(reportTypes.find((type) => type.value === record.reportType)?.label || 'Indicador')} • {(record.reportPeriod || record.date.slice(0, 7))}
                      </p>
                    </div>
                  ))}
                  {records.length === 0 ? <p className="text-xs text-muted-foreground">Nenhum indicador cadastrado ainda.</p> : null}
                </div>
              </div>
            ) : isSimpleSales ? (
              <div className="space-y-4">
                <div className="rounded-md border border-border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">Vendas pendentes</p>
                    <Badge variant={simpleSalesInsights.pendingSales > 0 ? 'destructive' : 'secondary'}>
                      {simpleSalesInsights.pendingSales}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Acompanhe os recebimentos para manter o caixa em dia.</p>
                </div>

                <div className="rounded-md border border-border p-3">
                  <p className="mb-2 text-sm font-medium">Últimas vendas</p>
                  {records.slice(0, 5).map((record) => (
                    <div key={record.id} className="mb-2 rounded-md border border-border p-2 last:mb-0">
                      <p className="truncate text-sm font-medium">{record.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(record.client || 'Sem cliente')} • {record.amount ? formatCurrency(record.amount) : 'Sem valor'}
                      </p>
                    </div>
                  ))}
                  {records.length === 0 ? <p className="text-xs text-muted-foreground">Nenhuma venda cadastrada ainda.</p> : null}
                </div>
              </div>
            ) : records.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ainda não há registros. Adicione o primeiro para começar seu controle.
              </p>
            ) : (
              <div className="space-y-3">
                {records.slice(0, 5).map((record) => (
                  <div key={record.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">{record.title}</p>
                      <Badge variant="secondary">{record.date}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{record.client || 'Sem cliente vinculado'}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isAgenda ? (
        <Dialog open={isAgendaModalOpen} onOpenChange={(open) => (open ? setIsAgendaModalOpen(true) : handleCloseAgendaModal())}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecordId ? 'Editar compromisso' : 'Novo compromisso'}</DialogTitle>
              <DialogDescription>Arraste o intervalo de horário; períodos já ocupados ficam bloqueados automaticamente.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agenda-titulo">Título</Label>
                <Input
                  id="agenda-titulo"
                  placeholder="Ex.: Reunião com cliente"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="agenda-data">Dia de início</Label>
                    <Input
                      id="agenda-data"
                      type="date"
                      value={form.date}
                      onChange={(e) => {
                        const nextDate = e.target.value;
                        setForm((prev) => ({ ...prev, date: nextDate }));
                        if (nextDate) setSelectedDate(nextDate);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agenda-inicio">Hora de início</Label>
                    <Input
                      id="agenda-inicio"
                      type="time"
                      step={900}
                      value={form.time}
                      onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agenda-data-termino">Dia de término</Label>
                    <Input
                      id="agenda-data-termino"
                      type="date"
                      value={form.date}
                      onChange={(e) => {
                        const nextDate = e.target.value;
                        setForm((prev) => ({ ...prev, date: nextDate }));
                        if (nextDate) setSelectedDate(nextDate);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agenda-termino">Hora de término</Label>
                    <Input
                      id="agenda-termino"
                      type="time"
                      step={900}
                      value={form.endTime}
                      onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <AgendaTimeRangePicker
                  startTime={form.time}
                  endTime={form.endTime}
                  occupiedRanges={agendaOccupiedRangesForFormDate}
                  onChange={(nextStartTime, nextEndTime) => {
                    setForm((prev) => ({
                      ...prev,
                      time: nextStartTime,
                      endTime: nextEndTime,
                    }));
                  }}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agenda-cliente">Cliente (opcional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="agenda-cliente"
                      placeholder="Nome do cliente"
                      value={form.client}
                      onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      aria-label="Buscar cliente cadastrado"
                      title="Buscar cliente cadastrado"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      aria-label="Adicionar novo cliente"
                      title="Adicionar novo cliente"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agenda-valor">Valor (opcional)</Label>
                  <Input
                    id="agenda-valor"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={form.amount}
                    onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agenda-observacoes">Observações</Label>
                <Textarea
                  id="agenda-observacoes"
                  placeholder="Anote detalhes importantes para não esquecer"
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleSave} className="w-full" disabled={isSubmitting}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {editingRecordId ? 'Atualizar compromisso' : 'Salvar compromisso'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleCloseAgendaModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {!isAgenda ? (
        <Card>
          <CardHeader>
            <CardTitle>Histórico do módulo</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum registro salvo até o momento.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data cadastro</TableHead>
                    <TableHead>{isNewClient ? 'Cliente' : isReports ? 'Indicador' : isSimpleSales ? 'Venda' : 'Título'}</TableHead>
                    <TableHead>Cliente</TableHead>
                    {isFinancial ? (
                      <>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                      </>
                    ) : isNewClient ? (
                      <>
                        <TableHead>Contato</TableHead>
                        <TableHead>Funil</TableHead>
                        <TableHead>Próx. contato</TableHead>
                      </>
                    ) : isReports ? (
                      <>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Data referência</TableHead>
                      </>
                    ) : isSimpleSales ? (
                      <>
                        <TableHead>Qtd.</TableHead>
                        <TableHead>Unitário</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead>Status</TableHead>
                      </>
                    ) : (
                      <TableHead>Data referência</TableHead>
                    )}
                    <TableHead>{isNewClient ? 'Potencial' : isReports ? 'Valor indicador' : 'Valor'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDateTime(record.createdAt)}</TableCell>
                      <TableCell className="font-medium">{record.title}</TableCell>
                      <TableCell>{record.client || '-'}</TableCell>
                      {isFinancial ? (
                        <>
                          <TableCell>
                            <Badge variant={record.transactionType === 'saida' ? 'destructive' : 'default'}>
                              {record.transactionType === 'saida' ? 'Saída' : 'Entrada'}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.category || '-'}</TableCell>
                          <TableCell>{record.dueDate || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={record.isPaid ? 'secondary' : 'outline'}>
                              {record.isPaid ? 'Quitado' : 'Pendente'}
                            </Badge>
                          </TableCell>
                        </>
                      ) : isNewClient ? (
                        <>
                          <TableCell>{record.phone || record.email || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={isClosedLead(record.stage) ? 'secondary' : 'default'}>
                              {leadStages.find((stage) => stage.value === record.stage)?.label || 'Novo lead'}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.nextContact ? formatDateBR(record.nextContact) : '-'}</TableCell>
                        </>
                      ) : isReports ? (
                        <>
                          <TableCell>
                            <Badge variant="secondary">
                              {reportTypes.find((type) => type.value === record.reportType)?.label || 'Indicador'}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.reportPeriod || record.date.slice(0, 7)}</TableCell>
                          <TableCell>{record.date}</TableCell>
                        </>
                      ) : isSimpleSales ? (
                        <>
                          <TableCell>{record.quantity || 1}</TableCell>
                          <TableCell>{record.unitPrice ? formatCurrency(record.unitPrice) : '-'}</TableCell>
                          <TableCell>{record.paymentMethod || '-'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.saleStatus === 'pago'
                                  ? 'secondary'
                                  : record.saleStatus === 'cancelado'
                                    ? 'destructive'
                                    : 'outline'
                              }
                            >
                              {saleStatuses.find((status) => status.value === record.saleStatus)?.label || 'Pendente'}
                            </Badge>
                          </TableCell>
                        </>
                      ) : (
                        <TableCell>{record.date}</TableCell>
                      )}
                      <TableCell>
                        {isNewClient
                          ? record.potentialValue
                            ? formatCurrency(record.potentialValue)
                            : '-'
                          : record.amount
                            ? formatCurrency(record.amount)
                            : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className={`grid md:grid-cols-3 ${isAgenda ? 'gap-3 md:gap-4' : 'gap-4'}`}>
        <Card>
          <CardContent className={isAgenda ? 'p-3 sm:p-4' : 'p-4'}>
            <p className={isAgenda ? 'text-xs sm:text-sm text-muted-foreground' : 'text-sm text-muted-foreground'}>
              {isFinancial
                ? 'Entradas do mês'
                : isNewClient
                  ? 'Novos clientes no mês'
                  : isReports
                    ? 'Indicadores do mês'
                    : isSimpleSales
                      ? 'Vendas concluídas no mês'
                      : 'Registros hoje'}
            </p>
            <p className={isAgenda ? 'text-xl sm:text-2xl font-bold' : 'text-2xl font-bold'}>
              {isFinancial
                ? formatCurrency(monthlyFinancial.entradas)
                : isNewClient
                  ? newClientInsights.monthlyNewClients
                  : isReports
                    ? reportsInsights.monthlyCount
                    : isSimpleSales
                      ? simpleSalesInsights.monthlySalesCount
                      : stats.todayCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={isAgenda ? 'p-3 sm:p-4' : 'p-4'}>
            <p className={isAgenda ? 'text-xs sm:text-sm text-muted-foreground' : 'text-sm text-muted-foreground'}>
              {isFinancial
                ? 'Saídas do mês'
                : isNewClient
                  ? 'Follow-ups para hoje'
                  : isReports
                    ? 'Média por indicador'
                    : isSimpleSales
                      ? 'Faturamento mensal'
                      : 'Total de registros'}
            </p>
            <p className={isAgenda ? 'text-xl sm:text-2xl font-bold' : 'text-2xl font-bold'}>
              {isFinancial
                ? formatCurrency(monthlyFinancial.saidas)
                : isNewClient
                  ? newClientInsights.followupsToday
                  : isReports
                    ? formatCurrency(reportsInsights.averageValue)
                    : isSimpleSales
                      ? formatCurrency(simpleSalesInsights.monthlyRevenue)
                      : stats.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={isAgenda ? 'p-3 sm:p-4' : 'p-4'}>
            <p className={isAgenda ? 'text-xs sm:text-sm text-muted-foreground' : 'text-sm text-muted-foreground'}>
              {isFinancial
                ? 'Saldo do mês'
                : isNewClient
                  ? 'Pipeline ativo estimado'
                  : isReports
                    ? 'Resultado estimado'
                    : isSimpleSales
                      ? 'Ticket médio'
                      : 'Movimentação do mês'}
            </p>
            <p className={isAgenda ? 'text-xl sm:text-2xl font-bold' : 'text-2xl font-bold'}>
              {isFinancial
                ? formatCurrency(monthlyFinancial.saldo)
                : isNewClient
                  ? formatCurrency(newClientInsights.activePipelineValue)
                  : isReports
                    ? formatCurrency(reportsInsights.monthlyResult)
                    : isSimpleSales
                      ? formatCurrency(simpleSalesInsights.averageTicket)
                      : formatCurrency(stats.monthlyTotal)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ControlePessoalModulePage;
