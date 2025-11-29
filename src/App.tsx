import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate as Redirect } from "react-router-dom";
import { lazy, Suspense } from "react";
import LocaleWrapper from "./components/LocaleWrapper";
import ScrollToTop from "./components/ScrollToTop";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { hasClerkAuth } from "./utils/clerk";
import AuthRedirector from "./components/AuthRedirector"; // NEW

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
const Realtime = lazy(() => import("./pages/Realtime"));
const GestaoEstoque = lazy(() => import("./pages/GestaoEstoque"));
const Integracoes = lazy(() => import("./pages/Integracoes"));
const CompanyRegistration = lazy(() => import("./pages/CompanyRegistration")); // NEW

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
    <Sonner />
    <BrowserRouter>
      <ScrollToTop />
      <AuthRedirector> {/* Wrap routes with AuthRedirector */}
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
              <Route path="realtime" element={<Realtime />} />
              <Route path="gestao-estoque" element={<GestaoEstoque />} />
              <Route path="integracoes" element={<Integracoes />} />
              <Route path="legal/privacidade" element={<PrivacyPolicy />} />
              <Route path="legal/termos" element={<TermsOfService />} />
            </Route>

            {/* Company Registration route - accessible only if signed in and no company */}
            <Route
              path="/company-registration"
              element={
                hasClerkAuth ? (
                  <>
                    <SignedIn>
                      <CompanyRegistration />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                ) : (
                  <CompanyRegistration /> // If Clerk not enabled, allow access (for dev/testing)
                )
              }
            />

            {/* Protected Painel route */}
            <Route
              path="/painel"
              element={
                hasClerkAuth ? (
                  <>
                    <SignedIn>
                      <Painel />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                ) : (
                  <Painel /> // If Clerk not enabled, allow access (for dev/testing)
                )
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthRedirector>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;