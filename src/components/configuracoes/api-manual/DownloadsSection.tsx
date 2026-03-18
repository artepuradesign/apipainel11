
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Database, Code, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generateMySQLScript } from './scripts/mysqlScript';
import { generatePHPManual } from './scripts/phpManual';

const DownloadsSection = () => {
  const handleDownloadScript = () => {
    const mysqlScript = generateMySQLScript();
    
    const element = document.createElement('a');
    const file = new Blob([mysqlScript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `apd_mysql_complete_script_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Script MySQL APD baixado com sucesso!');
  };

  const handleDownloadPhpFiles = () => {
    const phpInstructions = generatePHPManual();
    
    const element = document.createElement('a');
    const file = new Blob([phpInstructions], { type: 'text/plain; charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `manual_php_mysql_apd_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Manual PHP/MySQL baixado com sucesso!');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Script MySQL Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Script completo para criação do banco de dados com todas as tabelas, 
            procedures, triggers e dados iniciais.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Estrutura completa de tabelas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Procedures armazenados</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Sistema de indicações</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Logs de auditoria</span>
            </div>
          </div>
          <Button onClick={handleDownloadScript} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Baixar Script MySQL
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-600" />
            Manual PHP Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manual completo com códigos PHP, configurações do servidor e 
            instruções de implementação.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>APIs RESTful completas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Sistema de autenticação JWT</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Configurações de servidor</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Medidas de segurança</span>
            </div>
          </div>
          <Button onClick={handleDownloadPhpFiles} className="w-full" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Baixar Manual PHP
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadsSection;
