
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Terminal, Code, Database } from 'lucide-react';

const ArchitectureOverview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-orange-600" />
          Arquitetura do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <Terminal className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h4 className="font-medium">Frontend</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">React + TypeScript</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <Code className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h4 className="font-medium">Backend</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">PHP 8.1+ com PDO</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h4 className="font-medium">Banco de Dados</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">MySQL 8.0+</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchitectureOverview;
