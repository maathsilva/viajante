import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Plane,
  Home,
  Database,
  LayoutDashboard,
  FileText,
  UserCircle,
} from "lucide-react";

const navLinks = [
  { path: "/powerbi", name: "Dashboard", icon: LayoutDashboard },
  { path: "/sql", name: "Relatório SQL", icon: Database },
  { path: "/analise", name: "Analítica", icon: FileText },
];

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center">
        
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <Plane className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-primary">Viajante</span>
        </Link>

        <nav className="hidden items-center space-x-1 md:flex flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                pathname === link.path
                  ? "text-primary font-semibold bg-primary/10"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                  <Link to="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Plane className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg text-primary">Viajante</span>
                  </Link>
                  <Link
                      to="/"
                      className={cn(
                        "flex items-center gap-3 transition-colors hover:text-primary",
                        pathname === "/"
                          ? "text-primary font-semibold"
                          : "text-muted-foreground",
                      )}
                    >
                      <Home className="h-5 w-5" />
                      Home
                  </Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={cn(
                        "flex items-center gap-3 transition-colors hover:text-primary",
                        pathname === link.path
                          ? "text-primary font-semibold"
                          : "text-muted-foreground",
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <Button variant="ghost" size="icon">
            <UserCircle className="h-6 w-6 text-muted-foreground" />
            <span className="sr-only">Perfil do Usuário</span>
          </Button>
        </div>
        
      </div>
    </header>
  );
}