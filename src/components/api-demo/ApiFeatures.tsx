
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileJson, Code } from 'lucide-react';

const ApiFeatures = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson size={24} className="text-brand-purple" />
          Recursos da API
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="bg-brand-lightPurple text-brand-purple rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">1</span>
            <div>
              <h4 className="font-medium">Formato JSON</h4>
              <p className="text-sm text-gray-600">Todas as respostas são retornadas em formato JSON para fácil integração.</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-brand-lightPurple text-brand-purple rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">2</span>
            <div>
              <h4 className="font-medium">Autenticação por token</h4>
              <p className="text-sm text-gray-600">Utilize seu token de API para autenticação segura.</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-brand-lightPurple text-brand-purple rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">3</span>
            <div>
              <h4 className="font-medium">Endpoints dedicados</h4>
              <p className="text-sm text-gray-600">Endpoints específicos para CPF e CNPJ com validações completas.</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-brand-lightPurple text-brand-purple rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">4</span>
            <div>
              <h4 className="font-medium">Documentação completa</h4>
              <p className="text-sm text-gray-600">Acesso à documentação detalhada com exemplos práticos.</p>
            </div>
          </li>
        </ul>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full border-brand-purple text-brand-purple hover:bg-brand-lightPurple hover:text-brand-purple">
            <Code size={18} className="mr-2" />
            Ver documentação completa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiFeatures;
