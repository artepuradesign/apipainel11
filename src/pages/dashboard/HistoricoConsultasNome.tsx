import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, FileText, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { consultationApiService } from '@/services/consultationApiService';
import SimpleTitleBar from '@/components/dashboard/SimpleTitleBar';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ConsultaNomeHistoryItem {
  id: number;
  document: string;
  cost: number;
  status: string;
  created_at: string;
  module_type?: string;
  result_data?: any;
  metadata?: {
    module_title?: string;
    page_route?: string;
    total_encontrados?: number;
  };
}

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatShortDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const HistoricoConsultasNome: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ConsultaNomeHistoryItem[]>([]);
  const [page, setPage] = useState(1);

  const limit = isMobile ? 8 : 10;

  const load = async () => {
    setLoading(true);
    try {
      const response = await consultationApiService.getConsultationHistory(200, 0);

      if (response.success && response.data && Array.isArray(response.data)) {
        // Filtrar apenas consultas de nome completo cobradas
        const nomeConsultations = response.data.filter((item: any) => {
          const moduleType = (item?.module_type || '').toLowerCase();
          const pageRoute = item?.metadata?.page_route || '';
          const status = item?.status || '';
          const cost = parseFloat(item?.cost || 0);
          
          const isNomeConsulta = moduleType === 'nome' || pageRoute === '/dashboard/consultar-nome-completo';
          const foiCobrada = status === 'completed' && cost > 0;
          
          return isNomeConsulta && foiCobrada;
        });

        setItems(nomeConsultations);
      } else {
        setItems([]);
      }
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * limit;
    return items.slice(start, start + limit);
  }, [items, page, limit]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const title = useMemo(() => {
    return `Histórico Nome • ${total}`;
  }, [total]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 max-w-full overflow-x-hidden px-1 sm:px-0">
      <div className="w-full max-w-6xl mx-auto">
        <SimpleTitleBar
          title={title}
          icon={<FileText className="h-4 w-4" />}
          onBack={handleBack}
          right={
            <Button
              variant="ghost"
              size="sm"
              onClick={load}
              disabled={loading}
              className="h-8 w-8 p-0"
              aria-label="Atualizar"
              title="Atualizar"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          }
        />

        <Card className="mt-3 sm:mt-4 md:mt-6">
          <CardContent className="p-2 sm:p-4 md:px-6">
            {loading ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary" />
                <span className="ml-2 sm:ml-3 text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
                Nenhuma consulta de nome encontrada.
              </div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {paginatedItems.map((item) => {
                  const modulo = item.metadata?.module_title || 'NOME COMPLETO';
                  const moduloShort = isMobile ? modulo.replace('NOME ', '').slice(0, 10) : modulo;
                  const isCompleted = item.status === 'completed';
                  const totalEncontrados = item.metadata?.total_encontrados || 0;

                  return (
                    <div
                      key={`consultation-${item.id}`}
                      className="w-full rounded-lg border border-border bg-card p-2.5 sm:p-3"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Status indicator */}
                        <span
                          className={`flex-shrink-0 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${
                            isCompleted ? 'bg-green-500' : 'bg-muted-foreground'
                          }`}
                          aria-label={isCompleted ? 'Concluída' : item.status}
                        />

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-[250px]">
                                  {item.document || 'Nome consultado'}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 h-4 sm:h-5 flex-shrink-0"
                                >
                                  {moduloShort}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                  {isMobile ? formatShortDate(item.created_at) : formatFullDate(item.created_at)}
                                </span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                  • {totalEncontrados} resultado(s)
                                </span>
                              </div>
                            </div>

                            {/* Right side - Value */}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                              <div className="text-right">
                                <div className="text-xs sm:text-sm font-medium text-destructive">
                                  {formatCurrency(Number(item.cost) || 0)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && items.length > 0 && (
              <div className="mt-3 sm:mt-4 border-t border-border pt-3 sm:pt-4">
                <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    {(page - 1) * limit + 1}-{Math.min(page * limit, total)} de {total}
                  </div>

                  <Pagination className="justify-center sm:justify-end">
                    <PaginationContent className="gap-0.5 sm:gap-1">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className={`h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-2.5 ${page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(totalPages, isMobile ? 3 : 5) }, (_, i) => {
                        let pageNum;
                        const maxVisible = isMobile ? 3 : 5;
                        if (totalPages <= maxVisible) {
                          pageNum = i + 1;
                        } else if (page <= Math.ceil(maxVisible / 2)) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - Math.floor(maxVisible / 2)) {
                          pageNum = totalPages - maxVisible + 1 + i;
                        } else {
                          pageNum = page - Math.floor(maxVisible / 2) + i;
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setPage(pageNum)}
                              isActive={page === pageNum}
                              className="cursor-pointer h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs sm:text-sm"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalPages > (isMobile ? 3 : 5) && page < totalPages - (isMobile ? 1 : 2) && (
                        <PaginationItem>
                          <PaginationEllipsis className="h-8 w-8 sm:h-9" />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          className={`h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-2.5 ${page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoricoConsultasNome;
