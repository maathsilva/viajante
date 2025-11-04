import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Database, LayoutDashboard, FileText, ArrowRight } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="w-full bg-primary text-primary-foreground py-16 md:py-24 rounded-lg">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Bem-vindo ao Painel Viajante
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mt-4 max-w-3xl mx-auto">
            Seu centro de Business Intelligence para análise de performance.
            Comece selecionando um dos módulos abaixo.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-0 md:px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-primary">
          O que você quer analisar hoje?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardButton
            title="Dashboard Interativo"
            description="KPIs, filtros e gráficos (Receita, Margem, Sazonalidade)."
            icon={LayoutDashboard}
            onClick={() => navigate("/powerbi")}
          />
          <CardButton
            title="Relatório SQL"
            description="Upload da base e download do relatório SQL com as 5 perguntas."
            icon={Database}
            onClick={() => navigate("/sql")}
          />
          <CardButton
            title="Interpretação Analítica"
            description="Recomendações estratégicas e riscos observados."
            icon={FileText}
            onClick={() => navigate("/analise")}
          />
        </div>
      </section>
    </div>
  );
}

interface CardButtonProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}

function CardButton({ title, description, icon: Icon, onClick }: CardButtonProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all duration-300 ease-in-out group hover:shadow-xl hover:border-primary/50"
    >
      <CardHeader className="pb-4">
        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base text-muted-foreground mb-6">
          {description}
        </CardDescription>
        <div className="flex items-center font-semibold text-primary transition-transform group-hover:translate-x-1">
          Acessar Módulo
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}