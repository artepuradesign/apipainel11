
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface PixKeyFormProps {
  newKey: string;
  keyType: 'cpf' | 'cnpj' | 'email' | 'telefone';
  userCpf: string;
  userCnpj?: string;
  tipoPessoa: 'fisica' | 'juridica';
  loading: boolean;
  pixKeysCount: number;
  onNewKeyChange: (value: string) => void;
  onKeyTypeChange: (value: 'cpf' | 'cnpj' | 'email' | 'telefone') => void;
  onAddPixKey: () => void;
}

const PixKeyForm: React.FC<PixKeyFormProps> = ({
  newKey,
  keyType,
  userCpf,
  userCnpj,
  tipoPessoa,
  loading,
  pixKeysCount,
  onNewKeyChange,
  onKeyTypeChange,
  onAddPixKey
}) => {
  const getPlaceholder = () => {
    switch (keyType) {
      case 'cpf': return '000.000.000-00';
      case 'cnpj': return '00.000.000/0000-00';
      case 'email': return 'seu@email.com';
      case 'telefone': return '(11) 99999-9999';
      default: return '';
    }
  };

  const getDocumentInfo = () => {
    if (tipoPessoa === 'fisica') {
      return `As chaves PIX devem pertencer ao mesmo CPF cadastrado na conta (${userCpf})`;
    } else {
      return `As chaves PIX devem pertencer ao mesmo CNPJ cadastrado na conta (${userCnpj || 'CNPJ não cadastrado'})`;
    }
  };

  if (pixKeysCount >= 3) return null;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        <span className="font-medium">Cadastrar Nova Chave PIX</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Tipo de Chave</Label>
          <Select value={keyType} onValueChange={onKeyTypeChange}>
            <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="telefone">Telefone</SelectItem>
              {tipoPessoa === 'fisica' && <SelectItem value="cpf">CPF</SelectItem>}
              {tipoPessoa === 'juridica' && <SelectItem value="cnpj">CNPJ</SelectItem>}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Chave PIX</Label>
          <Input
            value={newKey}
            onChange={(e) => onNewKeyChange(e.target.value)}
            placeholder={getPlaceholder()}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>
        
        <div className="flex items-end">
          <Button 
            onClick={onAddPixKey}
            disabled={loading || !newKey.trim()}
            className="w-full"
          >
            Cadastrar
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400">
        * {getDocumentInfo()}
      </p>
      
      {pixKeysCount === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
            🎁 Ao cadastrar sua primeira chave PIX, sua conta será automaticamente ativada e você receberá o bônus de boas-vindas!
          </p>
        </div>
      )}
    </div>
  );
};

export default PixKeyForm;
