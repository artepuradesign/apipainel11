import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, User, IdCard, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { BaseCpf } from '@/services/baseCpfService';
import { formatDateOnly } from '@/utils/formatters';

interface BaseCpfCardProps {
  cpf: BaseCpf;
  onView: (cpf: BaseCpf) => void;
  onEdit: (cpf: BaseCpf) => void;
  onDelete: (cpf: BaseCpf) => void;
}

const BaseCpfCard: React.FC<BaseCpfCardProps> = ({ cpf, onView, onEdit, onDelete }) => {
  const formatCpf = (cpfNumber: string) => {
    return cpfNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (date: string) => {
    return formatDateOnly(date);
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      'ativo': { variant: 'default' as const, label: 'Ativo' },
      'suspenso': { variant: 'secondary' as const, label: 'Suspenso' },
      'cancelado': { variant: 'destructive' as const, label: 'Cancelado' },
      'pendente': { variant: 'outline' as const, label: 'Pendente' }
    };

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig];
    return config ? (
      <Badge variant={config.variant}>{config.label}</Badge>
    ) : (
      <Badge variant="outline">{status}</Badge>
    );
  };

  const qualityColor = cpf.qualidade_dados && cpf.qualidade_dados > 75 ? 'text-green-600' : 
                     cpf.qualidade_dados && cpf.qualidade_dados > 50 ? 'text-yellow-600' : 'text-gray-600';

  const hasContacts = cpf.telefone || cpf.email || (cpf.cep && cpf.cidade);
  const contactsCount = 
    (cpf.telefone ? 1 : 0) +
    (cpf.email ? 1 : 0) +
    (cpf.cep && cpf.cidade ? 1 : 0);

  const hasStructuredData = 
    cpf.telefone || cpf.email || (cpf.cep && cpf.cidade);

  return (
    <Card className="transition-all duration-200 hover:shadow-md border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {/* CPF em destaque */}
            <div className="flex items-center gap-2">
              <IdCard className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {formatCpf(cpf.cpf)}
              </span>
            </div>
            
            {/* Nome */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold uppercase">{cpf.nome}</span>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Naturalidade: <span className="uppercase">{cpf.naturalidade || 'Não informado'}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(cpf.created_at || '')} • Qualidade: {cpf.qualidade_dados || 0}%
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col items-end gap-2">
            {cpf.situacao_cpf && getStatusBadge(cpf.situacao_cpf)}
            {cpf.qualidade_dados && (
              <Badge variant="outline" className={`text-xs ${qualityColor}`}>
                {cpf.qualidade_dados}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {cpf.data_nascimento && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Nascimento:</span>
              <span>{formatDate(cpf.data_nascimento)}</span>
            </div>
          )}
          
          {cpf.sexo && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Sexo:</span>
              <span className="uppercase">{cpf.sexo}</span>
            </div>
          )}

          {cpf.cns && (
            <div className="flex items-center gap-2">
              <IdCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">CNS:</span>
              <span>{cpf.cns}</span>
            </div>
          )}

          {cpf.estado_civil && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Estado Civil:</span>
              <span className="uppercase">{cpf.estado_civil}</span>
            </div>
          )}
        </div>

        {/* Informações de contato */}
        {hasContacts && (
          <div className="border-t pt-3 space-y-2">
            {cpf.telefone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tel:</span>
                <span className="text-sm uppercase">{cpf.telefone}</span>
              </div>
            )}
            
            {cpf.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="text-sm uppercase">{cpf.email}</span>
              </div>
            )}
            
            {cpf.cidade && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Endereço:</span>
                <span className="text-sm uppercase">{cpf.cidade}, {cpf.uf_endereco}</span>
              </div>
            )}
          </div>
        )}

        {/* Informações complementares */}
        {(cpf.mae || cpf.pai) && (
          <div className="border-t pt-3 space-y-1 text-sm">
            {cpf.mae && (
              <div>
                <span className="text-muted-foreground">Mãe:</span> <span className="uppercase">{cpf.mae}</span>
              </div>
            )}
            {cpf.pai && (
              <div>
                <span className="text-muted-foreground">Pai:</span> <span className="uppercase">{cpf.pai}</span>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(cpf)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(cpf)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(cpf)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Data de cadastro */}
        {cpf.created_at && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Cadastrado em: {formatDate(cpf.created_at)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BaseCpfCard;