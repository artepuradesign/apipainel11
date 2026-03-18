import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, RefreshCw, Trash2, Database } from 'lucide-react';
import { toast } from "sonner";
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import BaseCpfTable from '@/components/admin/BaseCpfTable';
import CpfSearchInput from '@/components/admin/CpfSearchInput';
import BaseCpfForm from '@/components/admin/BaseCpfForm';
import { baseCpfService, BaseCpf } from '@/services/baseCpfService';
import { getErrorMessage, getSuccessMessage } from '@/utils/errorMessages';

const BaseCpfAdmin = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<BaseCpf[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [nameSearchInput, setNameSearchInput] = useState('');
  const [searchType, setSearchType] = useState<'cpf' | 'name'>('cpf');
  const [page, setPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCpf, setSelectedCpf] = useState<BaseCpf | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📊 [BASE_CPF_ADMIN] Loading data - Page:', page, 'Search:', search);
      const response = await baseCpfService.getAll(page, recordsPerPage, search);
      console.log('📊 [BASE_CPF_ADMIN] Response:', response);
      
      if (response.success && response.data) {
        setData(response.data.data || []);
        setTotal(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.total_pages || 0);
        console.log('✅ [BASE_CPF_ADMIN] Data loaded:', response.data.data?.length || 0, 'items');
      } else {
        console.error('❌ [BASE_CPF_ADMIN] Failed to load data:', response.error);
        toast.error(response.error || 'Erro ao carregar dados');
        setData([]);
        setTotal(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('❌ [BASE_CPF_ADMIN] Load error:', error);
      toast.error(getErrorMessage(error));
      setData([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [page, search, recordsPerPage]);

  const handleEdit = (cpf: BaseCpf) => {
    console.log('✏️ [BASE_CPF_ADMIN] Edit CPF:', cpf);
    navigate(`/dashboard/admin/cpf-edit/${cpf.id}`);
  };

  const handleView = (cpf: BaseCpf) => {
    console.log('👁️ [BASE_CPF_ADMIN] View CPF:', cpf);
    navigate(`/dashboard/admin/cpf-view/${cpf.id}`);
  };

  const handleDelete = async (cpf: BaseCpf) => {
    if (!cpf.id) {
      toast.error('ID do CPF não encontrado');
      return;
    }

    if (window.confirm(`Tem certeza que deseja deletar o CPF ${cpf.cpf} - ${cpf.nome}?`)) {
      try {
        console.log('🗑️ [BASE_CPF_ADMIN] Deleting CPF:', cpf.id);
        
        const response = await baseCpfService.delete(cpf.id);
        console.log('✅ [BASE_CPF_ADMIN] Delete response:', response);
        
        if (response.success) {
          toast.success('CPF deletado com sucesso');
          loadData();
        } else {
          throw new Error(response.error || 'Erro ao deletar CPF');
        }
      } catch (error) {
        console.error('❌ [BASE_CPF_ADMIN] Delete error:', error);
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    if (ids.length === 0) return;

    if (window.confirm(`Tem certeza que deseja deletar ${ids.length} registro${ids.length > 1 ? 's' : ''}?`)) {
      try {
        console.log('🗑️ [BASE_CPF_ADMIN] Bulk deleting CPFs:', ids);
        
        const deletePromises = ids.map(id => baseCpfService.delete(id));
        const results = await Promise.allSettled(deletePromises);
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        if (successful > 0) {
          toast.success(`${successful} registro${successful > 1 ? 's' : ''} deletado${successful > 1 ? 's' : ''} com sucesso`);
        }
        if (failed > 0) {
          toast.error(`${failed} registro${failed > 1 ? 's' : ''} falharam ao deletar`);
        }
        
        loadData();
      } catch (error) {
        console.error('❌ [BASE_CPF_ADMIN] Bulk delete error:', error);
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`⚠️ ATENÇÃO: Você está prestes a deletar TODOS os ${total.toLocaleString('pt-BR')} registros da base de dados!\n\nEsta ação é IRREVERSÍVEL e pode levar alguns minutos.\n\nTem certeza que deseja continuar?`)) {
      return;
    }

    if (!window.confirm(`CONFIRMAÇÃO FINAL:\n\nDigite "DELETAR TUDO" para confirmar que você realmente deseja apagar todos os registros.`)) {
      return;
    }

    try {
      setLoading(true);
      toast.loading('Deletando todos os registros...');
      
      const allIds = data.filter(cpf => cpf.id).map(cpf => cpf.id!);
      
      if (allIds.length === 0) {
        toast.error('Nenhum registro para deletar');
        return;
      }

      const deletePromises = allIds.map(id => baseCpfService.delete(id));
      const results = await Promise.allSettled(deletePromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      toast.dismiss();
      
      if (successful > 0) {
        toast.success(`${successful} registro${successful > 1 ? 's' : ''} deletado${successful > 1 ? 's' : ''} com sucesso`);
      }
      if (failed > 0) {
        toast.error(`${failed} registro${failed > 1 ? 's' : ''} falharam ao deletar`);
      }
      
      loadData();
    } catch (error) {
      console.error('❌ [BASE_CPF_ADMIN] Delete all error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<BaseCpf>) => {
    try {
      setModalLoading(true);
      console.log('🔄 [BASE_CPF_ADMIN] Submitting form with mode:', modalMode, 'Data:', data);
      
      if (modalMode === 'create') {
        const response = await baseCpfService.create(data as any);
        console.log('✅ [BASE_CPF_ADMIN] Create response:', response);
        if (response.success) {
          toast.success('CPF criado com sucesso');
        } else {
          throw new Error(response.error || 'Erro ao criar CPF');
        }
      } else if (modalMode === 'edit' && selectedCpf?.id) {
        const response = await baseCpfService.update(selectedCpf.id, data);
        console.log('✅ [BASE_CPF_ADMIN] Update response:', response);
        if (response.success) {
          toast.success('CPF atualizado com sucesso');
        } else {
          throw new Error(response.error || 'Erro ao atualizar CPF');
        }
      }
      setModalOpen(false);
      setSelectedCpf(null);
      loadData();
    } catch (error) {
      console.error('❌ [BASE_CPF_ADMIN] Submit error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/dashboard/api-externa/cadastrar-cpf');
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
  };

  const handleNameSearchInput = (value: string) => {
    setNameSearchInput(value);
  };

  const handleSearch = (type: 'cpf' | 'name') => {
    const searchValue = type === 'cpf' ? searchInput.trim() : nameSearchInput.trim();
    if (searchValue.length >= 3) {
      setSearch(searchValue);
      setSearchType(type);
      setPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setNameSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'cpf' | 'name') => {
    if (e.key === 'Enter') {
      handleSearch(type);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com DashboardTitleCard */}
      <DashboardTitleCard
        title="Base de CPF"
        subtitle="Gerencie a base de dados de CPF"
        icon={<Database className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/admin"
        right={
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} variant="outline" size="icon" disabled={loading} className="h-9 w-9">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={handleCreateNew} size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              Novo CPF
            </Button>
            <Button onClick={handleCreateNew} size="icon" className="sm:hidden h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
            {total > 0 && (
              <Button 
                onClick={handleDeleteAll} 
                variant="destructive" 
                size="icon"
                disabled={loading}
                title={`Deletar todos os ${total} registros`}
                className="h-9 w-9"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        }
      />

      {/* Search Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* CPF Search */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Pesquisar CPFs</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Digite os números do CPF
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex flex-col gap-3">
              <div className="flex-1">
                <CpfSearchInput
                  value={searchInput}
                  onChange={handleSearchInput}
                  onKeyPress={(e) => handleKeyPress(e, 'cpf')}
                  disabled={loading}
                  placeholder="Digite..."
                />
              </div>
              <Button
                onClick={() => handleSearch('cpf')}
                disabled={searchInput.length < 3 || loading}
                className="w-full"
                size="sm"
              >
                <Search className="h-4 w-4 mr-2" />
                Pesquisar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Name Search */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Pesquisar Nome</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Digite o nome para pesquisar
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex flex-col gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Digite o nome..."
                  value={nameSearchInput}
                  onChange={(e) => handleNameSearchInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'name')}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={() => handleSearch('name')}
                disabled={nameSearchInput.length < 3 || loading}
                className="w-full"
                size="sm"
              >
                <Search className="h-4 w-4 mr-2" />
                Pesquisar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Lista de CPFs</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {data.length > 0 
              ? `Exibindo ${data.length} de ${total.toLocaleString('pt-BR')} registro${total !== 1 ? 's' : ''}`
              : 'Nenhum CPF encontrado'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <BaseCpfTable
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onBulkDelete={handleBulkDelete}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="flex flex-col items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
          {/* Info Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-full text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium">
              Página {page} de {totalPages}
            </span>
            <span className="hidden sm:inline">
              {total.toLocaleString('pt-BR')} registro{total !== 1 ? 's' : ''} total
            </span>
            <div className="flex items-center gap-2">
              <label className="whitespace-nowrap text-xs">Por página:</label>
              <Select 
                value={recordsPerPage.toString()} 
                onValueChange={(value) => {
                  setRecordsPerPage(Number(value));
                  setPage(1);
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-[65px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Pagination Buttons */}
          <div className="flex items-center gap-2 w-full justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="h-8 px-3 text-xs sm:text-sm"
            >
              Anterior
            </Button>

            {/* Páginas visíveis - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {page > 2 && totalPages > 4 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(1)}
                    className="h-8 w-8 p-0"
                  >
                    1
                  </Button>
                  {page > 3 && <span className="px-2 text-muted-foreground">...</span>}
                </>
              )}
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 2) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 1) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 p-0 ${
                      page === pageNum 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              {page < totalPages - 1 && totalPages > 4 && (
                <>
                  {page < totalPages - 2 && <span className="px-2 text-muted-foreground">...</span>}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(totalPages)}
                    className="h-8 w-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile: Página atual */}
            <span className="md:hidden text-sm font-medium px-3">
              {page}/{totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
              className="h-8 px-3 text-xs sm:text-sm"
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? 'Novo CPF' : 
               modalMode === 'edit' ? 'Editar CPF' : 'Visualizar CPF'}
            </DialogTitle>
          </DialogHeader>
          <BaseCpfForm
            initialData={selectedCpf}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
            mode={modalMode}
            loading={modalLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BaseCpfAdmin;
