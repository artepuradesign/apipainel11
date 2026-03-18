
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ScoreConsultaProps {
  onConsultaClick: (type: string) => void;
}

const ScoreConsulta = ({ onConsultaClick }: ScoreConsultaProps) => {
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
              <CardTitle className="text-2xl">Consulta de Score</CardTitle>
              <CardDescription>Análise de risco e pontuação de crédito</CardDescription>
            </div>
            <FileText className="h-16 w-16 text-brand-purple" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300">
              Nossa consulta de Score permite avaliar o risco de crédito de pessoas físicas e jurídicas com informações atualizadas.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Score Básico</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Pontuação Serasa</li>
                    <li>Faixa de risco</li>
                    <li>Capacidade de pagamento</li>
                  </ul>
                  <div className="mt-4 text-right">
                    <Badge className="bg-amber-500 text-white">R$ 1,00/consulta</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Score Completo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Todos os dados do Score Básico</li>
                    <li>Histórico de pagamentos</li>
                    <li>Consultas recentes</li>
                    <li>Recomendações de crédito</li>
                    <li>Probabilidade de inadimplência</li>
                  </ul>
                  <div className="mt-4 text-right">
                    <Badge className="bg-purple-500">R$ 2,99/consulta</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg text-center dark:from-red-900/30 dark:to-red-900/10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-red-400 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">400</span>
                </div>
                <p className="font-medium">Score Baixo</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alto risco</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg text-center dark:from-green-900/30 dark:to-green-900/10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">950</span>
                </div>
                <p className="font-medium">Score Alto</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Baixo risco</p>
              </div>
            </div>
            
            <Button 
              className="w-full bg-brand-purple hover:bg-brand-darkPurple text-white"
              onClick={() => onConsultaClick('Score')}
            >
              <Search className="mr-2 h-4 w-4" /> Realizar Consulta de Score
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ScoreConsulta;
