
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, User, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatsCardsProps {
  balance: number;
  totalQueries: number;
  queriesByType: {
    cpf: number;
    cnpj: number;
    vehicle: number;
  };
}

const StatsCards = ({
  balance,
  totalQueries,
  queriesByType
}: StatsCardsProps) => {
  const statsData = [
    {
      title: "Saldo Atual",
      value: `R$ ${balance.toFixed(2)}`,
      icon: Wallet,
      color: "text-green-600",
      action: (
        <Link to="/dashboard/adicionar-saldo">
          <Button variant="outline" size="sm" className="mt-2 w-full hover-scale transition-all duration-300">
            Adicionar Saldo
          </Button>
        </Link>
      )
    },
    {
      title: "Total de Consultas",
      value: totalQueries.toString(),
      icon: TrendingUp,
      color: "text-blue-600",
      subtitle: "Consultas realizadas"
    },
    {
      title: "Consultas CPF",
      value: queriesByType.cpf.toString(),
      icon: User,
      color: "text-purple-600",
      subtitle: "Documentos consultados"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title}
            className="dark:bg-gray-800 dark:border-gray-700 hover-lift transition-all duration-300"
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay={index * 100}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle 
                className="text-sm font-medium"
                data-aos="fade-in"
                data-aos-duration="500"
                data-aos-delay={index * 100 + 200}
              >
                {stat.title}
              </CardTitle>
              <div
                data-aos="zoom-in"
                data-aos-duration="500"
                data-aos-delay={index * 100 + 100}
              >
                <Icon className="h-4 w-4 text-muted-foreground animate-float" />
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className={`text-3xl font-bold ${stat.color} animate-fade-in-up`}
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay={index * 100 + 300}
              >
                {stat.value}
              </div>
              {stat.subtitle && (
                <p 
                  className="text-xs text-muted-foreground mt-1"
                  data-aos="fade-in"
                  data-aos-duration="500"
                  data-aos-delay={index * 100 + 400}
                >
                  {stat.subtitle}
                </p>
              )}
              {stat.action && (
                <div
                  data-aos="fade-up"
                  data-aos-duration="500"
                  data-aos-delay={index * 100 + 500}
                >
                  {stat.action}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
