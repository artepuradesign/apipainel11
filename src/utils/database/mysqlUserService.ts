
// Serviço para gerenciar usuários no MySQL real
export interface MySQLUser {
  id: number;
  login: string;
  email: string;
  full_name: string;
  status: string;
  user_role: string;
  saldo: number;
  saldo_plano: number;
  created_at: string;
}

export const mysqlUserService = {
  async listUsers(): Promise<MySQLUser[]> {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        return data.users || [];
      }
      throw new Error('Erro ao buscar usuários');
    } catch (error) {
      console.error('Erro ao listar usuários do MySQL:', error);
      return [];
    }
  },

  async createUser(userData: Partial<MySQLUser>): Promise<boolean> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return false;
    }
  },

  async migrateSimulatedData(): Promise<boolean> {
    try {
      // Pegar dados simulados do localStorage
      const simulatedUsers = JSON.parse(localStorage.getItem('system_users') || '[]');
      const consultationHistory = JSON.parse(localStorage.getItem('global_consultation_history') || '[]');
      const transactions = JSON.parse(localStorage.getItem('central_cash_transactions') || '[]');

      const response = await fetch('/api/migrate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          users: simulatedUsers,
          consultations: consultationHistory,
          transactions: transactions
        })
      });

      if (response.ok) {
        // Marcar como migrado
        localStorage.setItem('data_migrated_to_mysql', 'true');
        return true;
      }
      throw new Error('Falha na migração');
    } catch (error) {
      console.error('Erro na migração de dados:', error);
      return false;
    }
  }
};
