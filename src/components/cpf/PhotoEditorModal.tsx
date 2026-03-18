import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RotateCw, RotateCcw, Save, Eraser, Undo2, Crop, Contrast } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  fileName: string;
  onSave: (editedFile: File) => void;
  /**
   * Quando habilitado, mostra a opção de converter a imagem para preto e branco
   * (útil para assinatura digital: fundo branco e traço preto).
   */
  enableBlackWhite?: boolean;
}

type EditorMode = 'none' | 'bgremove' | 'crop';

const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  open, onOpenChange, imageUrl, fileName, onSave, enableBlackWhite = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<EditorMode>('none');
  const [tolerance, setTolerance] = useState(30);
  const [bwThreshold, setBwThreshold] = useState(200);
  const [bwTransparentBg, setBwTransparentBg] = useState(true);
  const [historyStack, setHistoryStack] = useState<ImageData[]>([]);
  const [canvasReady, setCanvasReady] = useState(false);
  // Crop state
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    if (!open || !imageUrl) return;
    setMode('none');
    setHistoryStack([]);
    setCanvasReady(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistoryStack([initial]);
      setCropRect({ x: 0, y: 0, w: canvas.width, h: canvas.height });
      setCanvasReady(true);
    };
    img.src = imageUrl;
  }, [open, imageUrl]);

  // Save state to history
  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistoryStack(prev => [...prev, data]);
  }, []);

  // Undo
  const handleUndo = () => {
    if (historyStack.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newStack = historyStack.slice(0, -1);
    const prev = newStack[newStack.length - 1];
    canvas.width = prev.width;
    canvas.height = prev.height;
    ctx.putImageData(prev, 0, 0);
    setCropRect({ x: 0, y: 0, w: canvas.width, h: canvas.height });
    setHistoryStack(newStack);
  };

  // Rotate
  const handleRotate = (dir: 'cw' | 'ccw') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;
    const tCtx = tempCanvas.getContext('2d')!;

    tCtx.save();
    if (dir === 'cw') {
      tCtx.translate(tempCanvas.width, 0);
      tCtx.rotate(Math.PI / 2);
    } else {
      tCtx.translate(0, tempCanvas.height);
      tCtx.rotate(-Math.PI / 2);
    }

    // Draw current canvas (not original image) to preserve edits
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = canvas.width;
    srcCanvas.height = canvas.height;
    srcCanvas.getContext('2d')!.putImageData(currentData, 0, 0);
    tCtx.drawImage(srcCanvas, 0, 0);
    tCtx.restore();

    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    ctx.drawImage(tempCanvas, 0, 0);
    setCropRect({ x: 0, y: 0, w: canvas.width, h: canvas.height });
    pushHistory();
  };

  // Background removal - flood fill
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'bgremove') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;

    const startIdx = (y * w + x) * 4;
    const tR = data[startIdx], tG = data[startIdx + 1], tB = data[startIdx + 2];
    if (data[startIdx + 3] === 0) return;

    const tol = tolerance;
    const visited = new Uint8Array(w * h);
    const stack: [number, number][] = [[x, y]];
    let count = 0;

    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
      const pos = cy * w + cx;
      if (visited[pos]) continue;
      
      const idx = pos * 4;
      const dr = Math.abs(data[idx] - tR);
      const dg = Math.abs(data[idx + 1] - tG);
      const db = Math.abs(data[idx + 2] - tB);
      if (dr > tol || dg > tol || db > tol || data[idx + 3] === 0) continue;

      visited[pos] = 1;
      data[idx + 3] = 0;
      count++;

      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    pushHistory();
    toast.success(`${count} pixels removidos`);
  }, [mode, tolerance, pushHistory]);

  // --- CROP overlay logic ---
  const getDisplayScale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    return rect.width / canvas.width;
  }, []);

  const drawCropOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas || mode !== 'crop') return;
    
    const rect = canvas.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    overlay.width = rect.width;
    overlay.height = rect.height;
    overlay.style.left = `${rect.left - containerRect.left}px`;
    overlay.style.top = `${rect.top - containerRect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    const ctx = overlay.getContext('2d')!;
    const s = getDisplayScale();
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // Dim outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, overlay.width, overlay.height);

    // Clear crop area
    const cx = cropRect.x * s, cy = cropRect.y * s, cw = cropRect.w * s, ch = cropRect.h * s;
    ctx.clearRect(cx, cy, cw, ch);

    // Border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(cx, cy, cw, ch);

    // Handles
    ctx.setLineDash([]);
    const handleSize = 10;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    const handles = [
      { id: 'tl', x: cx, y: cy },
      { id: 'tr', x: cx + cw, y: cy },
      { id: 'bl', x: cx, y: cy + ch },
      { id: 'br', x: cx + cw, y: cy + ch },
      { id: 't', x: cx + cw / 2, y: cy },
      { id: 'b', x: cx + cw / 2, y: cy + ch },
      { id: 'l', x: cx, y: cy + ch / 2 },
      { id: 'r', x: cx + cw, y: cy + ch / 2 },
    ];

    handles.forEach(h => {
      ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    });
  }, [mode, cropRect, getDisplayScale]);

  useEffect(() => {
    drawCropOverlay();
  }, [drawCropOverlay]);

  useEffect(() => {
    if (mode !== 'crop') return;
    const interval = setInterval(drawCropOverlay, 100);
    return () => clearInterval(interval);
  }, [mode, drawCropOverlay]);

  const getHandleAtPoint = (mx: number, my: number): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const s = getDisplayScale();
    const cx = cropRect.x * s, cy = cropRect.y * s, cw = cropRect.w * s, ch = cropRect.h * s;
    const hs = 14;

    const handles: { id: string; x: number; y: number }[] = [
      { id: 'tl', x: cx, y: cy },
      { id: 'tr', x: cx + cw, y: cy },
      { id: 'bl', x: cx, y: cy + ch },
      { id: 'br', x: cx + cw, y: cy + ch },
      { id: 't', x: cx + cw / 2, y: cy },
      { id: 'b', x: cx + cw / 2, y: cy + ch },
      { id: 'l', x: cx, y: cy + ch / 2 },
      { id: 'r', x: cx + cw, y: cy + ch / 2 },
    ];

    for (const h of handles) {
      if (Math.abs(mx - h.x) < hs && Math.abs(my - h.y) < hs) return h.id;
    }

    // Check if inside crop area for move
    if (mx >= cx && mx <= cx + cw && my >= cy && my <= cy + ch) return 'move';
    return null;
  };

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'crop') return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const rect = overlay.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const handle = getHandleAtPoint(mx, my);
    if (handle) {
      setDragging(handle);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleOverlayMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || mode !== 'crop') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const s = getDisplayScale();
    const dx = (e.clientX - dragStart.x) / s;
    const dy = (e.clientY - dragStart.y) / s;
    setDragStart({ x: e.clientX, y: e.clientY });

    setCropRect(prev => {
      let { x, y, w, h } = prev;
      const maxW = canvas.width;
      const maxH = canvas.height;

      if (dragging === 'move') {
        x = Math.max(0, Math.min(maxW - w, x + dx));
        y = Math.max(0, Math.min(maxH - h, y + dy));
      } else {
        if (dragging.includes('l')) { const nx = Math.max(0, x + dx); w -= (nx - x); x = nx; }
        if (dragging.includes('r')) { w = Math.min(maxW - x, w + dx); }
        if (dragging.includes('t')) { const ny = Math.max(0, y + dy); h -= (ny - y); y = ny; }
        if (dragging.includes('b')) { h = Math.min(maxH - y, h + dy); }
        w = Math.max(20, w);
        h = Math.max(20, h);
      }

      return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
    });
  }, [dragging, mode, dragStart, getDisplayScale]);

  const handleOverlayMouseUp = () => setDragging(null);

  // Apply crop
  const applyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { x, y, w, h } = cropRect;
    if (w < 10 || h < 10) return;

    const croppedData = ctx.getImageData(x, y, w, h);
    canvas.width = w;
    canvas.height = h;
    ctx.putImageData(croppedData, 0, 0);
    setCropRect({ x: 0, y: 0, w, h });
    pushHistory();
    setMode('none');
    toast.success('Imagem cortada!');
  };

  const applyBlackAndWhite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // "Nível" (threshold): quanto maior, mais pixels viram preto.
    const threshold = Math.max(0, Math.min(255, bwThreshold));

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Se o pixel já estiver transparente (ex.: usuário removeu fundo), trate como fundo.
      if (a === 0) {
        if (bwTransparentBg) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 0;
        } else {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
        }
        continue;
      }

      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const isInk = luminance < threshold;

      if (isInk) {
        // Traço preto (estilo assinatura digital)
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      } else {
        // Fundo: branco ou transparente
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = bwTransparentBg ? 0 : 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    pushHistory();
    toast.success(bwTransparentBg ? 'Efeito digital aplicado (PNG com transparência)' : 'Efeito digital aplicado (fundo branco)');
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) { toast.error('Erro ao salvar'); return; }
      const safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const file = new File([blob], `${safeName}.png`, { type: 'image/png' });
      onSave(file);
      onOpenChange(false);
      toast.success('Foto salva com sucesso!');
    }, 'image/png');
  };

  const getCursor = () => {
    if (mode === 'bgremove') return 'crosshair';
    if (mode === 'crop') return dragging ? 'grabbing' : 'default';
    return 'default';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Editor de Foto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Canvas area */}
          <div
            ref={containerRef}
            className="relative bg-[repeating-conic-gradient(#d1d5db_0%_25%,transparent_0%_50%)_50%/16px_16px] border rounded-lg overflow-hidden flex items-center justify-center"
            style={{ minHeight: 180, maxHeight: 360 }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="max-w-full max-h-[350px] object-contain"
              style={{ cursor: mode === 'bgremove' ? 'crosshair' : 'default' }}
            />
            {mode === 'crop' && (
              <canvas
                ref={overlayRef}
                className="absolute"
                style={{ cursor: getCursor(), pointerEvents: 'auto' }}
                onMouseDown={handleOverlayMouseDown}
                onMouseMove={handleOverlayMouseMove}
                onMouseUp={handleOverlayMouseUp}
                onMouseLeave={handleOverlayMouseUp}
              />
            )}
          </div>

          {/* Tools */}
          <div className="space-y-3">
            {/* Rotation */}
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Rotação</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleRotate('ccw')} className="h-8 w-8 p-0">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleRotate('cw')} className="h-8 w-8 p-0">
                  <RotateCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Black & White */}
            {enableBlackWhite && (
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <Contrast className="h-3 w-3" /> Efeito digital (P&B)
                  </Label>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={applyBlackAndWhite}>
                    Aplicar
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Nível: {bwThreshold}</Label>
                  <Slider min={0} max={255} step={5} value={[bwThreshold]} onValueChange={(v) => setBwThreshold(v[0])} />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">Fundo transparente (PNG)</Label>
                  <Button
                    type="button"
                    variant={bwTransparentBg ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setBwTransparentBg((v) => !v)}
                  >
                    {bwTransparentBg ? 'Ativo ✓' : 'Desativado'}
                  </Button>
                </div>
              </div>
            )}
            {/* Crop */}
            <div className="flex items-center justify-between border-t pt-3">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Crop className="h-3 w-3" /> Cortar Imagem
              </Label>
              <div className="flex gap-2">
                {mode === 'crop' ? (
                  <>
                    <Button size="sm" className="h-7 text-xs" onClick={applyCrop}>
                      Aplicar Corte
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setMode('none')}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const canvas = canvasRef.current;
                      if (canvas) setCropRect({ x: 0, y: 0, w: canvas.width, h: canvas.height });
                      setMode('crop');
                    }}
                  >
                    Ativar
                  </Button>
                )}
              </div>
            </div>
            {mode === 'crop' && (
              <p className="text-[10px] text-muted-foreground">
                Arraste os quadrados brancos nos cantos e lados para ajustar a área de corte.
              </p>
            )}

            {/* Background removal */}
            <div className="flex items-center justify-between border-t pt-3">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Eraser className="h-3 w-3" /> Remover Fundo
              </Label>
              <Button
                variant={mode === 'bgremove' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setMode(mode === 'bgremove' ? 'none' : 'bgremove')}
              >
                {mode === 'bgremove' ? 'Ativo ✓' : 'Ativar'}
              </Button>
            </div>
            {mode === 'bgremove' && (
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">
                  Clique na área do fundo da foto para remover. Tolerância: {tolerance}
                </Label>
                <Slider min={5} max={80} step={5} value={[tolerance]} onValueChange={(v) => setTolerance(v[0])} />
              </div>
            )}

            {/* Undo */}
            <div className="flex items-center gap-2 border-t pt-3">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleUndo} disabled={historyStack.length <= 1}>
                <Undo2 className="h-3 w-3 mr-1" /> Desfazer
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} className="bg-brand-purple hover:bg-brand-darkPurple">
            <Save className="h-3.5 w-3.5 mr-1.5" /> Salvar e Usar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoEditorModal;
