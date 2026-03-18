
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { EndpointsTab } from './api-reference-plans/EndpointsTab';
import { ResponsesTab } from './api-reference-plans/ResponsesTab';
import { ExamplesTab } from './api-reference-plans/ExamplesTab';
import { IntegrationTab } from './api-reference-plans/IntegrationTab';
import { AuthTab } from './api-reference-plans/AuthTab';

const ApiReferencePlans = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(type);
    toast.success(`Código ${type} copiado!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="responses">Respostas</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
          <TabsTrigger value="integration">Integração</TabsTrigger>
          <TabsTrigger value="auth">Autenticação</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <EndpointsTab />
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <ResponsesTab copiedCode={copiedCode} copyToClipboard={copyToClipboard} />
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <ExamplesTab copiedCode={copiedCode} copyToClipboard={copyToClipboard} />
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <IntegrationTab copiedCode={copiedCode} copyToClipboard={copyToClipboard} />
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <AuthTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiReferencePlans;
