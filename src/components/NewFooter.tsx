import React from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";

const NewFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/60 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="text-lg font-bold text-foreground">API Painel</div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Plataforma completa para consultas e ferramentas empresariais.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Legal</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Termos de Uso</Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacidade</Link>
              <Link to="/lgpd" className="text-muted-foreground hover:text-foreground transition-colors">LGPD</Link>
              <Link to="/dashboard/suporte" className="text-muted-foreground hover:text-foreground transition-colors">Contato</Link>
            </nav>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Plataforma</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/planos-publicos" className="text-muted-foreground hover:text-foreground transition-colors">Planos</Link>
              <Link to="/api" className="text-muted-foreground hover:text-foreground transition-colors">API</Link>
              <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Documentação</Link>
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            </nav>
          </div>

          {/* Redes sociais */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Redes Sociais</h4>
            <div className="flex gap-3">
              <a href="#" className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors" aria-label="TikTok">
                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.059 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors" aria-label="Telegram">
                <Send className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {year} API Painel. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
