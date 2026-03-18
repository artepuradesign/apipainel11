
import React from 'react';
import CodeBlock from './CodeBlock';

const CpfApiExample = () => {
  const cpfSampleRequest = `curl -X GET "https://api.apipainel.com.br/cpf/12345678909" \\
  -H "Authorization: Bearer {SUA_API_KEY}" \\
  -H "Content-Type: application/json"`;

  const cpfSampleResponse = `{
  "status": "success",
  "data": {
    "cpf": "123.456.789-09",
    "nome": "MARIA SILVA",
    "data_nascimento": "1980-05-15",
    "situacao_cadastral": "REGULAR",
    "data_inscricao": "1995-03-20",
    "genero": "F",
    "digito_verificador": "09"
  }
}`;

  return (
    <div className="space-y-4">
      <CodeBlock title="Requisição" code={cpfSampleRequest} />
      <CodeBlock title="Resposta" code={cpfSampleResponse} />
    </div>
  );
};

export default CpfApiExample;
