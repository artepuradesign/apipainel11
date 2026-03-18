
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Car, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActivityChartsProps {
  totalQueries: number;
  queriesByType: {
    cpf: number;
    cnpj: number;
    vehicle: number;
  };
}

const ActivityCharts = ({ totalQueries, queriesByType }: ActivityChartsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Últimas consultas */}
      <Card className="dark:bg-gray-800 dark:text-white">
        <CardHeader>
          <CardTitle className="text-lg">Últimas consultas</CardTitle>
          <CardDescription className="dark:text-gray-400">Suas consultas mais recentes</CardDescription>
        </CardHeader>
        <CardContent>
          {totalQueries > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-3 text-brand-purple dark:text-brand-purple" />
                  <div>
                    <p className="font-medium">Consulta de CPF</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">***.***.***-12</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">2 min atrás</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 mr-3 text-brand-purple dark:text-brand-purple" />
                  <div>
                    <p className="font-medium">Consulta de CNPJ</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">12.345.678/0001-99</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">1 hora atrás</span>
              </div>
              <Link to="/dashboard/historico">
                <Button variant="outline" size="sm" className="w-full">
                  Ver histórico completo
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhuma consulta realizada ainda.
              <p className="mt-2 text-sm">Faça sua primeira consulta usando os formulários disponíveis.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Distribuição de consultas */}
      <Card className="dark:bg-gray-800 dark:text-white">
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de consultas</CardTitle>
          <CardDescription className="dark:text-gray-400">Tipos de consultas realizadas</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6">
          {totalQueries > 0 ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-6 mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-brand-purple flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  <p className="mt-1 font-bold">{queriesByType.cpf}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">CPF</p>
                </div>
                
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  <p className="mt-1 font-bold">{queriesByType.cnpj}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">CNPJ</p>
                </div>
                
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <Car className="w-8 h-8 text-white" />
                    </div>
                  <p className="mt-1 font-bold">{queriesByType.vehicle}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Veículo</p>
                </div>
              </div>
              
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div className="bg-brand-purple h-full" style={{ width: `${(queriesByType.cpf / totalQueries) * 100}%` }}></div>
                  <div className="bg-blue-500 h-full" style={{ width: `${(queriesByType.cnpj / totalQueries) * 100}%` }}></div>
                  <div className="bg-green-500 h-full" style={{ width: `${(queriesByType.vehicle / totalQueries) * 100}%` }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhuma consulta realizada ainda.
              <p className="mt-2 text-sm">Faça consultas para ver estatísticas aqui.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityCharts;
