
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

const ApiManualHeader = () => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border-blue-200 dark:border-gray-600">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
            <FileText className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Manual da API - Sistema APD
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Documentação completa para implementação PHP/MySQL
        </p>
        <Badge variant="outline" className="mx-auto mt-2">
          Desenvolvido por Arte Pura Design
        </Badge>
      </CardHeader>
    </Card>
  );
};

export default ApiManualHeader;
