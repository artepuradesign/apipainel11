
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PageHeaderCard from '@/components/dashboard/PageHeaderCard';
import { useAuth } from '@/contexts/AuthContext';

const QRCodesVIP = () => {
  const { user } = useAuth();
  const currentPlan = user ? localStorage.getItem(`user_plan_${user.id}`) || "Pré-Pago" : "Pré-Pago";

  return (
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <PageHeaderCard 
        title="QRCodes VIP"
        subtitle="QRCodes exclusivos para consultas instantâneas"
        isControlPanel={false}
        currentPlan={currentPlan}
      />
      
      {/* Conteúdo Principal */}
      <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle>QR Codes Disponíveis</CardTitle>
          <CardDescription>Escaneie estes QR codes para realizar consultas rapidamente</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cpf">
            <TabsList className="mb-6">
              <TabsTrigger value="cpf">QR Code CPF</TabsTrigger>
              <TabsTrigger value="cnpj">QR Code CNPJ</TabsTrigger>
              <TabsTrigger value="veiculo">QR Code Veículo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cpf" className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg dark:border-gray-700">
                <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-500 dark:text-gray-400">QR Code CPF</span>
                </div>
                <Button>Baixar QR Code</Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Escaneie este QR code com a câmera do seu celular para acessar a consulta rápida de CPF
              </p>
            </TabsContent>
            
            <TabsContent value="cnpj" className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg dark:border-gray-700">
                <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-500 dark:text-gray-400">QR Code CNPJ</span>
                </div>
                <Button>Baixar QR Code</Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Escaneie este QR code com a câmera do seu celular para acessar a consulta rápida de CNPJ
              </p>
            </TabsContent>
            
            <TabsContent value="veiculo" className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg dark:border-gray-700">
                <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-500 dark:text-gray-400">QR Code Veículo</span>
                </div>
                <Button>Baixar QR Code</Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Escaneie este QR code com a câmera do seu celular para acessar a consulta rápida de veículos
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodesVIP;
