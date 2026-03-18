
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

export const AuthTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-600" />
          Autenticação API
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Bearer Token</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Inclua seu token de API no header Authorization:
            </p>
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">
              Authorization: Bearer sua-api-key-aqui
            </code>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Headers Obrigatórios</h3>
            <ul className="text-sm space-y-1">
              <li>• <code>Content-Type: application/json</code></li>
              <li>• <code>Accept: application/json</code></li>
              <li>• <code>Authorization: Bearer &#123;sua-api-key&#125;</code> (para endpoints privados)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
