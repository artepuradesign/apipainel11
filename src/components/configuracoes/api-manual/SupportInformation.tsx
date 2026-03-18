
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Globe, FileText, AlertCircle } from 'lucide-react';

const SupportInformation = () => {
  return (
    <>
      {/* Informações de Suporte */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Suporte Técnico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h4 className="font-medium text-purple-800 dark:text-purple-300">Arte Pura Design (APD)</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Para suporte técnico, dúvidas sobre implementação ou customizações, 
              entre em contato conosco.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Button 
                variant="outline" 
                onClick={() => window.open('https://artepuradesign.com.br', '_blank')}
              >
                <Globe className="mr-2 h-4 w-4" />
                Website APD
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('mailto:suporte@artepuradesign.com.br', '_blank')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Email Suporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aviso importante */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800 dark:text-orange-200">Importante</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Este manual contém códigos e configurações para implementação em ambiente de produção. 
                Certifique-se de configurar adequadamente as medidas de segurança e realizar testes 
                antes de colocar em produção.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SupportInformation;
