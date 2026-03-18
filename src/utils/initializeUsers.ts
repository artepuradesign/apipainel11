
// Função para inicializar usuários de exemplo no localStorage
export const initializeExampleUsers = () => {
  const users = [
    {
      id: 1,
      username: "artepuradesign",
      email: "contato@artepuradesign.com",
      password: "Senhas@2020", // Em produção, isso seria um hash
      full_name: "Arte Pura Design",
      plan: "Rei de Espadas",
      balance: "0.00",
      user_role: "assinante",
      status: "active",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      username: "artepura",
      email: "admin@artepura.com",
      password: "Senhas@2026", // Em produção, isso seria um hash
      full_name: "Administrador Sistema",
      plan: "Rei de Espadas",
      balance: "1000.00",
      user_role: "suporte",
      status: "active",
      created_at: new Date().toISOString()
    }
  ];

  // Salvar no localStorage (simulando banco de dados)
  localStorage.setItem("example_users", JSON.stringify(users));
  
  console.log("Usuários de exemplo inicializados:");
  console.log("1. Usuário Assinante:");
  console.log("   Username: artepuradesign");
  console.log("   Email: contato@artepuradesign.com");
  console.log("   Senha: Senhas@2020");
  console.log("   Plano: Rei de Espadas");
  console.log("");
  console.log("2. Usuário Administrador:");
  console.log("   Username: artepura");
  console.log("   Email: admin@artepura.com");
  console.log("   Senha: Senhas@2026");
  console.log("   Role: suporte");
  
  return users;
};

// Função para processar indicação na criação de conta
export const processReferralSignup = (newUserId: string, referralCode?: string): { newUserBalance: number, referrerBonus: number } => {
  let newUserBalance = 0.00;
  let referrerBonus = 0.00;

  if (referralCode) {
    // Verificar se o código de indicação é válido
    const users = JSON.parse(localStorage.getItem("example_users") || "[]");
    const referrer = users.find((user: any) => user.id.toString() === referralCode || user.username === referralCode);
    
    if (referrer) {
      // Verificar se o referrer já recebeu bônus (limitado a 1 vez)
      const referralHistory = JSON.parse(localStorage.getItem("referral_history") || "[]");
      const alreadyRewarded = referralHistory.find((ref: any) => ref.referrer_id === referrer.id);
      
      if (!alreadyRewarded) {
        // Dar bônus para o novo usuário (valor dinâmico)
        newUserBalance = 3.00; // Valor padrão, deve ser atualizado pela API
        
        // Dar bônus para quem indicou (valor dinâmico)
        referrerBonus = 3.00; // Valor padrão, deve ser atualizado pela API
        const currentReferrerBalance = parseFloat(referrer.balance || "0.00");
        referrer.balance = (currentReferrerBalance + referrerBonus).toString();
        
        // Atualizar usuários no localStorage
        const updatedUsers = users.map((user: any) => 
          user.id === referrer.id ? referrer : user
        );
        localStorage.setItem("example_users", JSON.stringify(updatedUsers));
        
        // Registrar a indicação
        referralHistory.push({
          referrer_id: referrer.id,
          referred_user_id: newUserId,
          bonus_amount: referrerBonus,
          created_at: new Date().toISOString()
        });
        localStorage.setItem("referral_history", JSON.stringify(referralHistory));
        
        console.log(`Bônus de indicação processado: Novo usuário recebeu R$ ${newUserBalance}, Indicador recebeu R$ ${referrerBonus}`);
      } else {
        console.log("Indicador já recebeu bônus anteriormente.");
      }
    }
  }

  return { newUserBalance, referrerBonus };
};

// Função para autenticar usuário (simulando login)
export const authenticateUser = (username: string, password: string) => {
  const users = JSON.parse(localStorage.getItem("example_users") || "[]");
  const user = users.find((u: any) => u.username === username && u.password === password);
  
  if (user) {
    // Simular autenticação
    localStorage.setItem("auth_token", "mock_token_" + user.id);
    localStorage.setItem("auth_user", JSON.stringify(user));
    localStorage.setItem("user_plan", user.plan);
    localStorage.setItem("user_balance", user.balance);
    localStorage.setItem("user_name", user.full_name);
    
    // Configurar perfil para o contexto de autenticação
    const profile = {
      id: user.id.toString(),
      full_name: user.full_name,
      avatar_url: null,
      user_role: user.user_role
    };
    localStorage.setItem("auth_profile", JSON.stringify(profile));
    
    return user;
  }
  
  return null;
};

// Função para criar novo usuário (registro)
export const createNewUser = (userData: {
  username: string;
  email: string;
  password: string;
  full_name: string;
  referralCode?: string;
}) => {
  const users = JSON.parse(localStorage.getItem("example_users") || "[]");
  const newUserId = Date.now().toString();
  
  // Processar indicação se fornecida
  const { newUserBalance, referrerBonus } = processReferralSignup(newUserId, userData.referralCode);
  
  const newUser = {
    id: parseInt(newUserId),
    username: userData.username,
    email: userData.email,
    password: userData.password,
    full_name: userData.full_name,
    plan: "Pré-Pago", // Todos os novos usuários começam como Pré-Pago
    balance: newUserBalance.toString(),
    user_role: "assinante",
    status: "active",
    created_at: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem("example_users", JSON.stringify(users));
  
  return { user: newUser, referrerBonus };
};

// Inicializar automaticamente ao carregar o módulo
if (typeof window !== 'undefined') {
  const existingUsers = localStorage.getItem("example_users");
  if (!existingUsers) {
    initializeExampleUsers();
  }
}
