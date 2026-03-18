
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CodeBlockProps {
  title: string;
  code: string;
}

const CodeBlock = ({ title, code }: CodeBlockProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Código copiado",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span>{title}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => copyToClipboard(code)}
            className="h-8"
          >
            <Copy size={16} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-gray-900 text-white p-4 rounded-b-lg overflow-auto">
        <pre className="text-xs font-mono">{code}</pre>
      </CardContent>
    </Card>
  );
};

export default CodeBlock;
