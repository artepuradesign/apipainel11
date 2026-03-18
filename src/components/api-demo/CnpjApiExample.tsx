
import React from 'react';
import CodeBlock from './CodeBlock';

const CnpjApiExample = () => {
  const cnpjSampleRequest = `curl -X GET "https://api.apipainel.com.br/cnpj/12345678000190" \\
  -H "Authorization: Bearer {SUA_API_KEY}" \\
  -H "Content-Type: application/json"`;

  const cnpjSampleResponse = `{
  "status": "success",
  "data": {
    "cnpj": "12.345.678/0001-90",
    "razao_social": "EMPRESA EXEMPLO LTDA",
    "nome_fantasia": "EXEMPLO COMERCIO",
    "data_abertura": "2010-03-15",
    "situacao_cadastral": "ATIVA",
    "cnae_principal": {
      "codigo": "4751-2/01",
      "descricao": "Comércio varejista especializado de equipamentos e suprimentos de informática"
    },
    "endereco": {
      "logradouro": "RUA EXEMPLO",
      "numero": "123",
      "complemento": "SALA 45",
      "bairro": "CENTRO",
      "municipio": "SAO PAULO",
      "uf": "SP",
      "cep": "01001-000"
    },
    "capital_social": 100000.00
  }
}`;

  return (
    <div className="space-y-4">
      <CodeBlock title="Requisição" code={cnpjSampleRequest} />
      <CodeBlock title="Resposta" code={cnpjSampleResponse} />
    </div>
  );
};

export default CnpjApiExample;
