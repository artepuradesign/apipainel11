import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Send, MessageCircle, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoZoomOverlayProps {
  photoUrl: string;
  alt: string;
  children: React.ReactNode;
  onCopyUrl?: (url: string) => void;
  onDownload?: (url: string, filename: string) => void;
  onShareTelegram?: (url: string) => void;
  onShareWhatsApp?: (url: string) => void;
}

const PhotoZoomOverlay: React.FC<PhotoZoomOverlayProps> = ({
  photoUrl,
  alt,
  children,
  onCopyUrl,
  onDownload,
  onShareTelegram,
  onShareWhatsApp,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopyUrl) {
      onCopyUrl(photoUrl);
    } else {
      navigator.clipboard.writeText(photoUrl);
      toast.success('URL da foto copiada!');
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      const filename = photoUrl.split('/').pop() || 'foto.jpg';
      onDownload(photoUrl, filename);
    } else {
      try {
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = photoUrl.split('/').pop() || 'foto.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast.success('Foto baixada com sucesso!');
      } catch (error) {
        toast.error('Erro ao baixar foto');
      }
    }
  };

  const handleShareTelegram = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareTelegram) {
      onShareTelegram(photoUrl);
    } else {
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(photoUrl)}`;
      window.open(telegramUrl, '_blank');
    }
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareWhatsApp) {
      onShareWhatsApp(photoUrl);
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(photoUrl)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setZoomLevel(1);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(1);
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="relative cursor-pointer"
      >
        {children}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagem ampliada */}
            <img
              src={photoUrl}
              alt={alt}
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            />

            {/* Controles de zoom */}
            <div className="absolute bottom-6 left-6 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 bg-background/95 hover:bg-background shadow-lg"
                onClick={handleZoomOut}
                title="Zoom Out"
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="h-4 w-4 text-orange-500 dark:text-foreground" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 bg-background/95 hover:bg-background shadow-lg"
                onClick={handleResetZoom}
                title="Reset Zoom"
              >
                <Maximize2 className="h-4 w-4 text-blue-500 dark:text-foreground" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 bg-background/95 hover:bg-background shadow-lg"
                onClick={handleZoomIn}
                title="Zoom In"
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="h-4 w-4 text-purple-500 dark:text-foreground" />
              </Button>
            </div>

            {/* Botões de ação */}
            <div className="absolute top-6 right-6 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 bg-background/95 hover:bg-background shadow-lg"
                onClick={handleDownload}
                title="Baixar foto"
              >
                <Download className="h-4 w-4 text-green-600 dark:text-green-400" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 bg-background/95 hover:bg-background shadow-lg"
                onClick={handleShareTelegram}
                title="Compartilhar no Telegram"
              >
                <Send className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 bg-background/95 hover:bg-background shadow-lg"
                onClick={handleShareWhatsApp}
                title="Compartilhar no WhatsApp"
              >
                <MessageCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 bg-background/95 hover:bg-background shadow-lg"
                onClick={handleClose}
                title="Fechar"
              >
                <X className="h-4 w-4 text-red-500 dark:text-red-400" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoZoomOverlay;
