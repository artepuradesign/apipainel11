
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, BarChart3, Clock, FileText } from 'lucide-react';

interface ConsultationChartProps {
  consultationHistory: any[];
  title?: string;
}

const ConsultationChart: React.FC<ConsultationChartProps> = ({ 
  consultationHistory, 
  title = "Distribuição de Consultas" 
}) => {
  // Process data to group by date and count consultations
  const processChartData = () => {
    if (!consultationHistory.length) return [];

    // Group consultations by date
    const dateGroups = consultationHistory.reduce((acc, consultation) => {
      const date = new Date(consultation.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
      
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to chart data format and sort by date
    return Object.entries(dateGroups)
      .map(([date, count]) => ({
        date,
        consultas: count
      }))
      .slice(-7) // Show last 7 days
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split('/');
        const [dayB, monthB] = b.date.split('/');
        return new Date(`2024-${monthA}-${dayA}`).getTime() - new Date(`2024-${monthB}-${dayB}`).getTime();
      });
  };

  const getDailyConsultations = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    return consultationHistory.filter(consultation => 
      new Date(consultation.date).toLocaleDateString('pt-BR') === today
    ).length;
  };

  const getMonthlyConsultations = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return consultationHistory.filter(consultation => {
      const consultationDate = new Date(consultation.date);
      return consultationDate.getMonth() === currentMonth && 
             consultationDate.getFullYear() === currentYear;
    }).length;
  };

  const getTotalConsultations = () => {
    return consultationHistory.length;
  };

  const chartData = processChartData();
  const dailyConsultations = getDailyConsultations();
  const monthlyConsultations = getMonthlyConsultations();
  const totalConsultations = getTotalConsultations();

  const chartConfig = {
    consultas: {
      label: "Consultas",
      color: "hsl(var(--brand-purple))",
    },
  };

  if (totalConsultations === 0) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="mx-auto h-12 w-12 mb-4" />
            <p>Nenhuma consulta realizada ainda.</p>
            <p className="text-sm mt-2">Faça sua primeira consulta para ver o gráfico.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="text-xs">Diário</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Mensal</TabsTrigger>
            <TabsTrigger value="total" className="text-xs">Total</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="space-y-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Clock className="mx-auto h-8 w-8 mb-2 text-brand-purple" />
              <h3 className="text-2xl font-bold text-brand-purple">{dailyConsultations}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Consultas hoje</p>
            </div>
            {chartData.length > 0 && (
              <ChartContainer config={chartConfig} className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(-3)}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar 
                      dataKey="consultas" 
                      fill="var(--color-consultas)"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <BarChart3 className="mx-auto h-8 w-8 mb-2 text-brand-purple" />
              <h3 className="text-2xl font-bold text-brand-purple">{monthlyConsultations}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Consultas este mês</p>
            </div>
            {chartData.length > 0 && (
              <ChartContainer config={chartConfig} className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar 
                      dataKey="consultas" 
                      fill="var(--color-consultas)"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </TabsContent>

          <TabsContent value="total" className="space-y-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <FileText className="mx-auto h-8 w-8 mb-2 text-brand-purple" />
              <h3 className="text-2xl font-bold text-brand-purple">{totalConsultations}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de consultas</p>
            </div>
            {chartData.length > 0 && (
              <ChartContainer config={chartConfig} className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar 
                      dataKey="consultas" 
                      fill="var(--color-consultas)"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConsultationChart;
