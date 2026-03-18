
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { responseExamples } from './data/responses';

interface ResponsesTabProps {
  copiedCode: string | null;
  copyToClipboard: (text: string, type: string) => void;
}

export const ResponsesTab = ({ copiedCode, copyToClipboard }: ResponsesTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Check className="h-4 w-4 text-green-600" />
            Resposta de Sucesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(responseExamples.success, 'success')}
            >
              <Copy className="h-3 w-3 mr-1" />
              {copiedCode === 'success' ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
          <ScrollArea className="h-64">
            <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto">
              {responseExamples.success}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-4 w-4 text-red-600" />
            Resposta de Erro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(responseExamples.error, 'error')}
            >
              <Copy className="h-3 w-3 mr-1" />
              {copiedCode === 'error' ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
          <ScrollArea className="h-64">
            <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto">
              {responseExamples.error}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
