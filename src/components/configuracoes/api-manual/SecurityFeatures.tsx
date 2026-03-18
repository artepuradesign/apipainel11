
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Key } from 'lucide-react';

const SecurityFeatures = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          Recursos de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-green-600" />
              <span className="text-sm">Autenticação JWT</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-green-600" />
              <span className="text-sm">Hash de senhas com BCrypt</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-green-600" />
              <span className="text-sm">Rate Limiting</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-green-600" />
              <span className="text-sm">Prepared Statements</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-green-600" />
              <span className="text-sm">Logs de auditoria</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-green-600" />
              <span className="text-sm">Headers de segurança</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-green-600" />
              <span className="text-sm">Validação de entrada</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-green-600" />
              <span className="text-sm">CORS configurado</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityFeatures;
