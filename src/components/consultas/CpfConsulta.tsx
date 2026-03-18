
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CpfConsultaProps {
  onConsultaClick: (type: string) => void;
}

const CpfConsulta = ({ onConsultaClick }: CpfConsultaProps) => {
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
              <CardTitle className="text-2xl">Consulta de CPF</CardTitle>
              <CardDescription>Dados completos de pessoas físicas</CardDescription>
            </div>
            <User className="h-16 w-16 text-brand-purple dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300">
              Nossa consulta de CPF oferece informações atualizadas sobre pessoas físicas, com diferentes níveis de detalhamento conforme sua necessidade.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">CPF Básico</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Situação cadastral</li>
                    <li>Nome completo</li>
                    <li>Data de nascimento</li>
                    <li>Situação no CPF</li>
                  </ul>
                  <div className="mt-4 text-right">
                    <Badge className="bg-green-500">R$ 0,19/consulta</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">CPF Completo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Todos os dados do CPF Básico</li>
                    <li>Nome da mãe</li>
                    <li>Endereço completo</li>
                    <li>Óbito (quando aplicável)</li>
                    <li>Gênero</li>
                  </ul>
                  <div className="mt-4 text-right">
                    <Badge className="bg-blue-500">R$ 0,39/consulta</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md dark:bg-blue-900/20">
              <h4 className="font-medium mb-2">CPF Premium</h4>
              <p className="text-sm mb-4">
                Nossa consulta mais completa inclui histórico de endereços, telefones, e-mails, vínculos empresariais e muito mais.
              </p>
              <div className="flex justify-between items-center">
                <Badge className="bg-purple-500">R$ 0,59/consulta</Badge>
                <Button 
                  variant="outline" 
                  className="border-brand-purple text-brand-purple hover:bg-brand-lightPurple"
                  onClick={() => onConsultaClick('CPF Premium')}
                >
                  Saiba mais
                </Button>
              </div>
            </div>
            
            <Button 
              className="w-full bg-brand-purple hover:bg-brand-darkPurple text-white"
              onClick={() => onConsultaClick('CPF')}
            >
              <Search className="mr-2 h-4 w-4" /> Realizar Consulta de CPF
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CpfConsulta;
