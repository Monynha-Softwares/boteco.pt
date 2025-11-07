import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@clerk/clerk-react';
import { Users, Sparkles, BadgeCheck, Timer, DollarSign, ShoppingBasket, PackageOpen } from 'lucide-react';
import Seo from '@/components/Seo';
import { useQuery } from '@tanstack/react-query';
import {
  CONTACT_REQUESTS_QUERY_KEY,
  calculateContactRequestMetrics,
  getContactRequests,
} from '@/lib/storage/contactRequests';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { hasClerkAuth } from '@/utils/clerk';
import { useCompany } from '@/contexts/CompanyContext';
import { getTodaysSalesTotal, getPeriodSalesTotal, getSalesByPaymentMethod, getRecentDailySales } from '@/lib/api/sales';
import { getActiveOrders } from '@/lib/api/orders';
import { getLowStockProducts } from '@/lib/api/products';
import { getTableOccupancyMetrics } from '@/lib/api/tables';
import CompanySelector from '@/components/CompanySelector';
import { supabase } from '@/lib/supabase';

const cardIcons: Record<string, React.ReactNode> = {
  totalLeads: <Users className="h-8 w-8 text-boteco-secondary" />,
  leadsThisWeek: <Sparkles className="h-8 w-8 text-boteco-secondary" />,
  qualifiedLeads: <BadgeCheck className="h-8 w-8 text-boteco-secondary" />,
  responseRate24h: <Timer className="h-8 w-8 text-boteco-secondary" />,
};

// Internal component that uses Clerk hooks
const PainelWithAuth: React.FC = () => {
  const { user } = useUser();
  return <PainelContent user={user} />;
};

// Internal component without auth
const PainelWithoutAuth: React.FC = () => {
  return <PainelContent user={null} />;
};

// Main content component
interface PainelContentProps {
  user: { firstName?: string | null } | null;
}

