import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from 'lucide-react';
import { BaseReceita } from '@/services/baseReceitaService';

interface BaseReceitaTableProps {
  data: BaseReceita[];
  onEdit: (receita: BaseReceita) => void;
  onDelete: (receita: BaseReceita) => void;
  onView: (receita: BaseReceita) => void;
  loading: boolean;
}

const BaseReceitaTable: React.FC<BaseReceitaTableProps> = ({
  data,
  onEdit,
  onDelete,
  onView,
  loading
}) => {
  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Nenhum registro encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CPF</TableHead>
            <TableHead>Situação Cadastral</TableHead>
            <TableHead>Data de Inscrição</TableHead>
            <TableHead>Dígito Verificador</TableHead>
            <TableHead>Data de Emissão</TableHead>
            <TableHead>Código de Controle</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((receita) => (
            <TableRow key={receita.id}>
              <TableCell className="font-mono">
                {formatCpf(receita.cpf)}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline"
                  className={
                    receita.situacao_cadastral?.toLowerCase() === 'regular'
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }
                >
                  {receita.situacao_cadastral?.toUpperCase() || '-'}
                </Badge>
              </TableCell>
              <TableCell>
                {receita.data_inscricao ? formatDate(receita.data_inscricao) : '-'}
              </TableCell>
              <TableCell>{receita.digito_verificador || '-'}</TableCell>
              <TableCell>
                {receita.data_emissao ? formatDate(receita.data_emissao) : '-'}
              </TableCell>
              <TableCell>{receita.codigo_controle || '-'}</TableCell>
              <TableCell>
                {receita.created_at ? formatDate(receita.created_at) : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(receita)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(receita)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(receita)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BaseReceitaTable;