import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import howItWorks01 from "@/assets/howitworks-01.png";
import howItWorks02 from "@/assets/howitworks-02.png";
import howItWorks03 from "@/assets/howitworks-03.png";
import howItWorks04 from "@/assets/howitworks-04.png";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

type StepButton = {
  text: string;
  action: () => void;
  variant?: "default" | "outline";
};

type Step = {
  number: number;
  title: string;
  description: string;
  primaryButton: StepButton;
  secondaryButton?: StepButton;
};

type StepCardProps = {
  step: Step;
  index: number;
  imageSrc?: string;
};

const StepCard: React.FC<StepCardProps> = ({ step, index, imageSrc }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.35, delay: 0.04 * (index % 4) }}
      className="h-full"
    >
      <Card className="h-full bg-card/80 backdrop-blur-md border border-border/60 shadow-md hover:shadow-lg transition-all duration-300">
        <CardContent className="p-5 h-full flex flex-col">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold ring-1 ring-primary/15 flex-shrink-0">
              {step.number}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground leading-snug">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Imagem (tamanho fixo) - antes do botão */}
          <div className="mt-4 flex justify-center">
            <img
              src={imageSrc ?? howItWorks01}
              alt={step.title}
              loading="lazy"
              className="w-64 max-w-full h-auto rounded-lg border border-border/60"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
            <Button size="sm" className="w-full" onClick={step.primaryButton.action}>
              {step.primaryButton.text}
            </Button>

            {step.secondaryButton && (
              <Button
                size="sm"
                variant={step.secondaryButton.variant ?? "outline"}
                className="w-full"
                onClick={step.secondaryButton.action}
              >
                {step.secondaryButton.text}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ResponsiveHowItWorksSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados dos modais de autenticação
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  // Handle user login success
  useEffect(() => {
    if (user && pendingRedirect) {
      navigate(pendingRedirect);
      setPendingRedirect(null);
      setShowLoginModal(false);
      setShowRegisterModal(false);
    }
  }, [user, pendingRedirect, navigate]);

  const handleCreateAccount = () => navigate("/registration");
  const handleLogin = () => {
    setPendingRedirect(null);
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };
  const handleViewPlans = () => navigate("/planos-publicos");

  const handleAddBalance = () => {
    if (user) {
      navigate("/dashboard/adicionar-saldo");
    } else {
      setPendingRedirect("/dashboard/adicionar-saldo");
      setShowLoginModal(true);
    }
  };

  const handleAccessPanels = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      setPendingRedirect("/dashboard");
      setShowLoginModal(true);
    }
  };

  const handleAvailablePanels = () => {
    // Não existe rota pública específica; direcionamos para o dashboard.
    handleAccessPanels();
  };

  useEffect(() => {
    window.AOS?.refresh?.();
  }, []);

  const steps = useMemo<Step[]>(
    () => [
      {
        number: 1,
        title: "Crie sua conta",
        description: "Faça seu cadastro em menos de 1 minuto com e-mail e senha.",
        primaryButton: {
          text: "Criar conta",
          action: handleCreateAccount,
        },
        secondaryButton: {
          text: "Entrar",
          action: handleLogin,
          variant: "outline",
        },
      },
      {
        number: 2,
        title: "Escolha seu plano",
        description: "Selecione o plano ideal e comece a usar imediatamente.",
        primaryButton: {
          text: "Ver planos",
          action: handleViewPlans,
        },
      },
      {
        number: 3,
        title: "Pague ou recarregue",
        description: "Assine um plano ou recarregue saldo para economizar nas consultas.",
        primaryButton: {
          text: "Adicionar saldo",
          action: handleAddBalance,
        },
      },
      {
        number: 4,
        title: "Faça suas consultas",
        description: "Acesse informações completas em segundos, com segurança e clareza.",
        primaryButton: {
          text: "Acessar painéis",
          action: handleAccessPanels,
        },
        secondaryButton: {
          text: "Painéis disponíveis",
          action: handleAvailablePanels,
          variant: "outline",
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  const stepImages = useMemo(
    () => [howItWorks01, howItWorks02, howItWorks03, howItWorks04],
    []
  );

  return (
    <section className="py-8 sm:py-10 relative overflow-hidden">
      {/* Background gradiente sutil (mesma linguagem do Depoimentos) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />

      {/* Elementos decorativos */}
      <div className="absolute top-6 left-6 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-6 right-6 w-24 h-24 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-2xl" />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
              Como funciona
            </h2>
            <p className="text-sm text-muted-foreground">
              4 passos simples para começar
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs px-4"
            onClick={() => navigate("/registration")}
          >
            Começar agora
          </Button>
        </motion.div>

        {/* Grid organizado */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              index={index}
              imageSrc={stepImages[index] ?? howItWorks01}
            />
          ))}
        </div>
      </div>

      {/* Authentication Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setPendingRedirect(null);
        }}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false);
          setPendingRedirect(null);
        }}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </section>
  );
};

export default ResponsiveHowItWorksSection;