const PainelContent: React.FC<PainelContentProps> = ({ user }) => {
  const { t, i18n } = useTranslation('painel');
  const { selectedCompany } = useCompany();

  const query = useQuery({
    queryKey: CONTACT_REQUESTS_QUERY_KEY,
    queryFn: getContactRequests,
    staleTime: 60 * 1000,
  });

  // Dashboard metrics (Supabase-backed)
  const companyId = selectedCompany?.id;

  const todaySalesQuery = useQuery({
    queryKey: ['dashboard', 'todaySales', companyId],
    queryFn: () => getTodaysSalesTotal(companyId!),
    enabled: !!companyId,
    staleTime: 30 * 1000,
  });

  const weekSalesQuery = useQuery({
    queryKey: ['dashboard', 'weekSales', companyId],
    queryFn: () => getPeriodSalesTotal(companyId!, 7),
    enabled: !!companyId,
    staleTime: 60 * 1000,
  });

  const monthSalesQuery = useQuery({
    queryKey: ['dashboard', 'monthSales', companyId],
    queryFn: () => getPeriodSalesTotal(companyId!, 30),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });

  const paymentMethodQuery = useQuery({
    queryKey: ['dashboard', 'paymentMethods', companyId],
    queryFn: () => getSalesByPaymentMethod(companyId!, undefined, undefined),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });

  const dailySalesQuery = useQuery({
    queryKey: ['dashboard', 'dailySales', companyId],
    queryFn: () => getRecentDailySales(companyId!, 7),
    enabled: !!companyId,
    staleTime: 60 * 1000,
  });

  const activeOrdersQuery = useQuery({
    queryKey: ['dashboard', 'activeOrders', companyId],
    queryFn: async () => {
      const orders = await getActiveOrders(companyId!);
      return orders.length;
    },
    enabled: !!companyId,
    staleTime: 15 * 1000,
  });

  const lowStockQuery = useQuery({
    queryKey: ['dashboard', 'lowStock', companyId],
    queryFn: async () => {
      const lowStock = await getLowStockProducts(companyId!);
      return lowStock.length;
    },
    enabled: !!companyId,
    staleTime: 60 * 1000,
  });

  const tableOccupancyQuery = useQuery({
    queryKey: ['dashboard', 'tableOccupancy', companyId],
    queryFn: () => getTableOccupancyMetrics(companyId!),
    enabled: !!companyId,
    staleTime: 15 * 1000,
  });

  // Realtime subscriptions to keep queries fresh
  React.useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `company_id=eq.${companyId}` }, () => {
        activeOrdersQuery.refetch();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sales', filter: `company_id=eq.${companyId}` }, () => {
        todaySalesQuery.refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `company_id=eq.${companyId}` }, () => {
        lowStockQuery.refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // We only want to (re)subscribe when company changes

  }, [companyId, activeOrdersQuery.refetch, todaySalesQuery.refetch, lowStockQuery.refetch]);
  const metrics = React.useMemo(() => {
    if (!query.data) {
      return null;
    }

    return calculateContactRequestMetrics(query.data);
  }, [query.data]);

  const numberFormatter = React.useMemo(
    () => new Intl.NumberFormat(i18n.language),
    [i18n.language],
  );

  const percentageFormatter = React.useMemo(
    () => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 }),
    [i18n.language],
  );

  const cards = t('cards', { returnObjects: true }) as {
    id: string;
    title: string;
    description: string;
  }[];

  const opsCards = t('dashboard.cards', { returnObjects: true }) as {
    id: 'todayRevenue' | 'activeOrders' | 'lowStock' | 'weekRevenue' | 'monthRevenue' | 'tableOccupancy';
    title: string;
    description: string;
  }[];

  const cardValues = metrics
    ? {
        totalLeads: numberFormatter.format(metrics.totalLeads),
        leadsThisWeek: numberFormatter.format(metrics.leadsThisWeek),
        qualifiedLeads: numberFormatter.format(metrics.qualifiedLeads),
        responseRate24h: `${percentageFormatter.format(metrics.responseRate24h)}%`,
      }
    : {};

  const channelEntries = React.useMemo(() => {
    if (!metrics) {
      return [] as Array<[string, number]>;
    }

    return Object.entries(metrics.channelBreakdown).sort(([, a], [, b]) => b - a);
  }, [metrics]);

  const statusEntries = React.useMemo(() => {
    if (!metrics) {
      return [] as Array<[string, number]>;
    }

    return Object.entries(metrics.statusBreakdown);
  }, [metrics]);

  const formatAverageResponseTime = React.useCallback(
    (value: number | null) => {
      if (value === null) {
        return t('leadInsights.averageResponseTime.empty');
      }

      if (value < 1) {
        const minutes = Math.max(1, Math.round(value * 60));
        return t('leadInsights.averageResponseTime.lessThanHour', { minutes });
      }

      if (value >= 24) {
        const days = Math.round(value / 24);
        return t('leadInsights.averageResponseTime.inDays', { days });
      }

      return t('leadInsights.averageResponseTime.inHours', { hours: Math.round(value) });
    },
    [t],
  );

  const formatPercentageValue = React.useCallback(
    (value: number) => `${percentageFormatter.format(value)}%`,
    [percentageFormatter],
  );

  const userName = user?.firstName || t('guest', { defaultValue: 'Usuário' });
  const pageTitle = t('title');
  const pageDescription = t('demoNotice');

  if (!selectedCompany) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-boteco-primary">{t('noCompany.title', { defaultValue: 'Selecione uma empresa' })}</h1>
        <p className="text-boteco-neutral/80 max-w-prose">
          {t('noCompany.helper', { defaultValue: 'Para visualizar métricas e dados operacionais, escolha uma empresa abaixo.' })}
        </p>
        <CompanySelector />
      </div>
    );
  }

  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        ogTitle={pageTitle}
        ogDescription={pageDescription}
        locale={i18n.language}
      />
      <div className="space-y-6">
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card depth="surface">
            <CardHeader>
              <CardTitle className="text-lg text-boteco-neutral">
                {t('dashboard.charts.dailySalesTitle')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.charts.dailySalesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dailySalesQuery.isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : dailySalesQuery.data && dailySalesQuery.data.length > 0 ? (
                <div className="h-64">
                  {/* Simple SVG-based sparkline fallback to avoid heavy Recharts code here */}
                  <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                    {(() => {
                      const vals = dailySalesQuery.data.map(d => d.total);
                      const max = Math.max(...vals, 1);
                      const points = dailySalesQuery.data.map((d, idx) => {
                        const x = (idx / Math.max(dailySalesQuery.data!.length - 1, 1)) * 100;
                        const y = 40 - (d.total / max) * 36 - 2;
                        return `${x},${y}`;
                      }).join(' ');
                      return (
                        <>
                          <polyline fill="none" stroke="hsl(var(--boteco-secondary))" strokeWidth="1.5" points={points} />
                          {dailySalesQuery.data.map((d, idx) => {
                            const x = (idx / Math.max(dailySalesQuery.data!.length - 1, 1)) * 100;
                            const y = 40 - (d.total / max) * 36 - 2;
                            return <circle key={idx} cx={x} cy={y} r={0.8} fill="hsl(var(--boteco-secondary))" />;
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              ) : (
                <p className="text-sm text-boteco-neutral/60">{t('dashboard.charts.empty')}</p>
              )}
            </CardContent>
          </Card>

          <Card depth="surface">
            <CardHeader>
              <CardTitle className="text-lg text-boteco-neutral">
                {t('dashboard.charts.paymentMethodsTitle')}
              </CardTitle>
              <CardDescription>
                {i18n.language === 'pt' ? 'Distribuição por método' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethodQuery.isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : paymentMethodQuery.data && Object.keys(paymentMethodQuery.data).length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(paymentMethodQuery.data).map(([method, total]) => (
                    <div key={method} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-sm bg-boteco-secondary" />
                      <div className="flex-1 text-sm text-boteco-neutral/80 capitalize">{method.replace(/_/g, ' ')}</div>
                      <div className="font-mono text-sm text-boteco-neutral">
                        {new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(total)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-boteco-neutral/60">{t('dashboard.charts.empty')}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Operational metrics (Supabase) */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-boteco-primary">
            {t('dashboard.opsTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opsCards.map((card) => {
              const isLoading = (() => {
                switch (card.id) {
                  case 'todayRevenue':
                    return todaySalesQuery.isLoading;
                  case 'activeOrders':
                    return activeOrdersQuery.isLoading;
                  case 'lowStock':
                    return lowStockQuery.isLoading;
                  case 'weekRevenue':
                    return weekSalesQuery.isLoading;
                  case 'monthRevenue':
                    return monthSalesQuery.isLoading;
                  case 'tableOccupancy':
                    return tableOccupancyQuery.isLoading;
                  default:
                    return false;
                }
              })();

              const rawValue = (() => {
                switch (card.id) {
                  case 'todayRevenue':
                    return todaySalesQuery.data ?? 0;
                  case 'activeOrders':
                    return activeOrdersQuery.data ?? 0;
                  case 'lowStock':
                    return lowStockQuery.data ?? 0;
                  case 'weekRevenue':
                    return weekSalesQuery.data ?? 0;
                  case 'monthRevenue':
                    return monthSalesQuery.data ?? 0;
                  case 'tableOccupancy':
                    return tableOccupancyQuery.data?.occupancyRate ?? 0;
                  default:
                    return 0;
                }
              })();

              const isCurrency = ['todayRevenue', 'weekRevenue', 'monthRevenue'].includes(card.id);
              const isPercentage = card.id === 'tableOccupancy';
              const displayValue = isCurrency
                ? new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(rawValue)
                : isPercentage
                  ? percentageFormatter.format(rawValue)
                  : numberFormatter.format(rawValue);

              const icon =
                card.id === 'todayRevenue' ? (
                  <DollarSign className="h-8 w-8 text-boteco-secondary" />
                ) : card.id === 'activeOrders' ? (
                  <ShoppingBasket className="h-8 w-8 text-boteco-secondary" />
                ) : card.id === 'tableOccupancy' ? (
                  <Timer className="h-8 w-8 text-boteco-secondary" />
                ) : (
                  <PackageOpen className="h-8 w-8 text-boteco-secondary" />
                );

              return (
                <Card
                  key={card.id}
                  depth="overlay"
                  className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium text-boteco-neutral">
                      {card.title}
                    </CardTitle>
                    {icon}
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <>
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-boteco-primary">
                          {displayValue}
                        </div>
                        {card.id === 'tableOccupancy' && tableOccupancyQuery.data ? (
                          <p className="text-xs text-boteco-neutral/80">
                            {tableOccupancyQuery.data.occupied} / {tableOccupancyQuery.data.total}
                          </p>
                        ) : (
                          <p className="text-xs text-boteco-neutral/80">{card.description}</p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-boteco-primary">
            {t('greeting', { userName })}
          </h1>
          <p className="text-lg text-boteco-neutral/90 mt-1">{t('title')}</p>
          <p className="text-sm text-boteco-neutral/70 mt-1 italic">{t('demoNotice')}</p>
        </div>

        {query.isError && (
          <Alert variant="destructive">
            <AlertTitle>{t('errors.title')}</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{t('errors.leadsLoad')}</span>
              <Button variant="outline" size="sm" onClick={() => query.refetch()}>
                {t('actions.retry')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <Card
              key={card.id}
              depth="overlay"
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-boteco-neutral">
                  {card.title}
                </CardTitle>
                {cardIcons[card.id] ?? null}
              </CardHeader>
              <CardContent>
                {query.isLoading ? (
                  <>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-boteco-primary">
                      {cardValues[card.id as keyof typeof cardValues] ?? '—'}
                    </div>
                    <p className="text-xs text-boteco-neutral/80">{card.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-12 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-boteco-primary mb-2">
              {t('leadInsights.title')}
            </h2>
            <p className="text-sm text-boteco-neutral/80">{t('leadInsights.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card depth="surface" className="h-full">
              <CardHeader>
                <CardTitle className="text-lg text-boteco-neutral">
                  {t('leadInsights.averageResponseTime.title')}
                </CardTitle>
                <CardDescription>{t('leadInsights.averageResponseTime.helper')}</CardDescription>
              </CardHeader>
              <CardContent>
                {query.isLoading ? (
                  <>
                    <Skeleton className="h-8 w-28 mb-3" />
                    <Skeleton className="h-4 w-40" />
                  </>
                ) : metrics ? (
                  <>
                    <div className="text-2xl font-semibold text-boteco-primary">
                      {formatAverageResponseTime(metrics.averageResponseTimeHours)}
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm text-boteco-neutral/80">
                        <span>{t('leadInsights.averageResponseTime.responseRateLabel')}</span>
                        <span>{formatPercentageValue(metrics.responseRate24h)}</span>
                      </div>
                      <Progress value={Math.round(metrics.responseRate24h)} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-boteco-neutral/60">
                    {t('leadInsights.empty')}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card depth="surface" className="h-full">
              <CardHeader>
                <CardTitle className="text-lg text-boteco-neutral">
                  {t('leadInsights.channels.title')}
                </CardTitle>
                <CardDescription>{t('leadInsights.channels.helper')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {query.isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))
                ) : metrics && channelEntries.length > 0 ? (
                  channelEntries.map(([channel, count]) => {
                    const percentage = metrics.totalLeads
                      ? Math.round((count / metrics.totalLeads) * 100)
                      : 0;

                    return (
                      <div key={channel} className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-boteco-neutral/80">
                          <span>{t(`leadInsights.channels.labels.${channel}`, { defaultValue: channel })}</span>
                          <span>
                            {numberFormatter.format(count)} ({percentageFormatter.format(percentage)}%)
                          </span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-boteco-neutral/60">
                    {t('leadInsights.channels.empty')}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card depth="surface" className="h-full">
              <CardHeader>
                <CardTitle className="text-lg text-boteco-neutral">
                  {t('leadInsights.status.title')}
                </CardTitle>
                <CardDescription>{t('leadInsights.status.helper')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {query.isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))
                ) : metrics && statusEntries.length > 0 ? (
                  statusEntries.map(([status, count]) => {
                    const percentage = metrics.totalLeads
                      ? Math.round((count / metrics.totalLeads) * 100)
                      : 0;

                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-boteco-neutral/80">
                          <span>{t(`leadInsights.status.labels.${status}`, { defaultValue: status })}</span>
                          <span>
                            {numberFormatter.format(count)} ({percentageFormatter.format(percentage)}%)
                          </span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-boteco-neutral/60">
                    {t('leadInsights.status.empty')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
};

// Main exported component that conditionally renders based on auth
const Painel: React.FC = () => {
  return hasClerkAuth ? <PainelWithAuth /> : <PainelWithoutAuth />;
};

export default Painel;
