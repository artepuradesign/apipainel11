 import React, { useEffect, useMemo, useState } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Label } from '@/components/ui/label';
 import { Input } from '@/components/ui/input';
 import { Copy, SearchX, FileText, Plus, Pencil } from 'lucide-react';
 import { toast } from 'sonner';
 import { useBaseGestao } from '@/hooks/useBaseGestao';
 import type { BaseGestao } from '@/services/baseGestaoService';
 
// Helper: formata valor para exibição (vazio se não houver dados)
const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const upper = trimmed.toUpperCase();
    if (upper === '' || upper === '-' || upper === 'SEM RESULTADO' || upper === 'SEM DADOS') {
      return '';
    }
    return trimmed;
  }
  return String(value);
};

 interface GestaoSectionProps {
   cpfId?: number;
   onCountChange?: (count: number) => void;
   onAddRecord?: () => void;
   onEditRecord?: (record?: BaseGestao) => void;
   showHeaderOnlyWhenEmpty?: boolean;
 }
 
 const GestaoSection: React.FC<GestaoSectionProps> = ({ cpfId, onCountChange, onAddRecord, onEditRecord, showHeaderOnlyWhenEmpty = true }) => {
   const { isLoading, getGestaoByCpfId } = useBaseGestao();
   const [items, setItems] = useState<BaseGestao[]>([]);
 
   useEffect(() => {
     const load = async () => {
       if (!cpfId) return;
       const data = await getGestaoByCpfId(cpfId);
       setItems(data);
     };
     load();
   }, [cpfId, getGestaoByCpfId]);

   useEffect(() => {
     onCountChange?.(items.length);
   }, [items.length, onCountChange]);
 
     const hasData = useMemo(() => items.length > 0, [items]);
     // Quando houver dados, destacamos (verde). Sem dados, fica neutro.
     const sectionCardClass = hasData ? 'border-success-border bg-success-subtle' : '';
 
   const copyData = (item: BaseGestao) => {
     if (!hasData) return;
    const fields: string[] = ['GESTÃO CADASTRAL'];
    
    const grauQualidade = formatValue(item.grau_qualidade);
    if (grauQualidade) {
      fields.push(`Grau Qualidade: ${grauQualidade}`);
    }
    const identificadorCorp = formatValue(item.identificador_corporativo);
    if (identificadorCorp) {
      fields.push(`Identificador Corporativo: ${identificadorCorp}`);
    }
    const originalRfb = formatValue(item.original_rfb);
    if (originalRfb) {
      fields.push(`Original RFB: ${originalRfb}`);
    }
    const nomade = formatValue(item.nomade);
    if (nomade) {
      fields.push(`Nômade: ${nomade}`);
    }
    const situacao = formatValue(item.situacao);
    if (situacao) {
      fields.push(`Situação: ${situacao}`);
    }
    const motivoSit = formatValue(item.motivo_alteracao_situacao);
    if (motivoSit) {
      fields.push(`Motivo Alteração Situação: ${motivoSit}`);
    }
    const vip = formatValue(item.vip);
    if (vip) {
      fields.push(`VIP: ${vip}`);
    }
    const motivoVip = formatValue(item.motivo_alteracao_vip);
    if (motivoVip) {
      fields.push(`Motivo Alteração VIP: ${motivoVip}`);
    }
    const protecao = formatValue(item.protecao_testemunha);
    if (protecao) {
      fields.push(`Proteção Testemunha: ${protecao}`);
    }
    const descProtecao = formatValue(item.descricao_protecao_testemunha);
    if (descProtecao) {
      fields.push(`Descrição Proteção Testemunha: ${descProtecao}`);
    }
    const motivoHig = formatValue(item.motivo_nao_higienizado);
    if (motivoHig) {
      fields.push(`Motivo Não Higienizado: ${motivoHig}`);
    }
    const vivo = formatValue(item.vivo);
    if (vivo) {
      fields.push(`Vivo: ${vivo}`);
    }
    
    const text = fields.join('\n');
 
     navigator.clipboard.writeText(text);
     toast.success('Dados copiados!');
   };
 
   if (isLoading) {
     return (
       <Card className={sectionCardClass}>
         <CardHeader className="p-4 md:p-6">
           <div className="flex items-center justify-between gap-3">
             <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
               <FileText className="h-5 w-5 flex-shrink-0" />
               <span className="truncate">Gestão Cadastral</span>
             </CardTitle>
 
               <div className="flex items-center gap-2 flex-shrink-0">
                 <Badge
                   variant="secondary"
                   className={hasData ? 'bg-success text-success-foreground uppercase tracking-wide' : 'uppercase tracking-wide'}
                 >
                   Online
                 </Badge>
               </div>
           </div>
         </CardHeader>
         <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
           <div className="text-center py-4 text-muted-foreground">
             <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
             <p className="text-xs sm:text-sm">Carregando gestão cadastral...</p>
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
             <FileText className="h-5 w-5 flex-shrink-0" />
             <span className="truncate">Gestão Cadastral</span>
           </CardTitle>
 
               <div className="flex items-center gap-2 flex-shrink-0">
                  {hasData && onEditRecord ? (
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => onEditRecord(items[0])}
                     className="h-8 w-8"
                     title="Editar dados da seção"
                   >
                     <Pencil className="h-4 w-4" />
                   </Button>
                 ) : null}

                  {hasData && (
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => copyData(items[0])}
                     className="h-8 w-8"
                     title="Copiar dados da seção"
                   >
                     <Copy className="h-4 w-4" />
                   </Button>
                 )}

                {onAddRecord ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onAddRecord}
                    className="h-8 w-8 rounded-full"
                    title="Adicionar registro"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : null}

                 <div className="relative inline-flex">
                  <Badge
                    variant="secondary"
                    className={hasData ? 'bg-success text-success-foreground uppercase tracking-wide' : 'uppercase tracking-wide'}
                  >
                    Online
                  </Badge>
                  {items.length > 0 ? (
                    <span
                      className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background"
                      aria-label={`Quantidade de registros de gestão cadastral: ${items.length}`}
                    >
                      {items.length}
                    </span>
                  ) : null}
                </div>
           </div>
         </div>
       </CardHeader>
 
        {!hasData && showHeaderOnlyWhenEmpty ? null : (
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            {!hasData ? (
              <div className="text-center py-4 text-muted-foreground">
                <SearchX className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs sm:text-sm">Nenhum registro encontrado</p>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Informações Básicas */}
                      <div>
                        <Label className="text-xs sm:text-sm" htmlFor={`gestao_grau_${item.id}`}>
                          Grau Qualidade
                        </Label>
                        <Input
                          id={`gestao_grau_${item.id}`}
                          value={formatValue(item.grau_qualidade)}
                          disabled
                           className="bg-muted uppercase text-[14px] md:text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs sm:text-sm" htmlFor={`gestao_ident_${item.id}`}>
                          Identificador Corporativo
                        </Label>
                        <Input
                          id={`gestao_ident_${item.id}`}
                          value={formatValue(item.identificador_corporativo)}
                          disabled
                           className="bg-muted uppercase text-[14px] md:text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs sm:text-sm" htmlFor={`gestao_rfb_${item.id}`}>
                          Original RFB
                        </Label>
                        <Input
                          id={`gestao_rfb_${item.id}`}
                          value={formatValue(item.original_rfb)}
                          disabled
                           className="bg-muted uppercase text-[14px] md:text-sm"
                        />
                      </div>
                      
                      {/* Classificação */}
                      <div>
                        <Label className="text-xs sm:text-sm" htmlFor={`gestao_nomade_${item.id}`}>
                          Nômade
                        </Label>
                        <Input
                          id={`gestao_nomade_${item.id}`}
                          value={formatValue(item.nomade)}
                          disabled
                           className="bg-muted uppercase text-[14px] md:text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs sm:text-sm" htmlFor={`gestao_vivo_${item.id}`}>
                          Vivo
                        </Label>
                        <Input
                          id={`gestao_vivo_${item.id}`}
                          value={formatValue(item.vivo)}
                          disabled
                           className="bg-muted uppercase text-[14px] md:text-sm"
                        />
                      </div>
                      
                      {/* Status e Motivos */}
                      <div>
                        <Label className="text-xs sm:text-sm" htmlFor={`gestao_situacao_${item.id}`}>
                          Situação
                        </Label>
                        <Input
                          id={`gestao_situacao_${item.id}`}
                          value={formatValue(item.situacao)}
                          disabled
                           className="bg-muted uppercase text-[14px] md:text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs sm:text-sm" htmlFor={`gestao_mot_sit_${item.id}`}>
                          Motivo Alteração Situação
                        </Label>
                        <Input
                          id={`gestao_mot_sit_${item.id}`}
                          value={formatValue(item.motivo_alteracao_situacao)}
                          disabled
                           className="bg-muted uppercase text-[14px] md:text-sm"
                        />
                      </div>
                      
                      {/* VIP */}
                      <div>
                        <Label className="text-xs sm:text-sm" htmlFor={`gestao_vip_${item.id}`}>
                          VIP
                        </Label>
                        <Input
                          id={`gestao_vip_${item.id}`}
                          value={formatValue(item.vip)}
                          disabled
                           className="bg-muted uppercase text-[14px] md:text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs sm:text-sm" htmlFor={`gestao_mot_vip_${item.id}`}>
                          Motivo Alteração VIP
                        </Label>
                        <Input
                          id={`gestao_mot_vip_${item.id}`}
                          value={formatValue(item.motivo_alteracao_vip)}
                          disabled
                           className="bg-muted uppercase text-[14px] md:text-sm"
                        />
                      </div>
                      
                      {/* Proteção */}
                      <div>
                        <Label className="text-xs sm:text-sm" htmlFor={`gestao_prot_${item.id}`}>
                          Proteção Testemunha
                        </Label>
                        <Input
                          id={`gestao_prot_${item.id}`}
                          value={formatValue(item.protecao_testemunha)}
                          disabled
                           className="bg-muted uppercase text-[14px] md:text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs sm:text-sm" htmlFor={`gestao_desc_prot_${item.id}`}>
                          Descrição Proteção Testemunha
                        </Label>
                        <Input
                          id={`gestao_desc_prot_${item.id}`}
                          value={formatValue(item.descricao_protecao_testemunha)}
                          disabled
                           className="bg-muted uppercase text-[14px] md:text-sm"
                        />
                      </div>
                      
                      {/* Higienização */}
                      <div>
                        <Label className="text-xs sm:text-sm" htmlFor={`gestao_mot_hig_${item.id}`}>
                          Motivo Não Higienizado
                        </Label>
                        <Input
                          id={`gestao_mot_hig_${item.id}`}
                          value={formatValue(item.motivo_nao_higienizado)}
                          disabled
                           className="bg-muted uppercase text-[14px] md:text-sm"
                        />
                      </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
 };
 
 export default GestaoSection;