import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate as Redirect } from "react-router-dom";
import { lazy, Suspense } from "react";
import LocaleWrapper from "./components/LocaleWrapper";
import ScrollToTop from "./components/ScrollToTop";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { hasClerkAuth } from "./utils/clerk";

// Lazy load page components for better code splitting
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const Painel = lazy(() => import("./pages/Painel"));
const MenuDigital = lazy(() => import("./pages/MenuDigital"));
const Fornecedores = lazy(() => import("./pages/Fornecedores"));
const Fidelidade = lazy(() => import("./pages/Fidelidade"));
const Eventos = lazy(() => import("./pages/Eventos"));
const Integracoes = lazy(() => import("./pages/Integracoes"));
const TablesFloor = lazy(() => import("./pages/admin/TablesFloor"));
const AdminLayout = lazy(() => import("./components/AdminLayout").then(m => ({ default: m.AdminLayout })));

// Simple loading fallback
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-boteco-primary border-r-transparent"></div>
      <p className="mt-2 text-sm text-boteco-neutral/80">Carregando...</p>
    </div>
  </div>
);

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
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

          {/* Protected Painel route with AdminLayout */}
          <Route
            path="/painel"
            element={
              hasClerkAuth ? (
                <>
                  <SignedIn>
                    <AdminLayout />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              ) : (
                <AdminLayout />
              )
            }
          >
            <Route index element={<Painel />} />
            <Route path="mesas/salao" element={<TablesFloor />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;