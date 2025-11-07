import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./i18n"; // Importar a configuração do i18n
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { ClerkProvider } from "@clerk/clerk-react";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Obtenha a chave pública do Clerk do ambiente
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Configure QueryClient with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus in development
      refetchOnWindowFocus: !import.meta.env.DEV,
    },
  },
});

const wrapWithProviders = (node: ReactNode) => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <HelmetProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          {node}
        </ThemeProvider>
      </HelmetProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
const appTree = wrapWithProviders(<App />);

if (PUBLISHABLE_KEY) {
  root.render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {appTree}
    </ClerkProvider>,
  );
} else {
  console.warn(
    "Missing Publishable Key from Clerk. Rendering without authentication.",
  );
  root.render(appTree);
}
