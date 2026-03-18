
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DownloadCloud, ArrowUpRight, Send, Gift } from 'lucide-react';

const transactionReferences = [
  { 
    type: 'deposit', 
    icon: DownloadCloud, 
    title: 'Depósito', 
    description: 'Adição de saldo à carteira',
    color: 'text-green-500'
  },
  { 
    type: 'withdrawal', 
    icon: ArrowUpRight, 
    title: 'Retirada', 
    description: 'Consumo de saldo em consultas',
    color: 'text-red-500'
  },
  { 
    type: 'transfer', 
    icon: Send, 
    title: 'Transferência', 
    description: 'Envio de saldo para outro usuário',
    color: 'text-blue-500'
  },
  { 
    type: 'gift', 
    icon: Gift, 
    title: 'Gift Card', 
    description: 'Envio de gift card para outro usuário',
    color: 'text-purple-500'
  }
];

const TransactionTypesReference: React.FC = () => {
  return (
    <Card className="dark:bg-gray-800 dark:text-white mb-6">
      <CardHeader>
        <CardTitle>Tipos de Transações</CardTitle>
        <CardDescription className="dark:text-gray-400">
          Entenda o significado de cada ícone no histórico
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {transactionReferences.map((ref, index) => (
            <div 
              key={index}
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="mr-3 p-2 rounded-full bg-white dark:bg-gray-600">
                <ref.icon className={`w-4 h-4 ${ref.color}`} />
              </div>
              <div>
                <p className="font-medium text-sm">{ref.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{ref.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionTypesReference;
