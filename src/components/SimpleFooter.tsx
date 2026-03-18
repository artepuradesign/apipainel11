import React from "react";
import { Link } from "react-router-dom";

const SimpleFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/60 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="text-base font-semibold text-foreground">APIPainel</div>
            <p className="text-sm text-muted-foreground max-w-md">
              Consultas seguras e eficientes para sua operação.
            </p>
          </div>

          <nav aria-label="Links do rodapé" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link className="text-muted-foreground hover:text-foreground transition-colors" to="/about">
              Sobre
            </Link>
            <Link className="text-muted-foreground hover:text-foreground transition-colors" to="/terms">
              Termos
            </Link>
            <Link className="text-muted-foreground hover:text-foreground transition-colors" to="/login">
              Login
            </Link>
            <Link className="text-muted-foreground hover:text-foreground transition-colors" to="/registration">
              Cadastro
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <span>© {year} APIPainel. Todos os direitos reservados.</span>
          <span className="hidden sm:inline">Feito para performance e simplicidade.</span>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
