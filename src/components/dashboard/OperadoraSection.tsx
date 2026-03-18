import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from 'lucide-react';

interface OperadoraSectionProps {
  title: string;
  description?: string;
}

const OperadoraSection: React.FC<OperadoraSectionProps> = ({ title }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
          <Globe className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4 text-muted-foreground">
          <Globe className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm">Nenhum registro encontrado</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperadoraSection;
