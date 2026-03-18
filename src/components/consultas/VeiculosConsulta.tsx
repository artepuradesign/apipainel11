
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VeiculosConsultaProps {
  onConsultaClick: (type: string) => void;
}

const VeiculosConsulta = ({ onConsultaClick }: VeiculosConsultaProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-t-4 border-t-brand-purple">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Consulta de Veículos</CardTitle>
              <CardDescription>Histórico completo de veículos por placa ou chassi</CardDescription>
            </div>
            <Truck className="h-16 w-16 text-brand-purple" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300">
              Nossa consulta de veículos fornece informações detalhadas sobre automóveis, motos e caminhões em todo território nacional.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Veículo Básico</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Marca e modelo</li>
                    <li>Ano de fabricação</li>
                    <li>Cor</li>
                    <li>Situação (roubo/furto)</li>
                  </ul>
                  <div className="mt-4 text-right">
                    <Badge className="bg-green-500">R$ 0,39/consulta</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Veículo Completo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Todos os dados do Veículo Básico</li>
                    <li>Histórico de proprietários</li>
                    <li>Restrições e gravames</li>
                    <li>Débitos pendentes</li>
                    <li>Recall</li>
                  </ul>
                  <div className="mt-4 text-right">
                    <Badge className="bg-blue-500">R$ 0,69/consulta</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <AlertDescription>
                Consulte veículos informando apenas a placa ou chassi, sem necessidade de documentos adicionais.
              </AlertDescription>
            </Alert>
            
            <Button 
              className="w-full bg-brand-purple hover:bg-brand-darkPurple text-white"
              onClick={() => onConsultaClick('Veículo')}
            >
              <Search className="mr-2 h-4 w-4" /> Realizar Consulta de Veículo
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VeiculosConsulta;
