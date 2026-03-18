import React from "react";
import { Link } from "react-router-dom";
import { Package, Mail, Send, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const glassStyle: React.CSSProperties = {
  backdropFilter: "blur(20px) saturate(1.4)",
  WebkitBackdropFilter: "blur(20px) saturate(1.4)",
};

const ProfessionalFooter = () => {
  const year = new Date().getFullYear();

  const columns = [
    {
      title: "Produto",
      links: [
        { label: "Planos", to: "/planos-publicos" },
        { label: "API", to: "/api" },
        { label: "Documentação", to: "/docs" },
        { label: "Módulos", to: "/docs" },
      ],
    },
    {
      title: "Empresa",
      links: [
        { label: "Sobre", to: "/about" },
        { label: "Contato", to: "/dashboard/suporte" },
        { label: "Status", to: "#", external: true },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Termos de Uso", to: "/terms" },
        { label: "Privacidade", to: "/privacy" },
        { label: "LGPD", to: "/lgpd" },
      ],
    },
  ];

  const socials = [
    {
      label: "TikTok",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.059 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      label: "Telegram",
      icon: <Send className="w-4 h-4" />,
    },
  ];

  return (
    <footer className="relative bg-transparent overflow-hidden py-12 sm:py-16">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full blur-[120px] opacity-20 bg-primary"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full blur-[140px] opacity-15 bg-secondary"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full blur-[100px] opacity-10 bg-accent"
        />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main glass container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/15 bg-white/5 dark:bg-white/[0.03] p-6 sm:p-10 lg:p-12"
          style={glassStyle}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6">
            {/* Brand glass card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/5 dark:bg-white/[0.02] p-5 sm:p-6 space-y-4"
              style={glassStyle}
            >
              <Link to="/" className="inline-flex items-center gap-2.5 group">
                <Package className="h-7 w-7 text-primary transition-transform group-hover:rotate-[-8deg] duration-300" />
                <span className="text-xl font-bold tracking-tight text-foreground">
                  API<span className="text-primary">Painel</span>
                </span>
              </Link>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Consultas empresariais seguras, rápidas e confiáveis.
                Integre nossas APIs em minutos e escale sem limites.
              </p>

              <Link
                to="/registration"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
              >
                Comece agora gratuitamente
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              <a
                href="mailto:contato@apipainel.com.br"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                contato@apipainel.com.br
              </a>
            </motion.div>

            {/* Link columns in glass cards */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {columns.map((col, idx) => (
                <motion.div
                  key={col.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + idx * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-white/5 dark:bg-white/[0.02] p-5"
                  style={glassStyle}
                >
                  <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                    {col.title}
                  </h4>
                  <nav className="flex flex-col gap-2.5">
                    {col.links.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200 w-fit"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom bar - glass */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-white/[0.02] px-6 py-4 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between"
          style={glassStyle}
        >
          <p className="text-xs text-muted-foreground">
            © {year} APIPainel · Todos os direitos reservados
          </p>

          <div className="flex items-center gap-1">
            {socials.map((social) => (
              <a
                key={social.label}
                href="#"
                className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-200"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;
