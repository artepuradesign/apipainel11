
import React from 'react';
import { Button } from '@/components/ui/button';

interface SaveButtonSectionProps {
  loading: boolean;
  onSave: () => void;
}

const SaveButtonSection: React.FC<SaveButtonSectionProps> = ({
  loading,
  onSave
}) => {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onSave} 
        disabled={loading}
        className="min-w-[150px]"
      >
        {loading ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </div>
  );
};

export default SaveButtonSection;
