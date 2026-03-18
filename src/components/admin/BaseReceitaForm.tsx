import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseReceita } from '@/services/baseReceitaService';

const baseReceitaSchema = z.object({
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(11, 'CPF deve ter 11 dígitos'),
  situacao_cadastral: z.string().optional(),
  data_inscricao: z.string().optional(),
  digito_verificador: z.string().optional(),
  data_emissao: z.string().optional(),
  codigo_controle: z.string().optional(),
  qr_link: z.string().optional(),
});

type BaseReceitaFormData = z.infer<typeof baseReceitaSchema>;

interface BaseReceitaFormProps {
  initialData?: BaseReceita | null;
  onSubmit: (data: BaseReceitaFormData) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const BaseReceitaForm: React.FC<BaseReceitaFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<BaseReceitaFormData>({
    resolver: zodResolver(baseReceitaSchema),
    defaultValues: {
      cpf: initialData?.cpf?.replace(/\D/g, '') || '',
      situacao_cadastral: initialData?.situacao_cadastral || '',
      data_inscricao: initialData?.data_inscricao || '',
      digito_verificador: initialData?.digito_verificador || '',
      data_emissao: initialData?.data_emissao || '',
      codigo_controle: initialData?.codigo_controle || '',
      qr_link: initialData?.qr_link || '',
    }
  });

  const situacaoValue = watch('situacao_cadastral');

  const formatCpfInput = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    return limited;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfInput(e.target.value);
    setValue('cpf', formatted);
  };

  const isReadOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            {...register('cpf')}
            onChange={handleCpfChange}
            placeholder="00000000000"
            readOnly={isReadOnly || mode === 'edit'} // CPF não pode ser editado
            className={isReadOnly ? 'bg-gray-100' : ''}
          />
          {errors.cpf && (
            <p className="text-sm text-red-600">{errors.cpf.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="situacao_cadastral">Situação Cadastral</Label>
          {isReadOnly ? (
            <Input
              value={initialData?.situacao_cadastral || ''}
              readOnly
              className="bg-gray-100"
            />
          ) : (
            <Select
              value={situacaoValue}
              onValueChange={(value) => setValue('situacao_cadastral', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGULAR">REGULAR</SelectItem>
                <SelectItem value="CANCELADO">CANCELADO</SelectItem>
                <SelectItem value="SUSPENSO">SUSPENSO</SelectItem>
                <SelectItem value="IRREGULAR">IRREGULAR</SelectItem>
              </SelectContent>
            </Select>
          )}
          {errors.situacao_cadastral && (
            <p className="text-sm text-red-600">{errors.situacao_cadastral.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_inscricao">Data de Inscrição</Label>
          <Input
            id="data_inscricao"
            type="date"
            {...register('data_inscricao')}
            readOnly={isReadOnly}
            className={isReadOnly ? 'bg-gray-100' : ''}
          />
          {errors.data_inscricao && (
            <p className="text-sm text-red-600">{errors.data_inscricao.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="digito_verificador">Dígito Verificador</Label>
          <Input
            id="digito_verificador"
            {...register('digito_verificador')}
            placeholder="00"
            maxLength={2}
            readOnly={isReadOnly}
            className={isReadOnly ? 'bg-gray-100' : ''}
          />
          {errors.digito_verificador && (
            <p className="text-sm text-red-600">{errors.digito_verificador.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_emissao">Data de Emissão</Label>
          <Input
            id="data_emissao"
            type="datetime-local"
            {...register('data_emissao')}
            readOnly={isReadOnly}
            className={isReadOnly ? 'bg-gray-100' : ''}
          />
          {errors.data_emissao && (
            <p className="text-sm text-red-600">{errors.data_emissao.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="codigo_controle">Código de Controle</Label>
          <Input
            id="codigo_controle"
            {...register('codigo_controle')}
            placeholder="000000000000"
            maxLength={12}
            readOnly={isReadOnly}
            className={isReadOnly ? 'bg-gray-100' : ''}
          />
          {errors.codigo_controle && (
            <p className="text-sm text-red-600">{errors.codigo_controle.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="qr_link">QR Receita</Label>
          <Input
            id="qr_link"
            {...register('qr_link')}
            placeholder="https://..."
            type="url"
            readOnly={isReadOnly}
            className={isReadOnly ? 'bg-gray-100' : ''}
          />
          {errors.qr_link && (
            <p className="text-sm text-red-600">{errors.qr_link.message}</p>
          )}
        </div>
      </div>

      {initialData && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Informações do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">ID:</span> {initialData.id}
            </div>
            <div>
              <span className="font-medium">Criado em:</span>{' '}
              {initialData.created_at 
                ? new Date(initialData.created_at).toLocaleString('pt-BR') 
                : '-'}
            </div>
            <div>
              <span className="font-medium">Atualizado em:</span>{' '}
              {initialData.updated_at 
                ? new Date(initialData.updated_at).toLocaleString('pt-BR') 
                : '-'}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {mode === 'view' ? 'Fechar' : 'Cancelar'}
        </Button>
        {mode !== 'view' && (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        )}
      </div>
    </form>
  );
};

export default BaseReceitaForm;