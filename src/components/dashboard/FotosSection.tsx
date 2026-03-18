import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Copy, Download, Send, MessageCircle, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { baseFotoService, BaseFoto } from '@/services/baseFotoService';
import { toast } from 'sonner';
import placeholderImage from '@/assets/placeholder-photo.png';
import PhotoZoomOverlay from '@/components/ui/PhotoZoomOverlay';
import { useIsMobile } from '@/hooks/use-mobile';

interface FotosSectionProps {
  cpfId: number;
  cpfNumber: string;
  onCountChange?: (count: number) => void;
  canManage?: boolean;
}

const FotosSection: React.FC<FotosSectionProps> = ({ cpfId, cpfNumber, onCountChange, canManage = false }) => {
  const [fotos, setFotos] = useState<BaseFoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addPhotoValue, setAddPhotoValue] = useState('');
  const [addNomeValue, setAddNomeValue] = useState('');
  const [savingAdd, setSavingAdd] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFotoId, setEditingFotoId] = useState<number | null>(null);
  const [editPhotoValue, setEditPhotoValue] = useState('');
  const [editNomeValue, setEditNomeValue] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingFotoId, setDeletingFotoId] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const DESKTOP_SLOTS = 4;
  const MOBILE_SLOTS = fotos.length > 2 ? 4 : 2;
  const slotsToRender = isMobile ? MOBILE_SLOTS : DESKTOP_SLOTS;

  const hasData = fotos.length > 0;
  const sectionCardClass = hasData ? "border-success-border bg-success-subtle" : undefined;

  useEffect(() => {
    loadFotos();
  }, [cpfId]);

  const loadFotos = async () => {
    try {
      setLoading(true);
      const response = await baseFotoService.getByCpfId(cpfId);

      if (response.success && response.data) {
        setFotos(response.data);
        onCountChange?.(response.data.length);
      } else {
        setFotos([]);
        onCountChange?.(0);
      }
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      setFotos([]);
      onCountChange?.(0);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (filename?: string) => {
    const raw = (filename || '').trim();
    if (!raw) return placeholderImage;

    const first = raw.split(',')[0]?.trim() || '';
    const normalized = first.replace(/^\/+/, '');

    if (/^https?:\/\//i.test(normalized)) return normalized;

    if (/^api\.apipainel\.com\.br\//i.test(normalized)) {
      return `https://${normalized}`;
    }

    if (/^(fotos|base-foto)\//i.test(normalized)) {
      return `https://api.apipainel.com.br/${normalized}`;
    }

    return `https://api.apipainel.com.br/fotos/${normalized}`;
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL da foto copiada!');
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success('Foto baixada com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar foto');
    }
  };

  const handleShareTelegram = (url: string) => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}`;
    window.open(telegramUrl, '_blank');
  };

  const handleShareWhatsApp = (url: string) => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const openAddPhotoModal = () => {
    setAddPhotoValue('');
    setAddNomeValue('');
    setAddModalOpen(true);
  };

  const handleAddPhoto = async () => {
    const cleanedPhoto = addPhotoValue.trim();
    if (!cleanedPhoto) {
      toast.error('Informe o caminho/URL da foto.');
      return;
    }

    setSavingAdd(true);
    try {
      const response = await baseFotoService.create({
        cpf_id: cpfId,
        photo: cleanedPhoto,
        nome: addNomeValue.trim() || undefined,
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro ao cadastrar foto');
      }

      toast.success('Foto adicionada com sucesso!');
      setAddModalOpen(false);
      await loadFotos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar foto');
    } finally {
      setSavingAdd(false);
    }
  };

  const openEditPhotoModal = (foto: BaseFoto) => {
    if (!foto.id) {
      toast.error('Não foi possível editar: foto sem ID.');
      return;
    }

    setEditingFotoId(foto.id);
    setEditPhotoValue(foto.photo || '');
    setEditNomeValue(foto.nome || '');
    setEditModalOpen(true);
  };

  const handleSavePhotoEdit = async () => {
    if (!editingFotoId) return;

    const cleanedPhoto = editPhotoValue.trim();
    if (!cleanedPhoto) {
      toast.error('Informe o caminho/URL da foto.');
      return;
    }

    setSavingEdit(true);
    try {
      const response = await baseFotoService.update(editingFotoId, {
        photo: cleanedPhoto,
        nome: editNomeValue.trim() || undefined,
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro ao atualizar foto');
      }

      toast.success('Foto atualizada com sucesso!');
      setEditModalOpen(false);
      setEditingFotoId(null);
      await loadFotos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar foto');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePhoto = async (foto: BaseFoto) => {
    if (!foto.id) {
      toast.error('Não foi possível excluir: foto sem ID.');
      return;
    }

    const confirmed = window.confirm('Deseja realmente excluir esta foto?');
    if (!confirmed) return;

    setDeletingFotoId(foto.id);
    try {
      const response = await baseFotoService.delete(foto.id);
      if (!response.success) {
        throw new Error(response.error || 'Erro ao excluir foto');
      }

      toast.success('Foto excluída com sucesso!');
      await loadFotos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir foto');
    } finally {
      setDeletingFotoId(null);
    }
  };

  const renderPlaceholderCard = (index: number) => (
    <Card key={`placeholder-${index}`} className="overflow-hidden border-2">
      <div className="relative bg-muted aspect-[3/4] flex items-center justify-center overflow-hidden">
        <img
          src={placeholderImage}
          alt={`Foto ${index + 1} (simulação)`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-2 bg-primary text-primary-foreground text-center text-sm font-medium">
        {`Foto ${index + 1}`}
      </div>
    </Card>
  );

  const renderRealPhotoCard = (foto: BaseFoto, index: number) => {
    const photoUrl = getPhotoUrl(foto.photo);

    return (
      <div key={foto.id ?? `${foto.photo}-${index}`} className="relative">
        <PhotoZoomOverlay
          photoUrl={photoUrl}
          alt={`Foto ${index + 1}`}
          onCopyUrl={handleCopyUrl}
          onDownload={handleDownload}
          onShareTelegram={handleShareTelegram}
          onShareWhatsApp={handleShareWhatsApp}
        >
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-2 cursor-pointer group">
            <div className="relative bg-muted aspect-[3/4] flex items-center justify-center overflow-hidden">
              <img
                src={photoUrl}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
                onLoad={() => {
                  console.log('[FOTOS] Imagem carregada:', photoUrl);
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.warn('[FOTOS] Falha ao carregar imagem:', photoUrl);
                  target.src = placeholderImage;
                }}
                loading="lazy"
              />

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {canManage && foto.id ? (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-background/90 hover:bg-background shadow-lg"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditPhotoModal(foto);
                      }}
                      title="Atualizar foto"
                    >
                      <Pencil className="h-4 w-4 text-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-background/90 hover:bg-background shadow-lg"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeletePhoto(foto);
                      }}
                      title="Excluir foto"
                      disabled={deletingFotoId === foto.id}
                    >
                      <Trash2 className="h-4 w-4 text-foreground" />
                    </Button>
                  </>
                ) : null}

                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-background/90 hover:bg-background shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyUrl(photoUrl);
                  }}
                  title="Copiar URL"
                >
                  <Copy className="h-4 w-4 text-foreground" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-background/90 hover:bg-background shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownload(photoUrl, foto.photo);
                  }}
                  title="Baixar foto"
                >
                  <Download className="h-4 w-4 text-foreground" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-background/90 hover:bg-background shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShareTelegram(photoUrl);
                  }}
                  title="Compartilhar no Telegram"
                >
                  <Send className="h-4 w-4 text-foreground" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-background/90 hover:bg-background shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShareWhatsApp(photoUrl);
                  }}
                  title="Compartilhar no WhatsApp"
                >
                  <MessageCircle className="h-4 w-4 text-foreground" />
                </Button>
              </div>
            </div>
            <div className="p-2 bg-primary text-primary-foreground text-center text-sm font-medium">
              {`Foto ${index + 1}`}
            </div>
          </Card>
        </PhotoZoomOverlay>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={sectionCardClass}>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl min-w-0">
            <Camera className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Fotos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando fotos...</p>
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
              <Camera className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Fotos</span>
            </CardTitle>

            <div className="flex items-center gap-2 flex-shrink-0">
              {canManage && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={openAddPhotoModal}
                  title="Adicionar nova foto"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}

              <div className="relative inline-flex">
                <Badge variant="secondary" className="uppercase tracking-wide">
                  Online
                </Badge>

                {fotos.length > 0 ? (
                  <span
                    className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-1 ring-background"
                    aria-label={`Quantidade de fotos: ${fotos.length}`}
                  >
                    {fotos.length}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
          {fotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const placeholdersToAdd = Math.max(0, slotsToRender - fotos.length);

                return (
                  <>
                    {fotos.slice(0, slotsToRender).map((foto, index) => renderRealPhotoCard(foto, index))}
                    {Array.from({ length: placeholdersToAdd }).map((_, i) =>
                      renderPlaceholderCard(fotos.length + i)
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: slotsToRender }).map((_, index) => (
                  renderPlaceholderCard(index)
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Nenhuma foto cadastrada — exibindo imagens de exemplo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar foto</DialogTitle>
            <DialogDescription>
              Informe o caminho/URL da nova foto e, opcionalmente, um nome para o registro.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="foto-add-path">Caminho/URL da foto</Label>
              <Input
                id="foto-add-path"
                value={addPhotoValue}
                onChange={(e) => setAddPhotoValue(e.target.value)}
                placeholder="ex: fotos/arquivo.jpg"
              />
            </div>
            <div>
              <Label htmlFor="foto-add-nome">Nome (opcional)</Label>
              <Input
                id="foto-add-nome"
                value={addNomeValue}
                onChange={(e) => setAddNomeValue(e.target.value)}
                placeholder="Descrição da foto"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddModalOpen(false)} disabled={savingAdd}>
                Cancelar
              </Button>
              <Button onClick={handleAddPhoto} disabled={savingAdd}>
                {savingAdd ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar foto</DialogTitle>
            <DialogDescription>
              Informe o novo caminho/URL da foto e, opcionalmente, um nome para o registro.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="foto-path">Caminho/URL da foto</Label>
              <Input
                id="foto-path"
                value={editPhotoValue}
                onChange={(e) => setEditPhotoValue(e.target.value)}
                placeholder="ex: fotos/arquivo.jpg"
              />
            </div>
            <div>
              <Label htmlFor="foto-nome">Nome (opcional)</Label>
              <Input
                id="foto-nome"
                value={editNomeValue}
                onChange={(e) => setEditNomeValue(e.target.value)}
                placeholder="Descrição da foto"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={savingEdit}>
                Cancelar
              </Button>
              <Button onClick={handleSavePhotoEdit} disabled={savingEdit}>
                {savingEdit ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FotosSection;
