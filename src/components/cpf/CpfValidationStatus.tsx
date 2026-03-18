import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ValidationStatus {
  cpf: boolean;
  nome: boolean;
  cpfFormat: boolean;
}

interface CpfValidationStatusProps {
  cpf: string;
  nome: string;
}

const CpfValidationStatus: React.FC<CpfValidationStatusProps> = ({ cpf, nome }) => {
  const validateCpf = (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
    if (checkDigit !== parseInt(cleanCpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
    if (checkDigit !== parseInt(cleanCpf.charAt(10))) return false;
    
    return true;
  };

  const status: ValidationStatus = {
    cpf: cpf.replace(/\D/g, '').length === 11,
    nome: nome.trim().length >= 2,
    cpfFormat: validateCpf(cpf)
  };

  const allValid = status.cpf && status.nome && status.cpfFormat;
  const hasIssues = !status.cpf || !status.nome || !status.cpfFormat;

  if (!cpf && !nome) {
    return null;
  }

  return (
    <Alert className={`mt-4 ${allValid ? 'border-green-500 bg-green-50' : hasIssues ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}>
      <AlertCircle className={`h-4 w-4 ${allValid ? 'text-green-600' : 'text-yellow-600'}`} />
      <AlertDescription>
        <div className="space-y-2">
          <div className="font-medium mb-2">
            {allValid ? 'Dados válidos para cadastro' : 'Verificação dos dados obrigatórios:'}
          </div>
          
          <div className="flex items-center gap-2">
            {status.cpf ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className={status.cpf ? 'text-green-700' : 'text-red-700'}>
              CPF com 11 dígitos: {cpf.replace(/\D/g, '').length}/11
            </span>
          </div>

          <div className="flex items-center gap-2">
            {status.cpfFormat ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className={status.cpfFormat ? 'text-green-700' : 'text-red-700'}>
              CPF com formato válido
            </span>
          </div>

          <div className="flex items-center gap-2">
            {status.nome ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className={status.nome ? 'text-green-700' : 'text-red-700'}>
              Nome completo (mín. 2 caracteres): {nome.trim().length}
            </span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default CpfValidationStatus;