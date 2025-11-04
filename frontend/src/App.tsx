import "./App.css"; // Vamos remover o CSS antigo daqui
import Header from "./components/Header";
import Footer from "./components/Footer"; // Importamos o Footer
import { Route, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";

import HomePage from "./pages/Home";
import PowerBIDashboard from "./pages/Index";
import SQLPage from "./pages/Relatorios";
import AnalisePage from "./pages/Analise";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          <div className="container mx-auto max-w-7xl py-6 md:py-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/powerbi" element={<PowerBIDashboard />} />
              <Route path="/sql" element={<SQLPage />} />
              <Route path="/analise" element={<AnalisePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;