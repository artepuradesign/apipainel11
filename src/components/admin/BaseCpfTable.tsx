import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Eye, User, Calendar, FileText, Camera } from 'lucide-react';
import { BaseCpf } from '@/services/baseCpfService';
import { formatDateOnly } from '@/utils/formatters';
import { baseFotoService, BaseFoto } from '@/services/baseFotoService';
import PhotoZoomOverlay from '@/components/ui/PhotoZoomOverlay';


interface BaseCpfTableProps {
  data: BaseCpf[];
  onEdit: (cpf: BaseCpf) => void;
  onDelete: (cpf: BaseCpf) => void;
  onView: (cpf: BaseCpf) => void;
  onBulkDelete?: (ids: number[]) => void;
  loading?: boolean;
}

const BaseCpfTable: React.FC<BaseCpfTableProps> = ({
  data,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  loading = false
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [fotos, setFotos] = useState<Record<number, string>>({});

  const getPhotoUrl = (filename: string) => {
    const f = (filename || '').trim().replace(/^\/+/, '');
    if (f.startsWith('http')) return f;
    if (f.toLowerCase().startsWith('fotos/')) return `https://api.apipainel.com.br/${f}`;
    return `https://api.apipainel.com.br/fotos/${f}`;
  };

  useEffect(() => {
    const loadFotos = async () => {
      const fotosMap: Record<number, string> = {};
      
      for (const cpf of data) {
        if (cpf.id) {
          const response = await baseFotoService.getByCpfId(cpf.id);
          if (response.success && response.data && response.data.length > 0) {
            fotosMap[cpf.id] = getPhotoUrl(response.data[0].photo);
          }
        }
      }
      
      setFotos(fotosMap);
    };

    if (data.length > 0) {
      loadFotos();
    }
  }, [data]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.filter(cpf => cpf.id).map(cpf => cpf.id!);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length > 0 && onBulkDelete) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Carregando CPFs...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/50" />
          <div>
            <p className="text-lg font-medium text-foreground">Nenhum CPF encontrado</p>
            <p className="text-sm text-muted-foreground">Cadastre o primeiro CPF ou ajuste os filtros de pesquisa</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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

  const allSelected = data.length > 0 && selectedIds.length === data.filter(cpf => cpf.id).length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.filter(cpf => cpf.id).length;

  const getDataQuality = (cpf: BaseCpf): number | null => {
    return cpf.qualidade_dados || null;
  };

  return (
    <div className="w-full">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-muted/30 rounded-lg px-4 py-3 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {selectedIds.length}
              </span>
              <span className="text-sm text-muted-foreground">
                registro{selectedIds.length > 1 ? 's' : ''} selecionado{selectedIds.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="flex-1 sm:flex-none text-muted-foreground hover:text-foreground"
              >
                Limpar seleção
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop and Tablet View - Responsivo sem scroll horizontal */}
      <div className="hidden md:block">
        <Table>
            <TableHeader>
              <TableRow className="border-b-2 hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todos"
                    className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                  />
                </TableHead>
                <TableHead className="font-semibold text-foreground w-20">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Foto
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    CPF / Nome
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Nascimento
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground text-center w-24">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((cpf) => (
                <TableRow 
                  key={cpf.id} 
                  className="border-b hover:bg-muted/30 transition-all duration-200 group"
                >
                  <TableCell>
                    {cpf.id && (
                      <Checkbox
                        checked={selectedIds.includes(cpf.id)}
                        onCheckedChange={(checked) => handleSelectOne(cpf.id!, checked as boolean)}
                        aria-label={`Selecionar ${cpf.nome}`}
                      />
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="w-14 h-[4.5rem]">
                      {cpf.id && fotos[cpf.id] ? (
                        <PhotoZoomOverlay
                          photoUrl={fotos[cpf.id]}
                          alt={`Foto de ${cpf.nome}`}
                        >
                          <div className="w-full h-full border rounded-lg overflow-hidden bg-muted cursor-pointer">
                            <img
                              src={fotos[cpf.id]}
                              alt={`Foto de ${cpf.nome}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = 'https://preview--apipainel-12112500.lovable.app/assets/placeholder-photo-CJ4TE92a.png';
                              }}
                            />
                          </div>
                        </PhotoZoomOverlay>
                      ) : (
                        <div className="w-full h-full border rounded-lg flex items-center justify-center bg-muted/30">
                          <Camera className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 pr-2">
                    <div className="space-y-1">
                      <div className="text-xs md:text-sm text-primary bg-primary/5 px-2 py-1 rounded-md inline-block">
                        {formatCpf(cpf.cpf)}
                      </div>
                      <div className="text-foreground text-xs md:text-sm break-words">
                        {cpf.nome}
                      </div>
                      <div className="text-xs text-muted-foreground lg:hidden">
                        {cpf.data_nascimento ? formatDateOnly(cpf.data_nascimento) : 'Nascimento não informado'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 hidden lg:table-cell">
                    <div className="text-sm text-muted-foreground">
                      {cpf.data_nascimento ? formatDateOnly(cpf.data_nascimento) : 'Não informado'}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 pl-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); onView(cpf); }}
                          className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); onEdit(cpf); }}
                          className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); onDelete(cpf); }}
                          className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {getDataQuality(cpf) !== null && (
                        <div className="w-full max-w-[120px] mx-auto">
                          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-500 ease-out animate-scale-in"
                              style={{ width: `${getDataQuality(cpf)}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-muted-foreground text-center mt-0.5">
                            {getDataQuality(cpf)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="md:hidden space-y-3 p-4">
        {data.map((cpf) => (
          <div 
            key={cpf.id} 
            className="bg-card border border-border rounded-lg p-4 space-y-3 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              {cpf.id && (
                <Checkbox
                  checked={selectedIds.includes(cpf.id)}
                  onCheckedChange={(checked) => handleSelectOne(cpf.id!, checked as boolean)}
                  aria-label={`Selecionar ${cpf.nome}`}
                  className="mt-1"
                />
              )}
              <div className="w-14 h-[4.5rem] flex-shrink-0">
                {cpf.id && fotos[cpf.id] ? (
                  <div className="w-full h-full border rounded-lg overflow-hidden bg-muted">
                    <img
                      src={fotos[cpf.id]}
                      alt={`Foto de ${cpf.nome}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://preview--apipainel-12112500.lovable.app/assets/placeholder-photo-CJ4TE92a.png';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full border rounded-lg flex items-center justify-center bg-muted/30">
                    <Camera className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="text-sm text-primary bg-primary/5 px-3 py-1 rounded-md inline-block">
                  {formatCpf(cpf.cpf)}
                </div>
                <div className="text-foreground text-sm">
                  {cpf.nome}
                </div>
                {cpf.data_nascimento && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Nascimento: {formatDateOnly(cpf.data_nascimento)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onView(cpf); }}
                  className="h-8 px-3 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  title="Visualizar Detalhes"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onEdit(cpf); }}
                  className="h-8 px-3 hover:bg-green-50 hover:text-green-600 transition-colors"
                  title="Editar"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onDelete(cpf); }}
                  className="h-8 px-3 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Deletar"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Deletar
                </Button>
              </div>
              {getDataQuality(cpf) !== null && (
                <div className="w-full px-2">
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-500 ease-out animate-scale-in"
                      style={{ width: `${getDataQuality(cpf)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-1">
                    Qualidade: {getDataQuality(cpf)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BaseCpfTable;