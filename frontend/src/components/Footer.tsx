import { Link } from "react-router-dom";
import { Plane, Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* 1. Marca "Viajante" */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* O ícone com fundo Amarelo (accent) e ícone Azul (primary) */}
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold">Viajante</span>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Plataforma de Business Intelligence para análise de performance.
            </p>
            {/* Links Sociais com o tema CVC */}
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-primary hover:brightness-95 transition-smooth">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-primary hover:brightness-95 transition-smooth">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-primary hover:brightness-95 transition-smooth">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-primary hover:brightness-95 transition-smooth">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 2. Links Rápidos (Corrigido) */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm opacity-90 hover:text-accent transition-smooth">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/powerbi" className="text-sm opacity-90 hover:text-accent transition-smooth">
                  Dashboard Interativo
                </Link>
              </li>
              <li>
                <Link to="/sql" className="text-sm opacity-90 hover:text-accent transition-smooth">
                  Relatório SQL
                </Link>
              </li>
              <li>
                <Link to="/analise" className="text-sm opacity-90 hover:text-accent transition-smooth">
                  Interpretação Analítica
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Informações (Mantido) */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Informações</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>Sobre Nós</li>
              <li>Como Funciona</li>
              <li>Termos de Uso</li>
              <li>Política de Privacidade</li>
              <li>FAQ</li>
            </ul>
          </div>

          {/* 4. Contato (Mantido) */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm opacity-90">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>contato@viajante.com.br</span>
              </li>
              <li className="flex items-start gap-2 text-sm opacity-90">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>(11) 4002-8922</span>
              </li>
              <li className="flex items-start gap-2 text-sm opacity-90">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-sm opacity-90">
            © {currentYear} Viajante. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;