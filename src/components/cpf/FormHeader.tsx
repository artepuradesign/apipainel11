import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from 'lucide-react';

interface FormHeaderProps {
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const FormHeader = ({ onBack, onSubmit, loading }: FormHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold">Cadastrar CPF</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Cadastre um novo CPF na base de dados
          </p>
        </div>
      </div>
      
      <Button 
        onClick={onSubmit}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        <Save className="h-4 w-4 mr-2" />
        {loading ? 'Salvando...' : 'Salvar CPF'}
      </Button>
    </div>
  );
};

export default FormHeader;