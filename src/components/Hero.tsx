import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { toast } from "sonner";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';

const Hero = () => {
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState<string>("cpf");
  const [documentNumber, setDocumentNumber] = useState<string>("");

  // Interação sutil (efeito "spotlight")
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${mx}px ${my}px, hsl(var(--primary) / 0.08), transparent 60%)`;

  // Verificar se o usuário está logado
  const isAuthenticated = () => {
    return localStorage.getItem("auth_token") !== null;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar se o usuário está logado
    if (!isAuthenticated()) {
      toast.error("É necessário fazer login para realizar consultas", {
        description: "Crie uma conta ou faça login para acessar todos os recursos.",
        action: {
          label: "Entrar",
          onClick: () => navigate('/login')
        },
        cancel: {
          label: "Atualizar",
          onClick: () => {
            // Verificar saldo do usuário
            const authUser = localStorage.getItem('auth_user');
            if (authUser) {
              const user = JSON.parse(authUser);
              const userId = user.id;

              // Obter saldos
              const walletBalance = parseFloat(localStorage.getItem(`wallet_balance_${userId}`) || '0');
              const planBalance = parseFloat(localStorage.getItem(`plan_balance_${userId}`) || '0');
              const totalBalance = walletBalance + planBalance;

              // Se saldo for 0, fazer logout
              if (totalBalance === 0) {
                console.log('🚫 [HERO] Saldo zerado, fazendo logout...');

                // Limpar dados de autenticação
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                localStorage.removeItem('session_token');
                document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'auth_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

                toast.success('Saldo atualizado!', {
                  description: 'Sua sessão foi encerrada pois seu saldo é zero.'
                });

                // Redirecionar para login
                setTimeout(() => {
                  navigate('/login');
                }, 1000);
              } else {
                toast.success('Saldo atualizado!', {
                  description: `Saldo disponível: R$ ${totalBalance.toFixed(2)}`
                });
              }
            } else {
              toast.info('Saldo atualizado!', {
                description: 'Faça login para ver seu saldo.'
              });
            }
          }
        }
      });
      return;
    }

    // Validar documento
    const cleanDocument = documentNumber.replace(/\D/g, '');
    if (documentType === "cpf" && cleanDocument.length !== 11) {
      toast.error("Por favor, digite um CPF válido");
      return;
    }
    if (documentType === "cnpj" && cleanDocument.length !== 14) {
      toast.error("Por favor, digite um CNPJ válido");
      return;
    }

    // Se estiver logado, redirecionar para a página específica com o documento
    const targetPage = documentType === "cpf" ? "/dashboard/consultar-cpf-puxa-tudo" : "/dashboard/consultar-cnpj";
    navigate(`${targetPage}?query=${encodeURIComponent(documentNumber)}&autoSearch=true`);
  };

  const formatDocument = (value: string) => {
    const numericValue = value.replace(/\D/g, '');

    if (documentType === "cpf") {
      if (numericValue.length <= 11) {
        let formattedValue = numericValue;
        if (numericValue.length > 9) {
          formattedValue = `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9, 11)}`;
        } else if (numericValue.length > 6) {
          formattedValue = `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
        } else if (numericValue.length > 3) {
          formattedValue = `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
        }
        return formattedValue;
      }
    } else {
      if (numericValue.length <= 14) {
        let formattedValue = numericValue;
        if (numericValue.length > 12) {
          formattedValue = `${numericValue.slice(0, 2)}.${numericValue.slice(2, 5)}.${numericValue.slice(5, 8)}/${numericValue.slice(8, 12)}-${numericValue.slice(12, 14)}`;
        } else if (numericValue.length > 8) {
          formattedValue = `${numericValue.slice(0, 2)}.${numericValue.slice(2, 5)}.${numericValue.slice(5, 8)}/${numericValue.slice(8)}`;
        } else if (numericValue.length > 5) {
          formattedValue = `${numericValue.slice(0, 2)}.${numericValue.slice(2, 5)}.${numericValue.slice(5)}`;
        } else if (numericValue.length > 2) {
          formattedValue = `${numericValue.slice(0, 2)}.${numericValue.slice(2)}`;
        }
        return formattedValue;
      }
    }
    return value;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value);
    setDocumentNumber(formatted);
  };

  const features = useMemo(
    () => [
      {
        title: 'Velocidade',
        desc: 'Respostas rápidas e estáveis para seu fluxo de trabalho.',
        Icon: Zap
      },
      {
        title: 'Segurança',
        desc: 'Consultas com camadas extras de proteção e controle.',
        Icon: ShieldCheck
      },
      {
        title: 'Qualidade',
        desc: 'Retorno consistente para tomada de decisão.',
        Icon: Sparkles
      }
    ],
    []
  );

  return (
    <section className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{ backgroundImage: spotlight }}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          mx.set(e.clientX - rect.left);
          my.set(e.clientY - rect.top);
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Mockup + Consulta */}
          <div className="lg:col-span-12 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative w-full max-w-2xl"
            >
              {/* “Janela” do mockup */}
              <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-md shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/40">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                  <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                  <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                  <span className="ml-2 text-xs text-muted-foreground">Consulta rápida</span>
                </div>

                <div className="p-5">
                  <div className="rounded-xl border border-border bg-background/60 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="rounded-md border border-border bg-background p-2">
                        <Search className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">Consultar agora</div>
                        <div className="text-xs text-muted-foreground">CPF ou CNPJ</div>
                      </div>
                    </div>

                    <Tabs defaultValue="cpf" onValueChange={setDocumentType}>
                      <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-muted/60 rounded-lg">
                        <TabsTrigger value="cpf" className="text-xs h-7 rounded-md">
                          CPF
                        </TabsTrigger>
                        <TabsTrigger value="cnpj" className="text-xs h-7 rounded-md">
                          CNPJ
                        </TabsTrigger>
                      </TabsList>

                      <form onSubmit={handleSearch} className="mt-4 space-y-3">
                        <TabsContent value="cpf" className="mt-0">
                          <div className="relative">
                            <Input
                              id="cpf"
                              type="text"
                              placeholder="000.000.000-00"
                              value={documentNumber}
                              onChange={handleInputChange}
                              maxLength={14}
                              className="pr-10 h-11"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          </div>
                        </TabsContent>

                        <TabsContent value="cnpj" className="mt-0">
                          <div className="relative">
                            <Input
                              id="cnpj"
                              type="text"
                              placeholder="00.000.000/0000-00"
                              value={documentNumber}
                              onChange={handleInputChange}
                              maxLength={18}
                              className="pr-10 h-11"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          </div>
                        </TabsContent>

                        <LiquidGlassButton variant="primary" onClick={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)} className="w-full h-11">
                          <Search className="h-4 w-4 mr-2" />
                          Consultar
                        </LiquidGlassButton>
                      </form>
                    </Tabs>

                    <p className="mt-4 text-[11px] text-muted-foreground text-center">
                      Dados obtidos de fontes oficiais • Consulta de demonstração
                    </p>
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div
                className="pointer-events-none absolute -inset-6 -z-10 blur-2xl opacity-40"
                style={{ background: 'radial-gradient(600px circle at 30% 30%, hsl(var(--primary) / 0.12), transparent 60%)' }}
                aria-hidden="true"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
