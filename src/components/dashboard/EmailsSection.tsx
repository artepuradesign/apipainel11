import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Copy, Pencil, Plus } from 'lucide-react';
import { useBaseEmail } from '@/hooks/useBaseEmail';
import { BaseEmail } from '@/services/baseEmailService';
import { toast } from "sonner";
import { formatDateOnly } from '@/utils/formatters';

interface EmailsSectionProps {
  cpfId?: number;
  onCountChange?: (count: number) => void;
  compact?: boolean;
  onEdit?: () => void;
  onEditRecord?: (record: BaseEmail) => void;
  onAddRecord?: () => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

const EmailsSection: React.FC<EmailsSectionProps> = ({ cpfId, onCountChange, compact = false, onEdit, onEditRecord, onAddRecord, showHeaderOnlyWhenEmpty = false }) => {
  const { isLoading, getEmailsByCpfId } = useBaseEmail();
  const [emails, setEmails] = useState<BaseEmail[]>([]);
  const [didLoad, setDidLoad] = useState(false);

  const hasData = emails.length > 0;
  const sectionCardClass = hasData ? "border-success-border bg-success-subtle" : undefined;

  useEffect(() => {
    const loadEmails = async () => {
      setDidLoad(false);
      if (cpfId) {
        const result = await getEmailsByCpfId(cpfId);
        setEmails(result || []);
        setDidLoad(true);
      } else {
        setEmails([]);
        setDidLoad(true);
      }
    };

    loadEmails();
  }, [cpfId, getEmailsByCpfId]);

  useEffect(() => {
    if (!didLoad) return;
    onCountChange?.(emails.length);
  }, [didLoad, onCountChange, emails.length]);

  const copyEmailsData = () => {
    if (!hasData) return;

    const safeDataInclusao = (value?: string | null) => {
      if (!value || value === '0000-00-00') return '-';
      return formatDateOnly(value);
    };

    const dados = emails.map((email, idx) =>
      `Email ${idx + 1}:\n` +
      `Endereço: ${email.email || '-'}\n` +
      `Score: ${email.score_email || '-'}\n` +
      `Pessoal: ${email.email_pessoal || '-'}` +
      (compact
        ? ''
        : `\nPrioridade: ${email.prioridade ?? '-'}\n` +
          `Duplicado: ${email.email_duplicado || '-'}\n` +
          `Blacklist: ${email.blacklist || '-'}\n` +
          `Estrutura: ${email.estrutura || '-'}\n` +
          `Status VT: ${email.status_vt || '-'}\n` +
          `Domínio: ${email.dominio || '-'}\n` +
          `Mapas: ${email.mapas ?? '-'}\n` +
          `Peso: ${email.peso ?? '-'}\n` +
          `Data inclusão: ${safeDataInclusao(email.data_inclusao)}`)
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados dos emails copiados!');
  };

  if (isLoading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
            <Mail className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Emails</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
            <p className="text-sm">Carregando emails...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={sectionCardClass}>
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
            <Mail className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Emails</span>
          </CardTitle>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8" title="Editar dados da seção">
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            {onAddRecord && (
              <Button variant="outline" size="icon" onClick={onAddRecord} className="h-8 w-8 rounded-full" title="Adicionar novo registro">
                <Plus className="h-4 w-4" />
              </Button>
            )}

            {hasData && (
              <Button variant="ghost" size="icon" onClick={copyEmailsData} className="h-8 w-8" title="Copiar dados da seção">
                <Copy className="h-4 w-4" />
              </Button>
            )}

            <div className="relative inline-flex">
              <Badge variant="secondary" className={hasData ? 'bg-success text-success-foreground uppercase tracking-wide pr-4' : 'uppercase tracking-wide pr-4'}>
                Online
              </Badge>
              {hasData && (
                <span className="absolute -top-2 -right-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                  {emails.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      {(hasData || !showHeaderOnlyWhenEmpty) ? (
        <CardContent className="space-y-4 p-4 md:p-6">
          {hasData ? (
            <div className="space-y-4">
              {emails.map((email, index) => (
                <div key={email.id} className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">Registro {index + 1}</Badge>
                    {onEditRecord && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" title={`Editar registro ${index + 1}`} onClick={() => onEditRecord(email)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor={`email_${email.id}`}>Email</Label>
                      <Input id={`email_${email.id}`} value={email.email || ''} disabled className="lowercase text-[14px] md:text-sm" />
                    </div>

                    <div>
                      <Label htmlFor={`score_${email.id}`}>Score</Label>
                      <Input id={`score_${email.id}`} value={email.score_email || ''} disabled className="uppercase text-[14px] md:text-sm" />
                    </div>

                    <div>
                      <Label htmlFor={`pessoal_${email.id}`}>Pessoal</Label>
                      <Input id={`pessoal_${email.id}`} value={email.email_pessoal || ''} disabled className="uppercase text-[14px] md:text-sm" />
                    </div>

                    {!compact && (
                      <>
                        <div>
                          <Label htmlFor={`prioridade_${email.id}`}>Prioridade</Label>
                          <Input id={`prioridade_${email.id}`} value={email.prioridade ?? ''} disabled className="text-[14px] md:text-sm" />
                        </div>

                        <div>
                          <Label htmlFor={`duplicado_${email.id}`}>Duplicado</Label>
                          <Input id={`duplicado_${email.id}`} value={email.email_duplicado || ''} disabled className="uppercase text-[14px] md:text-sm" />
                        </div>

                        <div>
                          <Label htmlFor={`blacklist_${email.id}`}>Blacklist</Label>
                          <Input id={`blacklist_${email.id}`} value={email.blacklist || ''} disabled className="uppercase text-[14px] md:text-sm" />
                        </div>

                        <div>
                          <Label htmlFor={`estrutura_${email.id}`}>Estrutura</Label>
                          <Input id={`estrutura_${email.id}`} value={email.estrutura || ''} disabled className="uppercase text-[14px] md:text-sm" />
                        </div>

                        <div>
                          <Label htmlFor={`statusvt_${email.id}`}>Status VT</Label>
                          <Input id={`statusvt_${email.id}`} value={email.status_vt || ''} disabled className="uppercase text-[14px] md:text-sm" />
                        </div>

                        <div>
                          <Label htmlFor={`dominio_${email.id}`}>Domínio</Label>
                          <Input id={`dominio_${email.id}`} value={email.dominio || ''} disabled className="uppercase text-[14px] md:text-sm" />
                        </div>

                        <div>
                          <Label htmlFor={`mapas_${email.id}`}>Mapas</Label>
                          <Input id={`mapas_${email.id}`} value={email.mapas ?? ''} disabled className="text-[14px] md:text-sm" />
                        </div>

                        <div>
                          <Label htmlFor={`peso_${email.id}`}>Peso</Label>
                          <Input id={`peso_${email.id}`} value={email.peso ?? ''} disabled className="text-[14px] md:text-sm" />
                        </div>

                        <div>
                          <Label htmlFor={`data_${email.id}`}>Data inclusão</Label>
                          <Input id={`data_${email.id}`} value={email.data_inclusao && email.data_inclusao !== '0000-00-00' ? formatDateOnly(email.data_inclusao) : '-'} disabled className="text-[14px] md:text-sm" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm">Nenhum email adicional encontrado para este CPF</p>
            </div>
          )}
        </CardContent>
      ) : null}
    </Card>
  );
};

export default EmailsSection;
