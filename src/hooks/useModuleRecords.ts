import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { moduleHistoryService } from '@/services/moduleHistoryService';

/**
 * Hook que verifica se o usuário possui registros em módulos específicos.
 * Usado para permitir acesso a módulos com histórico mesmo sem saldo suficiente.
 * 
 * Utiliza localStorage como cache para evitar chamadas repetitivas à API.
 */
export const useModuleRecords = () => {
  const { user } = useAuth();
  const [modulesWithRecords, setModulesWithRecords] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [checkedRoutes, setCheckedRoutes] = useState<Set<string>>(new Set());

  // Carregar cache do localStorage na inicialização
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const cacheKey = `module_records_${user.id}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { routes: string[]; checked: string[]; ts: number };
        // Cache válido por 5 minutos
        if (Date.now() - parsed.ts < 5 * 60 * 1000) {
          setModulesWithRecords(new Set(parsed.routes));
          setCheckedRoutes(new Set(parsed.checked || []));
          setIsLoading(false);
          return;
        }
      }
    } catch { /* ignore */ }

    setIsLoading(false);
  }, [user]);

  /**
   * Verifica uma rota específica sob demanda (lazy check).
   */
  const checkRouteRecords = useCallback(async (route: string) => {
    if (!user || checkedRoutes.has(route)) return;

    // Marcar como já verificada para evitar chamadas duplicadas
    setCheckedRoutes(prev => {
      const next = new Set(prev);
      next.add(route);
      return next;
    });

    try {
      const stats = await moduleHistoryService.getStats(route);
      if (stats.success && stats.data.total > 0) {
        setModulesWithRecords(prev => {
          const next = new Set(prev);
          next.add(route);

          // Atualizar cache
          if (user) {
            try {
              const allChecked = new Set(checkedRoutes);
              allChecked.add(route);
              localStorage.setItem(
                `module_records_${user.id}`,
                JSON.stringify({ routes: Array.from(next), checked: Array.from(allChecked), ts: Date.now() })
              );
            } catch { /* ignore */ }
          }

          return next;
        });
      }
    } catch {
      // Silenciar erros
    }
  }, [user, checkedRoutes]);

  /**
   * Verifica se o módulo na rota informada possui registros do usuário.
   * Também dispara verificação lazy se ainda não foi checada.
   */
  const hasRecordsInModule = useCallback((moduleRoute: string): boolean => {
    // Disparar verificação lazy se ainda não foi checada
    if (!checkedRoutes.has(moduleRoute)) {
      checkRouteRecords(moduleRoute);
    }
    return modulesWithRecords.has(moduleRoute);
  }, [modulesWithRecords, checkedRoutes, checkRouteRecords]);

  /**
   * Marca manualmente um módulo como tendo registros (após criação de novo registro).
   */
  const markModuleWithRecords = useCallback((moduleRoute: string) => {
    setModulesWithRecords(prev => {
      const next = new Set(prev);
      next.add(moduleRoute);

      // Atualizar cache
      if (user) {
        try {
          localStorage.setItem(
            `module_records_${user.id}`,
            JSON.stringify({ routes: Array.from(next), checked: Array.from(checkedRoutes), ts: Date.now() })
          );
        } catch { /* ignore */ }
      }

      return next;
    });
  }, [user, checkedRoutes]);

  return { hasRecordsInModule, markModuleWithRecords, isLoading };
};
