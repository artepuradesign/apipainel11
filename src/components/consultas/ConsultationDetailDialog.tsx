import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import CpfResultDisplay from '@/components/dashboard/CpfResultDisplay';
import ReceitaFederalDisplay from '@/components/dashboard/ReceitaFederalDisplay';
import FotosSection from '@/components/dashboard/FotosSection';

interface ConsultationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: any;
}

const ConsultationDetailDialog: React.FC<ConsultationDetailDialogProps> = ({
  open,
  onOpenChange,
  consultation
}) => {
  if (!consultation) return null;

  const formatCPF = (cpf: string) => {
    if (!cpf) return 'N/A';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const consultationValue = consultation.cost || consultation.amount || 0;
  const numericValue = typeof consultationValue === 'string' 
    ? parseFloat(consultationValue.toString().replace(',', '.')) 
    : Number(consultationValue) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes da Consulta</span>
            <Badge 
              variant={consultation.status === 'completed' ? 'default' : 'secondary'}
              className="ml-2"
            >
              {consultation.status === 'completed' ? 'Concluída' : 'Pendente'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-4">
            {/* Informações da Consulta */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">CPF Consultado</p>
                    <p className="text-lg font-mono font-semibold">{formatCPF(consultation.document || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data da Consulta</p>
                    <p className="text-lg font-medium">{formatDate(consultation.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Cobrado</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      R$ {numericValue.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge 
                      variant={consultation.status === 'completed' ? 'default' : 'secondary'}
                      className="text-sm"
                    >
                      {consultation.status === 'completed' ? 'Concluída' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resultado da Consulta */}
            {consultation.result_data && (
              <>
                {consultation.result_data.id && consultation.result_data.cpf && (
                  <FotosSection
                    cpfId={Number(consultation.result_data.id)}
                    cpfNumber={String(consultation.result_data.cpf)}
                  />
                )}

                <CpfResultDisplay 
                  data={consultation.result_data}
                  loading={false}
                  showExportButton={false}
                />
                
                {consultation.result_data.receita_federal && (
                  <ReceitaFederalDisplay 
                    data={consultation.result_data.receita_federal}
                    loading={false}
                  />
                )}
              </>
            )}

            {!consultation.result_data && consultation.status === 'completed' && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Dados da consulta não disponíveis
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationDetailDialog;
