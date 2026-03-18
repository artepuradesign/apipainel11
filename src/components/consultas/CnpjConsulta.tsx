
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CnpjConsultaProps {
  onConsultaClick: (type: string) => void;
}

const CnpjConsulta = ({ onConsultaClick }: CnpjConsultaProps) => {
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
              <CardTitle className="text-2xl">Consulta de CNPJ</CardTitle>
              <CardDescription>Informações completas sobre empresas</CardDescription>
            </div>
            <Building2 className="h-16 w-16 text-brand-purple" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300">
              Nossa consulta de CNPJ traz todos os dados cadastrais, quadro societário, filiais e histórico de uma empresa.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">CNPJ Básico</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Razão Social</li>
                    <li>Nome Fantasia</li>
                    <li>Situação cadastral</li>
                    <li>Data de abertura</li>
                    <li>Atividade principal</li>
                  </ul>
                  <div className="mt-4 text-right">
                    <Badge className="bg-green-500">R$ 0,29/consulta</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">CNPJ Completo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Todos os dados do CNPJ Básico</li>
                    <li>Quadro societário completo</li>
                    <li>Capital social</li>
                    <li>Atividades secundárias</li>
                    <li>Endereço completo</li>
                    <li>Filiais</li>
                  </ul>
                  <div className="mt-4 text-right">
                    <Badge className="bg-blue-500">R$ 0,59/consulta</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md dark:bg-blue-900/20">
              <h4 className="font-medium mb-2">CNPJ Premium</h4>
              <p className="text-sm mb-4">
                Inclui análise de risco, histórico de faturamento, processos judiciais, e muito mais para uma análise completa da empresa.
              </p>
              <div className="flex justify-between items-center">
                <Badge className="bg-purple-500">R$ 0,99/consulta</Badge>
                <Button 
                  variant="outline" 
                  className="border-brand-purple text-brand-purple hover:bg-brand-lightPurple"
                  onClick={() => onConsultaClick('CNPJ Premium')}
                >
                  Saiba mais
                </Button>
              </div>
            </div>
            
            <Button 
              className="w-full bg-brand-purple hover:bg-brand-darkPurple text-white"
              onClick={() => onConsultaClick('CNPJ')}
            >
              <Search className="mr-2 h-4 w-4" /> Realizar Consulta de CNPJ
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CnpjConsulta;
