import React, { useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import MenuSuperior from "@/components/MenuSuperior";
import SimpleFooter from "@/components/SimpleFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DashboardTitleCard from "@/components/dashboard/DashboardTitleCard";
import { Gift } from "lucide-react";

const IndicacoesPublicas = () => {
  useEffect(() => {
    const title = "Indicações | Como funciona";
    const description =
      "Entenda como funciona o sistema de indicação: cadastro com código, processamento do bônus e quando o crédito é liberado.";

    document.title = title;

    const ensureTag = (tagName: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector(
        `${tagName}${attrs.name ? `[name=\"${attrs.name}\"]` : ""}${attrs.rel ? `[rel=\"${attrs.rel}\"]` : ""}`
      ) as HTMLMetaElement | HTMLLinkElement | null;
      if (!el) {
        el = document.createElement(tagName) as HTMLMetaElement | HTMLLinkElement;
        document.head.appendChild(el);
      }
      Object.entries(attrs).forEach(([k, v]) => ((el as any)[k] = v));
    };

    ensureTag("meta", { name: "description", content: description });
    ensureTag("link", { rel: "canonical", href: `${window.location.origin}/indicacoes` });
  }, []);

  return (
    <PageLayout variant="auth" backgroundOpacity="strong" showGradients={false} className="flex flex-col">
      <MenuSuperior />

      <main className="w-full flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pt-4 pb-8 sm:pt-6 sm:pb-10">
          <div className="mb-4">
            <DashboardTitleCard
              title="Indicações"
              icon={<Gift className="h-4 w-4 sm:h-5 sm:w-5" />}
              backTo="/"
            />
          </div>

          <div className="grid gap-4">
            <Card className="bg-background border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Visão geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  O sistema de indicação permite que você compartilhe um <b className="text-foreground">código único</b>.
                  Quando alguém se cadastra usando esse código, a indicação é registrada.
                </p>
                <p>
                  Depois, no <b className="text-foreground">primeiro login</b> do usuário indicado, o bônus é processado e
                  creditado automaticamente.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Como funciona (passo a passo)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">1</Badge>
                    <p className="text-sm font-medium text-foreground">Cadastro com código</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    O usuário se cadastra com um link contendo o parâmetro <code className="px-1 py-0.5 rounded bg-muted">ref</code>.
                  </p>
                  <div className="text-xs rounded-md border border-border bg-muted p-3 font-mono break-all">
                    /registration?ref=SEU_CODIGO
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">2</Badge>
                    <p className="text-sm font-medium text-foreground">Registro da indicação</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    O sistema vincula o indicador ao indicado e marca a indicação como pendente até o primeiro login.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">3</Badge>
                    <p className="text-sm font-medium text-foreground">Bônus no primeiro login</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Quando o indicado faz o primeiro login, o bônus é processado e creditado automaticamente.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Onde acompanhar</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Após entrar na sua conta, você pode acompanhar suas indicações e estatísticas no menu do painel em
                  <b className="text-foreground"> Indicações</b>.
                </p>
                <p>
                  Lá você verá status (pendente/ativo), datas e o histórico dos bônus processados.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SimpleFooter />
    </PageLayout>
  );
};

export default IndicacoesPublicas;
