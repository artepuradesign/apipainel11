
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, User, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ApiReferencePersonalInfo = () => {
  const { isSupport } = useAuth();
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

  // Só renderizar para usuários de suporte
  if (!isSupport) {
    return null;
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    toast.success('Código copiado!');
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const jsonStructure = {
    basicInfo: {
      login: "string (nome de usuário único)",
      email: "string (email válido)",
      full_name: "string (nome completo ou razão social)",
      tipo_pessoa: "enum ('fisica' | 'juridica')",
      cpf: "string (CPF no formato 000.000.000-00) - obrigatório para pessoa física",
      cnpj: "string (CNPJ no formato 00.000.000/0000-00) - obrigatório para pessoa jurídica",
      data_nascimento: "string (data no formato YYYY-MM-DD) - apenas pessoa física",
      telefone: "string (telefone no formato (00) 00000-0000)"
    },
    address: {
      cep: "string (CEP no formato 00000-000)",
      endereco: "string (logradouro)",
      numero: "string (número)",
      bairro: "string (bairro)",
      cidade: "string (cidade)",
      estado: "string (estado - UF)"
    },
    pixKeys: {
      chave_pix: "string (chave PIX)",
      tipo_chave: "enum ('cpf' | 'cnpj' | 'email' | 'telefone')",
      is_primary: "boolean (chave principal para saques)",
      documento_titular: "string (CPF ou CNPJ do titular da chave)",
      tipo_pessoa: "enum ('fisica' | 'juridica')"
    }
  };

  const phpApiExample = `<?php
// Endpoint: PUT /api/users/personal-info
// Atualizar informações pessoais

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, POST, GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Conectar ao banco
$servername = "localhost";
$username = "seu_usuario";
$password = "sua_senha";
$dbname = "seu_banco";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $input['user_id'];
        
        // Validar tipo de pessoa
        if (!in_array($input['tipo_pessoa'], ['fisica', 'juridica'])) {
            echo json_encode(['success' => false, 'message' => 'Tipo de pessoa inválido']);
            exit;
        }
        
        // Validar documentos conforme tipo de pessoa
        if ($input['tipo_pessoa'] === 'fisica' && empty($input['cpf'])) {
            echo json_encode(['success' => false, 'message' => 'CPF obrigatório para pessoa física']);
            exit;
        }
        
        if ($input['tipo_pessoa'] === 'juridica' && empty($input['cnpj'])) {
            echo json_encode(['success' => false, 'message' => 'CNPJ obrigatório para pessoa jurídica']);
            exit;
        }
        
        // Verificar se documento já existe
        if (!empty($input['cpf'])) {
            $sql = "SELECT id FROM users WHERE cpf = :cpf AND id != :user_id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':cpf' => $input['cpf'], ':user_id' => $userId]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => false, 'message' => 'CPF já cadastrado por outro usuário']);
                exit;
            }
        }
        
        if (!empty($input['cnpj'])) {
            $sql = "SELECT id FROM users WHERE cnpj = :cnpj AND id != :user_id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':cnpj' => $input['cnpj'], ':user_id' => $userId]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => false, 'message' => 'CNPJ já cadastrado por outro usuário']);
                exit;
            }
        }
        
        // Atualizar informações básicas
        $sql = "UPDATE users SET 
                full_name = :full_name,
                tipo_pessoa = :tipo_pessoa,
                cpf = :cpf,
                cnpj = :cnpj,
                data_nascimento = :data_nascimento,
                telefone = :telefone,
                cep = :cep,
                endereco = :endereco,
                numero = :numero,
                bairro = :bairro,
                cidade = :cidade,
                estado = :estado,
                updated_at = NOW()
                WHERE id = :user_id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':full_name' => $input['full_name'],
            ':tipo_pessoa' => $input['tipo_pessoa'],
            ':cpf' => $input['tipo_pessoa'] === 'fisica' ? $input['cpf'] : null,
            ':cnpj' => $input['tipo_pessoa'] === 'juridica' ? $input['cnpj'] : null,
            ':data_nascimento' => $input['tipo_pessoa'] === 'fisica' ? $input['data_nascimento'] : null,
            ':telefone' => $input['telefone'],
            ':cep' => $input['cep'],
            ':endereco' => $input['endereco'],
            ':numero' => $input['numero'],
            ':bairro' => $input['bairro'],
            ':cidade' => $input['cidade'],
            ':estado' => $input['estado'],
            ':user_id' => $userId
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Informações atualizadas com sucesso']);
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'add_pix') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Buscar dados do usuário
        $sql = "SELECT tipo_pessoa, cpf, cnpj FROM users WHERE id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $input['user_id']]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$userData) {
            echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
            exit;
        }
        
        // Validar limite de chaves por documento
        $documento = $userData['tipo_pessoa'] === 'fisica' ? $userData['cpf'] : $userData['cnpj'];
        $sql = "SELECT COUNT(*) FROM pix_keys WHERE documento_titular = :documento AND status = 'ativa'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':documento' => $documento]);
        $count = $stmt->fetchColumn();
        
        if ($count >= 3) {
            echo json_encode(['success' => false, 'message' => 'Limite de 3 chaves PIX atingido']);
            exit;
        }
        
        // Validar chave conforme tipo
        $chave_valida = true;
        $mensagem_erro = '';
        
        switch ($input['tipo_chave']) {
            case 'cpf':
                if ($userData['tipo_pessoa'] !== 'fisica' || $input['chave_pix'] !== $userData['cpf']) {
                    $chave_valida = false;
                    $mensagem_erro = 'Chave CPF deve ser igual ao CPF cadastrado na conta';
                }
                break;
            case 'cnpj':
                if ($userData['tipo_pessoa'] !== 'juridica' || $input['chave_pix'] !== $userData['cnpj']) {
                    $chave_valida = false;
                    $mensagem_erro = 'Chave CNPJ deve ser igual ao CNPJ cadastrado na conta';
                }
                break;
            case 'email':
                if (!filter_var($input['chave_pix'], FILTER_VALIDATE_EMAIL)) {
                    $chave_valida = false;
                    $mensagem_erro = 'Email inválido';
                }
                break;
            case 'telefone':
                if (!preg_match('/^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$/', $input['chave_pix'])) {
                    $chave_valida = false;
                    $mensagem_erro = 'Telefone deve estar no formato (11) 99999-9999';
                }
                break;
        }
        
        if (!$chave_valida) {
            echo json_encode(['success' => false, 'message' => $mensagem_erro]);
            exit;
        }
        
        // Verificar se chave já existe
        $sql = "SELECT id FROM pix_keys WHERE chave_pix = :chave_pix AND status = 'ativa'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':chave_pix' => $input['chave_pix']]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Chave PIX já cadastrada']);
            exit;
        }
        
        // Inserir nova chave PIX
        $sql = "INSERT INTO pix_keys (user_id, chave_pix, tipo_chave, documento_titular, is_primary, status, criado_em) 
                VALUES (:user_id, :chave_pix, :tipo_chave, :documento_titular, :is_primary, 'ativa', NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':user_id' => $input['user_id'],
            ':chave_pix' => $input['chave_pix'],
            ':tipo_chave' => $input['tipo_chave'],
            ':documento_titular' => $documento,
            ':is_primary' => $input['is_primary'] ? 1 : 0
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Chave PIX cadastrada com sucesso']);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>`;

  const mysqlSchema = `-- Tabela de usuários (campos relacionados a informações pessoais)
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo_pessoa ENUM('fisica', 'juridica') DEFAULT 'fisica';
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cep VARCHAR(9);
ALTER TABLE users ADD COLUMN IF NOT EXISTS endereco VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS numero VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bairro VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS estado VARCHAR(2);

-- Tabela para chaves PIX (atualizada para suportar CNPJ)
CREATE TABLE IF NOT EXISTS pix_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chave_pix VARCHAR(100) NOT NULL UNIQUE,
    tipo_chave ENUM('cpf', 'cnpj', 'email', 'telefone') NOT NULL,
    documento_titular VARCHAR(18) NOT NULL COMMENT 'CPF ou CNPJ do titular',
    is_primary BOOLEAN DEFAULT FALSE,
    status ENUM('ativa', 'inativa') DEFAULT 'ativa',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_documento_titular (documento_titular),
    INDEX idx_status (status)
);

-- Trigger para garantir apenas uma chave principal por usuário
DELIMITER //
CREATE TRIGGER update_primary_pix 
    BEFORE UPDATE ON pix_keys
    FOR EACH ROW
BEGIN
    IF NEW.is_primary = 1 THEN
        UPDATE pix_keys SET is_primary = 0 WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
END//
DELIMITER ;

-- Trigger para garantir que CPF/CNPJ não sejam duplicados
DELIMITER //
CREATE TRIGGER validate_document_uniqueness
    BEFORE INSERT ON users
    FOR EACH ROW
BEGIN
    IF NEW.cpf IS NOT NULL AND EXISTS(SELECT 1 FROM users WHERE cpf = NEW.cpf) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CPF já cadastrado';
    END IF;
    
    IF NEW.cnpj IS NOT NULL AND EXISTS(SELECT 1 FROM users WHERE cnpj = NEW.cnpj) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CNPJ já cadastrado';
    END IF;
END//
DELIMITER ;`;

  const frontendExample = `// Exemplo de integração no frontend
import { toast } from 'sonner';
import { formatCpf, formatCnpj, formatPhone } from '@/utils/formatters';

// Função para atualizar informações pessoais
const updatePersonalInfo = async (personalData) => {
  try {
    // Validar campos obrigatórios baseado no tipo de pessoa
    if (personalData.tipo_pessoa === 'fisica' && !personalData.cpf) {
      toast.error('CPF é obrigatório para pessoa física');
      return { success: false };
    }
    
    if (personalData.tipo_pessoa === 'juridica' && !personalData.cnpj) {
      toast.error('CNPJ é obrigatório para pessoa jurídica');
      return { success: false };
    }
    
    const response = await fetch('/api/users/personal-info', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify({
        user_id: userId,
        ...personalData
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      toast.success('Informações atualizadas com sucesso!');
      return result;
    } else {
      toast.error(result.message);
      return { success: false };
    }
  } catch (error) {
    console.error('Erro ao atualizar informações:', error);
    toast.error('Erro interno ao atualizar informações');
    return { success: false };
  }
};

// Função para adicionar chave PIX (com suporte a CNPJ)
const addPixKey = async (pixKeyData) => {
  try {
    const response = await fetch('/api/users/personal-info?action=add_pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify({
        user_id: userId,
        chave_pix: pixKeyData.key,
        tipo_chave: pixKeyData.type, // 'cpf', 'cnpj', 'email', 'telefone'
        is_primary: pixKeyData.isPrimary
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      toast.success('Chave PIX cadastrada com sucesso!');
      // Recarregar lista de chaves
      loadPixKeys();
    } else {
      toast.error(result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao cadastrar chave PIX:', error);
    toast.error('Erro interno ao cadastrar chave PIX');
    return { success: false };
  }
};

// Validação de chaves PIX no frontend
const validatePixKey = (key, type, userCpf, userCnpj, tipoPessoa) => {
  switch (type) {
    case 'cpf':
      if (tipoPessoa !== 'fisica') return { valid: false, message: 'CPF só pode ser usado por pessoa física' };
      if (!/^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$/.test(key)) return { valid: false, message: 'CPF inválido' };
      if (key !== userCpf) return { valid: false, message: 'Chave CPF deve ser igual ao CPF cadastrado' };
      break;
    case 'cnpj':
      if (tipoPessoa !== 'juridica') return { valid: false, message: 'CNPJ só pode ser usado por pessoa jurídica' };
      if (!/^\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}$/.test(key)) return { valid: false, message: 'CNPJ inválido' };
      if (key !== userCnpj) return { valid: false, message: 'Chave CNPJ deve ser igual ao CNPJ cadastrado' };
      break;
    case 'email':
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(key)) return { valid: false, message: 'Email inválido' };
      break;
    case 'telefone':
      if (!/^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$/.test(key)) return { valid: false, message: 'Telefone inválido' };
      break;
  }
  return { valid: true };
};

// Formatadores para campos
const handleCpfChange = (e, setFormData) => {
  const formatted = formatCpf(e.target.value);
  setFormData(prev => ({ ...prev, cpf: formatted }));
};

const handleCnpjChange = (e, setFormData) => {
  const formatted = formatCnpj(e.target.value);
  setFormData(prev => ({ ...prev, cnpj: formatted }));
};

const handlePhoneChange = (e, setFormData) => {
  const formatted = formatPhone(e.target.value);
  setFormData(prev => ({ ...prev, telefone: formatted }));
};`;

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <User className="h-5 w-5" />
          Referência da API - Informações Pessoais (com CNPJ)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="structure" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structure">Estrutura JSON</TabsTrigger>
            <TabsTrigger value="php">PHP API</TabsTrigger>
            <TabsTrigger value="mysql">MySQL Schema</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
          </TabsList>

          <TabsContent value="structure" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Estrutura das Informações Pessoais</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(JSON.stringify(jsonStructure, null, 2), 'structure')}
                >
                  {copiedStates.structure ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                {JSON.stringify(jsonStructure, null, 2)}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="php" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">API PHP para Informações Pessoais</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(phpApiExample, 'php')}
                >
                  {copiedStates.php ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                {phpApiExample}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="mysql" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Schema MySQL</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(mysqlSchema, 'mysql')}
                >
                  {copiedStates.mysql ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                {mysqlSchema}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="frontend" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Integração Frontend</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(frontendExample, 'frontend')}
                >
                  {copiedStates.frontend ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                {frontendExample}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Informações Importantes</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• CPF deve ser único no sistema e obrigatório para pessoa física</li>
            <li>• CNPJ deve ser único no sistema e obrigatório para pessoa jurídica</li>
            <li>• Máximo de 3 chaves PIX por documento (CPF ou CNPJ)</li>
            <li>• Apenas uma chave PIX pode ser principal por usuário</li>
            <li>• Chaves PIX CPF/CNPJ devem ser iguais ao documento cadastrado</li>
            <li>• CEP é buscado automaticamente via API ViaCEP</li>
            <li>• Data de nascimento é obrigatória apenas para pessoa física</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiReferencePersonalInfo;
