
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from 'lucide-react';
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';

const CheckerLista = () => {
  const currentPlan = localStorage.getItem("user_plan") || "Pré-Pago";

  return (
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <PageHeaderCard 
        title="Checker Lista"
        subtitle="Verifique múltiplos documentos de uma só vez através do upload de lista"
        currentPlan={currentPlan}
        isControlPanel={false}
      />
      
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="cpf">
            <TabsList className="mb-4">
              <TabsTrigger value="cpf">Lista de CPF</TabsTrigger>
              <TabsTrigger value="cnpj">Lista de CNPJ</TabsTrigger>
              <TabsTrigger value="placa">Lista de Placas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cpf">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Upload do arquivo</Label>
                  <Input id="file" type="file" accept=".txt,.csv" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Formatos aceitos: TXT ou CSV (um CPF por linha sem formatação)
                  </p>
                </div>
                <Button type="submit">
                  <Search size={18} className="mr-2" />
                  Processar Lista
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="cnpj">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-cnpj">Upload do arquivo</Label>
                  <Input id="file-cnpj" type="file" accept=".txt,.csv" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Formatos aceitos: TXT ou CSV (um CNPJ por linha sem formatação)
                  </p>
                </div>
                <Button type="submit">
                  <Search size={18} className="mr-2" />
                  Processar Lista
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="placa">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-placa">Upload do arquivo</Label>
                  <Input id="file-placa" type="file" accept=".txt,.csv" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Formatos aceitos: TXT ou CSV (uma placa por linha sem formatação)
                  </p>
                </div>
                <Button type="submit">
                  <Search size={18} className="mr-2" />
                  Processar Lista
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Listas</CardTitle>
          <CardDescription>Listas processadas anteriormente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Nenhuma lista foi processada ainda.
            <p className="mt-2 text-sm">Faça o upload de uma lista para começar.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckerLista;
