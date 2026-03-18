import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { baseReceitaService, BaseReceita } from '@/services/baseReceitaService';
import { useBaseReceita } from '@/hooks/useBaseReceita';
import { getErrorMessage, getSuccessMessage } from '@/utils/errorMessages';
import BaseReceitaTable from '@/components/admin/BaseReceitaTable';
import BaseReceitaForm from '@/components/admin/BaseReceitaForm';

const BaseReceitaAdmin = () => {
  const [data, setData] = useState<BaseReceita[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedReceita, setSelectedReceita] = useState<BaseReceita | null>(null);
  const [stats, setStats] = useState<any>({});

  const { createReceita, updateReceita, deleteReceita } = useBaseReceita();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await baseReceitaService.getAll(50, (page - 1) * 50, search);
      
      if (response.success && response.data) {
        setData(response.data.data);
        setTotal(response.data.total);
      } else {
        toast.error(response.error || 'Erro ao carregar dados da Receita Federal');
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

  const handleSubmit = async (formData: Partial<BaseReceita>) => {
    try {
      if (modalMode === 'create') {
        const success = await createReceita(formData as any);
        if (success) {
          toast.success('Dados da Receita Federal cadastrados com sucesso');
          setModalOpen(false);
          loadData();
        }
      } else if (selectedReceita) {
        const success = await updateReceita(selectedReceita.id!, formData);
        if (success) {
          toast.success('Dados da Receita Federal atualizados com sucesso');
          setModalOpen(false);
          loadData();
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (receita: BaseReceita) => {
    if (window.confirm('Tem certeza que deseja excluir estes dados da Receita Federal?')) {
      try {
        const success = await deleteReceita(receita.id!);
        if (success) {
          loadData();
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Base da Receita Federal</h1>
        <Button onClick={() => { setModalMode('create'); setSelectedReceita(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Registro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <BaseReceitaTable
        data={data}
        onEdit={(receita) => { setSelectedReceita(receita); setModalMode('edit'); setModalOpen(true); }}
        onDelete={handleDelete}
        onView={(receita) => { setSelectedReceita(receita); setModalMode('view'); setModalOpen(true); }}
        loading={loading}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? 'Novo Registro' : 
               modalMode === 'edit' ? 'Editar Registro' : 'Visualizar Registro'}
            </DialogTitle>
          </DialogHeader>
          <BaseReceitaForm
            initialData={selectedReceita}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
            mode={modalMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BaseReceitaAdmin;