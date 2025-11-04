import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  FileText
} from "lucide-react";

const links = [
  {
    path: "/powerbi",
    name: "Power BI (Dashboard)",
    icon: LayoutDashboard,
  },
  {
    path: "/sql",
    name: "SQL (Relatórios)",
    icon: Database,
  },
  {
    path: "/analise",
    name: "Interpretação Analítica",
    icon: FileText,
  },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="h-screen w-16 border-r bg-background flex flex-col items-center py-4">
      <nav className="flex flex-col gap-2">
        <TooltipProvider>
          {links.map((link) => (
            <Tooltip key={link.path}>
              <TooltipTrigger>
                <Button
                  size="icon"
                  variant={pathname.startsWith(link.path) ? "default" : "ghost"}
                  className={cn(
                    pathname.startsWith(link.path) &&
                      "text-white dark:text-black",
                  )}
                  asChild
                >
                  <Link to={link.path}>
                    <link.icon className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-primary text-primary-foreground"
              >
                {link.name}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
}