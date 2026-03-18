import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CreditCard, Hammer, CheckCircle2, Loader2 } from 'lucide-react';
import { pdfRgService } from '@/services/pdfRgService';
import { editarPdfService } from '@/services/pdfPersonalizadoService';
import { useNavigate } from 'react-router-dom';

const AdminServicesSummary = () => {
  const [counts, setCounts] = useState({ realizado: 0, pagamento_confirmado: 0, em_confeccao: 0, entregue: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [r1, r2, r3, r4, p1, p2, p3, p4] = await Promise.all([
          pdfRgService.listar({ status: 'realizado', limit: 1 }),
          pdfRgService.listar({ status: 'pagamento_confirmado', limit: 1 }),
          pdfRgService.listar({ status: 'em_confeccao', limit: 1 }),
          pdfRgService.listar({ status: 'entregue', limit: 1 }),
          editarPdfService.listar({ status: 'realizado', limit: 1 }),
          editarPdfService.listar({ status: 'pagamento_confirmado', limit: 1 }),
          editarPdfService.listar({ status: 'em_confeccao', limit: 1 }),
          editarPdfService.listar({ status: 'entregue', limit: 1 }),
        ]);
        const get = (r: any) => (r.success && r.data ? r.data.pagination.total : 0);
        setCounts({
          realizado: get(r1) + get(p1),
          pagamento_confirmado: get(r2) + get(p2),
          em_confeccao: get(r3) + get(p3),
          entregue: get(r4) + get(p4),
        });
      } catch (e) {
        console.warn('Erro ao carregar resumo de serviços:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: 'Pendentes', value: counts.realizado, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Pgto Confirmado', value: counts.pagamento_confirmado, icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Em Confecção', value: counts.em_confeccao, icon: Hammer, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Finalizados', value: counts.entregue, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`cursor-pointer hover:shadow-md transition-shadow border ${card.border}`}
          onClick={() => navigate('/dashboard/admin/pedidos')}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`p-2.5 rounded-xl ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
              ) : (
                <p className="text-xl font-bold">{card.value}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminServicesSummary;
