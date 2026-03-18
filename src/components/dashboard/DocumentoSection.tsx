 import React, { useEffect, useMemo, useState } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Badge } from '@/components/ui/badge';
 import { Copy, FileText, Plus } from 'lucide-react';
 import { toast } from 'sonner';
 import { format, isValid, parseISO } from 'date-fns';
 import { useBaseDocumento } from '@/hooks/useBaseDocumento';
 import type { BaseDocumento } from '@/services/baseDocumentoService';
 
 interface DocumentoSectionProps {
   cpfId?: number;
  onCountChange?: (count: number) => void;
  onAddRecord?: () => void;
  showHeaderOnlyWhenEmpty?: boolean;
 }
 
 const formatMaybeUpper = (v?: string | null) => {
   if (!v) return '';
   const upper = v.toUpperCase();
   // Filtrar valores inválidos
   if (upper === 'SEM RESULTADO' || upper === '-' || upper === 'NULL') return '';
   return upper;
 };
 
 const formatBrazilianDate = (value?: string | null) => {
   if (!value) return '';
 
   // Tenta ISO primeiro (ex: 2026-01-25 / 2026-01-25T00:00:00Z)
   const iso = parseISO(value);
   if (isValid(iso)) return format(iso, 'dd/MM/yyyy');
 
   // Fallback: tenta Date nativo
   const d = new Date(value);
   if (isValid(d)) return format(d, 'dd/MM/yyyy');
 
   // Se vier já formatado ou em formato não reconhecido, exibe como está
   return value;
 };
 
const DocumentoSection: React.FC<DocumentoSectionProps> = ({ cpfId, onCountChange, onAddRecord, showHeaderOnlyWhenEmpty = true }) => {
   const { isLoading, getDocumentoByCpfId } = useBaseDocumento();
   const [documento, setDocumento] = useState<BaseDocumento | null>(null);
 
   useEffect(() => {
     const load = async () => {
       if (!cpfId) return;
       const data = await getDocumentoByCpfId(cpfId);
       setDocumento(data);
     };
     load();
   }, [cpfId, getDocumentoByCpfId]);
 
   const hasData = useMemo(() => {
     if (!documento) return false;
     return Boolean(
       documento.numero_identificador ||
         documento.data_expedicao ||
         documento.orgao_emissor ||
         documento.sigla_uf
     );
   }, [documento]);

  useEffect(() => {
    onCountChange?.(hasData ? 1 : 0);
  }, [hasData, onCountChange]);
 
   const sectionCardClass = hasData ? 'border-success-border bg-success-subtle' : undefined;
 
   const copyData = () => {
     if (!documento || !hasData) return;
     const dados = [
       `Número Identificador: ${documento.numero_identificador || '-'}`,
       `Data Expedição: ${formatBrazilianDate(documento.data_expedicao)}`,
       `Órgão Emissor: ${documento.orgao_emissor || '-'}`,
       `UF: ${documento.sigla_uf || '-'}`,
     ].join('\n');
     navigator.clipboard.writeText(dados);
     toast.success('Documento copiado!');
   };
 
   if (isLoading) {
     return (
       <Card className={sectionCardClass}>
         <CardHeader className="p-4 md:p-6">
           <div className="flex items-center justify-between gap-3">
             <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
               <FileText className="h-5 w-5 flex-shrink-0" />
               <span className="truncate">Documento</span>
             </CardTitle>
 
             <div className="flex items-center gap-2 flex-shrink-0">
               <Badge variant="secondary" className="uppercase tracking-wide">
                 Online
               </Badge>
             </div>
           </div>
         </CardHeader>
         <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
           <div className="text-center py-4 text-muted-foreground">
             <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
             <p className="text-xs sm:text-sm">Carregando documento...</p>
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
             <span className="truncate">Documento</span>
           </CardTitle>
 
           <div className="flex items-center gap-2 flex-shrink-0">
             {hasData ? (
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={copyData}
                 className="h-8 w-8"
                 title="Copiar dados da seção"
               >
                 <Copy className="h-4 w-4" />
               </Button>
             ) : null}

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
                <Badge variant="secondary" className="uppercase tracking-wide">
                  Online
                </Badge>
                {hasData ? (
                  <span
                    className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background"
                    aria-label="Quantidade de registros Documento: 1"
                  >
                    1
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
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs sm:text-sm">Nenhum registro encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm" htmlFor="doc_numero">Número Identificador</Label>
                  <Input id="doc_numero" value={formatMaybeUpper(documento?.numero_identificador)} disabled className="bg-muted text-[14px] md:text-sm" />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm" htmlFor="doc_data">Data Expedição</Label>
                  <Input
                    id="doc_data"
                    value={formatBrazilianDate(documento?.data_expedicao)}
                    disabled
                    className="bg-muted text-[14px] md:text-sm"
                  />
                </div>
    
                <div>
                  <Label className="text-xs sm:text-sm" htmlFor="doc_orgao">Órgão Emissor</Label>
                  <Input
                    id="doc_orgao"
                    value={formatMaybeUpper(documento?.orgao_emissor)}
                    disabled
                    className="bg-muted text-[14px] md:text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm" htmlFor="doc_uf">UF</Label>
                  <Input id="doc_uf" value={formatMaybeUpper(documento?.sigla_uf)} disabled className="bg-muted text-[14px] md:text-sm" />
                </div>
              </div>
            )}
          </CardContent>
        )}
     </Card>
   );
 };
 
 export default DocumentoSection;