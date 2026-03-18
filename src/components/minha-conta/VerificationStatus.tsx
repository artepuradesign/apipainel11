
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface VerificationStatusProps {
  emailVerificado: boolean;
  telefoneVerificado: boolean;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ 
  emailVerificado, 
  telefoneVerificado 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-purple" />
          Status de Verificação
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${emailVerificado ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <p className="font-medium">E-mail</p>
            <p className="text-sm text-gray-600">
              {emailVerificado ? 'Verificado' : 'Não verificado'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${telefoneVerificado ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <p className="font-medium">Telefone</p>
            <p className="text-sm text-gray-600">
              {telefoneVerificado ? 'Verificado' : 'Não verificado'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationStatus;
