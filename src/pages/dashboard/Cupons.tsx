import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Ticket, 
  Gift, 
  RefreshCw, 
  Plus,
  Search,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { cupomApiService, Cupom } from '@/services/cupomApiService';
import CupomValidationModal from '@/components/cupons/CupomValidationModal';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

const textByLocale: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    pageTitle: 'Cupons',
    loadingCoupons: 'Carregando cupons...',
    noCouponsFound: 'Nenhum cupom encontrado com os filtros aplicados',
    noCouponsAvailable: 'Nenhum cupom disponível no momento',
    clearFilters: 'Limpar Filtros',
  },
  en: {
    pageTitle: 'Coupons',
    loadingCoupons: 'Loading coupons...',
    noCouponsFound: 'No coupons found with applied filters',
    noCouponsAvailable: 'No coupons available right now',
    clearFilters: 'Clear Filters',
  },
  es: {
    pageTitle: 'Cupones',
    loadingCoupons: 'Cargando cupones...',
    noCouponsFound: 'No se encontraron cupones con los filtros aplicados',
    noCouponsAvailable: 'No hay cupones disponibles en este momento',
    clearFilters: 'Limpiar Filtros',
  },
};

const Cupons = () => {
  const { user, isSupport } = useAuth();
  const { locale } = useLocale();
  const t = textByLocale[locale];
  const [cuponsDisponiveis, setCuponsDisponiveis] = useState<Cupom[]>([]);
  const [filteredCupons, setFilteredCupons] = useState<Cupom[]>([]);
  const [historicoUso, setHistoricoUso] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistorico, setIsLoadingHistorico] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<'all' | 'fixo' | 'percentual'>('all');
  const [selectedCupomCode, setSelectedCupomCode] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatBrazilianCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadCupons = async () => {
    setIsLoading(true);
    try {
      console.log('🎫 [CUPONS] Iniciando carregamento de cupons...');
      const response = await cupomApiService.getCuponsDisponiveis();
      console.log('🎫 [CUPONS] Resposta recebida:', response);
      
      if (response.success && response.data) {
        // Converter valores string para number se necessário
        const cuponsNormalizados = response.data.map(cupom => ({
          ...cupom,
          valor: typeof cupom.valor === 'string' ? parseFloat(cupom.valor) : cupom.valor,
          uso_atual: typeof cupom.uso_atual === 'string' ? parseInt(cupom.uso_atual) : cupom.uso_atual,
          uso_limite: cupom.uso_limite && typeof cupom.uso_limite === 'string' ? parseInt(cupom.uso_limite) : cupom.uso_limite
        }));
        
        setCuponsDisponiveis(cuponsNormalizados);
        setFilteredCupons(cuponsNormalizados);
        console.log('✅ [CUPONS] Cupons carregados com sucesso:', cuponsNormalizados.length);
      } else {
        console.error('❌ [CUPONS] Erro na resposta:', response.error);
        toast.error(response.error || 'Erro ao carregar cupons');
      }
    } catch (error) {
      console.error('❌ [CUPONS] Erro de conexão:', error);
      toast.error('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoricoCupons = async () => {
    if (!user?.id) return;
    
    setIsLoadingHistorico(true);
    try {
      console.log('📜 [CUPONS] Carregando histórico de cupons...');
      const response = await cupomApiService.getCupomHistory(Number(user.id));
      
      if (response.success && response.data) {
        setHistoricoUso(response.data);
        console.log('✅ [CUPONS] Histórico carregado:', response.data.length);
      } else {
        console.error('❌ [CUPONS] Erro ao carregar histórico:', response.error);
        setHistoricoUso([]);
      }
    } catch (error) {
      console.error('❌ [CUPONS] Erro no histórico:', error);
      setHistoricoUso([]);
    } finally {
      setIsLoadingHistorico(false);
    }
  };

  useEffect(() => {
    loadCupons();
    loadHistoricoCupons();
  }, [user?.id]);

  // Filtrar cupons baseado na pesquisa e tipo
  useEffect(() => {
    let filtered = cuponsDisponiveis;

    if (searchTerm) {
      filtered = filtered.filter(cupom =>
        cupom.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cupom.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTipo !== 'all') {
      filtered = filtered.filter(cupom => cupom.tipo === filterTipo);
    }

    setFilteredCupons(filtered);
  }, [cuponsDisponiveis, searchTerm, filterTipo]);

  const handleCupomUsed = (valorAdicionado: number) => {
    // Recarregar lista de cupons e histórico
    loadCupons();
    loadHistoricoCupons();
    setSelectedCupomCode(''); // Limpar seleção após uso
  };

  const handleCupomClick = (cupomCodigo: string) => {
    setSelectedCupomCode(cupomCodigo);
    setIsModalOpen(true);
  };

  const getStatusBadge = (cupom: Cupom) => {
    if (cupom.valido_ate && new Date(cupom.valido_ate) < new Date()) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    if (cupom.uso_limite && cupom.uso_atual >= cupom.uso_limite) {
      return <Badge variant="destructive">Esgotado</Badge>;
    }
    if (historicoUso.some(h => h.codigo === cupom.codigo)) {
      return <Badge variant="secondary">Já Usado</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
      <CheckCircle2 className="h-3 w-3 mr-1" />
      Disponível
    </Badge>;
  };

  const calculateStats = () => {
    // Cupons disponíveis (não usados pelo usuário atual)
    const disponiveis = cuponsDisponiveis.filter(c => 
      !historicoUso.some(h => h.codigo === c.codigo) &&
      !(c.valido_ate && new Date(c.valido_ate) < new Date()) &&
      !(c.uso_limite && c.uso_atual >= c.uso_limite)
    );
    
    // Valor disponível (soma dos cupons não usados)
    const valorDisponivel = disponiveis.reduce((acc, c) => acc + c.valor, 0);
    
    // Cupons usados pelo usuário atual
    const cuponsUsados = historicoUso.length;
    
    // Valor utilizado pelo usuário atual
    const valorUtilizado = historicoUso.reduce((acc, h) => acc + h.valor_desconto, 0);

    return { 
      disponiveis: disponiveis.length, 
      valorDisponivel, 
      cuponsUsados, 
      valorUtilizado 
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-4 sm:space-y-6 relative z-10 px-1 sm:px-0">
      <DashboardTitleCard
        title={t.pageTitle}
        icon={<Ticket className="h-4 w-4 sm:h-5 sm:w-5" />}
      />
      {/* Estatísticas - Cards Compactos (ocultos em mobile) */}
      <div className="hidden sm:grid grid-cols-2 gap-3">
        {/* Card Disponíveis */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-green-800 dark:text-green-200 truncate">
                  Disponíveis
                </h3>
                <p className="text-xs text-green-600 dark:text-green-400 hidden sm:block">
                  Prontos para usar
                </p>
              </div>
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  Qtd
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-1.5 py-0.5">
                  {stats.disponiveis}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  Valor
                </span>
                <span className="text-sm sm:text-lg font-bold text-green-600">
                  {formatBrazilianCurrency(stats.valorDisponivel)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Usados */}
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-purple-800 dark:text-purple-200 truncate">
                  Utilizados
                </h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 hidden sm:block">
                  Já aproveitados
                </p>
              </div>
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                  Qtd
                </span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-1.5 py-0.5">
                  {stats.cuponsUsados}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                  Economia
                </span>
                <span className="text-sm sm:text-lg font-bold text-purple-600">
                  {formatBrazilianCurrency(stats.valorUtilizado)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Lista de Cupons Disponíveis */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              <CardTitle className="text-base sm:text-lg">Cupons Disponíveis</CardTitle>
              <Badge variant="secondary" className="ml-auto text-xs">
                {filteredCupons.length}/{cuponsDisponiveis.length}
              </Badge>
            </div>
            
            {/* Filtros compactos */}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cupom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant={filterTipo === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterTipo('all')}
                  className="flex-1 h-8 text-xs px-2"
                >
                  Todos
                </Button>
                <Button
                  variant={filterTipo === 'fixo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterTipo('fixo')}
                  className="flex-1 h-8 text-xs px-2"
                >
                  Fixo
                </Button>
                <Button
                  variant={filterTipo === 'percentual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterTipo('percentual')}
                  className="flex-1 h-8 text-xs px-2"
                >
                  %
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{t.loadingCoupons}</span>
              </div>
            </div>
          ) : filteredCupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {searchTerm || filterTipo !== 'all' 
                  ? t.noCouponsFound 
                  : t.noCouponsAvailable}
              </p>
              {(searchTerm || filterTipo !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterTipo('all');
                  }}
                  className="mt-4"
                >
                  {t.clearFilters}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
              {filteredCupons.map((cupom) => {
                const isExpired = cupom.valido_ate && new Date(cupom.valido_ate) < new Date();
                const isExhausted = cupom.uso_limite && cupom.uso_atual >= cupom.uso_limite;
                const isUsed = historicoUso.some(h => h.codigo === cupom.codigo);
                const isDisabled = isExpired || isExhausted || isUsed;
                
                return (
                  <Card 
                    key={cupom.id} 
                    className={`border transition-all duration-200 cursor-pointer ${
                      selectedCupomCode === cupom.codigo 
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20 shadow-md' 
                        : 'border-green-200 hover:border-green-400 dark:border-green-800'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (isExpired) {
                        toast.error('Este cupom está expirado');
                        return;
                      }
                      if (isExhausted) {
                        toast.error('Este cupom está esgotado');
                        return;
                      }
                      if (isUsed) {
                        toast.error('Você já usou este cupom');
                        return;
                      }
                      handleCupomClick(cupom.codigo);
                    }}
                  >
                    <CardContent className="p-2.5 sm:p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <Badge 
                            variant="outline" 
                            className={`font-mono text-xs px-1.5 py-0.5 ${
                              selectedCupomCode === cupom.codigo 
                                ? 'border-green-600 text-green-700 bg-green-100' 
                                : 'border-green-300 text-green-700 bg-green-50'
                            }`}
                          >
                            {cupom.codigo}
                          </Badge>
                          {getStatusBadge(cupom)}
                        </div>
                        
                        {cupom.descricao && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {cupom.descricao}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between pt-1 border-t">
                          <Badge variant={cupom.tipo === 'fixo' ? 'default' : 'secondary'} className="text-xs px-1.5 py-0">
                            {cupom.tipo === 'fixo' ? 'R$' : '%'}
                          </Badge>
                          <span className="text-sm sm:text-base font-bold text-primary">
                            {cupom.tipo === 'fixo' 
                              ? formatBrazilianCurrency(cupom.valor)
                              : `${cupom.valor}%`
                            }
                          </span>
                        </div>
                        
                        {cupom.uso_limite && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {cupom.uso_atual}/{cupom.uso_limite} usos
                            </span>
                            <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary"
                                style={{ 
                                  width: `${Math.min((cupom.uso_atual / cupom.uso_limite) * 100, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {cupom.valido_ate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(cupom.valido_ate)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Cupons Usados */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <History className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
            Histórico
            <Badge variant="secondary" className="ml-auto text-xs">
              {historicoUso.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoadingHistorico ? (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Carregando...</span>
              </div>
            </div>
          ) : historicoUso.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum cupom usado ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {historicoUso.map((item, index) => (
                <Card 
                  key={item.id || index} 
                  className="border border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20"
                >
                  <CardContent className="p-2.5 sm:p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        <Badge 
                          variant="outline" 
                          className="font-mono text-xs px-1.5 py-0.5 border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-600 dark:text-purple-300"
                        >
                          {item.codigo}
                        </Badge>
                        <Badge variant="default" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-1.5 py-0.5">
                          <CheckCircle2 className="h-3 w-3" />
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between pt-1 border-t border-purple-200 dark:border-purple-700">
                        <span className="text-xs text-muted-foreground">Valor</span>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          +{formatBrazilianCurrency(item.valor_desconto)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{formatDate(item.used_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de Validação de Cupom */}
      <CupomValidationModal 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        prefilledCupomCode={selectedCupomCode}
        onCupomUsed={handleCupomUsed}
      />
    </div>
  );
};

export default Cupons;