
// Simulador de conexão MySQL para desenvolvimento local
import { DatabaseConfig } from './config';
import { migrations, getMigrationsList, getMigrationSQL, getExecutedMigrations, markMigrationAsExecuted } from './migrations';

export interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  affectedRows?: number;
  insertId?: number;
}

export class MySQLSimulator {
  private config: DatabaseConfig;
  private connected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<boolean> {
    try {
      // Simular conexão
      console.log(`Conectando ao MySQL em ${this.config.host}:${this.config.port}`);
      console.log(`Database: ${this.config.database}`);
      console.log(`User: ${this.config.user}`);
      
      // Simular delay de conexão
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.connected = true;
      localStorage.setItem('mysql_connected', 'true');
      
      // Executar migrations pendentes automaticamente
      await this.runMigrations();
      
      console.log('Conexão MySQL simulada estabelecida com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao conectar ao MySQL:', error);
      this.connected = false;
      localStorage.setItem('mysql_connected', 'false');
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    localStorage.setItem('mysql_connected', 'false');
    console.log('Conexão MySQL encerrada');
  }

  isConnected(): boolean {
    return this.connected && localStorage.getItem('mysql_connected') === 'true';
  }

  async query(sql: string, params: any[] = []): Promise<QueryResult> {
    if (!this.isConnected()) {
      return { success: false, error: 'Não conectado ao banco de dados' };
    }

    try {
      console.log('Executando query:', sql);
      console.log('Parâmetros:', params);

      // Simular execução da query
      await new Promise(resolve => setTimeout(resolve, 100));

      // Por enquanto, simular sucesso
      return {
        success: true,
        data: [],
        affectedRows: 1,
        insertId: Date.now()
      };
    } catch (error: any) {
      console.error('Erro na query:', error);
      return { success: false, error: error.message };
    }
  }

  async runMigrations(): Promise<void> {
    const allMigrations = getMigrationsList();
    const executedMigrations = getExecutedMigrations();
    const pendingMigrations = allMigrations.filter(m => !executedMigrations.includes(m));

    if (pendingMigrations.length === 0) {
      console.log('Todas as migrations já foram executadas');
      return;
    }

    console.log(`Executando ${pendingMigrations.length} migrations pendentes...`);

    for (const migrationName of pendingMigrations) {
      try {
        const sql = getMigrationSQL(migrationName);
        console.log(`Executando migration: ${migrationName}`);
        
        const result = await this.query(sql);
        if (result.success) {
          markMigrationAsExecuted(migrationName);
          console.log(`Migration ${migrationName} executada com sucesso`);
        } else {
          console.error(`Erro na migration ${migrationName}:`, result.error);
          break;
        }
      } catch (error) {
        console.error(`Erro ao executar migration ${migrationName}:`, error);
        break;
      }
    }

    console.log('Migrations concluídas');
  }
}

// Instância global do simulador
let mysqlInstance: MySQLSimulator | null = null;

export const getMySQLConnection = (config?: DatabaseConfig): MySQLSimulator => {
  if (!mysqlInstance && config) {
    mysqlInstance = new MySQLSimulator(config);
  }
  return mysqlInstance!;
};

export const resetMySQLConnection = (): void => {
  mysqlInstance = null;
  localStorage.removeItem('mysql_connected');
};
