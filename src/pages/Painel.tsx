import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@clerk/clerk-react';
// Removed Users, Sparkles, BadgeCheck, Timer icons as they are no longer used for cards
import Seo from '@/components/Seo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { hasClerkAuth } from '@/utils/clerk';
import { useUserCompany } from '@/hooks/use-user-company';
import ProductList from '@/components/products/ProductList'; // Import ProductList

// Main content component
interface PainelContentProps {
  clerkUser: { firstName?: string | null } | null;
}

const PainelContent: React.FC<PainelContentProps> = ({ clerkUser }) => {
  const { t, i18n } = useTranslation('painel');
  const { data: userCompanyData, isLoading: isUserCompanyLoading, isError: isUserCompanyError } = useUserCompany();

  // Use first_name from Supabase profile if available, otherwise Clerk's, then fallback to 'Guest'
  const userName = userCompanyData?.profile?.first_name || clerkUser?.firstName || t('guest', { defaultValue: 'Usuário' });
  const companyName = userCompanyData?.company?.name || '';

  const pageTitle = t('title');
  const pageDescription = t('demoNotice');

  const isLoading = isUserCompanyLoading;
  const isError = isUserCompanyError;

  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        ogTitle={pageTitle}
        ogDescription={pageDescription}
        locale={i18n.language}
      />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2 text-boteco-primary">
          {t('greeting', { userName })}
        </h1>
        {companyName && (
          <p className="text-2xl font-semibold text-boteco-neutral/90 mb-4">
            {companyName}
          </p>
        )}
        <p className="text-xl text-boteco-neutral/90 mb-4">{t('title')}</p>
        <p className="text-sm text-boteco-neutral/80 mb-8 italic">{t('demoNotice')}</p>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} depth="overlay">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>{t('errors.title')}</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{t('errors.userCompanyLoad')}</span>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                {t('actions.retry')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Product Management Section */}
        {companyName && <ProductList />}
      </div>
    </>
  );
};

// Main exported component that conditionally renders based on auth
const Painel: React.FC = () => {
  return hasClerkAuth ? <PainelContent clerkUser={useUser().user} /> : <PainelContent clerkUser={null} />;
};

export default Painel;