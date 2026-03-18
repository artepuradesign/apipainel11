import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cupomApiService, Cupom } from '@/services/cupomApiService';

interface CupomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  cupom?: Cupom | null;
}

const CupomFormModal = ({ isOpen, onClose, onSave, cupom }: CupomFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    tipo: 'fixo' as 'fixo' | 'percentual',
    valor: '',
    destino_saldo: 'plano' as 'plano' | 'carteira',
    status: 'ativo' as 'ativo' | 'inativo',
    uso_limite: '',
    valido_ate: ''
  });

  const isEditing = !!cupom;

  useEffect(() => {
    if (cupom) {
      setFormData({
        codigo: cupom.codigo,
        descricao: cupom.descricao || '',
        tipo: cupom.tipo,
        valor: cupom.valor.toString(),
        destino_saldo: cupom.destino_saldo || 'plano',
        status: cupom.status,
        uso_limite: cupom.uso_limite?.toString() || '',
        valido_ate: cupom.valido_ate ? cupom.valido_ate.slice(0, 16) : ''
      });
    } else {
      setFormData({
        codigo: '',
        descricao: '',
        tipo: 'fixo',
        valor: '',
        destino_saldo: 'plano',
        status: 'ativo',
        uso_limite: '',
        valido_ate: ''
      });
    }
  }, [cupom, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo.trim()) {
      toast.error('Código é obrigatório');
      return;
    }
    
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }

    // Validação específica para cupons percentuais
    if (formData.tipo === 'percentual') {
      const valorPercentual = parseFloat(formData.valor);
      if (valorPercentual < 1 || valorPercentual > 100) {
        toast.error('Valor percentual deve estar entre 1% e 100%');
        return;
      }
    }

    setIsLoading(true);

    try {
      const data = {
        codigo: formData.codigo.trim().toUpperCase(),
        descricao: formData.descricao.trim() || null,
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        destino_saldo: formData.destino_saldo,
        status: formData.status,
        uso_limite: formData.uso_limite ? parseInt(formData.uso_limite) : null,
        valido_ate: formData.valido_ate || null
      };

      let response;
      if (isEditing) {
        response = await cupomApiService.updateCupom({ ...data, id: cupom.id });
      } else {
        response = await cupomApiService.createCupom(data);
      }

      if (response.success) {
        onSave();
      } else {
        toast.error(response.error || 'Erro ao salvar cupom');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEditing ? 'Editar Cupom' : 'Novo Cupom'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="codigo" className="text-sm">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                placeholder="WELCOME20"
                className="h-9"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="tipo" className="text-sm">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: 'fixo' | 'percentual') => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixo">Fixo (R$)</SelectItem>
                  <SelectItem value="percentual">% (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao" className="text-sm">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição do cupom"
              className="min-h-[60px] resize-none"
              rows={2}
            />
          </div>

          {formData.tipo === 'fixo' && (
            <div className="space-y-1.5">
              <Label htmlFor="destino_saldo" className="text-sm">Destino do Valor</Label>
              <Select
                value={formData.destino_saldo}
                onValueChange={(value: 'plano' | 'carteira') => setFormData({ ...formData, destino_saldo: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plano">Saldo do Plano (padrão)</SelectItem>
                  <SelectItem value="carteira">Saldo da Carteira</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="valor" className="text-sm">
                Valor * {formData.tipo === 'fixo' ? '(R$)' : '(%)'}
              </Label>
              <Input
                id="valor"
                type="number"
                step={formData.tipo === 'fixo' ? '0.01' : '1'}
                min="0"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder={formData.tipo === 'fixo' ? '20.00' : '10'}
                className="h-9"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="uso_limite" className="text-sm">Limite</Label>
              <Input
                id="uso_limite"
                type="number"
                min="1"
                value={formData.uso_limite}
                onChange={(e) => setFormData({ ...formData, uso_limite: e.target.value })}
                placeholder="∞"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-sm">Status</Label>
              <div className="flex items-center h-9">
                <Switch
                  id="status"
                  checked={formData.status === 'ativo'}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, status: checked ? 'ativo' : 'inativo' })
                  }
                />
                <Label htmlFor="status" className="ml-2 text-xs cursor-pointer">
                  {formData.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="valido_ate" className="text-sm">Válido Até</Label>
            <Input
              id="valido_ate"
              type="datetime-local"
              value={formData.valido_ate}
              onChange={(e) => setFormData({ ...formData, valido_ate: e.target.value })}
              className="h-9"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="h-9">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="h-9">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                isEditing ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CupomFormModal;