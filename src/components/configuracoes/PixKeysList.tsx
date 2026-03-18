
import React from 'react';
import { PixKey } from '@/utils/database/pixKeyService';
import PixKeyItem from './PixKeyItem';

interface PixKeysListProps {
  pixKeys: PixKey[];
  loading: boolean;
  onSetPrimary: (keyId: number) => void;
}

const PixKeysList: React.FC<PixKeysListProps> = ({
  pixKeys,
  loading,
  onSetPrimary
}) => {
  if (pixKeys.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Nenhuma chave PIX cadastrada
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pixKeys.map((key) => (
        <PixKeyItem
          key={key.id}
          pixKey={key}
          loading={loading}
          onSetPrimary={onSetPrimary}
        />
      ))}
    </div>
  );
};

export default PixKeysList;
