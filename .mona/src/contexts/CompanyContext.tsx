/**
 * Company Context
 * 
 * Provides company selection and multi-tenancy support for BotecoPro.
 * All data queries are automatically filtered by the selected company.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Database } from '../types/database';

type Company = Database['public']['Tables']['companies']['Row'];

interface CompanyContextType {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  companies: Company[];
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const STORAGE_KEY = 'boteco:selectedCompany';

interface CompanyProviderProps {
  children: ReactNode;
}

/**
 * Company Provider
 * 
 * Manages the selected company state and persists it to localStorage.
 * In a real application, this would also fetch the user's companies from Supabase.
 */
export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [selectedCompany, setSelectedCompanyState] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load selected company from localStorage on mount
  useEffect(() => {
    const loadSelectedCompany = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const company = JSON.parse(stored) as Company;
          setSelectedCompanyState(company);
        }
      } catch (error) {
        console.error('Failed to load selected company from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelectedCompany();
  }, []);

  // TODO: In a real app, fetch user's companies from Supabase
  // This would use the authenticated user's ID to query the company_users table
  useEffect(() => {
    const fetchCompanies = async () => {
      // Placeholder: In production, this would be:
      // const { data } = await supabase
      //   .from('company_users')
      //   .select('companies(*)')
      //   .eq('user_id', user.id);
      // setCompanies(data.map(cu => cu.companies));
      
      // For now, we'll use mock data or the selectedCompany if available
      if (selectedCompany) {
        setCompanies([selectedCompany]);
      }
    };

    fetchCompanies();
  }, [selectedCompany]);

  // Custom setter that also updates localStorage
  const setSelectedCompany = (company: Company | null) => {
    setSelectedCompanyState(company);

    if (company) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(company));
      } catch (error) {
        console.error('Failed to save selected company to localStorage:', error);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value: CompanyContextType = {
    selectedCompany,
    setSelectedCompany,
    companies,
    isLoading,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

/**
 * useCompany Hook
 * 
 * Access the company context from any component.
 * 
 * @returns Company context with selectedCompany and setter
 * @throws Error if used outside CompanyProvider
 * 
 * @example
 * ```typescript
 * const { selectedCompany, setSelectedCompany } = useCompany();
 * 
 * if (!selectedCompany) {
 *   return <CompanySelector />;
 * }
 * 
 * const products = await getProducts(selectedCompany.id);
 * ```
 */
export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);

  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }

  return context;
};

/**
 * withCompany HOC
 * 
 * Higher-order component that ensures a company is selected.
 * Redirects to company selector if no company is selected.
 * 
 * @example
 * ```typescript
 * export default withCompany(Dashboard);
 * ```
 */
export function withCompany<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WithCompanyComponent(props: P) {
    const { selectedCompany, isLoading } = useCompany();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-boteco-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      );
    }

    if (!selectedCompany) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Nenhuma empresa selecionada</h2>
            <p className="text-muted-foreground">
              Por favor, selecione uma empresa para continuar.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
