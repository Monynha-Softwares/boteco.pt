import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate as Redirect } from "react-router-dom"; // Renomear Navigate para Redirect
import LocaleWrapper from "./components/LocaleWrapper";
import Home from "./pages/Home"; // Renamed from Index
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import Painel from "./pages/Painel";
import BlogPost from "./pages/BlogPost";
import MenuDigital from "./pages/MenuDigital";
import Fornecedores from "./pages/Fornecedores";
import Fidelidade from "./pages/Fidelidade";
import Eventos from "./pages/Eventos";
import Integracoes from "./pages/Integracoes";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to default locale (pt) */}
          <Route path="/" element={<Redirect to="/pt" />} />

          <Route path="/:locale" element={<LocaleWrapper />}>
            <Route index element={<Home />} />
            <Route path="sobre" element={<About />} />
            <Route path="contato" element={<Contact />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="menu-digital" element={<MenuDigital />} />
            <Route path="fornecedores" element={<Fornecedores />} />
            <Route path="fidelidade" element={<Fidelidade />} />
            <Route path="eventos" element={<Eventos />} />
            <Route path="integracoes" element={<Integracoes />} />
            <Route path="legal/privacidade" element={<PrivacyPolicy />} />
            <Route path="legal/termos" element={<TermsOfService />} />
          </Route>

          {/* Protected Painel route */}
          <Route path="/painel" element={
            <>
              <SignedIn>
                <Painel />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;