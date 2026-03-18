import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Loader2, Trash2, Search, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';
import ScrollToTop from '@/components/ui/scroll-to-top';
import { rg2026Service, type Rg2026Registro } from '@/services/rg2026Service';

const ITEMS_PER_PAGE = 20;
const MODULE_TITLE = 'RG 2026';
const MODULE_BACK_ROUTE = '/dashboard/rg-2026';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const formatFullDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const Rg2026Todos = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [rows, setRows] = useState<Rg2026Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isAdminOrSupport = profile?.user_role === 'suporte' || (user as any)?.user_role === 'suporte';

  const load = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        const offset = (page - 1) * ITEMS_PER_PAGE;

        const userId = !isAdminOrSupport && user?.id ? Number(user.id) : undefined;
        const result = await rg2026Service.list({
          limit: ITEMS_PER_PAGE,
          offset,
          ...(userId ? { user_id: userId } : {}),
          ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
        });

        if (!result.success || !result.data) {
          setRows([]);
          setTotal(0);
          return;
        }

        setRows(result.data.data || []);
        setTotal(result.data.pagination?.total || 0);
      } catch (e) {
        console.error('Erro ao carregar RG-2026:', e);
        setRows([]);
        setTotal(0);
        toast.error('Erro ao carregar cadastros');
      } finally {
        setLoading(false);
      }
    },
    [isAdminOrSupport, user?.id, searchQuery]
  );

  useEffect(() => {
    load(currentPage);
  }, [currentPage, load]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const handleRefresh = async () => {
    setRefreshing(true);
    await load(currentPage);
    setRefreshing(false);
    toast.success('Lista atualizada');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await rg2026Service.delete(deleteId);
      if (!res.success) throw new Error(res.error || 'Falha ao excluir');
      toast.success('Cadastro excluído com sucesso');
      setDeleteId(null);
      // Recarrega a página atual (ou volta uma página se ficou vazia)
      await load(currentPage);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Erro ao excluir');
    } finally {
      setDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const todayStr = new Date().toDateString();
    const today = rows.filter(r => new Date(r.created_at).toDateString() === todayStr).length;
    return { total, today };
  }, [rows, total]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    await load(1);
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 px-2 sm:px-0 pb-6">
      <ScrollToTop />
      <SimpleTitleBar title={`${MODULE_TITLE} · Histórico`} onBack={() => navigate(MODULE_BACK_ROUTE)} />

      <Card>
        <CardContent className="p-3 sm:p-4">
          <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar busca"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="outline">Buscar</Button>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing} title="Atualizar">
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </form>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{stats.total} registro(s)</span>
            <span>{stats.today} hoje</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este cadastro? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="w-full overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Carregando cadastros...</span>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Nenhum cadastro encontrado</p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-3">
              {rows.map((r) => {
                const qrToken = String(r.numero_qrcode || '').trim();
                const qrValidationUrl = qrToken
                  ? `https://qr.apipainel.com.br/qrvalidation/?token=${encodeURIComponent(qrToken)}&ref=${encodeURIComponent(qrToken)}&cod=${encodeURIComponent(qrToken)}`
                  : '';

                const qrImageUrl = qrToken
                  ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrValidationUrl || qrToken)}`
                  : '';

                return (
                  <div key={r.id} className="rounded-lg border bg-card p-2 sm:p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-semibold truncate">{r.nome}</div>
                          <Badge variant="outline" className="text-[10px] h-5 px-2">Concluída</Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">CPF: {r.cpf}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Nasc.: {formatDate(r.dt_nascimento)} · Cadastro: {formatFullDate(r.created_at)}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(r.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {(r.foto_base64 || r.assinatura_base64 || qrToken) && (
                      <div className="mt-2 grid grid-cols-3 gap-2 sm:flex sm:items-start">
                        {/* FOTO: desktop em proporção 3x4 (sem estourar a largura) */}
                        <div className="min-w-0 sm:flex-none">
                          {r.foto_base64 ? (
                            <img
                              src={r.foto_base64}
                              alt="Foto 3x4 do registro"
                              className="w-full h-16 sm:w-[72px] sm:h-24 rounded-md border bg-background object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-16 sm:w-[72px] sm:h-24 rounded-md border bg-background" />
                          )}
                        </div>

                        {/* QR: quadrado com a mesma altura da foto */}
                        <div className="min-w-0 sm:flex-none">
                          {qrToken ? (
                            <img
                              src={qrImageUrl}
                              alt="QR Code do registro"
                              className="w-full h-16 sm:w-24 sm:h-24 rounded-md border bg-background object-contain p-1"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-16 sm:w-24 sm:h-24 rounded-md border bg-background" />
                          )}
                        </div>

                        {/* Assinatura: mantém como estava (preenche o restante no desktop) */}
                        <div className="min-w-0 sm:flex-1">
                          {r.assinatura_base64 ? (
                            <img
                              src={r.assinatura_base64}
                              alt="Assinatura do registro"
                              className="w-full h-16 sm:h-24 rounded-md border bg-background object-contain p-1"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-16 sm:h-24 rounded-md border bg-background" />
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-1.5">
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Nome social</div>
                        <div className="text-[11px] font-medium break-words">{r.nome_social || '-'}</div>
                      </div>
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Sexo</div>
                        <div className="text-[11px] font-medium break-words">{r.sexo || '-'}</div>
                      </div>
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Nacionalidade</div>
                        <div className="text-[11px] font-medium break-words">{r.nacionalidade || '-'}</div>
                      </div>
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Naturalidade</div>
                        <div className="text-[11px] font-medium break-words">{r.naturalidade || '-'}</div>
                      </div>

                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Validade</div>
                        <div className="text-[11px] font-medium break-words">{r.validade || '-'}</div>
                      </div>
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Nº folha</div>
                        <div className="text-[11px] font-medium break-words">{r.numero_folha || '-'}</div>
                      </div>
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Nº QR</div>
                        <div className="text-[11px] font-medium break-words">{r.numero_qrcode || '-'}</div>
                      </div>
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Diretor</div>
                        <div className="text-[11px] font-medium break-words">{r.diretor || '-'}</div>
                      </div>

                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Mãe</div>
                        <div className="text-[11px] font-medium break-words">{r.filiacao_mae || '-'}</div>
                      </div>
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Pai</div>
                        <div className="text-[11px] font-medium break-words">{r.filiacao_pai || '-'}</div>
                      </div>
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Órgão</div>
                        <div className="text-[11px] font-medium break-words">{r.orgao_expedidor || '-'}</div>
                      </div>
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Local</div>
                        <div className="text-[11px] font-medium break-words">{r.local_emissao || '-'}</div>
                      </div>

                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Emissão</div>
                        <div className="text-[11px] font-medium break-words">{r.dt_emissao ? formatDate(r.dt_emissao) : '-'}</div>
                      </div>
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Atualizado</div>
                        <div className="text-[11px] font-medium break-words">{formatFullDate(r.updated_at)}</div>
                      </div>
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">ID / Módulo</div>
                        <div className="text-[11px] font-medium break-words">#{r.id} · {r.module_id}</div>
                      </div>
                      <div className="rounded-md border bg-background p-1.5">
                        <div className="text-[10px] text-muted-foreground">Usuário</div>
                        <div className="text-[11px] font-medium break-words">{r.user_id ?? '-'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-3 sm:px-4 py-3">
              <span className="text-xs text-muted-foreground hidden sm:block">
                Página {currentPage} de {totalPages} · {total} registros
              </span>
              <div className="flex items-center gap-1 mx-auto sm:mx-0">
                <Button variant="outline" size="sm" className="h-8" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground sm:hidden">{currentPage}/{totalPages}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => navigate(MODULE_BACK_ROUTE)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    </div>
  );
};

export default Rg2026Todos;
