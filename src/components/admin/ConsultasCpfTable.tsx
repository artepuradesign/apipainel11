import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, User } from 'lucide-react';
import { ConsultaCpf } from '@/services/consultasCpfService';

interface ConsultasCpfTableProps {
  data: ConsultaCpf[];
  onEdit: (consulta: ConsultaCpf) => void;
  onDelete: (consulta: ConsultaCpf) => void;
  onView: (consulta: ConsultaCpf) => void;
  loading?: boolean;
}

const ConsultasCpfTable: React.FC<ConsultasCpfTableProps> = ({
  data,
  onEdit,
  onDelete,
  onView,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="animate-spin mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4 text-muted-foreground">Carregando consultas...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Nenhuma consulta encontrada</p>
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'failed':
        return 'Falhou';
      case 'processing':
        return 'Processando';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-medium">ID</th>
              <th className="text-left p-4 font-medium">Usuário</th>
              <th className="text-left p-4 font-medium">CPF Consultado</th>
              <th className="text-left p-4 font-medium">Custo</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Data</th>
              <th className="text-left p-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((consulta) => (
              <tr key={consulta.id} className="border-t hover:bg-muted/50">
                <td className="p-4 font-mono">
                  #{consulta.id}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{consulta.user_login || `ID: ${consulta.user_id}`}</div>
                      {consulta.user_email && (
                        <div className="text-sm text-muted-foreground">
                          {consulta.user_email}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono">
                  {formatCpf(consulta.document)}
                </td>
                <td className="p-4">
                  <span className="font-medium text-green-600">
                    R$ {consulta.cost.toFixed(2)}
                  </span>
                </td>
                <td className="p-4">
                  <Badge variant={getStatusVariant(consulta.status)}>
                    {getStatusLabel(consulta.status)}
                  </Badge>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {consulta.created_at ? formatDate(consulta.created_at) : '-'}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(consulta)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(consulta)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(consulta)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsultasCpfTable;