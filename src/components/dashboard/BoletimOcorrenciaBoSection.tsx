import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, Copy, SearchX, Plus, ExternalLink, Trash2, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { baseBoService, BaseBo, CreateBaseBo } from '@/services/baseBoService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

interface BoletimOcorrenciaBoSectionProps {
  cpfId: number;
  onCountChange?: (count: number) => void;
  showHeaderOnlyWhenEmpty?: boolean;
}

const API_BASE_URL = 'https://api.apipainel.com.br';

const BoletimOcorrenciaBoSection: React.FC<BoletimOcorrenciaBoSectionProps> = ({ cpfId, onCountChange, showHeaderOnlyWhenEmpty = true }) => {
  const [boletins, setBoletins] = useState<BaseBo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSupport } = useAuth();

  const [form, setForm] = useState<Partial<CreateBaseBo>>({
    cpf_id: cpfId,
    numero_ano: '',
    unidade: '',
    data_fato: '',
    data_registro: '',
    natureza: '',
    bo_link: ''
  });

  const hasData = useMemo(() => boletins.length > 0, [boletins]);
  const sectionCardClass = hasData ? "border-success-border bg-success-subtle" : undefined;

  useEffect(() => {
    loadBoletins();
  }, [cpfId]);

  useEffect(() => {
    onCountChange?.(boletins.length);
  }, [onCountChange, boletins.length]);

  const loadBoletins = async () => {
    setLoading(true);
    try {
      const response = await baseBoService.getByCpfId(cpfId);
      if (response.success && response.data) {
        setBoletins(response.data);
      } else {
        setBoletins([]);
      }
    } catch (error) {
      console.error('Erro ao carregar boletins:', error);
      setBoletins([]);
    } finally {
      setLoading(false);
    }
  };

  const copyBoletinsData = () => {
    if (boletins.length === 0) return;
    
    const dados = boletins.map((bo, idx) => 
      `Boletim ${idx + 1}:\n` +
      `Nº/Ano: ${bo.numero_ano || '-'}\n` +
      `Unidade: ${bo.unidade || '-'}\n` +
      `Data do Fato: ${bo.data_fato || '-'}\n` +
      `Data do Registro: ${bo.data_registro || '-'}\n` +
      `Natureza: ${bo.natureza || '-'}\n` +
      `BO Link: ${bo.bo_link || '-'}`
    ).join('\n\n');

    navigator.clipboard.writeText(dados);
    toast.success('Dados de boletins copiados!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são aceitos');
      return;
    }

    if (!form.numero_ano) {
      toast.error('Preencha o campo Nº/Ano antes de enviar o arquivo');
      return;
    }

    setUploading(true);
    try {
      const result = await baseBoService.uploadPdf(file, form.numero_ano);
      if (result.success && result.data) {
        setForm(prev => ({ ...prev, bo_link: result.data!.bo_link }));
        setUploadedFile(result.data.file_name);
        toast.success(`Arquivo ${result.data.file_name} enviado com sucesso!`);
      } else {
        toast.error(result.error || 'Erro ao enviar arquivo');
      }
    } catch (error) {
      toast.error('Erro ao enviar arquivo PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.numero_ano) {
      toast.error('Nº/Ano é obrigatório');
      return;
    }
    setSaving(true);
    try {
      const result = await baseBoService.create({ ...form, cpf_id: cpfId } as CreateBaseBo);
      if (result.success) {
        toast.success('Boletim de ocorrência cadastrado!');
        setModalOpen(false);
        setForm({ cpf_id: cpfId, numero_ano: '', unidade: '', data_fato: '', data_registro: '', natureza: '', bo_link: '' });
        setUploadedFile(null);
        await loadBoletins();
      } else {
        toast.error(result.error || 'Erro ao cadastrar');
      }
    } catch (error) {
      toast.error('Erro ao cadastrar boletim');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este boletim?')) return;
    try {
      const result = await baseBoService.delete(id);
      if (result.success) {
        toast.success('Boletim excluído!');
        await loadBoletins();
      } else {
        toast.error(result.error || 'Erro ao excluir');
      }
    } catch {
      toast.error('Erro ao excluir boletim');
    }
  };

  const openBoLink = (boLink: string) => {
    // bo_link é o nome do arquivo sem extensão, ex: 775821
    // O PDF fica em /bo/{boLink}.pdf
    const url = `${API_BASE_URL}/bo/${boLink}.pdf`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
              <FileText className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Boletim de Ocorrência</span>
            </CardTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="uppercase tracking-wide">Online</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
              <FileText className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Boletim de Ocorrência</span>
            </CardTitle>

            <div className="flex items-center gap-2 flex-shrink-0">
              {hasData && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyBoletinsData}
                  className="h-8 w-8"
                  title="Copiar dados da seção"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}

              {/* Botão + visível apenas para admin/suporte */}
              {isSupport && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setModalOpen(true)}
                  className="h-8 w-8 rounded-full"
                  title="Adicionar Boletim de Ocorrência"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}

              <div className="relative inline-flex">
                <Badge
                  variant="secondary"
                  className={hasData ? "bg-success text-success-foreground uppercase tracking-wide" : "uppercase tracking-wide"}
                >
                  Online
                </Badge>
                {hasData ? (
                  <span
                    className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background"
                    aria-label={`Quantidade de boletins: ${boletins.length}`}
                  >
                    {boletins.length}
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
              <div className="space-y-4">
                {boletins.map((bo, index) => (
                  <div key={bo.id}>
                    {index > 0 && <div className="border-t pt-3"></div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm">Nº/Ano</Label>
                        <Input value={bo.numero_ano || '-'} disabled className="bg-muted text-[14px] md:text-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs sm:text-sm">Unidade</Label>
                        <Input value={bo.unidade?.toUpperCase() || '-'} disabled className="bg-muted uppercase text-[14px] md:text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">Data do Fato</Label>
                        <Input value={bo.data_fato || '-'} disabled className="bg-muted text-[14px] md:text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">Data do Registro</Label>
                        <Input value={bo.data_registro || '-'} disabled className="bg-muted text-[14px] md:text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">Natureza</Label>
                        <Input value={bo.natureza || '-'} disabled className="bg-muted text-[14px] md:text-sm" />
                      </div>
                      {bo.bo_link && (
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label className="text-xs sm:text-sm">BO Link (PDF)</Label>
                            <Input value={`${bo.bo_link}.pdf`} disabled className="bg-muted text-[14px] md:text-sm" />
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openBoLink(bo.bo_link!)}
                            className="h-9 w-9 flex-shrink-0"
                            title="Abrir PDF do Boletim"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {isSupport && (
                        <div className="flex items-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(bo.id)}
                            className="gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Modal de cadastro - apenas admin/suporte */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cadastrar Boletim de Ocorrência
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nº/Ano *</Label>
              <Input
                placeholder="Ex: 267237/2021"
                value={form.numero_ano || ''}
                onChange={e => setForm(prev => ({ ...prev, numero_ano: e.target.value }))}
              />
            </div>
            <div>
              <Label>Unidade</Label>
              <Input
                placeholder="Ex: 11º Distrito de Polícia Civil do São Cristovão"
                value={form.unidade || ''}
                onChange={e => setForm(prev => ({ ...prev, unidade: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data do Fato</Label>
                <Input
                  placeholder="DD/MM/AAAA"
                  value={form.data_fato || ''}
                  onChange={e => setForm(prev => ({ ...prev, data_fato: e.target.value }))}
                />
              </div>
              <div>
                <Label>Data do Registro</Label>
                <Input
                  placeholder="DD/MM/AAAA"
                  value={form.data_registro || ''}
                  onChange={e => setForm(prev => ({ ...prev, data_registro: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Natureza</Label>
              <Input
                placeholder="Ex: 1.  Preservação de Direito"
                value={form.natureza || ''}
                onChange={e => setForm(prev => ({ ...prev, natureza: e.target.value }))}
              />
            </div>
            <div>
              <Label>Upload do PDF do Boletim</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex items-center gap-2 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || !form.numero_ano}
                  className="gap-2"
                >
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                  ) : (
                    <><Upload className="h-4 w-4" /> Selecionar PDF</>
                  )}
                </Button>
                {uploadedFile && (
                  <span className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle className="h-3 w-3" />
                    {uploadedFile}
                  </span>
                )}
              </div>
              {!form.numero_ano && (
                <p className="text-xs text-warning mt-1">
                  Preencha o Nº/Ano primeiro para habilitar o upload
                </p>
              )}
            </div>
            <div>
              <Label>BO Link (preenchido automaticamente)</Label>
              <Input
                placeholder="Será preenchido após o upload"
                value={form.bo_link || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BoletimOcorrenciaBoSection;
