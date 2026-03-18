
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Headphones } from 'lucide-react';
import { PixKey } from '@/utils/database/pixKeyService';

interface PixKeyItemProps {
  pixKey: PixKey;
  loading: boolean;
  onSetPrimary: (keyId: number) => void;
}

const PixKeyItem: React.FC<PixKeyItemProps> = ({
  pixKey,
  loading,
  onSetPrimary
}) => {
  const getKeyTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'cpf': return 'CPF';
      case 'email': return 'Email';
      case 'telefone': return 'Telefone';
      default: return tipo;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-gray-300 dark:border-gray-600">
            {getKeyTypeLabel(pixKey.tipo_chave)}
          </Badge>
          {pixKey.is_primary && (
            <Badge className="bg-yellow-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Principal
            </Badge>
          )}
        </div>
        <p className="font-mono text-sm mt-1">{pixKey.chave_pix}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Cadastrada em {new Date(pixKey.criado_em).toLocaleDateString('pt-BR')}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {!pixKey.is_primary && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetPrimary(pixKey.id)}
            disabled={loading}
            className="border-gray-300 dark:border-gray-600"
          >
            <Star className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-gray-400 cursor-not-allowed border-gray-300 dark:border-gray-600"
        >
          <Headphones className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PixKeyItem;
