import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, CheckCircle, AlertTriangle, ChevronRight } from "lucide-react";

// Os dados agora incluem ícones e cores para os cards
const resumoAnalitico = [
  {
    title: "1. Principais Descobertas",
    icon: TrendingUp,
    color: "text-primary",
    points: [
      "Forte Domínio do Canal Online: O canal 'Online' (incluindo 'On-Line' e 'online') é o principal motor de receita e volume de reservas.",
      "Receita Distribuída: A receita total é bem segmentada entre 'Pessoa Física', 'Corporativo' e 'Parceiro', sem uma dependência excessiva de um único segmento.",
      "Rentabilidade Oculta: Os destinos com maior volume de reservas não são necessariamente os mais lucrativos. A análise de margem média revela destinos de nicho com maior rentabilidade por reserva.",
      "Concentração Semestral: O conjunto de dados está 100% concentrado no primeiro semestre (H1) de 2024. Não há nenhuma reserva registrada no segundo semestre (H2).",
    ],
  },
  {
    title: "2. Recomendações Estratégicas",
    icon: CheckCircle,
    color: "text-green-600",
    points: [
      "Otimizar o Canal Online: Focar na experiência do usuário e em marketing digital para capturar a demanda já existente.",
      "Focar na Margem (Não no Volume): Criar campanhas de incentivo direcionadas aos destinos com maior margem média.",
      "Segmentar a Fidelização: Usar o indicador de fidelidade para criar ações de retenção personalizadas e reativar clientes de alto valor com baixa receita recente.",
      "Análise de Sazonalidade (Urgente): Investigar imediatamente a ausência de dados de reserva no H2. Se for o comportamento real do negócio, a agência precisa de um plano de contingência agressivo.",
    ],
  },
  {
    title: "3. Riscos e Oportunidades",
    icon: AlertTriangle,
    color: "text-destructive",
    points: [
      "Risco (Integridade de Dados): Foram encontrados dados nulos ('receita'), inconsistentes ('Online' vs 'online') e datas corrompidas ('??/??'). A padronização no backend (ETL) é crucial.",
      "Risco (Sazonalidade Extrema): A ausência total de reservas no H2 é um ponto cego alarmante e um risco financeiro elevado.",
      "Oportunidade (Cross-sell): Os dados de UF e Continente permitem identificar oportunidades de cross-selling (ex: ofertar 'Europa' para clientes de 'MG' que compram 'América do Norte').",
    ],
  },
];

export default function AnalisePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Interpretação Analítica</h1>
      <p className="text-lg text-muted-foreground">
        Resumo com as principais conclusões, recomendações estratégicas e riscos observados.
      </p>

      {resumoAnalitico.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className={cn("text-2xl flex items-center gap-3", section.color)}>
              <section.icon className="h-6 w-6" />
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {section.points.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <ChevronRight className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                  <span className="text-base text-foreground/90">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}