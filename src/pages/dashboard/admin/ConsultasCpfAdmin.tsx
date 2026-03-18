import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import ConsultasCpfTable from '@/components/admin/ConsultasCpfTable';
import ConsultasCpfForm from '@/components/admin/ConsultasCpfForm';
import { consultasCpfService, ConsultaCpf } from '@/services/consultasCpfService';
import { getErrorMessage, getSuccessMessage } from '@/utils/errorMessages';

const ConsultasCpfAdmin = () => {
  const [data, setData] = useState<ConsultaCpf[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedConsulta, setSelectedConsulta] = useState<ConsultaCpf | null>(null);
  const [stats, setStats] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [dataResponse, statsResponse] = await Promise.all([
        consultasCpfService.getAll(page, 50, search),
        consultasCpfService.getStats()
      ]);
      
      if (dataResponse.success && dataResponse.data) {
        setData(dataResponse.data.data);
        setTotal(dataResponse.data.total);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search]);

  const handleSubmit = async (data: Partial<ConsultaCpf>) => {
    try {
      if (modalMode === 'create') {
        await consultasCpfService.create(data as any);
        toast.success(getSuccessMessage('create', 'consulta'));
      } else {
        await consultasCpfService.update(selectedConsulta!.id!, data);
        toast.success(getSuccessMessage('update', 'consulta'));
      }
      setModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Consultas de CPF</h1>
        <Button onClick={() => { setModalMode('create'); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falharam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today || 0}</div>
          </CardContent>
        </Card>
      </div>

      <ConsultasCpfTable
        data={data}
        onEdit={(consulta) => { setSelectedConsulta(consulta); setModalMode('edit'); setModalOpen(true); }}
        onDelete={async (consulta) => {
          if (window.confirm('Tem certeza que deseja excluir esta consulta?')) {
            try {
              await consultasCpfService.delete(consulta.id!);
              toast.success(getSuccessMessage('delete', 'consulta'));
              loadData();
            } catch (error) {
              toast.error(getErrorMessage(error));
            }
          }
        }}
        onView={(consulta) => { setSelectedConsulta(consulta); setModalMode('view'); setModalOpen(true); }}
        loading={loading}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ConsultasCpfForm
            initialData={selectedConsulta}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
            mode={modalMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsultasCpfAdmin;