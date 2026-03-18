
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Code } from 'lucide-react';
import { integrationExample } from './data/examples';

interface ExamplesTabProps {
  copiedCode: string | null;
  copyToClipboard: (text: string, type: string) => void;
}

export const ExamplesTab = ({ copiedCode, copyToClipboard }: ExamplesTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-4 w-4 text-blue-600" />
          Exemplo JavaScript/React
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(integrationExample, 'integration')}
          >
            <Copy className="h-3 w-3 mr-1" />
            {copiedCode === 'integration' ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>
        <ScrollArea className="h-96">
          <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-x-auto">
            {integrationExample}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
